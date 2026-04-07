"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DraggablePie } from "@/components/draggable-pie";

type EvidenceItem = {
  id: string;
  title: string;
  value: string;
  unit: string;
  note: string;
  sourceLabel: string;
  sourceUrl: string;
};

type Phase = {
  id: string;
  years: string;
  title: string;
  eyebrow: string;
  body: string;
  details: string[];
  image: string;
  imageAlt: string;
};

type Blocker = {
  title: string;
  body: string;
  sourceLabel: string;
  sourceUrl: string;
  image: string;
  imageAlt: string;
};

type SectionMeta = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  speaker: string;
  studentId: string;
  summary: string;
};

type IntroPanel = {
  title: string;
  body: string;
  stat?: string;
};

type TechnologyPanel = {
  id: string;
  title: string;
  kicker: string;
  body: string;
  points: string[];
};

type PolicyPanel = {
  id: string;
  title: string;
  kicker: string;
  body: string;
  bullets: string[];
};

type SocialLens = {
  id: string;
  title: string;
  kicker: string;
  body: string;
  evidence: string;
  takeaway: string;
};

type ConclusionPoint = {
  title: string;
  body: string;
};

type SlideStep = {
  id: string;
  label: string;
  kind: "cover" | "divider" | "content" | "evidence" | "impact" | "blocker" | "timeline" | "pdf";
  title: string;
  body?: string;
  evidenceIds?: string[];
  blockerIndexes?: number[];
  phaseId?: string;
  hideKickerInSlideView?: boolean;
  sectionId?: string;
  contentId?: string;
  pdfPage?: number;
};

const BASE_TOTAL_EMISSIONS = 33.2;
const HK_2035_TARGET_EMISSIONS = 20.0;
const HK_2050_NET_ZERO_EMISSIONS = 0.5;
const TEAMMATE_RENDER_PREFIX = "/teammate-slide-renders/teammate-slide-renders";

const BASE_TRANSPORT = [90, 7.9, 2.1];
const BASE_ENERGY = [75, 24.2, 0.8];

const SECTIONS: SectionMeta[] = [
  {
    id: "section-1",
    number: "01",
    title: "Introduction",
    shortTitle: "Intro",
    speaker: "Liu Pui Ling",
    studentId: "25134783D",
    summary: "Frame the challenge: Hong Kong needs cleaner energy in one of the world's densest urban systems.",
  },
  {
    id: "section-2",
    number: "02",
    title: "Technology Analysis",
    shortTitle: "Technology",
    speaker: "Lai Ki Uen",
    studentId: "25031657D",
    summary: "Assess which technologies fit Hong Kong's buildings, coastlines, climate and grid reality.",
  },
  {
    id: "section-3",
    number: "03",
    title: "Economics & Policy Dimensions",
    shortTitle: "Economics",
    speaker: "Lee Tsz Nam",
    studentId: "25032937D",
    summary: "Show that the cost case is improving, but policy design still decides whether deployment scales.",
  },
  {
    id: "section-4",
    number: "04",
    title: "Social & Environmental Dimensions",
    shortTitle: "Social",
    speaker: "Nova Hadid",
    studentId: "25034245D",
    summary: "Test whether the transition is socially legitimate, culturally acceptable and environmentally responsible.",
  },
  {
    id: "section-5",
    number: "05",
    title: "Integration & Pathways",
    shortTitle: "Pathways",
    speaker: "Jack Zhao Xuecen",
    studentId: "22014303D",
    summary: "Connect the parts into one pathway: evidence, system trade-offs, blockers and the staged roadmap.",
  },
  {
    id: "section-6",
    number: "06",
    title: "Conclusion & Coordination",
    shortTitle: "Conclusion",
    speaker: "Fung Hin Lung",
    studentId: "22077442D",
    summary: "Close by showing how policy, technology, economics, society and systems coordination reinforce each other.",
  },
];

const INTRO_PANELS: IntroPanel[] = [
  {
    title: "The Zero-Carbon Dream",
    body: "The Zero Carbon Building in Kowloon Bay uses smart design, solar panels and a tri-generation system running on waste cooking oil to achieve net-zero energy. If every building in Hong Kong could follow this model, the city would be cleaner, cheaper and healthier.",
  },
  {
    title: "Energy mix: still fossil-heavy",
    body: "Natural gas and coal still make up 65-70% of Hong Kong's electricity, with nuclear carrying a major share. The Urban Heat Island effect traps smog and dirty air, hurting elderly people and children with asthma and breathing problems every year.",
    stat: "65-70%",
  },
  {
    title: "The reality: SDG 13 and the nuclear question",
    body: "The government targets zero carbon by 2050, supporting SDG 13 on Climate Action. But simple rules are not enough. Are the clean energy targets really green? Does the plan include nuclear power, and is its long-term waste risk acceptable for Hong Kong?",
  },
];

const TECHNOLOGY_PANELS: TechnologyPanel[] = [
  {
    id: "tech-solar",
    title: "Solar on buildings",
    kicker: "BIPV and urban retrofits",
    body: "The deck focuses on building-integrated photovoltaics and smart cleaning systems because rooftops and façades are among the few scalable surfaces Hong Kong controls locally.",
    points: [
      "Treat high-rise buildings as energy surfaces, not passive envelopes.",
      "Use smart cleaning and maintenance to reduce performance loss in a dense city.",
      "Design for typhoon resilience with stronger anchoring and wind-load protection.",
    ],
  },
  {
    id: "tech-wind",
    title: "Offshore wind",
    kicker: "Marine engineering and ecology",
    body: "The technology section proposes offshore wind near Lamma Island, but emphasizes that muddy seabeds, corrosion and ecological sensitivity make engineering and mitigation central to viability.",
    points: [
      "Account for soft seabeds and corrosive marine conditions in the foundation design.",
      "Use mitigation such as bubble curtains to reduce underwater noise during construction.",
      "Treat marine ecology, especially dolphin protection, as a design constraint rather than an afterthought.",
    ],
  },
  {
    id: "tech-grid",
    title: "Grid intelligence",
    kicker: "AI and Vehicle-to-Grid",
    body: "The deck argues that AI-driven load balancing and Vehicle-to-Grid can help Hong Kong manage peak demand, especially in extreme summer heat, by making the existing system more flexible.",
    points: [
      "Use real-time load balancing to manage urban demand spikes.",
      "Position EVs as moving batteries rather than only transport assets.",
      "Make flexibility a core technology pathway, not just generation expansion.",
    ],
  },
];

const POLICY_PANELS: PolicyPanel[] = [
  {
    id: "economics",
    title: "Economic signal",
    kicker: "The cost case has shifted",
    body: "The teammate deck argues that the price argument against transition is weakening fast.",
    bullets: [
      "Solar power at about $0.043/kWh is presented as nearly half the cost of coal at about $0.073/kWh.",
      "The financial case for clean generation is no longer marginal; it is strategic.",
      "The next constraint is less about raw technology cost and more about deployment conditions.",
    ],
  },
  {
    id: "policy",
    title: "Policy bottleneck",
    kicker: "Good policy unlocks deployment",
    body: "The same deck makes clear that administrative friction still slows the transition even when the economic logic is improving.",
    bullets: [
      "Rural solar applications can face 6 to 12 month delays through the planning process.",
      "Red tape raises investor uncertainty and discourages private-sector participation.",
      "A simpler, faster approval path is treated as essential to the 2050 carbon-neutral goal.",
    ],
  },
  {
    id: "prosumer",
    title: "Prosumer model",
    kicker: "Policy can widen participation",
    body: "The presentation highlights schools and residential buildings as potential prosumers under Feed-in Tariff logic, turning consumers into visible participants in the transition.",
    bullets: [
      "Allow buildings to sell surplus solar output back to the grid.",
      "Use policy to spread ownership of the transition beyond utilities alone.",
      "Frame participation as both an economic and governance benefit.",
    ],
  },
];

