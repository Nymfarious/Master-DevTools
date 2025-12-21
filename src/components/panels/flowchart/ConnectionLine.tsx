// ConnectionLine Component - ~25 lines
// Curved SVG path between ports

interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export function ConnectionLine({ startX, startY, endX, endY, color }: ConnectionLineProps) {
  const midX = (startX + endX) / 2;
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  
  return (
    <path
      d={path}
      stroke={color}
      strokeWidth="2"
      fill="none"
      className="drop-shadow-sm"
    />
  );
}
