import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Share2, Users, Building2, Calendar, MapPin, Cpu, ShieldAlert } from 'lucide-react';

interface Entity {
  name: string;
  type: "Organization" | "Person" | "Event" | "Location" | "Technology" | "Company" | "Political Entity";
  connections: {
    target: string;
    relationship: string;
  }[];
}

interface RelationshipGraphProps {
  entities: Entity[];
  darkMode: boolean;
  onNodeClick?: (entity: Entity) => void;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ entities, darkMode, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || entities.length === 0) return;

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Prepare data for D3
    const nodes: any[] = entities.map(e => ({ id: e.name, type: e.type, original: e }));
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
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d.original);
      })
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("#graph-tooltip");
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
          <div class="font-bold">${d.id}</div>
          <div class="text-[10px] opacity-70">${d.type}</div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select(this).select("circle")
          .transition()
          .duration(300)
          .attr("r", 32)
          .attr("opacity", 1);
        
        d3.select(this).select("text")
          .transition()
          .duration(300)
          .attr("font-size", "12px")
          .attr("dy", 50);

        // Highlight connected links
        link.transition().duration(300)
          .attr("stroke", (l: any) => 
            l.source.id === d.id || l.target.id === d.id 
              ? (darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)") 
              : (darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")
          )
          .attr("stroke-width", (l: any) => l.source.id === d.id || l.target.id === d.id ? 3 : 1.5);
      })
      .on("mouseout", function(event, d) {
        d3.select("#graph-tooltip").transition().duration(500).style("opacity", 0);

        d3.select(this).select("circle")
          .transition()
          .duration(300)
          .attr("r", 25)
          .attr("opacity", 0.9);

        d3.select(this).select("text")
          .transition()
          .duration(300)
          .attr("font-size", "10px")
          .attr("dy", 40);

        link.transition().duration(300)
          .attr("stroke", darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
          .attr("stroke-width", 1.5);
      })
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
      Technology: "#8b5cf6",
      Company: "#06b6d4",
      "Political Entity": "#ef4444"
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
      case 'Company': return <Building2 size={14} />;
      case 'Political Entity': return <ShieldAlert size={14} />;
      default: return <Share2 size={14} />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div id="graph-tooltip" className="fixed opacity-0 pointer-events-none bg-white dark:bg-black/80 backdrop-blur-md border border-black/5 dark:border-white/10 p-2 rounded-lg shadow-xl text-[10px] z-50 dark:text-white" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="serif text-2xl md:text-3xl font-light dark:text-white">Intelligence Nexus</h3>
          <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 mt-1 dark:text-white/40">Entity relationship mapping</p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {Object.entries({
            Organization: "bg-blue-500",
            Person: "bg-pink-500",
            Event: "bg-orange-500",
            Location: "bg-emerald-500",
            Technology: "bg-violet-500",
            Company: "bg-cyan-500",
            "Political Entity": "bg-red-500"
          }).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 md:gap-2">
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${color}`} />
              <span className="text-[8px] md:text-[9px] uppercase font-bold opacity-60 dark:text-white">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative glass rounded-[2.5rem] border border-black/5 dark:border-white/5 p-4 md:p-8 overflow-hidden premium-shadow h-[400px] md:h-[600px] group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 500" 
          className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        />
        
        <div className="absolute bottom-6 left-6 right-6 md:bottom-auto md:left-auto md:top-8 md:right-8 md:w-72 z-20">
          <div className="glass p-5 rounded-[2rem] border border-black/5 dark:border-white/10 premium-shadow hover-lift">
            <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-4 dark:text-white/40">Key Connections</h4>
            <div className="flex md:flex-col gap-4 md:gap-4 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 no-scrollbar">
              {entities.slice(0, 4).map((entity, i) => (
                <div key={i} className="flex items-center gap-3 flex-shrink-0 md:flex-shrink group/item cursor-pointer">
                  <div className={`p-2 rounded-xl apple-icon-bg transition-transform group-hover/item:scale-110 ${
                    entity.type === 'Organization' ? 'text-blue-500' :
                    entity.type === 'Person' ? 'text-pink-500' :
                    entity.type === 'Event' ? 'text-orange-500' :
                    entity.type === 'Location' ? 'text-emerald-500' :
                    entity.type === 'Technology' ? 'text-violet-500' :
                    entity.type === 'Company' ? 'text-cyan-500' :
                    'text-red-500'
                  }`}>
                    {getIcon(entity.type)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold truncate dark:text-white group-hover/item:text-emerald-500 transition-colors">{entity.name}</p>
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
