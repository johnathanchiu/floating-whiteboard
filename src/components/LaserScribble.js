import { getSvgPathFromPoints } from "tldraw";

export default function LaserScribble({ scribble, zoom, color, opacity, className }) {
  if (!scribble.points.length) return null;

  return (
    <svg className={"tl-overlays__item"}>
      <path
        className="tl-scribble"
        d={getSvgPathFromPoints(scribble.points, false)}
        stroke="rgba(255, 0, 0, 0.5)"
        fill="none"
        strokeWidth={8 / zoom}
        opacity={opacity ?? scribble.opacity}
      />
    </svg>
  );
}
