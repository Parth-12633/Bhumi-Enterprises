import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calculator, Users, MapPin, FileText, Settings, LogOut, Search, Moon, Bell, CalendarClock, IndianRupee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Sites', icon: MapPin, path: '/sites' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row font-sans text-gray-800">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-200 fixed inset-y-0 z-20 print:hidden">
        <div className="p-6 flex flex-col items-center justify-center border-b border-gray-100">
          {/* Mock Logo matching Hingu Tailors style */}
          <div className="text-4xl font-bold text-red-700 tracking-tighter mb-2 font-serif relative">
            <span className="text-blue-600 absolute -right-2 top-0">B</span>
            E
          </div>
          <h1 className="font-bold text-red-700 uppercase tracking-widest text-sm">Bhumi Enterprises</h1>
          <p className="text-[10px] text-blue-600 italic">Civil Contractor</p>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">MENU</p>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.name}
                to={item.path} 
                className={({isActive}) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                {({isActive}) => (
                  <>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-2">
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] print:ml-0 flex flex-col min-h-screen">
        
        {/* Topbar matching Hingu Tailors */}
        <header className="bg-white border-b border-gray-200 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 print:hidden">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-50 px-3 md:px-4 py-2 md:py-2.5 rounded-xl w-40 sm:w-64 md:w-96 border border-gray-100">
            <Search size={18} className="text-gray-400 mr-2 md:mr-3" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-xs md:text-sm w-full text-gray-700 placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/employees?search=${e.currentTarget.value}`);
                }
              }}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Moon size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 font-bold text-sm hidden sm:flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 sm:hidden flex items-center transition-colors"
            >
              <LogOut size={20} />
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1 md:mx-2"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user?.username}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm md:text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 print:p-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex justify-around p-2 z-30 pb-safe overflow-x-auto print:hidden">
        {navItems.map((item) => (
          <NavLink 
            key={item.name}
            to={item.path} 
            className={({isActive}) => `flex flex-col items-center p-2 rounded-lg min-w-[64px] ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
          >
            {({isActive}) => (
              <>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium whitespace-nowrap">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
