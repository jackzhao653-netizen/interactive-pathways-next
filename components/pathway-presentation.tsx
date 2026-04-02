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

type SlideStep = {
  id: string;
  label: string;
  kind: "evidence" | "impact" | "blocker" | "timeline";
  title: string;
  body?: string;
  evidenceIds?: string[];
  phaseId?: string;
  hideKickerInSlideView?: boolean;
};

const BASE_TOTAL_EMISSIONS = 33.2;
const HK_2035_TARGET_EMISSIONS = 20.0;

const BASE_TRANSPORT = [90, 7.9, 2.1];
const BASE_ENERGY = [75, 24.2, 0.8];

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
];

const SLIDE_STEPS: SlideStep[] = [
  {
    id: "slide-evidence-1",
    label: "Evidence 1",
    kind: "evidence",
    title: "Hong Kong's current emissions baseline",
    body: "Use these four numbers to establish scale first: total emissions, per-capita emissions, and the two sectors that dominate the system today. This slide is the baseline the rest of the pathway responds to.",
    evidenceIds: ["evidence-total", "evidence-percapita", "evidence-electricity", "evidence-transport"],
    hideKickerInSlideView: true,
  },
  {
    id: "slide-evidence-2",
    label: "Evidence 2",
    kind: "evidence",
    title: "Transport and grid transition signals",
    body: "Then show where momentum already exists: very high public-transport use, rising EV adoption, large-scale smart-meter rollout, and Feed-in Tariff participation. Together, these indicators make the pathway practical rather than abstract.",
    evidenceIds: [
      "evidence-public-transport",
      "evidence-ev",
      "evidence-smart-meter",
      "evidence-fit",
    ],
    hideKickerInSlideView: true,
  },
  {
    id: "slide-impact",
    label: "Impact Lab",
    kind: "impact",
    title: "Impact lab",
    body: "Use the divider controls to demonstrate which system changes shift emissions the most.",
  },
  {
    id: "slide-blockers",
    label: "Blockers",
    kind: "blocker",
    title: "Why local solar and wind cannot carry Hong Kong alone",
    body: "Pair each constraint with a visual reference so the argument feels grounded in Hong Kong's physical context.",
  },
  {
    id: "slide-timeline",
    label: "Timeline",
    kind: "timeline",
    title: "Pathway timeline",
    body: "Use each stage as a clear speaking beat, moving from early proof to long-term system integration.",
  },
];

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
  const delta = roundOne(totalEmissions - BASE_TOTAL_EMISSIONS);

  const evidenceById = useMemo(
    () => Object.fromEntries(EVIDENCE_ITEMS.map((item) => [item.id, item])),
    [],
  );
  const activeSlide = SLIDE_STEPS[activeSlideIndex];
  const activePhaseIndex = PHASES.findIndex((phase) => phase.id === activePhaseId);

  const activeEvidenceIds = activeSlide.kind === "evidence" ? activeSlide.evidenceIds ?? [] : [];
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

    scrollPhaseRowToTop("smooth");

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

    setActiveSlideIndex((current) => Math.min(SLIDE_STEPS.length - 1, current + 1));
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

    setActiveSlideIndex((current) => Math.max(0, current - 1));
  }

  function goToNextSlide() {
    setActiveSlideIndex((current) => Math.min(SLIDE_STEPS.length - 1, current + 1));
  }

  function goToPreviousSlide() {
    setActiveSlideIndex((current) => Math.max(0, current - 1));
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
          </div>

          <div className="meter-scale">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
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

  function renderBlockers() {
    return (
      <div className="blocker-grid blocker-grid-featured">
        {BLOCKERS.map((blocker) => (
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
    const phases = showOnlyPhaseId ? PHASES.filter((phase) => phase.id === showOnlyPhaseId) : PHASES;

    return (
      <div className="timeline-vertical">
        <div className="timeline-line" aria-hidden="true" />
        {phases.map((phase, index) => {
          const active = phase.id === activePhaseId || Boolean(showOnlyPhaseId);
          const sideClass = index % 2 === 0 ? "phase-left" : "phase-right";

          return (
            <div
              key={phase.id}
              data-phase-row={phase.id}
              className={`timeline-row ${sideClass} ${active ? "active" : ""}`}
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

  function renderSlideView() {
    return (
      <div
        className="slide-mode-shell"
        ref={(node) => {
          slideShellRef.current = node;
        }}
      >
        <div
          className="slide-mode-stage"
          ref={(node) => {
            slideStageRef.current = node;
          }}
        >
          <div className="slide-mode-topbar">
            <p>
              Slide view {activeSlideIndex + 1}/{SLIDE_STEPS.length}
            </p>
            <div className="slide-mode-actions">
              <button type="button" onClick={enterFullscreen}>
                Full screen
              </button>
              <button type="button" onClick={() => setSlideView(false)}>
                Exit slide view
              </button>
            </div>
          </div>

          <section
            className="slide-frame"
            ref={(node) => {
              slideFrameRef.current = node;
            }}
            onWheel={(event) => event.preventDefault()}
            onTouchMove={(event) => event.preventDefault()}
          >
            <div key={activeSlide.id} className={`slide-panel slide-panel-${activeSlide.kind}`}>
              {!activeSlide.hideKickerInSlideView ? <p className="section-kicker">{activeSlide.label}</p> : null}
              <h1 className="slide-frame-title">{activeSlide.title}</h1>
              {activeSlide.body ? <p className="slide-frame-body">{activeSlide.body}</p> : null}

              {activeSlide.kind === "evidence" ? renderEvidenceCards(activeSlide.evidenceIds, false) : null}
              {activeSlide.kind === "impact" ? renderImpactLab() : null}
              {activeSlide.kind === "blocker" ? renderBlockers() : null}
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
        <p className="topbar-title">ENG3004 / Hong Kong Integration &amp; Pathways</p>
        <nav className="topbar-nav" aria-label="Section navigation">
          <a href="#evidence">Evidence</a>
          <a href="#lab">Impact Lab</a>
          <a href="#blockers">Blockers</a>
          <a href="#timeline">Timeline</a>
        </nav>
        <div className="topbar-cta">
          <button
            type="button"
            onClick={() => {
              setActiveSlideIndex(0);
              setActivePhaseId(PHASES[0].id);
              setRevealedCards({});
              setSlideView(true);
            }}
          >
            Slide view
          </button>
        </div>
      </header>

      <section
        className="slide slide-evidence"
        id="evidence"
        ref={(node) => {
          sectionRefs.current.evidence = node;
        }}
      >
        <div className="slide-index">First section</div>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Evidence deck</p>
            <h1>Ten figures that anchor the case.</h1>
          </div>
          <p className="section-intro">
            The values begin concealed so you can disclose them one at a time during delivery.
            Use the value chips below to move through the section quickly.
          </p>
        </div>

        <div className="jump-row">
          {EVIDENCE_ITEMS.map((item) => (
            <button key={item.id} type="button" className="jump-chip" onClick={() => scrollToSection(item.id)}>
              {item.value}
            </button>
          ))}
        </div>

        <div className="evidence-grid evidence-grid-tight">
          {EVIDENCE_ITEMS.map((item) => {
            const revealed = Boolean(revealedCards[item.id]);

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
      </section>

      <section
        className="slide slide-lab"
        id="lab"
        ref={(node) => {
          sectionRefs.current.lab = node;
        }}
      >
        <div className="slide-index">Interactive charts</div>
        <div className="section-heading compact-heading compact-lab-heading">
          <div>
            <p className="section-kicker">Impact lab</p>
            <h2 className="lab-title">Adjust each divider directly.</h2>
          </div>
          <p className="section-intro">
            Drag the dividers on each donut to test how different decisions would reshape the system mix and
            the overall emissions signal.
          </p>
        </div>
        {renderImpactLab()}
      </section>

      <section
        className="slide slide-blockers"
        id="blockers"
        ref={(node) => {
          sectionRefs.current.blockers = node;
        }}
      >
        <div className="slide-index">Separate section</div>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Solar / Wind blockers</p>
            <h1>Main reasons Hong Kong cannot rely heavily on local solar and wind alone</h1>
          </div>
          <p className="section-intro">
            This section now stands on its own, with visuals and sources, so it can function as a separate
            analytical segment in the presentation.
          </p>
        </div>
        {renderBlockers()}
      </section>

      <section
        className="slide slide-timeline"
        id="timeline"
        ref={(node) => {
          sectionRefs.current.timeline = node;
        }}
      >
        <div className="slide-index">Delivery structure</div>
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">Speaking flow</p>
            <h1>Move through the pathway phase by phase.</h1>
          </div>
          <p className="section-intro">
            Use the year markers below to reveal each stage as a clear presentation point in the pathway.
          </p>
        </div>

        <div className="jump-row">
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              type="button"
              className="jump-chip"
              onClick={() => {
                setActivePhaseId(phase.id);
                scrollToSection(phase.id);
              }}
            >
              {phase.years}
            </button>
          ))}
        </div>

        {renderTimeline()}
      </section>
    </main>
  );
}
