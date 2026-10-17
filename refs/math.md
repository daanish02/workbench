# Math Knowledge Base — Full Content Plan

This is the complete concept breakdown for the Math KB, expanding the section-level outline into every individual concept page. Each concept becomes one page following the authoring template: intuition → visual/interactive → formal definition → pitfalls → connects-to → self-check.

Tags: **[opt]** = optional depth, included but lower priority. **[later]** = deferred, build only once the core path is solid.

---

## 1. Foundations

Build order: roughly top to bottom — each leans lightly on the one before it.

1. **Propositional logic** — statements, truth tables, AND/OR/NOT, implication, biconditional
2. **Proof techniques** — direct proof, contradiction, induction, contrapositive
3. **Sets** — set notation, operations (union, intersection, complement), subsets, power sets, Venn diagrams
4. **Functions** — domain/range, injective/surjective/bijective, composition, inverse functions
5. **Number systems** — naturals, integers, rationals, reals, irrationals, why each extension was needed
6. **Exponentials and logarithms** — laws of exponents, log as inverse of exponential, change of base, natural log
7. **Trigonometry** — unit circle, radians vs. degrees, sine/cosine/tangent, identities, graphs of trig functions
8. **Complex numbers** — imaginary unit, the complex plane, polar form, Euler's formula
9. **Combinatorics** — counting principle, permutations, combinations, binomial theorem
10. **Sequences and series** — arithmetic/geometric sequences, convergence, sigma notation, common series

**Interactive-heavy pages:** unit circle (draggable angle updating sine/cosine live), Euler's formula (animated — rotating complex exponential tracing the unit circle), binomial theorem (Pascal's triangle builder).

---

## 2. Geometry

1. **Euclidean geometry** — points, lines, angles, triangles, congruence, similarity
2. **Coordinate geometry** — distance formula, midpoint, slope, equations of lines
3. **Conic sections** — circle, ellipse, parabola, hyperbola — as slices of a cone and as equations
4. **Geometric transformations** — translation, rotation, reflection, scaling, composition of transformations
5. [opt] **Polar and spherical coordinates** — converting between coordinate systems, when each is natural
6. [later] **Differential geometry** — curvature, geodesics (deferred until calculus is in place)
7. [later] **Topology basics** — continuity, connectedness, the idea of "shape without distance"

**Interactive-heavy pages:** conic sections (drag a plane through a cone and watch the curve change), transformations (apply a transformation matrix to a shape and watch it move in real time — this one reuses the `TransformViz` component from Linear Algebra).

---

## 3. Linear Algebra _(build first)_

1. **Vectors** — definition, vector addition, scalar multiplication, magnitude, dot product
2. **Matrices as transformations** — a matrix as a function on space, matrix-vector multiplication as a transformation
3. **Systems of linear equations** — Gaussian elimination, row echelon form, existence/uniqueness of solutions
4. **Determinants** — geometric meaning (area/volume scaling), computing 2×2 and 3×3, when a matrix is invertible
5. **Eigenvalues and eigenvectors** — directions unchanged by a transformation, characteristic equation, geometric intuition
6. **Orthogonality** — orthogonal vectors, orthonormal bases, orthogonal matrices
7. **Projections** — projecting a vector onto another vector or subspace, least-squares as a projection
8. **Singular value decomposition (SVD)** — decomposing any matrix into rotate-stretch-rotate
9. **Principal component analysis (PCA)** — using eigenvectors/SVD to find directions of greatest variance
10. **Matrix decompositions** — LU, QR, and why decompositions make computation cheaper
11. [opt] **Tensors** — generalizing vectors/matrices to higher dimensions
12. [later] **Abstract vector spaces** — vector spaces over general fields, basis and dimension in the abstract

**Interactive-heavy pages:** matrices as transformations (the grid-warp demo already prototyped), eigenvectors (same visualizer, eigenvector directions highlighted), SVD (step-through: rotate → stretch → rotate, each step visible), PCA (scatter plot with draggable points, principal axes updating live).

