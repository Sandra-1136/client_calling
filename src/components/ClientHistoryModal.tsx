import React, { useState, useEffect } from 'react';
import { X, History, Star, Calendar, MessageSquare, Plus, Trash2, Edit } from 'lucide-react';
import { Employee, WorkHistory, Appointment, ClientFeedback } from '../types/Employee';

interface ClientHistoryModalProps {
  client: Employee;
  onClose: () => void;
  onAddWorkHistory: (clientId: string, workData: Omit<WorkHistory, 'id' | 'clientId'>) => Promise<void>;
  onAddAppointment: (clientId: string, appointmentData: Omit<Appointment, 'id' | 'clientId'>) => Promise<void>;
  onAddFeedback: (clientId: string, feedbackData: Omit<ClientFeedback, 'id' | 'clientId'>) => Promise<void>;
  workHistory: WorkHistory[];
  appointments: Appointment[];
  feedback: ClientFeedback[];
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  client,
  onClose,
  onAddWorkHistory,
  onAddAppointment,
  onAddFeedback,
  workHistory,
  appointments,
  feedback,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'appointments' | 'feedback'>('history');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    workType: '',
    workDescription: '',
    amount: '',
    appointmentDate: '',
    appointmentType: 'consultation',
    notes: '',
    rating: 5,
    feedbackText: '',
  });

  const handleAddWork = async () => {
    if (!formData.workType.trim()) return;
    
    await onAddWorkHistory(client.id, {
      workType: formData.workType,
      workDescription: formData.workDescription || undefined,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      status: 'completed',
      completionDate: new Date(),
    });
    
    setFormData({ ...formData, workType: '', workDescription: '', amount: '' });
    setShowAddForm(false);
  };

  const handleAddAppointment = async () => {
    if (!formData.appointmentDate) return;
    
    await onAddAppointment(client.id, {
      appointmentDate: new Date(formData.appointmentDate),
      appointmentType: formData.appointmentType,
      status: 'scheduled',
      notes: formData.notes || undefined,
    });
    
    setFormData({ ...formData, appointmentDate: '', notes: '' });
    setShowAddForm(false);
  };

  const handleAddFeedback = async () => {
    await onAddFeedback(client.id, {
      rating: formData.rating,
      feedbackText: formData.feedbackText || undefined,
      feedbackDate: new Date(),
    });
    
    setFormData({ ...formData, feedbackText: '' });
    setShowAddForm(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{client.name}</h2>
                <p className="text-gray-600">Client History & Management</p>
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

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Work History ({workHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Feedback ({feedback.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Add Button */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add {activeTab === 'history' ? 'Work' : activeTab === 'appointments' ? 'Appointment' : 'Feedback'}
              </span>
            </button>
          </div>

          {/* Add Forms */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Work Type (e.g., Website Development)"
                    value={formData.workType}
                    onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Work Description"
                    value={formData.workDescription}
                    onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={handleAddWork}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Work History
                  </button>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={formData.appointmentType}
                    onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="presentation">Presentation</option>
                  </select>
                  <textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                  <button
                    onClick={handleAddAppointment}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Schedule Appointment
                  </button>
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4}>4 Stars - Good</option>
                      <option value={3}>3 Stars - Average</option>
                      <option value={2}>2 Stars - Poor</option>
                      <option value={1}>1 Star - Very Poor</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Feedback Text"
                    value={formData.feedbackText}
                    onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                  <button
                    onClick={handleAddFeedback}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Content Lists */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {workHistory.length > 0 ? (
                workHistory.map((work) => (
                  <div key={work.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{work.workType}</h4>
                        {work.workDescription && (
                          <p className="text-gray-600 text-sm mt-1">{work.workDescription}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {work.completionDate && (
                            <span>Completed: {new Date(work.completionDate).toLocaleDateString()}</span>
                          )}
                          {work.amount && (
                            <span className="font-medium text-green-600">${work.amount}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        work.status === 'completed' ? 'bg-green-100 text-green-800' :
                        work.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {work.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No work history recorded</p>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{appointment.appointmentType}</h4>
                        <p className="text-gray-600 text-sm">
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </p>
                        {appointment.notes && (
                          <p className="text-gray-600 text-sm mt-1">{appointment.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-3">
              {feedback.length > 0 ? (
                feedback.map((fb) => (
                  <div key={fb.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        {renderStars(fb.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(fb.feedbackDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {fb.feedbackText && (
                      <p className="text-gray-700">{fb.feedbackText}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No feedback recorded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};