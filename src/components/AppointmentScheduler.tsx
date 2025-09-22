import React, { useState } from 'react';
import { Calendar, Clock, X, Check, Plus } from 'lucide-react';
import { Employee, Appointment } from '../types/Employee';
import { CalendarView } from './CalendarView';

interface AppointmentSchedulerProps {
  client: Employee;
  onClose: () => void;
  onScheduleAppointment: (clientId: string, appointmentData: Omit<Appointment, 'id' | 'clientId'>) => Promise<void>;
  existingAppointments: Appointment[];
  markedDates?: Date[];
  onMarkDate?: (date: Date) => void;
  onUnmarkDate?: (date: Date) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  client,
  onClose,
  onScheduleAppointment,
  existingAppointments,
  markedDates = [],
  onMarkDate,
  onUnmarkDate,
}) => {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appointmentDate || !formData.appointmentTime) return;

    setIsSubmitting(true);
    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      await onScheduleAppointment(client.id, {
        appointmentDate: appointmentDateTime,
        appointmentType: formData.appointmentType,
        status: 'scheduled',
        notes: formData.notes || undefined,
      });

      onClose();
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
    const dateStr = date.toISOString().split('T')[0];
    setFormData({ ...formData, appointmentDate: dateStr });
    setShowCalendar(false);
  };

  const upcomingAppointments = existingAppointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Schedule Appointment</h2>
                <p className="text-gray-600">Client: {client.name}</p>
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

        <div className="p-6">
          {/* Calendar Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</span>
            </button>
          </div>

          {/* Calendar View */}
          {showCalendar && (
            <div className="mb-6">
              <CalendarView
                appointments={existingAppointments}
                onDateSelect={handleCalendarDateSelect}
                selectedDate={selectedCalendarDate}
                showHeader={false}
                markedDates={markedDates}
                onMarkDate={onMarkDate}
                onUnmarkDate={onUnmarkDate}
              />
            </div>
          )}

          {/* Existing Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Appointments</h3>
              <div className="space-y-2">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">{appointment.appointmentType}</p>
                        <p className="text-sm text-blue-600">
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Appointment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date {selectedCalendarDate && <span className="text-blue-600">(Selected from calendar)</span>}
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    selectedCalendarDate ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                  }`}
                  required
                />
                {selectedCalendarDate && (
                  <p className="text-sm text-blue-600 mt-1">
                    Selected: {selectedCalendarDate.toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                value={formData.appointmentType}
                onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="consultation">Consultation</option>
                <option value="meeting">Meeting</option>
                <option value="follow-up">Follow-up</option>
                <option value="presentation">Presentation</option>
                <option value="project-review">Project Review</option>
                <option value="planning">Planning Session</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                placeholder="Add any additional notes or requirements..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Schedule Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};