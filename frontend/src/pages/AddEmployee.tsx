import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, User, Briefcase, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AddEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dailyRate: '',
    joinDate: new Date().toISOString().split('T')[0],
    photo: ''
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: any) => {
      const { data } = await axios.post('/api/employees', newEmployee);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: (error: any) => {
      alert('Error adding employee: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      dailyRate: Number(formData.dailyRate) * 100 // Convert to paise
    };

    addEmployeeMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans text-gray-800">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <Link to="/employees" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Employee</h1>
          <p className="text-gray-500 text-sm mt-1">Add a new worker to the ledger system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Form Sections */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Section 1: Basic Info */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={16} /> Basic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ramesh Patel"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-semibold">+91</span>
                  <input 
                    type="tel" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photo Upload UI */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={16} /> Employee Photo
            </h2>
            <div className="flex flex-col gap-4">
              {formData.photo ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: '' })}
                    className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-white shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, photo: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-2">Upload a profile photo (max 1MB). Mobile users can click to open camera.</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* Section 2: Payment & Work */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Briefcase size={16} /> Employment Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Daily Rate (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-bold">₹</span>
                  <input 
                    type="number" 
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="800"
                    className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Joining Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <Link to="/employees" className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={addEmployeeMutation.isPending}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={18} strokeWidth={2.5} />
            {addEmployeeMutation.isPending ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
