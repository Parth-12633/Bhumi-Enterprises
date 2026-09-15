import React from 'react';
import { format } from 'date-fns';
import { Building2, IndianRupee, MapPin, CalendarDays, Receipt } from 'lucide-react';

interface WorkerStatementPDFProps {
  employee: any;
  displayMonth: string;
  report: any;
  siteWiseHajri: Record<string, number>;
  records: any[];
  getHajriDisplay: (val: number) => string;
}

const WorkerStatementPDF: React.FC<WorkerStatementPDFProps> = ({
  employee,
  displayMonth,
  report,
  siteWiseHajri,
  records,
  getHajriDisplay
}) => {
  // Sort records by date ascending
  const sortedRecords = records ? [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <div className="w-full bg-white font-sans text-gray-800 p-8 print:p-0 mx-auto" style={{ maxWidth: '210mm' }}>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end border-b-2 border-[#1e3a8a] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1e3a8a] text-white flex items-center justify-center rounded-lg shadow-sm">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight uppercase leading-none mb-1">
              Bhumi Enterprises
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Building Tomorrow Together
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col gap-1 items-end">
          <div className="bg-[#f0f9ff] text-[#0369a1] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#e0f2fe]">
            Worker Attendance & Payment Statement
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-1">Safe Work • On Time • Together</p>
        </div>
      </div>

      {/* EMPLOYEE DETAILS SECTION */}
      <div className="border-2 border-[#1e3a8a] rounded-xl overflow-hidden mb-6">
        <div className="bg-[#1e3a8a] text-white px-4 py-2 flex items-center gap-2">
          <UserIcon />
          <h2 className="text-sm font-bold uppercase tracking-widest">Employee Details</h2>
        </div>
        <div className="p-4 bg-[#f8fafc] grid grid-cols-2 gap-x-12 gap-y-3">
          <div className="grid grid-cols-[100px_10px_1fr] text-sm items-center">
            <span className="text-gray-500 font-semibold">Name</span>
            <span className="text-gray-400">:</span>
            <span className="font-bold text-gray-900">{employee?.name}</span>
            
            <span className="text-gray-500 font-semibold mt-2">Card No.</span>
            <span className="text-gray-400 mt-2">:</span>
            <span className="font-bold text-gray-900 mt-2 uppercase">{employee?._id?.substring(0, 8)}</span>
            
            <span className="text-gray-500 font-semibold mt-2">Mobile</span>
            <span className="text-gray-400 mt-2">:</span>
            <span className="font-bold text-gray-900 mt-2">{employee?.mobile || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-[100px_10px_1fr] text-sm items-center">
            <span className="text-gray-500 font-semibold">Month</span>
            <span className="text-gray-400">:</span>
            <span className="font-bold text-gray-900">{displayMonth}</span>
            
            <span className="text-gray-500 font-semibold mt-2">Base Rate</span>
            <span className="text-gray-400 mt-2">:</span>
            <span className="font-bold text-gray-900 mt-2">₹{(employee?.dailyRate / 100 || 0).toLocaleString()} / Day</span>
            
            <span className="text-gray-500 font-semibold mt-2">Active Sites</span>
            <span className="text-gray-400 mt-2">:</span>
            <span className="font-bold text-gray-900 mt-2 truncate">{Object.keys(siteWiseHajri).join(', ') || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* DAILY ATTENDANCE TABLE */}
      <div className="border-2 border-[#1e3a8a] rounded-xl overflow-hidden mb-6">
        <div className="bg-[#1e3a8a] text-white px-4 py-2 flex items-center gap-2">
          <CalendarDays size={16} />
          <h2 className="text-sm font-bold uppercase tracking-widest">Daily Attendance & Work Details</h2>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#f1f5f9] border-b-2 border-[#1e3a8a]">
            <tr>
              <th className="p-3 font-bold text-[#1e3a8a] w-[15%]">Date</th>
              <th className="p-3 font-bold text-[#1e3a8a] text-center w-[12%]">Hajri</th>
              <th className="p-3 font-bold text-[#1e3a8a] text-right w-[15%]">Advance (₹)</th>
              <th className="p-3 font-bold text-[#1e3a8a] w-[18%]">Site Name</th>
              <th className="p-3 font-bold text-[#1e3a8a] w-[40%]">Work Description</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500 font-medium italic">No attendance records found for {displayMonth}</td>
              </tr>
            ) : (
              sortedRecords.map((record, index) => {
                const isPayment = record.type === 'PAYMENT' || record.type === 'ADVANCE';
                const dateStr = format(new Date(record.date), 'dd-MMM-yy');
                
                // Determine Hajri Badge Style
                let badgeClass = "bg-gray-100 text-gray-600";
                let hajriText = "-";
                
                if (!isPayment) {
                  hajriText = getHajriDisplay(record.hajri);
                  if (hajriText === 'PP' || hajriText === 'P') badgeClass = "bg-green-100 text-green-700 border border-green-200";
                  else if (hajriText === 'A') badgeClass = "bg-red-100 text-red-700 border border-red-200";
                  else if (record.hajri > 0) badgeClass = "bg-blue-100 text-blue-700 border border-blue-200";
                }

                return (
                  <tr key={record._id || index} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700 align-top">{dateStr}</td>
                    <td className="p-3 text-center align-top">
                      {isPayment ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] uppercase tracking-wider ${badgeClass}`}>
                          {hajriText}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900 align-top">
                      {isPayment && record.type === 'ADVANCE' ? (record.amount / 100).toLocaleString() : '-'}
                    </td>
                    <td className="p-3 text-gray-700 font-medium align-top">
                      {!isPayment ? (record.siteId?.name || '-') : '-'}
                    </td>
                    <td className="p-3 text-gray-600 leading-snug align-top break-words">
                      {isPayment ? record.note : (record.workDescription || 'No work description')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* SUMMARY & PAYMENT DETAILS (Keep them together to prevent breaking) */}
      <div className="grid grid-cols-2 gap-6" style={{ pageBreakInside: 'avoid' }}>
        
        {/* LEFT: ATTENDANCE SUMMARY */}
        <div className="border-2 border-[#1e3a8a] rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#f1f5f9] text-[#1e3a8a] px-4 py-3 flex items-center gap-2 border-b-2 border-[#1e3a8a]">
            <Receipt size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Attendance Summary</h2>
          </div>
          <div className="p-5 bg-white flex-1 flex flex-col gap-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 font-semibold">
                <CalendarDays size={16} className="text-blue-500"/> Total Hajri
              </div>
              <span className="text-lg font-black text-blue-600">{report?.totalHajri || 0} <span className="text-xs text-gray-500 font-normal">Days</span></span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 font-semibold">
                <IndianRupee size={16} className="text-orange-500"/> Total Advance Taken
              </div>
              <span className="text-lg font-black text-gray-900">₹{(report?.advance / 100 || 0).toLocaleString()}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 font-semibold mb-2">
                <MapPin size={16} className="text-purple-500"/> Site-Wise Hajri Breakdown
              </div>
              <div className="pl-6 flex flex-col gap-1.5">
                {Object.entries(siteWiseHajri).length > 0 ? (
                  Object.entries(siteWiseHajri).map(([site, count]) => (
                    <div key={site} className="flex justify-between text-sm">
                      <span className="text-gray-500">{site}</span>
                      <span className="font-bold text-gray-700">{count} Days</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No site data</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: PAYMENT DETAILS */}
        <div className="border-2 border-[#166534] rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#166534] text-white px-4 py-3 flex items-center gap-2">
            <IndianRupee size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Payment Details</h2>
          </div>
          <div className="p-5 bg-[#f0fdf4] flex-1 flex flex-col justify-between">
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">Total Earnings</p>
                  <p className="text-xs text-gray-500 mt-0.5">({report?.totalHajri || 0} Days × ₹{(employee?.dailyRate / 100 || 0).toLocaleString()})</p>
                </div>
                <span className="text-lg font-black text-gray-900">₹{(report?.totalEarned / 100 || 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-red-600">Less: Advances Deducted</p>
                </div>
                <span className="text-lg font-black text-red-600">₹{(report?.advance / 100 || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 bg-[#166534] text-white rounded-xl p-4 flex justify-between items-center shadow-md">
              <div>
                <p className="font-bold text-lg uppercase tracking-wider">Final Payable</p>
                <p className="text-xs text-green-200 mt-0.5">(Total Earnings - Advance)</p>
              </div>
              <span className="text-3xl font-black">₹{(report?.balance / 100 || 0).toLocaleString()}</span>
            </div>

          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center text-sm text-gray-400 font-medium" style={{ pageBreakInside: 'avoid' }}>
        <p className="mb-2 italic text-[#1e3a8a]">"Thank you for your hard work and contribution!"</p>
        <p>Generated by Bhumi Enterprises ERP System on {format(new Date(), 'dd-MMM-yyyy hh:mm a')}</p>
        <p className="text-xs mt-1">Please verify the attendance and payment details with the site supervisor.</p>
      </div>

    </div>
  );
};

// Helper User Icon
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default WorkerStatementPDF;
