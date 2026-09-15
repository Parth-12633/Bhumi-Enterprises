import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Users, Banknote, MapPin, Calendar, Download, TrendingUp, TrendingDown, Clock, Activity, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchDashboardData = async (todayStr: string) => {
  try {
    const monthStr = todayStr.substring(0, 7);
    const [employeesRes, sitesRes, workRes, monthWorkRes] = await Promise.all([
      axios.get('http://localhost:5000/api/employees'),
      axios.get('http://localhost:5000/api/sites'),
      axios.get(`http://localhost:5000/api/work-records?date=${todayStr}`),
      axios.get(`http://localhost:5000/api/work-records?month=${monthStr}`)
    ]);
    return {
      employees: employeesRes.data.data,
      sites: sitesRes.data.data,
      todayWork: workRes.data.data,
      monthWork: monthWorkRes.data.data,
    };
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    throw error;
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', todayStr],
    queryFn: () => fetchDashboardData(todayStr)
  });

  const activeSites = data?.sites?.filter((s: any) => s.status === 'ACTIVE') || [];
  const todayHajri = data?.todayWork?.reduce((acc: number, curr: any) => acc + curr.hajri, 0) || 0;
  const todayWorkers = new Set(data?.todayWork?.map((w: any) => w.employeeId) || []).size || 0;
  const todayCost = data?.todayWork?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  
  const monthCost = data?.monthWork?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

  // Site-wise Cost (Today)
  const siteWiseCost: Record<string, {name: string, cost: number, hajri: number}> = {};
  data?.todayWork?.forEach((w: any) => {
    const sId = w.siteId?._id || 'Unknown';
    if (!siteWiseCost[sId]) {
      siteWiseCost[sId] = { name: w.siteId?.name || 'Unknown', cost: 0, hajri: 0 };
    }
    siteWiseCost[sId].cost += w.amount;
    siteWiseCost[sId].hajri += w.hajri;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time business intelligence and performance metrics.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Card 1: Today's Labour Cost */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TODAY'S LABOUR COST</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Banknote size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ₹{isLoading ? '...' : (todayCost / 100).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-successGreen">
              <TrendingUp size={12} /> <span className="opacity-0">.</span>
            </div>
          </div>
        </div>

        {/* Card 2: This Month's Labour Cost */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MONTH'S LABOUR COST</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Banknote size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ₹{isLoading ? '...' : (monthCost / 100).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-successGreen">
              <TrendingUp size={12} />
            </div>
          </div>
        </div>

        {/* Card 3: Today's Total Hajri */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TODAY'S TOTAL HAJRI</span>
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? '...' : todayHajri}
            </div>
          </div>
        </div>

        {/* Card 4: Today's Workers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TODAY'S WORKERS</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? '...' : todayWorkers}
            </div>
          </div>
        </div>

        {/* Card 5: Active Sites */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ACTIVE SITES</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <MapPin size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {isLoading ? '...' : activeSites.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-2">
        
        {/* Today's Workers Detailed List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900">Today's Workers Detail</h3>
            <p className="text-xs text-gray-500 mt-1">Detailed list of attendance and cost for today.</p>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Site</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Hajri</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                   <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">Loading...</td></tr>
                ) : data?.todayWork?.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">No work records for today.</td></tr>
                ) : (
                  data?.todayWork?.map((w: any) => {
                    const empName = data?.employees?.find((e: any) => e._id === w.employeeId)?.name || 'Unknown';
                    return (
                      <tr key={w._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-sm text-gray-900">{empName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold bg-green-50 text-successGreen px-2 py-0.5 rounded border border-green-200">Present</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">{w.siteId?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-center font-bold text-sm text-gray-800">{w.hajri}</td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-blue-600">₹{(w.amount / 100).toLocaleString()}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Site-wise Labour Cost */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900">Site-wise Labour Cost</h3>
            <p className="text-xs text-gray-500 mt-1">Cost breakdown for today's active sites.</p>
          </div>
          <div className="flex-1 overflow-auto">
            {Object.keys(siteWiseCost).length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">No data available</div>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.values(siteWiseCost).map((site, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{site.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{site.hajri} Hajri Total</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 text-base block">₹{(site.cost / 100).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
