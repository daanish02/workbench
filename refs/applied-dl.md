# Applied DL Knowledge Base — Full Content Plan

Covers the three true modalities built on top of `scaffold-dl`'s architectures: LLMs/NLP, Vision/VLMs, and Audio. (RL and Recommenders moved to `scaffold-dl` itself, since both are general techniques rather than domain-specific modalities — see the DL KB plan's boundary note.) Everything here assumes `scaffold-dl`'s Transformer, CNN, and generative-model sections as prerequisites rather than re-deriving them.


## Writing checklist (coverage review 2026-10-18, read before each section)

- Every note below, including the ones marked _(new)_, already exists as a placeholder stub (body `_Placeholder. Content not written yet._`) with a short title (at most 3 words), description and `order`. Overwrite stubs in place; do not create files or renumber unless a note is added or dropped. Slugs are the old long ones; keep them.
- `##` headings at most 5 words. Python blocks standalone with real output; run `uv run scripts/check_notes.py applied-dl`.
- Link instead of re-teaching: math (`linear-algebra`, `calculus`, `probability`, `statistics`, `optimization`, `information-theory`), CS, and Hardware (`infra/...`) notes already cover the foundations named below.

---

## 1. NLP Foundations

1. **Text preprocessing and tokenization** — word-level vs. subword tokenization (BPE, WordPiece, SentencePiece)
2. **Word embeddings** — Word2Vec, GloVe, why a learned vector beats one-hot encoding _(conceptual echo of the embedding idea from `scaffold-dl`'s recommender section, now applied to words)_
3. **The limits of static embeddings** — polysemy, context-independence — the exact gap that motivates contextual models
4. **Classic NLP tasks** — POS tagging, named entity recognition, sentiment analysis — the pre-transformer task landscape
5. **Language modeling** — what "predicting the next token" means, n-gram models as a simple baseline before transformers existed
6. **Sequence labeling** — conditional random fields, conceptually

**Interactive:** tokenizer playground (type text, watch it split into subword tokens live, vocabulary size adjustable), word embedding space visualizer (project word vectors into 2D, watch analogies like king–man+woman≈queen actually work geometrically).

---

## 2. Large Language Models — Architecture & Pretraining

1. **From Transformer to LLM** — stacking decoder-only transformer blocks, causal masking _(directly builds on `scaffold-dl:attention-transformers`)_
2. **Pretraining objectives** — autoregressive next-token prediction vs. masked language modeling (BERT-style), contrasted directly
3. **Tokenization at LLM scale** — vocabulary size tradeoffs, how this differs from Section 1's introduction
4. **Scaling laws** — how loss improves predictably with more data, parameters, and compute
5. **Emergent abilities** — capabilities that appear only past a certain scale, and the live debate over whether these are real discontinuities or measurement artifacts
6. **Context windows at scale** — extending beyond `scaffold-dl`'s positional encoding basics to the techniques that let modern context windows grow so large

**Interactive:** scaling law plotter (adjust compute/data/params, watch predicted loss move along the scaling curve), causal masking visualizer (show exactly which tokens a given position can and can't attend to, contrasted with a non-causal transformer).

---

## 3. LLM Adaptation & Alignment

1. **Fine-tuning** — full fine-tuning vs. parameter-efficient methods (LoRA, adapters)
2. **Instruction tuning** — what actually turns a base model into one that follows instructions
3. **RLHF** — reward modeling, applying RL to language generation, why alignment needs human feedback at all
4. **DPO and alternatives to RLHF** — simplifying the alignment pipeline
5. **In-context learning and prompting** — few-shot prompting, chain-of-thought, why prompting works without any weight updates
6. **Evaluating LLMs** — benchmarks and their limitations, hallucination as a measurable and still-unsolved problem

**Interactive:** LoRA vs. full fine-tuning comparison (parameter count and what actually gets updated, visualized side by side), prompting strategy comparison (the same question, zero-shot vs. few-shot vs. chain-of-thought, responses and reasoning paths shown together).

---

## 4. LLM Systems & Applications

1. **Retrieval-Augmented Generation (RAG)** — grounding generation in external knowledge rather than relying on parametric memory alone
2. **Embeddings for retrieval** — dense retrieval, vector databases at a conceptual level
3. **Mixture of Experts** — sparse activation, how it changes the scaling story from Section 2

**Interactive:** RAG pipeline visualizer (a query, watch it get embedded, matched against a document store, and the retrieved context get injected into the prompt — the whole pipeline as one animated flow).

---

## 5. Agentic Systems

_(Promoted from a single bullet to a full section — this is the fastest-growing part of the field right now, and compressing tool use, planning, memory, and multi-agent coordination into one concept page undersold how much is actually here. Builds directly on Section 3's in-context learning/prompting and Section 4's RAG.)_

1. **What makes a system "agentic"** — autonomy, tool use, and planning, contrasted directly with a single prompt-response call
2. **Tool use and function calling** — how a model decides to call a tool, structured output formats
3. **Planning and reasoning loops** — ReAct, reflection/self-critique, extending chain-of-thought (Section 3) into action
4. **Memory in agents** — context-window memory vs. long-term, vector-store-backed memory _(directly reuses Section 4's retrieval/embeddings)_
5. **Multi-agent systems** — coordination, delegation, agents critiquing or checking each other's work
6. **Agent architectures compared** — single-agent loop vs. orchestrator-worker vs. multi-agent, tradeoffs between them
7. **Evaluating agents** — why this is harder than evaluating a single LLM response, what current benchmarks actually measure
8. **Agent safety and guardrails** — sandboxing, permission boundaries, preventing runaway or unintended actions
9. **Specific agent domains** — coding agents, computer-use/browser agents, research agents — explicitly flagged as the single fastest-moving, most likely-to-need-rewriting content in the entire KB family, even relative to the rest of Applied DL

**Interactive:** agent tool-use trace (step through an agent's reasoning → tool call → observation → next-reasoning-step loop on a concrete task — this is the demo that was originally sketched for the old single bullet, now with room to actually do it justice), multi-agent coordination visualizer (two or three agents passing a task between them, each one's reasoning shown as the task moves through delegation and critique).

---

## 6. Computer Vision — Core Tasks

_(Builds on `scaffold-dl:convolutional-neural-networks` — this section is task-framed rather than architecture-framed.)_

1. **Image classification, revisited** — now framed as a task with real datasets/benchmarks rather than an architecture walkthrough
2. **Object detection** — bounding boxes, region proposals, single-shot detectors (YOLO-style) at a conceptual level
3. **Semantic and instance segmentation** — pixel-level understanding, the distinction between the two
4. **Image generation in practice** — revisiting `scaffold-dl`'s GAN/diffusion foundations, now as applied generation pipelines (text-to-image, inpainting)

**Interactive:** object detection demo (an image, bounding boxes appear with confidence scores, adjustable detection threshold), segmentation mask overlay (toggle between semantic and instance segmentation on the same image to make the distinction concrete).

---

## 7. Modern Vision Architectures

1. **Vision Transformers (ViT)** — applying the Transformer architecture to images via patch embeddings
2. **ViT vs. CNN** — inductive bias tradeoffs, when each architecture actually wins
3. **Self-supervised vision** — contrastive learning (SimCLR-style), masked image modeling — the vision-specific analog of Section 1's "why self-supervision matters" idea from `scaffold-ml`
4. **Vision model scaling** — a vision-specific echo of Section 2's LLM scaling laws

**Interactive:** image-to-patches visualizer (watch an image get sliced into patches and embedded, exactly mirroring tokenization for text), ViT vs. CNN attention/activation comparison (what each architecture "looks at" on the same image).

---

## 8. Vision-Language Models

1. **Multimodal representation learning** — the core challenge: getting image and text into a shared embedding space at all
2. **CLIP** — contrastive image-text pretraining, zero-shot classification via text prompts — genuinely one of the most elegant ideas in the whole KB
3. **VLM architectures** — how image and text encoders actually get fused (cross-attention, early fusion, and other patterns)
4. **Visual question answering and captioning** — concrete, groundable VLM tasks
5. **Video-language models** — extending VLMs into temporal data

**Interactive:** CLIP zero-shot demo (an image, a set of candidate text labels, watch similarity scores update live — showing classification happening with no task-specific training at all), shared embedding space visualizer (images and their captions projected into the same 2D space, showing matching pairs land close together).

---

## 9. Audio & Speech Foundations

1. **Audio as data** — waveforms, sampling rate, the physical signal itself _(ties directly to `math:signals-fourier`)_
2. **Spectrograms** — turning audio into an image-like representation via the Fourier transform — the bridge that lets vision techniques apply to audio at all
3. **Feature extraction for audio** — MFCCs, mel spectrograms
4. **Audio data augmentation** — pitch shift, time stretch, noise injection

**Interactive:** waveform-to-spectrogram visualizer (play an audio clip, watch its spectrogram build live — the single best "aha, audio is secretly an image" moment available), MFCC feature extraction step-through.

---

## 10. Speech & Audio Deep Learning

1. **Automatic speech recognition (ASR)** — the sequence-to-sequence framing, CTC loss _(builds directly on `scaffold-dl:recurrent-neural-networks`/Transformers)_
2. **Text-to-speech (TTS)** — generating audio from text, the role of a vocoder
3. **Speaker identification and diarization** — who's speaking, and when
4. **Music and audio generation** — applying `scaffold-dl`'s generative models (GANs, diffusion) directly to audio
5. **Real-time and streaming audio models** — the added constraints of low-latency inference

**Interactive:** ASR alignment visualizer (audio waveform aligned against the predicted transcript, showing where CTC collapses repeated predictions into final tokens), TTS pipeline walkthrough (text → predicted spectrogram → vocoder → audio, shown as one animated flow mirroring the RAG pipeline visual from Section 4).

---

## Coverage review _(2026-10-18)_

Stubs exist for everything here.

**Moved:** `mixture-of-experts` from LLM Applications to LLM Architecture (it is architecture).

**New notes** _(new)_
- LLM Architecture: `modern-llm-blocks` (RoPE, GQA, RMSNorm, SwiGLU), `pretraining-data` (sources, filtering, dedup, mixtures).
- LLM Alignment: `distillation`, `reasoning-models` (test-time compute, RL for reasoning), `llm-safety` (jailbreaks, prompt injection, red-teaming; agent-side defences stay in `agentic-systems/agent-safety-and-guardrails`). `fine-tuning` also covers catastrophic forgetting and continual learning. `in-context-learning-and-prompting` also covers meta-learning / few-shot learning (decided: no separate note).
- LLM Applications: `choosing-an-approach` (prompt vs RAG vs fine-tune), `rerankers-and-hybrid-search`, `structured-output`, `llm-evals-in-practice`.
- Computer Vision: `ocr-and-documents`, `video-understanding`, `depth-and-3d` (monocular depth, NeRF, Gaussian splatting).
- Modern Vision: `vision-foundation-models` (DINO, SAM, DETR).
- Speech & Audio: `neural-audio-codecs` (discrete audio tokens), `speech-llms` (speech-to-speech).

**New section: LLM Inference** (after LLM Alignment): `decoding-strategies`, `kv-cache`, `speculative-decoding`, `llm-quantization` (link `dl/practical-training/model-compression` for the general idea), `llm-serving`. Link `infra/memory-hierarchy` and `infra/gpus-parallelism/roofline-model`: decoding is memory-bound.

**New section: Other Domains** (after Speech & Audio): `time-series-dl` (link `ml/time-series/*`), `tabular-dl` (vs gradient boosting, link `ml/trees-ensembles/gradient-boosting`), `scientific-ml` (AlphaFold, weather models, physics-informed networks).

**Appendix pages:** `glossary`, `model-timeline`, `benchmarks-and-metrics`, `gpu-memory-math`. Decoding parameters are not an appendix page: `llm-inference/decoding-strategies` covers them.

**Decided not to add:** a meta-learning note (in in-context learning), a continual-learning note (in fine-tuning and `ml/ml-systems/model-drift`), MCMC (added to math as `math/statistics/mcmc`).
