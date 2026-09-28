import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, MapPin, Edit, CheckCircle2, RotateCcw, X, Check } from 'lucide-react';
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

  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', location: '' });

  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ['site', id],
    queryFn: () => {
      return fetchSite(id as string).then(data => {
        setEditData({ name: data.name, location: data.location });
        return data;
      });
    }
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['siteWork', id, monthStr],
    queryFn: () => fetchSiteWork(id as string, monthStr)
  });

  const updateSiteMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const { data } = await axios.patch(`/api/sites/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site', id] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert('Error updating site: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleUpdateStatus = (newStatus: string) => {
    if (window.confirm(`Are you sure you want to change site status to ${newStatus}?`)) {
      updateSiteMutation.mutate({ status: newStatus });
    }
  };

  const handleSaveEdit = () => {
    updateSiteMutation.mutate(editData);
  };

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  if (siteLoading) return <div className="p-8 font-semibold text-gray-500">Loading site...</div>;

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center -mt-4 mb-2 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800 shrink-0">
             <ChevronLeft size={24} />
          </button>
          
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full">
              <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full sm:w-64 p-2 text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Site Name" />
              <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full sm:w-64 p-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Location" />
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-900">{site?.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {site?.status === 'ACTIVE' ? (
                  <span className="text-[10px] font-bold text-successGreen bg-green-50 px-2 py-0.5 rounded border border-green-200">Active</span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Completed</span>
                )}
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPin size={12} /> {site?.location || 'No location'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto ml-9 sm:ml-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={updateSiteMutation.isPending} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                <Check size={16} /> {updateSiteMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm transition-colors">
                <Edit size={16} /> Edit
              </button>
              
              {site?.status === 'ACTIVE' ? (
                <button onClick={() => handleUpdateStatus('COMPLETED')} className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm transition-colors">
                  <CheckCircle2 size={16} /> End Site
                </button>
              ) : (
                <button onClick={() => handleUpdateStatus('ACTIVE')} className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm transition-colors">
                  <RotateCcw size={16} /> Revert Site
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
        <button onClick={handlePrevMonth} className="text-xs text-gray-500 font-semibold hover:text-blue-600 flex items-center shrink-0">
          <ChevronLeft size={14} className="mr-1" /> Prev
        </button>
        <input 
          type="month" 
          value={monthStr} 
          onChange={e => {
            if (e.target.value) setCurrentDate(new Date(e.target.value + '-01'));
          }}
          className="font-bold text-lg text-gray-800 tracking-wide text-center bg-transparent border-none outline-none cursor-pointer hover:text-blue-600 transition-colors"
        />
        <button onClick={handleNextMonth} className="text-xs text-gray-500 font-semibold hover:text-blue-600 flex items-center shrink-0">
          Next <ChevronRight size={14} className="ml-1" />
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
                    <tr 
                      key={dateKey} 
                      onClick={() => navigate(`/daily-work?date=${dateKey}&siteId=${id}`)}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                      title="Click to view and edit all workers on this day"
                    >
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
