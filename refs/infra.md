# Hardware Knowledge Base — Full Content Plan

Covers the physical/architectural layer that sits beneath CS's Operating Systems and Networking sections. Cross-links go both ways: CS covers scheduling, virtual memory, and protocols from the software/conceptual side; Hardware covers the physical mechanisms those concepts run on. Deliberately avoid re-teaching what CS already owns — link to it instead.

**Build/reading order:**

1. Digital Logic & Circuits
2. Computer Organization
3. CPU Architecture
4. Memory Hierarchy & Caching
5. Storage
6. Networking Hardware
7. GPUs & Parallel Architectures _(last — sets up `scaffold-dl`'s hardware needs directly)_

Tags: **[opt]** = included but lower priority. **[later]** = deferred.

---

## 1. Digital Logic & Circuits

1. **Transistors as switches** — the physical basis of every gate, built from almost nothing
2. **Logic gates from transistors** — CMOS gate construction, why gates are the atoms of hardware
3. **Boolean algebra to circuits** — turning a truth table into an actual circuit _(ties to `math:foundations:logic`, `cs:foundations:boolean-logic` — this page is where logic becomes physical)_
4. **Combinational circuits** — adders (half/full), multiplexers, decoders
5. **Sequential circuits** — flip-flops, latches, registers — circuits with memory
6. **Clock signals and synchronous design** — why a clock exists, setup/hold time intuition
7. **Finite state machines in hardware** — the physical realization of what `cs:computational-theory:finite-automata` describes abstractly
8. [opt] **Circuit minimization** — Karnaugh maps, why fewer gates matters
9. [later] **VLSI design basics** — from gate-level design to an actual chip

**Interactive:** logic gate builder (wire gates together, watch signals propagate), adder circuit step-through (binary addition happening gate by gate), FSM-in-hardware demo (the same traffic-light FSM from Computational Theory, now shown as flip-flops and gates).

---

## 2. Computer Organization

1. **Von Neumann vs. Harvard architecture** — shared vs. separate instruction/data memory
2. **System buses** — address bus, data bus, control bus — how components actually talk
3. **I/O interfacing** — how peripherals connect to the rest of the system
4. **Interrupts at the hardware level** — the physical/electrical side of what `cs:os:io-management` covers conceptually
5. [opt] **Embedded systems basics** — microcontrollers vs. general-purpose CPUs, resource constraints

**Interactive:** bus transaction visualizer (watch an address go out, data come back, step by step), Von Neumann vs. Harvard side-by-side (same instruction fetch, different memory paths highlighted).

---

## 3. CPU Architecture

1. **Instruction Set Architectures (ISA)** — RISC vs. CISC, what an ISA actually specifies
2. **CPU components** — ALU, control unit, register file
3. **The datapath** — how an instruction physically flows from fetch to writeback
4. **Pipelining** — pipeline stages, why pipelining increases throughput
5. **Pipeline hazards** — structural, data, and control hazards — and how each is handled
6. **Branch prediction** — why control hazards are expensive, how prediction mitigates them
7. **Out-of-order execution and superscalar processors** — extracting more parallelism than a simple pipeline allows
8. **Instruction-level parallelism** — the general idea tying pipelining, superscalar, and OOO together
9. [opt] **Microcode** — when instructions are themselves implemented as tiny programs
10. [later] **Exotic architectures** — VLIW, dataflow architectures

**Interactive:** pipeline visualizer (watch instructions move through fetch/decode/execute/memory/writeback stages, hazards highlighted in red when they occur), branch predictor demo (a loop runs, watch prediction accuracy improve as the predictor learns the pattern), datapath walkthrough (a single instruction, traced through every component it touches).

---

## 4. Memory Hierarchy & Caching

1. **Why the memory hierarchy exists** — the speed/cost/capacity triangle, no single memory type wins on all three
2. **Cache basics** — cache lines, hits/misses, direct-mapped vs. set-associative vs. fully-associative
3. **Cache replacement policies** — LRU and friends, at the hardware level _(the same ideas as `cs:os:page-replacement`, applied one layer lower)_
4. **Cache coherence** — the MESI protocol, why multicore systems need it at all
5. **Main memory** — DRAM vs. SRAM, why caches use SRAM and main memory uses DRAM
6. **Memory controllers** — how the CPU actually talks to RAM
7. **Virtual memory at the hardware level** — TLBs, page table walks — the hardware support beneath `cs:os:virtual-memory`
8. [opt] **Prefetching** — predicting future accesses to hide memory latency
9. [later] **Non-volatile memory technologies** — where persistent and working memory are starting to blur

**Interactive:** cache hit/miss simulator (a sequence of memory accesses, watch which hit and which miss under different cache configurations), cache coherence visualizer (multiple cores, watch MESI states change as each reads/writes a shared line), memory hierarchy latency ladder (a visual scale showing register → L1 → L2 → L3 → RAM → disk access times, which are wildly non-intuitive until seen side by side).

---

## 5. Storage

1. **The storage hierarchy** — from registers down to disk, continuing the ladder from Memory Hierarchy
2. **HDD vs. SSD** — how each physically stores and retrieves data
3. **Storage interfaces** — SATA, NVMe — conceptually, what changed and why NVMe is faster
4. **RAID** — redundancy and performance tradeoffs across RAID levels
5. [opt] **How a file system maps to physical storage** — the hardware-facing half of `cs:os:file-systems`
6. [later] **Storage area networks** — storage as a shared network resource

**Interactive:** HDD vs. SSD access-pattern comparison (sequential vs. random reads, why SSDs don't suffer from seek time), RAID level visualizer (same data, different RAID configurations, see what survives a drive failure).

---

## 6. Networking Hardware

_(The physical layer beneath `cs:computer-networks`, which covers protocols and logical behavior — this section is the wires, radios, and switches themselves.)_

1. **Physical transmission media** — copper, fiber optics, wireless — tradeoffs in speed, distance, interference
2. **Network interface cards, switches, and routers** — what each piece of hardware actually does, physically
3. **Bandwidth, latency, and throughput** — the physical constraints behind the numbers quoted in `cs:computer-networks`
4. [opt] **Wireless technology basics** — WiFi standards at a conceptual level, why newer standards are faster
5. [later] **Data center networking topologies** — spine-leaf and similar architectures at scale

**Interactive:** transmission medium comparison (same data, copper vs. fiber vs. wireless, latency/bandwidth visualized side by side), network hardware path (a packet's physical journey through a NIC → switch → router, distinct from the protocol-level journey already shown in CS's Networking section).

---

## 7. GPUs & Parallel Architectures

_(Placed last deliberately — this section's content is what `scaffold-dl` will lean on most directly.)_

1. **Why GPUs are architecturally different** — SIMD/SIMT, thousands of simple cores vs. few powerful ones
2. **GPU architecture** — cores, warps/wavefronts, the GPU's own memory hierarchy
3. **CPU vs. GPU workloads** — what makes a workload parallelizable enough to benefit
4. **Multicore CPUs** — symmetric multiprocessing, shared memory, cache coherence revisited at the multicore level
5. **Interconnects** — how multiple cores or GPUs actually communicate with each other
6. **Tensor cores and specialized AI hardware** — purpose-built matrix-multiply acceleration, the direct hardware story behind why DL got fast
7. [opt] **SIMD instructions on CPUs** — vectorization before you even reach a GPU
8. [opt] **Supercomputer architecture** — clusters of nodes, high-speed interconnects (InfiniBand-style, conceptually), how a supercomputer differs from "just a lot of GPUs" — what coordination and scheduling at that scale actually requires
9. [later] **Multi-GPU and distributed training hardware** — the hardware considerations `scaffold-applied-dl` will eventually reference directly
10. **Quantum Computers** — does that fit here?

**Interactive:** SIMD vs. scalar execution comparison (the same operation, one element at a time vs. many at once, visualized), GPU warp execution visualizer (threads grouped into warps, watch divergence cost appear when threads in a warp take different branches), CPU-vs-GPU workload chooser (given a task, see why it maps well or poorly to each architecture).

---

## Cross-cutting

A **latency numbers reference page** — the famous "latency numbers every programmer should know" table (register access, L1/L2/L3, RAM, SSD, disk, network round-trip) as a standalone, frequently-revisited reference, linked from Memory Hierarchy, Storage, and Networking Hardware alike.

---

## Summary counts

| #   | Section                       | Core | Opt | Later |
| --- | ----------------------------- | ---- | --- | ----- |
| 1   | Digital Logic & Circuits      | 7    | 1   | 1     |
| 2   | Computer Organization         | 4    | 1   | 0     |
| 3   | CPU Architecture              | 8    | 1   | 1     |
| 4   | Memory Hierarchy & Caching    | 7    | 1   | 1     |
| 5   | Storage                       | 4    | 1   | 1     |
| 6   | Networking Hardware           | 3    | 1   | 1     |
| 7   | GPUs & Parallel Architectures | 6    | 2   | 1     |

**~39 core concept pages** before [opt]/[later] — smaller than Math or CS by design, since Hardware is a more contained discipline and a lot of its surface area is intentionally cross-linked to CS rather than duplicated.

---

## Why this ordering

Digital Logic and Computer Organization first, since CPU Architecture doesn't make sense until gates/circuits and buses are established. CPU Architecture before Memory Hierarchy, since caching only matters once you understand _why_ a CPU needs fast memory close by. Storage and Networking Hardware are mostly standalone and could technically swap order. GPUs last and deliberately positioned as the bridge into `scaffold-dl` — by the time a reader reaches this section, they have the CPU/memory/parallelism vocabulary needed for "why GPUs look nothing like CPUs" to actually land.
