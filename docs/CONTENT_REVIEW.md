# Content review

All twelve lessons were checked against primary papers/documentation and independent numerical fixtures before publication. This is a review of the stated teaching models, not validation against a real inference engine.

| Lesson | Finding and boundary | Primary reference |
| --- | --- | --- |
| Prefill / decode | Corrected first-token double counting: total = TTFT + (N − 1) × TPOT. One output token has no subsequent decode; TPOT is shown as N/A. TTFT ≈ prefill only under the stated zero-overhead assumption. | [vLLM metrics](https://docs.vllm.ai/en/latest/design/metrics/), [PagedAttention §2.2](https://arxiv.org/html/2309.06180v1) |
| Roofline | The weight-only dense FP16 model has AI ≈ batch FLOPs/byte and a lower-bound time max(memory, compute). KV, attention, communication, and other work are omitted explicitly. | [Efficiently Scaling Transformer Inference §2](https://arxiv.org/html/2211.05102v1) |
| KV cache | Independently calculated 2 × 32 × 32 × 128 × 2 = 524,288 bytes/token = 512 KiB/token across all layers; 8,192 tokens use 4 GiB. Context means total cached tokens per sequence, not an immutable prompt limit. | [PagedAttention](https://arxiv.org/abs/2309.06180) |
| GQA | Fixed remaining dimensions imply KV size scales with KV-head count. 8 KV heads versus 32 uses one-quarter the cache. Selecting fewer heads means a different/uptrained architecture, not a free runtime switch. | [GQA](https://arxiv.org/abs/2305.13245) |
| Paging | 500 tokens in 16-token blocks allocates 512 slots: 12 unused, 2.34375% waste. Clarified the 8 MiB block total spans 32 layers; one layer uses 256 KiB in this configuration. | [PagedAttention §4](https://arxiv.org/abs/2309.06180) |
| FlashAttention | Tiling and online softmax avoid the full intermediate attention matrix in HBM. The display is one head's conceptual score storage, not total SRAM or linear-time dense attention. | [FlashAttention](https://arxiv.org/abs/2205.14135) |
| Quantization | Ideal storage is parameters × bits / 8. The fixed-range uniform grid is deliberately not a faithful FP16/FP8/FP4 format, AWQ implementation, or task-quality model. Metadata and kernels affect real storage/speed. | [AWQ](https://arxiv.org/abs/2306.00978) |
| Batching | The two-slot simulation conserves each request's work. Default static: 22 steps; continuous: 15. Step duration, arrivals, prefill and capacity are simplified, so it is not a tokens/s prediction. | [PagedAttention §2.3](https://arxiv.org/abs/2309.06180) |
| Speculation | With constant conditional acceptance, expected tokens = 1 + α + … + α^k, including a correction/bonus token. Speedup assumes fixed target/verification time and serial drafting; not a universal speed claim. | [Speculative Decoding §3](https://arxiv.org/html/2211.17192v2) |
| TP / PP / DP | The display models only ideally balanced weights. DP retains a full model per replica. TP/PP introduce communication or pipeline costs; KV partitioning is not assumed to scale identically. | [Efficiently Scaling Transformer Inference](https://arxiv.org/abs/2211.05102) |
| Training | Basic DPO uses offline preference pairs; PPO typically trains a value function; GRPO removes a separate critic using group-relative rewards. Model residency and memory savings depend on implementation. Amdahl example: 1/(0.3 + 0.7/2) = 1.538… . | [DPO](https://arxiv.org/abs/2305.18290), [PPO](https://arxiv.org/abs/1707.06347), [DeepSeekMath §4](https://arxiv.org/html/2402.03300v3) |
| Capacity challenge | 7B FP16 weights + 16 sequences × 8K tokens × 8 KV heads + 4.8 GiB reserve = 33.8385… GiB. Memory fit does not establish a latency/quality SLO. | [Inference scaling](https://arxiv.org/abs/2211.05102) |

## Corrections applied

- Removed an extra decode step from the timing model and corrected its quiz in both languages.
- Distinguished aggregate KV blocks from per-layer blocks.
- Clarified cached context growth and the lack of prefix sharing in the memory budget.
- Added direct DPO, PPO, and metric-definition references.
- Added numerical and scheduling-conservation regression tests, including boundary cases.

The fixed timing numbers and 10% reserve are instructional assumptions. The project makes no claim that these constants describe a named GPU, engine, model checkpoint, or measured workload.
