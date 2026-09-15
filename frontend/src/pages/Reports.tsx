import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

const fetchEmployees = async () => {
  const { data } = await axios.get('/api/employees');
  return data.data;
};

const fetchEmployeeReport = async (id: string, month: string) => {
  const { data } = await axios.get(`/api/reports/employee/${id}?month=${month}`);
  return data.data;
};

const Reports = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  const { data: report, isLoading } = useQuery({ 
    queryKey: ['report', employeeId, month], 
    queryFn: () => fetchEmployeeReport(employeeId, month),
    enabled: !!employeeId
  });

  const handleExportCSV = () => {
    if (!report) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Hajri,${report.totalHajri}\n`
      + `Total Earned,${report.totalEarned / 100}\n`
      + `Advance,${report.advance / 100}\n`
      + `Total Paid,${report.totalPaid / 100}\n`
      + `Balance,${report.balance / 100}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee_report_${employeeId}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Employee</label>
          <select 
            value={employeeId} 
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-semibold text-lg bg-white"
          >
            <option value="">Select Employee ▼</option>
            {employees?.map((emp: any) => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Month</label>
          <input 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-semibold text-lg"
          />
        </div>
      </div>

      {employeeId && (
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          {isLoading ? (
            <p>Loading report...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">Ledger Summary</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Total Hajri</div>
                  <div className="text-xl font-bold text-blue-600">{report?.totalHajri || 0}</div>
                </div>
                <div className="border p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Total Earned</div>
                  <div className="text-xl font-bold">₹{((report?.totalEarned || 0) / 100).toFixed(0)}</div>
                </div>
                <div className="border p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Advance</div>
                  <div className="text-xl font-bold">₹{((report?.advance || 0) / 100).toFixed(0)}</div>
                </div>
                <div className="border p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Balance</div>
                  <div className="text-xl font-bold text-red-600">₹{((report?.balance || 0) / 100).toFixed(0)}</div>
                </div>
              </div>

              <button 
                onClick={handleExportCSV}
                className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Download size={18} /> Export as CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
