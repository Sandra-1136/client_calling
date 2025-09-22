import React from 'react';
import { Play, Square, RotateCcw, Phone, Clock, Repeat, Target, Calendar } from 'lucide-react';

interface ControlPanelProps {
  isAutoCallActive: boolean;
  onStartAutoCalling: () => void;
  onStopAutoCalling: () => void;
  onResetSystem: () => void;
  hasEmployees: boolean;
  currentRound: number;
  currentEmployeeIndex: number;
  totalEmployees: number;
  onShowCalendar?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isAutoCallActive,
  onStartAutoCalling,
  onStopAutoCalling,
  onResetSystem,
  hasEmployees,
  currentRound,
  currentEmployeeIndex,
  totalEmployees,
  onShowCalendar,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <Phone className="w-6 h-6 text-indigo-600" />
        <span>Auto Call Controls</span>
      </h2>
      
      {/* Control buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {!isAutoCallActive ? (
          <button
            onClick={onStartAutoCalling}
            disabled={!hasEmployees}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Play className="w-6 h-6" />
            <span>Start Auto Call</span>
          </button>
        ) : (
          <button
            onClick={onStopAutoCalling}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-lg animate-pulse"
          >
            <Square className="w-6 h-6" />
            <span>Stop Auto Call</span>
          </button>
        )}
        
        <button
          onClick={onResetSystem}
          disabled={isAutoCallActive}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <RotateCcw className="w-6 h-6" />
          <span>Reset System</span>
        </button>
        
        {onShowCalendar && (
          <button
            onClick={onShowCalendar}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-6 h-6" />
            <span>View Calendar</span>
          </button>
        )}
      </div>

      {/* System status information */}
      <div className="space-y-4">
        {isAutoCallActive && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-900 font-bold text-lg">
                🔄 Auto Calling Active - Round {currentRound}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <Target className="w-5 h-5" />
                <span className="font-medium">
                  Current Client: {currentEmployeeIndex + 1} of {totalEmployees}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <span className="font-medium">⏱️ 10-Second Timeout Per Call</span>
              </div>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Repeat className="w-5 h-5 text-blue-700" />
                <span className="font-semibold text-blue-900">How Auto Calling Works:</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 📞 Calls only unanswered clients with 10-second timeout</li>
                <li>• 🔄 Automatically moves to next unanswered client</li>
                <li>• 🎯 Skips clients who have already answered</li>
                <li>• ✅ Stops automatically when all clients are reached</li>
              </ul>
            </div>
          </div>
        )}

        {!isAutoCallActive && hasEmployees && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Play className="w-6 h-6 text-green-600" />
              <span className="text-green-900 font-bold text-lg">Ready to Start Auto Calling</span>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>⚡ 10-second timeout per call</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>🎯 Sequential calling through all clients</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Repeat className="w-4 h-4" />
                    <span>🔄 Continuous loop until stopped</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>📱 Manual calls still available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!hasEmployees && (
          <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
            <span className="text-gray-700">No clients available. Please add clients to start calling.</span>
          </div>
        )}
      </div>
    </div>
  );
};