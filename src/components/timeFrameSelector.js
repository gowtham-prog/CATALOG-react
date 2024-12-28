import React, { useState, useEffect } from 'react';

const TimeframeSelector = ({ selectedTimeframe, onTimeframeChange }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const timeframes = [
        { value: '1min', label: '1min' },
        { value: '1h', label: '1h' },
        { value: '1d', label: '1d' },
        { value: '1w', label: '1w' },
        { value: '1m', label: '1m' },
        { value: '1y', label: '1y' },
        { value: 'max', label: 'max' },
    ];

    return (
        <div>
            {isMobile ? (
                <select
                    className="w-full p-2 rounded-md border-b-[#5e54ef]"
                    value={selectedTimeframe}
                    onChange={(e) => onTimeframeChange(e.target.value)}
                >
                    {timeframes.map((timeframe) => (
                        <option key={timeframe.value} value={timeframe.value}>
                            {timeframe.label}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="flex items-center space-x-4">
                    {timeframes.map((timeframe) => (
                        <button
                            key={timeframe.value}
                            className={`px-4 py-2 rounded-md ${
                                selectedTimeframe === timeframe.value ? 'bg-[#4b40ee] text-white' : ''
                            }`}
                            onClick={() => onTimeframeChange(timeframe.value)}
                        >
                            {timeframe.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeframeSelector;
