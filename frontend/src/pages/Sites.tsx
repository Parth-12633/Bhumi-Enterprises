import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Search, Download } from 'lucide-react';

const fetchSites = async () => {
  const { data } = await axios.get('/api/sites');
  return data.data;
};

const Sites = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSite, setNewSite] = useState<any>({ name: '', location: '', startDate: '', endDate: '' });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ACTIVE');

  const { data: sites, isLoading } = useQuery({ queryKey: ['sites'], queryFn: fetchSites });

  const addSiteMutation = useMutation({
    mutationFn: async (siteData: any) => {
      const { data } = await axios.post('/api/sites', siteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setShowAddForm(false);
      setNewSite({ name: '', location: '' });
    },
    onError: (error: any) => {
      alert('Error adding site: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    addSiteMutation.mutate(newSite);
  };

  const filteredSites = sites?.filter((s: any) => 
    (activeTab === 'ALL' || s.status === activeTab) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sites & Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your active construction sites and historical projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} /> {showAddForm ? 'Cancel' : 'New Site'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSite} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">Add New Site</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Site Name <span className="text-red-500">*</span></label>
              <input required type="text" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Location</label>
              <input type="text" value={newSite.location} onChange={e => setNewSite({...newSite, location: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date</label>
              <input type="date" value={newSite.startDate} onChange={e => setNewSite({...newSite, startDate: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date (Auto-completes site)</label>
              <input type="date" value={newSite.endDate} onChange={e => setNewSite({...newSite, endDate: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={addSiteMutation.isPending} className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl self-start mt-2 shadow-sm hover:bg-blue-700 disabled:opacity-70">
            {addSiteMutation.isPending ? 'Saving...' : 'Save Site'}
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mt-2">
        {['ACTIVE', 'COMPLETED', 'ALL'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'ACTIVE' ? 'Active Projects' : tab === 'COMPLETED' ? 'Completed' : 'All Sites'}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mt-2">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search by name or location..."
              className="pl-9 pr-4 py-2 w-full rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">SITE DETAILS</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">LOCATION</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">STATUS</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : filteredSites?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No sites found.</td>
                </tr>
              ) : (
                filteredSites?.map((site: any, index: number) => (
                  <tr 
                    key={site._id} 
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sites/${site._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold overflow-hidden border border-blue-100">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{site.name}</p>
                          <p className="text-xs text-gray-500 font-medium">SIT-100{index + 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      {site.location || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        site.status === 'ACTIVE' 
                          ? 'bg-green-50 text-successGreen border border-green-100' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button 
                          className="hover:text-red-500 transition-colors" 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this site?')) {
                              try {
                                await axios.delete(`/api/sites/${site._id}`);
                                queryClient.invalidateQueries({ queryKey: ['sites'] });
                              } catch (error) {
                                alert('Error deleting site');
                              }
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="hover:text-blue-600 transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation();
                            // If they want to edit a site, it should go to site profile, but wait...
                            navigate(`/sites/${site._id}`);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
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

export default Sites;