const SOCIAL_LENSES: SocialLens[] = [
  {
    id: "holistic",
    title: "Holistic approach",
    kicker: "SD Principle 9 — Analytical lens",
    body: "Solar LCOE at US$0.043/kWh vs coal at US$0.073/kWh confirms the economic case, but regulatory delays (e.g. 18-month Yuen Long solar project) show that feasibility alone does not guarantee deployment.",
    evidence: "Applies 12 SD Guiding Principles across four dimensions: social (stakeholder engagement), cultural (behavioural norms), ethical (intergenerational equity), environmental (marine ecology + lifecycle).",
    takeaway: "Techno-economic feasibility does not equal deployment success — a holistic lens is essential.",
  },
  {
    id: "social",
    title: "Community solar",
    kicker: "SD Principle 4 — Stakeholder engagement",
    body: "Community solar as a distributed energy resource enables prosumer participation via grid-connected PV and net metering under HK's Feed-in Tariff. Optimized FiT structures increase public adoption by ~30%.",
    evidence: "HKOWF's Stakeholder Liaison Group (SLG) with NGOs, fisheries, academia and local communities co-designed mitigation measures. Shared ownership lets public housing residents access renewable energy arbitrage via bill credits.",
    takeaway: "Procedural justice — public consultations, co-design workshops, transparent data sharing — transforms passive ratepayers into active energy citizens and mitigates NIMBY opposition.",
  },
  {
    id: "cultural",
    title: "Social & cultural check",
    kicker: "SD Principle 3 — Balanced solution",
    body: "The pay-as-you-throw waste charging consultation revealed overwhelming community opposition — technical readiness does not equal social readiness. Community solar may also exclude private renters and subdivided unit residents.",
    evidence: "HK Electric's Happy Green Campaign reached 5,717 visitors. Tiered participation pathways (virtual net metering, community fund allocation) can address equity gaps. Energy literacy programs in schools and community centres drive behavioural change.",
    takeaway: "Shift from passive consumption to active Demand-Side Management (DSM), supporting grid stability and reducing peak-load infrastructure costs.",
  },
  {
    id: "environmental",
    title: "Marine ecology",
    kicker: "SD Principle 1 — Beyond your own locality",
    body: "HKOWF proposes ~150MW capacity (up to fifty 3MW turbines) SW of Lamma Island, offsetting ~350,000 tCO2e annually. Chinese White Dolphin population is critically low at fewer than 60 individuals in HK waters.",
    evidence: "Suction caisson foundations eliminate underwater impact piling noise. A 250m Marine Mammal Exclusion Zone (MMEZ) with real-time monitoring halts construction if mammals enter the buffer. Construction avoids fish spawning seasons (Apr-Jun).",
    takeaway: "Eco-shoreline design and enhanced habitat complexity can support intertidal species colonization post-construction.",
  },
  {
    id: "lifecycle",
    title: "Lifecycle & ethics",
    kicker: "SD Principle 12 — Practice what you preach",
    body: "Waste-to-energy incineration generates ~580g CO2/kWh vs ~340g for conventional generation — full lifecycle carbon accounting is essential. WEEE PARK processed ~24,000 tonnes of e-waste in 2021, powering 8.6% of its own consumption via onsite solar.",
    evidence: "End-of-life solar PV modules are not yet classified as regulated WEEE under HK's Producer Responsibility Scheme — risking future e-waste accumulation as FiT installations reach end-of-life (~2040-2045).",
    takeaway: "Mandate cradle-to-cradle design and Design for Disassembly (DfD) for all renewable infrastructure. Amend PRS to include PV modules, inverters and turbine components.",
  },
];

const CONCLUSION_POINTS: ConclusionPoint[] = [
  {
    title: "Policy must lead",
    body: "The concluding message from the PDF is direct: without policy leadership, technology sits idle and investment moves elsewhere.",
  },
  {
    title: "The technology is ready",
    body: "These are not hypothetical future systems. Solar, offshore wind, storage, smart grids and EV integration all exist now and can be deployed in Hong Kong with the right conditions.",
  },
  {
    title: "The economics have shifted",
    body: "The argument that green energy is too expensive is no longer decisive. The central question has become how fast institutions can respond.",
  },
  {
    title: "Coordination is the real test",
    body: "The final section connects all eight dimensions and reminds the audience that decarbonization succeeds only when policy, engineering, finance, society and systems planning move together.",
  },
];

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "evidence-total",
    title: "Total greenhouse gas emissions",
    value: "33.2",
    unit: "MtCO2-e",
    note: "Official 2024 Hong Kong greenhouse gas inventory.",
    sourceLabel: "EEB 2024 GHG inventory release",
    sourceUrl: "https://cnsd.gov.hk/en/press-release/hong-kong-greenhouse-gas-emission-inventory-for-2024-released/",
  },
  {
    id: "evidence-percapita",
    title: "Per-capita emissions",
    value: "4.41",
    unit: "tonnes CO2-e",
    note: "Lowest on record in the 2024 inventory release.",
    sourceLabel: "EEB 2024 GHG inventory release",
    sourceUrl: "https://cnsd.gov.hk/en/press-release/hong-kong-greenhouse-gas-emission-inventory-for-2024-released/",
  },
  {
    id: "evidence-electricity",
    title: "Electricity's share of emissions",
    value: "61",
    unit: "%",
    note: "Latest official sector split published in the 2025 CAP2050 progress pamphlet.",
    sourceLabel: "CAP2050 progress pamphlet",
    sourceUrl: "https://cnsd.gov.hk/wp-content/uploads/2025/06/CAP2050-progress-pamphlet_EN_website.pdf",
  },
  {
    id: "evidence-transport",
    title: "Transport's share of emissions",
    value: "18",
    unit: "%",
    note: "Latest official sector split published in the 2025 CAP2050 progress pamphlet.",
    sourceLabel: "CAP2050 progress pamphlet",
    sourceUrl: "https://cnsd.gov.hk/wp-content/uploads/2025/06/CAP2050-progress-pamphlet_EN_website.pdf",
  },
  {
    id: "evidence-waste",
    title: "Waste's share of emissions",
    value: "8",
    unit: "%",
    note: "Latest official sector split published in the 2025 CAP2050 progress pamphlet.",
    sourceLabel: "CAP2050 progress pamphlet",
    sourceUrl: "https://cnsd.gov.hk/wp-content/uploads/2025/06/CAP2050-progress-pamphlet_EN_website.pdf",
  },
  {
    id: "evidence-public-transport",
    title: "Passenger journeys on public transport",
    value: "90",
    unit: "%",
    note: "Transport Department says about 90% of total passenger journeys are on public transport.",
    sourceLabel: "Transport Department introduction",
    sourceUrl: "https://www.td.gov.hk/en/transport_in_hong_kong/its/introduction/index.html",
  },
  {
    id: "evidence-ev",
    title: "Private cars that are electric",
    value: "21",
    unit: "%",
    note: "As at end-September 2025, EVs accounted for 21% of all private cars in Hong Kong.",
    sourceLabel: "Government air quality release, 7 Nov 2025",
    sourceUrl: "https://www.info.gov.hk/gia/general/202511/07/P2025110600289p.htm",
  },
  {
    id: "evidence-fossil",
    title: "Electricity mix that is fossil fuel",
    value: "75.0",
    unit: "%",
    note: "Derived from CLP 2024 sales and fuel mix plus HK Electric 2024 sales and fuel mix.",
    sourceLabel: "CLP + HK Electric 2024 data",
    sourceUrl: "https://www.clp.com.hk/content/dam/clphk/documents/about-clp-site/media-site/resources-site/publications-site/2025/CLP-Information-Kit-English.pdf",
  },
  {
    id: "evidence-fit",
    title: "Approved Feed-in Tariff applications",
    value: "26,000",
    unit: "",
    note: "Approved by September 2024, showing solar scale-up is real but still early-stage.",
    sourceLabel: "LCQ2: Feed-in Tariff Scheme",
    sourceUrl: "https://www.info.gov.hk/gia/general/202411/20/P2024112000328p.htm",
  },
  {
    id: "evidence-smart-meter",
    title: "Smart meters connected by CLP",
    value: "2.88",
    unit: "million",
    note: "Completed by the end of 2025, giving Hong Kong a concrete grid-flexibility layer.",
    sourceLabel: "CLP smart meter rollout, 5 Mar 2026",
    sourceUrl: "https://www.clp.com.hk/content/dam/clp-group/channels/media/document/2026/20260305_en.pdf",
  },
];

const PHASES: Phase[] = [
  {
    id: "phase-1",
    years: "2025-2027",
    title: "Prove the Case",
    eyebrow: "Foundation",
    body: "Start with visible proof on the slide itself: rooftop solar, public transport and smart-grid links show that the transition is already under way.",
    details: [
      "Use the image to point out three connected signals: rooftop solar, mass transit and smart-grid integration.",
      "Anchor that visual with the 2024 emissions baseline and position electricity as the biggest lever.",
      "Use Feed-in Tariff approvals and smart-meter rollout to show that deployment and grid readiness are already moving together.",
    ],
    image: "/timeline-phase-1.png",
    imageAlt: "Hong Kong skyline with rooftop solar, MTR access and visible smart-grid links",
  },
  {
    id: "phase-2",
    years: "2027-2030",
    title: "Expand Local Capacity",
    eyebrow: "Deployment",
    body: "Scale the options that fit Hong Kong best, while being clear that local renewables are only part of the answer.",
    details: [
      "Highlight rooftops, floating solar and building-scale projects as the most realistic local pathway.",
      "Use transport to show that cleaner technology and travel behaviour must shift together.",
      "Frame local renewables as the visible first layer of transition, not the full end-state.",
    ],
    image: "/timeline-phase-2.png",
    imageAlt: "Hong Kong waterfront with floating solar, rooftop solar and electric buses",
  },
  {
    id: "phase-3",
    years: "2030-2035",
    title: "Upgrade the Grid",
    eyebrow: "Systems integration",
    body: "Shift the story from isolated projects to one coordinated energy system.",
    details: [
      "Present storage, flexible demand and smart-meter data as the enablers of higher clean-power use.",
      "Use the electricity mix to show fossil dependence falling as zero-carbon supply rises.",
      "Emphasize grid intelligence as the link between ambition and reliability.",
    ],
    image: "/timeline-phase-3.png",
    imageAlt: "Hong Kong Victoria Harbour skyline visualized as a digitally connected smart grid",
  },
  {
    id: "phase-4",
    years: "2035-2045",
    title: "Connect Regionally",
    eyebrow: "Cross-border strategy",
    body: "Make the key argument of this section: Hong Kong cannot decarbonize alone at scale, so collaboration with mainland China is essential.",
    details: [
      "Present zero-carbon imports from mainland China as core infrastructure rather than a backup option.",
      "Frame the Greater Bay Area as a regional platform where Hong Kong can collaborate on cleaner power, grid links and lower-carbon growth.",
      "Show that Hong Kong plus mainland China working as one connected region is more realistic than Hong Kong aiming for full self-sufficiency alone.",
    ],
    image: "/timeline-phase-4.png",
    imageAlt: "Hong Kong connected to regional clean power infrastructure across the Greater Bay Area",
  },
  {
    id: "phase-5",
    years: "2045-2050",
    title: "Optimize to Net Zero",
    eyebrow: "End-state",
    body: "Finish with a blended low-carbon system that is cleaner, more flexible and far less fossil-dependent than today.",
    details: [
      "Position hydrogen as a later-stage support option, not a near-term shortcut.",
      "Describe the end-state as lower demand, lower fossil use, stronger public transport and more clean imported electricity.",
      "Close on systems thinking: the pathway works because multiple levers move together.",
    ],
    image: "/timeline-phase-5.png",
    imageAlt: "A cleaner future Hong Kong with low-carbon buildings, efficient transport and integrated energy flows",
  },
];

const BLOCKERS: Blocker[] = [
  {
    title: "Land and natural-resource limits",
    body: "Hong Kong does not have favourable conditions for large-scale commercial renewable generation because land is limited, much of it is hilly terrain, and territorial waters are also limited.",
    sourceLabel: "Climate Action Plan 2030+ booklet",
    sourceUrl: "https://cnsd.gov.hk/wp-content/uploads/pdf/HK_Climate_Action_Plan_2030%2B_booklet_En.pdf",
    image: "/eng3004-rooftop-solar.png",
    imageAlt: "Dense Hong Kong rooftops with solar panels",
  },
  {
    title: "Weather, marine and reliability constraints",
    body: "Even when offshore wind is technically possible, dense shipping routes, limited waters, grid reliability requirements and severe weather exposure all make scaling local wind more difficult.",
    sourceLabel: "Net-zero Electricity Generation report",
    sourceUrl: "https://cnsd.gov.hk/wp-content/uploads/2023/05/Net-zero-Electricity-Generation_en.pdf",
    image: "/eng3004-offshore-wind.png",
    imageAlt: "Offshore wind turbines near Hong Kong waters",
  },
  {
    title: "Storage is still too thin for an intermittent-heavy system",
    body: "Local solar and wind need a storage buffer, but Hong Kong still lacks utility-scale storage infrastructure such as a vanadium redox flow battery plant that could absorb and release renewable power at city scale.",
    sourceLabel: "Climate Target of Hong Kong",
    sourceUrl: "https://cnsd.gov.hk/wp-content/uploads/2023/05/Climate-Target-of-HK_en.pdf",
    image: "/section5-storage-gap-generated.png",
    imageAlt: "Generated illustration of Hong Kong's renewable-storage gap with limited battery infrastructure",
  },
  {
    title: "Buses and taxis still leave a fossil-fuel tail",
    body: "Hong Kong's rail system is strong, but many buses and taxis are still in transition. That means everyday transport still carries a fossil-fuel burden even if renewable electricity rises.",
    sourceLabel: "Roadmap on the Green Transformation of Public Buses and Taxis",
    sourceUrl: "https://www.eeb.gov.hk/sites/default/files/pdf/Bus_Taxi_Roadmap_eng.pdf",
    image: "/section5-fossil-transport-generated.png",
    imageAlt: "Generated illustration of buses and taxis in Hong Kong still carrying a fossil-fuel burden",
  },
];

const TEAMMATE_PDF = "/ENG3004-teammate-presentation-consistent.pdf";
const TEAMMATE_PPTX = "/ENG3004-teammate-presentation-consistent.pptx";

const COVER_STEP: SlideStep = {
  id: "slide-cover",
  label: "Cover",
  kind: "cover",
  title: "Future of Green Energy in Hong Kong",
};

const PDF_STEPS_BEFORE_PATHWAYS: SlideStep[] = [
  { id: "pdf-roadmap", label: "Roadmap", kind: "pdf", title: "Presentation roadmap", pdfPage: 2, sectionId: "section-1" },
  { id: "pdf-intro-1", label: "Introduction", kind: "pdf", title: "Zero-carbon dream", pdfPage: 3, sectionId: "section-1" },
  { id: "pdf-intro-2", label: "Introduction", kind: "pdf", title: "Energy mix", pdfPage: 4, sectionId: "section-1" },
  { id: "pdf-intro-3", label: "Introduction", kind: "pdf", title: "Reality check", pdfPage: 5, sectionId: "section-1" },
  { id: "pdf-tech-divider", label: "Section 2", kind: "pdf", title: "Technology divider", pdfPage: 6, sectionId: "section-2" },
  { id: "pdf-tech-1", label: "Technology", kind: "pdf", title: "Solar technology", pdfPage: 7, sectionId: "section-2" },
  { id: "pdf-tech-2", label: "Technology", kind: "pdf", title: "Offshore wind", pdfPage: 8, sectionId: "section-2" },
  { id: "pdf-tech-3", label: "Technology", kind: "pdf", title: "Smart grids", pdfPage: 9, sectionId: "section-2" },
  { id: "pdf-econ-divider", label: "Section 3", kind: "pdf", title: "Economics divider", pdfPage: 10, sectionId: "section-3" },
  { id: "pdf-econ-1", label: "Economics", kind: "pdf", title: "Economic dimension", pdfPage: 11, sectionId: "section-3" },
  { id: "pdf-econ-2", label: "Economics", kind: "pdf", title: "Feed-in tariff success", pdfPage: 12, sectionId: "section-3" },
  { id: "pdf-econ-3", label: "Economics", kind: "pdf", title: "Regulatory barriers", pdfPage: 13, sectionId: "section-3" },
  { id: "pdf-social-divider", label: "Section 4", kind: "pdf", title: "Social divider", pdfPage: 14, sectionId: "section-4" },
  { id: "pdf-social-1", label: "Social", kind: "pdf", title: "Holistic approach", pdfPage: 15, sectionId: "section-4" },
  { id: "pdf-social-2", label: "Social", kind: "pdf", title: "Stakeholder engagement", pdfPage: 16, sectionId: "section-4" },
  { id: "pdf-social-3", label: "Social", kind: "pdf", title: "Balanced solution", pdfPage: 17, sectionId: "section-4" },
  { id: "pdf-social-4", label: "Social", kind: "pdf", title: "Marine ecology", pdfPage: 18, sectionId: "section-4" },
  { id: "pdf-social-5", label: "Social", kind: "pdf", title: "Lifecycle thinking", pdfPage: 19, sectionId: "section-4" },
];

const PDF_STEPS_AFTER_PATHWAYS: SlideStep[] = [
  { id: "pdf-conclusion-divider", label: "Section 6", kind: "pdf", title: "Conclusion divider", pdfPage: 20, sectionId: "section-6" },
  { id: "pdf-conclusion-1", label: "Conclusion", kind: "pdf", title: "Coordination map", pdfPage: 21, sectionId: "section-6" },
  { id: "pdf-conclusion-2", label: "Conclusion", kind: "pdf", title: "Vision for 2050", pdfPage: 22, sectionId: "section-6" },
  { id: "pdf-conclusion-3", label: "Conclusion", kind: "pdf", title: "AI log", pdfPage: 23, sectionId: "section-6" },
  { id: "pdf-sources", label: "Sources", kind: "pdf", title: "Sources and citations", pdfPage: 24, sectionId: "section-6" },
  { id: "pdf-qa", label: "Q&A", kind: "pdf", title: "Expected questions", pdfPage: 25, sectionId: "section-6" },
  { id: "pdf-thank-you", label: "Thank you", kind: "pdf", title: "Thank you", pdfPage: 26, sectionId: "section-6" },
];

