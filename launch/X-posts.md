# X launch copy

Drafts only. The deployment URL below has been verified. English entry links use `?lang=en`. These drafts deliberately describe simulations, not measured speedups.

## Main post

I built Infra Lab for software engineers learning AI infrastructure.

Explore KV cache, batching, and speculative decoding through 12 interactive experiments.

No GPU. No setup. English + 中文.

Teaching simulations, with assumptions visible.

https://pendaralearning.github.io/InferenceLearning/?lang=en

Attach: `demo-kv.gif` or `assets/social-home.png`.

## KV cache

The model fits on your GPU. But does the conversation?

In this teaching model, 8K context uses 4 GiB of KV cache per sequence. Move concurrency from 1 to 3 and watch a 24 GiB memory budget break.

Try it: https://pendaralearning.github.io/InferenceLearning/experiments/kv-cache.html?lang=en

Attach: `assets/social-kv.png` or a downloaded result card.

## Continuous batching

An idle GPU slot doesn't have to wait for the longest request.

Compare static and continuous batching: six requests, two slots, one scheduler switch.

A toy simulation to build intuition—not a GPU benchmark.

https://pendaralearning.github.io/InferenceLearning/experiments/continuous-batching.html?lang=en

Attach: `assets/social-batch.png`.

## Speculative decoding

Guessing more tokens isn't always faster.

Change acceptance rate, draft length, and draft cost. Find when speculative decoding loses its advantage in this simplified model.

https://pendaralearning.github.io/InferenceLearning/experiments/speculative-decoding.html?lang=en

Attach: `assets/social-spec.png`.

## 中文主帖备选

我做了 Infra Lab：给想理解 AI 基础设施的软件工程师。

不用 GPU，不用安装。通过 12 个交互实验，动手理解 KV cache、调度、推测解码和显存规划。

支持中英切换、参数分享和结果卡片。所有数字都是有明确假设的教学模拟，不是实测 benchmark。

https://pendaralearning.github.io/InferenceLearning/?lang=zh

## Demo sequence

1. Start at 8,192 tokens and 1 concurrent sequence: KV = 4.00 GiB, total = 19.44 GiB.
2. Move concurrency to 2: KV = 8.00 GiB, total = 23.44 GiB, still fits.
3. Move to 3: KV = 12.00 GiB, total = 27.44 GiB, over the 24 GiB capacity.
4. Open the full lab, inspect the formula, and share the parameters.

The supplied GIF is assembled from real browser screenshots of the first three states. It is not a synthetic performance animation. No personal social profile is linked.
