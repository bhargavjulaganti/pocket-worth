"use client";
import React, { useState, ReactNode } from 'react';

interface TabPanelProps {
  tabs: {
    label: string;
    content: ReactNode;
  }[];
  defaultTabIndex?: number;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ 
  tabs, 
  defaultTabIndex = 0,
  className = "" 
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(defaultTabIndex);

  // Validate default tab index is within range
  React.useEffect(() => {
    if (defaultTabIndex >= 0 && defaultTabIndex < tabs.length) {
      setActiveTabIndex(defaultTabIndex);
    } else {
      setActiveTabIndex(0);
    }
  }, [defaultTabIndex, tabs.length]);

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index);
  };

  return (
    <div className={`bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-gray-700 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={`tab-${index}`}
            onClick={() => handleTabClick(index)}
            className={`py-3 px-6 font-semibold text-sm rounded-t-lg transition-all duration-200 mr-2 -mb-px
              ${activeTabIndex === index
                ? 'bg-gray-800 border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            aria-selected={activeTabIndex === index}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {tabs.map((tab, index) => (
          <div
            key={`tabpanel-${index}`}
            className={`${activeTabIndex === index ? 'block' : 'hidden'}`}
            role="tabpanel"
            aria-hidden={activeTabIndex !== index}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabPanel;