import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const EditPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const initialRecord = location.state?.record;

  const [date, setDate] = useState(initialRecord?.date ? format(new Date(initialRecord.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState(initialRecord ? (initialRecord.amount / 100).toString() : '');
  const [type, setType] = useState(initialRecord?.type || 'ADVANCE');
  const [paymentMethod, setPaymentMethod] = useState(initialRecord?.paymentMethod || 'CASH');
  const [note, setNote] = useState(initialRecord?.note || '');
  const [version, setVersion] = useState(initialRecord?.version || 0);
  const [reason, setReason] = useState('');

  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const { data } = await axios.patch(`/api/payments/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
      navigate(-1);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Update failed');
    }
  });

  const voidMutation = useMutation({
    mutationFn: async (voidData: { reason: string }) => {
      const { data } = await axios.post(`/api/payments/${id}/void`, voidData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
      navigate(-1);
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      date,
      amount: parseInt(amount) * 100,
      type,
      paymentMethod,
      note,
      version,
      reason
    });
  };

  const handleVoid = () => {
    if (window.confirm("Are you sure you want to VOID this payment? It will be removed from all financial calculations.")) {
      voidMutation.mutate({ reason: 'Voided by user from Edit screen' });
    }
  };

  if (!initialRecord) return <div className="p-4">Record data not found. Go back and select a payment to edit.</div>;

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Payment</h1>
        <button 
          type="button" 
          onClick={handleVoid}
          className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors"
        >
          <Trash2 size={16} /> VOID PAYMENT
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-bold bg-white"
          >
            <option value="ADVANCE">Advance</option>
            <option value="PAYMENT">Payment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xl font-bold"
            required min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Payment Method</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
          >
            <option value="CASH">CASH</option>
            <option value="ONLINE">ONLINE</option>
            <option value="UPI">UPI</option>
            <option value="BANK">BANK</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Note (Optional)</label>
          <input 
            type="text" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Edit (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Corrected amount"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 py-3 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-sm disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPayment;
