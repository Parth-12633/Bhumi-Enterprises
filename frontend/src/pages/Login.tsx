import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { username, password });
      if (data.success) {
        login(data.data);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-10">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Mock Logo matching Hingu Tailors style */}
          <div className="text-8xl font-bold text-red-700 tracking-tighter mb-2 font-serif relative h-28">
            <span className="text-brandBlue absolute -right-6 top-2 border-4 border-white bg-brandBlue text-white rounded-xl px-2 py-1 text-5xl">C</span>
            L
          </div>
          <h1 className="font-bold text-red-700 uppercase tracking-widest text-xl mt-4">Civil Ledger</h1>
          <p className="text-xs text-brandBlue italic border-t border-gray-200 pt-1 mt-1 px-4">Class of Contracting</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-2 tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue/20 focus:border-brandBlue outline-none text-sm transition-all"
              placeholder="admin@civilledger.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandBlue/20 focus:border-brandBlue outline-none text-sm transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1 mb-2">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-brandBlue border-gray-300 rounded focus:ring-brandBlue"
            />
            <label htmlFor="remember" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-brandBlue text-white p-3.5 rounded-xl font-bold hover:bg-brandBlue-dark transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
