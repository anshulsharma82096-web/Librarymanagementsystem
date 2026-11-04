/**
 * Alexandria AI - In-Browser Client-Side Engine for GitHub Pages & Static Web Deployments
 * Enables full A* pathfinding, RAG recommendations, 5-axis comparison,
 * and conversational librarian agent Athena directly in the user's browser without requiring a backend server.
 */

const STATIC_BOOKS = [
  {
    "id": "cs-aima",
    "title": "Artificial Intelligence: A Modern Approach",
    "author": "Stuart Russell & Peter Norvig",
    "year": 2020,
    "ddc_code": "006.3 RUS",
    "loc_code": "Q335 .R87 2020",
    "category": "Computer Science & AI",
    "subcategories": ["Artificial Intelligence", "Machine Learning", "Logic & Reasoning"],
    "tags": ["agents", "search algorithms", "probabilistic reasoning", "robotics", "nlp"],
    "synopsis": "The definitive, comprehensive textbook introducing artificial intelligence from the unified perspective of intelligent agents interacting with their environments.",
    "key_excerpt": "An agent is anything that can be viewed as perceiving its environment through sensors and acting upon that environment through actuators. We define AI as the study of agents that receive percepts from the environment and perform actions.",
    "location": {
      "floor": 1,
      "section": "Sci-Tech Atrium",
      "aisle": "B1",
      "shelf_unit": 2,
      "tier": 3,
      "shelf_label": "B1-02-EyeLevel",
      "x": 320,
      "y": 180
    },
    "metrics": { "complexity": 8.5, "pacing": 5.0, "theoretical_depth": 9.0, "practical_utility": 8.5, "thematic_weight": 7.0 },
    "prerequisites": ["Basic Probability", "Discrete Mathematics", "Python"],
    "reading_paths": ["AI Foundations Path", "Autonomous Systems Path"],
    "copies_total": 4,
    "copies_available": 3,
    "rating": 4.9,
    "cover_color": "#1e3a8a"
  },
  {
    "id": "cs-deep-learning",
    "title": "Deep Learning",
    "author": "Ian Goodfellow, Yoshua Bengio & Aaron Courville",
    "year": 2016,
    "ddc_code": "006.3 GOO",
    "loc_code": "Q325.5 .G66 2016",
    "category": "Computer Science & AI",
    "subcategories": ["Deep Learning", "Neural Networks", "Mathematics for ML"],
    "tags": ["backpropagation", "convolutional networks", "transformers", "optimization"],
    "synopsis": "An essential mathematical and conceptual foundation of deep learning, covering applied math, deep networks, and research perspectives.",
    "key_excerpt": "Deep learning allows computational models that are composed of multiple processing layers to learn representations of data with multiple levels of abstraction.",
    "location": {
      "floor": 1,
      "section": "Sci-Tech Atrium",
      "aisle": "B1",
      "shelf_unit": 3,
      "tier": 2,
      "shelf_label": "B1-03-Lower",
      "x": 320,
      "y": 240
    },
    "metrics": { "complexity": 9.2, "pacing": 4.5, "theoretical_depth": 9.5, "practical_utility": 8.0, "thematic_weight": 6.5 },
    "prerequisites": ["cs-aima", "Multivariable Calculus", "Linear Algebra"],
    "reading_paths": ["AI Foundations Path", "Advanced Neural Architecture"],
    "copies_total": 3,
    "copies_available": 2,
    "rating": 4.8,
    "cover_color": "#1e40af"
  },
  {
    "id": "cs-superintelligence",
    "title": "Superintelligence: Paths, Dangers, Strategies",
    "author": "Nick Bostrom",
    "year": 2014,
    "ddc_code": "006.3 BOS",
    "loc_code": "Q335 .B67 2014",
    "category": "Computer Science & AI",
    "subcategories": ["AI Safety", "Philosophy of Technology", "Futurism"],
    "tags": ["alignment", "existential risk", "orthogonality thesis", "instrumental convergence"],
    "synopsis": "A pioneering examination of what happens when machine brains surpass human brains, exploring control problems, value loading, and strategic choices.",
    "key_excerpt": "Before the prospect of an intelligence explosion, we humans are like small children playing with a bomb. The trick is to hold off on pulling the pin until we have built the containment dome.",
    "location": {
      "floor": 1,
      "section": "Sci-Tech Atrium",
      "aisle": "B2",
      "shelf_unit": 1,
      "tier": 3,
      "shelf_label": "B2-01-EyeLevel",
      "x": 420,
      "y": 120
    },
    "metrics": { "complexity": 7.8, "pacing": 6.8, "theoretical_depth": 8.5, "practical_utility": 5.5, "thematic_weight": 9.8 },
    "prerequisites": ["cs-aima"],
    "reading_paths": ["AI Safety & Governance Path", "Existential Risks"],
    "copies_total": 2,
    "copies_available": 1,
    "rating": 4.7,
    "cover_color": "#312e81"
  },
  {
    "id": "cs-sicp",
    "title": "Structure and Interpretation of Computer Programs",
    "author": "Harold Abelson & Gerald Jay Sussman",
    "year": 1996,
    "ddc_code": "005.1 ABE",
    "loc_code": "QA76.6 .A255 1996",
    "category": "Computer Science & AI",
    "subcategories": ["Programming Languages", "Functional Programming", "Computer Science Foundations"],
    "tags": ["scheme", "lisp", "abstraction", "metalinguistic abstraction", "recursion"],
    "synopsis": "The legendary MIT 'Wizard Book' teaching the fundamentals of computational process, abstraction layers, and interpreter design.",
    "key_excerpt": "Programs must be written for people to read, and only incidentally for machines to execute. The computer revolution is a revolution in the way we think and in the way we express what we think.",
    "location": {
      "floor": 1,
      "section": "Sci-Tech Atrium",
      "aisle": "B2",
      "shelf_unit": 4,
      "tier": 1,
      "shelf_label": "B2-04-Bottom",
      "x": 420,
      "y": 300
    },
    "metrics": { "complexity": 8.8, "pacing": 6.0, "theoretical_depth": 9.2, "practical_utility": 8.2, "thematic_weight": 8.0 },
    "prerequisites": ["Introductory Programming"],
    "reading_paths": ["Software Craftsmanship Path", "Language Design"],
    "copies_total": 3,
    "copies_available": 3,
    "rating": 4.9,
    "cover_color": "#4338ca"
  },
  {
    "id": "sci-brief-history",
    "title": "A Brief History of Time",
    "author": "Stephen Hawking",
    "year": 1988,
    "ddc_code": "530.1 HAW",
    "loc_code": "QB981 .H377 1988",
    "category": "Natural Sciences & Physics",
    "subcategories": ["Cosmology", "Theoretical Physics", "Astrophysics"],
    "tags": ["black holes", "big bang", "quantum gravity", "time dilation", "singularity"],
    "synopsis": "Hawking's landmark exploration of cosmology, from the Big Bang to black holes and the search for a unified theory of physics.",
    "key_excerpt": "If we discover a complete theory, it should in time be understandable in broad principle by everyone, not just a few scientists. Then we would know the mind of God.",
    "location": {
      "floor": 1,
      "section": "Sci-Tech Atrium",
      "aisle": "A1",
      "shelf_unit": 2,
      "tier": 3,
      "shelf_label": "A1-02-EyeLevel",
      "x": 120,
      "y": 180
    },
    "metrics": { "complexity": 6.8, "pacing": 7.8, "theoretical_depth": 8.5, "practical_utility": 4.0, "thematic_weight": 9.2 },
    "prerequisites": [],
    "reading_paths": ["Cosmos & Physics Path"],
    "copies_total": 5,
    "copies_available": 3,
    "rating": 4.7,
    "cover_color": "#0284c7"
  },
  {
    "id": "sci-geb",
    "title": "Gödel, Escher, Bach: An Eternal Golden Braid",
    "author": "Douglas Hofstadter",
    "year": 1979,
    "ddc_code": "510.1 HOF",
    "loc_code": "QA9.8 .H63 1979",
    "category": "Natural Sciences & Physics",
    "subcategories": ["Cognitive Science", "Mathematical Logic", "Philosophy of Mind"],
    "tags": ["strange loops", "incompleteness theorem", "self-reference", "consciousness", "fugue"],
    "synopsis": "A Pulitzer Prize-winning masterpiece illuminating how human thought and consciousness emerge from meaningless chemical symbols through recursive strange loops.",
    "key_excerpt": "The 'Strange Loop' phenomenon occurs whenever, by moving upwards or downwards through the levels of some hierarchical system, we unexpectedly find ourselves back where we started.",
    "location": {
      "floor": 1,
      "section": "Sci-Tech Atrium",
      "aisle": "A2",
      "shelf_unit": 3,
      "tier": 3,
      "shelf_label": "A2-03-EyeLevel",
      "x": 220,
      "y": 240
    },
    "metrics": { "complexity": 9.0, "pacing": 6.2, "theoretical_depth": 9.8, "practical_utility": 6.0, "thematic_weight": 9.5 },
    "prerequisites": ["Curiosity for Logic and Puzzles"],
    "reading_paths": ["Cognition & Consciousness Path", "AI Foundations Path"],
    "copies_total": 3,
    "copies_available": 2,
    "rating": 4.9,
    "cover_color": "#6366f1"
  },
  {
    "id": "lit-dune",
    "title": "Dune",
    "author": "Frank Herbert",
    "year": 1965,
    "ddc_code": "813.54 HER",
    "loc_code": "PS3558.E63 D8 1965",
    "category": "Literature & Speculative Fiction",
    "subcategories": ["Sci-Fi Epic", "Space Opera", "Ecological Fiction"],
    "tags": ["arrakis", "spice melange", "ecology", "messianism", "feudalism", "bene gesserit"],
    "synopsis": "Set on the desert planet Arrakis, Dune is the masterwork of science fiction blending ecology, religion, politics, and the perilous traps of prophetic heroism.",
    "key_excerpt": "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "C1",
      "shelf_unit": 1,
      "tier": 3,
      "shelf_label": "C1-01-EyeLevel",
      "x": 140,
      "y": 140
    },
    "metrics": { "complexity": 8.0, "pacing": 7.5, "theoretical_depth": 9.0, "practical_utility": 5.0, "thematic_weight": 9.7 },
    "prerequisites": [],
    "reading_paths": ["Speculative Sci-Fi Masterworks", "Political & Ecological Sci-Fi"],
    "copies_total": 6,
    "copies_available": 2,
    "rating": 4.9,
    "cover_color": "#ea580c"
  },
  {
    "id": "lit-neuromancer",
    "title": "Neuromancer",
    "author": "William Gibson",
    "year": 1984,
    "ddc_code": "813.54 GIB",
    "loc_code": "PS3557.I2264 N48 1984",
    "category": "Literature & Speculative Fiction",
    "subcategories": ["Cyberpunk", "Dystopian Sci-Fi"],
    "tags": ["cyberspace", "deckers", "artificial intelligence", "matrix", "zaibatsus"],
    "synopsis": "The seminal cyberpunk novel that coined 'cyberspace' and envisioned the convergence of street-level hustlers, autonomous AI entities, and corporate dystopia.",
    "key_excerpt": "The sky above the port was the color of television, tuned to a dead channel. Cyberspace: a consensual hallucination experienced daily by billions of legitimate operators.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "C1",
      "shelf_unit": 3,
      "tier": 2,
      "shelf_label": "C1-03-Lower",
      "x": 140,
      "y": 260
    },
    "metrics": { "complexity": 7.9, "pacing": 8.6, "theoretical_depth": 8.2, "practical_utility": 4.0, "thematic_weight": 8.9 },
    "prerequisites": [],
    "reading_paths": ["Cyberpunk & Digital Futures", "Speculative Sci-Fi Masterworks"],
    "copies_total": 4,
    "copies_available": 3,
    "rating": 4.7,
    "cover_color": "#0ea5e9"
  },
  {
    "id": "lit-1984",
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "ddc_code": "823.912 ORW",
    "loc_code": "PR6029.R8 N5 1949",
    "category": "Literature & Speculative Fiction",
    "subcategories": ["Dystopian Classic", "Political Fiction"],
    "tags": ["big brother", "newspeak", "surveillance", "doublethink", "thoughtcrime"],
    "synopsis": "Orwell's chilling vision of totalitarian tyranny, psychological manipulation, surveillance capitalism, and the erosion of objective truth.",
    "key_excerpt": "War is peace. Freedom is slavery. Ignorance is strength. Power is not a means; it is an end. One does not establish a dictatorship in order to safeguard a revolution; one makes the revolution in order to establish the dictatorship.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "C2",
      "shelf_unit": 2,
      "tier": 3,
      "shelf_label": "C2-02-EyeLevel",
      "x": 220,
      "y": 200
    },
    "metrics": { "complexity": 7.0, "pacing": 8.5, "theoretical_depth": 8.8, "practical_utility": 7.5, "thematic_weight": 9.9 },
    "prerequisites": [],
    "reading_paths": ["Dystopian Systems & Society", "Speculative Sci-Fi Masterworks"],
    "copies_total": 8,
    "copies_available": 5,
    "rating": 4.9,
    "cover_color": "#dc2626"
  },
  {
    "id": "lit-brave-new-world",
    "title": "Brave New World",
    "author": "Aldous Huxley",
    "year": 1932,
    "ddc_code": "823.912 HUX",
    "loc_code": "PR6015.U9 B7 1932",
    "category": "Literature & Speculative Fiction",
    "subcategories": ["Dystopian Classic", "Social Satire"],
    "tags": ["soma", "conditioning", "technocracy", "genetic engineering", "hedonism"],
    "synopsis": "In contrast to Orwellian coercion, Huxley imagines a world subjugated not through brute force, but through synthetic pleasures, conditioning, and engineered happiness.",
    "key_excerpt": "Universal happiness keeps the wheels steadily turning; truth and beauty can't. A really efficient totalitarian state would be one in which the all-powerful executive of political bosses control a population of slaves who do not have to be coerced.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "C2",
      "shelf_unit": 4,
      "tier": 2,
      "shelf_label": "C2-04-Lower",
      "x": 220,
      "y": 320
    },
    "metrics": { "complexity": 7.2, "pacing": 8.0, "theoretical_depth": 8.6, "practical_utility": 6.8, "thematic_weight": 9.5 },
    "prerequisites": [],
    "reading_paths": ["Dystopian Systems & Society"],
    "copies_total": 5,
    "copies_available": 4,
    "rating": 4.65,
    "cover_color": "#7c3aed"
  },
  {
    "id": "lit-foundation",
    "title": "Foundation",
    "author": "Isaac Asimov",
    "year": 1951,
    "ddc_code": "813.54 ASI",
    "loc_code": "PS3551.S5 F6 1951",
    "category": "Literature & Speculative Fiction",
    "subcategories": ["Sci-Fi Epic", "Space Opera", "Sociological Sci-Fi"],
    "tags": ["psychohistory", "hari seldon", "galactic empire", "collapse", "encyclopedia"],
    "synopsis": "Hari Seldon uses psychohistory—a mathematical sociology—to foresee the imminent fall of the Galactic Empire and seeds a colony of savants to shorten the dark age.",
    "key_excerpt": "Violence is the last refuge of the incompetent. Psychohistory could predict the behavior of quadrillions of humans with statistical certainty, but individual human will remains an untamable variable.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "C3",
      "shelf_unit": 1,
      "tier": 3,
      "shelf_label": "C3-01-EyeLevel",
      "x": 300,
      "y": 140
    },
    "metrics": { "complexity": 7.5, "pacing": 7.8, "theoretical_depth": 8.5, "practical_utility": 5.5, "thematic_weight": 9.1 },
    "prerequisites": [],
    "reading_paths": ["Speculative Sci-Fi Masterworks", "Political & Ecological Sci-Fi"],
    "copies_total": 5,
    "copies_available": 3,
    "rating": 4.8,
    "cover_color": "#4f46e5"
  },
  {
    "id": "phil-thinking-fast-slow",
    "title": "Thinking, Fast and Slow",
    "author": "Daniel Kahneman",
    "year": 2011,
    "ddc_code": "153.4 KAH",
    "loc_code": "BF441 .K238 2011",
    "category": "Philosophy & Psychology",
    "subcategories": ["Cognitive Psychology", "Behavioral Economics", "Decision Theory"],
    "tags": ["system 1 and system 2", "heuristics", "biases", "loss aversion", "prospect theory"],
    "synopsis": "Nobel laureate Kahneman synthesizes decades of behavioral research revealing the two modes that drive the way we think and decide.",
    "key_excerpt": "System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control. System 2 allocates attention to effortful mental operations.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "D1",
      "shelf_unit": 1,
      "tier": 3,
      "shelf_label": "D1-01-EyeLevel",
      "x": 420,
      "y": 140
    },
    "metrics": { "complexity": 7.2, "pacing": 7.4, "theoretical_depth": 8.8, "practical_utility": 9.2, "thematic_weight": 8.5 },
    "prerequisites": [],
    "reading_paths": ["Cognition & Consciousness Path", "Rationality & Decision-Making"],
    "copies_total": 5,
    "copies_available": 3,
    "rating": 4.8,
    "cover_color": "#d97706"
  },
  {
    "id": "phil-meditations",
    "title": "Meditations",
    "author": "Marcus Aurelius",
    "year": 180,
    "ddc_code": "188.0 AUR",
    "loc_code": "B580 .A4 2002",
    "category": "Philosophy & Psychology",
    "subcategories": ["Stoicism", "Ethics", "Ancient Philosophy"],
    "tags": ["virtue", "impermanence", "resilience", "duties", "inner citadel"],
    "synopsis": "The intimate private spiritual reflections of the Roman Emperor, exploring the practice of Stoic calm, mortal duty, and mastery over one's perceptions.",
    "key_excerpt": "You have power over your mind - not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "D1",
      "shelf_unit": 3,
      "tier": 2,
      "shelf_label": "D1-03-Lower",
      "x": 420,
      "y": 260
    },
    "metrics": { "complexity": 5.8, "pacing": 8.0, "theoretical_depth": 8.0, "practical_utility": 9.0, "thematic_weight": 9.6 },
    "prerequisites": [],
    "reading_paths": ["Practical Philosophy Path", "Stoic Foundations"],
    "copies_total": 6,
    "copies_available": 4,
    "rating": 4.85,
    "cover_color": "#b45309"
  },
  {
    "id": "hist-sapiens",
    "title": "Sapiens: A Brief History of Humankind",
    "author": "Yuval Noah Harari",
    "year": 2014,
    "ddc_code": "909.0 HAR",
    "loc_code": "CB113.H37 H3713 2014",
    "category": "History & Civilization",
    "subcategories": ["World History", "Anthropology", "Evolutionary History"],
    "tags": ["cognitive revolution", "agricultural trap", "shared fictions", "money", "empire"],
    "synopsis": "A sweeping, provocative journey through 70,000 years of human evolution, illustrating how our capacity to believe in collective fictions enabled global cooperation.",
    "key_excerpt": "You could never convince a monkey to give you a banana by promising him limitless bananas after death in monkey heaven. Only Sapiens can cooperate flexibly in extremely large numbers because we inhabit a dual reality.",
    "location": {
      "floor": 2,
      "section": "Humanities Mezzanine",
      "aisle": "E1",
      "shelf_unit": 2,
      "tier": 3,
      "shelf_label": "E1-02-EyeLevel",
      "x": 760,
      "y": 200
    },
    "metrics": { "complexity": 6.5, "pacing": 8.8, "theoretical_depth": 8.1, "practical_utility": 7.0, "thematic_weight": 9.3 },
    "prerequisites": [],
    "reading_paths": ["History of Civilization Path", "Human Origins & Future"],
    "copies_total": 7,
    "copies_available": 5,
    "rating": 4.85,
    "cover_color": "#d97706"
  }
];

