# Machine Learning Knowledge Base — Full Content Plan (v2)

Covers classical ML and the fundamentals that `scaffold-dl` will build directly on top of. Heavy prerequisites from Math (`linear-algebra`, `calculus`, `probability`, `statistics`, `optimization`) are called out inline rather than re-derived here.

**Build/reading order:**

1. ML Foundations & Workflow
2. Model Evaluation & Validation _(moved up — methodology before models)_
3. Supervised Learning — Regression
4. Supervised Learning — Classification
5. Tree-Based Methods & Ensembles
6. Unsupervised Learning
7. Dimensionality Reduction
8. Recommender Systems _(new)_
9. Feature Engineering & Data Preparation
10. Neural Networks (Classical/Shallow)
11. Reinforcement Learning Basics
12. ML Systems & Practical Concerns

Tags: **[opt]** = included but lower priority. **[later]** = deferred.

---

## 1. ML Foundations & Workflow

1. **What "learning from data" actually means** — the difference between a program you write and a model that's fit
2. **Types of learning** — supervised, unsupervised, reinforcement — the three framed side by side
3. **Semi-supervised and self-supervised learning** — learning when labels are scarce or absent entirely; self-supervised learning gets real weight here since it's the pretraining mechanism behind modern foundation models — an explicit forward-link to `scaffold-applied-dl`'s LLM section, not just a passing definition
4. **The ML workflow** — data → features → model → evaluation → deployment, as a repeating loop
5. **Bias-variance tradeoff** — underfitting vs. overfitting, the single most load-bearing concept in the whole KB
6. **The hypothesis space and inductive bias** — every model assumes something; making that assumption visible

**Interactive:** bias-variance visualizer (fit polynomials of increasing degree to noisy data, watch train/test error diverge), self-training demo (a small labeled set, watch pseudo-labels get assigned to unlabeled points and fed back in).

---

## 2. Model Evaluation & Validation

_(Moved up deliberately — the goal is to understand how a model's performance gets judged before building the models themselves. Note: confusion matrices, precision/recall, and ROC/AUC are introduced here at the methodology level but get revisited with concrete worked examples once Classification exists in Section 4 — they need a classifier's actual output to feel real, not just abstract.)_

1. **Train/validation/test splits** — why you need all three, what leaks when you don't
2. **Cross-validation** — k-fold, why a single split isn't always enough
3. **Confusion matrices** — true/false positive/negative, the foundation everything else here is built from
4. **Precision, recall, and F1** — the tradeoffs between them, previewed conceptually here, grounded in a real classifier later
5. **ROC curves and AUC** — what the curve is actually plotting
6. **Regression evaluation metrics** — MSE, MAE, R² — the regression-side counterpart to the classification metrics above
7. **Hyperparameter tuning** — grid search, random search, the search-space intuition
8. [opt] **Calibration** — when a model's predicted probabilities should be trusted

**Interactive:** train/test split demo (shuffle a dataset, watch what happens to reported accuracy when test data leaks into training), k-fold visualizer (a dataset split into folds, watch which fold is held out each round) — confusion matrix and ROC builders are introduced here conceptually, then their full interactive versions appear again in Classification once there's a real model to evaluate.

---

## 3. Supervised Learning — Regression

1. **Linear regression** — the model, closed-form solution, connection to `math:statistics:regression`
2. **Gradient descent for regression** — fitting via optimization instead of closed form _(direct application of `math:optimization:gradient-descent`)_
3. **Polynomial regression** — extending linear models to curves, and why this makes overfitting easy
4. **Regularization — Ridge and Lasso** — L2/L1 penalties, why they constrain model complexity differently
5. [opt] **Elastic Net** — combining L1 and L2

**Interactive:** regression fit visualizer (draggable data points, line/curve updates live, residuals shown), regularization strength slider (watch coefficients shrink toward zero as regularization increases, Lasso vs. Ridge compared side by side).

---

## 4. Supervised Learning — Classification

1. **Logistic regression** — from linear regression to probabilities, the sigmoid function
2. **Decision boundaries** — what a classifier is actually drawing in feature space
3. **k-Nearest Neighbors** — the simplest possible classifier, and its real costs
4. **Support Vector Machines** — maximum margin, the kernel trick, when SVMs shine
5. **Naive Bayes** — the independence assumption, why it works surprisingly often anyway
6. **Multi-class classification strategies** — one-vs-rest, one-vs-one, softmax
7. [opt] **Class imbalance** — why accuracy lies, resampling and weighting strategies

