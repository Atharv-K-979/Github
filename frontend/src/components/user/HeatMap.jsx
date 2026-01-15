import React, { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

const GITHUB_DARK_COLORS = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const mapCountsToLevels = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  const counts = data.map((d) => d.count || 0);
  const maxCount = Math.max(...counts, 0);
  if (maxCount === 0) {
    return data.map((item) => ({
      date: item.date,
      count: 0,
    }));
  }
  return data.map((item) => {
    const value = item.count || 0;
    if (value <= 0) {
      return { date: item.date, count: 0 };
    }
    const ratio = value / maxCount;
    let level = 1;
    if (ratio <= 0.25) {
      level = 1;
    } else if (ratio <= 0.5) {
      level = 2;
    } else if (ratio <= 0.75) {
      level = 3;
    } else {
      level = 4;
    }
    return { date: item.date, count: level };
  });
};

const extractMonthLabels = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  const months = new Set();
  data.forEach((item) => {
    const date = new Date(item.date);
    if (!Number.isNaN(date.getTime())) {
      months.add(date.getMonth());
    }
  });
  return Array.from(months)
    .sort((a, b) => a - b)
    .map((m) => monthNames[m]);
};

const HeatMapProfile = ({ data }) => {
  const normalizedData = Array.isArray(data) ? data : [];
  const heatmapData = useMemo(() => mapCountsToLevels(normalizedData), [normalizedData]);
  const monthLabels = useMemo(() => extractMonthLabels(normalizedData), [normalizedData]);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 1);

  return (
    <div className="gh-heatmap-container">
      <div className="gh-heatmap-header">
        <div className="gh-heatmap-months">
          {monthLabels.map((label) => (
            <span key={label} className="gh-heatmap-month-label">
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="gh-heatmap-body">
        <div className="gh-heatmap-weekdays">
          <span>Sun</span>
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className="gh-heatmap-grid">
          <HeatMap
            className="HeatMapProfile"
            value={heatmapData}
            startDate={startDate}
            rectSize={12}
            space={2}
            rectProps={{
              rx: 2,
              ry: 2,
            }}
            panelColors={GITHUB_DARK_COLORS}
          />
        </div>
      </div>
      <div className="gh-heatmap-legend">
        <span className="gh-heatmap-legend-label">Less</span>
        <div className="gh-heatmap-legend-squares">
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="gh-heatmap-legend-square"
              style={{ backgroundColor: GITHUB_DARK_COLORS[level] }}
            />
          ))}
        </div>
        <span className="gh-heatmap-legend-label">More</span>
      </div>
    </div>
  );
};

export default HeatMapProfile;
