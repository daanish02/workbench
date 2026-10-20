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

Notes were meant to link glossary terms at first use (`/workbench/cs/appendix/glossary/`). Spot-check; most notes do not yet.

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

## 3. Checked and not gaps

These looked missing but are covered; don't add notes for them:
isolation levels (transactions-and-acid), WebSockets/QUIC (other-protocols, http), cgroups/namespaces (cloud/vms-vs-containers, containerization), supply chain (secure-development), Amdahl's law (scalability), CRDTs (consistency-models, collaborative-editor), OAuth (authentication).

Decided with the user (2026-10-18), do not add: Python quick reference; a Web/Frontend section (different domain); a Compilers section (`languages/compilers-and-interpreters` is enough); a Performance Engineering section (profiling is in debugging/observability, hardware performance is in infra); Graphics and Mobile (off the path to ML/DL).

## 4. Appendix additions (stubs exist, 2026-10-18)

Language sheets, one per language, all with the shared headings in CLAUDE.md (Appendix templates): `python-sheet`, `javascript-typescript` (TypeScript first, JavaScript differences noted), `go-sheet`, `c-sheet`, `cpp-sheet`, `java-sheet`, `rust-sheet`, plus `rosetta-table` (concept rows, language columns). `language-reference` stays the high-level comparison and should link to the sheets.

**Open issue (user, 2026-10-18):** non-Python snippets in the language sheets and Rosetta table stay `// output: PENDING` until the user runs them. Collect them in `refs/verify-snippets.md`; the user pastes outputs back in one batch.
