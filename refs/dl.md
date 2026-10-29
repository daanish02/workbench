# Deep Learning Knowledge Base — Full Content Plan

Owns architectures, training mechanics, and the mathematics of how deep networks actually learn. the `applied-dl` area owns what gets built _with_ these architectures (LLMs, vision models, audio, RL with neural function approximators). the `ml` area's shallow neural network section (perceptron, MLP, intuitive backprop) is the on-ramp this KB continues from — full derivation and modern architectures start here.


## Writing checklist (coverage review 2026-10-18, read before each section)

- Every note below, including the ones marked _(new)_, already exists as a placeholder stub (body `_Placeholder. Content not written yet._`) with a short title (at most 3 words), description and `order`. Overwrite stubs in place; do not create files or renumber unless a note is added or dropped. Slugs are the old long ones; keep them.
- `##` headings at most 5 words. Python blocks standalone with real output; run `uv run scripts/check_notes.py dl`.
- Link instead of re-teaching: math (`linear-algebra`, `calculus`, `probability`, `statistics`, `optimization`, `information-theory`), CS, and Hardware (`infra/...`) notes already cover the foundations named below.

---

## 1. Neural Network Foundations, Deepened

_Status 2026-10-29: all 7 notes written (numpy only, no torch pin yet). Figures: CompGraphStepper, InitDepth, ActivationCurves, ReluApprox. Tiers: backpropagation and weight-initialization changed to core; automatic-differentiation and the universal approximation proof stay advanced._

_(Picks up exactly where `ml/shallow-neural-networks` left off — this is where backprop stops being "intuitive" and becomes fully derived.)_

1. **Computational graphs** — representing a network as a graph of operations, the structure everything else here depends on
2. **Backpropagation, fully derived** — the chain rule applied through an entire network _(direct, explicit callback to `math/calculus/the-chain-rule-multivariable` and `math/linear-algebra/matrices-as-transformations`)_
3. **Automatic differentiation** — how frameworks compute exact gradients without anyone hand-deriving them
4. **Weight initialization** — why it matters at all, Xavier/Glorot and He initialization
5. **Loss functions for deep learning** — cross-entropy and MSE revisited at the scale and context deep nets actually use them
6. **Universal approximation theorem, proof sketch** — deepened from the ML KB's stated-only version

**Interactive:** computational graph builder (construct a small expression, watch forward values and backward gradients computed live at every node — the clearest possible way to make backprop stop feeling like magic), weight initialization comparison (the same network, different initialization schemes, watch which ones actually train).

---

## 2. Training Dynamics & Optimization

_Status 2026-10-29: all 8 notes written (numpy only). Figures: GradientFlow, ClipVector, NormAxes, LrSchedulePlot; the optimizer race already exists in math (OptimizerRace), so it is linked rather than rebuilt. Mixed precision lives in practical-training._

1. **Optimizers revisited for deep nets** — SGD, mini-batch gradient descent, momentum, RMSProp, Adam — at an implementation level, deeper than the Math KB's conceptual treatment
2. **Vanishing and exploding gradients** — why depth itself makes training hard, the central motivating problem for most of this section
3. **Batch normalization** — what it actually does to the loss landscape, why it helps
4. **Dropout** — regularization specific to deep nets, what it does during training vs. inference
5. **Learning rate schedules** — warmup, decay, cyclical learning rates
6. **Hyperparameter tuning for deep nets** — how this differs from classical ML's grid/random search at this scale
7. **Mixed precision training** — direct callback to `infra/gpus-parallelism/tensor-cores-and-specialized-ai-hardware`

**Interactive:** optimizer race (the same loss surface, SGD vs. momentum vs. Adam converging at different rates side by side — extending the Math KB's gradient descent playground to the deep-learning-specific optimizers), vanishing gradient demo (a deep network, watch gradient magnitude shrink layer by layer during backprop), batch norm before/after (the same network's loss landscape, visibly smoother with batch norm applied).

---

## 3. Convolutional Neural Networks

1. **The convolution operation** — kernels, feature maps, sliding windows _(ties to `math/signals-fourier/convolution`)_
2. **Pooling** — max/average pooling, why downsampling helps
3. **CNN architectures as a narrative** — LeNet → AlexNet → VGG → ResNet, told as a sequence of solved problems, not a list of names
4. **Residual connections** — why skip connections are what actually made very deep networks trainable
5. **Transfer learning** — fine-tuning a pretrained CNN on a new task
6. **Architecture scaling** — EfficientNet-style compound scaling, the idea of scaling depth/width/resolution together

