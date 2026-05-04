'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useNoteStore, type Note, type LinkData } from '@/stores/note-store';

// ============================================================
// Types
// ============================================================

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  folderId: string | null;
  linkCount: number;
  color: string;
  isStarred: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  context: string;
}

interface GraphTooltip {
  nodeId: string;
  title: string;
  folderName: string;
  x: number;
  y: number;
}

// ============================================================
// Folder color mapping
// ============================================================

const FOLDER_COLORS: Record<string, string> = {
  work: '#6366f1',
  personal: '#f59e0b',
  ideas: '#10b981',
  archive: '#9ca3af',
};

const DEFAULT_COLOR = '#8b5cf6';

function getFolderColor(folderId: string | null): string {
  if (!folderId) return DEFAULT_COLOR;
  return FOLDER_COLORS[folderId] || DEFAULT_COLOR;
}

function getFolderName(folderId: string | null, folders: { id: string; name: string }[]): string {
  if (!folderId) return '未分类';
  return folders.find((f) => f.id === folderId)?.name ?? folderId;
}

// ============================================================
// Component
// ============================================================

interface KnowledgeGraphProps {
  highlightNodeId?: string | null;
  onNodeClick?: (noteId: string) => void;
  searchQuery?: string;
}

export function KnowledgeGraph({ highlightNodeId, onNodeClick, searchQuery = '' }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [tooltip, setTooltip] = useState<GraphTooltip | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const notes = useNoteStore((s) => s.notes);
  const links = useNoteStore((s) => s.links);
  const folders = useNoteStore((s) => s.folders);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);

  // Prepare graph data (exclude trashed notes)
  const { nodes, graphLinks } = useMemo(() => {
    const activeNotes = notes.filter((n) => !n.isTrashed);

    // Count links per note
    const linkCounts: Record<string, number> = {};
    for (const note of activeNotes) {
      linkCounts[note.id] = 0;
    }
    for (const link of links) {
      const s = link.source;
      const t = link.target;
      if (activeNotes.some((n) => n.id === s)) linkCounts[s] = (linkCounts[s] || 0) + 1;
      if (activeNotes.some((n) => n.id === t)) linkCounts[t] = (linkCounts[t] || 0) + 1;
    }

    // Filter links to only include active notes
    const activeNoteIds = new Set(activeNotes.map((n) => n.id));
    const filteredLinks = links.filter(
      (l) => activeNoteIds.has(l.source) && activeNoteIds.has(l.target)
    );

    // Search filter
    let filteredNodes = activeNotes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      // Keep nodes that match search or are connected to matching nodes
      const matchIds = new Set(
        activeNotes
          .filter((n) => n.title.toLowerCase().includes(q))
          .map((n) => n.id)
      );
      const connectedIds = new Set<string>();
      for (const link of filteredLinks) {
        if (matchIds.has(link.source)) connectedIds.add(link.target);
        if (matchIds.has(link.target)) connectedIds.add(link.source);
      }
      const visibleIds = new Set([...matchIds, ...connectedIds]);
      filteredNodes = activeNotes.filter((n) => visibleIds.has(n.id));

      const visibleLinkSet = filteredLinks.filter(
        (l) => visibleIds.has(l.source) && visibleIds.has(l.target)
      );

      const graphNodes: SimNode[] = filteredNodes.map((n) => ({
        id: n.id,
        title: n.title,
        folderId: n.folderId,
        linkCount: linkCounts[n.id] || 0,
        color: getFolderColor(n.folderId),
        isStarred: n.isStarred,
      }));

      const graphLinksData: SimLink[] = visibleLinkSet.map((l) => ({
        source: l.source,
        target: l.target,
        context: l.context,
      }));

      return { nodes: graphNodes, graphLinks: graphLinksData };
    }

    const graphNodes: SimNode[] = filteredNodes.map((n) => ({
      id: n.id,
      title: n.title,
      folderId: n.folderId,
      linkCount: linkCounts[n.id] || 0,
      color: getFolderColor(n.folderId),
      isStarred: n.isStarred,
    }));

    const graphLinksData: SimLink[] = filteredLinks.map((l) => ({
      source: l.source,
      target: l.target,
      context: l.context,
    }));

    return { nodes: graphNodes, graphLinks: graphLinksData };
  }, [notes, links, searchQuery]);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Build D3 graph
  const buildGraph = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Clear previous SVG content
    d3.select(svg).selectAll('*').remove();

    // Create defs for arrow markers and glow filters
    const defs = d3.select(svg).append('defs');

    // Arrow marker
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', 'var(--color-text-tertiary)')
      .attr('opacity', 0.6);

    // Glow filter for highlighted nodes
    const glow = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create main group for zoom
    const g = d3
      .select(svg)
      .append('g')
      .attr('class', 'graph-container');

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    zoomRef.current = zoom;

    d3.select(svg).call(zoom);

    // Double click to reset zoom
    d3.select(svg).on('dblclick.zoom', null);
    d3.select(svg).on('dblclick', () => {
      d3.select(svg)
        .transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // Create simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(graphLinks)
          .id((d) => d.id)
          .distance(140)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius((d) => getNodeRadius(d) + 10));

    simulationRef.current = simulation;

    // Draw links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphLinks)
      .join('line')
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation) as unknown as (selection: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>) => void);

    // Node circles (outer glow ring)
    node
      .append('circle')
      .attr('r', (d) => getNodeRadius(d) + 4)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0)
      .attr('class', 'node-glow');

    // Node circles (main)
    node
      .append('circle')
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.85)
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.3)
      .attr('class', 'node-circle');

    // Star indicator
    node
      .filter((d) => d.isStarred)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => `${Math.max(10, getNodeRadius(d) * 0.6)}px`)
      .attr('fill', 'var(--color-star)')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text('\u2605');

    // Node labels
    node
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', (d) => getNodeRadius(d) + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .text((d) => truncateText(d.title, 12));

    // Hover behavior
    node
      .on('mouseenter', (event, d) => {
        // Highlight connected nodes and links
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        graphLinks.forEach((l) => {
          const sId = typeof l.source === 'object' ? (l.source as SimNode).id : l.source;
          const tId = typeof l.target === 'object' ? (l.target as SimNode).id : l.target;
          if (sId === d.id) connectedIds.add(tId);
          if (tId === d.id) connectedIds.add(sId);
        });

        node
          .select('.node-circle')
          .attr('fill-opacity', (n) => (connectedIds.has(n.id) ? 0.95 : 0.15))
          .attr('stroke-opacity', (n) => (connectedIds.has(n.id) ? 0.6 : 0.05));
        node
          .select('.node-glow')
          .attr('stroke-opacity', (n) => (n.id === d.id ? 0.8 : 0));

        link
          .attr('stroke-opacity', (l) => {
            const sId = typeof l.source === 'object' ? (l.source as SimNode).id : l.source;
            const tId = typeof l.target === 'object' ? (l.target as SimNode).id : l.target;
            return sId === d.id || tId === d.id ? 0.8 : 0.08;
          })
          .attr('stroke', (l) => {
            const sId = typeof l.source === 'object' ? (l.source as SimNode).id : l.source;
            const tId = typeof l.target === 'object' ? (l.target as SimNode).id : l.target;
            return sId === d.id || tId === d.id ? d.color : 'var(--color-border)';
          });

        node.select('.node-label').attr('fill-opacity', (n) =>
          connectedIds.has(n.id) ? 1 : 0.2
        );

        // Show tooltip
        const [x, y] = d3.pointer(event, svg);
        setTooltip({
          nodeId: d.id,
          title: d.title,
          folderName: getFolderName(d.folderId, folders),
          x,
          y,
        });
      })
      .on('mousemove', (event) => {
        if (tooltip) {
          const [x, y] = d3.pointer(event, svg);
          setTooltip((prev) => (prev ? { ...prev, x, y } : null));
        }
      })
      .on('mouseleave', () => {
        // Reset all
        node
          .select('.node-circle')
          .attr('fill-opacity', 0.85)
          .attr('stroke-opacity', 0.3);
        node.select('.node-glow').attr('stroke-opacity', 0);
        link
          .attr('stroke-opacity', 0.5)
          .attr('stroke', 'var(--color-border)');
        node.select('.node-label').attr('fill-opacity', 1);
        setTooltip(null);
      })
      .on('click', (_event, d) => {
        setActiveNote(d.id);
        onNodeClick?.(d.id);
      });

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, graphLinks, dimensions, folders, setActiveNote, onNodeClick, tooltip]);

  // Rebuild graph when data changes
  useEffect(() => {
    const cleanup = buildGraph();
    return () => {
      cleanup?.();
      simulationRef.current?.stop();
    };
  }, [nodes, graphLinks, dimensions, buildGraph]);

  // Handle highlight from external
  useEffect(() => {
    if (!highlightNodeId || !svgRef.current) return;

    const node = d3
      .select(svgRef.current)
      .selectAll<SVGGElement, SimNode>('.nodes g')
      .filter((d) => d.id === highlightNodeId);

    if (!node.empty()) {
      const simNode = node.datum();
      const x = simNode.x ?? dimensions.width / 2;
      const y = simNode.y ?? dimensions.height / 2;

      d3.select(svgRef.current)
        .transition()
        .duration(600)
        .call(
          zoomRef.current!.transform,
          d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(1.5).translate(-x, -y)
        );

      // Brief highlight
      node
        .select('.node-circle')
        .transition()
        .duration(300)
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 5)
        .transition()
        .duration(600)
        .attr('stroke-opacity', 0.3)
        .attr('stroke-width', 2.5);
    }
  }, [highlightNodeId, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          background: 'var(--color-bg-primary)',
          cursor: 'grab',
        }}
      />

      {/* Legend */}
      <div
        className="absolute top-4 left-4 p-3 rounded-lg text-xs"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          文件夹图例
        </div>
        {[
          { id: 'work', name: '工作', icon: '💼' },
          { id: 'personal', name: '个人', icon: '🏠' },
          { id: 'ideas', name: '想法', icon: '💡' },
          { id: 'archive', name: '归档', icon: '📦' },
        ].map((folder) => (
          <div key={folder.id} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: FOLDER_COLORS[folder.id] }}
            />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {folder.icon} {folder.name}
            </span>
          </div>
        ))}
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-tertiary)' }}>
            {nodes.length} 个节点 · {graphLinks.length} 条链接
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-sm max-w-xs"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px var(--color-shadow)',
            left: tooltip.x + 16,
            top: tooltip.y - 8,
            color: 'var(--color-text-primary)',
          }}
        >
          <div className="font-semibold">{tooltip.title}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            📁 {tooltip.folderName}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function getNodeRadius(d: SimNode): number {
  const base = 14;
  const scale = Math.min(d.linkCount * 3, 16);
  return base + scale;
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

function drag(
  simulation: d3.Simulation<SimNode, SimLink>
): (selection: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>) => void {
  function dragstarted(
    event: d3.D3DragEvent<SVGGElement, SimNode, unknown>
  ) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, SimNode, unknown>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, SimNode, unknown>) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag<SVGGElement, SimNode>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}
