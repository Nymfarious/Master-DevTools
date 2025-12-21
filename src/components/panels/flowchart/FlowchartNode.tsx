// FlowchartNode Component - ~80 lines
// Draggable node with input/output ports

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Terminal } from 'lucide-react';
import type { FlowNode } from './flowchartTypes';
import { portColors, nodeColors, iconMap } from './flowchartHelpers';

interface FlowchartNodeProps {
  node: FlowNode;
  onDrag: (id: string, pos: { x: number; y: number }) => void;
}

export function FlowchartNode({ node, onDrag }: FlowchartNodeProps) {
  const Icon = iconMap[node.style?.icon || 'terminal'] || Terminal;
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - node.position.x, y: e.clientY - node.position.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      onDrag(node.id, { x: Math.max(0, newX), y: Math.max(0, newY) });
    };
    
    const handleUp = () => setIsDragging(false);
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, node.id, onDrag]);

  return (
    <div
      className={cn(
        'absolute bg-terminal-surface border-2 rounded-lg shadow-lg min-w-[150px] cursor-grab',
        nodeColors[node.type],
        isDragging && 'cursor-grabbing shadow-xl z-50'
      )}
      style={{ left: node.position.x, top: node.position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="px-3 py-2 border-b border-terminal-border bg-terminal-elevated/50 rounded-t-md flex items-center gap-2">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono font-bold text-foreground">{node.label}</span>
      </div>
      <div className="px-2 py-2 flex justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {node.ports.inputs.map(port => (
            <div key={port.id} className="flex items-center gap-2" data-port={`${node.id}-${port.id}-in`}>
              <div className={cn('w-2.5 h-2.5 rounded-full border border-background', portColors[port.type])} />
              <span className="text-[10px] text-terminal-muted">{port.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {node.ports.outputs.map(port => (
            <div key={port.id} className="flex items-center gap-2" data-port={`${node.id}-${port.id}-out`}>
              <span className="text-[10px] text-terminal-muted">{port.label}</span>
              <div className={cn('w-2.5 h-2.5 rounded-full border border-background', portColors[port.type])} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
