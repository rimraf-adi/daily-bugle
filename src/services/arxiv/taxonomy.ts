/**
 * Complete arXiv Subject & Category Taxonomy in TypeScript.
 * Covers all 8 main disciplines and ~175 subcategories supported by arXiv.
 */

export const SUBJECT_TAXONOMY: Record<string, Record<string, string>> = {
  "Physics - Astrophysics": {
    "astro-ph.*": "All Astrophysics (General)",
    "astro-ph.GA": "Astrophysics of Galaxies",
    "astro-ph.CO": "Cosmology and Nongalactic Astrophysics",
    "astro-ph.EP": "Earth and Planetary Astrophysics",
    "astro-ph.HE": "High Energy Astrophysical Phenomena",
    "astro-ph.IM": "Instrumentation and Methods for Astrophysics",
    "astro-ph.SR": "Solar and Stellar Astrophysics",
  },
  "Physics - Condensed Matter": {
    "cond-mat.*": "All Condensed Matter (General)",
    "cond-mat.dis-nn": "Disordered Systems and Neural Networks",
    "cond-mat.mtrl-sci": "Materials Science",
    "cond-mat.mes-hall": "Mesoscale and Nanoscale Physics",
    "cond-mat.other": "Other Condensed Matter",
    "cond-mat.quant-gas": "Quantum Gases",
    "cond-mat.soft": "Soft Condensed Matter",
    "cond-mat.stat-mech": "Statistical Mechanics",
    "cond-mat.str-el": "Strongly Correlated Electrons",
    "cond-mat.supr-con": "Superconductivity",
  },
  "Physics - General Relativity and Quantum Cosmology": {
    "gr-qc": "General Relativity and Quantum Cosmology",
  },
  "Physics - High Energy Physics": {
    "hep-ex": "High Energy Physics - Experiment",
    "hep-lat": "High Energy Physics - Lattice",
    "hep-ph": "High Energy Physics - Phenomenology",
    "hep-th": "High Energy Physics - Theory",
  },
  "Physics - Mathematical Physics": {
    "math-ph": "Mathematical Physics",
  },
  "Physics - Nonlinear Sciences": {
    "nlin.*": "All Nonlinear Sciences (General)",
    "nlin.AO": "Adaptation and Self-Organizing Systems",
    "nlin.CG": "Cellular Automata and Lattice Gases",
    "nlin.CD": "Chaotic Dynamics",
    "nlin.SI": "Exactly Solvable and Integrable Systems",
    "nlin.PS": "Pattern Formation and Solitons",
  },
  "Physics - Nuclear": {
    "nucl-ex": "Nuclear Experiment",
    "nucl-th": "Nuclear Theory",
  },
  "Physics - General & Applied": {
    "physics.*": "All Physics (General)",
    "physics.acc-ph": "Accelerator Physics",
    "physics.app-ph": "Applied Physics",
    "physics.ao-ph": "Atmospheric and Oceanic Physics",
    "physics.atm-clus": "Atomic and Molecular Clusters",
    "physics.atom-ph": "Atomic Physics",
    "physics.bio-ph": "Biological Physics",
    "physics.chem-ph": "Chemical Physics",
    "physics.class-ph": "Classical Physics",
    "physics.comp-ph": "Computational Physics",
    "physics.data-an": "Data Analysis, Statistics and Probability",
    "physics.flu-dyn": "Fluid Dynamics",
    "physics.gen-ph": "General Physics",
    "physics.geo-ph": "Geophysics",
    "physics.hist-ph": "History and Philosophy of Physics",
    "physics.ins-det": "Instrumentation and Detectors",
    "physics.med-ph": "Medical Physics",
    "physics.optics": "Optics",
    "physics.soc-ph": "Physics and Society",
    "physics.ed-ph": "Physics Education",
    "physics.plasm-ph": "Plasma Physics",
    "physics.pop-ph": "Popular Physics",
    "physics.space-ph": "Space Physics",
  },
  "Physics - Quantum Physics": {
    "quant-ph": "Quantum Physics",
  },
  "Mathematics": {
    "math.*": "All Mathematics (General)",
    "math.AG": "Algebraic Geometry",
    "math.AT": "Algebraic Topology",
    "math.AP": "Analysis of PDEs",
    "math.CT": "Category Theory",
    "math.CA": "Classical Analysis and ODEs",
    "math.CO": "Combinatorics",
    "math.AC": "Commutative Algebra",
    "math.CV": "Complex Variables",
    "math.DG": "Differential Geometry",
    "math.DS": "Dynamical Systems",
    "math.FA": "Functional Analysis",
    "math.GM": "General Mathematics",
    "math.GN": "General Topology",
    "math.GT": "Geometric Topology",
    "math.GR": "Group Theory",
    "math.HO": "History and Overview",
    "math.IT": "Information Theory (Math)",
    "math.KT": "K-Theory and Homology",
    "math.LO": "Logic (Math)",
    "math.MP": "Mathematical Physics",
    "math.MG": "Metric Geometry",
    "math.NT": "Number Theory",
    "math.NA": "Numerical Analysis (Math)",
    "math.OA": "Operator Algebras",
    "math.OC": "Optimization and Control",
    "math.PR": "Probability",
    "math.QA": "Quantum Algebra",
    "math.RT": "Representation Theory",
    "math.RA": "Rings and Algebras",
    "math.SP": "Spectral Theory",
    "math.ST": "Statistics Theory (Math)",
    "math.SG": "Symplectic Geometry",
  },
  "Computer Science": {
    "cs.*": "All Computer Science (General)",
    "cs.AI": "Artificial Intelligence",
    "cs.CL": "Computation and Language (NLP)",
    "cs.CC": "Computational Complexity",
    "cs.CE": "Computational Engineering, Finance, and Science",
    "cs.CG": "Computational Geometry",
    "cs.GT": "Computer Science and Game Theory",
    "cs.CV": "Computer Vision and Pattern Recognition",
    "cs.CY": "Computers and Society",
    "cs.CR": "Cryptography and Security",
    "cs.DS": "Data Structures and Algorithms",
    "cs.DB": "Databases",
    "cs.DL": "Digital Libraries",
    "cs.DM": "Discrete Mathematics",
    "cs.DC": "Distributed, Parallel, and Cluster Computing",
    "cs.ET": "Emerging Technologies",
    "cs.FL": "Formal Languages and Automata Theory",
    "cs.GL": "General Literature",
    "cs.GR": "Graphics",
    "cs.AR": "Hardware Architecture",
    "cs.HC": "Human-Computer Interaction",
    "cs.IR": "Information Retrieval",
    "cs.IT": "Information Theory (CS)",
    "cs.LO": "Logic in Computer Science",
    "cs.LG": "Machine Learning",
    "cs.MS": "Mathematical Software",
    "cs.MA": "Multiagent Systems",
    "cs.MM": "Multimedia",
    "cs.NI": "Networking and Internet Architecture",
    "cs.NE": "Neural and Evolutionary Computing",
    "cs.NA": "Numerical Analysis (CS)",
    "cs.OS": "Operating Systems",
    "cs.OH": "Other Computer Science",
    "cs.PF": "Performance",
    "cs.PL": "Programming Languages",
    "cs.RO": "Robotics",
    "cs.SI": "Social and Information Networks",
    "cs.SE": "Software Engineering",
    "cs.SD": "Sound",
    "cs.SC": "Symbolic Computation",
    "cs.SY": "Systems and Control (CS)",
  },
  "Quantitative Biology": {
    "q-bio.*": "All Quantitative Biology (General)",
    "q-bio.BM": "Biomolecules",
    "q-bio.CB": "Cell Behavior",
    "q-bio.GN": "Genomics",
    "q-bio.MN": "Molecular Networks",
    "q-bio.NC": "Neurons and Cognition",
    "q-bio.OT": "Other Quantitative Biology",
    "q-bio.PE": "Populations and Evolution",
    "q-bio.QM": "Quantitative Methods",
    "q-bio.SC": "Subcellular Processes",
    "q-bio.TO": "Tissues and Organs",
  },
  "Quantitative Finance": {
    "q-fin.*": "All Quantitative Finance (General)",
    "q-fin.CP": "Computational Finance",
    "q-fin.EC": "Economics (Finance)",
    "q-fin.GN": "General Finance",
    "q-fin.MF": "Mathematical Finance",
    "q-fin.PM": "Portfolio Management",
    "q-fin.PR": "Pricing of Securities",
    "q-fin.RM": "Risk Management",
    "q-fin.ST": "Statistical Finance",
    "q-fin.TR": "Trading and Market Microstructure",
  },
  "Statistics": {
    "stat.*": "All Statistics (General)",
    "stat.AP": "Applications",
    "stat.CO": "Computation",
    "stat.ML": "Machine Learning (Statistics)",
    "stat.ME": "Methodology",
    "stat.OT": "Other Statistics",
    "stat.TH": "Statistics Theory",
  },
  "Electrical Engineering and Systems Science": {
    "eess.*": "All Electrical Engineering and Systems Science (General)",
    "eess.AS": "Audio and Speech Processing",
    "eess.IV": "Image and Video Processing",
    "eess.SP": "Signal Processing",
    "eess.SY": "Systems and Control (EESS)",
  },
  "Economics": {
    "econ.*": "All Economics (General)",
    "econ.EM": "Econometrics",
    "econ.GN": "General Economics",
    "econ.TH": "Theoretical Economics",
  },
};

