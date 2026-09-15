import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const fetchEmployees = async () => {
  const { data } = await axios.get('/api/employees');
  return data.data;
};

const Payments = () => {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ADVANCE');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  const savePaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const { data } = await axios.post('/api/payments', paymentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      alert('Payment saved successfully!');
      // Reset form
      setAmount('');
      setNote('');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !amount) return;
    
    // amount in paise
    const amountInPaise = parseInt(amount) * 100;
    
    savePaymentMutation.mutate({
      employeeId,
      amount: amountInPaise,
      type,
      paymentMethod,
      date,
      note
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Payment / Advance</h1>

      <form onSubmit={handleSave} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Employee</label>
          <select 
            value={employeeId} 
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brandBrown outline-none font-semibold text-lg bg-white"
            required
          >
            <option value="">Select Employee ▼</option>
            {employees?.map((emp: any) => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brandBrown outline-none font-semibold text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setType('ADVANCE')}
              className={`flex-1 py-3 rounded-lg font-bold border-2 ${type === 'ADVANCE' ? 'bg-brandBrown text-white border-brandBrown' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Advance
            </button>
            <button 
              type="button"
              onClick={() => setType('PAYMENT')}
              className={`flex-1 py-3 rounded-lg font-bold border-2 ${type === 'PAYMENT' ? 'bg-brandBrown text-white border-brandBrown' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Payment
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brandBrown outline-none text-2xl font-bold"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Method</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brandBrown outline-none bg-white"
          >
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
            <option value="BANK">BANK</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Note (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Personal advance"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brandBrown outline-none"
          />
        </div>

        <button 
          type="submit"
          disabled={savePaymentMutation.isPending}
          className="w-full bg-brandBrown text-white py-4 mt-2 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50"
        >
          {savePaymentMutation.isPending ? 'SAVING...' : 'SAVE PAYMENT'}
        </button>
      </form>
    </div>
  );
};

export default Payments;
