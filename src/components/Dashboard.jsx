import React from 'react';
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import { useGlobalState } from '../context/GlobalContext';

const Dashboard = () => {
  const state = useGlobalState();

  return (
    <div className="h-full p-4 flex flex-col gap-4 overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left: AI Chat + Quick Actions */}
        <section className="lg:col-span-3 flex flex-col min-h-0">
          <LeftPanel />
        </section>

        {/* Center: Live Diet Engine */}
        <section className="lg:col-span-6 flex flex-col min-h-0 overflow-y-auto">
          <CenterPanel state={state} isAnalyzing={state.isAnalyzing} />
        </section>

        {/* Right: AI Intelligence */}
        <section className="lg:col-span-3 flex flex-col min-h-0 overflow-y-auto">
          <RightPanel state={state} isAnalyzing={state.isAnalyzing} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