const SLIDE_STEPS: SlideStep[] = [
  COVER_STEP,
  ...PDF_STEPS_BEFORE_PATHWAYS,
  {
    id: "slide-section-5-intro",
    label: "Section 5",
    kind: "divider",
    title: "Integration & Pathways",
    body: "Connect evidence, system trade-offs, blockers and the staged roadmap into one integrated transition pathway.",
    sectionId: "section-5",
  },
  {
    id: "slide-evidence-1",
    label: "Evidence 1",
    kind: "evidence",
    title: "Ten figures that anchor the case.",
    body: "Part 1 of 2. Start with the baseline first: total emissions, per-capita emissions, and the two sectors that define Hong Kong's current system.",
    evidenceIds: ["evidence-total", "evidence-percapita", "evidence-electricity", "evidence-transport"],
    hideKickerInSlideView: true,
    sectionId: "section-5",
  },
  {
    id: "slide-evidence-2",
    label: "Evidence 2",
    kind: "evidence",
    title: "Ten figures that anchor the case.",
    body: "Part 2 of 2. Then move to the transition signals: public transport use, EV uptake, FiT growth and grid readiness.",
    evidenceIds: ["evidence-public-transport", "evidence-ev", "evidence-fit", "evidence-smart-meter"],
    hideKickerInSlideView: true,
    sectionId: "section-5",
  },
  {
    id: "slide-impact-lab",
    label: "Impact Lab",
    kind: "impact",
    title: "Adjust each divider directly.",
    body: "Use the two interactive pies to test which transport and electricity changes shift the overall emissions signal the most.",
    sectionId: "section-5",
  },
  {
    id: "slide-blockers-1",
    label: "Blockers 1",
    kind: "blocker",
    title: "Main reasons Hong Kong cannot rely heavily on local solar and wind alone",
    body: "Part 1 of 2. Start with the physical constraints: limited land, limited waters and difficult local operating conditions.",
    blockerIndexes: [0, 1],
    sectionId: "section-5",
  },
  {
    id: "slide-blockers-2",
    label: "Blockers 2",
    kind: "blocker",
    title: "Main reasons Hong Kong cannot rely heavily on local solar and wind alone",
    body: "Part 2 of 2. Then move to the system constraints: storage is still thin and road transport still carries a fossil-fuel tail.",
    blockerIndexes: [2, 3],
    sectionId: "section-5",
  },
  {
    id: "slide-timeline",
    label: "Timeline",
    kind: "timeline",
    title: "Move through the pathway phase by phase.",
    body: "Use each stage as a clear speaking beat, from proving the case to regional coordination and the final net-zero system.",
    sectionId: "section-5",
  },
  ...PDF_STEPS_AFTER_PATHWAYS,
];

function getTeammateRenderSrc(page: number) {
  return `${TEAMMATE_RENDER_PREFIX}.${String(page).padStart(3, "0")}.png`;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeValues(values: number[]) {
  const safeValues = values.map((value) => Math.max(0, value));
  const total = safeValues.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return safeValues.map(() => 0);
  }

  return safeValues.map((value) => (value / total) * 100);
}

function score(values: number[], weights: number[]) {
  return values.reduce((sum, value, index) => sum + value * weights[index], 0);
}

function emissionTone(value: number) {
  if (value > 32) {
    return "tone-black";
  }

  if (value > 24) {
    return "tone-red";
  }

  if (value > 16) {
    return "tone-yellow";
  }

  return "tone-green";
}

