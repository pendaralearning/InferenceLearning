# Launch verification

Verified locally and on the public GitHub Pages deployment. No X posting was performed.

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

## Public deployment verification

The source is published at https://github.com/pendaralearning/InferenceLearning and the site at https://pendaralearning.github.io/InferenceLearning/ . The initial Actions build and deployment succeeded; the workflow ran syntax checks, all 11 tests, and the public-data scan.

- The HTTPS homepage loads, defaults to English on a fresh origin, and switches to Chinese.
- The home demo carries context=8192, batch=3, capacity=24 into the full lab, which reports 12.00 GiB KV and 27.44 GiB total.
- The dedicated KV URL restores those parameters in Chinese; canonical and social image URLs use the verified public hostname and repository subpath.
- The batching and speculation HTML entry pages open directly and show the expected default calculations.
- The copy action reports success. The correction action opens a GitHub issue draft with only the lesson, parameters, and public experiment link. No issue was submitted.
- The live PNG result card downloads and displays the public site address with no personal author name or email.
- Chinese home has no horizontal overflow at 390px; no browser console errors were captured in the exercised flows.

X preview rendering still depends on X's crawler/cache; static metadata and images have been verified. No personal social profile is linked.

`demo-kv.gif` is a three-state demo assembled from screenshots of the real UI, with deliberate holds for readability. It is not a continuous screen recording or a GPU benchmark.