**Interactive:** convolution step-through (a kernel sliding across an image, the output feature map building up live, adjustable kernel values), CNN layer visualizer (feed a real image through a trained CNN, see what each layer's feature maps actually look like — the "early layers detect edges, later layers detect shapes" idea made visible), residual connection comparison (a very deep plain network vs. one with skip connections, training curves compared).

_Status 2026-10-30: all 7 notes written and pushed (numpy only), with figures._

---

## 4. Recurrent Neural Networks & Sequence Modeling

1. **Why sequences need different architectures** — the limits of feedforward and convolutional networks on sequential data
2. **Vanilla RNNs** — the recurrence relation, backpropagation through time
3. **The vanishing gradient problem in RNNs** — why it's especially severe here, distinct from the general deep-net version in Section 2
4. **LSTMs** — gates, what each gate does, why the architecture solves vanishing gradients
5. **GRUs** — the simplified alternative, what's traded away
6. **Sequence-to-sequence models** — encoder-decoder architecture, directly setting up the bottleneck that attention solves next

**Interactive:** RNN unrolled-through-time visualizer (a sequence processed step by step, hidden state evolving, gradient flow shown flowing backward through time), LSTM gate visualizer (a sequence passes through, watch the forget/input/output gates activate differently depending on content), seq2seq bottleneck demo (show information loss as sequence length grows — the exact motivating problem for attention).

_Status 2026-10-30: all 7 notes written (numpy only), incl. advanced state-space-models. Figures: ContextReach, RnnUnroll, GradThroughTime, RnnCliff, LstmCell, LstmGates, GruMix, CountCompare, Seq2SeqFlow, BottleneckCurve, SsmKernel, SelectiveState._

---

## 5. Attention & Transformers

_(Architecture only — pretraining objectives, scaling laws, and what you actually build with transformers belong in the `applied-dl` area.)_

1. **The attention mechanism** — query/key/value, how attention solves the seq2seq bottleneck from the previous section
2. **Self-attention** — attending within a single sequence rather than between two
3. **The Transformer architecture, in full** — multi-head attention, positional encoding, feedforward sublayers, layer norm placement, the complete block
4. **Why transformers parallelize better than RNNs** — direct callback to `infra/gpus-parallelism`, this is where that hardware knowledge pays off
5. **Positional encoding variants** — learned vs. sinusoidal vs. rotary, why position needs to be injected at all

**Interactive:** attention weight visualizer (a sentence, click a word, see which other words it attends to, weights shown as connecting lines of varying thickness — genuinely one of the best possible demos for this concept), multi-head attention comparison (the same sentence, different heads attending to different relationships — syntax vs. coreference, for instance), transformer vs. RNN parallelism demo (visualize the sequential dependency chain in an RNN vs. the fully parallel computation in a transformer).

_Status 2026-10-30: all 7 notes written (numpy only), incl. transformer-variants and advanced positional-encoding-variants and efficient-attention. Figures: AttnAlign, ScaledSoftmax, SelfAttnMatrix, AttnCost, MultiHeadView, TransformerBlock, MaskPatterns, SeqVsParallel, IntensityRoofline, SinusoidPE, RopeRotate, FlashTiles, SparsePatterns. No code block duplicates a figure._

---

## 6. Regularization & Generalization

1. **Overfitting in deep nets, revisited at scale** — how this differs from the classical ML version given millions/billions of parameters
2. **Data augmentation** — expanding training data artificially, why it works
3. **Early stopping** — using the validation curve itself as a stopping signal
4. **Weight decay in deep nets** — L2 regularization's deep-learning-specific behavior
5. **Label smoothing** — softening hard targets, why it sometimes helps generalization

**Interactive:** data augmentation gallery (one image, watch a dozen augmented variants generate live), overfitting-at-scale demo (a large network memorizing a small dataset, train/val curves diverging dramatically — more extreme than the Math/ML KB's gentler version, same underlying idea).

---

## 7. Generative Models, Foundations

_(This is where the autoencoder teased in `ml/dimensionality-reduction` actually gets built. Specific generative applications — image generation products, etc. — belong in the `applied-dl` area.)_

1. **Autoencoders** — the architecture, reconstruction loss, closing the loop from the ML KB's forward-link
2. **Variational Autoencoders** — the probabilistic twist, the reparameterization trick
3. **Generative Adversarial Networks** — generator vs. discriminator, the adversarial training game
4. **Diffusion models, conceptually** — the forward noising process and the learned reverse process, at a foundational level
5. **Comparing generative paradigms** — a synthesis page once all four exist, contrasting training stability, sample quality, and what each is actually good for

**Interactive:** autoencoder reconstruction demo (an image compressed through a bottleneck and reconstructed, bottleneck size adjustable live), GAN training visualizer (generator and discriminator loss curves racing against each other, generated samples improving over simulated training steps), diffusion step-through (watch an image get progressively noised, then watch the reverse process denoise it step by step).

---

## 8. Deep Learning Systems & Practical Training

1. **Hardware for deep learning** — explicit, direct callback to `infra/gpus-parallelism` — this section assumes that KB rather than re-explaining GPUs
2. **Distributed training** — data parallelism vs. model parallelism, at a conceptual level
3. **Mixed precision training, in practice** — building on the [opt] mention in Section 2
4. **Experiment tracking and reproducibility** — why deep learning experiments are unusually easy to make irreproducible by accident
5. **Model compression** — pruning, quantization, knowledge distillation

**Interactive:** data vs. model parallelism visualizer (the same training job, split across devices two different ways, showing what gets duplicated vs. what gets partitioned).

---

## 9. Deep Reinforcement Learning

_(Picks up exactly where `ml/reinforcement-learning` left off — tabular Q-learning doesn't scale past small state spaces, which is precisely the problem deep RL solves by using a neural network as the function approximator.)_

1. **Why RL needs function approximation** — the direct motivating gap from tabular Q-learning's limits
2. **Deep Q-Networks (DQN)** — approximating the Q-function with a neural net, experience replay, target networks — why both tricks were necessary to make it stable
3. **Policy gradient methods** — REINFORCE, directly optimizing a policy instead of a value function _(this is the item originally deferred from the ML KB — it belongs here, not in Applied DL)_
4. **Actor-critic methods** — combining value-based and policy-based approaches
5. **Proximal Policy Optimization (PPO), conceptually** — why naive policy gradients are unstable, what PPO's clipping trick fixes
6. **Continuous action spaces** — when actions aren't discrete choices, what changes

**Interactive:** DQN training visualizer (an agent in a simple environment, watch its Q-value estimates and resulting behavior improve over training episodes), policy gradient vs. value-based comparison (the same simple environment, two different algorithm families learning it, side by side).

---

## 10. Deep Learning for Recommender Systems

_(Closes the loop deliberately left open in `ml/recommender-systems` — classical matrix factorization and collaborative filtering live there; this section is what happens when you replace those with learned representations, directly reusing this KB's own architectures.)_

1. **Why classical recommenders hit a ceiling** — the direct motivating gap from the ML KB's matrix factorization approach
2. **Neural collaborative filtering** — replacing matrix factorization's dot product with a learned neural network
3. **Embeddings for recommendation** — learned representations of users and items, and why this generalizes better than raw IDs
4. **Two-tower architectures** — the retrieval pattern used at real-world scale, user tower and item tower trained jointly
5. **Sequence-aware and session-based recommenders** — directly reusing this KB's own RNN/Transformer sections to model a user's behavior as a sequence rather than a static profile
6. **Cold-start strategies in deep recommenders** — how learned representations help (or don't) with the cold-start problem introduced in the ML KB

**Interactive:** embedding space visualizer (project learned user/item embeddings into 2D, watch similar items cluster together), two-tower retrieval demo (a query embedding, watch nearest-neighbor item embeddings get retrieved live).

---

## Coverage review _(2026-10-18)_

Stubs exist for everything here.

**Merged / boundaries**
- `training-optimization/mixed-precision-training` merged into `practical-training/mixed-precision-training-in-practice`; number formats live in `infra/cpu-architecture/floating-point-hardware`, link it.
- `hardware-for-deep-learning` is a short bridge to `infra/gpus-parallelism/*`, not a re-teach.
- `distributed-training` owns the algorithms (data, tensor, pipeline parallelism, FSDP, ZeRO); `infra/gpus-parallelism/multi-gpu-and-distributed-training-hardware` owns the hardware traffic.
- A PyTorch guide belongs in the appendix (`appendix/pytorch-guide`). Notes can still use PyTorch in code blocks.

**New notes** _(new)_
- Foundations: `modern-activations` (GELU, SiLU, SwiGLU).
- Training: `gradient-clipping`, `normalization-layers` (LayerNorm, RMSNorm, GroupNorm).
- CNNs: `efficient-convolutions` (depthwise separable, 1x1).
- RNNs: `state-space-models` (S4, Mamba).
- Transformers: `transformer-variants` (encoder-only, decoder-only, encoder-decoder), `efficient-attention` (FlashAttention, sparse, linear).
- Regularization: `double-descent`.
- Generative: `autoregressive-models`, `normalizing-flows`, `diffusion-guidance`, `flow-matching`.
- Practical: `debugging-training`, `interpreting-networks` (saliency, Grad-CAM, probing).
- Deep RL: `model-based-rl` (world models, MCTS/AlphaZero), `offline-rl`.
- Deep recommenders: `ranking-models` (retrieve then rank).

**New section: Graph Neural Networks** (after Attention & Transformers): `graphs-as-data`, `message-passing`, `gcn-and-gat`, `graph-tasks`. Link `cs/data-structures/graphs`; note that a transformer is message passing on a complete graph.

**New section: Representation Learning** (after Regularization): `contrastive-learning`, `metric-learning`, `self-supervised-objectives`. This is the general home of self-supervision; `ml/ml-foundations/semi-supervised-and-self-supervised-learning` introduces it and `applied-dl/modern-vision/self-supervised-vision` applies it.

**Appendix pages:** `glossary`, `pytorch-guide`, `shapes-and-parameters`, `losses-and-activations`, `training-defaults`, `training-failures`.

**Appendix page added:** `reading-papers` (Reading DL Papers): three-pass reading, finding the real contribution, checking ablations, baselines and compute.
