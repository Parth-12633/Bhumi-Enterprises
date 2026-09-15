import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, User, Briefcase, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/employees/${id}`);
      return data.data;
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dailyRate: '',
    joinDate: '',
    photo: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        mobile: employee.mobile || '',
        dailyRate: employee.dailyRate ? (employee.dailyRate / 100).toString() : '',
        joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
        photo: employee.photo || ''
      });
    }
  }, [employee]);

  // WebRTC Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState<'FRONT' | 'BACK'>('FRONT');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = async (type: 'FRONT' | 'BACK') => {
    setCameraType(type);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: type === 'FRONT' ? 'user' : 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or no camera found.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setFormData({ ...formData, photo: dataUrl });
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const editEmployeeMutation = useMutation({
    mutationFn: async (updatedEmployee: any) => {
      const { data } = await axios.patch(`/api/employees/${id}`, updatedEmployee);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      navigate(`/employees/${id}`);
    },
    onError: (error: any) => {
      alert('Error updating employee: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      dailyRate: Number(formData.dailyRate) * 100 // Convert to paise
    };

    editEmployeeMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans text-gray-800">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Employee</h1>
          <p className="text-gray-500 text-sm mt-1">Update personal details for {employee?.name}.</p>
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
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => startCamera('FRONT')}
                    className="flex-1 bg-blue-50 text-blue-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Camera size={18} /> Front Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera('BACK')}
                    className="flex-1 bg-blue-50 text-blue-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Camera size={18} /> Back Camera
                  </button>
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
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={editEmployeeMutation.isPending}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={18} strokeWidth={2.5} />
            {editEmployeeMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* WebRTC Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-black rounded-3xl overflow-hidden flex flex-col items-center border border-gray-800">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={stopCamera}
                className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="w-full relative bg-gray-900 flex-1 min-h-[400px] flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
                style={{ transform: cameraType === 'FRONT' ? 'scaleX(-1)' : 'none' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-6 w-full flex justify-center bg-black">
              <button 
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center relative hover:bg-white/40 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEmployee;
