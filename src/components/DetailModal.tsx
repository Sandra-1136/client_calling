import React from 'react';
import { X, Users, CheckCircle, XCircle, Clock, RotateCcw, Phone, Calendar, AlertTriangle, Star } from 'lucide-react';
import { Employee } from '../types/Employee';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'total' | 'answered' | 'missed' | 'pending' | 'round' | 'current' | 'monthly' | 'completed' | 'urgent';
  employees: Employee[];
  stats: any;
  currentEmployeeIndex?: number;
  isAutoCallActive?: boolean;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  employees,
  stats,
  currentEmployeeIndex = 0,
  isAutoCallActive = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'total': return <Users className="w-6 h-6 text-gray-600" />;
      case 'answered': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'missed': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'pending': return <Clock className="w-6 h-6 text-blue-600" />;
      case 'round': return <RotateCcw className="w-6 h-6 text-purple-600" />;
      case 'current': return <Phone className="w-6 h-6 text-yellow-600" />;
      case 'monthly': return <Calendar className="w-6 h-6 text-orange-600" />;
      case 'completed': return <CheckCircle className="w-6 h-6 text-teal-600" />;
      case 'urgent': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default: return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  const getFilteredEmployees = () => {
    switch (type) {
      case 'answered': return employees.filter(emp => emp.status === 'answered');
      case 'missed': return employees.filter(emp => emp.status === 'missed');
      case 'pending': return employees.filter(emp => emp.status === 'pending');
      case 'completed': return employees.filter(emp => emp.workStatus === 'completed');
      case 'urgent': return employees.filter(emp => emp.isUrgent);
      default: return employees;
    }
  };

  const filteredEmployees = getFilteredEmployees();

  const renderContent = () => {
    switch (type) {
      case 'total':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{employees.length}</div>
                <div className="text-sm text-gray-600">Total Contacts</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{stats.answered}</div>
                <div className="text-sm text-green-600">Successfully Reached</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">All Contacts:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {employees.map((emp, index) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-600">{emp.phoneNumber}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'answered' ? 'bg-green-100 text-green-800' :
                      emp.status === 'missed' ? 'bg-red-100 text-red-800' :
                      emp.status === 'calling' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'round':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-800 mb-2">Round {stats.currentRound}</div>
              <div className="text-purple-600">Current calling round</div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Round Information:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>Round 1:</strong> Calls all contacts once</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>Round 2+:</strong> Calls only missed/unanswered contacts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>Auto Stop:</strong> When all contacts are reached</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <div className="text-sm text-purple-800">
                  <strong>Progress:</strong> {stats.answered} answered, {stats.missed} missed, {stats.pending} pending
                </div>
              </div>
            </div>
          </div>
        );

      case 'current':
        const currentClient = isAutoCallActive && employees[currentEmployeeIndex] ? employees[currentEmployeeIndex] : null;
        return (
          <div className="space-y-4">
            {currentClient ? (
              <>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-800 mb-2">{currentClient.name}</div>
                  <div className="text-yellow-600">Currently being called</div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Phone:</strong> {currentClient.phoneNumber}
                    </div>
                    <div>
                      <strong>Status:</strong> {currentClient.status}
                    </div>
                    <div>
                      <strong>Position:</strong> {currentEmployeeIndex + 1} of {employees.length}
                    </div>
                    <div>
                      <strong>Attempts:</strong> {currentClient.callAttempts}
                    </div>
                  </div>
                  {currentClient.priority && (
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <strong>Priority:</strong> {currentClient.priority}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active auto calling session</p>
                <p className="text-sm text-gray-400 mt-2">Start auto calling to see current client information</p>
              </div>
            )}
          </div>
        );

      case 'monthly':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-800 mb-2">{stats.monthlyAppointments}</div>
              <div className="text-orange-600">Appointments this month</div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Monthly Overview:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-bold text-green-800">Scheduled</div>
                  <div className="text-green-600">Ready to go</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-bold text-blue-800">This Week</div>
                  <div className="text-blue-600">Coming up</div>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <div className="text-sm text-orange-800">
                  <strong>Tip:</strong> Click "View Calendar" to see detailed appointment schedule
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-2">{filteredEmployees.length}</div>
              <div className="text-gray-600">{title}</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Contacts:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-gray-600">{emp.phoneNumber}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {emp.isUrgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'answered' ? 'bg-green-100 text-green-800' :
                        emp.status === 'missed' ? 'bg-red-100 text-red-800' :
                        emp.status === 'calling' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                {getIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <p className="text-gray-600">Detailed information and statistics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};