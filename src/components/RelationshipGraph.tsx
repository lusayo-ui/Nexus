import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Share2, Users, Building2, Calendar, MapPin, Cpu } from 'lucide-react';

interface Entity {
  name: string;
  type: "Organization" | "Person" | "Event" | "Location" | "Technology";
  connections: {
    target: string;
    relationship: string;
  }[];
}

interface RelationshipGraphProps {
  entities: Entity[];
  darkMode: boolean;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ entities, darkMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || entities.length === 0) return;

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Prepare data for D3
    const nodes: any[] = entities.map(e => ({ id: e.name, type: e.type }));
    const links: any[] = [];
    
    entities.forEach(e => {
      e.connections.forEach(c => {
        // Only add link if target exists in nodes
        if (entities.some(ent => ent.name === c.target)) {
          links.push({ source: e.name, target: c.target, relationship: c.relationship });
        }
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60));

    const link = svg.append("g")
      .attr("stroke", darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    const typeColors: any = {
      Organization: "#3b82f6",
      Person: "#ec4899",
      Event: "#f97316",
      Location: "#10b981",
      Technology: "#8b5cf6"
    };

    node.append("circle")
      .attr("r", 25)
      .attr("fill", (d: any) => typeColors[d.type] || "#6b7280")
      .attr("stroke", darkMode ? "#111827" : "#ffffff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9);

    node.append("text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("fill", darkMode ? "#ffffff" : "#111827")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .text((d: any) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [entities, darkMode]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Organization': return <Building2 size={14} />;
      case 'Person': return <Users size={14} />;
      case 'Event': return <Calendar size={14} />;
      case 'Location': return <MapPin size={14} />;
      case 'Technology': return <Cpu size={14} />;
      default: return <Share2 size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="serif text-3xl font-light dark:text-white">Intelligence Nexus</h3>
          <p className="text-xs uppercase tracking-widest opacity-40 mt-1 dark:text-white/40">Entity relationship mapping</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {Object.entries({
            Organization: "bg-blue-500",
            Person: "bg-pink-500",
            Event: "bg-orange-500",
            Location: "bg-emerald-500",
            Technology: "bg-violet-500"
          }).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[9px] uppercase font-bold opacity-60 dark:text-white">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 p-8 overflow-hidden shadow-inner h-[600px]">
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 500" 
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
        
        <div className="absolute top-8 right-8 w-64 space-y-4">
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/5">
            <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-3 dark:text-white/40">Key Connections</h4>
            <div className="space-y-3">
              {entities.slice(0, 4).map((entity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    entity.type === 'Organization' ? 'bg-blue-500/10 text-blue-500' :
                    entity.type === 'Person' ? 'bg-pink-500/10 text-pink-500' :
                    entity.type === 'Event' ? 'bg-orange-500/10 text-orange-500' :
                    entity.type === 'Location' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-violet-500/10 text-violet-500'
                  }`}>
                    {getIcon(entity.type)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold truncate dark:text-white">{entity.name}</p>
                    <p className="text-[9px] opacity-40 truncate dark:text-white/40">{entity.connections.length} links</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
