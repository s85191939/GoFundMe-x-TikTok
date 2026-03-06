'use client';

import { useRef, useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function TabGroup({ tabs, activeTab, onChange }: TabGroupProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl) {
      const parent = activeEl.parentElement;
      if (parent) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="relative border-b border-gray-200">
      <div className="flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) {
                tabRefs.current.set(tab.id, el);
              }
            }}
            onClick={() => onChange(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sliding underline indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-[#00b964] transition-all duration-300 ease-in-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}