---

## 4. Calculus

1. **Limits** — intuition (approaching a value), formal epsilon-delta definition, limits at infinity
2. **Derivatives** — rate of change, the derivative as a limit, differentiation rules (product, quotient, chain)
3. **Applications of derivatives** — optimization (max/min), related rates, curve sketching
4. **Integrals** — area under a curve, the integral as a limit of sums, fundamental theorem of calculus
5. **Techniques of integration** — substitution, integration by parts, partial fractions
6. **Taylor series** — approximating functions with polynomials, Taylor's theorem, common expansions
7. **Multivariable calculus** — partial derivatives, multiple integrals, the idea of a function of several variables
8. **Gradients, Jacobians, and Hessians** — the gradient as direction of steepest ascent, Jacobian for vector-valued functions, Hessian for curvature
9. **The chain rule (multivariable)** — the backbone of backpropagation, explicit connection called out
10. [opt] **Vector calculus** — divergence, curl, line/surface integrals
11. [later] **Differential equations** — ODEs, separable equations, basic solution methods
12. [later] **Real analysis** — rigorous foundations of limits/continuity, for anyone who wants the proofs behind calculus

**Interactive-heavy pages:** limits (epsilon-delta "closing in" animation, scrubbable), derivatives (tangent line slider following a curve), Taylor series (adding terms one at a time, watching the approximation improve), gradient visualizer (3D surface with gradient arrows).

---

## 5. Probability

1. **Random variables** — discrete vs. continuous, probability mass/density functions
2. **Common distributions** — uniform, binomial, Poisson, normal/Gaussian, exponential
3. **Expectation and variance** — mean, variance, standard deviation, linearity of expectation
4. **Bayes' rule** — conditional probability, the rule itself, worked examples (medical testing, spam filtering)
5. **Joint and conditional distributions** — joint PMFs/PDFs, marginal distributions, independence
6. **Law of large numbers** — why averages stabilize, weak vs. strong LLN intuition
7. **Central limit theorem** — why so many things end up normally distributed, simulation-based intuition
8. **Markov chains** — states, transition matrices, stationary distributions
9. [opt] **Stochastic processes** — generalizing beyond Markov chains, continuous-time processes
10. [later] **Measure theory** — the rigorous foundation beneath probability
11. [later] **Stochastic calculus** — Brownian motion, Itô's lemma (ties into Finance)

