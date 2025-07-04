"use client";
import React, { useState, useEffect } from 'react';
import { TimeEntries, TimeEntry, calculateHours, calculateAmount } from '../../utils/TimeEntries';

interface TimeRangeFormProps {
  onSubmit?: (startTime: Date, endTime: Date) => void;
  className?: string;
}

const TimeRangeForm: React.FC<TimeRangeFormProps> = ({ 
  onSubmit,
  className = ""
}) => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Loading and error states for data fetching
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  // Fetch time entries on component mount
  useEffect(() => {
    async function fetchTimeEntries() {
      try {
        setLoading(true);
        const entries = await TimeEntries.getAll();
        setTimeEntries(entries);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching time entries:', err);
        setFetchError(err instanceof Error ? err.message : 'Failed to load time entries');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTimeEntries();
  }, []);
  const [showAddedAnimation, setShowAddedAnimation] = useState<string | null>(null);

  // We're now using the imported calculateHours and calculateAmount functions
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startTime || !endTime) {
      setError('Please select both start and end times');
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      setError('Start time must be before end time');
      return;
    }
    
    const totalHours = calculateHours(startDate, endDate);
    const amount = calculateAmount(totalHours);
    
    // Create new time entry
    // const newEntry: TimeEntry = {
    //   id: Date.now().toString(),
    //   startTime: startDate,
    //   endTime: endDate,
    //   totalHours,
    //   amount,
    //   isPaid: false // New entries are unpaid by default
    // };
    
    // Add to Supabase and update local state
    try {
      const savedEntry = await TimeEntries.add(
        startDate,
        endDate,
        totalHours,
        amount
      );
      
      // Add to entries list
      setTimeEntries(prev => [savedEntry, ...prev]);
      
      // Trigger animation for the new entry
      setShowAddedAnimation(savedEntry.id);
      setTimeout(() => setShowAddedAnimation(null), 1000);
      
      // Reset form
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time entry');
    }

    if (onSubmit) {
      onSubmit(startDate, endDate);
    }
  };

  const handleReset = () => {
    setStartTime('');
    setEndTime('');
    setError(null);
  };
  
  // Delete function removed as requested
  
  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Mark entry as paid (one-way transition)
  const markAsPaid = async (id: string) => {
    try {
      // Call Supabase RPC function
      const success = await TimeEntries.markAsPaid(id);
      
      if (success) {
        // Update local state if successful
        setTimeEntries(entries => 
          entries.map(entry => 
            entry.id === id ? { ...entry, isPaid: true, paid_at: new Date() } : entry
          )
        );
      }
    } catch (err) {
      console.error('Error marking entry as paid:', err);
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };
  
  // Sort entries to show unpaid first, then by date (newest first)
  const sortedTimeEntries = [...timeEntries].sort((a, b) => {
    // First sort by paid status (unpaid first)
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1;
    }
    // Then sort by date (newest first)
    return b.startTime.getTime() - a.startTime.getTime();
  });

  return (
    <div className={`bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-purple-100 text-purple-600 rounded-full p-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </span>
          <span className="text-white text-xl font-semibold">Time Range Filter</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Time */}
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-100">
              Start Time
            </label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50"
              required
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-100">
              End Time
            </label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/50"
              required
            />
          </div>
        </div>

        {/* Display selected range */}
        {startTime && endTime && (
          <>
            <hr className="my-4 border-gray-700" />
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-400 mb-2">Selected Range:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="font-medium text-gray-100">From:</span> {new Date(startTime).toLocaleString()}</p>
                <p><span className="font-medium text-gray-100">To:</span> {new Date(endTime).toLocaleString()}</p>
                <p><span className="font-medium text-gray-100">Duration:</span> {
                  Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24 * 10) / 100)
                } days</p>
                
                {/* Added total hours and amount calculations */}
                <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-100 block">Total Hours:</span>
                    <span className="text-white font-semibold text-lg">
                      {calculateHours(new Date(startTime), new Date(endTime)).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-100 block">Amount ($15/hr):</span>
                    <span className="text-green-400 font-bold text-lg">
                      ${calculateAmount(calculateHours(new Date(startTime), new Date(endTime))).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Apply Time Range
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Reset
          </button>
        </div>
      </form>
      
      {/* Time Entries Section - Always shown */}
      {loading ? (
        <div className="mt-8 py-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-3">Loading time entries...</p>
        </div>
      ) : fetchError ? (
        <div className="mt-8 bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-300">
          <p className="font-medium">Error loading time entries</p>
          <p className="text-sm mt-1">{fetchError}</p>
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-600 rounded-full p-1 mr-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </span>
            Time Entries
          </h3>
          
          <div className="space-y-4">
            {sortedTimeEntries.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400">No time entries found</p>
              <p className="text-sm text-gray-500 mt-2">Add your first entry using the form above</p>
            </div>
          ) : (
            sortedTimeEntries.map((entry) => (
              <div 
                key={entry.id} 
                className={`bg-gray-800 border ${showAddedAnimation === entry.id ? 'border-green-500 animate-pulse' : entry.isPaid ? 'border-gray-700' : 'border-yellow-500/50'} rounded-lg p-4 transition-all duration-300 hover:bg-gray-750`}
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-1 flex-grow">
                    <div>
                      <span className="text-xs text-purple-400 block">Start Time</span>
                      <span className="text-sm text-gray-200">{formatDate(entry.startTime)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-purple-400 block">End Time</span>
                      <span className="text-sm text-gray-200">{formatDate(entry.endTime)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-purple-400 block">Total Hours</span>
                      <span className="text-sm text-gray-200 font-medium">{entry.totalHours.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-purple-400 block">Amount</span>
                      <span className="text-sm text-green-400 font-bold">${entry.amount.toFixed(2)}</span>
                    </div>
                    <div className="col-span-2 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => !entry.isPaid && markAsPaid(entry.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 transition-all ${
                            entry.isPaid 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800/40 cursor-pointer'
                          }`
                          }
                        >
                          {entry.isPaid ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Paid
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Pending
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete button removed as requested */}
                </div>
              </div>
            ))
          )}
          </div>
          
          {/* Summary Card */}
          {timeEntries.length > 0 && (
            <div className="mt-6 bg-gray-800/70 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-purple-400 text-sm font-medium mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-3 mt-3">
                <div>
                  <span className="text-xs text-gray-400 block">Total Hours</span>
                  <span className="text-base text-white font-semibold">
                    {timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(1)}
                  </span>
                  <div className="mt-1">
                    <span className="text-xs text-gray-400 block">Unpaid Hours</span>
                    <span className="text-sm text-yellow-400 font-medium">
                      {timeEntries.filter(e => !e.isPaid).reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Total Amount</span>
                  <span className="text-base text-green-400 font-bold">
                    ${timeEntries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}
                  </span>
                  <div className="mt-1">
                    <span className="text-xs text-gray-400 block">Unpaid Amount</span>
                    <span className="text-sm text-yellow-400 font-bold">
                      ${timeEntries.filter(e => !e.isPaid).reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeRangeForm;
