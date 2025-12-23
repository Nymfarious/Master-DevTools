// FlowchartPanel - Main component with Architecture and Apps Map views
// Interactive flowchart with zoom, pan, and draggable nodes

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Network, LayoutGrid } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  flowchartViews,
  echoversNodes,
  echoversEdges,
  portColors,
  portTypeColorMap,
  FlowchartNode,
  ConnectionLine,
} from './flowchart';
import type { FlowNode, FlowEdge } from './flowchart';
import { AppsMapView } from './flowchart/AppsMapView';

type ViewMode = 'architecture' | 'apps-map';

export function FlowchartPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>('architecture');
  const [view, setView] = useState('echoverse-apps');
  const [zoom, setZoom] = useState(100);
  const [nodes, setNodes] = useState(echoversNodes);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeDrag = useCallback((id: string, pos: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, position: pos } : n));
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  const handlePan = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    const startX = e.clientX - pan.x;
    const startY = e.clientY - pan.y;
    
    const handleMove = (me: MouseEvent) => {
      setPan({ x: me.clientX - startX, y: me.clientY - startY });
    };
    
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const getPortPosition = (nodeId: string, portId: string, isOutput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const ports = isOutput ? node.ports.outputs : node.ports.inputs;
    const portIndex = ports.findIndex(p => p.id === portId);
    const nodeWidth = 150;
    const headerHeight = 32;
    const portHeight = 18;
    
    return {
      x: node.position.x + (isOutput ? nodeWidth : 0),
      y: node.position.y + headerHeight + 8 + portIndex * portHeight + 6,
    };
  };

  const getEdgeColor = (edge: FlowEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source.nodeId);
    const port = sourceNode?.ports.outputs.find(p => p.id === edge.source.portId);
    return portTypeColorMap[port?.type || 'any'];
  };

  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4 h-full">
      {/* Toolbar with View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="architecture" className="text-xs gap-1.5 px-3 h-7">
                <Network className="w-3 h-3" />
                Architecture
              </TabsTrigger>
              <TabsTrigger value="apps-map" className="text-xs gap-1.5 px-3 h-7">
                <LayoutGrid className="w-3 h-3" />
                Apps Map
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Architecture view selector - only show in architecture mode */}
          {viewMode === 'architecture' && (
            <>
              <span className="text-xs text-muted-foreground font-mono">View:</span>
              <Select value={view} onValueChange={setView}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flowchartViews.map(v => (
                    <SelectItem key={v.id} value={v.id} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Zoom controls - only show in architecture mode */}
        {viewMode === 'architecture' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Zoom: {zoom}%</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(prev => Math.min(200, prev + 10))}>
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(prev => Math.max(50, prev - 10))}>
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleReset}>
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setNodes(echoversNodes)}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'architecture' ? (
        /* Architecture Canvas */
        <div 
          ref={containerRef}
          className="relative w-full h-[500px] bg-terminal-bg border border-terminal-border rounded-lg overflow-hidden cursor-move grid-bg"
          onWheel={handleWheel}
          onMouseDown={handlePan}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
              transformOrigin: '0 0',
            }}
            className="absolute inset-0"
          >
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {echoversEdges.map(edge => {
                const start = getPortPosition(edge.source.nodeId, edge.source.portId, true);
                const end = getPortPosition(edge.target.nodeId, edge.target.portId, false);
                return (
                  <ConnectionLine
                    key={edge.id}
                    startX={start.x}
                    startY={start.y}
                    endX={end.x}
                    endY={end.y}
                    color={getEdgeColor(edge)}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <FlowchartNode key={node.id} node={node} onDrag={handleNodeDrag} />
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-terminal-surface/90 border border-terminal-border rounded p-2 text-[10px] font-mono">
            <div className="flex flex-wrap gap-3">
              {Object.entries(portColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className={cn('w-2 h-2 rounded-full', color)} />
                  <span className="text-terminal-muted capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Apps Map View */
        <AppsMapView />
      )}
    </div>
  );
}