export function PathwayPresentation() {
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [transportMix, setTransportMix] = useState([...BASE_TRANSPORT]);
  const [energyMix, setEnergyMix] = useState([...BASE_ENERGY]);
  const [activePhaseId, setActivePhaseId] = useState(PHASES[0].id);
  const [activeTechnologyId, setActiveTechnologyId] = useState(TECHNOLOGY_PANELS[0].id);
  const [activePolicyId, setActivePolicyId] = useState(POLICY_PANELS[0].id);
  const [activeSocialLensId, setActiveSocialLensId] = useState(SOCIAL_LENSES[0].id);
  const [slideView, setSlideView] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const slideShellRef = useRef<HTMLDivElement | null>(null);
  const slideFrameRef = useRef<HTMLElement | null>(null);
  const slideStageRef = useRef<HTMLDivElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const normalizedTransportMix = normalizeValues(transportMix);
  const normalizedEnergyMix = normalizeValues(energyMix);

  const transportRatio =
    score(normalizedTransportMix, [0.08, 1, 0.2]) / score(BASE_TRANSPORT, [0.08, 1, 0.2]);
  const energyRatio =
    score(normalizedEnergyMix, [1, 0.08, 0.02]) / score(BASE_ENERGY, [1, 0.08, 0.02]);

  const totalEmissions = roundOne(BASE_TOTAL_EMISSIONS * (0.61 * energyRatio + 0.18 * transportRatio + 0.21));
  const totalBarWidth = clamp((totalEmissions / 40) * 100, 12, 100);
  const targetBarPosition = clamp((HK_2035_TARGET_EMISSIONS / 40) * 100, 0, 100);
  const netZeroBarPosition = clamp((HK_2050_NET_ZERO_EMISSIONS / 40) * 100, 0, 100);
  const delta = roundOne(totalEmissions - BASE_TOTAL_EMISSIONS);

  const evidenceById = useMemo(
    () => Object.fromEntries(EVIDENCE_ITEMS.map((item) => [item.id, item])),
    [],
  );
  const sectionById = useMemo(() => Object.fromEntries(SECTIONS.map((section) => [section.id, section])), []);
  const technologyById = useMemo(
    () => Object.fromEntries(TECHNOLOGY_PANELS.map((panel) => [panel.id, panel])),
    [],
  );
  const policyById = useMemo(() => Object.fromEntries(POLICY_PANELS.map((panel) => [panel.id, panel])), []);
  const socialById = useMemo(() => Object.fromEntries(SOCIAL_LENSES.map((lens) => [lens.id, lens])), []);
  const activeSlide = SLIDE_STEPS[activeSlideIndex];
  const activePhaseIndex = PHASES.findIndex((phase) => phase.id === activePhaseId);
  const activeTechnology = technologyById[activeTechnologyId];
  const activePolicy = policyById[activePolicyId];
  const activeSocialLens = socialById[activeSocialLensId];
  const jackSlideSteps = useMemo(
    () =>
      SLIDE_STEPS.flatMap((step, index) =>
        step.sectionId === "section-5"
          ? [{ id: step.id, title: step.title, label: step.label, page: index + 1 }]
          : [],
      ),
    [],
  );
  const jackSectionStartIndex = jackSlideSteps[0]?.page ? jackSlideSteps[0].page - 1 : 0;

  const activeEvidenceIds = activeSlide.kind === "evidence" ? activeSlide.evidenceIds ?? [] : [];
  const slidePanelTransitionKey = activeSlide.id;
  const hasHiddenEvidence = activeEvidenceIds.some((id) => !revealedCards[id]);
  const hasRevealedEvidence = [...activeEvidenceIds].reverse().some((id) => revealedCards[id]);
  const hasPreviousPhase = activeSlide.kind === "timeline" && activePhaseIndex > 0;
  const hasNextPhase = activeSlide.kind === "timeline" && activePhaseIndex < PHASES.length - 1;

  const previousLabel =
    activeSlide.kind === "evidence" && hasRevealedEvidence
      ? "Previous statistic"
      : activeSlide.kind === "timeline" && hasPreviousPhase
        ? "Previous phase"
        : "Previous";
  const nextLabel =
    activeSlide.kind === "evidence" && hasHiddenEvidence
      ? "Next statistic"
      : activeSlide.kind === "timeline" && hasNextPhase
        ? "Next phase"
        : "Next";

  function getTimelineScrollContainer() {
    return timelineScrollRef.current ?? slideFrameRef.current;
  }

  function runWithSlideTransition(update: () => void) {
    if (typeof document === "undefined") {
      update();
      return;
    }

    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> };
    };

    if (!slideView || !documentWithTransition.startViewTransition) {
      update();
      return;
    }

    documentWithTransition.startViewTransition(() => {
      update();
    });
  }

  function scrollElementToTop(container: HTMLElement, target: HTMLElement, behavior: ScrollBehavior = "smooth") {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offsetTop = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: Math.max(0, offsetTop),
      behavior,
    });
  }

  function scrollPhaseRowToTop(behavior: ScrollBehavior = "smooth") {
    const container = getTimelineScrollContainer();

    if (!container) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`[data-phase-row="${activePhaseId}"]`);

    if (!target) {
      return;
    }

    scrollElementToTop(container, target, behavior);
  }

  useEffect(() => {
    const preloadTargets = [
      ...PDF_STEPS_BEFORE_PATHWAYS,
      ...PDF_STEPS_AFTER_PATHWAYS,
    ]
      .map((step) => (step.pdfPage ? getTeammateRenderSrc(step.pdfPage) : null))
      .filter((src): src is string => Boolean(src));

    const nativeTargets = [
      "/timeline-phase-3.png",
      "/section5-storage-gap-generated.png",
      "/section5-fossil-transport-generated.png",
      ...PHASES.map((phase) => phase.image),
      ...BLOCKERS.map((blocker) => blocker.image),
    ];

    [...new Set([...preloadTargets, ...nativeTargets])].forEach((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (!slideView) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        goForward();
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goBackward();
      }

      if (event.key === "Escape") {
        setSlideView(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [slideView, activeSlide.kind, activeEvidenceIds, revealedCards, activePhaseIndex]);

  useEffect(() => {
    if (!slideView || !slideShellRef.current) {
      return;
    }

    const shell = slideShellRef.current;
    const blockScroll = (event: Event) => {
      const target = event.target as Node | null;

      if (
        activeSlide.kind === "timeline" &&
        timelineScrollRef.current &&
        target &&
        timelineScrollRef.current.contains(target)
      ) {
        return;
      }

      event.preventDefault();
    };

    shell.addEventListener("wheel", blockScroll, { passive: false });
    shell.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      shell.removeEventListener("wheel", blockScroll);
      shell.removeEventListener("touchmove", blockScroll);
    };
  }, [slideView, activeSlide.kind]);

  useEffect(() => {
    if (!slideView) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
    slideShellRef.current?.scrollTo({ top: 0, behavior: "auto" });
    slideFrameRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [slideView, activeSlideIndex]);

  useEffect(() => {
    if (activeSlide.kind === "timeline") {
      setActivePhaseId((current) => current || PHASES[0].id);
    }

    if (activeSlide.kind === "timeline" && activeSlide.phaseId) {
      setActivePhaseId(activeSlide.phaseId);
    }
  }, [activeSlide]);

  useEffect(() => {
    if (!slideView || activeSlide.kind !== "timeline" || !slideFrameRef.current) {
      return;
    }

    scrollPhaseRowToTop(activePhaseIndex <= 0 ? "auto" : "smooth");

    const correctionId = window.setTimeout(() => {
      scrollPhaseRowToTop("auto");
    }, 420);

    return () => window.clearTimeout(correctionId);
  }, [activePhaseId, activeSlide.kind, slideView]);

  function revealCard(id: string) {
    setRevealedCards((current) => ({
      ...current,
      [id]: true,
    }));
  }

  function toggleCard(id: string) {
    setRevealedCards((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function goForward() {
    if (activeSlide.kind === "evidence") {
      const nextEvidenceId = activeEvidenceIds.find((id) => !revealedCards[id]);

      if (nextEvidenceId) {
        revealCard(nextEvidenceId);
        return;
      }
    }

    if (activeSlide.kind === "timeline") {
      if (activePhaseIndex < PHASES.length - 1) {
        setActivePhaseId(PHASES[activePhaseIndex + 1].id);
        return;
      }
    }

    runWithSlideTransition(() => {
      setActiveSlideIndex((current) => Math.min(SLIDE_STEPS.length - 1, current + 1));
    });
  }

  function goBackward() {
    if (activeSlide.kind === "timeline") {
      if (activePhaseIndex > 0) {
        setActivePhaseId(PHASES[activePhaseIndex - 1].id);
        return;
      }
    }

    if (activeSlide.kind === "evidence") {
      const previousEvidenceId = [...activeEvidenceIds].reverse().find((id) => revealedCards[id]);

      if (previousEvidenceId) {
        setRevealedCards((current) => ({
          ...current,
          [previousEvidenceId]: false,
        }));
        return;
      }
    }

    runWithSlideTransition(() => {
      setActiveSlideIndex((current) => Math.max(0, current - 1));
    });
  }

  function goToNextSlide() {
    runWithSlideTransition(() => {
      setActiveSlideIndex((current) => Math.min(SLIDE_STEPS.length - 1, current + 1));
    });
  }

  function goToPreviousSlide() {
    runWithSlideTransition(() => {
      setActiveSlideIndex((current) => Math.max(0, current - 1));
    });
  }

  function scrollToSection(id: string) {
    if (slideView && slideFrameRef.current) {
      const container = getTimelineScrollContainer() ?? slideFrameRef.current;
      const phaseRowTarget = container.querySelector<HTMLElement>(`[data-phase-row="${id}"]`);

      if (phaseRowTarget) {
        scrollElementToTop(container, phaseRowTarget, "smooth");

        return;
      }

      const target = slideFrameRef.current.querySelector<HTMLElement>(`#${id}`);

      if (target) {
        scrollElementToTop(slideFrameRef.current, target, "smooth");
      }

      return;
    }

    const target = sectionRefs.current[id] ?? document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function enterFullscreen() {
    const target = slideShellRef.current ?? slideStageRef.current;

    if (!target) {
      return;
    }

    if (document.fullscreenElement === target) {
      await document.exitFullscreen();
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    await target.requestFullscreen();
  }

  function renderEvidenceCards(ids = EVIDENCE_ITEMS.map((item) => item.id), revealAll = false) {
    return (
      <div className="evidence-grid evidence-grid-tight">
        {ids.map((id) => {
          const item = evidenceById[id];

          if (!item) {
            return null;
          }

          const revealed = revealAll || Boolean(revealedCards[item.id]);
          return (
            <button
              key={item.id}
              id={item.id}
              type="button"
              className={revealed ? "evidence-card reveal-card shown" : "evidence-card reveal-card"}
              onClick={() => toggleCard(item.id)}
            >
              <h2>{item.title}</h2>
              <p className={revealed ? "evidence-value revealed" : "evidence-value hidden-number"}>
                {item.value}
                {item.unit ? <span> {item.unit}</span> : null}
              </p>
              <p className="evidence-notes">{item.note}</p>
              <a
                className="evidence-link"
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                {item.sourceLabel}
              </a>
            </button>
          );
        })}
      </div>
    );
  }

  function renderImpactLab() {
    return (
      <>
        <div className="meter-card">
          <div className="meter-copy">
            <p className="meter-kicker">Total emissions estimate</p>
            <div className="meter-values">
              <strong>{totalEmissions.toFixed(1)} MtCO2-e</strong>
              <span>
                {delta === 0 ? "at today's baseline" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} MtCO2-e vs today`}
              </span>
            </div>
          </div>

          <div className="meter-track" aria-hidden="true">
            <div className={`meter-fill ${emissionTone(totalEmissions)}`} style={{ width: `${totalBarWidth}%` }} />
            <div className="meter-goal" style={{ left: `${targetBarPosition}%` }}>
              <span className="meter-goal-line" />
              <span className="meter-goal-label">2035 target</span>
            </div>
            <div className="meter-goal meter-goal-net-zero" style={{ left: `${netZeroBarPosition}%` }}>
              <span className="meter-goal-line" />
              <span className="meter-goal-label">2050 carbon-neutral goal</span>
            </div>
          </div>

          <div className="meter-scale">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
          <p className="meter-goal-note">Marker at the far left shows the 2050 carbon-neutral direction: near-zero net emissions.</p>
        </div>

        <div className="pie-grid">
          <DraggablePie
            title="Transport pattern"
            subtitle="Presentation proxy built from official transport and EV data"
            note="Public transport is official. EV and oil-car slices are inferred by splitting the non-public share using the latest official private-car EV share."
            baseline={BASE_TRANSPORT}
            slices={[
              { label: "Public transport", value: transportMix[0], color: "#1f7a69" },
              { label: "Oil cars", value: transportMix[1], color: "#9d2d2d" },
              { label: "Electric cars", value: transportMix[2], color: "#d4a021" },
            ]}
            onChange={setTransportMix}
            onReset={() => setTransportMix([...BASE_TRANSPORT])}
          />

          <DraggablePie
            title="Electricity source mix"
            subtitle="Derived 2024 Hong Kong-wide estimate"
            note="This mix is inferred from CLP's 2024 sales and fuel mix plus HK Electric's 2024 sales and fuel mix."
            baseline={BASE_ENERGY}
            slices={[
              { label: "Fossil fuel", value: energyMix[0], color: "#2a2a2a" },
              { label: "Nuclear", value: energyMix[1], color: "#345f9a" },
              { label: "Solar and wind", value: energyMix[2], color: "#d4a021" },
            ]}
            onChange={setEnergyMix}
            onReset={() => setEnergyMix([...BASE_ENERGY])}
          />
        </div>
      </>
    );
  }

  function renderBlockers(indexes?: number[]) {
    const blockers = indexes?.length ? indexes.map((index) => BLOCKERS[index]).filter(Boolean) : BLOCKERS;

    return (
      <div className="blocker-grid blocker-grid-featured">
        {blockers.map((blocker) => (
          <article key={blocker.title} className="blocker-card blocker-card-featured">
            <img src={blocker.image} alt={blocker.imageAlt} className="blocker-image" />
            <div className="blocker-copy">
              <h3>{blocker.title}</h3>
              <p>{blocker.body}</p>
              <a href={blocker.sourceUrl} target="_blank" rel="noreferrer">
                {blocker.sourceLabel}
              </a>
            </div>
          </article>
        ))}
      </div>
    );
  }

  function renderTimeline(showOnlyPhaseId?: string) {
    const phaseStartIndex = !showOnlyPhaseId && slideView && activeSlide.kind === "timeline"
      ? Math.max(0, activePhaseIndex)
      : 0;
    const phases = showOnlyPhaseId
      ? PHASES.filter((phase) => phase.id === showOnlyPhaseId)
      : PHASES.slice(phaseStartIndex);
    const timelineClassName = showOnlyPhaseId ? "timeline-vertical timeline-vertical-single" : "timeline-vertical";

    return (
      <div className={timelineClassName}>
        <div className="timeline-line" aria-hidden="true" />
        {phases.map((phase, index) => {
          const active = phase.id === activePhaseId || Boolean(showOnlyPhaseId);
          const sideClass = index % 2 === 0 ? "phase-left" : "phase-right";
          const rowClassName = showOnlyPhaseId
            ? `timeline-row timeline-row-single ${sideClass} ${active ? "active" : ""}`
            : `timeline-row ${sideClass} ${active ? "active" : ""}`;

          return (
            <div
              key={phase.id}
              data-phase-row={phase.id}
              className={rowClassName}
            >
              <button
                type="button"
                className={active ? "timeline-point active" : "timeline-point"}
                onClick={() => {
                  setActivePhaseId(phase.id);
                  if (!slideView) {
                    scrollToSection(phase.id);
                  }
                }}
                aria-expanded={active}
              >
                <span className="timeline-point-year">{phase.years}</span>
              </button>

              <article
                id={phase.id}
                className={active ? "phase-card detailed active" : "phase-card detailed"}
              >
                <p className="phase-years">{phase.eyebrow}</p>
                <h2>{phase.title}</h2>
                <p className="phase-window">{phase.years}</p>
                <p className="phase-summary">{phase.body}</p>
                {active ? (
                  <ul className="phase-detail-list">
                    {phase.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </article>

              <figure
                className={active ? "phase-visual active" : "phase-visual"}
                aria-hidden={!active}
              >
                <img src={phase.image} alt={phase.imageAlt} className="phase-visual-image" />
              </figure>
            </div>
          );
        })}
      </div>
    );
  }

  function renderSpeakerTag(sectionId?: string) {
    if (!sectionId) {
      return null;
    }

    const section = sectionById[sectionId];

    if (!section) {
      return null;
    }

    return (
      <p className="speaker-chip">
        Section {section.number} · {section.speaker} · {section.studentId}
      </p>
    );
  }

  function renderSectionDivider(sectionId: string) {
    const section = sectionById[sectionId];

    if (!section) {
      return null;
    }

    return (
      <section className="slide slide-divider" id={section.id}>
        <div className="slide-index">Section break</div>
        <div className="divider-panel">
          <p className="divider-number">Section {section.number}</p>
          <h1>{section.title}</h1>
          <p>{section.summary}</p>
          {renderSpeakerTag(section.id)}
        </div>
      </section>
    );
  }

  function renderIntroduction() {
    return (
      <>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Section 1 / Introduction</p>
            <h1>Set the problem before proposing the pathway.</h1>
            {renderSpeakerTag("section-1")}
          </div>
          <p className="section-intro">
            This section distills the teammate introduction into three framing ideas: the city is constrained,
            the baseline is still carbon-intensive, and the consequences of delay are already local.
          </p>
        </div>

        <div className="overview-grid">
          {INTRO_PANELS.map((panel) => (
            <article key={panel.title} className="overview-card">
              {panel.stat ? <p className="overview-stat">{panel.stat}</p> : null}
              <h3>{panel.title}</h3>
              <p>{panel.body}</p>
            </article>
          ))}
        </div>
      </>
    );
  }

  function renderTechnology() {
    return (
      <>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Section 2 / Technology Analysis</p>
            <h1>Match technology to Hong Kong's actual operating conditions.</h1>
            {renderSpeakerTag("section-2")}
          </div>
          <p className="section-intro">
            The teammate deck centers on three technology tracks: building-scale solar, offshore wind, and
            grid intelligence. Click the tabs to move through them.
          </p>
        </div>

        <div className="interactive-tabs">
          {TECHNOLOGY_PANELS.map((panel) => (
            <button
              key={panel.id}
              type="button"
              className={activeTechnologyId === panel.id ? "jump-chip active-chip" : "jump-chip"}
              onClick={() => setActiveTechnologyId(panel.id)}
            >
              {panel.title}
            </button>
          ))}
        </div>

        {activeTechnology ? (
          <article className="focus-card">
            <p className="focus-kicker">{activeTechnology.kicker}</p>
            <h2>{activeTechnology.title}</h2>
            <p className="focus-body">{activeTechnology.body}</p>
            <ul className="focus-list">
              {activeTechnology.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ) : null}
      </>
    );
  }

  function renderEconomics() {
    return (
      <>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Section 3 / Economics &amp; Policy</p>
            <h1>Costs are improving, but policy still decides pace.</h1>
            {renderSpeakerTag("section-3")}
          </div>
          <p className="section-intro">
            This section from the teammate deck works best as a three-part argument: the cost case has shifted,
            bureaucracy still slows action, and better policy can widen participation.
          </p>
        </div>

        <div className="interactive-tabs">
          {POLICY_PANELS.map((panel) => (
            <button
              key={panel.id}
              type="button"
              className={activePolicyId === panel.id ? "jump-chip active-chip" : "jump-chip"}
              onClick={() => setActivePolicyId(panel.id)}
            >
              {panel.title}
            </button>
          ))}
        </div>

        <div className="policy-layout">
          <article className="focus-card">
            <p className="focus-kicker">{activePolicy?.kicker}</p>
            <h2>{activePolicy?.title}</h2>
            <p className="focus-body">{activePolicy?.body}</p>
            <ul className="focus-list">
              {activePolicy?.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>

          <aside className="stat-callout">
            <p className="stat-callout-kicker">Headline comparison</p>
            <strong>Solar $0.043/kWh</strong>
            <span>vs coal $0.073/kWh</span>
            <p>The teammate slide uses this comparison to show that the old price objection is much weaker today.</p>
          </aside>
        </div>
      </>
    );
  }

  function renderSocial() {
    return (
      <>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Section 4 / Social &amp; Environmental</p>
            <h1>Make the transition legitimate, not just feasible.</h1>
            {renderSpeakerTag("section-4")}
          </div>
          <p className="section-intro">
            The teammate section applies four lenses to test whether renewable deployment can earn public support
            while protecting ecological integrity.
          </p>
        </div>

        <div className="interactive-tabs">
          {SOCIAL_LENSES.map((lens) => (
            <button
              key={lens.id}
              type="button"
              className={activeSocialLensId === lens.id ? "jump-chip active-chip" : "jump-chip"}
              onClick={() => setActiveSocialLensId(lens.id)}
            >
              {lens.title}
            </button>
          ))}
        </div>

        {activeSocialLens ? (
          <div className="social-layout">
            <article className="focus-card">
              <p className="focus-kicker">{activeSocialLens.kicker}</p>
              <h2>{activeSocialLens.title}</h2>
              <p className="focus-body">{activeSocialLens.body}</p>
            </article>
            <article className="support-card">
              <h3>Evidence from the deck</h3>
              <p>{activeSocialLens.evidence}</p>
              <h3>Presentation takeaway</h3>
              <p>{activeSocialLens.takeaway}</p>
            </article>
          </div>
        ) : null}
      </>
    );
  }

  function renderConclusion() {
    return (
      <>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Section 6 / Conclusion &amp; Coordination</p>
            <h1>Bring the eight dimensions back together.</h1>
            {renderSpeakerTag("section-6")}
          </div>
          <p className="section-intro">
            The final teammate section closes with four clear messages. In the web version, they work best as a
            compact coordination grid rather than one long summary paragraph.
          </p>
        </div>

        <div className="overview-grid conclusion-grid">
          {CONCLUSION_POINTS.map((point) => (
            <article key={point.title} className="overview-card">
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </>
    );
  }

  function renderCoverSlide() {
    return (
      <div className="cover-hero">
        <img
          src="/eng3004-hk-skyline-renewable.png"
          alt="Hong Kong skyline with renewable energy overlay"
          className="cover-hero-image"
        />
        <div className="cover-hero-overlay" />
        <div className="cover-hero-copy">
          <p className="divider-number">ENG3004 Group Project</p>
          <h1>Future of Green Energy in Hong Kong</h1>
          <p>Six linked sections, one integrated pathway to carbon neutrality by 2050.</p>
          <div className="cover-speaker-grid">
            {SECTIONS.map((section) => (
              <div key={section.id} className="cover-speaker-card">
                <strong>
                  Section {section.number} · {section.shortTitle}
                </strong>
                <span>{section.speaker}</span>
                <small>{section.studentId}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderSectionFiveIntroSlide() {
    return (
      <div className="section-five-intro">
        <img
          src="/timeline-phase-3.png"
          alt="Hong Kong energy pathways visual"
          className="section-five-intro-image"
        />
        <div className="section-five-intro-overlay" />
        <div className="section-five-intro-copy">
          <p className="divider-number">Section 05</p>
          <h2>Integration &amp; Pathways</h2>
          <p>Connect the parts into one pathway: evidence, system trade-offs, blockers and the staged roadmap.</p>
          {renderSpeakerTag("section-5")}
        </div>
      </div>
    );
  }

  function renderPdfSlide(page: number, title: string) {
    const src = getTeammateRenderSrc(page);

    return (
      <div className="pdf-slide-shell">
        <img
          className="pdf-slide-image"
          src={src}
          title={title}
          alt={title}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </div>
    );
  }

  function renderCompactContentSlide(contentId?: string) {
    switch (contentId) {
      case "intro-challenge":
        return (
          <div className="compact-grid compact-grid-3">
            {INTRO_PANELS.map((panel) => (
              <article key={panel.title} className="compact-card">
                {panel.stat ? <p className="overview-stat">{panel.stat}</p> : null}
                <h3>{panel.title}</h3>
                <p>{panel.body}</p>
              </article>
            ))}
          </div>
        );
      case "intro-mix":
        return (
          <div className="mix-slide">
            <article className="compact-card">
              <p className="focus-kicker">Indicative Hong Kong electricity mix</p>
              <div className="stack-bar">
                <span className="stack-segment stack-fossil" style={{ width: `${BASE_ENERGY[0]}%` }}>
                  Fossil
                </span>
                <span className="stack-segment stack-nuclear" style={{ width: `${BASE_ENERGY[1]}%` }}>
                  Nuclear
                </span>
                <span className="stack-segment stack-renewable" style={{ width: `${BASE_ENERGY[2]}%` }} />
              </div>
              <div className="mini-legend">
                <span><i className="swatch fossil" /> {BASE_ENERGY[0]}% fossil fuel</span>
                <span><i className="swatch nuclear" /> {BASE_ENERGY[1]}% nuclear</span>
                <span><i className="swatch renewable" /> {BASE_ENERGY[2]}% solar and wind</span>
              </div>
            </article>
            <article className="compact-card">
              <h3>Presentation point</h3>
              <p>Even before we debate solutions, the system starts from a fossil-heavy baseline. That is why electricity remains the main lever across the whole presentation.</p>
            </article>
          </div>
        );
      case "intro-city":
        return (
          <div className="process-strip">
            <article className="process-card">
              <h3>Dense urban form</h3>
              <p>High-rise buildings and limited land raise cooling demand and narrow the set of local energy options.</p>
            </article>
            <article className="process-card">
              <h3>Urban heat island</h3>
              <p>The teammate deck links Hong Kong's city form to hotter conditions and heavier summer stress.</p>
            </article>
            <article className="process-card">
              <h3>Human impact</h3>
              <p>Health pressure, including asthma and breathing problems, turns energy planning into a live resilience issue.</p>
            </article>
          </div>
        );
      case "tech-solar":
      case "tech-wind":
      case "tech-grid": {
        const panel =
          contentId === "tech-solar"
            ? TECHNOLOGY_PANELS[0]
            : contentId === "tech-wind"
              ? TECHNOLOGY_PANELS[1]
              : TECHNOLOGY_PANELS[2];
        const image =
          contentId === "tech-solar"
            ? "/eng3004-rooftop-solar.png"
            : contentId === "tech-wind"
              ? "/eng3004-offshore-wind.png"
              : "/timeline-phase-3.png";
        return (
          <div className="visual-slide">
            <img src={image} alt={panel.title} className="visual-slide-image" />
            <article className="focus-card">
              <p className="focus-kicker">{panel.kicker}</p>
              <h2>{panel.title}</h2>
              <p className="focus-body">{panel.body}</p>
              <ul className="focus-list">
                {panel.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        );
      }
      case "econ-cost":
        return (
          <div className="policy-layout">
            <article className="compact-card">
              <p className="focus-kicker">Cost comparison from the teammate deck</p>
              <div className="cost-bars">
                <div className="cost-row">
                  <span>Solar</span>
                  <div className="cost-bar-track"><div className="cost-bar solar-bar" style={{ width: "59%" }} /></div>
                  <strong>$0.043/kWh</strong>
                </div>
                <div className="cost-row">
                  <span>Coal</span>
                  <div className="cost-bar-track"><div className="cost-bar coal-bar" style={{ width: "100%" }} /></div>
                  <strong>$0.073/kWh</strong>
                </div>
              </div>
            </article>
            <article className="compact-card">
              <h3>Presentation point</h3>
              <p>The economics slide works best as a reset: the central issue is no longer whether clean energy is always too expensive, but whether deployment systems move fast enough.</p>
            </article>
          </div>
        );
      case "econ-policy":
        return (
          <div className="compact-grid compact-grid-2">
            <article className="compact-card">
              <h3>Policy bottleneck</h3>
              <p>Rural solar approvals can take 6 to 12 months, creating delay, uncertainty and weaker private-sector confidence.</p>
            </article>
            <article className="compact-card">
              <h3>Presentation point</h3>
              <p>Good policy does not just support the transition. It decides whether technology is actually deployed at scale.</p>
            </article>
          </div>
        );
      case "econ-prosumer":
        return (
          <div className="compact-grid compact-grid-2">
            <article className="compact-card">
              <h3>Prosumer model</h3>
              <p>Schools and residential buildings can move from passive consumers to visible participants when policy lets them sell solar energy back to the grid.</p>
            </article>
            <article className="compact-card">
              <h3>Why it matters</h3>
              <p>That shift widens participation, strengthens public ownership of the transition and makes clean energy more tangible in everyday life.</p>
            </article>
          </div>
        );
      case "social-holistic":
      case "social-community":
      case "social-cultural":
      case "social-environmental":
      case "social-lifecycle": {
        const lensMap: Record<string, string> = {
          "social-holistic": "holistic",
          "social-community": "social",
          "social-cultural": "cultural",
          "social-environmental": "environmental",
          "social-lifecycle": "lifecycle",
        };
        const imageMap: Record<string, string> = {
          "social-environmental": "/eng3004-offshore-wind.png",
          "social-lifecycle": "/eng3004-rooftop-solar.png",
        };
        const lens = socialById[lensMap[contentId!]];
        if (!lens) return null;
        const principleNum = lens.kicker.match(/Principle (\d+)/)?.[1];
        const image = imageMap[contentId!];
        return (
          <div className={image ? "visual-slide" : "social-lens-slide"}>
            {image ? <img src={image} alt={lens.title} className="visual-slide-image" /> : null}
            <article className="focus-card">
              {principleNum ? (
                <div className="principle-badge">
                  <span className="principle-number">{principleNum}</span>
                  <span className="principle-label">SD Principle</span>
                </div>
              ) : null}
              <p className="focus-kicker">{lens.kicker}</p>
              <h2>{lens.title}</h2>
              <p className="focus-body">{lens.body}</p>
              <div className="lens-evidence">
                <h3>Evidence</h3>
                <p>{lens.evidence}</p>
              </div>
              <div className="lens-takeaway">
                <h3>Takeaway</h3>
                <p>{lens.takeaway}</p>
              </div>
            </article>
          </div>
        );
      }
      case "conclusion":
        return (
          <div className="closing-slide">
            <div className="compact-grid compact-grid-3">
              <article className="compact-card">
                <h3>Policy must lead</h3>
                <p>Without faster approvals and stronger coordination, ready technologies will not scale in time.</p>
              </article>
              <article className="compact-card">
                <h3>Technology is ready</h3>
                <p>Solar, offshore wind, storage, smart grids and EV integration are deployable now.</p>
              </article>
              <article className="compact-card">
                <h3>Regional strategy matters</h3>
                <p>Hong Kong's pathway becomes more credible when local action is paired with Greater Bay Area collaboration.</p>
              </article>
            </div>
            <div className="closing-coordination">
              <div className="closing-copy">
                <p className="focus-kicker">Why the sections fit together</p>
                <h3>Decarbonization is a coordination problem</h3>
                <p>
                  The strongest ending is not a recap of six separate parts. It is the claim that engineering,
                  policy, economics, society and regional links only work when they reinforce one another.
                </p>
              </div>
              <div className="coordination-grid">
                {SECTIONS.slice(0, 6).map((section) => (
                  <article key={section.id} className="coordination-node">
                    <strong>{section.number}</strong>
                    <span>{section.shortTitle}</span>
                  </article>
                ))}
                <div className="coordination-center">Net Zero Pathway</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function renderSlideView() {
    const useEmbeddedSectionLayout = ["cover", "divider", "pdf"].includes(activeSlide.kind);
    const showStandaloneSpeaker = ["content", "evidence", "impact", "blocker", "timeline"].includes(activeSlide.kind);
    const activeSection = activeSlide.sectionId ? sectionById[activeSlide.sectionId] : null;
    const jackNativeSlide = activeSlide.sectionId === "section-5" && activeSlide.kind !== "pdf";
    const slideStageClassName = jackNativeSlide ? "slide-mode-stage slide-mode-stage-section-5" : "slide-mode-stage";
    const slideFrameClassName = jackNativeSlide ? "slide-frame slide-frame-section-5" : "slide-frame";
    const slidePanelClassName = jackNativeSlide
      ? `slide-panel slide-panel-${activeSlide.kind} slide-panel-section-5`
      : `slide-panel slide-panel-${activeSlide.kind}`;

    return (
      <div
        className="slide-mode-shell"
        ref={(node) => {
          slideShellRef.current = node;
        }}
      >
        <div
          className={slideStageClassName}
          ref={(node) => {
            slideStageRef.current = node;
          }}
        >
          <div className="slide-mode-topbar">
            <div className="slide-mode-status">
              <p>
                Slide {activeSlideIndex + 1} / {SLIDE_STEPS.length}
              </p>
              {activeSection ? <span>Section {activeSection.number} · {activeSection.shortTitle}</span> : null}
            </div>
            <div className="slide-mode-actions">
              <a href={TEAMMATE_PDF} target="_blank" rel="noreferrer">
                Open PDF
              </a>
              <a href={TEAMMATE_PPTX} target="_blank" rel="noreferrer">
                Open PPTX
              </a>
              <button type="button" onClick={enterFullscreen}>
                Full screen
              </button>
              <button type="button" onClick={() => setSlideView(false)}>
                Exit slide view
              </button>
            </div>
          </div>

          <section
            className={slideFrameClassName}
            ref={(node) => {
              slideFrameRef.current = node;
            }}
            onWheel={(event) => {
              const target = event.target as Node | null;

              if (
                activeSlide.kind === "timeline" &&
                timelineScrollRef.current &&
                target &&
                timelineScrollRef.current.contains(target)
              ) {
                return;
              }

              event.preventDefault();
            }}
            onTouchMove={(event) => {
              const target = event.target as Node | null;

              if (
                activeSlide.kind === "timeline" &&
                timelineScrollRef.current &&
                target &&
                timelineScrollRef.current.contains(target)
              ) {
                return;
              }

              event.preventDefault();
            }}
          >
            <div
              key={slidePanelTransitionKey}
              className={slidePanelClassName}
              style={{ viewTransitionName: slideView ? "slide-content" : undefined }}
            >
              {jackNativeSlide ? (
                <div className="slide-native-meta">
                  <span className="slide-native-page">Page {activeSlideIndex + 1}</span>
                </div>
              ) : null}
              {!activeSlide.hideKickerInSlideView && !useEmbeddedSectionLayout ? (
                <p className="section-kicker">{activeSlide.label}</p>
              ) : null}
              {!useEmbeddedSectionLayout ? <h1 className="slide-frame-title">{activeSlide.title}</h1> : null}
              {!useEmbeddedSectionLayout && activeSlide.body ? (
                <p className="slide-frame-body">{activeSlide.body}</p>
              ) : null}
              {showStandaloneSpeaker ? renderSpeakerTag(activeSlide.sectionId) : null}

              {activeSlide.kind === "cover" ? renderCoverSlide() : null}
              {activeSlide.kind === "pdf" && activeSlide.pdfPage ? renderPdfSlide(activeSlide.pdfPage, activeSlide.title) : null}
              {activeSlide.kind === "divider" && activeSlide.sectionId ? (
                activeSlide.id === "slide-section-5-intro" ? (
                  renderSectionFiveIntroSlide()
                ) : (
                  <div className="divider-panel divider-panel-slide">
                    <p className="divider-number">Section {sectionById[activeSlide.sectionId]?.number}</p>
                    <h2>{sectionById[activeSlide.sectionId]?.title}</h2>
                    <p>{sectionById[activeSlide.sectionId]?.summary}</p>
                    {renderSpeakerTag(activeSlide.sectionId)}
                  </div>
                )
              ) : null}
              {activeSlide.kind === "content" ? renderCompactContentSlide(activeSlide.contentId) : null}
              {activeSlide.kind === "evidence" ? renderEvidenceCards(activeSlide.evidenceIds, false) : null}
              {activeSlide.kind === "impact" ? renderImpactLab() : null}
              {activeSlide.kind === "blocker" ? renderBlockers(activeSlide.blockerIndexes) : null}
              {activeSlide.kind === "timeline" ? (
                <div
                  className="timeline-slide-scroll"
                  ref={(node) => {
                    timelineScrollRef.current = node;
                  }}
                >
                  {renderTimeline()}
                </div>
              ) : null}
            </div>
          </section>

          <div className="slide-mode-nav">
            <button
              type="button"
              onClick={goBackward}
              disabled={activeSlideIndex === 0 && !hasRevealedEvidence && !hasPreviousPhase}
            >
              {previousLabel}
            </button>
            <button type="button" onClick={goToPreviousSlide} disabled={activeSlideIndex === 0}>
              Up
            </button>
            <button type="button" onClick={goToNextSlide} disabled={activeSlideIndex === SLIDE_STEPS.length - 1}>
              Down
            </button>
            <button
              type="button"
              onClick={goForward}
              disabled={activeSlideIndex === SLIDE_STEPS.length - 1 && !hasHiddenEvidence && !hasNextPhase}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (slideView) {
    return renderSlideView();
  }

  return (
    <main className="deck-shell">
      <div className="deck-noise" aria-hidden="true" />

      <header className="topbar">
        <p className="topbar-title">ENG3004 / Future of Green Energy in Hong Kong</p>
        <div className="topbar-nav" aria-label="Deck layout">
          <span className="topbar-chip">Slide 1: Native cover</span>
          <span className="topbar-chip">Slides 2-19: PDF deck</span>
          <span className="topbar-chip">Slides 20-26: Jack native section</span>
          <span className="topbar-chip">Slides 27-33: PDF deck</span>
        </div>
        <div className="topbar-cta">
          <a href={TEAMMATE_PDF} target="_blank" rel="noreferrer">
            PDF
          </a>
          <a href={TEAMMATE_PPTX} target="_blank" rel="noreferrer">
            PPTX
          </a>
          <button
            type="button"
            onClick={() => {
              runWithSlideTransition(() => {
                setActiveSlideIndex(0);
                setActivePhaseId(PHASES[0].id);
                setRevealedCards({});
                setSlideView(true);
              });
            }}
          >
            Slide view
          </button>
        </div>
      </header>

      <section
        className="slide slide-cover"
        id="overview"
      >
        <div className="slide-index">Deck overview</div>
        {renderCoverSlide()}
      </section>

      {renderSectionDivider("section-5")}

      <section
        className="slide slide-pathways-hub"
        id="section-5-overview"
      >
        <div className="slide-index">Native section overview</div>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Section 5 / Integration &amp; Pathways</p>
            <h1>Jack Zhao Xuecen's native slide block.</h1>
            {renderSpeakerTag("section-5")}
          </div>
          <p className="section-intro">
            The app now behaves like a compact presentation shell: Sections 1-4 and 6 come from the refreshed
            PDF deck, while Jack's section stays native so the evidence, impact lab and pathway sequence remain interactive.
          </p>
        </div>

        <div className="compact-grid compact-grid-2 native-sequence-grid">
          {jackSlideSteps.map((step) => (
            <article key={step.id} className="compact-card">
              <p className="focus-kicker">Page {step.page}</p>
              <h3>{step.title}</h3>
              <p>{step.label}</p>
            </article>
          ))}
        </div>

        <div className="jump-row">
          <button
            type="button"
            className="jump-chip"
            onClick={() => {
              setActiveSlideIndex(jackSectionStartIndex);
              setActivePhaseId(PHASES[0].id);
              setRevealedCards({});
              setSlideView(true);
            }}
          >
            Open at Section 5
          </button>
          <button
            type="button"
            className="jump-chip"
            onClick={() => {
              setActiveSlideIndex(jackSectionStartIndex + 1);
              setActivePhaseId(PHASES[0].id);
              setRevealedCards({});
              setSlideView(true);
            }}
          >
            Jump to evidence slides
          </button>
        </div>
      </section>
    </main>
  );
}
