# Why vers exists

## The Problem: AI Makes Fake v1s Faster

AI compresses the **feature creation phase**, but it does **not** compress reality at the same rate.

In some ways AI makes this worse because:

- It becomes easier to ship surfaces faster than systems
- People confuse generated code with validated architecture
- LLM-based behavior is probabilistic, so "works once" means less than in traditional software
- Integrations, memory, retries, auth, cost tracking, rate limits, and state management all create compound failure modes

So instead of AI making "real v1" faster across the board, it often makes **fake v1s** faster.

## What AI Actually Accelerated

- Scaffolding
- Prototypes
- UI shells
- Wrappers
- Internal tools
- First-pass integrations

## What Still Takes Time

- Observability
- Error handling
- Fallback logic
- Human behavior learning
- Support burden discovery
- Edge-case taxonomy
- Trust hardening
- Deciding what the product actually is after users misuse it

## The Pattern

"Impressive in week 1, frustrating in week 4."

Because week 1 validates possibility. Week 4 reveals operational truth.

## The Shift

**Pre-AI:** Building was the bottleneck.
**Post-AI:** Validation, hardening, and product judgment are the bottlenecks.

## What True v1 Means (For AI Products)

- Stable on non-ideal inputs
- Recoverable when the model fails
- Measurable in cost and latency
- Understandable by users
- Useful without handholding
- Resilient across enough real use that the founder is no longer guessing where it breaks

That last 20-30% is where the actual company gets built.

## The Moat

Founders who are patient with hardening will beat founders who just keep shipping more features. In AI, the moat often won't be "who built the most first," but "who made it reliable enough to trust."

## How vers Encodes This

```
0.1.x           You proved it can work. That's it.
0.2.x - 0.4.x   It works for you. Maybe a friend. API will break.
0.5.x - 0.9.x   It works for strangers. Edge cases are being found.
1.0.0            It survives messy humans, weird inputs, bad timing,
                 partial failures, and inconsistent environments.
```

vers exists so that every version bump is an honest answer to: "How real is this?"
