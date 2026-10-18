# Machine Learning Knowledge Base — Full Content Plan (v2)

Covers classical ML and the fundamentals that the `dl` area will build directly on top of. Heavy prerequisites from Math (`linear-algebra`, `calculus`, `probability`, `statistics`, `optimization`) are called out inline rather than re-derived here.


## Writing checklist (coverage review 2026-10-18, read before each section)

- Every note below, including the ones marked _(new)_, already exists as a placeholder stub (body `_Placeholder. Content not written yet._`) with a short title (at most 3 words), description and `order`. Overwrite stubs in place; do not create files or renumber unless a note is added or dropped. Slugs are the old long ones; keep them.
- `##` headings at most 5 words. Python blocks standalone with real output; run `uv run scripts/check_notes.py ml`.
- Link instead of re-teaching: math (`linear-algebra`, `calculus`, `probability`, `statistics`, `optimization`, `information-theory`), CS, and Hardware (`infra/...`) notes already cover the foundations named below.

---

## 1. ML Foundations & Workflow

1. **What "learning from data" actually means** — the difference between a program you write and a model that's fit
2. **Types of learning** — supervised, unsupervised, reinforcement — the three framed side by side
3. **Semi-supervised and self-supervised learning** — learning when labels are scarce or absent entirely; self-supervised learning gets real weight here since it's the pretraining mechanism behind modern foundation models — an explicit forward-link to the `applied-dl` area's LLM section, not just a passing definition
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
8. **Calibration** — when a model's predicted probabilities should be trusted

**Interactive:** train/test split demo (shuffle a dataset, watch what happens to reported accuracy when test data leaks into training), k-fold visualizer (a dataset split into folds, watch which fold is held out each round) — confusion matrix and ROC builders are introduced here conceptually, then their full interactive versions appear again in Classification once there's a real model to evaluate.

---

## 3. Supervised Learning — Regression

1. **Linear regression** — the model, closed-form solution, connection to `math/statistics/regression`
2. **Gradient descent for regression** — fitting via optimization instead of closed form _(direct application of `math/optimization/gradient-descent`)_
3. **Polynomial regression** — extending linear models to curves, and why this makes overfitting easy
4. **Regularization — Ridge and Lasso** — L2/L1 penalties, why they constrain model complexity differently
5. **Elastic Net** — combining L1 and L2

**Interactive:** regression fit visualizer (draggable data points, line/curve updates live, residuals shown), regularization strength slider (watch coefficients shrink toward zero as regularization increases, Lasso vs. Ridge compared side by side).

---

## 4. Supervised Learning — Classification

1. **Logistic regression** — from linear regression to probabilities, the sigmoid function
2. **Decision boundaries** — what a classifier is actually drawing in feature space
3. **k-Nearest Neighbors** — the simplest possible classifier, and its real costs
4. **Support Vector Machines** — maximum margin, the kernel trick, when SVMs shine
5. **Naive Bayes** — the independence assumption, why it works surprisingly often anyway
6. **Multi-class classification strategies** — one-vs-rest, one-vs-one, softmax
7. **Class imbalance** — why accuracy lies, resampling and weighting strategies

**Interactive:** decision boundary visualizer (2D points, click to add classes, watch the boundary redraw for different classifiers side by side), kernel trick demo, k-NN live classifier — **plus the grounded versions of Section 2's metrics**: a real confusion matrix and ROC curve built from this section's own trained classifier, closing the loop opened earlier.

---

## 5. Tree-Based Methods & Ensembles

