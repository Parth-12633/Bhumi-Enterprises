import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';

const fetchSite = async (id: string) => {
  const { data } = await axios.get(`/api/sites/${id}`);
  return data.data;
};

const fetchSiteWork = async (id: string, month: string) => {
  const { data } = await axios.get(`/api/work-records?siteId=${id}&month=${month}`);
  return data.data;
};

const SiteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStr = format(currentDate, 'yyyy-MM');
  const displayMonth = format(currentDate, 'MMMM yyyy').toUpperCase();
  const prevMonthStr = format(subMonths(currentDate, 1), 'MMMM yyyy');
  const nextMonthStr = format(addMonths(currentDate, 1), 'MMMM yyyy');

  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ['site', id],
    queryFn: () => fetchSite(id as string)
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['siteWork', id, monthStr],
    queryFn: () => fetchSiteWork(id as string, monthStr)
  });

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  if (siteLoading) return <div className="p-8">Loading site...</div>;

  // Group records by date
  const groupedRecords: Record<string, any> = {};
  let totalSiteHajri = 0;
  let totalSiteCost = 0;

  if (records) {
    records.forEach((record: any) => {
      const dateKey = record.date;
      if (!groupedRecords[dateKey]) {
        groupedRecords[dateKey] = {
          date: dateKey,
          workers: 0,
          hajri: 0,
          cost: 0
        };
      }
      groupedRecords[dateKey].workers += 1;
      groupedRecords[dateKey].hajri += record.hajri;
      groupedRecords[dateKey].cost += record.amount;
      
      totalSiteHajri += record.hajri;
      totalSiteCost += record.amount;
    });
  }

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex justify-between items-center -mt-4 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800">
             <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{site?.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {site?.status === 'ACTIVE' ? (
                <span className="text-[10px] font-bold text-successGreen bg-green-50 px-2 py-0.5 rounded border border-green-200">Active</span>
              ) : (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Inactive</span>
              )}
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPin size={12} /> {site?.location || 'No location'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
        <button onClick={handlePrevMonth} className="text-xs text-gray-500 font-semibold hover:text-blue-600 flex items-center">
          <ChevronLeft size={14} className="mr-1" /> {prevMonthStr}
        </button>
        <span className="font-bold text-lg text-gray-800 tracking-wide">{displayMonth}</span>
        <button onClick={handleNextMonth} className="text-xs text-gray-500 font-semibold hover:text-blue-600 flex items-center">
          {nextMonthStr} <ChevronRight size={14} className="ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">MONTHLY LABOUR EXPENSE</span>
          <span className="text-3xl font-bold text-blue-600 mb-1">
            ₹{(totalSiteCost / 100).toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">MONTHLY TOTAL HAJRI</span>
          <span className="text-3xl font-bold text-gray-800 mb-1">
            {totalSiteHajri}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">SITE DAILY WORK HISTORY</h2>
        <div className="flex flex-col gap-3">
          {recordsLoading ? (
             <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">Loading...</div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl">No records for this month.</div>
          ) : (
            <table className="w-full text-left border-collapse bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Workers</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hajri</th>
                  <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider text-right">Labour Cost</th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.map((dateKey) => {
                  const dayData = groupedRecords[dateKey];
                  return (
                    <tr key={dateKey} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-bold text-sm text-gray-900">{format(new Date(dateKey), 'dd MMM yyyy')}</td>
                      <td className="p-4 text-sm font-semibold text-gray-700">{dayData.workers}</td>
                      <td className="p-4 text-sm font-semibold text-gray-700">{dayData.hajri}</td>
                      <td className="p-4 font-bold text-lg text-blue-600 text-right">₹{(dayData.cost / 100).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteProfile;
