import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, subDays } from 'date-fns';
import { Download, Calculator, Users, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const fetchWorkRecords = async (queryParam: string) => {
  const { data } = await axios.get(`/api/work-records?${queryParam}`);
  return data.data;
};

const fetchEmployees = async () => {
  const { data } = await axios.get('/api/employees');
  return data.data;
};

const Reports = () => {
  const [periodType, setPeriodType] = useState<'TODAY' | 'YESTERDAY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('MONTHLY');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // States for selectors
  const [selectedWeekDate, setSelectedWeekDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  // Calculate the query string based on selected period
  const queryParam = useMemo(() => {
    let q = '';
    if (periodType === 'TODAY') {
      q = `date=${format(new Date(), 'yyyy-MM-dd')}`;
    } else if (periodType === 'YESTERDAY') {
      q = `date=${format(subDays(new Date(), 1), 'yyyy-MM-dd')}`;
    } else if (periodType === 'WEEKLY') {
      const date = new Date(selectedWeekDate);
      q = `startDate=${format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')}&endDate=${format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')}`;
    } else if (periodType === 'MONTHLY') {
      q = `month=${selectedMonth}`;
    } else if (periodType === 'YEARLY') {
      q = `month=${selectedYear}`; 
    } else {
      q = `startDate=${customStartDate}&endDate=${customEndDate}`;
    }
    
    if (selectedEmployee) {
      q += `&employeeId=${selectedEmployee}`;
    }
    
    return q;
  }, [periodType, selectedWeekDate, selectedMonth, selectedYear, customStartDate, customEndDate, selectedEmployee]);

  const { data: records, isLoading } = useQuery({ 
    queryKey: ['employeeReports', queryParam], 
    queryFn: () => fetchWorkRecords(queryParam)
  });

  // Group by employee
  const empStats = useMemo(() => {
    if (!records || !employees) return [];

    const statsMap: Record<string, { id: string, name: string, hajri: number, cost: number }> = {};

    // Pre-fill with all employees (so we show 0 hajri for those who didn't work)
    employees.forEach((emp: any) => {
      // If a specific employee is selected in the dropdown, only add them
      if (!selectedEmployee || selectedEmployee === emp._id) {
        statsMap[emp._id] = { id: emp._id, name: emp.name, hajri: 0, cost: 0 };
      }
    });

    records.forEach((record: any) => {
      const empId = record.employeeId?._id || 'unassigned';
      
      // If a specific employee is selected, ignore records that don't match
      if (selectedEmployee && selectedEmployee !== empId) return;

      if (!statsMap[empId]) {
        statsMap[empId] = { id: empId, name: record.employeeId?.name || 'Unknown', hajri: 0, cost: 0 };
      }
      
      statsMap[empId].hajri += record.hajri;
      statsMap[empId].cost += record.amount;
    });

    // Sort alphabetically by name, or by cost if you prefer. Alphabetical is usually better for a master list.
    return Object.values(statsMap).sort((a, b) => a.name.localeCompare(b.name)); 
  }, [records, employees, selectedEmployee]);

  const totalHajri = empStats.reduce((sum, e) => sum + e.hajri, 0);
  const totalCost = empStats.reduce((sum, e) => sum + e.cost, 0);

  const getDisplayDateText = () => {
    if (periodType === 'TODAY') {
      return `Today (${format(new Date(), 'dd MMM yyyy')})`;
    } else if (periodType === 'YESTERDAY') {
      return `Yesterday (${format(subDays(new Date(), 1), 'dd MMM yyyy')})`;
    } else if (periodType === 'WEEKLY') {
      const date = new Date(selectedWeekDate);
      if (isNaN(date.getTime())) return 'Invalid Week';
      const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd MMM yyyy');
      const end = format(endOfWeek(date, { weekStartsOn: 1 }), 'dd MMM yyyy');
      return `${start} to ${end}`;
    } else if (periodType === 'MONTHLY') {
      const date = new Date(selectedMonth + '-01');
      if (isNaN(date.getTime())) return 'Invalid Month';
      return format(date, 'MMMM yyyy');
    } else if (periodType === 'YEARLY') {
      return `Year ${selectedYear}`;
    } else {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const startStr = isNaN(start.getTime()) ? '...' : format(start, 'dd MMM yyyy');
      const endStr = isNaN(end.getTime()) ? '...' : format(end, 'dd MMM yyyy');
      return `${startStr} to ${endStr}`;
    }
  };

  const handleExportCSV = () => {
    if (empStats.length === 0) return;
    
    let csvContent = "Employee Name,Total Hajri,Total Earned (Rs)\n";
    empStats.forEach(emp => {
      csvContent += `"${emp.name}",${emp.hajri},${emp.cost / 100}\n`;
    });
    
    csvContent += `"GRAND TOTAL",${totalHajri},${totalCost / 100}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Employee_Analytics_${getDisplayDateText().replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl font-sans text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Calculate employee-wise total hajri and earnings.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={empStats.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Employee</label>
          <div className="relative w-full sm:w-1/2">
            <Users className="absolute left-3 top-3 text-gray-400" size={18} />
            <select 
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none font-semibold text-gray-700 bg-white"
            >
              <option value="">All Employees</option>
              {employees?.map((emp: any) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Report Period Type</label>
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl gap-1 sm:gap-0">
            {['TODAY', 'YESTERDAY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'].map(type => (
              <button 
                key={type}
                onClick={() => setPeriodType(type as any)}
                className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${periodType === type ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {(periodType !== 'TODAY' && periodType !== 'YESTERDAY') && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select {periodType.charAt(0) + periodType.slice(1).toLowerCase()} Range</label>
            {periodType === 'WEEKLY' && (
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-gray-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all sm:w-1/2">
                <button 
                  onClick={() => setSelectedWeekDate(format(subWeeks(new Date(selectedWeekDate), 1), 'yyyy-MM-dd'))}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex flex-col items-center flex-1">
                  <span className="text-sm font-bold text-gray-800">
                    {format(startOfWeek(new Date(selectedWeekDate), { weekStartsOn: 1 }), 'dd MMM')} - {format(endOfWeek(new Date(selectedWeekDate), { weekStartsOn: 1 }), 'dd MMM yyyy')}
                  </span>
                </div>
                
                <button 
                  onClick={() => setSelectedWeekDate(format(addWeeks(new Date(selectedWeekDate), 1), 'yyyy-MM-dd'))}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            {periodType === 'MONTHLY' && (
              <div className="relative sm:w-1/2">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none font-semibold text-gray-700"
                />
              </div>
            )}
            {periodType === 'YEARLY' && (
              <div className="relative sm:w-1/2">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none font-semibold text-gray-700 bg-white"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            )}
            {periodType === 'CUSTOM' && (
              <div className="flex gap-2 sm:w-1/2">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none font-semibold text-gray-700 bg-white text-sm"
                />
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none font-semibold text-gray-700 bg-white text-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Calculator size={64} />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest block mb-2">{getDisplayDateText()} TOTAL PAYOUT</span>
            <span className="text-4xl font-bold block">₹{(totalCost / 100).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{getDisplayDateText()} TOTAL HAJRI</span>
            <span className="text-4xl font-bold text-gray-900 block">{totalHajri}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <h2 className="font-bold text-gray-900 text-lg">Employee-Wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Hajri</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Earned</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                      Calculating data...
                    </div>
                  </td>
                </tr>
              ) : empStats.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium mb-1">No work records found for this period.</p>
                    <p className="text-sm text-gray-400">Try selecting a different date range.</p>
                  </td>
                </tr>
              ) : (
                empStats.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700 text-right">{emp.hajri}</td>
                    <td className="px-6 py-4 font-bold text-blue-600 text-right">₹{(emp.cost / 100).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
