# Adding a product to the homepage

Add one `article.gallery-product` inside `#product-track` in `index.html`, following the existing products. The carousel, counts and slide-in navigation derive their items from these articles.

- Give the article a unique `id`, `data-product` and `data-product-name`.
- Give its visible product name a unique ID and reference it in the article's `aria-labelledby`.
- Keep the card brief: category, status, name, positioning line and destination link with `data-open-product`.
- Put the detailed content in `details[data-product-detail]`, inside `.product-detail-body`. Include one `[data-detail-title]` heading and an `a.button` with the actual product destination. The drawer uses these for its title and persistent action. The optional `[data-detail-name]` wordmark and header breadcrumb automatically use `data-product-name`.
- Use `data-product-tone="copper"` or `"green"` for the existing colour treatments. Add matching card styles in `tandish-products.css` and panel styles in `product-panels.css` when introducing another tone.
- Keep the product's actual availability explicit. Veyra is in active development; Saelis is coming soon.

Desktop cards retain two columns regardless of the collection size. Mobile uses a swipeable row. With more than two products, “View all products” opens a two-column desktop grid or a single-column mobile list. “Show carousel” restores the compact view. Counts, controls and previous/next drawer actions update from the article collection; there is no separate JavaScript product list or hardcoded total to maintain.

Native links and expandable details remain usable without JavaScript. Adding a product does not require adding it to the hero. Update structured data and other navigation only where appropriate to the new product.

`review-products.cjs` exercises the two real products plus temporary collections of 1, 3, 4, 8 and 12 products, including a long name, expanded browsing, keyboard navigation, responsive layouts and drawer actions. These fixtures are never written into the site.
