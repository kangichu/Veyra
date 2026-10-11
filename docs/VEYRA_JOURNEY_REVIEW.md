# Veyra platform journey refinement

Completed 11 October 2026. Local changes only; nothing pushed or published. Preserves the existing pages, brand, section order, property examples and responsive design.

## Positioning and product journey

1. **Before:** Veyra already had a platform-first hero and early Domain explanation, but the equation resolved directly into “Real Estate.” The middle of the page was largely independent static sections, without a visual zoom back out to the platform.
2. **Now:** The hero explicitly identifies a domain-extensible, self-hosted intelligence platform. The foundational equation resolves into industry-specific intelligence, with Real Estate identified as its current production implementation. The later nested visual reinforces Real Estate → industry Domain → Veyra platform.
3. **Hierarchy:** Added the compact company/platform/specialization hierarchy: Tandish → Veyra → industry Domain. Shared infrastructure, industry understanding and current implementation have distinct labels in both foundational and closing diagrams.
4. **Real Estate framing:** “Real Estate. The first Domain in practice.” It remains concrete: listings, property types, locations, bedrooms, amenities, prices, property characteristics, constraints and listing relationships.
5. **Plan-dependent capabilities:** The Real Estate introduction, metadata and homepage integration example qualify availability by plan/configuration. Recommendations identifies Professional and above; Price Intelligence identifies Business and Enterprise; Advanced Intelligence remains Enterprise. No new feature details, prices or availability promises were invented.
6. **Journey line:** Reused the existing SVG current/trace as a restrained left-side spine from the platform explanation through Beyond Real Estate. Native scroll position advances the desktop trace and stage markers. Geometry refreshes for viewport, font and content-size changes. No scroll interception, snapping, pinned scenes or continuous animation loop.
7. **Platform + Domain animation:** One-time sequence: infrastructure → plus → industry understanding → connection → specialized intelligence. Supporting copy resolves after its block. Real Estate stays explicitly labeled as the current implementation. No content depends on the sequence running.
8. **Real Estate flow:** Property data → Real Estate Domain → shared Veyra infrastructure → enabled intelligence. Connectors progress and stages activate in sequence. The desktop row becomes a vertical flow when width is constrained.
9. **Search journey:** Describe → Understand → Discover is connected visually. The request resolves into property type, location, bedrooms, budget and balcony preference; result cards enter sequentially. Preserved illustrative sample disclaimers, full/weak/relaxed outcomes and their explanations. The picker still uses curated local examples, not a live API.
10. **Recommendations:** Continues from the selected example found in Search. Content-based alternatives form a connected branch of the story. Selecting Karen or Westlands updates the recommendation source label as well as search results; no behavioral personalization is implied.
11. **Price Intelligence:** Uses the same selected property context, passes location/characteristics/data through Price Intelligence and resolves into estimate/comparison/insight. No animated prices, confidence numbers or accuracy claims added.
12. **Processing layers:** Two coordinated lanes show Domain interpretation/normalization/rules and platform embeddings/index/retrieval/runtime contributing to Domain intelligence. Industry-specific work and shared infrastructure remain visibly separate.
13. **Integration:** Customer systems → customer backend → Veyra API → enabled Domain → returned intelligence. Boxes remain in place while connectors progress. The customer’s website, CRM, portal and internal application remain their own systems.
14. **Deployment boundary:** A solid customer boundary contains runtime, operational data, indexes, credentials and workloads. A dashed Tandish boundary contains licensing, entitlements, releases and update authority. Only the licensing/release relationship crosses toward the customer environment; no customer operational data flows toward Tandish. The mobile arrangement places Tandish above the control relationship and customer environment.
15. **Plans:** Sequential capability ladder, with the newly added capability explicitly marked and emphasized in each tier. Starter: Search. Professional: adds Recommendations. Business: adds Price Intelligence. Enterprise: adds Advanced Intelligence. Contact Sales remains on every card; packaging is specifically for Real Estate.
16. **Beyond Real Estate:** Nested boxes resolve outward from the current Real Estate implementation to industry specialization and the shared Veyra platform. A restrained dashed continuation explains that additional Domains would be specialized individually and are unavailable today. Five short statements speak to the prospect’s data structures, terminology, constraints, workflows and recurring decisions. No invented future industries or roadmap dates.
17. **Final CTA:** Retained “See where Veyra fits in your business” and “Discuss a deployment or Domain,” with an explicit distinction between current Real Estate deployment and exploratory development of another Domain.
18. **Homepage:** Retained its concise platform/Domain positioning and concrete Real Estate proof. Clarified plan-dependent capabilities in the integration example; it still sends visitors to `/veyra/` for the full explanation.

## SEO, accessibility and performance

