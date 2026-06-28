function renderSvgLineChart(containerId, options) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const {
    data,
    goalValue,
    unit = "",
    lineColor = "#22c55e",
    goalColor = "#8b9cb0",
    emptyMessage = "기록을 2회 이상 입력하면 그래프가 표시됩니다.",
  } = options;

  if (!data || data.length < 2) {
    el.innerHTML = `<p class="empty-state chart-empty">${emptyMessage}</p>`;
    return;
  }

  const W = 480;
  const H = 220;
  const pad = { top: 24, right: 24, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  let minY = Math.min(...values);
  let maxY = Math.max(...values);
  if (goalValue != null && !Number.isNaN(goalValue)) {
    minY = Math.min(minY, goalValue);
    maxY = Math.max(maxY, goalValue);
  }
  const range = maxY - minY || 1;
  minY -= range * 0.08;
  maxY += range * 0.08;

  const toX = (i) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v) => pad.top + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");

  let goalLineSvg = "";
  if (goalValue != null && !Number.isNaN(goalValue)) {
    const gy = toY(goalValue);
    goalLineSvg = `
      <line x1="${pad.left}" y1="${gy}" x2="${W - pad.right}" y2="${gy}"
        stroke="${goalColor}" stroke-width="1.5" stroke-dasharray="6 4" />
      <text x="${W - pad.right}" y="${gy - 6}" text-anchor="end" class="chart-goal-label">목표 ${goalValue}${unit}</text>`;
  }

  const yTicks = 4;
  let gridSvg = "";
  for (let i = 0; i <= yTicks; i++) {
    const v = minY + ((maxY - minY) * i) / yTicks;
    const y = toY(v);
    gridSvg += `
      <line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="#243040" stroke-width="1" />
      <text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" class="chart-axis-label">${v.toFixed(1)}</text>`;
  }

  const xLabelIndices =
    data.length <= 5 ? data.map((_, i) => i) : [0, Math.floor(data.length / 2), data.length - 1];

  let xLabelsSvg = "";
  xLabelIndices.forEach((i) => {
    const label = data[i].label;
    xLabelsSvg += `<text x="${toX(i)}" y="${H - 8}" text-anchor="middle" class="chart-axis-label">${label}</text>`;
  });

  const dots = data
    .map(
      (d, i) =>
        `<circle cx="${toX(i)}" cy="${toY(d.value)}" r="4" fill="${lineColor}" stroke="#111921" stroke-width="2">
          <title>${d.label}: ${d.value}${unit}</title>
        </circle>`
    )
    .join("");

  el.innerHTML = `
    <svg class="svg-line-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      ${gridSvg}
      ${goalLineSvg}
      <polyline points="${points}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      ${dots}
      ${xLabelsSvg}
    </svg>
    <div class="chart-legend">
      <span><i class="legend-line solid" style="background:${lineColor}"></i> 실제 ${unit ? `(${unit})` : ""}</span>
      ${goalValue != null ? `<span><i class="legend-line dashed"></i> 목표</span>` : ""}
    </div>`;
}
