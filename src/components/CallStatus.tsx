import React from 'react';
import { Users, CheckCircle, XCircle, Clock, RotateCcw, Phone, Calendar, AlertTriangle, Filter } from 'lucide-react';
import { CallSystemStats } from '../types/Employee';

interface CallStatusProps {
  stats: CallSystemStats;
  isAutoCallActive: boolean;
  currentEmployeeIndex: number;
  totalEmployees: number;
  onFilterCompleted?: () => void;
  onFilterAnswered?: () => void;
  onFilterMissed?: () => void;
  onFilterPending?: () => void;
  onFilterUrgent?: () => void;
  onShowMonthlyAppointments?: () => void;
  onShowCurrentClient?: () => void;
  onShowRoundInfo?: () => void;
  onShowTotalDetails?: () => void;
  employees?: any[];
}

export const CallStatus: React.FC<CallStatusProps> = ({ 
  stats, 
  isAutoCallActive, 
  currentEmployeeIndex,
  totalEmployees,
  onFilterCompleted,
  onFilterAnswered,
  onFilterMissed,
  onFilterPending,
  onFilterUrgent,
  onShowMonthlyAppointments,
  onShowCurrentClient,
  onShowRoundInfo,
  onShowTotalDetails,
  employees = []
}) => {
  const completionPercentage = stats.totalEmployees > 0 
    ? Math.round((stats.answered / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
        <Users className="w-7 h-7 text-indigo-600" />
        <span>Client Call Dashboard</span>
      </h2>
      
      {/* Real-time stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4 mb-6">
        <button 
          onClick={() => {
            try {
              if (onShowTotalDetails) {
                onShowTotalDetails();
              }
            } catch (error) {
              console.error('Error showing total details:', error);
            }
          }}
          className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center border-2 border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view total contacts details"
        >
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</div>
          <div className="text-sm text-gray-600">Total</div>
        </button>

        <button 
          onClick={() => {
            try {
              onFilterAnswered && onFilterAnswered();
            } catch (error) {
              console.error('Error filtering answered contacts:', error);
            }
          }}
          className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center border-2 border-green-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view answered contacts"
        >
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-800">{stats.answered}</div>
          <div className="text-sm text-green-600">Answered</div>
        </button>

        <button 
          onClick={() => {
            try {
              onFilterMissed && onFilterMissed();
            } catch (error) {
              console.error('Error filtering missed contacts:', error);
            }
          }}
          className="bg-red-50 hover:bg-red-100 rounded-lg p-4 text-center border-2 border-red-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view missed contacts"
        >
          <div className="flex items-center justify-center mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-800">{stats.missed}</div>
          <div className="text-sm text-red-600">Missed</div>
        </button>

        <button 
          onClick={() => {
            try {
              onFilterPending && onFilterPending();
            } catch (error) {
              console.error('Error filtering pending contacts:', error);
            }
          }}
          className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center border-2 border-blue-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view unanswered contacts"
        >
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">{stats.pending}</div>
          <div className="text-sm text-blue-600">Unanswered</div>
        </button>

        <button 
          onClick={() => {
            try {
              if (onShowRoundInfo) {
                onShowRoundInfo();
              }
            } catch (error) {
              console.error('Error showing round info:', error);
            }
          }}
          className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center border-2 border-purple-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view round information"
        >
          <div className="flex items-center justify-center mb-2">
            <RotateCcw className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-800">{stats.currentRound}</div>
          <div className="text-sm text-purple-600">Round</div>
        </button>

        <button 
          onClick={() => {
            try {
              if (onShowCurrentClient) {
                onShowCurrentClient();
              }
            } catch (error) {
              console.error('Error showing current client:', error);
            }
          }}
          className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 text-center border-2 border-yellow-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view current client info"
        >
          <div className="flex items-center justify-center mb-2">
            <Phone className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-800">
            {isAutoCallActive ? currentEmployeeIndex + 1 : '-'}
          </div>
          <div className="text-sm text-yellow-600">Current</div>
        </button>

        <button 
          onClick={() => {
            try {
              if (onShowMonthlyAppointments) {
                onShowMonthlyAppointments();
              }
            } catch (error) {
              console.error('Error showing monthly appointments:', error);
            }
          }}
          className="bg-orange-50 hover:bg-orange-100 rounded-lg p-4 text-center border-2 border-orange-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view monthly appointments"
        >
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-800">{stats.monthlyAppointments}</div>
          <div className="text-sm text-orange-600">This Month</div>
        </button>

        <div className="bg-teal-50 rounded-lg p-4 text-center border-2 border-teal-200">
          <button
            onClick={() => {
              try {
                onFilterCompleted && onFilterCompleted();
              } catch (error) {
                console.error('Error filtering completed contacts:', error);
              }
            }}
            className="w-full flex items-center justify-center mb-2 hover:bg-teal-100 transition-colors rounded-lg p-1 cursor-pointer"
            title="Click to view completed work contacts"
          >
            <CheckCircle className="w-6 h-6 text-teal-600" />
            <div className="ml-2">
              <div className="text-2xl font-bold text-teal-800">{stats.completedWork}</div>
              <div className="text-sm text-teal-600">Completed</div>
            </div>
          </button>
        </div>

        <button 
          onClick={() => {
            try {
              onFilterUrgent && onFilterUrgent();
            } catch (error) {
              console.error('Error filtering urgent contacts:', error);
            }
          }}
          className="bg-red-50 hover:bg-red-100 rounded-lg p-4 text-center border-2 border-red-200 transition-all duration-200 hover:shadow-md cursor-pointer"
          title="Click to view urgent contacts"
        >
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-800">{stats.urgentClients}</div>
          <div className="text-sm text-red-600">Urgent</div>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-100 rounded-lg p-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Calling</span>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 rounded-lg p-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2 bg-red-100 rounded-lg p-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
};