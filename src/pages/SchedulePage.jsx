import React from 'react';
import SchedulePanel from '../components/SchedulePanel';

const SchedulePage = () => {
  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <SchedulePanel />
      </div>
    </div>
  );
};

export default SchedulePage;
