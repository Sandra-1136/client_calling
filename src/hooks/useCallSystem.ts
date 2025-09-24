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
    const initializeSystem = async () => {
      try {
        console.log('🔄 Initializing calling system...');
        await loadEmployees();
        console.log('✅ Calling system initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize calling system:', error);
      }
    };
    
    initializeSystem();
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
      console.log('🔄 Loading employees from database...');
      const employeeData = await supabaseService.getClients();
      console.log(`✅ Loaded ${employeeData.length} employees from database`);
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
          console.warn('⚠️ Database tables not found - please run migrations');
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

  const processAutoCall = useCallback(async (employeeIndex: number) => {
    if (!isAutoCallingRef.current || employees.length === 0) {
      console.log('🛑 Auto calling stopped or no employees');
      return;
    }

    // Get current round from stats
    const currentRound = stats.currentRound;
    
    // Determine which clients to call based on round
    let clientsToCall: Employee[];
    if (currentRound === 1) {
      // 🚀 First Round: Call ALL persons - every single person
      clientsToCall = [...employees];
      console.log(`🚀 First Round: Call ALL persons - every single person (${employees.length} total)`);
    } else {
      // 🔄 Second Round Starts: ONLY calls NOT ANSWERED persons
      clientsToCall = employees.filter(emp => 
        emp.status === 'pending' || emp.status === 'missed'
      );
      console.log(`🔄 Round ${currentRound}: ONLY calls NOT ANSWERED persons (${clientsToCall.length} remaining)`);
    }
    
    // ✅ Auto Stops: When everyone has answered
    if (clientsToCall.length === 0) {
      console.log(`✅ Auto Stops: Everyone has answered after ${currentRound} rounds!`);
      alert('🎉 Auto Stops: Everyone has answered! All contacts reached successfully!');
      stopAutoCalling();
      return;
    }
    
    // Check if current round is completed - Continues: Until all not answered contacts are reached
    if (employeeIndex >= clientsToCall.length) {
      console.log(`🔄 Round ${currentRound} completed - checking for not answered contacts`);
      
      // Continues: Until all not answered contacts are reached
      const stillUnanswered = employees.filter(emp => 
        emp.status === 'pending' || emp.status === 'missed'
      );
      
      // ✅ Auto Stops: When everyone has answered
      if (stillUnanswered.length === 0) {
        console.log(`✅ Auto Stops: Everyone has answered after ${currentRound} rounds!`);
        alert('🎉 Auto Stops: Everyone has answered! All contacts reached successfully!');
        stopAutoCalling();
        return;
      }
      
      // ♻️ Continues: Until all not answered contacts are reached
      const nextRound = currentRound + 1;
      console.log(`♻️ Continues: ${stillUnanswered.length} not answered contacts remain. Starting Round ${nextRound}...`);
      setStats(prev => ({ ...prev, currentRound: nextRound }));
      
      // Start next round after 2-second delay
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall(0);
        }
      }, 2000);
      return;
    }
    
    // Get current client to call
    const currentClient = clientsToCall[employeeIndex];
    if (!currentClient) {
      console.log('❌ No client found at index', employeeIndex);
      // Move to next client if current one doesn't exist
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall(employeeIndex + 1);
        }
      }, 100);
      return;
    }
    
    // Find the actual index in the full employees array
    const actualIndex = employees.findIndex(emp => emp.id === currentClient.id);
    if (actualIndex === -1) {
      console.log('❌ Client not found in employees array');
      // Move to next client
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall(employeeIndex + 1);
        }
      }, 100);
      return;
    }
    
    console.log(`📞 Round ${currentRound}: Calling ${currentClient.name} (${employeeIndex + 1}/${clientsToCall.length})`);
    setCurrentEmployeeIndex(actualIndex);
    
    try {
      await callEmployee(currentClient.id);
    } catch (error) {
      console.error('Error calling contact:', error);
    }
    
    // Move to next client after 1.5-second delay
    if (isAutoCallingRef.current) {
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall(employeeIndex + 1);
        }
      }, 1500);
    }
  }, [employees, callEmployee, stopAutoCalling, stats.currentRound]);

  const startAutoCalling = useCallback(() => {
    if (isAutoCallActive) {
      console.log('❌ Cannot start auto calling - already active');
      return;
    }
    
    if (employees.length === 0) {
      alert('❌ No clients available. Please add clients first.');
      return;
    }
    
    console.log('🚀 Starting auto calling sequence');
    console.log(`🚀 First Round: Call ALL persons - every single person (${employees.length} total)`);
    
    setIsAutoCallActive(true);
    isAutoCallingRef.current = true;
    
    // 🚀 First Round: Call ALL persons - every single person
    setStats(prev => ({ ...prev, currentRound: 1 }));
    setCurrentEmployeeIndex(0);
    
    // Start calling after short delay
    autoCallTimeoutRef.current = setTimeout(() => {
      if (isAutoCallingRef.current) {
        processAutoCall(0);
      }
    }, 500);
  }, [employees, isAutoCallActive, processAutoCall]);

  const resetSystem = async () => {
    console.log('🔄 Resetting system');
    stopAutoCalling();
    try {
      await supabaseService.resetAllStatuses();
      await loadEmployees();
      setCurrentEmployeeIndex(0);
      setStats(prev => ({ ...prev, currentRound: 1 }));
    } catch (error) {
      console.error('Failed to reset system:', error);
    }
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