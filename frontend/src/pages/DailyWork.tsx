import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Users, UserPlus, Save } from 'lucide-react';

const fetchEmployees = async () => {
  const { data } = await axios.get('http://localhost:5000/api/employees');
  return data.data;
};

const fetchSites = async () => {
  const { data } = await axios.get('http://localhost:5000/api/sites');
  return data.data;
};

const DailyWork = () => {
  const queryClient = useQueryClient();
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [siteId, setSiteId] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  
  const [selectedHajris, setSelectedHajris] = useState<Record<string, number>>({});

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSites });

  const saveWorkMutation = useMutation({
    mutationFn: async (workData: any) => {
      const { data } = await axios.post('http://localhost:5000/api/work-records', workData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
    }
  });

  const handleHajriSelect = (empId: string, val: number) => {
    setSelectedHajris(prev => ({ ...prev, [empId]: val }));
  };

  const handleSaveAll = async () => {
    if (!siteId) {
      alert("Please select a site");
      return;
    }
    const promises = Object.entries(selectedHajris).map(([empId, hajri]) => {
      const emp = employees?.find((e: any) => e._id === empId);
      const rate = emp ? emp.dailyRate : 0;
      return saveWorkMutation.mutateAsync({
        employeeId: empId,
        siteId,
        date,
        hajri,
        rate,
        workDescription
      });
    });

    try {
      await Promise.all(promises);
      alert('Work saved successfully!');
      setSelectedHajris({});
    } catch (err) {
      alert('Error saving some records.');
    }
  };

  const activeWorkersCount = Object.keys(selectedHajris).length;
  const totalHajri = Object.values(selectedHajris).reduce((a, b) => a + b, 0);
  
  // Calculate Est. Cost
  let estCost = 0;
  if (employees) {
    Object.entries(selectedHajris).forEach(([empId, hajri]) => {
      const emp = employees.find((e: any) => e._id === empId);
      if (emp) {
        estCost += (emp.dailyRate / 100) * hajri;
      }
    });
  }

  const HAJRI_OPTIONS = [
    { label: '0', value: 0 },
    { label: '0.5', value: 0.5 },
    { label: '1', value: 1 },
    { label: '1.5', value: 1.5 },
    { label: '2', value: 2 },
    { label: '2.5', value: 2.5 },
    { label: '3', value: 3 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl h-full relative pb-[100px]">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900">Daily Work</h1>
        <p className="text-xs text-gray-500 font-medium mt-1">{format(new Date(), 'dd MMMM yyyy')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Site & Description */}
        <div className="w-full lg:w-[320px] flex flex-col gap-5">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SELECT SITE</label>
            <select 
              value={siteId} 
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full py-2 border-b-2 border-gray-100 focus:border-blue-600 outline-none text-sm font-semibold text-gray-800 bg-white cursor-pointer"
            >
              <option value="">Select a Site</option>
              {sites?.map((site: any) => (
                <option key={site._id} value={site._id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WORK DESCRIPTION</label>
            <textarea 
              placeholder="e.g. Brick Work, Concrete Pour..."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none text-sm resize-none h-24"
            />
          </div>

          <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors">
            <UserPlus size={18} /> Assign More Workers
          </button>
        </div>

        {/* Right Column - Assigned Workers */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-800">
              <Users size={18} /> <h2 className="font-bold text-lg">Assigned Workers</h2>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {activeWorkersCount} / {employees?.length || 0} Present
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {employees?.map((emp: any) => (
              <div key={emp._id} className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-gray-300">
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">{emp.name}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Worker • Rate: ₹{(emp.dailyRate / 100).toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex bg-gray-50 rounded-lg p-1.5 border border-gray-100 flex-wrap gap-1 w-full mt-2 sm:mt-0 sm:w-auto justify-center sm:justify-start">
                  {HAJRI_OPTIONS.map(opt => {
                    const isSelected = selectedHajris[emp._id] === opt.value;
                    return (
                      <button 
                        key={opt.value}
                        onClick={() => handleHajriSelect(emp._id, opt.value)}
                        className={`min-w-[44px] px-2 h-10 rounded-md font-bold text-sm flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                            : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] z-20">
        <div className="md:ml-[240px] px-4 md:px-8 py-4 max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-6 md:gap-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WORKERS</span>
              <span className="font-bold text-lg text-gray-900">{activeWorkersCount}</span>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL HAJRI</span>
              <span className="font-bold text-lg text-gray-900">{totalHajri}</span>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">EST. COST</span>
              <span className="font-bold text-lg text-blue-600">₹{estCost.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={handleSaveAll}
            disabled={activeWorkersCount === 0 || saveWorkMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md disabled:opacity-50 transition-colors"
          >
            <Save size={18} /> {saveWorkMutation.isPending ? 'SAVING...' : 'SAVE DAILY WORK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyWork;
