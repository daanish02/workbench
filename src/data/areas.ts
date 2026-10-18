// Top-level areas (the tabs in the header) and their sections (sidebar groups).
// To add a new area (e.g. mathematics), add an entry here and put its notes in
// src/content/notes/<area-id>/<section-id>/<note>.mdx.

export interface Section {
  id: string;
  title: string;
}

export interface Area {
  id: string;
  title: string;
  /** One-line pitch shown on the home page card. */
  blurb: string;
  sections: Section[];
}

// area order is the intellectual order: each area leans on the ones before it
export const areas: Area[] = [
  {
    id: 'math',
    title: 'Mathematics',
    blurb: 'The math behind the rest: from logic and proofs to linear algebra, calculus and probability.',
    sections: [
      // learning order: each section leans on the ones before it
      { id: 'foundations', title: 'Foundations' },
      { id: 'discrete-math', title: 'Discrete Math' },
      { id: 'linear-algebra', title: 'Linear Algebra' },
      { id: 'calculus', title: 'Calculus' },
      { id: 'geometry', title: 'Geometry' },
      { id: 'probability', title: 'Probability' },
      { id: 'statistics', title: 'Statistics' },
      { id: 'optimization', title: 'Optimization' },
      { id: 'information-theory', title: 'Information Theory' },
      { id: 'signals-fourier', title: 'Signals & Fourier' },
      { id: 'appendix', title: 'Appendix' },
    ],
  },
  {
    id: 'infra',
    title: 'Computer Hardware',
    blurb: 'The physical layer under operating systems and networks: logic gates, CPUs, memory, storage and GPUs.',
    sections: [
      { id: 'digital-logic', title: 'Digital Logic' },
      { id: 'computer-organization', title: 'Computer Organization' },
      { id: 'cpu-architecture', title: 'CPU Architecture' },
      { id: 'memory-hierarchy', title: 'Memory Hierarchy' },
      { id: 'storage', title: 'Storage' },
      { id: 'networking-hardware', title: 'Networking Hardware' },
      { id: 'gpus-parallelism', title: 'GPUs & Parallelism' },
      { id: 'unconventional-computing', title: 'Unconventional Computing' },
      { id: 'appendix', title: 'Appendix' },
    ],
  },
  {
    id: 'cs',
    title: 'Computer Science',
    blurb:
      'From the fetch-execute cycle to distributed systems: the foundations everyone working in tech should know.',
    sections: [
      // learning order: each section leans on the ones before it
      { id: 'foundations', title: 'Foundations' },
      { id: 'languages', title: 'Programming Languages' },
      { id: 'theory', title: 'Theory of Computation' },
      { id: 'data-structures', title: 'Data Structures' },
      { id: 'algorithms', title: 'Algorithms' },
      { id: 'operating-systems', title: 'Operating Systems' },
      { id: 'networks', title: 'Networks' },
      { id: 'databases', title: 'Databases' },
      { id: 'security', title: 'Security' },
      { id: 'distributed-systems', title: 'Distributed Systems' },
      { id: 'system-design', title: 'System Design' },
      { id: 'data-engineering', title: 'Data Engineering' },
      { id: 'case-studies', title: 'Design Case Studies' },
      { id: 'cloud', title: 'Cloud Computing' },
      { id: 'software-engineering', title: 'Software Engineering' },
      { id: 'appendix', title: 'Appendix' },
    ],
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    blurb: 'Classical ML, from workflow and evaluation to models, ensembles and recommenders.',
    sections: [
      { id: 'ml-foundations', title: 'ML Foundations' },
      { id: 'model-evaluation', title: 'Model Evaluation' },
      { id: 'supervised-regression', title: 'Supervised Regression' },
      { id: 'supervised-classification', title: 'Supervised Classification' },
      { id: 'trees-ensembles', title: 'Trees & Ensembles' },
      { id: 'unsupervised-learning', title: 'Unsupervised Learning' },
      { id: 'dimensionality-reduction', title: 'Dimensionality Reduction' },
      { id: 'recommender-systems', title: 'Recommender Systems' },
      { id: 'feature-engineering', title: 'Feature Engineering' },
      { id: 'shallow-neural-networks', title: 'Shallow Neural Networks' },
      { id: 'reinforcement-learning', title: 'Reinforcement Learning' },
      { id: 'ml-systems', title: 'ML Systems' },
      { id: 'appendix', title: 'Appendix' },
    ],
  },
  {
    id: 'dl',
    title: 'Deep Learning',
    blurb: 'How deep networks learn: architectures, training dynamics and the maths underneath them.',
    sections: [
      { id: 'nn-foundations', title: 'Neural Net Foundations' },
      { id: 'training-optimization', title: 'Training & Optimization' },
      { id: 'convolutional-networks', title: 'Convolutional Networks' },
      { id: 'recurrent-networks', title: 'Recurrent Networks' },
      { id: 'attention-transformers', title: 'Attention & Transformers' },
      { id: 'regularization', title: 'Regularization' },
      { id: 'generative-models', title: 'Generative Models' },
      { id: 'practical-training', title: 'Practical Training' },
      { id: 'deep-reinforcement-learning', title: 'Deep Reinforcement Learning' },
      { id: 'deep-recommenders', title: 'Deep Recommenders' },
      { id: 'appendix', title: 'Appendix' },
    ],
  },
  {
    id: 'applied-dl',
    title: 'Applied Deep Learning',
    blurb: 'Deep learning in practice: language models, agents, vision, vision-language and audio.',
    sections: [
      { id: 'nlp-foundations', title: 'NLP Foundations' },
      { id: 'llm-architecture', title: 'LLM Architecture' },
      { id: 'llm-alignment', title: 'LLM Alignment' },
      { id: 'llm-applications', title: 'LLM Applications' },
      { id: 'agentic-systems', title: 'Agentic Systems' },
      { id: 'computer-vision', title: 'Computer Vision' },
      { id: 'modern-vision', title: 'Modern Vision Architectures' },
      { id: 'vision-language-models', title: 'Vision-Language Models' },
      { id: 'audio-foundations', title: 'Audio Foundations' },
      { id: 'speech-audio-models', title: 'Speech & Audio Models' },
      { id: 'appendix', title: 'Appendix' },
    ],
  },
];

export const getArea = (id: string) => areas.find((a) => a.id === id);
