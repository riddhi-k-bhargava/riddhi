# JV Radar

**Shipped, recreated.** A self-running multi-agent system that watches about 2,000 companies daily for JV and M and A announcements, drafts an outreach digest, and stages it for a person to approve and send. The production system runs on the firm's Microsoft tenant and cannot be shown; the page in this folder is an interactive recreation with synthetic data.

This README doubles as the write-up, following an 11-point product spec.

---

## 1. One-liner and signals

Catch JV and M and A deals while they are still actionable, and put the right contact in front of a business development (BD) analyst before the deal goes cold.

Signals that this was worth building:
- Deals were being missed or caught late because monitoring was manual and inconsistent.
- The same analyst repeated the same work every morning: comb the news, identify the parties, find contacts.
- The value of a deal signal decays fast, so latency was the real enemy, not effort.

## 2. Hypothesis

If a system watches the full company list every day, classifies new JV and M and A activity, attaches the right contacts, and hands a ready-to-review digest to a person each morning, then the team catches more deals while they are fresh and stops losing analyst time to manual scanning. A person still approves and sends, so trust and control are never traded away for automation.

## 3. Target user and JTBD

Primary user: a BD analyst on an 8-person team.

Jobs to be done:
- When I start my day, I want the new, relevant JV and M and A activity already found and de-duplicated, so I do not comb the news myself.
- When a deal looks worth pursuing, I want the right contacts already attached, so I can reach out the same day.
- When the system proposes outreach, I want to review and send it myself, so nothing leaves my name without my say.

## 4. v1 scope

- Ingest daily news for the watchlist (Manzama).
- Classify new deals and assign an immutable DealID.
- Find contacts for the parties (Seamless AI).
- Format a single daily digest.
- Stage the digest in Outlook drafts for human review. No automatic send.

Explicitly out of scope for v1: sending email, scoring or ranking deals, CRM write-back beyond the shared tables, and any model-written data that a person has not reviewed.

## 5. Success metrics

- Coverage: share of the watchlist actually scanned each day. Target: 100 percent, up from ad hoc.
- Latency: time from announcement to a digest a person can act on. Target: same morning.
- Analyst time reclaimed: hours per week no longer spent on manual scanning and contact lookup.
- Reliability: zero duplicate digests, zero corrupted IDs, one clean digest per run.
- Trust guardrail, non-negotiable: zero emails sent without human approval.

## 6. Back of the envelope

- Watchlist: about 2,000 companies scanned daily (measured).
- Agents and flows: 9 agents across 3 flows, one shared state layer (measured).
- Time saved: one analyst spent about 3 hours a day combing news and finding contacts, 5 days a week, which is roughly 15 hours a week. This hours figure is the one estimate on the page; the agent count and watchlist size are measured facts from the live system.

## 7. Strategy

One principle governs the whole design: separation of concerns.
- Agents that write structured data never produce conversational output.
- Conversational agents never write.
- No email is ever sent automatically. The system drafts and stages; a person approves and sends.

The coordination mechanism is a single immutable DealID that every table carries. Stateless agents cannot hold context between steps, so the DealID is what lets them share state safely: Agent 1A creates it, and every later step reads or writes against it. The tables are JV_DealLog (the source of truth), Daily_Targets, Outreach Tracker, and DealsToChase.

The chain runs off-hours, spaced two hours apart (1 AM ingest, 3 AM classify, 5 AM contacts, 7 AM format, 9 AM save to drafts and mark processed), so the agents stop competing for one shared rate limit.

## 8. Build vs write-up

Build: the production system runs on the firm's Microsoft tenant (Manzama, Seamless AI, Outlook, shared tables) and cannot be shown outside it.

Write-up: this folder contains a static, interactive recreation. It uses synthetic data (deal D-042, "Contoso Industrial and Fabrikam Logistics", which are fictional), makes no network calls, sets no cookies or storage, and never sends anything. The "Open in Outlook to send" button is a mock. The point is to show the architecture and the human-in-the-loop control honestly, not to reproduce the private system.

## 9. Risks and mitigations

- Runaway loops and duplicate output. v1 failed exactly here: a single agent mixing writes with conversation looped into 15 duplicate digests and corrupted its own ID counter. Mitigation: split write-only from talk-only agents, and make the DealID immutable so nothing can rewrite an ID mid-run.
- Rate-limit contention. Mitigation: move the chain off-hours and space steps two hours apart so agents do not compete for one shared limit.
- Silent bad sends. Mitigation: the system has no send capability at all. It classifies, dedups, and drafts; a person approves, and only a person sends.
- Re-processing the same deal. Mitigation: a final idempotent "mark processed" step that clears staging, so a re-run does not double-count.
- Wrong or stale contacts. Mitigation: contacts are staged for human review inside the digest, not acted on automatically.

## 10. Effort and milestones

1. v1, single agent doing everything. Failed in production: looped, produced 15 duplicate digests in a run, corrupted its own ID counter.
2. Diagnosis: a design error, one agent mixing state writes with conversational output. Decision to split into write-only and talk-only agents.
3. Rebuild: immutable DealID, write and talk separated, chain moved off-hours and spaced two hours apart.
4. Guardrail: hard line drawn so the system drafts and a person sends. Stable in production.

## 11. Portfolio framing

This is the "unglamorous, high-stakes" kind of AI work: a multi-agent system whose hardest problems are not the model but state, coordination, idempotency, rate limits, and trust. The interesting decision is not "agents can do it," it is the constraint that write and talk must never mix and that a person, not the system, sends. Labeled honestly as **Shipped, recreated**: the live system is real and running; this page is a synthetic recreation of it.

---

*Independent write-up by Riddhi Bhargava. Not affiliated with Manzama, Seamless AI, Microsoft, or any named company. Contoso Industrial and Fabrikam Logistics are fictional sample names.*
