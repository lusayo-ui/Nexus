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
}

export const GeopoliticalMap: React.FC<GeopoliticalMapProps> = ({ data, darkMode }) => {
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
        .on("mouseover", function(event, d: any) {
          const risk = riskMap.get(d.id);
          d3.select(this)
            .attr("stroke-width", 1.5)
            .attr("stroke", darkMode ? "#ffffff" : "#000000");
          
          if (risk) {
            // Simple tooltip logic could go here
          }
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke-width", 0.5)
            .attr("stroke", darkMode ? "#111827" : "#ffffff");
        });
    });
  }, [data, darkMode]);

  return (
    <div className="space-y-8">
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

      <div className="relative bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 p-8 overflow-hidden shadow-inner">
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 450" 
          className="w-full h-auto"
        />
        
        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.slice(0, 3).map((risk, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/5"
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
              <p className="text-[11px] leading-relaxed opacity-60 dark:text-white/60 line-clamp-2">{risk.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
