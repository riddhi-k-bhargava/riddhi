# BD Radar

**Shipped, recreated.** A production multi-agent AI system that monitors deal news, classifies it against a proprietary taxonomy, finds the right contacts, and drafts outreach for an 8-person business development (BD) team at a JV advisory firm. Nine agents plus scheduled flows on Copilot Studio and Power Automate, over a shared data layer, live and running on its own every day. The production system runs on the firm's Microsoft tenant and cannot be shown; the page in this folder is an interactive recreation with synthetic data.

This README doubles as the write-up, following an 11-point product spec.

---

## Resume line

Pick one. The others are interview backup. Only claim what you built and can defend on a whiteboard. All three are real.

**Primary**
> Designed and shipped BD Radar, a production multi-agent AI system (9 agents plus scheduled flows on Copilot Studio and Power Automate) that monitors deal news, classifies it against a proprietary taxonomy, finds the right contacts, and drafts outreach for an 8-person team. Turned a manual daily research chore into a hands-off pipeline.

**Alt, orchestration**
> Owned the orchestration layer of a 9-agent pipeline. Split the agents so writers never talk and talkers never write, which killed a looping bug that fired 15 duplicate outputs per run. Added dedup, rate-limit pacing, and confirm-before-write gates.

**Alt, memory**
> Built the shared memory layer for a multi-agent system. One immutable key carries state across 6 tables, so independent agents hand off work cleanly from deal to contacts to outreach to gap detection.

---

## 1. One-liner and signals

Catch deals early and put the right contact in front of a BD analyst while the deal is still fresh, before corp dev and legal have fielded a week of calls.

Signals it was worth building:
- Eight people were scanning the news by hand: slow, patchy, impossible to measure.
- The value of a deal signal decays fast, so latency was the real enemy, not effort.
- A firm that gets to a deal first usually wins the work, so coverage is a competitive asset the firm should own.

## 2. Hypothesis

If a system watches the full company list every day, classifies new deal activity against the firm's taxonomy, attaches the right contacts, and hands a ready-to-review digest to a person each morning, the team catches more deals while they are fresh and stops losing time to manual scanning. A person still approves and sends, so trust and control are never traded away for automation.

## 3. Target user and JTBD

Primary user: a BD analyst on an 8-person team at a JV advisory firm.

Jobs to be done:
- When I start my day, I want the new, relevant deal activity already found and de-duplicated, so I do not comb the news myself.
- When a deal looks worth pursuing, I want the right contacts already attached, so I can reach out the same day.
- When the system proposes outreach, I want to review and send it myself, so nothing leaves my name without my say.

## 4. v1 scope

- Ingest daily deal news for the watchlist (Manzama).
- Classify new deals against a proprietary taxonomy and assign an immutable DealID.
- Find contacts for the parties (Seamless AI).
- Format a single daily digest.
- Send the digest to the team. Emails to prospects are drafted, never sent automatically.

On-demand agents beyond the nightly pipeline: a Teams assistant, meeting prep, outreach, prospecting, a tracker, and a weekly gap finder, all reading and writing the same shared layer.

Out of scope for v1: sending prospect email automatically, and any model-written record that a person has not confirmed.

## 5. Success metrics

- Coverage: share of the watchlist actually scanned each day. Target: complete, up from ad hoc.
- Latency: time from announcement to a digest a person can act on. Target: same morning.
- Reliability: one clean digest per run, zero duplicate writes, zero broken IDs.
- Time reclaimed: hours per week no longer spent on manual scanning and contact lookup.
- Trust guardrail, non-negotiable: zero prospect emails sent without human confirmation.

## 6. Back of the envelope

- Watchlist: roughly 2,000 companies watched (measured).
- Contacts managed: 2,238 (measured).
- Deals classified: 95 and growing (measured).
- Agents and flows: 9 agents plus scheduled flows over one shared state layer (measured).
- Time saved: estimate the old manual routine as 8 people at about 20 minutes each a day, 5 days a week, which is roughly 13 hours a week. State it as "cut about 13 hours a week of manual deal monitoring." The 20-minute per-person figure is the one estimate; the agent, watchlist, contact, and deal counts are measured.

## 7. Strategy

Agent systems rarely break on model quality. They break at the seams, where state moves between steps and where autonomy should stop. So the design rests on two things: a single source of truth every agent shares (the system's memory), and a clear line between what the system decides and what a person signs off on.

Separation of concerns, made concrete:
- Agents that write structured data never produce conversational output.
- Conversational agents never write.
- Sending happens in flows, and prospect email is drafted, never auto-sent.

The coordination mechanism is a single immutable DealID that every table carries. Stateless agents cannot hold context between steps, so the DealID is what lets them hand off work cleanly: deal, to contacts, to outreach, to gap detection.

## 8. Build vs write-up

Build: the production system runs on the firm's Microsoft tenant (Copilot Studio, Power Automate, Manzama, Seamless AI, shared tables) and cannot be shown outside it.

Write-up: this folder contains a static, interactive recreation. It uses synthetic data (deal D-042, "Contoso Industrial and Fabrikam Logistics", which are fictional), makes no network calls, sets no cookies or storage, and never sends anything. The point is to show the architecture and the human-in-the-loop control honestly, not to reproduce the private system.

## 9. Risks and mitigations

- Runaway loops and duplicate output. The first version failed here: a single agent mixing writes with conversation looped into 15 duplicate outputs per run and corrupted its own ID counter. Mitigation: split writers from talkers, and make the shared key immutable so nothing rewrites an ID mid-run.
- Silent corruption of the source of truth. Mitigation: the shared key fails loud. If the read it depends on breaks, the system stops instead of guessing. A quietly corrupted intelligence file is worse than a late one.
- False coverage. Mitigation: match coverage on the immutable key, never on similar names. A false "we've got this" hides a real gap, which costs more than a visible hole.
- Rate-limit throttling. Mitigation: traced the limit to the platform underneath the vendor, then redesigned the schedule and pacing rather than buying a bigger plan.
- Bad autonomous sends. Mitigation: the autonomy line is drawn at anything a client sees or any record that becomes truth. Emails are drafted, writes need a confirm.

## 10. Effort and milestones

1. v1, a single agent doing everything. Failed in production: looped, produced 15 duplicate outputs per run, corrupted its own ID counter.
2. Diagnosis: a design error, one agent mixing state writes with conversational output. Decision to split writers from talkers.
3. Rebuild: immutable, fail-loud shared key; write and talk separated; schedule and pacing redesigned to fix the real rate-limit and date-handling bottleneck.
4. Guardrails: autonomy line drawn so the system drafts and a person confirms and sends. Stable in production, running unattended.

## 11. Portfolio framing

This is the "unglamorous, high-stakes" kind of AI work: a multi-agent system whose hardest problems are not the model but state, coordination, idempotency, rate limits, and trust. The interesting decisions are where autonomy stops and how state survives the handoffs between agents, backed by real guardrail and eval habits rather than a demo. Labeled honestly as **Shipped, recreated**: the live system is real and running; this page is a synthetic recreation of it.

---

*Independent write-up by Riddhi Bhargava. A side project built for a JV advisory firm. Not affiliated with Manzama, Seamless AI, Microsoft, or any named company. Contoso Industrial and Fabrikam Logistics are fictional sample names.*