class LocalClientEngine {
  constructor() {
    this.books = STATIC_BOOKS;
    this.isClientOnly = false;
  }

  findRoute(bookId, originFloor = 1) {
    const book = this.books.find(b => b.id === bookId) || this.books[0];
    const dest = book.location;
    const isMultiFloor = originFloor !== dest.floor;

    let points = [];
    let instructions = [];

    if (!isMultiFloor) {
      points = [
        { x: 160, y: 480, label: "Interactive Kiosk" },
        { x: 260, y: 480, label: "Circulation Corridor" },
        { x: dest.x, y: 480, label: `Turn North towards Aisle ${dest.aisle}` },
        { x: dest.x, y: dest.y, label: `Shelf ${dest.shelf_label}` }
      ];
      instructions = [
        `Start at Floor ${dest.floor} Interactive Guide Station.`,
        `Walk along main corridor toward ${dest.section}.`,
        `Turn into Aisle ${dest.aisle} toward Shelf Unit #${dest.shelf_unit}.`,
        `Spot '${book.title}' on Tier ${dest.tier} (Call Number: ${book.ddc_code}).`
      ];
    } else {
      points = [
        { x: 880, y: 480, label: "Staircase / Elevator Arrival" },
        { x: dest.x, y: 480, label: `Corridor to Aisle ${dest.aisle}` },
        { x: dest.x, y: dest.y, label: `Shelf ${dest.shelf_label}` }
      ];
      instructions = [
        `Start at Floor ${originFloor} Information Kiosk.`,
        `Take Grand Staircase / Elevator to Floor ${dest.floor}.`,
        `Enter ${dest.section} and proceed to Aisle ${dest.aisle}.`,
        `Locate '${book.title}' on Tier ${dest.tier} (Call Number: ${book.ddc_code}).`
      ];
    }

    const distM = Math.round(Math.hypot(dest.x - 160, dest.y - 480) / 10 + (isMultiFloor ? 60 : 0));

    return {
      book: book,
      origin: { floor: originFloor },
      destination: dest,
      segments: [{ floor: dest.floor, points: points }],
      instructions: instructions,
      estimated_distance_m: distM,
      estimated_time_seconds: Math.round(distM / 1.2),
      tier_visual: {
        tier: dest.tier,
        tier_name: `Tier ${dest.tier} (${dest.tier === 3 ? "Eye Level - 140cm" : dest.tier === 2 ? "Lower - 80cm" : "Standard Shelf"})`,
        shelf_label: dest.shelf_label
      }
    };
  }

