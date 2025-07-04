import { supabase } from './supabaseClient';

export interface TimeEntry {
  id: string;
  user_id?: string;
  startTime: Date;
  endTime: Date;
  totalHours: number;
  amount: number;
  isPaid: boolean;
  paid_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export const TimeEntries = {
  // Get all time entries for current user, sorted by payment status and date
  getAll: async (): Promise<TimeEntry[]> => {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('is_paid', { ascending: true }) // Unpaid first
      .order('start_time', { ascending: false }); // Newest first within groups
    
    if (error) {
      console.error('Error fetching time entries:', error);
      throw new Error(error.message);
    }
    
    // Convert database fields to our TimeEntry interface
    return (data || []).map(entry => ({
      id: entry.id,
      user_id: entry.user_id,
      startTime: new Date(entry.start_time),
      endTime: new Date(entry.end_time),
      totalHours: parseFloat(entry.total_hours),
      amount: parseFloat(entry.amount),
      isPaid: entry.is_paid,
      paid_at: entry.paid_at ? new Date(entry.paid_at) : null,
      created_at: new Date(entry.created_at),
      updated_at: new Date(entry.updated_at)
    }));
  },
  
  // Add a new time entry with hardcoded 'sai' user_id
  add: async (startTime: Date, endTime: Date, totalHours: number, amount: number): Promise<TimeEntry> => {
    // Hard-coded UUID for 'sai' user
    // This is a randomly generated UUID - you can replace it with any valid UUID
    const SAI_USER_ID = '12345678-1234-1234-1234-123456789012';
    
    const { data, error } = await supabase
      .from('time_entries')
      .insert([
        {
          user_id: SAI_USER_ID,  // Using hardcoded user_id
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          total_hours: totalHours,
          amount: amount,
          is_paid: false // Default to unpaid
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding time entry:', error);
      throw new Error(error.message);
    }
    
    // Convert from database fields to our interface
    return {
      id: data.id,
      user_id: data.user_id,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      totalHours: parseFloat(data.total_hours),
      amount: parseFloat(data.amount),
      isPaid: data.is_paid,
      paid_at: data.paid_at ? new Date(data.paid_at) : null,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  },
  
  // Mark an entry as paid (one-way transition) with direct update
  markAsPaid: async (id: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('is_paid', false) // Only update if currently not paid
      .select();
    
    if (error) {
      console.error('Error marking entry as paid:', error);
      throw new Error(error.message);
    }
    
    // If data exists and has length, it means the update was successful
    return Boolean(data && data.length > 0);
  },
  
  // Calculate totals for all entries
  calculateSummary: (entries: TimeEntry[]) => {
    const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const unpaidHours = entries
      .filter(entry => !entry.isPaid)
      .reduce((sum, entry) => sum + entry.totalHours, 0);
    const unpaidAmount = entries
      .filter(entry => !entry.isPaid)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return {
      totalHours,
      totalAmount,
      unpaidHours,
      unpaidAmount,
      entryCount: entries.length,
      unpaidCount: entries.filter(entry => !entry.isPaid).length
    };
  }
};

// Helper function to calculate hours between two dates
export const calculateHours = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return parseFloat(diffHours.toFixed(2));
};

// Helper function to calculate amount based on hours
export const calculateAmount = (hours: number, hourlyRate = 15): number => {
  return parseFloat((hours * hourlyRate).toFixed(2));
};