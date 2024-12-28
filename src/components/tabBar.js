import React, { useState } from "react";

const TabBar = () => {
  const [activeTab, setActiveTab] = useState("Chart");

  const tabs = ["Summary", "Chart", "Statistics", "Analysis", "Settings"];

  return (
    <div className="relative border-b border-gray-200">

        <div className="flex w-full overflow-x-auto justify-between">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`flex-1 text-center py-4 mx-4 text-sm font-medium cursor-pointer 
            ${activeTab === tab ? "text-gray-900 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-[2px] bg-indigo-500 transition-all duration-300"
          style={{
            width: `${100 / tabs.length}%`,
            left: `${tabs.indexOf(activeTab) * (100 / tabs.length)}%`,
          }}
        />
     
    </div>
  );
};

export default TabBar;
