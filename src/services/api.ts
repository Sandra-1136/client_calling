import { Employee } from '../types/Employee';

// Simulated API service for employee calling system
export class ApiService {
  private static instance: ApiService;
  private employees: Employee[] = [];
  private userContacts: Employee[] = [];

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async getEmployees(): Promise<Employee[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.userContacts];
  }

  async callEmployee(employeeId: string): Promise<{ success: boolean; answered: boolean }> {
    // Simulate call with random response time (2-8 seconds) and 70% answer rate
    const callDuration = 2000 + Math.random() * 6000; // 2-8 seconds
    await new Promise(resolve => setTimeout(resolve, callDuration));
    
    const employee = this.userContacts.find(emp => emp.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // 70% chance of answering for realistic simulation
    const answered = Math.random() > 0.3;
    
    employee.callAttempts++;
    employee.lastCallTime = new Date();
    employee.status = answered ? 'answered' : 'missed';

    return { success: true, answered };
  }

  async updateEmployeeStatus(employeeId: string, status: Employee['status']): Promise<void> {
    const employee = this.userContacts.find(emp => emp.id === employeeId);
    if (employee) {
      employee.status = status;
    }
  }

  async resetAllStatuses(): Promise<void> {
    this.userContacts.forEach(emp => {
      emp.status = 'pending';
      emp.callAttempts = 0;
      emp.lastCallTime = undefined;
    });
  }

  async addContact(contactData: {
    name: string;
    phoneNumber: string;
  }): Promise<Employee> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for duplicates
    const phoneExists = this.userContacts.some(emp => emp.phoneNumber === contactData.phoneNumber);
    
    if (phoneExists) {
      throw new Error('Phone number already exists');
    }
    
    const newContact: Employee = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: contactData.name,
      phoneNumber: contactData.phoneNumber,
      email: 'Not provided',
      position: 'Not specified',
      department: 'Not specified',
      status: 'pending',
      callAttempts: 0,
      isDefault: false,
    };
    
    this.userContacts.push(newContact);
    return newContact;
  }

  async deleteContact(employeeId: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Delete user-added contacts
    const contactIndex = this.userContacts.findIndex(emp => emp.id === employeeId);
    if (contactIndex === -1) {
      throw new Error('Contact not found');
    }
    
    this.userContacts.splice(contactIndex, 1);
    return true;
  }

  async getContactStats(): Promise<{
    total: number;
    userContacts: number;
  }> {
    return {
      total: this.userContacts.length,
      userContacts: this.userContacts.length,
    };
  }

  async updatePriority(employeeId: string, priority: 'high' | 'follow-up' | 'not-interested'): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const contact = this.userContacts.find(emp => emp.id === employeeId);
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    contact.priority = priority;
  }
}