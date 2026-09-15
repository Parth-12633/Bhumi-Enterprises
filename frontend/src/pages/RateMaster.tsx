import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Download, AlertCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const fetchRates = async () => {
  const { data } = await axios.get('/api/rates');
  return data.data;
};

const fetchSites = async () => {
  const { data } = await axios.get('/api/sites');
  return data.data;
};

const RateMaster = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [siteId, setSiteId] = useState('');
  const [workName, setWorkName] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [effectiveFrom, setEffectiveFrom] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: rates, isLoading } = useQuery({ queryKey: ['rates'], queryFn: fetchRates });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSites });

  const addRateMutation = useMutation({
    mutationFn: async (newRate: any) => {
      const { data } = await axios.post('/api/rates', newRate);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
      setShowAddForm(false);
      setSiteId('');
      setWorkName('');
      setRate('');
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId || !workName || !rate) return;
    addRateMutation.mutate({ siteId, workName, rate: Number(rate), effectiveFrom });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl font-sans text-gray-800">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rate Master</h1>
          <p className="text-gray-500 text-sm mt-1">Manage site-wise labour rates used automatically inside Daily Work Logs for employee payment calculations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} /> {showAddForm ? 'Cancel' : 'Add Rate'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-lg">Add New Rate</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Site</label>
              <select value={siteId} onChange={e => setSiteId(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white" required>
                <option value="">Select Site...</option>
                {sites?.filter((s:any) => s.status === 'ACTIVE').map((s:any) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Work Name</label>
              <input type="text" value={workName} onChange={e => setWorkName(e.target.value)} placeholder="e.g. Plastering" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Rate (₹)</label>
              <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Effective From</label>
              <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" required />
            </div>
          </div>
          <button type="submit" disabled={addRateMutation.isPending} className="self-start bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Save Rate
          </button>
        </form>
      )}

      {/* Enterprise Alert */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
        <div className="text-blue-600 mt-0.5">
          <AlertCircle size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">ENTERPRISE PAYROLL INTEGRITY RULE</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            Historical calculations never mutate. If an owner updates a rate (e.g. Plastering changing from ₹500 to ₹600 on Aug 10), all work logs logged prior continue using ₹500 via immutable Rate Snapshots. Only new daily logs automatically inherit ₹600.
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">SITE / PROJECT</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">WORK NAME</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-right">LABOUR RATE (₹)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">EFFECTIVE FROM</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-500">Loading rates...</td></tr>
              ) : rates?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-500">No rates defined. Add one above.</td></tr>
              ) : (
                rates?.map((r: any) => (
                  <tr key={r._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{r.siteId?.name || 'Unknown Site'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{r.workName}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-600">₹{r.rate}</td>
                    <td className="px-6 py-4 text-center text-xs text-gray-500 font-semibold">{format(new Date(r.effectiveFrom), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${r.status === 'ACTIVE' ? 'border-green-200 text-green-700 bg-white' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span> {r.status}
                      </span>
                    </td>
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

export default RateMaster;