19. **Canonical:** No source change needed. Live HTTP header checks on 11 October 2026 returned `307` with `Location: /veyra/` for `https://tandish.com/veyra`, and `200` for `https://tandish.com/veyra/`. Both page metadata and internal product links retain the trailing-slash canonical. The browser fixture models that redirect for local tests; the live result was checked separately with curl. No hosting settings were changed.
20. **Social image:** Added `assets/images/veyra-og.svg` and its 1200 × 630 PNG rendering. Preserves the dark grid, copper accent, restrained panels and self-hosted headline, with platform + Domain framing. Updated Veyra Open Graph/Twitter asset URLs, dimensions and alt text. Unrelated images remain unchanged.
21. **Homepage schema:** Defined the concise SoftwareApplication entity at `https://tandish.com/#veyra`, previously referenced by the homepage graph without a local definition.
22. **WebPage / FAQ schema:** Created WebPage `https://tandish.com/veyra/#webpage` and separate FAQPage `https://tandish.com/veyra/#faq`, connected with `hasPart`/`isPartOf`. FAQ `url` points to the visible `#future` section. Verified every schema question and answer exactly matches visible HTML content. Titles and descriptions remain platform-first.
23. **Reduced motion:** CSS disables animations, transitions and smooth scrolling across the product page. JavaScript does not begin content animations under reduced motion and cancels active work when the preference changes. All static labels, connectors and nested hierarchy remain. Focus and background-tab changes settle active effects; no animation moves keyboard focus.
24. **Mobile:** Shorter 280ms transitions, smaller translations and individually observed stages for tall groups. Search criteria and result cards activate as they enter view. Flows become vertical; the long moving trace is omitted on phones while the spine and stage markers remain. No horizontal scrolling or oversized pinned scenes.
25. **Performance:** No frontend dependencies added. New motion CSS/JS total approximately 17 KB uncompressed. The approximately 50 KB OG PNG is metadata, not an in-page image. The hero has no new animation dependency. Uses IntersectionObserver, WAAPI, CSS and one requestAnimationFrame per pending native scroll update; no continuous RAF loop. Observed animation-time CLS was **0** at both 1440 and 375 pixels in the local browser fixture. This is not a field LCP/INP benchmark.

## Artifacts and validation

26. **Screenshots:**
    - Before: `/private/tmp/tandish-journey-review/before/`, both pages at 1440, 1280, 1024, 768, 390 and 375 pixels.
    - After: `/private/tmp/tandish-journey-review/after/`, Veyra at all six widths and homepage at 1440, 390 and 375. Full-page files end in `-reduced.png`.
    - The after directory also contains desktop section captures, `platform-{1440,375}-in-motion.png`, settled platform/deployment/plans/domains captures, light-theme mobile and no-JavaScript/no-observer/no-WAAPI fallback captures.
    - Section-only captures hide fixed navigation/skip controls to avoid browser screenshot occlusion; full-page and in-motion captures preserve ordinary page styling.
    - `after/results.json` records all 43 passing browser checks, widths, console errors and measured CLS. Screenshot files are local temporary review artifacts, not committed assets.
27. **Exact changed files:**
    - `index.html`
    - `veyra/index.html`
    - `assets/js/veyra-demo.js`
    - `assets/js/veyra-journey.js`
    - `assets/css/veyra-journey.css`
    - `assets/images/veyra-og.svg`
    - `assets/images/veyra-og.png`
    - `scripts/review-veyra.cjs`
    - `docs/VEYRA_JOURNEY_REVIEW.md`
28. **Testing:** **43 browser checks passed.** No console/runtime errors or missing local resources. No horizontal overflow at requested widths. Verified unique IDs, anchors, ARIA references, one H1 per page, JSON-LD structure/FAQ parity, keyboard skip navigation, demo and linked context, FAQ/details controls, theme switching, motion activation and completion, trace/markers, dynamic reduced motion and static fallback modes. HTML nesting/local references and JSON-LD syntax checks passed. `node --check` passed for the new motion/test scripts and affected demo script; `git diff --check` passed. There is no package manifest, existing type-check, lint task or production build for this buildless static site.

    The browser QA uses an existing Playwright installation; it is not a site dependency. External resources receive empty fixture responses, so analytics do not run. Run with `PLAYWRIGHT_MODULE` pointing to the installed Playwright module and `CHROMIUM_EXECUTABLE` pointing to the browser executable, followed by `node scripts/review-veyra.cjs`. `VEYRA_REVIEW_OUTPUT` optionally changes the artifact directory. The command also regenerates the PNG from the SVG.

29. **Commits:** Implementation and reproducible browser review: `8fee7dd` — `Refine Veyra platform hierarchy, explanatory motion and schema`. This report is in the following documentation commit; obtain both exact hashes with `git log -2 --oneline`. No push, deployment or co-author trailer.

## Comprehension and truth checks

Editorial review against the supplied product brief, rather than external prospect interviews. This website checkout does not contain the Veyra runtime, so production capability claims are based on the product facts supplied in the brief. No unsupported domains, generic RAG/document intelligence, personalization, hybrid/learned ranking, real-time sync, arbitrary database connectivity, SLAs, certifications or prices were added.

| Question | Result |
| --- | --- |
| Does the page still make Veyra look like a Real Estate-only product? | **NO** |
| Is Real Estate still clearly presented as a production-ready/current Domain? | **YES** |
| Can a prospect from another industry understand how the Domain model could apply to them? | **YES** |
| Does the page avoid implying those additional Domains already exist? | **YES** |
| Does motion help explain the product rather than merely decorate the page? | **YES** |

A Real Estate executive sees the current implementation and plans. Another-industry executive sees a specialization model and an invitation to explore development, with no current availability claim. A technical buyer sees reusable infrastructure, Domain rules, API integration and customer-controlled deployment. A commercial buyer sees a capability ladder scoped to Real Estate and unspecified future Domain packaging.

VEYRA PLATFORM POSITIONING — PASS

REAL ESTATE AS FIRST PRODUCTION DOMAIN — PASS

MULTI-DOMAIN EXTENSIBILITY COMMUNICATION — PASS

VEYRA SCROLL JOURNEY — PASS

VEYRA MOTION SYSTEM — PASS

VEYRA SEO / STRUCTURED DATA REFINEMENT — PASS
