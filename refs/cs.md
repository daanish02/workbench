# CS Knowledge Base — Gaps and Audit To-Do

The CS area is fully written (15 sections). This file lists only what is still missing or broken, found in the 2026-10-18 review. Work from this list; delete items as they are done.

## 1. Audit fixes (do first)

### 1a. Failing code blocks

`uv run scripts/check_notes.py cs` reports 30 of 211 blocks failing (2026-10-18). Causes:

- **Not standalone** (uses names from an earlier block): algorithms/recursion:111 (`factorial`), case-studies/chat-application:61 (`concurrent` import), case-studies/collaborative-editor:93 (`transform`), case-studies/payment-system:105 (`db`), case-studies/search-autocomplete:130 (`corpus`), databases/sql-fundamentals:105 and :163 (`db`), databases/transactions-and-acid:80 and :115 (`db`), languages/compilers-and-interpreters:33, :59, :110 (`price`), languages/generics-and-variance:137 (`Cat`), languages/imperative-vs-declarative:43 and :107 (`numbers`), languages/object-oriented-programming:128 (`EmailNotification`).
- **Deliberate error that crashes the block**: languages/compilers-and-interpreters:87 (NameError), languages/object-oriented-programming:63 (ValueError), languages/type-systems:72 and :92 (TypeError).
- **Timings printed** (breaks the "no timings" rule): case-studies/ride-hailing:110, case-studies/search-autocomplete:88, databases/indexes:38 and :106, databases/nosql:215, security/authentication:41. Replace with counts (rows examined, vectors scanned) or boolean checks.
- **Network output that varies**: networks/dns:61 (IP addresses), networks/http:55 (`Date` header). Print stable facts only (status code, `has IPv4: True`).
- **Prose in the trailing comments, read as expected output**: foundations/abstraction-layers:82 ("Output on CPython 3.14 …"), languages/generics-and-variance:83 (mypy output, which the block does not produce). Move the prose above the block or out of the trailing comment run.

Fix rules: every block standalone (repeat its imports and setup data); a deliberate error demo should catch and print the exception (`except TypeError as e: print("TypeError:", e)`) so the block exits cleanly; network and timing output is machine-dependent, so print a boolean check instead.

### 1b. Headings too long

Rule (user, 2026-10-18): `##` headings at most 5 words. 338 of 862 CS headings break it, across 88 notes. Math has 31 of 471 too. Find them with:

`grep -H '^## ' src/content/notes/cs/*/*.mdx | awk -F: '{split($2,a," "); if(length(a)-1>5) print}'`

Shorten each without losing meaning, and check that no link points at a changed heading anchor (`#old-heading-slug`).

### 1c. Glossary links

Notes were meant to link glossary terms at first use (`/workbench/cs/appendix-reference/glossary/`). Spot-check; most notes do not yet.

## 2. Notes to write (stubs exist)

Placeholder stubs were created on 2026-10-18 (body `_Placeholder. Content not written yet._`, `order` already set and neighbours renumbered). Overwrite each stub in place; do not create new files. Each needs the usual template: takeaways, resources (curl 200), at least one figure, verified standalone Python (`uv run scripts/check_notes.py cs <slug>`).

The nine core stubs (storage-engines, floating-point, memory-and-gc, rpc-and-serialization, union-find, randomized-algorithms, range-queries, network-flow, text-encoding) were written on 2026-10-20. The five Data Engineering notes below were also written on 2026-10-20. Remaining: the appendix language sheets (section 4).

### New section: Data Engineering

Added to `src/data/areas.ts` after System Design, with 5 stubs in `src/content/notes/cs/data-engineering/`. The section exists; only write the notes. Builds on databases, message-queues and distributed-systems; ML leans on it.

1. `etl-and-pipelines` — extract/transform/load vs ELT, orchestration (DAGs, schedulers), idempotent and backfillable jobs, data quality checks.
2. `batch-vs-streaming` — bounded vs unbounded data, event time vs processing time, windows, watermarks, late data, delivery guarantees (at-least-once, exactly-once claims).
3. `event-logs` — the append-only log, partitions, offsets, consumer groups, retention and compaction (Kafka-style); link `system-design/message-queues` instead of repeating queue basics.
4. `data-warehouses` — OLTP vs OLAP, columnar storage and compression, star/snowflake schemas, why analytical scans need a different engine. Links `databases/storage-engines`.
5. `data-lakes` — raw data in object storage, Parquet and other columnar file formats, partitioning, table formats and the lakehouse pattern.

### Security expansion (decided with the user, 2026-10-24)

The Security section (10 notes, about 2,060 words each, the longest section in CS) is strong on defensive building blocks (crypto, auth, authorization, web vulnerabilities, network security, secure development) but thin on how attacks work and on the defensive operations side. Add five notes in `cs/security` and one in `cs/cloud`. **No stubs exist yet**: create each as a stub first, per the writing checklist in `refs/infra.md` (title at most 3 words, description, `order`, `tier`, renumber the neighbours, fix any "next note" wording), then overwrite it. Keep one section; it grows from 10 to 15 notes, within the size of other sections.

Final `cs/security` order after inserting (new notes in bold):

1. **Security Principles**, 2. Threat Modeling, 3. Cryptography Fundamentals, 4. Authentication, 5. Authorization, 6. Web Vulnerabilities, 7. **Memory Safety Bugs**, 8. **Common Attacks**, 9. Network Security, 10. Secure Development, 11. Penetration Testing, 12. **Red And Blue Teams**, 13. **Detection & Response**, 14. Compliance & Privacy, 15. Advanced Cryptography. Tiers: Memory Safety Bugs and Red And Blue Teams `advanced`, the rest `core`, which keeps the section at 3 advanced of 15 (the guide aims for about 1 in 5).

