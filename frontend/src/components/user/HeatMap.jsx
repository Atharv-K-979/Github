// import React, { useMemo } from "react";
// import HeatMap from "@uiw/react-heat-map";

// const GITHUB_DARK_COLORS = {
//   0: "#161b22",
//   1: "#0e4429",
//   2: "#006d32",
//   3: "#26a641",
//   4: "#39d353",
// };

// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// const mapCountsToLevels = (data) => {
//   if (!Array.isArray(data) || data.length === 0) {
//     const today = new Date();
//     const fmt = (d) => {
//       const y = d.getFullYear();
//       const m = String(d.getMonth() + 1).padStart(2, "0");
//       const day = String(d.getDate()).padStart(2, "0");
//       return `${y}-${m}-${day}`;
//     };
//     const d1 = new Date(today);
//     const d2 = new Date(today);
//     const d3 = new Date(today);
//     const d4 = new Date(today);
//     d1.setDate(today.getDate() - 1);
//     d2.setDate(today.getDate() - 2);
//     d3.setDate(today.getDate() - 3);
//     d4.setDate(today.getDate() - 4);
//     return [
//       { date: fmt(d1), count: 5 },
//       { date: fmt(d2), count: 3 },
//       { date: fmt(d3), count: 2 },
//       { date: fmt(d4), count: 4 },
//     ];
//   }
//   const counts = data.map((d) => d.count || 0);
//   const maxCount = Math.max(...counts, 0);
//   if (maxCount === 0) {
//     return data.map((item) => ({
//       date: item.date,
//       count: 0,
//     }));
//   }
//   return data.map((item) => {
//     const value = item.count || 0;
//     if (value <= 0) {
//       return { date: item.date, count: 0 };
//     }
//     const ratio = value / maxCount;
//     let level = 1;
//     if (ratio <= 0.25) {
//       level = 1;
//     } else if (ratio <= 0.5) {
//       level = 2;
//     } else if (ratio <= 0.75) {
//       level = 3;
//     } else {
//       level = 4;
//     }
//     return { date: item.date, count: level };
//   });
// };

// const extractMonthLabels = (data) => {
//   if (!Array.isArray(data) || data.length === 0) {
//     return [];
//   }
//   const months = new Set();
//   data.forEach((item) => {
//     const date = new Date(item.date);
//     if (!Number.isNaN(date.getTime())) {
//       months.add(date.getMonth());
//     }
//   });
//   return Array.from(months)
//     .sort((a, b) => a - b)
//     .map((m) => monthNames[m]);
// };

// const HeatMapProfile = ({ data }) => {
//   const normalizedData = Array.isArray(data) ? data : [];
//   const heatmapData = useMemo(() => mapCountsToLevels(normalizedData), [normalizedData]);
//   const monthLabels = useMemo(() => extractMonthLabels(normalizedData), [normalizedData]);

//   const today = new Date();
//   const startDate = new Date(today);
//   startDate.setFullYear(today.getFullYear() - 1);

//   return (
//     <div className="gh-heatmap-container">
//       <div className="gh-heatmap-header">
//         <div className="gh-heatmap-months">
//           {monthLabels.map((label) => (
//             <span key={label} className="gh-heatmap-month-label">
//               {label}
//             </span>
//           ))}
//         </div>
//       </div>
//       <div className="gh-heatmap-body">
//         <div className="gh-heatmap-weekdays">
//           <span>Sun</span>
//           <span>Mon</span>
//           <span>Wed</span>
//           <span>Fri</span>
//         </div>
//         <div className="gh-heatmap-grid">
//           <HeatMap
//             className="HeatMapProfile"
//             value={heatmapData}
//             startDate={startDate}
//             rectSize={15}
//             space={3}
//             rectProps={{
//               rx: 3,
//               ry: 3,
//             }}
//             panelColors={GITHUB_DARK_COLORS}
//           />
//         </div>
//       </div>
//       <div className="gh-heatmap-legend">
//         <span className="gh-heatmap-legend-label">Less</span>
//         <div className="gh-heatmap-legend-squares">
//           {[0, 1, 2, 3, 4].map((level) => (
//             <span
//               key={level}
//               className="gh-heatmap-legend-square"
//               style={{ backgroundColor: GITHUB_DARK_COLORS[level] }}
//             />
//           ))}
//         </div>
//         <span className="gh-heatmap-legend-label">More</span>
//       </div>
//     </div>
//   );
// };

// export default HeatMapProfile;


import React, { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";
import Tooltip from "@uiw/react-tooltip"; // Add this for real GitHub feel

const GITHUB_DARK_COLORS = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

const HeatMapProfile = ({ data }) => {
  // Ensure we show the last 12 months starting from today
  const until = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  // Normalize data and ensure colors are mapped correctly
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) {
        // Sample data to see it working immediately
        return [
            { date: '2025/01/10', count: 2 },
            { date: '2025/01/12', count: 4 },
            { date: '2025/01/13', count: 10 },
        ];
    }
    return data;
  }, [data]);

  return (
    <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
      <h3 className="text-gray-300 text-sm mb-4">Contributions</h3>
      
      <div className="flex flex-col items-center overflow-hidden">
        <HeatMap
          value={heatmapData}
          width="100%"
          startDate={startDate}
          endDate={until}
          rectSize={12} // Smaller squares like GitHub
          space={3}
          rectProps={{
            rx: 2, // Slightly rounded corners
            ry: 2,
          }}
          panelColors={GITHUB_DARK_COLORS}
          // Remove custom headers and use built-in labels for alignment
          weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
          monthLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
          legendRender={(props) => <rect {...props} y={props.y + 10} rx={2} />}
          rectRender={(props, data) => {
            return (
              <Tooltip placement="top" content={`count: ${data.count || 0} on ${data.date}`}>
                <rect {...props} />
              </Tooltip>
            );
          }}
        />
        
        {/* Custom Legend to match GitHub Bottom Right position */}
        <div className="flex justify-end items-center w-full mt-2 text-[10px] text-gray-400 gap-1">
          <span>Less</span>
          {Object.values(GITHUB_DARK_COLORS).map((color) => (
            <div key={color} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: color }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapProfile;