#!/usr/bin/env bash
# One-shot server setup for the Veyra/Tandish static site + waitlist API.
# Run as root (sudo ./setup.sh) from wherever this repo lives on the server.
# Safe to re-run: every step checks current state before changing anything.

set -euo pipefail

DOMAIN="${DOMAIN:-tandish.com}"
WWW_DOMAIN="${WWW_DOMAIN:-www.tandish.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-hello@tandish.com}"
SKIP_SSL="${SKIP_SSL:-false}"
SERVICE_USER="${SERVICE_USER:-www-data}"
NODE_MAJOR="${NODE_MAJOR:-20}"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WAITLIST_DIR="$APP_DIR/waitlist-service"
SERVICE_NAME="tandish-waitlist"

log() { echo -e "\n\033[1;36m==> $*\033[0m"; }
warn() { echo -e "\033[1;33m!! $*\033[0m"; }

if [ "$EUID" -ne 0 ]; then
  echo "Run this as root: sudo ./setup.sh" >&2
  exit 1
fi

if [ -f /etc/os-release ] && ! grep -qiE 'ubuntu|debian' /etc/os-release; then
  warn "This script targets Ubuntu/Debian (apt). Detected a different OS — continuing anyway, but apt-get may fail."
fi

# ---- 1. System packages (only install what's actually missing) ----
log "Checking system packages"
NEEDED_PKGS=()
command -v nginx >/dev/null 2>&1 || NEEDED_PKGS+=(nginx)
command -v curl >/dev/null 2>&1 || NEEDED_PKGS+=(curl)
command -v certbot >/dev/null 2>&1 || NEEDED_PKGS+=(certbot python3-certbot-nginx)
command -v gpg >/dev/null 2>&1 || NEEDED_PKGS+=(gnupg)

if [ "${#NEEDED_PKGS[@]}" -gt 0 ]; then
  echo "Installing: ${NEEDED_PKGS[*]}"
  apt-get update -y
  apt-get install -y ca-certificates "${NEEDED_PKGS[@]}"
else
  echo "nginx, curl, certbot, gnupg already present — skipping apt install."
fi

# ---- 2. Node.js (only install/upgrade if missing or too old) ----
log "Checking Node.js"
CURRENT_NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  CURRENT_NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
fi
if [ "$CURRENT_NODE_MAJOR" -lt "$NODE_MAJOR" ]; then
  echo "Installing Node.js ${NODE_MAJOR}.x via NodeSource"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
else
  echo "Node.js v$CURRENT_NODE_MAJOR already installed — skipping."
fi
NODE_BIN="$(command -v node)"

# ---- 3. App env file ----
log "Checking waitlist-service/.env"
if [ ! -f "$WAITLIST_DIR/.env" ]; then
  warn "No .env found — copying from .env.example. You MUST edit $WAITLIST_DIR/.env (SMTP_PASS etc.) before signups will actually send mail."
  cp "$WAITLIST_DIR/.env.example" "$WAITLIST_DIR/.env"
else
  echo ".env already present — leaving it untouched."
fi
APP_PORT="$(grep -E '^PORT=' "$WAITLIST_DIR/.env" | cut -d= -f2 || true)"
APP_PORT="${APP_PORT:-8787}"

# ---- 4. App dependencies ----
log "Installing waitlist-service dependencies"
if [ -d "$WAITLIST_DIR/node_modules" ]; then
  echo "node_modules already present — running npm ci to sync with lockfile."
fi
( cd "$WAITLIST_DIR" && npm ci --omit=dev )

# ---- 5. Ownership ----
log "Setting ownership to $SERVICE_USER"
chown -R "$SERVICE_USER":"$SERVICE_USER" "$APP_DIR"

# ---- 6. systemd service ----
log "Writing systemd unit"
UNIT_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
cat > "$UNIT_FILE" <<EOF
[Unit]
Description=Tandish Veyra waitlist service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$WAITLIST_DIR
ExecStart=$NODE_BIN server.js
Restart=always
RestartSec=5
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME" >/dev/null
systemctl restart "$SERVICE_NAME"

sleep 1
if curl -sf "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null; then
  echo "waitlist-service is up and answering on :${APP_PORT}."
else
  warn "waitlist-service did not respond on :${APP_PORT}. Check: journalctl -u ${SERVICE_NAME} -n 50"
fi

# ---- 7. nginx site config ----
log "Writing nginx site config"
NGINX_SITE="/etc/nginx/sites-available/tandish.conf"
cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    root $APP_DIR;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location /api/ {
        proxy_pass http://127.0.0.1:${APP_PORT}/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # NOTE: filenames here are a hand-managed "v1" suffix, not per-deploy content hashes —
    # so caching must always revalidate, or fixes silently won't reach returning visitors.
    # (add_header in a location block replaces, not merges with, the server-level ones above —
    # so the security headers have to be repeated here too.)
    location ~* \.(?:css|js)\$ {
        add_header Cache-Control "no-cache";
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options SAMEORIGIN always;
        add_header Referrer-Policy strict-origin-when-cross-origin always;
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

mkdir -p /etc/nginx/sites-enabled
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/tandish.conf
# Disable the stock default site if it's still linked, so it can't shadow this one.
[ -e /etc/nginx/sites-enabled/default ] && rm -f /etc/nginx/sites-enabled/default

if nginx -t; then
  systemctl reload nginx 2>/dev/null || systemctl restart nginx
  echo "nginx config valid and reloaded."
else
  echo "nginx config test failed — not reloading. Fix the error above and re-run." >&2
  exit 1
fi

if curl -sf -H "Host: $DOMAIN" "http://127.0.0.1/" >/dev/null; then
  echo "nginx is serving the site."
else
  warn "nginx did not return 200 for $DOMAIN on port 80. Check: nginx -t / journalctl -u nginx"
fi

# ---- 8. TLS via Let's Encrypt ----
if [ "$SKIP_SSL" = "true" ]; then
  log "SKIP_SSL=true — leaving HTTP only."
else
  log "Requesting Let's Encrypt certificate for $DOMAIN and $WWW_DOMAIN"
  # --expand handles the case of an existing cert covering only some of these domains
  # (e.g. a prior deploy that only had $DOMAIN, not $WWW_DOMAIN) — safe to pass every run.
  if certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" \
      --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect --expand; then
    echo "HTTPS is live."
  else
    warn "certbot failed — usually means DNS for $DOMAIN/$WWW_DOMAIN isn't pointed at this server's IP yet."
    warn "Once DNS is correct, re-run: certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --agree-tos -m $CERTBOT_EMAIL --redirect --expand"
  fi
fi

log "Done"
echo "Site root:        $APP_DIR"
echo "Waitlist service:  systemctl status $SERVICE_NAME"
echo "Waitlist logs:     journalctl -u $SERVICE_NAME -f"
echo "nginx site config: $NGINX_SITE"
if ! grep -qE '^SMTP_PASS=.+' "$WAITLIST_DIR/.env"; then
  warn "SMTP_PASS is empty in $WAITLIST_DIR/.env — waitlist signups will fail to send mail until you set it and run: systemctl restart $SERVICE_NAME"
fi
