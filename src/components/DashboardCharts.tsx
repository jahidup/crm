'use client';

import React from 'react';

export function DashboardCharts({
  funnelData,
  growthData,
}: {
  funnelData: { stage: string; count: number; percentage: number }[];
  growthData: { month: string; leads: number; won: number }[];
}) {
  // SVG drawing dimensions
  const growthHeight = 160;
  const growthWidth = 500;
  const growthMaxVal = Math.max(...growthData.map(d => Math.max(d.leads, d.won * 2)), 10);
  
  // Create path points for growth line (leads)
  const leadPoints = growthData.map((d, index) => {
    const x = (index / (growthData.length - 1)) * (growthWidth - 40) + 20;
    const y = growthHeight - ((d.leads / growthMaxVal) * (growthHeight - 40) + 20);
    return `${x},${y}`;
  }).join(' ');

  // Create path points for won line
  const wonPoints = growthData.map((d, index) => {
    const x = (index / (growthData.length - 1)) * (growthWidth - 40) + 20;
    const y = growthHeight - (((d.won * 2) / growthMaxVal) * (growthHeight - 40) + 20);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Growth Chart (SVG Line Chart) */}
      <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Growth</h3>
            <p className="text-xs text-zinc-500">Leads captured vs won contracts</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-semibold">
            <span className="flex items-center gap-1.5 text-blue-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Leads Created
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Won Deals
            </span>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${growthWidth} ${growthHeight}`} className="w-full h-auto overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = (growthHeight - 40) * p + 20;
              return (
                <line
                  key={i}
                  x1="20"
                  y1={y}
                  x2={growthWidth - 20}
                  y2={y}
                  stroke="#1E1E1E"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area gradients */}
            <defs>
              <linearGradient id="blue-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="green-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Areas under lines */}
            {leadPoints && (
              <path
                d={`M 20,${growthHeight - 20} L ${leadPoints} L ${growthWidth - 20},${growthHeight - 20} Z`}
                fill="url(#blue-glow)"
              />
            )}
            {wonPoints && (
              <path
                d={`M 20,${growthHeight - 20} L ${wonPoints} L ${growthWidth - 20},${growthHeight - 20} Z`}
                fill="url(#green-glow)"
              />
            )}

            {/* Connection Lines */}
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={leadPoints}
              className="transition-all duration-300"
            />
            <polyline
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={wonPoints}
              className="transition-all duration-300"
            />

            {/* Interactive Data Points */}
            {growthData.map((d, index) => {
              const x = (index / (growthData.length - 1)) * (growthWidth - 40) + 20;
              const ly = growthHeight - ((d.leads / growthMaxVal) * (growthHeight - 40) + 20);
              const wy = growthHeight - (((d.won * 2) / growthMaxVal) * (growthHeight - 40) + 20);

              return (
                <g key={index} className="group cursor-pointer">
                  {/* Lead Node */}
                  <circle
                    cx={x}
                    cy={ly}
                    r="4"
                    fill="#3B82F6"
                    stroke="#0A0A0A"
                    strokeWidth="1.5"
                    className="hover:scale-150 transition-transform duration-200"
                  />
                  {/* Won Node */}
                  <circle
                    cx={x}
                    cy={wy}
                    r="4"
                    fill="#22C55E"
                    stroke="#0A0A0A"
                    strokeWidth="1.5"
                    className="hover:scale-150 transition-transform duration-200"
                  />
                  {/* X axis labels */}
                  <text
                    x={x}
                    y={growthHeight - 2}
                    textAnchor="middle"
                    fill="#52525B"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Lead Funnel Chart (Premium glass bars) */}
      <div className="glass-panel p-6 rounded-xl border border-zinc-900 bg-zinc-950/20 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Lead Funnel</h3>
          <p className="text-xs text-zinc-500">Pipeline conversion efficiency</p>
        </div>

        <div className="space-y-4 my-auto pt-4">
          {funnelData.map((stage, idx) => {
            // Colors matching layout: New=blue, Contacted/Interested=green/cyan, Proposal=yellow, Won=emerald
            const colors = [
              'bg-blue-500/20 border-blue-500/30 text-blue-400',
              'bg-sky-500/20 border-sky-500/30 text-sky-400',
              'bg-amber-500/20 border-amber-500/30 text-amber-400',
              'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
            ];

            const barColors = [
              'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
              'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.2)]',
              'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
              'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
            ];

            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[10px]">{stage.count} Leads</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${colors[idx % colors.length]}`}>
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-900/50">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColors[idx % barColors.length]}`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
