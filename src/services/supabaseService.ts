import { supabase, auth } from '../lib/supabase';
import { Employee, WorkHistory, Appointment, ClientFeedback } from '../types/Employee';
import { Database } from '../lib/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

type WorkHistoryRow = Database['public']['Tables']['work_history']['Row'];
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type FeedbackRow = Database['public']['Tables']['client_feedback']['Row'];
export class SupabaseService {
  private static instance: SupabaseService;

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Convert database row to Employee type
  private convertToEmployee(client: ClientRow): Employee {
    return {
      id: client.id,
      name: client.name,
      phoneNumber: client.phone_number,
      whatsappNumber: client.whatsapp_number || undefined,
      email: client.email,
      position: client.position,
      department: client.department,
      status: client.status,
      callAttempts: client.call_attempts,
      lastCallTime: client.last_call_time ? new Date(client.last_call_time) : undefined,
      priority: client.priority || undefined,
      workStatus: client.work_status,
      isUrgent: client.is_urgent,
      isDefault: false,
    };
  }

  // Convert Employee to database insert format
  private convertToClientInsert(employee: Omit<Employee, 'id'>, userId: string): ClientInsert {
    return {
      name: employee.name,
      phone_number: employee.phoneNumber,
      whatsapp_number: employee.whatsappNumber || null,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      status: employee.status,
      call_attempts: employee.callAttempts,
      last_call_time: employee.lastCallTime?.toISOString() || null,
      priority: employee.priority || null,
      work_status: employee.workStatus || 'new',
      is_urgent: employee.isUrgent || false,
      user_id: userId,
    };
  }

  async getClients(): Promise<Employee[]> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!supabase) {
      throw new Error('Please connect to Supabase first');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return data.map(client => this.convertToEmployee(client));
  }

  async addClient(clientData: {
    name: string;
    phoneNumber: string;
    whatsappNumber?: string;
    workStatus?: 'new' | 'in_progress' | 'completed' | 'repeat_client';
    isUrgent?: boolean;
  }): Promise<Employee> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!supabase) {
      throw new Error('Please connect to Supabase first');
    }

    // Check for duplicate phone number
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('phone_number', clientData.phoneNumber)
      .limit(1);

    if (existing && existing.length > 0) {
      throw new Error('Phone number already exists');
    }

    const newClient: ClientInsert = {
      name: clientData.name,
      phone_number: clientData.phoneNumber,
      whatsapp_number: clientData.whatsappNumber || null,
      email: 'Not provided',
      position: 'Not specified',
      department: 'Not specified',
      status: 'pending',
      call_attempts: 0,
      work_status: clientData.workStatus || 'new',
      is_urgent: clientData.isUrgent || false,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(newClient)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add client: ${error.message}`);
    }

    return this.convertToEmployee(data);
  }

  async updateClientStatus(clientId: string, status: Employee['status']): Promise<void> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .update({ status })
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to update client status: ${error.message}`);
    }
  }

  async updateClientCallInfo(clientId: string, callAttempts: number, lastCallTime: Date, status: Employee['status']): Promise<void> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .update({
        call_attempts: callAttempts,
        last_call_time: lastCallTime.toISOString(),
        status,
      })
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to update client call info: ${error.message}`);
    }
  }

  async updateClientPriority(clientId: string, priority: 'high' | 'follow-up' | 'not-interested'): Promise<void> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .update({ priority })
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to update client priority: ${error.message}`);
    }
  }

  async deleteClient(clientId: string): Promise<void> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  async resetAllStatuses(): Promise<void> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('clients')
      .update({
        status: 'pending',
        call_attempts: 0,
        last_call_time: null,
      })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to reset client statuses: ${error.message}`);
    }
  }

  async callClient(clientId: string): Promise<{ success: boolean; answered: boolean }> {
    // Simulate call with random response time (2-8 seconds) and 70% answer rate
    const callDuration = 2000 + Math.random() * 6000; // 2-8 seconds
    await new Promise(resolve => setTimeout(resolve, callDuration));
    
    // 70% chance of answering for realistic simulation
    const answered = Math.random() > 0.3;
    
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current client data
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('call_attempts')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch client: ${fetchError.message}`);
    }

    // Update call info
    await this.updateClientCallInfo(
      clientId,
      client.call_attempts + 1,
      new Date(),
      answered ? 'answered' : 'missed'
    );

    return { success: true, answered };
  }

  // Work History Methods
  async getWorkHistory(clientId: string): Promise<WorkHistory[]> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('work_history')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch work history: ${error.message}`);
    }

    return data.map(work => ({
      id: work.id,
      clientId: work.client_id,
      workType: work.work_type,
      workDescription: work.work_description || undefined,
      startDate: work.start_date ? new Date(work.start_date) : undefined,
      completionDate: work.completion_date ? new Date(work.completion_date) : undefined,
      status: work.status,
      amount: work.amount || undefined,
    }));
  }

  async addWorkHistory(clientId: string, workData: Omit<WorkHistory, 'id' | 'clientId'>): Promise<WorkHistory> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('work_history')
      .insert({
        client_id: clientId,
        user_id: user.id,
        work_type: workData.workType,
        work_description: workData.workDescription || null,
        start_date: workData.startDate?.toISOString() || null,
        completion_date: workData.completionDate?.toISOString() || null,
        status: workData.status,
        amount: workData.amount || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add work history: ${error.message}`);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      workType: data.work_type,
      workDescription: data.work_description || undefined,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
      status: data.status,
      amount: data.amount || undefined,
    };
  }

  // Appointments Methods
  async getAppointments(clientId: string): Promise<Appointment[]> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    return data.map(apt => ({
      id: apt.id,
      clientId: apt.client_id,
      appointmentDate: new Date(apt.appointment_date),
      appointmentType: apt.appointment_type,
      status: apt.status,
      notes: apt.notes || undefined,
    }));
  }

  async addAppointment(clientId: string, appointmentData: Omit<Appointment, 'id' | 'clientId'>): Promise<Appointment> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        user_id: user.id,
        appointment_date: appointmentData.appointmentDate.toISOString(),
        appointment_type: appointmentData.appointmentType,
        status: appointmentData.status,
        notes: appointmentData.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add appointment: ${error.message}`);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      appointmentDate: new Date(data.appointment_date),
      appointmentType: data.appointment_type,
      status: data.status,
      notes: data.notes || undefined,
    };
  }

  async getMonthlyAppointments(): Promise<number> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('user_id', user.id)
      .gte('appointment_date', startOfMonth.toISOString())
      .lte('appointment_date', endOfMonth.toISOString());

    if (error) {
      throw new Error(`Failed to fetch monthly appointments: ${error.message}`);
    }

    return data.length;
  }

  // Feedback Methods
  async getFeedback(clientId: string): Promise<ClientFeedback[]> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('client_feedback')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .order('feedback_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return data.map(fb => ({
      id: fb.id,
      clientId: fb.client_id,
      rating: fb.rating,
      feedbackText: fb.feedback_text || undefined,
      feedbackDate: new Date(fb.feedback_date),
    }));
  }

  async addFeedback(clientId: string, feedbackData: Omit<ClientFeedback, 'id' | 'clientId'>): Promise<ClientFeedback> {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('client_feedback')
      .insert({
        client_id: clientId,
        user_id: user.id,
        rating: feedbackData.rating,
        feedback_text: feedbackData.feedbackText || null,
        feedback_date: feedbackData.feedbackDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add feedback: ${error.message}`);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      rating: data.rating,
      feedbackText: data.feedback_text || undefined,
      feedbackDate: new Date(data.feedback_date),
    };
  }
}