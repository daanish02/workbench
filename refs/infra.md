# Hardware Knowledge Base — Full Content Plan

Covers the physical/architectural layer that sits beneath CS's Operating Systems and Networking sections. Cross-links go both ways: CS covers scheduling, virtual memory, and protocols from the software/conceptual side; Hardware covers the physical mechanisms those concepts run on. Deliberately avoid re-teaching what CS already owns — link to it instead.

## Writing checklist (added 2026-10-18, read before each section)

- Every note, including the ones marked _(new)_ below, already exists as a placeholder stub (body `_Placeholder..._`) with its short title, description and `order` set (2026-10-18; orders follow the suggested order in each section). Overwrite stubs in place; do not create new files or renumber unless a note is added or dropped. Slugs are the old long ones (e.g. `why-gpus-are-architecturally-different` is titled "Why GPUs Differ"); keep them unless one is misleading.
- Titles: at most 3 words ("X and Y" / "X & Y" counts as 3). The short titles listed per section below are already applied to the stubs.
- `##` headings at most 5 words.
- Do NOT re-teach, link instead: `cs/foundations/{boolean-logic,number-representation,fetch-execute-cycle}`, `cs/theory/finite-automata`, `cs/operating-systems/{virtual-memory,page-replacement,io-management,file-systems,context-switching,synchronization}`, `cs/networks/{link-layer,network-models}`, `cs/appendix/latency-numbers`, `cs/system-design/scalability` (Amdahl's law is already there).
- Python: simulators are the natural code here (gate sims, cache sims, pipeline timing, branch predictors, RAID parity, roofline). Seeded, standalone, real output; run `uv run scripts/check_notes.py infra`.
- Use real, sourced numbers (cache sizes, latencies, bandwidths) and name the chip and year they come from; hardware numbers age fast.
- Each section: at least one stepper or simulator figure, per the Interactive lists below.

## 1. Digital Logic & Circuits

1. **Transistors as switches** — the physical basis of every gate, built from almost nothing
2. **Logic gates from transistors** — CMOS gate construction, why gates are the atoms of hardware
3. **Boolean algebra to circuits** — turning a truth table into an actual circuit _(ties to `math/foundations/propositional-logic`, `cs/foundations/boolean-logic` — this page is where logic becomes physical)_
4. **Combinational circuits** — adders (half/full), multiplexers, decoders
5. **Sequential circuits** — flip-flops, latches, registers — circuits with memory
6. **Clock signals and synchronous design** — why a clock exists, setup/hold time intuition
7. **Finite state machines in hardware** — the physical realization of what `cs/theory/finite-automata` describes abstractly
8. **Circuit minimization** — Karnaugh maps, why fewer gates matters
9. **VLSI design basics** — from gate-level design to an actual chip [Chip Design]
10. **Power and heat** _(new)_ — dynamic power ∝ C·V²·f, leakage, end of Dennard scaling, dark silicon, why clocks stalled near 4–5 GHz and multicore happened. [Power & Thermals]

Short titles: Transistors as Switches → "Transistor Switches", Logic Gates from Transistors → "CMOS Gates", Boolean Algebra to Circuits → "Logic to Circuits", Clock Signals and Synchronous Design → "Clocks & Timing", Finite State Machines in Hardware → "Hardware FSMs".
Also cover: arithmetic beyond the adder (ripple vs carry-lookahead, shifters, multipliers) and propagation delay / critical path, which sets clock speed and motivates pipelining.

**Interactive:** logic gate builder (wire gates together, watch signals propagate), adder circuit step-through (binary addition happening gate by gate), FSM-in-hardware demo (the same traffic-light FSM from Computational Theory, now shown as flip-flops and gates).

---

## 2. Computer Organization

1. **Von Neumann vs. Harvard architecture** — shared vs. separate instruction/data memory
2. **System buses** — address bus, data bus, control bus — how components actually talk
3. **I/O interfacing** — how peripherals connect to the rest of the system
4. **Interrupts at the hardware level** — the physical/electrical side of what `cs/operating-systems/io-management` covers conceptually
5. **Embedded systems basics** — microcontrollers vs. general-purpose CPUs, resource constraints
6. **Assembly and calling conventions** _(new)_ — what compiled code looks like: registers, stack frames, call/return, one C function in RISC-V or x86-64; bridge from `cs/languages/compilers-and-interpreters`. [Machine Code]
7. **Boot and firmware** _(new)_ — reset vector, BIOS/UEFI, bootloader, handoff to the kernel; ties to `cs/operating-systems/kernel-architecture`. [Boot Process]

Short titles: Von Neumann vs. Harvard → "Von Neumann Architecture" (covers Harvard too), Interrupts at the Hardware Level → "Hardware Interrupts", Embedded Systems Basics → "Embedded Systems".
Also cover in I/O Interfacing: memory-mapped vs port I/O, polling vs interrupts vs DMA, PCIe as the modern bus (lanes, generations), and ADCs/DACs, the boundary where the analog world (sensors, audio, radio) becomes bits; link `math/signals-fourier/sampling` for the sampling theory.

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
9. **Microcode** — when instructions are themselves implemented as tiny programs
10. **Exotic architectures** — VLIW, dataflow architectures
11. **Measuring CPU performance** _(new, place right after CPU components)_ — the iron law (time = instructions × CPI × clock period), IPC, why GHz alone misleads, benchmarks (SPEC) and their traps. [CPU Performance]
12. **Floating point hardware** _(new)_ — IEEE 754 layout, rounding, denormals, FMA, then FP16 / BF16 / FP8 / INT8 range-vs-precision trade-offs; feeds DL directly. Link `cs/foundations/number-representation` for integers. [Floating-Point Hardware]
13. **Speculation attacks** _(new, capstone)_ — Spectre and Meltdown: why speculation leaks through cache timing, mitigations and their cost. Rowhammer can go here or in Main Memory. [Hardware Security]
14. **Hardware virtualization** _(new)_ — VT-x/AMD-V, nested page tables, IOMMU; links to `cs/cloud/vms-vs-containers`. [Hardware Virtualization]

Short titles: Instruction Set Architectures → "Instruction Sets" (x86 vs ARM vs RISC-V today), Out-of-Order Execution and Superscalar Processors → "Out-of-Order Execution", Instruction-Level Parallelism → "Instruction Parallelism" (consider merging into OoO: it overlaps pipelining + superscalar), The Datapath → "The Datapath".

**Interactive:** pipeline visualizer (watch instructions move through fetch/decode/execute/memory/writeback stages, hazards highlighted in red when they occur), branch predictor demo (a loop runs, watch prediction accuracy improve as the predictor learns the pattern), datapath walkthrough (a single instruction, traced through every component it touches).

---

## 4. Memory Hierarchy & Caching

_Status 2026-10-22: written 1–5 (Memory Hierarchy, Cache Basics, Cache Replacement, Cache Coherence, Main Memory), each with a figure. Still stubs: 6 Memory Controllers, 7 TLBs & Paging, 8 Prefetching, 9 Non-Volatile Memory, 10 Memory Ordering, 11 Cache-Friendly Code. Then Appendix (glossary, spec-sheets, units-and-magnitudes). In TLBs & Paging, add a short "page not in RAM" section: the hardware side of a page fault and what swap costs on SSD vs HDD (numbers from Storage Hierarchy); the OS side of swap is already in `cs/operating-systems/virtual-memory`, link it._

1. **Why the memory hierarchy exists** — the speed/cost/capacity triangle, no single memory type wins on all three
2. **Cache basics** — cache lines, hits/misses, direct-mapped vs. set-associative vs. fully-associative
3. **Cache replacement policies** — LRU and friends, at the hardware level _(the same ideas as `cs/operating-systems/page-replacement`, applied one layer lower)_
4. **Cache coherence** — the MESI protocol, why multicore systems need it at all
5. **Main memory** — DRAM vs. SRAM, why caches use SRAM and main memory uses DRAM
6. **Memory controllers** — how the CPU actually talks to RAM
7. **Virtual memory at the hardware level** — TLBs, page table walks — the hardware support beneath `cs/operating-systems/virtual-memory`
8. **Prefetching** — predicting future accesses to hide memory latency
9. **Non-volatile memory technologies** — where persistent and working memory are starting to blur
10. **Memory ordering and atomics** _(new)_ — store buffers, why hardware reorders, x86 TSO vs ARM weak ordering, fences, compare-and-swap / LL-SC; the hardware under `cs/operating-systems/synchronization`. [Memory Ordering]
11. **Cache-friendly code** _(new, practical)_ — locality, row vs column traversal, struct-of-arrays, false sharing; show with a simulated cache in Python (miss counts, no timings). Could instead close Cache Basics. [Cache-Friendly Code]

Short titles: Why the Memory Hierarchy Exists → "Memory Hierarchy", Cache Replacement Policies → "Cache Replacement", Virtual Memory at the Hardware Level → "TLBs & Paging", Non-Volatile Memory Technologies → "Non-Volatile Memory".
Also cover: HBM (stacked DRAM beside GPUs) in Main Memory, since the GPU section leans on it; CXL memory expansion in Non-Volatile Memory or Interconnects.

**Interactive:** cache hit/miss simulator (a sequence of memory accesses, watch which hit and which miss under different cache configurations), cache coherence visualizer (multiple cores, watch MESI states change as each reads/writes a shared line), memory hierarchy latency ladder (a visual scale showing register → L1 → L2 → L3 → RAM → disk access times, which are wildly non-intuitive until seen side by side).

---

## 5. Storage

1. **The storage hierarchy** — the tiers below RAM (NVMe, SATA SSD, HDD, tape, cloud archive), cost per GB against latency, hot/warm/cold tiering
2. **Hard drives** _(split from HDD vs SSD, 2026-10-22)_ — platters, heads, seek and rotational latency, CMR vs SMR, HAMR
3. **Flash and SSDs** _(split from HDD vs SSD, slug renamed to `flash-and-ssds`)_ — NAND cells SLC to QLC, pages vs erase blocks, FTL, garbage collection, write amplification, wear levelling, TRIM, SLC cache
4. **Storage interfaces** — SATA/AHCI vs NVMe queues, SAS, PCIe lanes, form factors (M.2, U.2, EDSFF)
5. **Storage performance** _(new, 2026-10-22)_ — IOPS vs throughput vs latency, queue depth, Little's law, random vs sequential, tail latency, reading fio output
6. **RAID** — RAID 0/1/5/6/10, XOR parity, rebuild time, write penalty, erasure coding at scale
7. **How a file system maps to physical storage** — LBA, sector sizes, alignment, the durability chain (page cache, drive cache, media), fsync, FUA, power-loss protection [Blocks to Files]
8. **Drive failures** _(new, advanced, 2026-10-22)_ — AFR from fleet statistics, UBER and rebuild risk, bit rot, checksums, scrubbing, SMART; ends with "RAID is not a backup": 3-2-1-1-0 rule, RPO/RTO, independent vs correlated copies
9. **Storage area networks** — iSCSI, Fibre Channel, NVMe-oF, NFS/SMB, distributed storage [SAN & NAS]

Do not re-teach: `cs/operating-systems/file-systems` (inodes, allocation, journaling), `cs/cloud/storage-models` (block/file/object), `cs/databases/storage-engines` (WAL, B-tree, LSM).

**Interactive:** HDD vs. SSD access-pattern comparison (sequential vs. random reads, why SSDs don't suffer from seek time), RAID level visualizer (same data, different RAID configurations, see what survives a drive failure).

---

## 6. Networking Hardware

_(The physical layer beneath `cs/networks`, which covers protocols and logical behavior — this section is the wires, radios, and switches themselves.)_

1. **Physical transmission media** — copper, fiber optics, wireless — tradeoffs in speed, distance, interference
2. **Bandwidth, latency, and throughput** — the physical constraints behind the numbers quoted in `cs/networks` (moved before the device notes: store-and-forward delay needs serialization delay first)
3. **Network interface cards** — PHY/MAC/SerDes, DMA descriptor rings, interrupt coalescing, offloads (checksum, TSO, RSS) _(split out 2026-10-22)_
4. **Hubs and switches** _(new, split out 2026-10-22)_ — repeaters and hubs as layer 1, collision domains, bridges, switching ASICs, CAM tables, store-and-forward vs cut-through, buffers
5. **Routers** _(new, split out 2026-10-22)_ — control plane vs data plane hardware, TCAM for longest-prefix match, line cards and fabric, what a home router contains; pitfall: routers answer ping (ICMP) from the slow, rate-limited control-plane CPU, so a mid-path hop can show high or missing replies while forwarding fine
6. **Wireless technology basics** — WiFi standards at a conceptual level, why newer standards are faster
7. **Data center networking topologies** — spine-leaf and similar architectures at scale
8. **RDMA and SmartNICs** _(new)_ — kernel bypass, RDMA/RoCE, DPUs offloading networking and storage; leads into InfiniBand in GPUs & Parallelism. [RDMA & SmartNICs]

Short titles: Physical Transmission Media → "Transmission Media" (include signal encoding, NRZ vs PAM4), Network Interface Cards → "Network Interface Cards", plus "Hubs & Switches" (cut-through vs store-and-forward, ASIC forwarding tables) and "Routers", Bandwidth, Latency, and Throughput → "Bandwidth & Latency" (bandwidth-delay product; link `cs/appendix/latency-numbers`), Wireless Technology Basics → "Wireless Basics", Data Center Networking Topologies → "Data Center Topologies".

**Interactive:** transmission medium comparison (same data, copper vs. fiber vs. wireless, latency/bandwidth visualized side by side), network hardware path (a packet's physical journey through a NIC → switch → router, distinct from the protocol-level journey already shown in CS's Networking section).

---

## 7. GPUs & Parallel Architectures

_(Placed last deliberately — this section's content is what the `dl` area will lean on most directly.)_

1. **Why GPUs are architecturally different** — SIMD/SIMT, thousands of simple cores vs. few powerful ones
2. **GPU architecture** — cores, warps/wavefronts, the GPU's own memory hierarchy
3. **CPU vs. GPU workloads** — what makes a workload parallelizable enough to benefit
4. **Multicore CPUs** — symmetric multiprocessing, shared memory, cache coherence revisited at the multicore level
5. **Interconnects** — how multiple cores or GPUs actually communicate with each other
6. **Tensor cores and specialized AI hardware** — purpose-built matrix-multiply acceleration, the direct hardware story behind why DL got fast
7. **SIMD instructions on CPUs** — vectorization before you even reach a GPU
8. **Supercomputer architecture** — clusters of nodes, high-speed interconnects (InfiniBand-style, conceptually), how a supercomputer differs from "just a lot of GPUs" — what coordination and scheduling at that scale actually requires
9. **Multi-GPU and distributed training hardware** — the hardware considerations the `applied-dl` area will eventually reference directly
10. ~~**Quantum Computers**~~ — moved to its own section, 8. Unconventional Computing.
11. **FPGAs and ASICs** _(new)_ — reconfigurable logic (LUTs, routing), when an FPGA beats a GPU (latency, custom bit widths), ASICs/TPUs as the endpoint; links back to Digital Logic. [FPGAs & ASICs]
12. **Roofline model** _(new, high value)_ — arithmetic intensity (FLOPs per byte), compute-bound vs memory-bound, why matmul is fast and elementwise ops are not; the bridge to DL performance. Could be a section of CPU vs GPU instead. [Roofline Model]
13. **GPU programming model** _(new)_ — kernels, grid/block/thread, shared memory, coalesced access, occupancy; one tiny CUDA-style kernel explained via a Python simulation. [GPU Programming]

Suggested order: Why GPUs Differ, GPU Architecture, GPU Programming, Roofline Model, CPU vs GPU, SIMD on CPUs, Multicore CPUs, AI Accelerators (tensor cores, TPUs), FPGAs & ASICs, Interconnects (PCIe, NVLink, CXL, InfiniBand), Multi-GPU Training, Supercomputers. Section could be renamed "Parallel & Accelerators".
Short titles: Why GPUs Are Architecturally Different → "Why GPUs Differ", CPU vs. GPU Workloads → "CPU vs GPU", SIMD Instructions on CPUs → "SIMD on CPUs", Tensor Cores and Specialized AI Hardware → "AI Accelerators", Supercomputer Architecture → "Supercomputers", Multi-GPU and Distributed Training Hardware → "Multi-GPU Training" (data/tensor/pipeline parallelism only as hardware traffic; the algorithms belong to DL).

**Interactive:** SIMD vs. scalar execution comparison (the same operation, one element at a time vs. many at once, visualized), GPU warp execution visualizer (threads grouped into warps, watch divergence cost appear when threads in a warp take different branches), CPU-vs-GPU workload chooser (given a task, see why it maps well or poorly to each architecture).

---

## 8. Unconventional Computing _(new section, 2026-10-18)_

_(Everything before this is digital, von Neumann-style computing. This section covers machines that compute differently. Survey depth: what each one is, the physics it exploits, what it is good and bad at, and where it stands today. Name chosen over "Emerging Hardware", which dates; avoid "new"/"recent"/"future" wording in the notes for the same reason, and date any status claims ("as of 2026").)_

1. **Analog computing** — computing with continuous voltages: op-amp adders and integrators, differential analyzers, solving an ODE by wiring it up; why digital won (noise, precision, programmability) and why analog is back for AI. [Analog Computing]
2. **Compute-in-memory** — doing matrix-vector multiplies inside memory arrays (resistive crossbars, Ohm's and Kirchhoff's laws as multiply-add), escaping the memory wall from `memory-hierarchy`. [Compute-in-Memory]
3. **Neuromorphic computing** — spiking neurons, event-driven chips (Loihi, TrueNorth, SpiNNaker), energy per spike vs per FLOP. [Neuromorphic Computing]
4. **Photonic computing** — computing with light: interferometer meshes for matmul, optical interconnects vs optical compute, what limits it (conversion, nonlinearity). [Photonic Computing]
5. **Quantum computing** — qubits, superposition, measurement, gates and circuits; simulate a 1–2 qubit circuit with numpy. Link `math/linear-algebra` for the vectors and unitary matrices. [Quantum Computing]
6. **Quantum algorithms** — Deutsch–Jozsa intuition, Grover (quadratic speedup), Shor (why RSA is at risk, link `cs/security/cryptography`), and why most problems get no speedup. [Quantum Algorithms]
7. **Quantum hardware** — superconducting, trapped-ion and photonic qubits, decoherence, error rates, error correction and logical vs physical qubits (link `math/information-theory/error-correction`). [Quantum Hardware]
8. **Other paradigms** — DNA/molecular, reversible, probabilistic and stochastic computing, in one survey note. [Other Paradigms]

**Interactive:** analog integrator (dial in an ODE, watch the voltage curve vs the exact solution, add noise), crossbar matmul (set conductances and input voltages, read output currents), spiking neuron (input current in, spikes out, threshold slider), qubit on the Bloch sphere (apply gates, see measurement probabilities), Grover amplitude stepper (Step / Auto / Reset).

---

## Cross-cutting

A **latency numbers reference page** — the famous "latency numbers every programmer should know" table (register access, L1/L2/L3, RAM, SSD, disk, network round-trip) as a standalone, frequently-revisited reference, linked from Memory Hierarchy, Storage, and Networking Hardware alike.
→ Already exists as `cs/appendix/latency-numbers`. Link to it; do not duplicate.

**Appendix** section for infra (last section; stubs exist) (same FilterTable pattern as the CS appendix): hardware glossary (ALU, TLB, HBM, NVLink, CPI, …), units and orders of magnitude (GB vs GiB, Gb/s vs GB/s, FLOPS), and how to read a CPU/GPU/SSD spec sheet.
