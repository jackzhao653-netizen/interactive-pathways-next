"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";

type Slice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  subtitle: string;
  note: string;
  slices: Slice[];
  baseline: number[];
  onChange: (values: number[]) => void;
  onReset: () => void;
};

const VIEWBOX_SIZE = 260;
const CENTER = VIEWBOX_SIZE / 2;
const OUTER_RADIUS = 92;
const INNER_RADIUS = 50;
const MIN_SLICE = 1;
const HANDLE_RADIUS = 8;

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizePercent(value: number) {
  return ((value % 100) + 100) % 100;
}

function angleToPoint(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function describeDonutArc(startAngle: number, endAngle: number) {
  const startOuter = angleToPoint(startAngle, OUTER_RADIUS);
  const endOuter = angleToPoint(endAngle, OUTER_RADIUS);
  const startInner = angleToPoint(startAngle, INNER_RADIUS);
  const endInner = angleToPoint(endAngle, INNER_RADIUS);
  const delta = ((endAngle - startAngle) % 360 + 360) % 360;
  const largeArcFlag = delta > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ");
}

function normalizeValues(values: number[]) {
  const safeValues = values.map((value) => Math.max(MIN_SLICE, value));
  const total = safeValues.reduce((sum, value) => sum + value, 0);
  const normalized = safeValues.map((value) => roundOne((value / total) * 100));
  const diff = roundOne(100 - normalized.reduce((sum, value) => sum + value, 0));
  normalized[normalized.length - 1] = roundOne(normalized[normalized.length - 1] + diff);
  return normalized;
}

function angleFromPointer(svg: SVGSVGElement, clientX: number, clientY: number) {
  const rect = svg.getBoundingClientRect();
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  const angleValue = (Math.atan2(y, x) * 180) / Math.PI + 90;

  return ((angleValue % 360) + 360) % 360;
}

export function DraggablePie({ title, subtitle, note, slices, baseline, onChange, onReset }: Props) {
  const [rotation, setRotation] = useState(0);
  const dragStateRef = useRef<{
    turnOffset: number;
    lastRawAngle: number;
  } | null>(null);
  const normalizedSlices = normalizeValues(slices.map((slice) => slice.value));

  const startsAbs = normalizedSlices.map((_, index) => {
    if (index === 0) {
      return rotation;
    }

    const consumed = normalizedSlices.slice(0, index).reduce((sum, value) => sum + value, 0);
    return rotation + consumed;
  });

  function updateDivider(dividerIndex: number, absoluteTargetPercent: number) {
    const previous =
      dividerIndex === 0 ? startsAbs[startsAbs.length - 1] - 100 : startsAbs[dividerIndex - 1];
    const next =
      dividerIndex === startsAbs.length - 1 ? startsAbs[0] + 100 : startsAbs[dividerIndex + 1];
    const clamped = Math.min(next - MIN_SLICE, Math.max(previous + MIN_SLICE, absoluteTargetPercent));
    const nextStarts = [...startsAbs];

    nextStarts[dividerIndex] = clamped;

    const nextValues = normalizedSlices.map((_, index) => {
      const start = nextStarts[index];
      const end = index === nextStarts.length - 1 ? nextStarts[0] + 100 : nextStarts[index + 1];
      return roundOne(end - start);
    });

    const diff = roundOne(100 - nextValues.reduce((sum, value) => sum + value, 0));
    nextValues[nextValues.length - 1] = roundOne(nextValues[nextValues.length - 1] + diff);

    setRotation(normalizePercent(nextStarts[0]));
    onChange(nextValues);
  }

  return (
    <article className="pie-card">
      <div className="pie-card-head">
        <div className="pie-card-copy">
          <p className="pie-kicker">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        <button
          type="button"
          className="pie-reset"
          onClick={() => {
            setRotation(0);
            onReset();
          }}
        >
          Current
        </button>
      </div>

      <svg className="pie-svg" viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} role="img" aria-label={title}>
        <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS + 12} className="pie-shadow-ring" />
        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} className="pie-core" />

        {(() => {
          let running = rotation;

          return normalizedSlices.map((slice, index) => {
            const startAngle = running * 3.6;
            running += slice;
            const endAngle = running * 3.6;

            return (
              <path
                key={slices[index].label}
                d={describeDonutArc(startAngle, endAngle)}
                fill={slices[index].color}
                className="pie-segment"
              />
            );
          });
        })()}

        {startsAbs.map((start, index) => {
          const angle = normalizePercent(start) * 3.6;
          const innerPoint = angleToPoint(angle, INNER_RADIUS);
          const outerPoint = angleToPoint(angle, OUTER_RADIUS + 2);
          const handlePoint = angleToPoint(angle, OUTER_RADIUS + 10);
          const startDrag = (event: ReactPointerEvent<SVGCircleElement | SVGLineElement>) => {
            const svg = event.currentTarget.ownerSVGElement;

            if (!svg) {
              return;
            }

            event.preventDefault();
            const rawAngle = angleFromPointer(svg, event.clientX, event.clientY);
            dragStateRef.current = {
              turnOffset: start * 3.6 - rawAngle,
              lastRawAngle: rawAngle,
            };

            svg.setPointerCapture(event.pointerId);

            const move = (moveEvent: PointerEvent) => {
              if (!dragStateRef.current) {
                return;
              }

              moveEvent.preventDefault();
              const nextRawAngle = angleFromPointer(svg, moveEvent.clientX, moveEvent.clientY);
              const delta = nextRawAngle - dragStateRef.current.lastRawAngle;

              if (delta > 180) {
                dragStateRef.current.turnOffset -= 360;
              } else if (delta < -180) {
                dragStateRef.current.turnOffset += 360;
              }

              dragStateRef.current.lastRawAngle = nextRawAngle;

              const continuousAngle = nextRawAngle + dragStateRef.current.turnOffset;
              updateDivider(index, continuousAngle / 3.6);
            };

            const stop = () => {
              dragStateRef.current = null;
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", stop);
            };

            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", stop, { once: true });
          };

          return (
            <g key={`${title}-divider-${index}`}>
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                className="pie-divider"
              />
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                className="pie-divider-hit"
                onPointerDown={startDrag}
              />
              <circle
                cx={handlePoint.x}
                cy={handlePoint.y}
                r={HANDLE_RADIUS}
                className="pie-handle"
                onPointerDown={startDrag}
              />
            </g>
          );
        })}
      </svg>

      <div className="pie-legend">
        {slices.map((slice, index) => (
          <div key={slice.label} className="pie-legend-row">
            <span className="pie-control-name">
              <span className="pie-swatch" style={{ backgroundColor: slice.color }} />
              {slice.label}
            </span>
            <strong>{normalizedSlices[index].toFixed(1)}%</strong>
          </div>
        ))}
      </div>

      <p className="pie-baseline">
        Today: {baseline.map((value) => `${value.toFixed(1)}%`).join(" / ")}
      </p>
      <p className="pie-note">{note}</p>
    </article>
  );
}
