import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import type { Step } from '../types';

interface StepsListProps {
  steps: Step[];
}

const StepsList: React.FC<StepsListProps> = ({ steps }) => {
  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200">Build Steps</h2>
      </div>
      <div className="p-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start gap-3 mb-4 p-3 rounded-lg hover:bg-gray-700"
          >
            {getStatusIcon(step.status)}
            <div>
              <h3 className="font-medium text-gray-200">{step.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsList;