import React, { useState } from 'react';
import { motion } from 'framer-motion';
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}
interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}
export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);
  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
                relative py-4 px-1 text-sm font-medium transition-colors duration-200
                ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}
              `}>

              {tab.label}
              {activeTab === tab.id &&
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />

            }
            </button>
          )}
        </nav>
      </div>
      <div className="mt-6">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>);

}