Rules for all of these: conceptual and authorized-testing framing, no step-by-step instructions for attacking real systems. Python blocks must be standalone, seeded and checked (`uv run scripts/check_notes.py cs <slug>`). If a note really needs C, mark the output `// output: PENDING` and log it with `note_tools.py pending`; prefer a Python simulation where it teaches as well.

1. `security-principles` [Security Principles], order 1, core. Opens the section; Threat Modeling then starts from it. Confidentiality, integrity, availability; least privilege; defence in depth; fail-safe defaults; complete mediation; trust boundaries; zero trust as "do not trust a network location" (link `networks`-side detail in `security/network-security` rather than repeating it); risk as likelihood times impact, then hand off to threat-modeling for prioritizing. Code idea: independent layers multiply (probability a breach passes every layer), seeded. Zero trust is covered here, not as its own note.
2. `memory-safety-bugs` [Memory Safety Bugs], order 7, advanced. Buffer overflow, use-after-free, double free, integer overflow leading to a bad bounds check; why they let an attacker change a program's behaviour; mitigations: bounds checking, stack canaries, non-executable memory, ASLR, control-flow integrity, hardware pointer authentication and memory tagging, safe languages, sanitizers and fuzzing. Code idea: a Python simulation of a stack frame in a `bytearray` showing an overflow overwriting the neighbour and a canary catching it (no real exploit code). Link `cs/operating-systems/{memory-management,virtual-memory}`, `cs/foundations/fetch-execute-cycle`, `cs/languages/memory-and-gc` and the Rust and C sheets. Cross-link both ways with `infra/cpu-architecture/hardware-security` (speculation attacks are there; do not repeat them).
3. `common-attacks` [Common Attacks], order 8, core. One note for the terms that each need a section, not a note: denial of service and DDoS (volumetric versus application layer, amplification, SYN floods; defences: rate limiting, CDNs and anycast, backpressure; link `system-design/rate-limiting` and `networks/load-balancing-and-cdns`), social engineering and phishing (pretexting, why phishing-resistant MFA matters; link `security/authentication`), malware and ransomware (families, persistence, spread; defences: backups, least privilege, patching), insider threats. Code idea: a token bucket against a flood.
4. `red-and-blue-teams` [Red And Blue Teams], order 12, advanced. Offensive and defensive roles and how they differ in goal and metrics (coverage versus time to detect and respond); adversary emulation; the attack chain and MITRE ATT&CK as shared vocabulary; purple teaming and the feedback loop; tabletop exercises; bug bounties. Pointer to AI red teaming in `applied-dl/llm-alignment/llm-safety` once that note is written. Builds on `penetration-testing` (techniques) and `threat-modeling`.
5. `detection-and-response` [Detection & Response], order 13, core. The blue side in depth: what to log, central logging and SIEM, detection rules versus anomaly detection, false positives and the base-rate problem (link `math/probability/bayes-rule`; code idea: precision of an alert when attacks are 0.1% of events), alert triage, the incident response lifecycle (prepare, detect, contain, eradicate, recover, learn), forensics and evidence handling. Link `software-engineering/releases-and-incidents` and `software-engineering/observability` for the SRE side instead of repeating postmortems and metrics.

New note in the cloud section, not Security:

6. `cloud-security` [Cloud Security], `cs/cloud` order 6 (after `storage-models`, before `auto-scaling`; renumber `auto-scaling` and `multi-cloud`), core. Shared responsibility (link `service-models`, do not re-teach it); IAM: identities, roles, policies, least privilege, short-lived credentials; secrets and key management (KMS, vaults, rotation; link `security/cryptography` and `security/advanced-cryptography`); network isolation (VPCs, security groups); misconfiguration, such as public buckets, as the main cause of cloud breaches; brief notes for containers and serverless. Code idea: a small IAM policy evaluator (explicit deny beats allow).

## 3. Checked and not gaps

These looked missing but are covered; don't add notes for them:
isolation levels (transactions-and-acid), WebSockets/QUIC (other-protocols, http), cgroups/namespaces (cloud/vms-vs-containers, containerization), supply chain (secure-development), side channels and Spectre (`infra/cpu-architecture/hardware-security`), zero trust, DoS, phishing and malware (inside Security Principles and Common Attacks above, no separate notes), Amdahl's law (scalability), CRDTs (consistency-models, collaborative-editor), OAuth (authentication).

Decided with the user (2026-10-18), do not add: Python quick reference; a Web/Frontend section (different domain); a Compilers section (`languages/compilers-and-interpreters` is enough); a Performance Engineering section (profiling is in debugging/observability, hardware performance is in infra); Graphics and Mobile (off the path to ML/DL).

## 4. Appendix additions (stubs exist, 2026-10-18)

Language sheets, one per language, all with the shared headings in CLAUDE.md (Appendix templates): `python-sheet`, `javascript-typescript` (TypeScript first, JavaScript differences noted), `go-sheet`, `c-sheet`, `cpp-sheet`, `java-sheet`, `rust-sheet`, plus `rosetta-table` (concept rows, language columns). `language-reference` stays the high-level comparison and should link to the sheets.

**Open issue (user, 2026-10-18):** non-Python snippets in the language sheets and Rosetta table stay `// output: PENDING` until the user runs them. Collect them in `refs/verify-snippets.md`; the user pastes outputs back in one batch.
