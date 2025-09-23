import { useState, useCallback, useRef, useEffect } from 'react';
import { Employee, CallSystemStats, WorkHistory, Appointment, ClientFeedback } from '../types/Employee';
import { SupabaseService } from '../services/supabaseService';

export const useCallSystem = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAutoCallActive, setIsAutoCallActive] = useState(false);
  const [currentCallingId, setCurrentCallingId] = useState<string | null>(null);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [stats, setStats] = useState<CallSystemStats>({
    totalEmployees: 0,
    answered: 0,
    missed: 0,
    pending: 0,
    currentRound: 1,
    monthlyAppointments: 0,
    completedWork: 0,
    urgentClients: 0,
  });

  const supabaseService = SupabaseService.getInstance();
  const autoCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoCallingRef = useRef(false);

  // Load employees on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Update stats whenever employees change
  useEffect(() => {
    updateStats();
  }, [employees]);

  // Load monthly appointments count
  useEffect(() => {
    const loadMonthlyStats = async () => {
      try {
        const monthlyAppointments = await supabaseService.getMonthlyAppointments();
        setStats(prev => ({ ...prev, monthlyAppointments }));
      } catch (error) {
        console.error('Failed to load monthly stats:', error);
      }
    };
    loadMonthlyStats();
  }, []);

  const loadEmployees = async () => {
    try {
      const employeeData = await supabaseService.getClients();
      setEmployees(employeeData);
    } catch (error) {
      console.error('Failed to load employees:', error);
      // If Supabase is not connected or tables don't exist, show empty state
      if (error instanceof Error && (
        error.message.includes('connect to Supabase') ||
        error.message.includes('Database tables not found')
      )) {
        setEmployees([]);
        // Show user-friendly message for missing tables
        if (error.message.includes('Database tables not found')) {
          alert('⚠️ Database Setup Required\n\nThe database tables are not set up yet. Please:\n\n1. Go to your Supabase project dashboard\n2. Navigate to SQL Editor\n3. Run the migration files from the supabase/migrations folder\n\nAfter running the migrations, refresh this page.');
        }
      }
    }
  };

  const updateStats = () => {
    const totalEmployees = employees.length;
    const answered = employees.filter(emp => emp.status === 'answered').length;
    const missed = employees.filter(emp => emp.status === 'missed').length;
    const pending = employees.filter(emp => emp.status === 'pending').length;
    const urgentClients = employees.filter(emp => emp.isUrgent).length;
    const completedWork = employees.filter(emp => emp.workStatus === 'completed').length;

    setStats(prev => ({
      ...prev,
      totalEmployees,
      answered,
      missed,
      pending,
      urgentClients,
      completedWork,
    }));
  };

  const updateEmployeeStatus = (employeeId: string, status: Employee['status']) => {
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            status,
            lastCallTime: new Date(),
            callAttempts: status === 'calling' ? emp.callAttempts : emp.callAttempts + 1
          };
        }
        return emp;
      })
    );
  };

  const callEmployee = useCallback(async (employeeId: string): Promise<boolean> => {
    try {
      console.log(`📞 Calling employee ${employeeId}`);
      
      // Set calling status
      updateEmployeeStatus(employeeId, 'calling');
      setCurrentCallingId(employeeId);

      // Create promise with 10-second timeout
      const callResult = await new Promise<boolean>((resolve) => {
        let resolved = false;
        
        // 10-second timeout
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log(`⏰ Timeout for employee ${employeeId}`);
            resolve(false);
          }
        }, 10000);
        
        // API call
        supabaseService.callClient(employeeId).then(result => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            console.log(`✅ Call result for ${employeeId}: ${result.answered}`);
            resolve(result.answered);
          }
        }).catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(false);
          }
        });
      });
      
      // Update final status
      const finalStatus = callResult ? 'answered' : 'missed';
      updateEmployeeStatus(employeeId, finalStatus);
      setCurrentCallingId(null);
      
      return callResult;
    } catch (error) {
      console.error('Call failed:', error);
      updateEmployeeStatus(employeeId, 'missed');
      setCurrentCallingId(null);
      return false;
    }
  }, []);

  const processAutoCall = useCallback(async (employeeIndex: number) => {
    if (!isAutoCallingRef.current || employees.length === 0) {
      console.log('🛑 Auto calling stopped or no employees');
      return;
    }

    // Get current employees and filter for unanswered only
    const currentEmployees = employees;
    const unansweredEmployees = currentEmployees.filter(emp => 
      emp.status === 'missed' || emp.status === 'pending'
    );
    
    // If no unanswered employees, stop auto calling
    if (unansweredEmployees.length === 0) {
      console.log('✅ All clients have been reached! Auto calling completed.');
      alert('🎉 All clients have been successfully reached!');
      stopAutoCalling();
      return;
    }
    
    // Get the current unanswered employee
    const currentIndex = employeeIndex % unansweredEmployees.length;
    const currentEmployee = unansweredEmployees[currentIndex];
    
    if (!currentEmployee) {
      console.log('❌ No unanswered employee found');
      stopAutoCalling();
      return;
    }
    
    // Find the actual index in the full employees array for UI display
    const actualIndex = currentEmployees.findIndex(emp => emp.id === currentEmployee.id);
    console.log(`🔄 Auto calling - Round ${stats.currentRound} - calling unanswered contact ${currentIndex + 1}/${unansweredEmployees.length}: ${currentEmployee.name}`);
    
    setCurrentEmployeeIndex(actualIndex);
    
    try {
      const callResult = await callEmployee(currentEmployee.id);
      console.log(`📞 Call result for ${currentEmployee.name}: ${callResult ? 'answered' : 'missed'}`);
    } catch (error) {
      console.error('Error calling contact:', error);
    }
    
    // Continue to next unanswered employee after a short delay
    if (isAutoCallingRef.current) {
      const nextIndex = currentIndex + 1;
      
      // If we've cycled through all unanswered contacts, increment round
      if (nextIndex >= unansweredEmployees.length) {
        setStats(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
        console.log(`🔄 Completed round ${stats.currentRound}, starting next round`);
      }
      
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall(nextIndex);
        }
      }, 1500);
    }
  }, [employees, callEmployee, stats.currentRound]);

  const startAutoCalling = useCallback(() => {
    if (isAutoCallActive || employees.length === 0) {
      console.log('❌ Cannot start auto calling - already active or no employees');
      return;
    }
    
    const unansweredEmployees = employees.filter(emp => 
      emp.status === 'missed' || emp.status === 'pending'
    );
    
    if (unansweredEmployees.length === 0) {
      console.log('✅ All contacts have already been answered!');
      alert('🎉 All contacts have already been answered!');
      return;
    }
    
    console.log('🚀 Starting auto calling sequence');
    console.log(`📊 Total contacts: ${employees.length}, Unanswered: ${unansweredEmployees.length}`);
    setIsAutoCallActive(true);
    isAutoCallingRef.current = true;
    
    // Find the first unanswered contact for UI display
    const firstUnansweredIndex = employees.findIndex(emp => 
      emp.status === 'missed' || emp.status === 'pending'
    );
    setCurrentEmployeeIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
    
    // Start calling from index 0 of unanswered list
    setTimeout(() => {
      if (isAutoCallingRef.current) {
        processAutoCall(0);
      }
    }, 500);
  }, [employees, isAutoCallActive, processAutoCall]);

  const stopAutoCalling = useCallback(() => {
    console.log('🛑 Stopping auto calling');
    setIsAutoCallActive(false);
    isAutoCallingRef.current = false;
    
    if (autoCallTimeoutRef.current) {
      clearTimeout(autoCallTimeoutRef.current);
      autoCallTimeoutRef.current = null;
    }
    
    setCurrentCallingId(null);
  }, []);

  const resetSystem = async () => {
    console.log('🔄 Resetting system');
    stopAutoCalling();
    await supabaseService.resetAllStatuses();
    await loadEmployees();
    setCurrentEmployeeIndex(0);
    setStats(prev => ({ ...prev, currentRound: 1 }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCallTimeoutRef.current) {
        clearTimeout(autoCallTimeoutRef.current);
      }
    };
  }, []);

  const addContact = async (contactData: {
    name: string;
    phoneNumber: string;
    whatsappNumber?: string;
    workStatus?: 'new' | 'in_progress' | 'completed' | 'repeat_client';
    isUrgent?: boolean;
  }): Promise<boolean> => {
    try {
      const newContact = await supabaseService.addClient(contactData);
      // Use functional update to ensure we have the latest state
      setEmployees(prev => {
        // Double-check for duplicates before adding
        const phoneExists = prev.some(emp => emp.phoneNumber === newContact.phoneNumber);
        
        if (phoneExists) {
          throw new Error('Phone number already exists');
        }
        
        return [...prev, newContact];
      });
      return true;
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const deleteContact = async (employeeId: string): Promise<boolean> => {
    try {
      await supabaseService.deleteClient(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      return true;
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const updatePriority = async (employeeId: string, priority: 'high' | 'follow-up' | 'not-interested'): Promise<void> => {
    try {
      await supabaseService.updateClientPriority(employeeId, priority);
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === employeeId ? { ...emp, priority } : emp
        )
      );
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  // New methods for advanced features
  const addWorkHistory = async (clientId: string, workData: Omit<WorkHistory, 'id' | 'clientId'>): Promise<void> => {
    try {
      await supabaseService.addWorkHistory(clientId, workData);
      // Update client work status if completed
      if (workData.status === 'completed') {
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === clientId ? { ...emp, workStatus: 'completed' } : emp
          )
        );
      }
    } catch (error) {
      console.error('Failed to add work history:', error);
      throw error;
    }
  };

  const addAppointment = async (clientId: string, appointmentData: Omit<Appointment, 'id' | 'clientId'>): Promise<void> => {
    try {
      await supabaseService.addAppointment(clientId, appointmentData);
      // Refresh monthly appointments count
      const monthlyAppointments = await supabaseService.getMonthlyAppointments();
      setStats(prev => ({ ...prev, monthlyAppointments }));
    } catch (error) {
      console.error('Failed to add appointment:', error);
      throw error;
    }
  };

  const addFeedback = async (clientId: string, feedbackData: Omit<ClientFeedback, 'id' | 'clientId'>): Promise<void> => {
    try {
      await supabaseService.addFeedback(clientId, feedbackData);
    } catch (error) {
      console.error('Failed to add feedback:', error);
      throw error;
    }
  };

  const getClientHistory = async (clientId: string) => {
    try {
      const [workHistory, appointments, feedback] = await Promise.all([
        supabaseService.getWorkHistory(clientId),
        supabaseService.getAppointments(clientId),
        supabaseService.getFeedback(clientId),
      ]);
      return { workHistory, appointments, feedback };
    } catch (error) {
      console.error('Failed to get client history:', error);
      throw error;
    }
  };

  return {
    employees,
    isAutoCallActive,
    currentCallingId,
    currentEmployeeIndex,
    stats,
    startAutoCalling,
    stopAutoCalling,
    callEmployee,
    resetSystem,
    loadEmployees,
    addContact,
    deleteContact,
    updatePriority,
    addWorkHistory,
    addAppointment,
    addFeedback,
    getClientHistory,
  };
};