**Interactive-heavy pages:** distribution explorer (sliders change a distribution's parameters, shape updates live), CLT simulator (sample repeatedly from any distribution, watch the sampling distribution of the mean converge to normal), Markov chain visualizer (clickable state graph, watch probability mass flow between states over time).

---

## 6. Statistics

1. **Estimation** — point estimates, maximum likelihood estimation (MLE), maximum a posteriori (MAP)
2. **Hypothesis testing** — null/alternative hypotheses, p-values, Type I/II errors
3. **Confidence intervals** — what a confidence interval actually means (commonly misunderstood — good pitfall material)
4. **Bayesian inference** — priors, likelihoods, posteriors, contrasted directly with frequentist estimation
5. **Regression** — linear regression, least squares, interpreting coefficients
6. **Bootstrap methods** — resampling to estimate uncertainty without distributional assumptions
7. **Sampling** — sampling methods, sampling bias, why sample size matters
8. [opt] **Time series** — trends, seasonality, autocorrelation
9. [later] **Causal inference** — correlation vs. causation, confounders, basic causal graphs

**Interactive-heavy pages:** confidence interval simulator (repeated sampling showing what "95% confidence" really means over many trials), regression (draggable points, line updates live, residuals shown), bootstrap (resample a dataset repeatedly, watch the estimate's distribution build up).

---

## 7. Optimization

1. **Convexity** — convex sets and functions, why convexity makes optimization tractable
2. **Gradient descent** — the core algorithm, step size, convergence intuition
3. **Gradient descent variants** — momentum, RMSProp, Adam — what problem each one solves
4. **Constrained optimization** — optimizing subject to constraints, feasible regions
5. **Lagrange multipliers** — the geometric intuition (gradients aligning at the optimum), worked examples
6. **Duality** — primal/dual problems, weak and strong duality, why duality is useful
7. **Linear programming** — the simplex method's intuition, feasible region as a polytope
8. [opt] **Numerical methods** — Newton's method, root-finding, numerical stability basics
9. [later] **Non-convex and integer optimization** — local minima, combinatorial optimization

**Interactive-heavy pages:** gradient descent playground (adjustable 3D loss surface, compare vanilla/momentum/Adam side by side), Lagrange multipliers (2D constrained optimization, draggable constraint curve, gradient vectors shown aligning at the solution).

---

## 8. Discrete Math

1. **Graph theory basics** — vertices, edges, directed/undirected graphs, paths, cycles
2. **Graph algorithms** — BFS/DFS, shortest paths, minimum spanning trees
3. **Number theory** — divisibility, primes, greatest common divisor, the Euclidean algorithm
4. **Modular arithmetic** — clock arithmetic, modular inverses, applications to cryptography
5. **Recurrence relations** — defining sequences recursively, solving simple recurrences
6. [opt] **Cryptography math** — RSA's mathematical basis, why modular exponentiation is hard to invert
7. [later] **Abstract algebra** — groups, rings, fields — the structures beneath much of discrete math

**Interactive-heavy pages:** graph traversal visualizer (step through BFS/DFS on a graph you build yourself), modular arithmetic clock (visual clock-face reducer), RSA walkthrough (step-through of key generation and encryption with small numbers).

---

## 9. Information Theory

1. **Entropy** — uncertainty as a quantity, Shannon entropy, intuition via "20 questions"
2. **Cross-entropy** — the connection to entropy, why it's used as a loss function
3. **KL divergence** — measuring the difference between two distributions, why it's not symmetric
4. **Mutual information** — how much one variable tells you about another
5. [later] **Coding theory** — Huffman coding, the connection between entropy and compression

**Interactive-heavy pages:** entropy calculator (adjust a distribution's shape, watch entropy change live — "fair coin vs. loaded coin" as the anchoring example), KL divergence visualizer (two overlaid distributions, divergence value updates as you reshape one).

---

## 10. Signals and Fourier Analysis [opt]

1. **Fourier series** — representing periodic functions as sums of sines and cosines
2. **Fourier transform** — moving from periodic to arbitrary functions, frequency-domain intuition
3. **Convolution** — the operation itself, intuition as "sliding and summing"
4. **Sampling** — the sampling theorem, aliasing, why sample rate matters

**Interactive-heavy pages:** Fourier epicycles (the classic animation — circles drawing a shape by summing rotating vectors), convolution visualizer (slide one function across another, watch the output build up point by point).

---

## Cross-cutting: Notation Reference

Not a section — a standalone, always-accessible page. Every symbol used across every section above gets an entry: name, pronunciation, plain-English meaning, tiny example, and which concept pages use it. Every rendered equation site-wide links its symbols back here via hover/tap tooltips.

---

## Summary counts

| Section            | Core concepts | Opt | Later |
| ------------------ | ------------- | --- | ----- |
| Foundations        | 10            | 0   | 0     |
| Geometry           | 4             | 1   | 2     |
| Linear Algebra     | 10            | 1   | 1     |
| Calculus           | 9             | 1   | 2     |
| Probability        | 8             | 1   | 2     |
| Statistics         | 7             | 1   | 1     |
| Optimization       | 7             | 1   | 1     |
| Discrete Math      | 5             | 1   | 1     |
| Information Theory | 4             | 0   | 1     |
| Signals/Fourier    | 4 (all opt)   | —   | —     |

**~68 core concept pages** total before any [opt]/[later] expansion — a realistic full scope for the Math KB, not counting the notation reference page itself.
