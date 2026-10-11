# Veyra composition redesign — 11 October 2026

1. **Old structure:** hero, platform, Real Estate, Search story, Recommendations, Price Intelligence, Domain infrastructure, integration, deployment, plans, FAQ, future Domains and CTA: 13 independently stacked sections.
2. **New structure:** seven main sections: hero; coordinated platform/capabilities/Domains overview; Real Estate connected product story; integration/deployment architecture; Beyond Real Estate; supporting FAQ; final CTA.
3. **Consolidation:** platform and Domain explanations share an anchored identity and four normal-scroll stages. Real Estate Search, Recommendations and Price Intelligence share one selected property. Integration, deployment and responsibilities share one boundary diagram.
4. **Removed sections:** independent Recommendations, Price Intelligence, infrastructure, deployment and plans sections. Useful technical detail moved into native disclosure rather than discarded.
5. **Commercial matrix:** Starter/Professional/Business/Enterprise cards deleted from page HTML. No replacement tiers, pricing or plan schema. Scope follows the enabled Domain and commercial agreement.
6. **Duplication:** repeated self-hosting, current-Domain and capability explanations consolidated at their relevant chapters. The current-Domain qualification repeats in future-fit/FAQ where it prevents misleading availability claims.
7. **Hierarchy:** Veyra identity precedes platform → capabilities → Domains → current Real Estate. A sticky index highlights the current normal-scroll stage.
8. **Capabilities:** four keyboard-operable tabs inside one capability frame. Search, Recommendations, Price Intelligence and configured Advanced Intelligence appear before Real Estate.
9. **Domains:** terminology, entities, structured fields, constraints, relationships, workflows and relevance rules form one specialization layer, connected to shared capabilities.
10. **Real Estate:** explicitly the first production Domain, with concrete property semantics. Illustrative listings are labeled and never presented as live inventory.
11. **Journey:** one persistent property connects Describe → Understand → Discover, alternatives and price perspective. Apartment/family-home examples update selected listing, parsed criteria, alternatives and price context together. The over-budget Karen alternative is explicitly relaxed. Price output has no invented estimate or confidence score.
12. **Slide-ins:** 18px / 420ms capability and story transitions. Domain and zoom-out relationship reveals run once (450–600ms). No timers, loops, parallax or generic reveal on every card.
13. **Sticky behavior:** platform identity and selected property use natural CSS sticky boundaries on desktop. No artificial chapter heights, scroll interception, forced slides or snaps. Story tabs are user-controlled.
14. **Architecture:** application backend → local API / Domain / runtime is inside a visibly bordered customer environment, along with data, indexes, credentials and workloads. Smaller Tandish control-plane area covers entitlements, licensing, signed releases and update authority. No customer-data transfer animation.
15. **Density:** content-driven sections; reduced padding; shared frames; compact disclosure. Desktop/mobile page length reduced materially (table below). Only capability panels have a modest minimum height to stabilize tab changes.
16. **FAQ:** five grouped native details, collapsed by default; supporting information rather than another long open chapter. Keyboard and no-JS functionality retained.
17. **Beyond Real Estate:** nested Real Estate → Domain → Veyra composition zooms the visitor back to the platform. Five recognition prompts connect architecture to their data, terminology, constraints, workflows and decisions. No fabricated industry names or roadmap.
18. **Mobile:** normal document flow, compact persistent property presentation, vertical architecture adaptation and no pinned stages. Touch buttons at least 44px high on small screens. Tested at 390 and 375px as well as tablet.
19. **Reduced motion:** animations and transitions disabled; sticky columns become static; trace final state visible. All explanatory content is in HTML. Without JavaScript all seven capability/story panels remain readable; FAQs work natively.
20. **SEO/schema:** platform title retained; descriptions remove plan-dependent packaging. Separate WebPage/FAQPage identities; FAQ questions/answers exactly match DOM. Existing homepage Veyra entity and 1200×630 OG image retained. Public `/veyra` returned 307 → `/veyra/`, which returned 200 on 11 October. This verifies existing hosting, not deployment of these local changes.
21. **Screenshots:** before and after full-page captures at 1440,1280,1024,768,390,375 in `/private/tmp/veyra-composition-review/{before,after}`. After also includes platform, Real Estate, integration, future-fit, FAQ and CTA crops; light theme, reduced-motion and no-JS full pages. These are local review artifacts, not published assets.
22. **Files:** `veyra/index.html`; new `assets/css/veyra-story.css` and `assets/js/veyra-story.js`; updated `scripts/review-veyra.cjs`; this report. Homepage unchanged. Old shared assets retained to avoid affecting other consumers, but old Veyra-specific story scripts/styles no longer loaded.
23. **Validation:** 29 browser assertions; all six widths without overflow; no console/page errors; valid IDs/anchors/ARIA; JSON-LD/FAQ parity; persistent property, example updates, keyboard tab arrows, native FAQ, theme control, no-JS, reduced-motion and missing Observer/animation API fallback. HTML nesting/JSON parsing, both JavaScript syntax checks and `git diff --check` passed. Buildless static site: no compiler/build task. Screenshots reviewed for composition and density. Analytics requests stubbed during local browser QA. No claim of an external screen-reader audit or backend intelligence execution.
24. **Commits:** implementation `e18722a`; documentation commit follows this implementation (see `git log -2`). No co-author trailer; no push or publication.

| Width | Before height | After height | Reduction |
|---|---:|---:|---:|
|1440|12618|5690|55%|
|1280|12434|5597|55%|
|1024|13304|5517|59%|
|768|14484|5689|61%|
|390|20664|6398|69%|
|375|21146|6509|69%|

Heights are CSS pixels with default Search panels and collapsed FAQ; user-opened disclosures/no-JS naturally add document length.

## Acceptance answers

- Does the page clearly establish Veyra before Real Estate? **YES**
- Are Veyra Capabilities established before the current Domain? **YES**
- Is Real Estate clearly a Domain rather than the definition of Veyra? **YES**
- Has the Starter/Professional/Business/Enterprise public matrix been removed? **YES**
- Has the page materially reduced repetitive vertical sections? **YES**
- Do slide-in/sticky compositions reduce information overload? **YES**
- Is the page still understandable with reduced motion? **YES**
- Would a prospect outside Real Estate understand how Veyra could potentially be specialized for their industry? **YES** — the page connects a prospective Domain to their data, terminology, constraints, workflows and decisions, with development/validation clearly required.

## Results

- VEYRA PUBLIC INFORMATION ARCHITECTURE — PASS
- VEYRA PLATFORM → CAPABILITIES → DOMAINS HIERARCHY — PASS
- REAL ESTATE DOMAIN SHOWCASE — PASS
- VEYRA PRODUCT JOURNEY — PASS
- VEYRA PUBLIC COMMERCIAL PACKAGING REMOVAL — PASS
- VEYRA VISUAL DENSITY / PACING — PASS
- VEYRA MULTI-DOMAIN POSITIONING — PASS
