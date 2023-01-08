import { useState } from 'react';
import { Tab } from '@headlessui/react';

export default function Tabs({ tabs }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <Tab.List className="grid grid-cols-2 mb-16">
        {tabs.map((tab) => (
          <Tab className="hover:text-gray-400 outline-none transition-colors" key={tab.name}>
            <div
              className={`${
                tabs[selectedIndex].name == tab.name ? ' border-blue-500 text-blue-500' : ''
              } border-t-2 py-4 flex font-semibold items-center gap-2 justify-center`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </div>
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((tab) => (
          <Tab.Panel key={tab.name}>{tab.content}</Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
