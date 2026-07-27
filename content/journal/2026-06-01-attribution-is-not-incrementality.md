---
title: "Attribution Isn’t Incrementality: ROAS Measures Credit, Not Lift"
slug: "attribution-is-not-incrementality"
date: "2026-06-01"
status: "draft"
category: "Data Science Applied to Decisions"
tags:
  - "Marketing Analytics"
  - "Growth"
  - "Experimentation"
  - "Attribution"
  - "Decision Systems"
summary: "You can have a beautiful ROAS dashboard and still be buying the wrong kind of growth. Attribution mostly tells you where demand *showed up* (and who gets the credit). Incrementality tells you what your spend actually *caused*. If you don’t separate the two, you’ll keep funding channels that harvest existing intent while starving the work that creates new demand."
keyInsight: "Attribution is credit assignment. Incrementality is causal lift. Confusing them turns marketing budget allocation into a self-fulfilling spreadsheet."
readingTime: "7 min read"
imageGeneratedByAI: false
sourceLinks:
  - title: "Guidelines for Incremental Measurement in Commerce Media"
    url: "https://www.iab.com/guidelines/guidelines-for-incremental-measurement-in-commerce-media/"
    publisher: "IAB"
    datePublished: "2025-11-03"
    accessed: "2026-06-01"
    claimSupported: "Incrementality requires a credible counterfactual; attribution and incremental measurement answer different questions."
  - title: "Is Your Digital-Advertising Campaign Working?"
    url: "https://insight.kellogg.northwestern.edu/article/is-your-digital-advertising-campaign-working"
    publisher: "Kellogg Insight"
    datePublished: "2016-03-11"
    accessed: "2026-06-01"
    claimSupported: "Why randomized tests (or strong quasi-experiments) are necessary to estimate causal ad lift, and why observational measurement can mislead."
  - title: "About conversion lift experiments"
    url: "https://support.google.com/google-ads/answer/7381742"
    publisher: "Google Ads Help"
    accessed: "2026-06-01"
    claimSupported: "How lift studies work conceptually (test vs control) to estimate incremental conversions from ads."
linkedinShortPost:
  draftPath: "content/linkedin-drafts/2026-06-01-attribution-is-not-incrementality.md"
  status: "draft"
  engagementQuestion: "Which metric do you trust most today when you move budget: platform ROAS, blended CAC, or lift from experiments?"
---

## Strong Opening Hook

Attribution is a confidence trap.

It feels precise because the dashboard has decimals.

## Short Story / Context

In most growth teams, budget decisions end up getting justified through a familiar loop:

- a platform reports ROAS/CAC,
- the dashboard looks “clean,”
- the channel gets more budget,
- and the organization treats that as learning.

But there’s a quiet mismatch hiding inside that loop:

Attribution mostly tells you where demand *landed*.
It does not reliably tell you what your spend *created*.

That difference is the gap between “we’re efficient” and “we’re actually growing.”

## What Happened

Over the last few years, marketing measurement has been forced to evolve:

- privacy changes reduced easy tracking,
- platforms improved modeled reporting,
- and every serious team started talking more about incrementality, holdouts, and lift.

What I notice in practice is that many teams adopted the language (“incrementality”) without changing the operating system of decision-making.

They still move budget based on attribution outputs — then call it experimentation.

## Why It Matters

Marketing is not only a creative function.

It’s also a capital allocation function.

When you treat attribution as causality, you create a predictable failure pattern:

1) You over-fund channels that harvest existing intent (especially retargeting and “capturing” traffic).
2) You under-fund work that creates new intent (brand building, new audiences, new categories, new propositions).
3) You become “efficient” in the short term and fragile in the long term.

This is why teams can show “great ROAS” while:

- new customer growth slows,
- organic/direct traffic stops compounding,
- and the business becomes dependent on the same paid levers to stay flat.

## The Hidden Lesson

Think of these as two different questions:

### 1) Attribution question: “Who gets credit?”

Attribution assigns credit based on observed paths.
It is a *credit allocation model*.

That’s useful, but it is not the same as truth.

When a customer already intends to buy, many ads can still “touch” the path and collect credit.

### 2) Incrementality question: “What did our spend cause?”

Incrementality tries to estimate the counterfactual:

What would have happened if we did *not* run this campaign?

This is a causal question, which is why lift methods usually need a real or engineered control group (randomized holdouts, geo tests, time-based holdouts, etc.).

Here’s the line I keep coming back to:

Attribution optimizes *credit*.
Incrementality optimizes *causality*.

If you only reward credit, the system learns to chase the easiest conversions to “prove” itself.

## India / MBA / Student Relevance

In India, this mistake gets amplified by the reality of how many growth loops actually behave:

- A lot of demand is price-anchored and promo-sensitive (so you can “buy” temporary performance).
- Marketplaces and aggregators can blur brand vs channel effects.
- Retargeting is cheap when intent is high, and expensive when intent is low — which makes the dashboard look smart even when the business is not learning.

From an MBA lens, the interesting part is not the math.

It’s the governance:

Who gets to move budget, based on which evidence, at what cadence?

If the answer is “whoever has the best-looking ROAS slide,” you don’t have measurement.
You have politics with charts.

## My Interpretation

The real failure mode is not “your attribution model is wrong.”

It’s that your organization is using one metric to answer two different decisions:

- **Optimization decision:** “Which creative / audience / bid strategy is working *inside* a channel?”
- **Allocation decision:** “Should this channel get more of the company’s budget next week?”

Attribution can be helpful for the first.

Incrementality (or at least a strong proxy like blended outcomes + controlled tests) is needed for the second.

If you don’t separate these, you keep upgrading the precision of a tool that was never meant to answer the question you’re asking.

## A Practical Operating Playbook

If I had to keep it simple, I’d implement marketing measurement as a three-layer system:

### Layer 1: A few blended truth metrics (company-level)

Pick 2–3 outcomes that don’t depend on platform self-reporting:

- blended CAC / payback period
- new customer rate (or new-to-brand, if you have it)
- contribution margin after marketing (or a simplified proxy)

These are not perfect, but they’re harder to game.

### Layer 2: Attribution for in-channel optimization (tactical)

Use platform reporting to iterate creative, audiences, and messaging.

Treat it like a cockpit, not a scoreboard.

### Layer 3: Lift tests for budget decisions (strategic)

You don’t need a PhD to start.

Start with one high-confidence test per quarter:

- a holdout audience,
- a geo split,
- or a time-based pause with guardrails.

The point is not statistical purity.

The point is to build a habit of asking the counterfactual before you move big money.

## Key Takeaways

- Attribution is credit assignment; incrementality is causal lift. They answer different questions.
- High ROAS can coexist with stagnant growth if you are mostly harvesting intent.
- Use platform attribution to optimize within channels, not to justify budget allocation.
- Anchor decisions on a few blended metrics that are harder to game.
- Run periodic lift tests so you can re-allocate budget with evidence, not confidence.

## Sources

- IAB guidance on incremental measurement and the role of a credible counterfactual.
- Kellogg Insight summary on why causal ad effectiveness needs experimental approaches.
- Google Ads Help overview of conversion lift study mechanics (test vs control).

