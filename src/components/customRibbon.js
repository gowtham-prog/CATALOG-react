import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const customRibbonPlugin = {
  id: "custom-ribbon",
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0); // Get the first dataset (line plot)
    const lastPoint = meta.data[meta.data.length - 1]; // Last data point position

    if (lastPoint) {
      const { x, y } = lastPoint.tooltipPosition();
      const ribbonWidth = 80;
      const ribbonHeight = 30;

      // Draw the purple ribbon
      ctx.fillStyle = "#5e54ef"; // Purple color
      ctx.fillRect(x - ribbonWidth / 2, y - ribbonHeight - 10, ribbonWidth, ribbonHeight);

      // Draw the price text
      ctx.font = "600 16px sans-serif";
      ctx.fillStyle = "#FFFFFF"; // White color
      ctx.textAlign = "center";
      ctx.justify = "center";
      ctx.padding = 10;
      const price = chart.data.datasets[0].data.slice(-1)[0]; // Get the last price
      ctx.fillText(`$${price.toFixed(2)}`, x, y - ribbonHeight / 2 - 5);
    }
  },
};

export default customRibbonPlugin;