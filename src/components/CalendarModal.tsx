import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { Appointment } from '../types/Employee';

interface CalendarModalProps {
  appointments: Appointment[];
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
  markedDates?: Date[];
  onMarkDate?: (date: Date) => void;
  onUnmarkDate?: (date: Date) => void;
  employees: any[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  appointments,
  onClose,
  onDateSelect,
  markedDates = [],
  onMarkDate,
  onUnmarkDate,
  employees,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CalendarView
          appointments={appointments}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onClose={onClose}
          showHeader={true}
          markedDates={markedDates}
          onMarkDate={onMarkDate}
          onUnmarkDate={onUnmarkDate}
          employees={employees}
          employees={[]}
        />
      </div>
    </div>
  );
};