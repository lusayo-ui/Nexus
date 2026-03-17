import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Globe, Link2, FileText, Info } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'report' | 'source';
  group: number;
  url?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

interface SourceNetworkGraphProps {
  reports: any[];
  darkMode: boolean;
}

export const SourceNetworkGraph: React.FC<SourceNetworkGraphProps> = ({ reports, darkMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<{ name: string; type: string; url?: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || reports.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const nodes: Node[] = [];
    const links: Link[] = [];

    // Process reports and their sources into nodes and links
    reports.forEach((report, i) => {
      const reportId = `report-${report.id}`;
      nodes.push({
        id: reportId,
        name: report.title,
        type: 'report',
        group: 1
      });

      if (report.sources) {
        report.sources.forEach((source: string) => {
          const sourceId = `source-${source}`;
          if (!nodes.find(n => n.id === sourceId)) {
            nodes.push({
              id: sourceId,
              name: new URL(source).hostname,
              type: 'source',
              group: 2,
              url: source
            });
          }
          links.push({
            source: reportId,
            target: sourceId
          });
        });
      }
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = svg.append("g")
      .attr("stroke", darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredNode({
          name: d.name,
          type: d.type === 'report' ? 'Intelligence Report' : 'Primary Source',
          url: d.url,
          x: event.clientX,
          y: event.clientY
        });
      })
      .on("mousemove", (event) => {
        setHoveredNode(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
      })
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", d => d.type === 'report' ? 8 : 4)
      .attr("fill", d => d.type === 'report' ? (darkMode ? "#10b981" : "#059669") : (darkMode ? "#3b82f6" : "#2563eb"))
      .attr("stroke", darkMode ? "#000" : "#fff")
      .attr("stroke-width", 1.5);

    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + "..." : d.name)
      .attr("font-size", "10px")
      .attr("fill", darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)")
      .style("pointer-events", "none")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [reports, darkMode]);

  return (
    <div className="w-full h-full relative bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl">
      <div className="absolute top-8 left-8 z-10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Share2 size={18} />
          </div>
          <h3 className="serif text-2xl font-light dark:text-white">Source Provenance Web</h3>
        </div>
        <p className="text-xs text-black/40 dark:text-white/40 uppercase tracking-widest font-bold">Mapping intelligence lineage across global networks</p>
      </div>

      <div className="absolute bottom-8 left-8 z-10 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Intelligence Reports</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Primary Sources</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full" />

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ left: hoveredNode.x + 15, top: hoveredNode.y + 15 }}
            className="fixed z-[100] pointer-events-none bg-black/90 dark:bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 dark:border-black/10 shadow-2xl max-w-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info size={12} className="text-emerald-400 dark:text-emerald-600" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 dark:text-black/40">{hoveredNode.type}</span>
              </div>
              <h4 className="text-sm font-semibold text-white dark:text-black leading-tight">{hoveredNode.name}</h4>
              {hoveredNode.url && (
                <div className="pt-2 border-t border-white/10 dark:border-black/10">
                  <p className="text-[10px] text-emerald-400 dark:text-emerald-600 break-all font-mono">{hoveredNode.url}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
