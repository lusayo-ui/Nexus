import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Globe, ShieldAlert, TrendingUp } from 'lucide-react';

interface GeopoliticalRisk {
  countryCode: string;
  riskScore: number;
  sentiment: number;
  description?: string;
}

interface GeopoliticalMapProps {
  data: GeopoliticalRisk[];
  darkMode: boolean;
  onCountryClick?: (countryCode: string, event: any) => void;
}

export const GeopoliticalMap: React.FC<GeopoliticalMapProps> = ({ data, darkMode, onCountryClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 450;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world map data
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((worldData: any) => {
      
      const riskMap = new Map(data.map(d => [d.countryCode, d]));

      const colorScale = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(d3.interpolateRgb("#10b981", "#ef4444")); // Green to Red

      const g = svg.append("g");

      g.selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", (d: any) => {
          const risk = riskMap.get(d.id);
          if (risk) return colorScale(risk.riskScore);
          return darkMode ? "#1f2937" : "#e5e7eb";
        })
        .attr("stroke", darkMode ? "#111827" : "#ffffff")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("click", (event, d: any) => {
          if (onCountryClick) {
            onCountryClick(d.id || d.properties.name, event);
          }
        })
        .on("mouseover", function(event, d: any) {
          const risk = riskMap.get(d.id);
          const tooltip = d3.select("#map-tooltip");
          
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`
            <div class="p-3 min-w-[180px] space-y-2">
              <div class="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                <span class="font-bold text-xs tracking-tight">${d.properties.name}</span>
                <span class="text-[8px] uppercase tracking-widest opacity-40 font-bold">${d.id || 'N/A'}</span>
              </div>
              ${risk ? `
                <div class="flex items-center justify-between">
                  <span class="text-[9px] uppercase tracking-widest font-bold opacity-40">Risk Index</span>
                  <span class="text-[10px] ${risk.riskScore > 70 ? 'text-red-500' : risk.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'} font-bold">${risk.riskScore}%</span>
                </div>
                <div class="h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full ${risk.riskScore > 70 ? 'bg-red-500' : risk.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${risk.riskScore}%"></div>
                </div>
                <p class="text-[9px] leading-relaxed opacity-70 italic-small">${risk.description || 'No detailed intelligence available.'}</p>
              ` : `
                <div class="flex items-center gap-2 py-1">
                  <div class="w-1 h-1 rounded-full bg-slate-400"></div>
                  <span class="text-[9px] opacity-50 italic">No active risk vectors detected</span>
                </div>
              `}
            </div>
          `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px");

          d3.select(this)
            .transition().duration(200)
            .attr("stroke-width", 2)
            .attr("stroke", darkMode ? "#ffffff" : "#000000")
            .attr("fill-opacity", 0.8);
        })
        .on("mousemove", function(event) {
          d3.select("#map-tooltip")
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() {
          d3.select("#map-tooltip").transition().duration(300).style("opacity", 0);
          
          d3.select(this)
            .transition().duration(200)
            .attr("stroke-width", 0.5)
            .attr("stroke", darkMode ? "#111827" : "#ffffff")
            .attr("fill-opacity", 1);
        });
    });
  }, [data, darkMode]);

  return (
    <div className="space-y-8">
      <div id="map-tooltip" className="fixed opacity-0 pointer-events-none bg-white dark:bg-black/80 backdrop-blur-md border border-black/5 dark:border-white/10 p-2 rounded-lg shadow-xl text-[10px] z-50 dark:text-white" />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="serif text-3xl font-light dark:text-white">Geopolitical Risk Matrix</h3>
          <p className="text-xs uppercase tracking-widest opacity-40 mt-1 dark:text-white/40">Real-time regional sentiment analysis</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase font-bold opacity-60 dark:text-white">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] uppercase font-bold opacity-60 dark:text-white">High Risk</span>
          </div>
        </div>
      </div>

      <div className="relative glass rounded-[2.5rem] border border-black/5 dark:border-white/5 p-4 md:p-8 overflow-hidden premium-shadow group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 450" 
          className="w-full h-auto relative z-10"
        />
        
        <div className="hidden md:grid absolute bottom-8 left-8 right-8 grid-cols-3 gap-6 z-20">
          {data.slice(0, 3).map((risk, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-[2rem] border border-black/5 dark:border-white/10 premium-shadow hover-lift group/card cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg apple-icon-bg">
                    <Globe size={12} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider dark:text-white group-hover/card:text-emerald-500 transition-colors">{risk.countryCode}</span>
                </div>
                <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                   risk.riskScore > 70 ? 'border-red-500/20 bg-red-500/5 text-red-500' : 
                   risk.riskScore > 40 ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : 
                   'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
                 }`}>
                  {risk.riskScore}% Risk
                </div>
              </div>
              <p className="text-[11px] leading-relaxed opacity-60 dark:text-white/60 line-clamp-2 group-hover/card:opacity-100 transition-opacity">{risk.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Risk Cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {data.slice(0, 3).map((risk, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider dark:text-white">{risk.countryCode}</span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                 risk.riskScore > 70 ? 'bg-red-500/10 text-red-500' : 
                 risk.riskScore > 40 ? 'bg-amber-500/10 text-amber-500' : 
                 'bg-emerald-500/10 text-emerald-500'
               }`}>
                {risk.riskScore}% Risk
              </div>
            </div>
            <p className="text-[11px] leading-relaxed opacity-60 dark:text-white/60">{risk.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
