# Computer Science Knowledge Base — Full Content Plan (v3)

Reordered per review, and **Distributed Systems** split out as its own full section (previously folded into System Design's database-scaling bullet — it deserves its own theory, separate from applied architecture patterns).

**Build/reading order:**

1. Foundations of Computing
2. Languages & Paradigms
3. Computational Theory
4. Data Structures
5. Algorithms
6. Operating Systems
7. Computer Networks
8. Databases
9. Security
10. Distributed Systems
11. System Design
12. Cloud Computing
13. Software Engineering Practices

Note on 2–5: Languages & Paradigms is placed before Data Structures/Algorithms here (thinking in paradigms before structures), with Computational Theory immediately after it since automata/grammars connect directly to how languages are parsed. If building order feels better as Data Structures → Algorithms → Languages & Paradigms instead, that's an easy swap — nothing else in the plan depends on this specific ordering within the cluster.

Tags: **[opt]** = included but lower priority. **[later]** = deferred.

---

## 1. Foundations of Computing

1. What a computer actually does — fetch-execute cycle, instructions as data
2. Binary and number representation — binary, hex, two's complement
3. Boolean logic — AND/OR/NOT/XOR, truth tables _(leans on `math:foundations:logic`)_
4. Abstraction layers — hardware → machine code → assembly → high-level languages → applications
5. Pseudocode and algorithmic thinking

**Interactive:** fetch-execute step-through, binary converter, logic gate builder.

---

## 2. Languages & Paradigms

1. Types and type systems — static/dynamic, strong/weak
2. Imperative vs. declarative programming
3. Object-oriented programming — classes, inheritance, polymorphism, encapsulation
4. Functional programming — pure functions, immutability, higher-order functions
5. Compilers and interpreters — lexing, parsing, the pipeline from source to execution
6. [opt] Type theory basics — generics, variance
7. [later] Concurrency models — actors, CSP, async/await under the hood

**Interactive:** parser step-through (source → tokens → parse tree, live), OOP vs. functional side-by-side solving the same problem.

---

## 3. Computational Theory

1. Finite automata — DFAs/NFAs
2. Regular expressions — the connection to automata
3. Context-free grammars — directly follows from compilers/parsing above
4. Turing machines — the formal model of computation
5. Computability — the halting problem, undecidability
6. [later] Complexity classes beyond P/NP

**Interactive:** DFA/NFA builder (click states/transitions, type a string, watch accept/reject live), Turing machine simulator, regex visualizer with its underlying automaton shown.

---

## 4. Data Structures

1. Arrays and strings
2. Linked lists (singly/doubly)
3. Stacks and queues
4. Hash tables — hashing, collisions, load factor
5. Trees — binary trees, BSTs, traversal orders
6. Balanced trees — AVL, red-black
7. Heaps — min/max, priority queues
8. Graphs — adjacency list vs. matrix, directed/undirected/weighted
9. Tries — prefix trees, autocomplete
10. [opt] Bloom filters
11. [later] Skip lists, B-trees

**Interactive:** linked list insert/delete animator, hash collision visualizer, tree traversal stepper, heap bubble-up/down.

---

## 5. Algorithms

1. Big-O notation — time/space complexity, common classes
2. Sorting algorithms — bubble, insertion, merge, quick, heap sort
3. Searching — linear, binary
4. Recursion — call stack, base cases
5. Divide and conquer
6. Dynamic programming — memoization, tabulation, classic problems
7. Greedy algorithms
8. Backtracking — N-queens
9. Graph algorithms — BFS, DFS, Dijkstra, topological sort
10. [opt] String algorithms — pattern matching, edit distance
11. [later] NP-completeness — P vs. NP

**Interactive:** sorting race, binary search range narrowing, recursion tree visualizer, DP table builder, pathfinding on a grid.

---

## 6. Operating Systems

1. Processes and threads
2. Process scheduling — FCFS, round robin, priority, multilevel queues
3. Context switching
4. Memory management — paging, segmentation, address translation
5. Virtual memory — page tables, page faults
6. Page replacement algorithms — LRU, FIFO, optimal
7. Concurrency and synchronization — mutexes, semaphores, monitors
8. Deadlocks — conditions, prevention, detection, Banker's algorithm
9. File systems — inodes, allocation methods, journaling
10. I/O management — interrupts, device drivers
11. System calls — the user space / kernel space boundary
12. [opt] Kernel architecture — monolithic vs. microkernel
13. [later] Real-time operating systems

**Interactive:** scheduler Gantt-chart builder, page replacement simulator (LRU/FIFO/optimal compared live), deadlock detector (resource allocation graph), producer-consumer with a visible semaphore counter.

---

## 7. Computer Networks

1. Network models — OSI vs. TCP/IP layering
2. Physical and data link basics — MAC addresses, Ethernet
3. IP addressing and subnetting — IPv4/IPv6, CIDR
4. Routing — routing tables, how packets find their way
5. TCP vs. UDP — reliability, the three-way handshake
6. DNS — the resolution chain
7. HTTP/HTTPS — request/response cycle, methods, status codes
8. TLS/SSL — the handshake at a conceptual level _(ties to Security)_
9. Load balancing and CDNs _(ties to System Design)_
10. [opt] Other protocols — FTP, SMTP, WebSockets
11. [later] Software-defined networking

**Interactive:** packet journey visualizer (DNS → routing → TCP handshake → response, one continuous animated path), subnet calculator, TCP handshake stepper.

---

## 8. Databases

1. Relational model — tables, rows, keys
2. SQL fundamentals — SELECT/JOIN/WHERE/GROUP BY
3. Normalization — 1NF/2NF/3NF
4. Indexes — speedup mechanism, write-speed tradeoff
5. Transactions and ACID — with concrete failure examples
6. NoSQL — document/key-value/column stores
7. [opt] Query optimization — how a planner chooses an execution path
8. [later] — _(distributed database theory now lives in section 10, not here)_

**Interactive:** JOIN visualizer, index vs. no-index lookup comparison, transaction isolation level demo.

---

## 9. Security

1. Threat modeling — assets, adversaries, attack surface
2. Cryptography fundamentals — symmetric/asymmetric encryption, hashing, digital signatures, Diffie-Hellman _(ties to `math:discrete-math:modular-arithmetic`)_
3. Authentication mechanisms — passwords, MFA, sessions vs. tokens, OAuth/OIDC conceptually
4. Authorization models — RBAC, ACLs, principle of least privilege
5. Common web vulnerabilities — SQL injection, XSS, CSRF, SSRF — pattern-level
6. Network security — firewalls, VPNs, TLS/SSL in depth
7. Security in the development lifecycle — secure coding, dependency vulnerabilities, secrets management
8. [opt] Penetration testing concepts — methodology, not tool tutorials
9. [opt] Compliance and privacy basics — GDPR/data protection conceptually
10. [later] Advanced cryptography — zero-knowledge proofs, homomorphic encryption

**Interactive:** encryption/decryption step-through, hash avalanche-effect demo, RBAC permission matrix builder, attack-pattern recognition exercise.

---

## 10. Distributed Systems

_(New, split out properly — this is the theory of multiple machines acting as one system; System Design, next section, is the applied architecture layer built on top of it.)_

1. **What makes a system distributed** — no shared memory, no shared clock, partial failure as the defining challenge
2. **The CAP theorem** — consistency, availability, partition tolerance — moved here from System Design, since it's fundamentally a distributed-systems result, not an architecture pattern
3. **Consistency models** — strong consistency, eventual consistency, causal consistency — what each actually guarantees
4. **Replication strategies** — leader-follower, multi-leader, leaderless replication
5. **Consensus algorithms** — Paxos and Raft at a conceptual level, why agreeing on anything across machines is hard
6. **Leader election** — how a distributed system picks a coordinator, and what happens when it fails
7. **Distributed transactions** — two-phase commit, three-phase commit, the saga pattern
8. **Clock synchronization** — physical clock drift, logical clocks (Lamport timestamps), vector clocks
9. **Fault tolerance** — failure detection, Byzantine faults
10. **Gossip protocols** — epidemic-style information propagation
11. [opt] **Consensus in practice** — quorum systems, the conceptual role tools like ZooKeeper/etcd play
12. [later] **Blockchain as distributed consensus** — a specific, niche application of the consensus ideas above

**Interactive:** this section has some of the best interactive potential in the whole KB — **consensus/leader-election visualizer** (nodes vote, watch a leader get elected, kill a node and watch re-election happen), **vector clock simulator** (events across multiple nodes, see causality resolved visually), **replication lag demo** (writes propagating across replicas with simulated network delay, showing staleness), **CAP theorem explorer** (pick which property to sacrifice, see the concrete consequence).

---

## 11. System Design

_(Now clearly the applied/architecture layer — assumes Distributed Systems theory as a prerequisite rather than re-deriving it.)_

1. Scalability basics — vertical vs. horizontal scaling
2. Load balancing strategies — round robin, least connections, consistent hashing
3. Caching strategies — cache-aside, write-through, write-back, eviction policies (LRU ties back to OS)
4. Database scaling patterns — read replicas, sharding _(applied use of Distributed Systems' replication theory)_
5. Microservices vs. monolith — tradeoffs, when each makes sense
6. API design principles — REST conventions, versioning, pagination, idempotency
7. Message queues and event-driven architecture — decoupling systems, pub/sub
8. Consistent hashing — how distributed caches/load balancers assign work without full reshuffling
9. [opt] Rate limiting — token bucket, leaky bucket
10. [later] Worked system design case studies — URL shortener, chat app, news feed, as synthesis capstones once the component concepts exist

**Interactive:** consistent hashing ring (add/remove nodes live), cache eviction simulator (LRU vs. LFU on the same access pattern), load balancer strategy comparison (same traffic pattern, different algorithms).

---

## 12. Cloud Computing

1. Cloud service models — IaaS, PaaS, SaaS
2. Cloud deployment models — public, private, hybrid
3. Virtualization vs. containers in the cloud
4. Serverless computing — functions-as-a-service, cold starts, fit/non-fit cases
5. Cloud storage models — object, block, file storage
6. Auto-scaling — how infra responds to load automatically
7. [opt] Multi-cloud and vendor lock-in
8. [later] Provider-specific deep dives — deliberately avoided, concepts over vendor syntax

**Interactive:** responsibility-model slider (IaaS→PaaS→SaaS), auto-scaling simulator (traffic spike, instances respond).

---

## 13. Software Engineering Practices

_(Closing section — how you actually ship everything covered above.)_

1. Version control (Git internals) — commits as a DAG, branching, merge vs. rebase
2. CI/CD — the pipeline concept, stage gates
3. Containerization — namespaces, cgroups, layered filesystems
4. Infrastructure as Code — declarative vs. imperative infra, state, drift
5. Observability — logs vs. metrics vs. traces
6. [opt] Testing strategy — the testing pyramid
7. [opt] Code review practices

**Interactive:** Git commit-graph builder, layered-filesystem visualizer, CI/CD pipeline stage visualizer.

---

## Cross-cutting

CS-specific glossary (API, REST, ACID, CRUD, SLA, etc.) — short definitions, separate from the Notation Reference shared with Math.

---

## Summary counts

| #   | Section                        | Core | Opt | Later |
| --- | ------------------------------ | ---- | --- | ----- |
| 1   | Foundations of Computing       | 5    | 0   | 0     |
| 2   | Languages & Paradigms          | 5    | 1   | 1     |
| 3   | Computational Theory           | 5    | 0   | 1     |
| 4   | Data Structures                | 9    | 1   | 1     |
| 5   | Algorithms                     | 9    | 1   | 1     |
| 6   | Operating Systems              | 11   | 1   | 1     |
| 7   | Computer Networks              | 9    | 1   | 1     |
| 8   | Databases                      | 6    | 1   | 0     |
| 9   | Security                       | 7    | 2   | 1     |
| 10  | Distributed Systems            | 10   | 1   | 1     |
| 11  | System Design                  | 8    | 1   | 1     |
| 12  | Cloud Computing                | 6    | 1   | 1     |
| 13  | Software Engineering Practices | 5    | 2   | 0     |

**~105 core concept pages** before [opt]/[later] expansion.

---

## Phased build plan (matches the reading order above)

**Phase 1:** Foundations → Languages & Paradigms → Computational Theory → Data Structures → Algorithms
**Phase 2:** Operating Systems → Computer Networks → Databases
**Phase 3:** Security → Distributed Systems
**Phase 4:** System Design → Cloud Computing
**Phase 5:** Software Engineering Practices
