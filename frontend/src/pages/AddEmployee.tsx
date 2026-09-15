import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, User, Briefcase, Camera, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AddEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dailyRate: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [frontPhotoPreview, setFrontPhotoPreview] = useState<string | null>(null);
  const [backPhotoPreview, setBackPhotoPreview] = useState<string | null>(null);

  // WebRTC Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState<'FRONT' | 'BACK'>('FRONT');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        if (cameraType === 'FRONT') setFrontPhotoPreview(dataUrl);
        else setBackPhotoPreview(dataUrl);
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
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                type="button" 
                onClick={() => startCamera('FRONT')}
                className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all text-gray-500 relative overflow-hidden min-h-[150px]"
              >
                {frontPhotoPreview ? (
                  <img src={frontPhotoPreview} alt="Selfie Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-2xl mb-2">🤳</span>
                    <span className="text-sm font-bold text-center text-blue-600">Open Front Camera<br/><span className="text-[10px] text-gray-400 font-normal">(Selfie)</span></span>
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => startCamera('BACK')}
                className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all text-gray-500 relative overflow-hidden min-h-[150px]"
              >
                {backPhotoPreview ? (
                  <img src={backPhotoPreview} alt="Document Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-2xl mb-2">📸</span>
                    <span className="text-sm font-bold text-center text-blue-600">Open Back Camera<br/><span className="text-[10px] text-gray-400 font-normal">(Document/Photo)</span></span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-blue-500 font-semibold mt-3 text-center bg-blue-50 py-2 rounded-lg">* Note: Clicking these buttons will open the live camera directly on screen.</p>
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

export default AddEmployee;