// Flattened lookup dictionary: code -> Human-Readable Name
export const CATEGORY_MAP: Record<string, string> = {};

for (const group of Object.values(SUBJECT_TAXONOMY)) {
  Object.assign(CATEGORY_MAP, group);
}

// Aliases for bare codes
Object.assign(CATEGORY_MAP, {
  "astro-ph": "Astrophysics",
  "cond-mat": "Condensed Matter",
  "nlin": "Nonlinear Sciences",
  "physics": "Physics",
  "math": "Mathematics",
  "cs": "Computer Science",
  "q-bio": "Quantitative Biology",
  "q-fin": "Quantitative Finance",
  "stat": "Statistics",
  "eess": "Electrical Engineering and Systems Science",
  "econ": "Economics",
});

/**
 * Get human-readable name of an arXiv category code.
 */
export function getCategoryName(categoryCode: string): string {
  const clean = categoryCode.trim();
  return CATEGORY_MAP[clean] || clean;
}

/**
 * Search categories by keyword across code and descriptive name.
 */
export function searchCategories(query: string): Record<string, string> {
  const q = query.toLowerCase().trim();
  const results: Record<string, string> = {};
  for (const [code, name] of Object.entries(CATEGORY_MAP)) {
    if (code.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
      results[code] = name;
    }
  }
  return results;
}