  ragSearch(query, topK = 4) {
    const qLower = query.toLowerCase();
    const scored = this.books.map(b => {
      let score = 0.2;
      const fullText = `${b.title} ${b.author} ${b.synopsis} ${b.key_excerpt} ${b.tags.join(" ")} ${b.subcategories.join(" ")}`.toLowerCase();
      
      qLower.split(" ").forEach(word => {
        if (word.length > 2 && fullText.includes(word)) {
          score += 0.25;
        }
      });
      if (b.title.toLowerCase().includes(qLower)) score += 0.5;

      return { book: b, score: Math.min(score, 0.98) };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topK);

    return {
      query: query,
      recommendations: top.map(item => ({
        book: item.book,
        relevance_score: Math.round(item.score * 100) / 100,
        confidence_percentage: `${Math.round(item.score * 100)}%`,
        grounded_excerpt: item.book.key_excerpt,
        synthesis_rationale: `Selected because '${item.book.title}' by ${item.book.author} provides authoritative coverage with a thematic gravitas of ${item.book.metrics.thematic_weight}/10 and pacing of ${item.book.metrics.pacing}/10.`,
        shelf_quick_loc: `Floor ${item.book.location.floor}, Aisle ${item.book.location.aisle}`
      }))
    };
  }

  compare(bookIds) {
    const b1 = this.books.find(b => b.id === bookIds[0]) || this.books[0];
    const b2 = this.books.find(b => b.id === bookIds[1]) || this.books[1];
    const books = [b1, b2];

    const dimensions = [
      { key: "complexity", label: "Complexity & Rigor" },
      { key: "pacing", label: "Pacing & Readability" },
      { key: "theoretical_depth", label: "Theoretical Depth" },
      { key: "practical_utility", label: "Practical Utility" },
      { key: "thematic_weight", label: "Thematic Gravitas" }
    ];

    const series = books.map(b => ({
      book_id: b.id,
      title: b.title,
      color: b.cover_color,
      values: dimensions.map(d => b.metrics[d.key])
    }));

    return {
      books: books,
      dimensions: dimensions,
      radar_series: series,
      comparison_matrix: [
        { dimension: "Core Thesis", items: [{ [b1.id]: b1.synopsis }, { [b2.id]: b2.synopsis }] },
        { dimension: "Library Proximity", items: [{ [b1.id]: `Floor ${b1.location.floor}, Aisle ${b1.location.aisle}` }, { [b2.id]: `Floor ${b2.location.floor}, Aisle ${b2.location.aisle}` }] }
      ],
      ai_verdict: {
        reading_pairing: `${b1.title} vs ${b2.title}`,
        summary: `Contrasting '${b1.title}' (${b1.category}) with '${b2.title}' (${b2.category}). Both represent landmark intellectual contributions with complementary narrative profiles.`,
        recommended_sequence: `If you want a faster on-ramp, start with '${b1.metrics.pacing > b2.metrics.pacing ? b1.title : b2.title}'; if you seek deeper theoretical rigor, start with '${b1.metrics.theoretical_depth > b2.metrics.theoretical_depth ? b1.title : b2.title}'.`
      }
    };
  }

  librarianChat(message) {
    const msg = message.toLowerCase();
    
    // Check locate intent
    const matchedBook = this.books.find(b => msg.includes(b.title.toLowerCase()) || msg.includes(b.id) || (b.id === "lit-dune" && msg.includes("dune")) || (b.id === "lit-1984" && msg.includes("1984")) || (b.id === "cs-aima" && msg.includes("aima")));
    
    if (matchedBook && (msg.includes("where") || msg.includes("locate") || msg.includes("find") || msg.includes("direction"))) {
      const route = this.findRoute(matchedBook.id);
      return {
        role: "librarian",
        message: `**${matchedBook.title}** by ${matchedBook.author} is located on **Floor ${matchedBook.location.floor}** in **Aisle ${matchedBook.location.aisle}** (Call Number: \`${matchedBook.ddc_code}\`).\n\nFollow the highlighted trail on the interactive map to reach Shelf Unit #${matchedBook.location.shelf_unit}, ${route.tier_visual.tier_name}.`,
        intent: "LOCATE_BOOK",
        action: {
          type: "OPEN_MAP",
          book_id: matchedBook.id,
          floor: matchedBook.location.floor,
          shelf_label: matchedBook.location.shelf_label,
          route: route
        },
        suggested_actions: [
          `Compare '${matchedBook.title}' with similar works`,
          "Reserve this volume"
        ]
      };
    }

    if (msg.includes("compare") || msg.includes("vs") || msg.includes("difference")) {
      const comp = this.compare(["lit-1984", "lit-brave-new-world"]);
      return {
        role: "librarian",
        message: `Here is a comparative analysis:\n\n**${comp.ai_verdict.reading_pairing}**\n${comp.ai_verdict.summary}\n\n🎯 **Recommendation:** ${comp.ai_verdict.recommended_sequence}`,
        intent: "COMPARE_BOOKS",
        action: { type: "OPEN_COMPARISON", book_ids: ["lit-1984", "lit-brave-new-world"], comparison: comp },
        suggested_actions: ["Locate 1984 on Floor Map", "Locate Brave New World on Floor Map"]
      };
    }

    // Default RAG
    const rag = this.ragSearch(message, 3);
    return {
      role: "librarian",
      message: `Based on your research request: *"${message}"*, I retrieved ${rag.recommendations.length} volumes:\n\n` +
        rag.recommendations.map((r, i) => `${i+1}. **${r.book.title}** (${r.confidence_percentage} Match) - Floor ${r.book.location.floor}, Aisle ${r.book.location.aisle}\n   *"${r.grounded_excerpt.substring(0, 100)}..."*`).join("\n\n") +
        "\n\nWould you like me to map out navigation directions to the top result?",
      intent: "RAG_RECOMMENDATION",
      action: { type: "SHOW_RECOMMENDATIONS", recommendations: rag.recommendations },
      suggested_actions: [`Locate '${rag.recommendations[0].book.title}' on Map`, "Show Knowledge Graph"]
    };
  }
}

window.localEngine = new LocalClientEngine();
