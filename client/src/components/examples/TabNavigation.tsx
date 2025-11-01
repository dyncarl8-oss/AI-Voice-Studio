import { useState } from 'react';
import TabNavigation from '../TabNavigation';

export default function TabNavigationExample() {
  const [activeTab, setActiveTab] = useState<"record" | "models" | "generate">("record");

  return (
    <TabNavigation 
      activeTab={activeTab}
      onTabChange={(tab) => {
        console.log('Tab changed to:', tab);
        setActiveTab(tab);
      }}
    />
  );
}
