import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Trash2, Edit2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const fetchEmployees = async () => {
  const { data } = await axios.get('/api/employees');
  return data.data;
};

const EmployeesList = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const navigate = useNavigate();
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });

  useEffect(() => {
    if (searchParams.get('search') !== null) {
      setSearch(searchParams.get('search') || '');
    }
  }, [searchParams]);

  const filteredEmployees = employees?.filter((e: any) => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl font-sans text-gray-800">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee information, personal details, contact, role, and joining status.</p>
        </div>
        <Link to="/add-employee" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
          <Plus size={16} strokeWidth={2.5} /> New Employee
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search by name or mobile..."
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
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">EMPLOYEE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">ROLE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">MOBILE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">PAY STRUCTURE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : filteredEmployees?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No employees found.</td>
                </tr>
              ) : (
                filteredEmployees?.map((employee: any, index: number) => (
                  <tr 
                    key={employee._id} 
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/employees/${employee._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {employee.photo ? (
                          <img src={employee.photo} alt={employee.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500 font-medium">EMP-100{index + 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        Worker
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      {employee.mobile || '9999999999'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-successGreen border border-green-100">
                        ₹{(employee.dailyRate / 100).toFixed(0)} / day
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button 
                          className="hover:text-red-500 transition-colors" 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this employee?')) {
                              try {
                                await axios.delete(`/api/employees/${employee._id}`);
                                queryClient.invalidateQueries({ queryKey: ['employees'] });
                              } catch (error) {
                                alert('Error deleting employee');
                              }
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="hover:text-gray-700 transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employees/${employee._id}/edit`);
                          }}
                        >
                          <Edit2 size={16} />
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

export default EmployeesList;