1. **Decision trees** — splitting criteria (Gini, entropy), how a tree actually grows
2. **Overfitting in trees** — pruning, depth limits
3. **Random forests** — bagging, feature randomness
4. **Boosting** — the core idea (each model fixes the last one's mistakes), AdaBoost intuition
5. **Gradient boosting** — the connection to gradient descent in function space, XGBoost/LightGBM conceptually
6. **Stacking** — combining heterogeneous models

**Interactive:** decision tree builder (watch a tree grow split by split, Gini impurity shown at each node), random forest vs. single tree comparison, boosting step-through.

---

## 6. Unsupervised Learning

1. **k-Means clustering** — the algorithm, initialization sensitivity, choosing k
2. **Hierarchical clustering** — agglomerative clustering, dendrograms
3. **DBSCAN** — density-based clustering, handling non-spherical clusters and noise
4. **Gaussian Mixture Models** — soft clustering, the connection to probability distributions
5. **Anomaly detection** — framing outliers as a learning problem
6. **Association rule learning** — market-basket analysis, support/confidence/lift

**Interactive:** k-means step-through (centroids move each iteration until convergence), DBSCAN vs. k-means comparison, dendrogram builder.

---

## 7. Dimensionality Reduction

1. **Why dimensionality reduction matters** — the curse of dimensionality, intuition first
2. **PCA** — direct callback to `math/linear-algebra/principal-component-analysis-pca`, now framed as an ML tool
3. **t-SNE** — preserving local structure for visualization
4. **UMAP** — conceptually contrasted with t-SNE
5. **Autoencoders as dimensionality reduction** — teased here, built properly in the `dl` area

**Interactive:** PCA on real data (high-dimensional dataset projected to 2D live, variance-explained per component), t-SNE vs. PCA comparison.

---

## 8. Recommender Systems

_(New section. Classical, data-structure-and-matrix-driven approaches live here — directly building on PCA/SVD from the section above. Modern deep-learning-based recommenders — neural collaborative filtering, embedding-based retrieval, sequence-aware/session-based recommenders — belong in the `dl` area, same boundary pattern as Neural Networks and RL below.)_

1. **The recommendation problem** — explicit vs. implicit feedback, the cold-start problem stated upfront
2. **Collaborative filtering** — user-based and item-based, the "people like you also liked" intuition
3. **Matrix factorization** — recommender systems as an SVD application, a direct, concrete callback to `math/linear-algebra/singular-value-decomposition-svd`
4. **Content-based filtering** — recommending from item features rather than other users' behavior
5. **Hybrid approaches** — combining collaborative and content-based signals
6. **Evaluating recommenders** — precision@k, recall@k, NDCG — why standard classification metrics don't quite fit this problem
7. **Deep learning-based recommenders** — explicitly deferred to the `dl` area (neural collaborative filtering, embeddings, two-tower architectures, and sequence-aware recommenders directly reuse DL's own RNN/Transformer sections), noted here as a forward pointer rather than built out

**Interactive:** matrix factorization visualizer (a sparse user-item matrix, watch latent factors get learned and fill in predicted ratings), collaborative filtering similarity demo (pick a user, watch their nearest neighbors and what gets recommended as a result).

---

## 9. Feature Engineering & Data Preparation

1. **Handling missing data** — imputation strategies, when missingness itself is informative
2. **Encoding categorical variables** — one-hot, ordinal, target encoding
3. **Feature scaling** — standardization vs. normalization, which models actually need it
4. **Feature selection** — filter, wrapper, and embedded methods
5. **Data leakage** — the single most common way ML projects quietly fail
6. **Handling imbalanced datasets** — SMOTE and other resampling techniques

**Interactive:** scaling comparison (raw vs. standardized vs. normalized, effect on distance-based models), data leakage demo.

---

## 10. Neural Networks (Classical/Shallow)

_(Kept shallow here — the `dl` area owns deep architectures, backprop derivation, and modern training.)_

1. **The perceptron** — the original neural unit, what it can and can't learn (XOR problem)
2. **Multi-layer perceptrons** — stacking layers, why depth adds expressive power
3. **Activation functions** — sigmoid, tanh, ReLU
4. **Forward propagation** — tracing a single input through a small network by hand
5. **An intuitive (non-derived) look at backpropagation** — the idea of credit assignment, full derivation deferred to the `dl` area
6. **Universal approximation theorem** — stated rather than proven

**Interactive:** perceptron XOR demo (fails, then a 2-layer network succeeds), activation function comparison, forward-pass step-through.

---

## 11. Reinforcement Learning Basics

_(Kept introductory — deeper RL, especially anything neural-network-based (DQN, policy gradients, actor-critic), belongs in the `dl` area.)_

1. **The RL framing** — agent, environment, state, action, reward
2. **Markov Decision Processes** — the formal model _(ties to `math/probability/markov-chains`)_
3. **Value functions and policies** — what an agent is actually trying to learn
4. **Q-learning** — the simplest concrete algorithm, a small grid-world example
5. **Exploration vs. exploitation** — the core tension in every RL problem
6. **Policy gradient methods** — deferred to the `dl` area, where the full deep RL treatment (DQN, policy gradients, actor-critic, PPO) lives

**Interactive:** grid-world Q-learning visualizer, exploration-vs-exploitation multi-armed bandit simulator.

---

## 12. ML Systems & Practical Concerns

1. **The ML lifecycle in practice** — deployment, monitoring, retraining
2. **Model drift** — why performance degrades over time even without code changes
3. **A/B testing for ML** — evaluating real-world impact, not just offline metrics
4. **Interpretability and explainability** — feature importance, SHAP/LIME conceptually
5. **Fairness in ML** — where bias enters a pipeline, common fairness metrics and their tensions
6. **MLOps tooling** — kept conceptual, same principle as Cloud/SWE Practices in CS

**Interactive:** model drift simulator, feature importance visualizer.

---

## Coverage review _(2026-10-18)_

Stubs exist for everything here.

**Merged / dropped**
- `feature-engineering/handling-imbalanced-datasets` merged into `supervised-classification/class-imbalance` (now covers weights, resampling, SMOTE, threshold moving). Feature Engineering should link to it.
- `recommender-systems/deep-learning-based-recommenders` and `reinforcement-learning/policy-gradient-methods` dropped: they were forward pointers only. The topics are full notes in DL (`dl/deep-recommenders/*`, `dl/deep-reinforcement-learning/policy-gradient-methods`). End `evaluating-recommenders` and `exploration-vs-exploitation` with a "where next" link to them.

**New notes** _(new)_
- Foundations: `loss-and-risk` (empirical risk, MLE as a loss; link `math/statistics/estimation`), `learning-theory` (PAC, VC dimension, no free lunch).
- Evaluation: `learning-curves`, `comparing-models` (bootstrap intervals, paired tests; link `math/statistics/bootstrap-methods`, `hypothesis-testing`).
- Regression: `generalized-linear-models`, `gaussian-processes` (link `math/probability/multivariate-normal`).
- Classification: `discriminant-analysis` (LDA/QDA).
- Unsupervised: `spectral-clustering`, `cluster-evaluation`, `hidden-markov-models` (forward algorithm, Viterbi, EM; link `math/probability/markov-chains`).
- Dimensionality reduction: `nmf-and-ica`, `manifold-learning`.
- Recommenders: `learning-to-rank`.
- Feature engineering: `text-features` (bag of words, TF-IDF), `feature-pipelines` (fit on train only).
- RL: `value-iteration` (value and policy iteration), `temporal-difference-learning` (Monte Carlo, TD(0), SARSA), placed before Q-learning so it no longer jumps straight to Q-learning.
- ML Systems: `data-versioning`. `model-drift` also covers retraining and continual learning. A/B testing should link `math/statistics/causal-inference` rather than re-teach causality.

**New section: Time Series** (after Feature Engineering): `forecasting-basics`, `time-series-features`, `backtesting`, `classical-forecasting` (exponential smoothing, ARIMA). Link `math/statistics/time-series` for the theory; this section is the ML practice. Deep forecasters are in `applied-dl/other-domains/time-series-dl`.

**Appendix pages:** `glossary`, `metrics-cheat-sheet`, `model-chooser`, `scikit-learn-guide`.

**New section: Exploratory Analysis** _(added 2026-10-18, before Feature Engineering)_. The user wants this thorough: no important chart missing, each chart drawn well. Organised by chart family; every family note covers each chart's purpose, when it misleads, and the seaborn call (matplotlib only where seaborn has no function). Stubs, in order:
`eda-workflow`, `data-profiling`, `choosing-a-chart`, `distribution-charts` (histogram, KDE, ECDF, box, violin, strip, swarm, ridgeline, Q-Q), `relationship-charts` (scatter, hexbin, 2D KDE, bubble, regplot, pair plot, correlation heatmap), `comparison-charts` (bar, grouped/stacked, dot, lollipop, dumbbell, slope), `composition-charts` (stacked area, waffle, mosaic, pie/donut and why not, Sankey), `many-category-charts` (treemap, sunburst, Pareto, sorted top-k + other; the case of hundreds of classes or labels, common in NLP), `time-series-charts` (line, area, seasonal, lag, ACF, calendar heatmap), `high-dimensional-charts` (small multiples/facets, parallel coordinates, clustered heatmap, PCA/UMAP projections), `maps-and-networks` (choropleth, point map, node-link, adjacency matrix), `model-diagnostic-charts` (residuals, confusion heatmap, ROC/PR, calibration, learning curves, SHAP, partial dependence; link the Model Evaluation notes instead of repeating the metrics), `chart-design` (colour maps, colour-blind safety, labels, annotation, log scales), `visualization-pitfalls` (truncated and dual axes, overplotting, rainbow maps, Simpson's paradox).
Figures: each family note needs interactive figures that draw the charts on the same small dataset, so the reader can switch chart type and see what each one reveals or hides. Use the design tokens; chart colours follow the figure rules in CLAUDE.md. Python blocks use seaborn and matplotlib but cannot print an image: print the numbers the chart encodes (bin counts, quartiles, correlations) so the checker can verify them.

**More appendix pages:** `pandas-guide`, `seaborn-guide` (the user's default plotting library), `matplotlib-guide` (basics, and what seaborn lacks).

**EDA workflow to teach in `eda-workflow`** (agreed with the user 2026-10-18; their habit is univariate, then bivariate, then multivariate, which stays the core):
1. Question first: target, unit of observation (what one row is), the decision the analysis feeds.
2. Split before looking: if a model will follow, set the test set aside and explore only training data (otherwise leakage through the analyst's eyes; link `feature-engineering/data-leakage`).
3. Data-quality pass: types, missingness, duplicates, impossible values, cardinality (`data-profiling`).
4. Univariate: each variable alone (`distribution-charts`).
5. Bivariate, target first: each feature against the target, then feature pairs (`relationship-charts`, `comparison-charts`).
6. Multivariate: interactions, confounders, subgroup flips such as Simpson's paradox (`high-dimensional-charts`).
7. Written findings and hypotheses, handed to Feature Engineering.

**Appendix page added:** `reading-papers` (Reading ML Papers): the claim, how data was split, whether baselines were tuned equally, and whether gains exceed run-to-run noise (link `model-evaluation/comparing-models`).

