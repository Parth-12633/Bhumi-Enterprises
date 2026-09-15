import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

const fetchSites = async () => {
  const { data } = await axios.get('/api/sites');
  return data.data;
};

const EditWorkRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Try to get the initial record from router state (passed from EmployeeProfile)
  const initialRecord = location.state?.record;

  const [hajri, setHajri] = useState(initialRecord?.hajri || 0);
  const [siteId, setSiteId] = useState(initialRecord?.siteId?._id || '');
  const [workDescription, setWorkDescription] = useState(initialRecord?.workDescription || '');
  const [version, setVersion] = useState(initialRecord?.version || 0);
  const [reason, setReason] = useState('');

  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSites });

  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const { data } = await axios.patch(`/api/work-records/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      navigate(-1);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Update failed');
    }
  });

  const voidMutation = useMutation({
    mutationFn: async (voidData: { reason: string }) => {
      const { data } = await axios.post(`/api/work-records/${id}/void`, voidData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      navigate(-1);
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      hajri: Number(hajri),
      siteId,
      workDescription,
      version,
      reason
    });
  };

  const handleVoid = () => {
    if (window.confirm("Are you sure you want to VOID this record? It will be removed from all calculations.")) {
      voidMutation.mutate({ reason: 'Voided by user from Edit screen' });
    }
  };

  if (!initialRecord) {
    return <div className="p-4">Record data not found. Please navigate from the Profile page.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Work Record</h1>
        <button 
          type="button" 
          onClick={handleVoid}
          className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors"
        >
          <Trash2 size={16} /> VOID RECORD
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Hajri</label>
          <select 
            value={hajri} 
            onChange={(e) => setHajri(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-lg font-bold"
          >
            {[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Site</label>
          <select 
            value={siteId} 
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-contractorBlue outline-none"
          >
            <option value="">Select a Site ▼</option>
            {sites?.map((site: any) => (
              <option key={site._id} value={site._id}>{site.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Work Description</label>
          <input 
            type="text" 
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-contractorBlue outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Edit (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Forgot half hajri"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-contractorBlue outline-none"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 bg-contractorBlue text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditWorkRecord;
