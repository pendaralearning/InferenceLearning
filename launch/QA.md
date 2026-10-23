# Launch verification

Verified locally before publication. No public deployment or X posting was performed.

- Syntax checks pass; all 11 automated tests pass.
- Desktop viewport: 1440 × 1000. Mobile viewport: 390 × 844.
- English mobile home and Chinese KV experiment show no horizontal document overflow at 390px.
- Home KV demo: 8K context × concurrency 1 / 2 / 3 yields KV 4 / 8 / 12 GiB and total 19.44 / 23.44 / 27.44 GiB. Capacity status changes correctly at 3.
- Home parameters carry into the full experiment.
- Dedicated KV share URL restores context=8192, batch=3, capacity=24; switching to Chinese preserves the values.
- Dedicated batching entry opens without a hash. Static scheduling completes in 22 steps at 68.2% slot utilization; continuous completes in 15 at 100%, for the default six-request workload.
- Dedicated speculation entry opens without a hash. Moving acceptance to 0% gives 1 expected token, 90 ms per round, and 0.56× modeled speedup.
- Copy-link action reports success and distinguishes local preview URLs. Parameter encoding/decoding for every lesson is also covered by automated round-trip tests.
- Actual PNG result-card download opened and visually inspected at 1200 × 675. Parameters, numbers, insight, simulation label, and project branding are present.
- Correction dialog opens and closes without a configured repository; deployment configuration enables a prefilled GitHub issue draft.
- Project information and ten public reference links render. No private document link, personal name, email, or local home path in source or runtime assets.
- No captured browser console errors in the exercised flows.
- Build tested with a placeholder HTTPS base and repository subpath: all four entry pages include absolute canonical/social image URLs and valid local asset references. Final local build clears that placeholder.
- Deployed files exclude `.git`, tests, launch drafts, and configuration sources.

## Still to verify after deployment

The public repository has been created. Source upload and GitHub Pages deployment are pending local Git authentication. Verify actual Actions permissions, deployment URL, HTTPS, issue-draft entry, and the social preview after going live. X preview rendering depends on X's crawler/cache; only static metadata and images have been verified locally. No personal social profile is linked.

`demo-kv.gif` is a three-state demo assembled from screenshots of the real UI, with deliberate holds for readability. It is not a continuous screen recording or a GPU benchmark.