/**
 * Get all subcategories under a specific discipline or prefix.
 */
export function getCategoriesBySubject(subjectPrefix: string): Record<string, string> {
  const normalized = subjectPrefix.toLowerCase().trim();
  const results: Record<string, string> = {};

  for (const [subject, cats] of Object.entries(SUBJECT_TAXONOMY)) {
    if (subject.toLowerCase().includes(normalized)) {
      Object.assign(results, cats);
    }
  }

  if (Object.keys(results).length === 0) {
    for (const [code, name] of Object.entries(CATEGORY_MAP)) {
      if (code.toLowerCase().startsWith(normalized)) {
        results[code] = name;
      }
    }
  }

  return results;
}

/**
 * List all subject disciplines.
 */
export function listSubjects(): string[] {
  return Object.keys(SUBJECT_TAXONOMY);
}

/**
 * Normalize bare top-level disciplines (e.g. 'cat:cs' or 'cat:stat') to
 * wildcard matches ('cat:cs.*' or 'cat:stat.*') because arXiv's API rejects
 * bare archive queries and requires subcategories or wildcard.
 */
export function normalizeArxivQuery(query: string): string {
  const bareDisciplines = [
    "cs",
    "stat",
    "math",
    "econ",
    "q-bio",
    "q-fin",
    "eess",
    "physics",
    "nlin",
    "astro-ph",
    "cond-mat",
  ];
  let normalized = query;
  for (const disc of bareDisciplines) {
    const regex = new RegExp(`\\bcat:${disc}(?![\\.\\*])\\b`, "g");
    normalized = normalized.replace(regex, `cat:${disc}.*`);
  }
  return normalized;
}
