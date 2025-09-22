import React, { useState, useEffect, useCallback } from 'react';
import { useCallSystem } from './hooks/useCallSystem';
import { EmployeeCard } from './components/EmployeeCard';
import { CallStatus } from './components/CallStatus';
import { ControlPanel } from './components/ControlPanel';
import { ContactManager } from './components/ContactManager';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { CalendarModal } from './components/CalendarModal';
import { DetailModal } from './components/DetailModal';
import { ClientReviewModal } from './components/ClientReviewModal';
import { AuthWrapper } from './components/AuthWrapper';
import { PhoneCall, Users, Zap, Phone } from 'lucide-react';
import { Employee, WorkHistory, Appointment, ClientFeedback, ClientReview } from './types/Employee';

function App() {
  const {
    employees,
    isAutoCallActive,
    currentCallingId,
    currentEmployeeIndex,
    stats,
    startAutoCalling,
    stopAutoCalling,
    callEmployee,
    resetSystem,
    addContact,
    deleteContact,
    updatePriority,
    addWorkHistory,
    addAppointment,
    addFeedback,
    getClientHistory,
  } = useCallSystem();

  const [selectedClient, setSelectedClient] = useState<Employee | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [detailModalType, setDetailModalType] = useState<'total' | 'answered' | 'missed' | 'pending' | 'round' | 'current' | 'monthly' | 'completed' | 'urgent'>('total');
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const [contactFilter, setContactFilter] = useState<'all' | 'default' | 'custom' | 'completed' | 'answered' | 'missed' | 'pending' | 'urgent'>('all');
  const [clientHistory, setClientHistory] = useState<{
    workHistory: WorkHistory[];
    appointments: Appointment[];
    feedback: ClientFeedback[];
    reviews: ClientReview[];
  }>({ workHistory: [], appointments: [], feedback: [], reviews: [] });

  // Load marked dates from localStorage on mount
  useEffect(() => {
    const savedMarkedDates = localStorage.getItem('markedDates');
    if (savedMarkedDates) {
      try {
        const dates = JSON.parse(savedMarkedDates).map((dateStr: string) => new Date(dateStr));
        setMarkedDates(dates);
      } catch (error) {
        console.error('Failed to load marked dates:', error);
      }
    }
  }, []);

  // Save marked dates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('markedDates', JSON.stringify(markedDates.map(date => date.toISOString())));
  }, [markedDates]);

  const handleMarkDate = (date: Date) => {
    setMarkedDates(prev => [...prev, date]);
  };

  const handleUnmarkDate = (date: Date) => {
    setMarkedDates(prev => prev.filter(markedDate => markedDate.toDateString() !== date.toDateString()));
  };

  const handleFilterCompleted = () => {
    setContactFilter('completed');
  };

  const handleFilterAnswered = () => {
    setContactFilter('answered');
  };

  const handleFilterMissed = () => {
    setContactFilter('missed');
  };

  const handleFilterPending = () => {
    setContactFilter('pending');
  };

  const handleFilterUrgent = () => {
    setContactFilter('urgent');
  };

  const handleShowTotalDetails = () => {
    setDetailModalType('total');
    setDetailModalTitle('Total Contacts');
    setShowDetailModal(true);
  };

  const handleShowMonthlyAppointments = () => {
    setDetailModalType('monthly');
    setDetailModalTitle('Monthly Appointments');
    setShowDetailModal(true);
  };

  const handleShowCurrentClient = () => {
    setDetailModalType('current');
    setDetailModalTitle('Current Client');
    setShowDetailModal(true);
  };

  const handleShowRoundInfo = () => {
    setDetailModalType('round');
    setDetailModalTitle('Round Information');
    setShowDetailModal(true);
  };
  const handleOpenWhatsApp = (phoneNumber: string) => {
    // Clean phone number for WhatsApp
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewHistory = async (employeeId: string) => {
    const client = employees.find(emp => emp.id === employeeId);
    if (!client) return;

    try {
      const history = await getClientHistory(employeeId);
      setSelectedClient(client);
      setClientHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Failed to load client history:', error);
    }
  };

  const handleViewReviews = async (employeeId: string) => {
    const client = employees.find(emp => emp.id === employeeId);
    if (!client) return;

    try {
      // Mock reviews for now - in real app, this would come from the database
      const mockReviews: ClientReview[] = [
        {
          id: '1',
          clientId: employeeId,
          rating: 5,
          reviewText: 'Excellent service and communication. Very professional and delivered on time.',
          reviewDate: new Date('2024-01-15'),
          serviceType: 'project'
        },
        {
          id: '2',
          clientId: employeeId,
          rating: 4,
          reviewText: 'Good work quality, would recommend.',
          reviewDate: new Date('2024-02-20'),
          serviceType: 'consultation'
        }
      ];
      
      setSelectedClient(client);
      setClientHistory(prev => ({ ...prev, reviews: mockReviews }));
      setShowReviewModal(true);
    } catch (error) {
      console.error('Failed to load client reviews:', error);
    }
  };

  const handleAddReview = async (clientId: string, reviewData: Omit<ClientReview, 'id' | 'clientId'>): Promise<void> => {
    try {
      // In real app, this would save to database
      const newReview: ClientReview = {
        id: Date.now().toString(),
        clientId,
        ...reviewData,
      };
      
      setClientHistory(prev => ({
        ...prev,
        reviews: [newReview, ...prev.reviews]
      }));
    } catch (error) {
      console.error('Failed to add review:', error);
      throw error;
    }
  };
  const handleScheduleAppointment = async (employeeId: string) => {
    const client = employees.find(emp => emp.id === employeeId);
    if (!client) return;

    try {
      const history = await getClientHistory(employeeId);
      setSelectedClient(client);
      setClientHistory(history);
      setShowAppointmentModal(true);
    } catch (error) {
      console.error('Failed to load client data:', error);
    }
  };

  const handleShowCalendar = async () => {
    try {
      // Get all appointments for calendar view
      const allAppointments: Appointment[] = [];
      for (const employee of employees) {
        const history = await getClientHistory(employee.id);
        allAppointments.push(...history.appointments);
      }
      setClientHistory(prev => ({ ...prev, appointments: allAppointments }));
      setShowCalendarModal(true);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };
  
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="bg-indigo-600 p-4 rounded-full shadow-lg">
              <PhoneCall className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Client Calling System
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-lg text-gray-600">Automated & Manual Calling</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Streamline client communication with automatic calling sequences, real-time status tracking, 
            priority management, and continuous loop functionality until all clients are contacted.
          </p>
        </div>

        {/* Call Status Dashboard */}
        <CallStatus 
          stats={stats} 
          isAutoCallActive={isAutoCallActive}
          currentEmployeeIndex={currentEmployeeIndex}
          totalEmployees={employees.length}
          onFilterCompleted={handleFilterCompleted}
          onFilterAnswered={handleFilterAnswered}
          onFilterMissed={handleFilterMissed}
          onFilterPending={handleFilterPending}
          onFilterUrgent={handleFilterUrgent}
          onShowMonthlyAppointments={handleShowMonthlyAppointments}
          onShowCurrentClient={handleShowCurrentClient}
          onShowRoundInfo={handleShowRoundInfo}
          onShowTotalDetails={handleShowTotalDetails}
          employees={employees}
        />

        {/* Control Panel */}
        <ControlPanel
          isAutoCallActive={isAutoCallActive}
          onStartAutoCalling={startAutoCalling}
          onStopAutoCalling={stopAutoCalling}
          onResetSystem={resetSystem}
          hasEmployees={employees.length > 0}
          currentRound={stats.currentRound}
          currentEmployeeIndex={currentEmployeeIndex}
          totalEmployees={employees.length}
          onShowCalendar={handleShowCalendar}
        />

        {/* Contact Management */}
        <ContactManager
          employees={employees}
          onAddContact={addContact}
          onDeleteContact={deleteContact}
          isAutoCallActive={isAutoCallActive}
          filterType={contactFilter}
          onFilterChange={setContactFilter}
        />

        {/* Client List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>Client Directory</span>
            {isAutoCallActive && (
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full animate-pulse">
                Auto Calling Active
              </span>
            )}
          </h2>
          
          {employees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee, index) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  isCurrentlyCalling={currentCallingId === employee.id}
                  isCurrentEmployee={index === currentEmployeeIndex}
                  onCallEmployee={callEmployee}
                  onUpdatePriority={updatePriority}
                  isAutoCallActive={isAutoCallActive}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onViewHistory={handleViewHistory}
                  onScheduleAppointment={handleScheduleAppointment}
                  onViewReviews={handleViewReviews}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No clients added yet...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <PhoneCall className="w-6 h-6 text-indigo-600" />
            <span>How to Use the System</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-600">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Auto Calling Mode:</span>
              </h4>
              <ul className="space-y-2 text-sm pl-7">
                <li>• 🚀 Click "Start Auto Call" to begin automatic sequence</li>
                <li>• ⏱️ Each call has exactly 10-second timeout</li>
                <li>• 🔄 System automatically moves to next unanswered client</li>
                <li>• 🎯 Skips clients who have already answered</li>
                <li>• 🛑 Click "Stop Auto Call" to halt the process</li>
                <li>• ✅ Stops automatically when all clients are reached</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>Manual Calling:</span>
              </h4>
              <ul className="space-y-2 text-sm pl-7">
                <li>• 📞 Click "Call" button on any client card</li>
                <li>• ⏳ Wait for 10-second timeout or call completion</li>
                <li>• ✅ Status updates to "Answered" (green) if picked up</li>
                <li>• ❌ Status updates to "Missed" (red) if timeout</li>
                <li>• 🔄 Manual calls work alongside auto calling</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Priority Management:</span>
              </h4>
              <ul className="space-y-2 text-sm pl-7">
                <li>• ⭐ <span className="font-semibold text-green-800">High Priority</span> - Urgent enquiries (Dark Green)</li>
                <li>• 🔄 <span className="font-semibold text-green-600">Follow Up</span> - Needs follow-up (Light Green)</li>
                <li>• ❌ <span className="font-semibold text-red-600">Not Interested</span> - Client not interested (Red)</li>
                <li>• 🎯 Set priority for better client management</li>
                <li>• 📊 Visual indicators help track client status</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">Status Color Guide:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span>Gray = Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Blue = Calling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Green = Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Red = Missed</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Priority Color Guide:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-800 rounded-full"></div>
                  <span>Dark Green = High Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <span>Light Green = Follow Up</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Red = Not Interested</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client History Modal */}
        {showHistoryModal && selectedClient && (
          <ClientHistoryModal
            client={selectedClient}
            onClose={() => setShowHistoryModal(false)}
            onAddWorkHistory={addWorkHistory}
            onAddAppointment={addAppointment}
            onAddFeedback={addFeedback}
            workHistory={clientHistory.workHistory}
            appointments={clientHistory.appointments}
            feedback={clientHistory.feedback}
          />
        )}

        {/* Client Reviews Modal */}
        {showReviewModal && selectedClient && (
          <ClientReviewModal
            client={selectedClient}
            onClose={() => setShowReviewModal(false)}
            onAddReview={handleAddReview}
            reviews={clientHistory.reviews}
          />
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={detailModalTitle}
          type={detailModalType}
          employees={employees}
          stats={stats}
          currentEmployeeIndex={currentEmployeeIndex}
          isAutoCallActive={isAutoCallActive}
        />

        {/* Appointment Scheduler Modal */}
        {showAppointmentModal && selectedClient && (
          <AppointmentScheduler
            client={selectedClient}
            onClose={() => setShowAppointmentModal(false)}
            onScheduleAppointment={addAppointment}
            existingAppointments={clientHistory.appointments}
            markedDates={markedDates}
            onMarkDate={handleMarkDate}
            onUnmarkDate={handleUnmarkDate}
          />
        )}

        {/* Calendar Modal */}
        {showCalendarModal && (
          <CalendarModal
            appointments={clientHistory.appointments}
            onClose={() => setShowCalendarModal(false)}
            markedDates={markedDates}
            onMarkDate={handleMarkDate}
            onUnmarkDate={handleUnmarkDate}
          />
        )}
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App;