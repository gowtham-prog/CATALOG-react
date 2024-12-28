import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import React, { useEffect, useState, useRef } from 'react';
import { STOCK_API_KEY } from './config';
import { Chart } from 'react-chartjs-2';
import TabBar from './components/tabBar';
import TimeframeSelector from './components/timeFrameSelector';
import FullScreenIcon from "./assets/expand.svg";
import compareIcon from "./assets/Compare.svg";
// Register Chart.js components
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const CombinedChart = () => {
  const [chartData, setChartData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1w');
  const [latestPrice, setLatestPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const chartRef = useRef(null); // Create a ref to access the chart instance
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // State to store mouse position

  // Handle the mousemove event and update the mouse position
  useEffect(() => {
    const chartCanvas = chartRef.current?.chartInstance?.canvas; // Access canvas element
    if (chartCanvas) {
      const handleMouseMove = (event) => {
        const rect = chartCanvas.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      };

      chartCanvas.addEventListener('mousemove', handleMouseMove);

      // Cleanup on unmount
      return () => {
        chartCanvas.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);


  const timeframeToUrl = {
    '1min': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1min&apikey=${STOCK_API_KEY}`,
    '1h': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1h&apikey=${STOCK_API_KEY}`,
    '1d': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&apikey=${STOCK_API_KEY}`,
    '1w': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1week&apikey=${STOCK_API_KEY}`,
    '1m': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1month&apikey=${STOCK_API_KEY}`,
    '1y': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=30min&apikey=${STOCK_API_KEY}`,
    'max': `https://api.twelvedata.com/time_series?symbol=AAPL&interval=45min&apikey=${STOCK_API_KEY}`,
  };

  
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    setDataFetched(false);
    console.log("selected timeframe", timeframe);
  };



  const fetchData = async () => {
    if (!timeframeToUrl[selectedTimeframe]) {
      console.error("Invalid timeframe selected");
      return;
    }
  
    try {
      const response = await fetch(timeframeToUrl[selectedTimeframe]);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data.status !== "ok") {
        throw new Error("API response status is not OK");
      }
  
      console.log(data);
      setDataFetched(true);
      setRawData(data.values); // Directly use the "values" array from the response
      console.log("Found data", data.values);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(() => {
    if (!dataFetched) {
      fetchData();
    }
  }, [selectedTimeframe]);
  
  useEffect(() => {
    if (rawData) {
      const { timestamps, prices, volumes } = parseData(rawData);
      setChartData({
        labels: timestamps,
        datasets: [
          {
            type: 'line',
            label: 'Price (USD)',
            data: prices,
            borderColor: '#5e54ef',
            backgroundColor: '#e9e8ff',
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            yAxisID: 'y1',
          },
          {
            type: 'bar',
            label: 'Volume',
            data: volumes,
            backgroundColor: '#e7e9ec',
            fill: true,
            borderColor: '#e7e9ec',
            borderWidth: 0,
            yAxisID: 'y2',
          },
        ],
      });
      const latest = prices[prices.length - 1];
      const previous = prices[prices.length - 2]; // Second-to-last value for change calculation
      const change = latest - previous;
      const percentChange = (change / previous) * 100;

      setLatestPrice(latest.toFixed(2));
      setPriceChange(change.toFixed(2));
      setPercentageChange(percentChange.toFixed(2));
    }
  }, [rawData]);
  
  const parseData = (data) => {
    const timestamps = data.map((entry) => entry.datetime).reverse(); // Reverse for chronological order
    const prices = data.map((entry) => parseFloat(entry.close)).reverse();
    const volumes = data.map((entry) => parseInt(entry.volume, 10)).reverse();
  
    return { timestamps, prices, volumes };
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio:true,
    axis : 'xy',
    mode : 'interpolate',
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    scales: {
      x: {
        grid: { display: true, color: '#e5e7eb' },
        ticks: { autoSkip: false, maxTicksLimit: 10, display: false },
      },
      y1: {
        type: 'linear',
        position: 'left',
        grid: { display: false, color: '#e5e7eb' },
        beginAtZero: false,
        ticks: { display: false },
      },
      y2: {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        beginAtZero: true,
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          xLine: {
            type: 'line',
            borderColor: '#5e54ef',
            borderWidth: 1,
            borderDash: [5, 5],
            scaleID: 'x',
            value: null, // Dynamically set this value
          },
          yLine: {
            type: 'line',
            borderColor: '#5e54ef',
            borderWidth: 1,
            borderDash: [5, 5],
            scaleID: 'y1',
            value: null, // Dynamically set this value
          },
        },
      }, // Hide legend
      tooltip: {
        usePointStyle: true,
        enabled: false,
        position: 'nearest',
        xAlign: 'left',
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        callbacks: {
          label: (tooltipItem) => {
            // Only display the price value
            const value = tooltipItem.raw;
            return `$${value.toFixed(2)}`;
          },
        },
        external: (context) => {
          const { chart, tooltip } = context;
  
          if (!tooltip || tooltip.opacity === 0) return;
  
          const ctx = chart.ctx;
          const x = tooltip.caretX;
          const y = tooltip.caretY;
  
          ctx.save();
          ctx.setLineDash([5, 5]); // Dashed line style
          ctx.strokeStyle = '#5e54ef';
          ctx.lineWidth = 1;
  
          // Draw horizontal line
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, y);
          ctx.lineTo(chart.chartArea.right, y);
          ctx.stroke();
  
          // Draw vertical line
          ctx.beginPath();
          ctx.moveTo(x, chart.chartArea.top);
          ctx.lineTo(x, chart.chartArea.bottom);
          ctx.stroke();
  
          ctx.restore();
          let tooltipEl = document.getElementById('custom-tooltip');

          // Create tooltip element if not found
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'custom-tooltip';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.background = 'rgba(20, 24, 31, 0.9)';
            tooltipEl.style.color = 'white';
            tooltipEl.style.padding = '10px';
            tooltipEl.style.borderRadius = '8px';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.transition = 'opacity 0.5s ease';
            document.body.appendChild(tooltipEl);
          }

          // Hide tooltip if not active
          if (!tooltip || tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          // Set tooltip content
          if (tooltip.body) {
            const price = tooltip.body[0].lines[0];
            tooltipEl.innerHTML = `<div style="font-size:16px;font-weight:semibold;">${price}</div>`;
          }

          // Position the tooltip
          const position = chart.canvas.getBoundingClientRect();
          tooltipEl.style.opacity = 1;
          tooltipEl.style.left = position.right +'px';
          tooltipEl.style.top = position.top + tooltip.caretY + 'px';
  
        },
      },
    },

  };
  

  if (!chartData || !dataFetched) return (
    <div className="flex w-screen h-screen backdrop-blur-md items-center justify-center" role="status">
      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-[#5e54ef]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col font-inter items-center w-full max-h-full bg-[#ffffff] p-2 md:p-4">
      <div className='flex flex-col relative items-center justify-between w-full max-w-7xl mb-4'>

        <div className='flex flex-row w-full items-start justify-start mb-4 '>
          <div className='font-noto-kr font-semibold text-5xl text-black '>{latestPrice || 'Loading...'}</div>
          <div className=' flex w-full h-min items-start justify-start'>
            <div className='font-noto-kr font-semibold text-lg text-gray-300 '>USD</div>
          </div>
        </div>
        <div className='flex flex-row w-full text-[#67bf6b] items-center justify-between'>{`+${priceChange} (${percentageChange}%)`}</div>
        <div className='flex items-center justify-start w-full md:m-4'>
          <TabBar />
        </div>

        <div className={`bg-white p-6 w-full mb-8`}>
          <div className='flex flex-row items-center justify-between w-full mb-4'>
            <div className='flex flex-row items-center justify-between w-fit'>
              <div className='flex flex-row items-center justify-between w-full cursor-pointer p-2 hover:bg-gray-100 hover:rounded-md'>
                <img src={FullScreenIcon} alt="FullScreen Icon" className="w-4 h-4 mr-1" />
                <div className='text-md text-gray-500 mr-4 '> FullScreen</div>
              </div>
              <div className='flex flex-row items-center justify-between w-full cursor-pointer p-2 hover:bg-gray-100 hover:rounded-md'>
                <img src={compareIcon} alt="FullScreen Icon" className="w-4 h-4 mr-1" />
                <div className=' text-md text-gray-500 mr-4'> Compare</div>
              </div>
            </div>

            <div className="flex items-center justify-end w-2/3 mb-4">
              <TimeframeSelector selectedTimeframe={selectedTimeframe} onTimeframeChange={handleTimeframeChange} />
            </div>
          </div>
          <Chart ref={chartRef} type="bar" data={chartData} options={options} />
        </div>

      </div>
    </div>
  );
};

export default CombinedChart;