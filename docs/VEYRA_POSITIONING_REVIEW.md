# Tandish / Veyra positioning review

Completed 11 October 2026. Local implementation only; nothing pushed or published.

## Positioning and narrative

1. **Old homepage:** Veyra was “Property discovery,” “FOR PROPERTY BUSINESSES,” and self-hosted property search and recommendations. Metadata repeated that definition; status was “Active development.”
2. **New homepage:** Tandish builds focused software for complex industries. Veyra is an intelligence platform specialized through Domains; Real Estate is explicitly the first and only production Domain. The existing property example supplies concrete proof, and “Explore Veyra” links to `/veyra/`. Saelis retains its existing coming-soon positioning.
3. **Old Veyra structure:** Property-search hero → search demo and six technical cards → property audiences → integration → deployment → active-development status → FAQ → property-specific contact.
4. **New structure:** Self-hosted platform hero → platform + Domain explanation → first production Domain: Real Estate → Semantic Search demo → Recommendations → Price Intelligence / Advanced Intelligence → Domain versus platform processing → customer-system integration → deployment and responsibilities → Real Estate plans → FAQ → beyond Real Estate → deployment or Domain enquiry.
5. **Veyra definition:** Reusable, self-hosted intelligence infrastructure, designed for specialization through industry Domains.
6. **Domains:** Add industry entities, terminology, fields, constraints, relevance rules and workflows to the shared infrastructure. The explanation leads with business meaning, with technical detail later.
7. **Real Estate:** Labeled “First production Domain” and “only production Domain today,” including in the homepage chapter, platform diagram, plans and status FAQ.
8. **Avoiding Real Estate-only positioning:** Platform identity precedes property examples. Property capabilities and commercial plans are scoped to the Real Estate Domain throughout.
9. **Other industries:** No industry names, availability badges or coming-soon promises added. New Domains require scoping, development and validation; additional Domains are explicitly unavailable today.
10. **Search:** Retained Kenya examples in Westlands and Karen, structured criteria, explicit constraints, semantic relevance and labeled compromises. Added a traditional-filter comparison. Detailed retrieval and outcome handling moved to a later disclosure.
11. **Recommendations:** Viewed property → content comparison → relevant alternatives. Copy describes property-content relevance without promising fully personalized buyer profiles.
12. **Price Intelligence:** Property characteristics and location → Price Intelligence → estimates and comparisons. Availability is qualified by configuration and licensing; no accuracy figures added. Advanced Intelligence is identified without invented feature details.
13. **Platform + Domain visual:** Shared infrastructure + specific industry understanding → Real Estate as the production example. A separate data-to-intelligence flow and processing-layer visual distinguish Domain work from platform infrastructure.
14. **Customer integration:** Website, CRM, portal or internal app → application backend / Veyra API → enabled Domain (Real Estate today) → intelligence presented in the customer interface. Preview UI is explicitly illustrative customer application work, not native Veyra output.
15. **Self-hosted / deployment:** Retained Docker, local runtime, release authority, licensing communication and the existing air-gap qualification. Explicitly assigns operational data, indexes, credentials and workloads to the customer environment; Tandish owns licensing and release control responsibilities. Avoids blanket model-ownership claims.
16. **Real Estate plans:** Starter: Search. Professional: adds Recommendations. Business: adds Price Intelligence. Enterprise: adds Advanced Intelligence. Every card has Contact Sales, with no invented prices or quotas. Future Domain packaging is not specified.
17. **Final CTA:** “Discuss a deployment or Domain” supports current Real Estate buyers and other-industry prospects exploring development of a new Domain.
18. **Claims corrected:** Removed property-only platform definitions and stale pre-production status from public copy and metadata. No generic document/lease/maintenance intelligence, hybrid lexical/vector ranking, learned production ranker, invented supported industries or personalization claims introduced. Product availability is based on the supplied brief; this website checkout does not contain the Veyra runtime for independent capability verification.

## Verification and artifacts

19. **Responsive review:** Before and after browser captures for both pages at 1440, 1280, 1024, 768, 390 and 375 pixels. No horizontal document overflow or overflowing main-content elements at these widths. Platform model stacks vertically below 760px; plans use four, two and one columns. Reviewed desktop and mobile section captures for the hero, product chapter, platform diagram, processing layers, plans and extensibility message.
20. **Accessibility:** One H1 per page; property preview title demoted to H3 beneath its section H2. New sections have heading references. Diagrams use readable text in document order, with decorative symbols hidden from assistive technology. Added explicit focus-visible outlines for product links, buttons and disclosures; main content is focusable for skip links. Verified unique IDs and valid ARIA references, FAQ expansion, native details expansion and live demo updates. Existing high-contrast theme tokens retained. This was a targeted review, not a formal WCAG certification or screen-reader audit.
21. **SEO:** Updated titles, descriptions, Open Graph, Twitter and JSON-LD descriptions on these two pages. Corrected the duplicated Organization description on `/veyra/` and its SoftwareApplication/FAQ content. Canonical URLs retained.
22. **Screenshots:** `/private/tmp/tandish-platform-domain-review/before/` and `/private/tmp/tandish-platform-domain-review/after/`. Full-page files use `home-{width}.png` and `veyra-{width}.png`; after also contains desktop/mobile section captures and a light-theme mobile capture. Each directory has `metrics.json`. Section-only captures hide fixed navigation to avoid screenshot occlusion; full-page captures preserve normal styling. These are local temporary artifacts, not committed assets.
23. **Checks:** Playwright/Chromium rendered the actual local HTML and assets through a local route fixture; external requests, including analytics, were blocked. Browser results: zero page JavaScript errors, no broken same-page anchors, no duplicate IDs or missing ARIA targets, valid JSON-LD, working sample search, FAQ, details and theme controls. Local asset-reference checks passed. `node --check` passed for the affected Veyra script and existing demo/homepage scripts. `git diff --check` passed. This is a buildless static site: no package manifest, test suite, type-check, lint command or production build exists to run. Hosting behavior and backend API behavior were not tested.
24. **Files changed:** `index.html`, `veyra/index.html`, `assets/css/platform-domain.css`, `assets/js/veyra-experience.v1.js`, and this report. Legacy `#who`, `#audience` and `#status` links now resolve to retained sections. No dependencies added.
25. **Commits:** Implementation: `4142713` — `Clarify Veyra platform and Real Estate Domain positioning`. This report is recorded in a separate documentation commit; see `git log -2 --oneline`. No co-author trailers, push or deployment.

## Comprehension and truth checks

These are editorial checks against the supplied brief, not external user research.

- Can a Real Estate prospect understand that Real Estate is available today? **YES**.
- Can a prospect outside Real Estate understand that Veyra itself is designed for multiple industry Domains? **YES**.
- Is it unambiguous that other Domains are not currently being advertised as available? **YES**.
- Does the homepage now reflect the same platform/Domain model as `/veyra`? **YES**.

TANDISH HOMEPAGE VEYRA POSITIONING — PASS

VEYRA PUBLIC PAGE INFORMATION ARCHITECTURE — PASS

VEYRA PLATFORM / DOMAIN POSITIONING — PASS

REAL ESTATE PRESENTED AS FIRST PRODUCTION DOMAIN — PASS

FUTURE INDUSTRY EXTENSIBILITY COMMUNICATED WITHOUT OVERCLAIM — PASS

VEYRA PUBLIC PRODUCT CLAIMS — CURRENT AND ACCURATE (against the supplied product brief)