**Interactive:** decision boundary visualizer (2D points, click to add classes, watch the boundary redraw for different classifiers side by side), kernel trick demo, k-NN live classifier — **plus the grounded versions of Section 2's metrics**: a real confusion matrix and ROC curve built from this section's own trained classifier, closing the loop opened earlier.

---

## 5. Tree-Based Methods & Ensembles

1. **Decision trees** — splitting criteria (Gini, entropy), how a tree actually grows
2. **Overfitting in trees** — pruning, depth limits
3. **Random forests** — bagging, feature randomness
4. **Boosting** — the core idea (each model fixes the last one's mistakes), AdaBoost intuition
5. **Gradient boosting** — the connection to gradient descent in function space, XGBoost/LightGBM conceptually
6. [opt] **Stacking** — combining heterogeneous models

**Interactive:** decision tree builder (watch a tree grow split by split, Gini impurity shown at each node), random forest vs. single tree comparison, boosting step-through.

---

## 6. Unsupervised Learning

1. **k-Means clustering** — the algorithm, initialization sensitivity, choosing k
2. **Hierarchical clustering** — agglomerative clustering, dendrograms
3. **DBSCAN** — density-based clustering, handling non-spherical clusters and noise
4. **Gaussian Mixture Models** — soft clustering, the connection to probability distributions
5. **Anomaly detection** — framing outliers as a learning problem
6. [opt] **Association rule learning** — market-basket analysis, support/confidence/lift

**Interactive:** k-means step-through (centroids move each iteration until convergence), DBSCAN vs. k-means comparison, dendrogram builder.

---

## 7. Dimensionality Reduction

1. **Why dimensionality reduction matters** — the curse of dimensionality, intuition first
2. **PCA** — direct callback to `math:linear-algebra:pca`, now framed as an ML tool
3. **t-SNE** — preserving local structure for visualization
4. **UMAP** — conceptually contrasted with t-SNE
5. [opt] **Autoencoders as dimensionality reduction** — teased here, built properly in `scaffold-dl`

**Interactive:** PCA on real data (high-dimensional dataset projected to 2D live, variance-explained per component), t-SNE vs. PCA comparison.

---

## 8. Recommender Systems

_(New section. Classical, data-structure-and-matrix-driven approaches live here — directly building on PCA/SVD from the section above. Modern deep-learning-based recommenders — neural collaborative filtering, embedding-based retrieval, sequence-aware/session-based recommenders — belong in `scaffold-dl`, same boundary pattern as Neural Networks and RL below.)_

1. **The recommendation problem** — explicit vs. implicit feedback, the cold-start problem stated upfront
2. **Collaborative filtering** — user-based and item-based, the "people like you also liked" intuition
3. **Matrix factorization** — recommender systems as an SVD application, a direct, concrete callback to `math:linear-algebra:svd`
4. **Content-based filtering** — recommending from item features rather than other users' behavior
5. **Hybrid approaches** — combining collaborative and content-based signals
6. **Evaluating recommenders** — precision@k, recall@k, NDCG — why standard classification metrics don't quite fit this problem
7. [later] **Deep learning-based recommenders** — explicitly deferred to `scaffold-dl` (neural collaborative filtering, embeddings, two-tower architectures, and sequence-aware recommenders directly reuse DL's own RNN/Transformer sections), noted here as a forward pointer rather than built out

**Interactive:** matrix factorization visualizer (a sparse user-item matrix, watch latent factors get learned and fill in predicted ratings), collaborative filtering similarity demo (pick a user, watch their nearest neighbors and what gets recommended as a result).

---

## 9. Feature Engineering & Data Preparation

1. **Handling missing data** — imputation strategies, when missingness itself is informative
2. **Encoding categorical variables** — one-hot, ordinal, target encoding
3. **Feature scaling** — standardization vs. normalization, which models actually need it
4. **Feature selection** — filter, wrapper, and embedded methods
5. **Data leakage** — the single most common way ML projects quietly fail
6. [opt] **Handling imbalanced datasets** — SMOTE and other resampling techniques

**Interactive:** scaling comparison (raw vs. standardized vs. normalized, effect on distance-based models), data leakage demo.

---

## 10. Neural Networks (Classical/Shallow)

_(Kept shallow here — `scaffold-dl` owns deep architectures, backprop derivation, and modern training.)_

1. **The perceptron** — the original neural unit, what it can and can't learn (XOR problem)
2. **Multi-layer perceptrons** — stacking layers, why depth adds expressive power
3. **Activation functions** — sigmoid, tanh, ReLU
4. **Forward propagation** — tracing a single input through a small network by hand
5. **An intuitive (non-derived) look at backpropagation** — the idea of credit assignment, full derivation deferred to `scaffold-dl`
6. [opt] **Universal approximation theorem** — stated rather than proven

**Interactive:** perceptron XOR demo (fails, then a 2-layer network succeeds), activation function comparison, forward-pass step-through.

---

## 11. Reinforcement Learning Basics

_(Kept introductory — deeper RL, especially anything neural-network-based (DQN, policy gradients, actor-critic), belongs in `scaffold-dl`.)_

1. **The RL framing** — agent, environment, state, action, reward
2. **Markov Decision Processes** — the formal model _(ties to `math:probability:markov-chains`)_
3. **Value functions and policies** — what an agent is actually trying to learn
4. **Q-learning** — the simplest concrete algorithm, a small grid-world example
5. **Exploration vs. exploitation** — the core tension in every RL problem
6. [later] **Policy gradient methods** — deferred to `scaffold-dl`, where the full deep RL treatment (DQN, policy gradients, actor-critic, PPO) lives

**Interactive:** grid-world Q-learning visualizer, exploration-vs-exploitation multi-armed bandit simulator.

---

## 12. ML Systems & Practical Concerns

1. **The ML lifecycle in practice** — deployment, monitoring, retraining
2. **Model drift** — why performance degrades over time even without code changes
3. **A/B testing for ML** — evaluating real-world impact, not just offline metrics
4. **Interpretability and explainability** — feature importance, SHAP/LIME conceptually
5. [opt] **Fairness in ML** — where bias enters a pipeline, common fairness metrics and their tensions
6. [later] **MLOps tooling** — kept conceptual, same principle as Cloud/SWE Practices in CS

**Interactive:** model drift simulator, feature importance visualizer.

---

## Summary counts

| #   | Section                         | Core | Opt | Later |
| --- | ------------------------------- | ---- | --- | ----- |
| 1   | ML Foundations & Workflow       | 6    | 0   | 0     |
| 2   | Model Evaluation & Validation   | 7    | 1   | 0     |
| 3   | Regression                      | 4    | 1   | 0     |
| 4   | Classification                  | 6    | 1   | 0     |
| 5   | Tree-Based Methods & Ensembles  | 5    | 1   | 0     |
| 6   | Unsupervised Learning           | 5    | 1   | 0     |
| 7   | Dimensionality Reduction        | 4    | 1   | 0     |
| 8   | Recommender Systems             | 6    | 0   | 1     |
| 9   | Feature Engineering & Data Prep | 5    | 1   | 0     |
| 10  | Neural Networks (Classical)     | 5    | 1   | 0     |
| 11  | Reinforcement Learning Basics   | 5    | 0   | 1     |
| 12  | ML Systems & Practical Concerns | 4    | 1   | 1     |

**~62 core concept pages** before [opt]/[later] expansion.

---

## Deliberate boundaries with `scaffold-dl`

- **Neural Networks** stops at shallow MLPs and an intuitive, non-derived backprop — full derivation, modern architectures, and training techniques belong in `scaffold-dl`.
- **Reinforcement Learning** stops at tabular Q-learning — any RL using a neural network as function approximator (DQN, policy gradients, actor-critic, PPO) belongs in `scaffold-dl`.
- **Recommender Systems** stops at classical, matrix/similarity-based methods — deep learning-based recommenders (neural collaborative filtering, embeddings, two-tower architectures, sequence-aware recommenders) belong in `scaffold-dl`.

This is a consistent pattern across the whole KB: ML teaches the ideas that generalize, DL builds the specific modern techniques — including deep RL and deep recommenders, both general _techniques_ rather than domain-specific _modalities_ — on top. `scaffold-applied-dl` is reserved for the modality-specific domains: LLMs/NLP, Vision/VLMs, Audio.
