import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus, X, Check, Bookmark } from 'lucide-react';
import { Appointment } from '../types/Employee';

interface CalendarViewProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  onClose?: () => void;
  showHeader?: boolean;
  markedDates?: Date[];
  onMarkDate?: (date: Date) => void;
  onUnmarkDate?: (date: Date) => void;
  employees: any[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onDateSelect,
  selectedDate,
  onClose,
  showHeader = true,
  markedDates = [],
  onMarkDate,
  onUnmarkDate,
  employees,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Appointment[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check for reminders (appointments tomorrow)
  useEffect(() => {
    if (!appointments || appointments.length === 0) {
      setReminders([]);
      return;
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    const tomorrowAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= tomorrow && aptDate <= tomorrowEnd && apt.status === 'scheduled';
    });
    
    setReminders(tomorrowAppointments);
    
    // Show alert for tomorrow's appointments
    if (tomorrowAppointments.length > 0) {
      const reminderText = tomorrowAppointments.map(apt => {
        const clientName = getClientName(apt.clientId);
        const time = new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${clientName} at ${time} (${apt.appointmentType})`;
      }).join('\n');
      
      // Show alert after a short delay to ensure component is mounted
      const alertTimer = setTimeout(() => {
        if (window.confirm(`🔔 REMINDER: You have ${tomorrowAppointments.length} appointment${tomorrowAppointments.length > 1 ? 's' : ''} tomorrow!\n\n${reminderText}\n\nClick OK to acknowledge.`)) {
          console.log('Reminder acknowledged');
        }
      }, 1000);
      
      return () => clearTimeout(alertTimer);
    }
  }, [appointments]);
  // Simple functions without memoization for instant response
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return appointments.filter(apt => 
      new Date(apt.appointmentDate).toDateString() === dateStr &&
      apt.status !== 'cancelled'
    );
  };

  const isDateAvailable = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    return dayAppointments.length < 8; // Max 8 appointments per day
  };

  const isDateMarked = (date: Date) => {
    return markedDates.some(markedDate => markedDate.toDateString() === date.toDateString());
  };

  const getClientName = (clientId: string) => {
    if (!employees || employees.length === 0) {
      return 'Loading...';
    }
    const client = employees.find(emp => emp.id === clientId);
    return client ? client.name : 'Client Not Found';
  };
  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle right-click to mark/unmark dates - instant response
  const handleRightClick = (e: React.MouseEvent, date: Date) => {
    e.preventDefault();
    // Instant response - no validation delays
    if (isDateMarked(date) && onUnmarkDate) {
      onUnmarkDate(date);
    } else if (onMarkDate) {
      onMarkDate(date);
    }
  };

  // Handle date selection - instant response
  const handleDateSelect = (date: Date) => {
    // Check if date is marked and has schedules
    if (isDateMarked(date)) {
      const dateSchedules = getAppointmentsForDate(date);
      if (dateSchedules.length > 0) {
        setSelectedDateSchedules(dateSchedules);
        setShowScheduleModal(true);
        return;
      }
    }
    
    // Regular date selection
    onDateSelect(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = getCalendarDays();

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg">
        {/* Reminders Section */}
        {reminders.length > 0 && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Tomorrow's Reminders</h3>
            </div>
            <div className="space-y-2">
              {reminders.map((reminder, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-yellow-100 rounded-lg">
                  <div>
                    <span className="font-medium text-yellow-800">{getClientName(reminder.clientId)}</span>
                    <span className="text-sm text-yellow-600 ml-2">
                      {new Date(reminder.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                    {reminder.appointmentType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {showHeader && (
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Appointment Calendar</h2>
                <p className="text-gray-600">Check availability and schedule appointments</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span>Busy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span>Full</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 border-2 border-purple-400 rounded flex items-center justify-center">
              <Bookmark className="w-2 h-2 text-purple-600" />
            </div>
            <span>Marked (Click to view schedules)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Instructions */}
        {(onMarkDate || onUnmarkDate) && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2 text-purple-800">
              <Bookmark className="w-4 h-4" />
              <span className="text-sm font-medium">
                Right-click to mark/unmark dates. Click marked dates to view schedules.
              </span>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today;
            const dayAppointments = getAppointmentsForDate(date);
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isMarked = isDateMarked(date);
            
            let bgColor = 'bg-white hover:bg-gray-50';
            let borderColor = 'border-gray-200';
            let textColor = isCurrentMonth ? 'text-gray-800' : 'text-gray-400';
            
            if (isPast && isCurrentMonth) {
              bgColor = 'bg-gray-50';
              textColor = 'text-gray-400';
            } else if (isCurrentMonth && !isPast) {
              if (dayAppointments.length === 0) {
                bgColor = 'bg-green-50 hover:bg-green-100';
                borderColor = 'border-green-300';
              } else if (dayAppointments.length < 4) {
                bgColor = 'bg-green-50 hover:bg-green-100';
                borderColor = 'border-green-300';
              } else if (dayAppointments.length < 8) {
                bgColor = 'bg-yellow-50 hover:bg-yellow-100';
                borderColor = 'border-yellow-300';
              } else {
                bgColor = 'bg-red-50 hover:bg-red-100';
                borderColor = 'border-red-300';
              }
            }
            
            // Override colors for marked dates
            if (isMarked && isCurrentMonth) {
              bgColor = 'bg-purple-100 hover:bg-purple-200';
              borderColor = 'border-purple-400';
            }
            
            if (isSelected) {
              bgColor = 'bg-blue-100 hover:bg-blue-200';
              borderColor = 'border-blue-400';
            }
            
            if (isToday) {
              borderColor = 'border-blue-500 border-2';
            }

            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isDateMarked(date) && onUnmarkDate) {
                    onUnmarkDate(date);
                  } else if (onMarkDate) {
                    onMarkDate(date);
                  }
                }}
                className={`
                  p-3 border rounded-lg transition-colors min-h-[60px] flex flex-col items-center justify-center relative
                  ${bgColor} ${borderColor} ${textColor}
                  cursor-pointer
                  ${isToday ? 'font-bold' : ''}
                `}
                title={isMarked ? (dayAppointments.length > 0 ? 'Click to view schedules, Right-click to unmark' : 'Right-click to unmark') : 'Right-click to mark'}
              >
                <span className="text-sm">{date.getDate()}</span>
                
                {/* Marked indicator */}
                {isMarked && isCurrentMonth && (
                  <div className="absolute top-1 right-1">
                    <Bookmark className="w-3 h-3 text-purple-600" />
                  </div>
                )}
                
                {isCurrentMonth && dayAppointments.length > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      dayAppointments.length < 4 ? 'bg-green-500' :
                      dayAppointments.length < 8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs">{dayAppointments.length}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900">
                {formatDate(selectedDate)}
              </h4>
              <div className="flex items-center space-x-2">
                {isDateMarked(selectedDate) && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center space-x-1">
                    <Bookmark className="w-3 h-3" />
                    <span>Marked</span>
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDateAvailable(selectedDate) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isDateAvailable(selectedDate) ? 'Available' : 'Full'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Clock className="w-4 h-4" />
                <span>
                  {getAppointmentsForDate(selectedDate).length} appointments scheduled
                </span>
              </div>
              
              {getAppointmentsForDate(selectedDate).length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Scheduled Appointments:</h5>
                  <div className="space-y-1">
                    {getAppointmentsForDate(selectedDate).map((apt, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                        <User className="w-3 h-3" />
                        <span>{new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>-</span>
                        <span>{getClientName(apt.clientId)}</span>
                        <span>-</span>
                        <span>{apt.appointmentType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isDateAvailable(selectedDate) && (
                <div className="mt-3 text-sm text-green-700">
                  ✅ This date is available for new appointments
                </div>
              )}
              
              {isDateMarked(selectedDate) && (
                <div className="mt-3 text-sm text-purple-700 flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>This date is marked in your schedule</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Daily Schedules</h2>
                    <p className="text-gray-600">Appointments for this marked date</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {selectedDateSchedules.map((schedule, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{getClientName(schedule.clientId)}</h3>
                          <p className="text-sm text-gray-600">{schedule.appointmentType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-800">
                          {new Date(schedule.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                          schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {schedule.status}
                        </span>
                      </div>
                    </div>
                    {schedule.notes && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-700">{schedule.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedDateSchedules.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No schedules found for this date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};