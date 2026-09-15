import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Edit2, Plus, Banknote, Calendar, CreditCard, Clock, CheckCircle2, Download, FileText, User } from 'lucide-react';
import WorkerStatementPDF from '../components/WorkerStatementPDF';
import { format, subMonths, addMonths, getDaysInMonth } from 'date-fns';

const fetchEmployee = async (id: string) => {
  const { data } = await axios.get(`/api/employees/${id}`);
  return data.data;
};

const fetchReport = async (id: string, month: string) => {
  const { data } = await axios.get(`/api/reports/employee/${id}?month=${month}`);
  return data.data;
};

const fetchWorkRecords = async (id: string, month: string) => {
  const { data } = await axios.get(`/api/work-records?employeeId=${id}&month=${month}`);
  return data.data;
};

const fetchSites = async () => {
  const { data } = await axios.get('/api/sites');
  return data.data;
};

export const getHajriDisplay = (hajri: number) => {
  if (hajri === 0 || !hajri) return 'A';
  
  const whole = Math.floor(hajri);
  const frac = hajri - whole;
  
  let result = '';
  for (let i = 0; i < whole; i++) {
    result += 'P';
  }
  
  if (frac === 0.25) result += '|';
  else if (frac === 0.5) result += '||';
  else if (frac === 0.75) result += '|||';
  
  return result;
};

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStr = format(currentDate, 'yyyy-MM');
  const displayMonth = format(currentDate, 'MMMM yyyy').toUpperCase();
  const prevMonthStr = format(subMonths(currentDate, 1), 'MMMM yyyy');
  const nextMonthStr = format(addMonths(currentDate, 1), 'MMMM yyyy');

  const { data: employee, isLoading: empLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployee(id as string)
  });

  const { data: report } = useQuery({
    queryKey: ['report', id, monthStr],
    queryFn: () => fetchReport(id as string, monthStr)
  });

  const { data: records } = useQuery({
    queryKey: ['workRecords', id, monthStr],
    queryFn: () => fetchWorkRecords(id as string, monthStr)
  });

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  const { data: rates } = useQuery({
    queryKey: ['rates'],
    queryFn: async () => {
      const { data } = await axios.get('/api/rates');
      return data.data;
    }
  });

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  const [activeTab, setActiveTab] = useState<'LOG' | 'PAY' | 'HISTORY'>('LOG');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Form states for Quick Log
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logSite, setLogSite] = useState('');
  const [logWork, setLogWork] = useState('');
  const [logHajriWhole, setLogHajriWhole] = useState<number>(1);
  const [logHajriFrac, setLogHajriFrac] = useState<number>(0);
  const logHajri = logHajriWhole + logHajriFrac;
  const [logRate, setLogRate] = useState<number | ''>('');

  useEffect(() => {
    let matchedRate = false;
    if (logSite && logWork && rates) {
      const specificRate = rates.find((r: any) => 
        r.siteId?._id === logSite && 
        r.workName.toLowerCase() === logWork.toLowerCase() &&
        r.status === 'ACTIVE'
      );
      if (specificRate) {
        setLogRate(specificRate.rate);
        matchedRate = true;
      }
    }
    
    if (!matchedRate && employee) {
      setLogRate(employee.dailyRate / 100);
    }
  }, [logSite, logWork, employee, rates]);

  // Form states for Pay
  const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');

  const saveWorkMutation = useMutation({
    mutationFn: async (workData: any) => {
      const { data } = await axios.post('/api/work-records', workData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      alert('Work logged successfully!');
      setLogWork('');
    },
    onError: (error: any) => {
      alert('Error saving work: ' + (error.response?.data?.message || error.message));
    }
  });

  const savePayMutation = useMutation({
    mutationFn: async (payData: any) => {
      const { data } = await axios.post('/api/payments', payData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workRecords'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      alert('Payment added successfully!');
      setPayAmount('');
    },
    onError: (error: any) => {
      alert('Error saving payment: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSite || logHajri === undefined || !logRate) return;
    saveWorkMutation.mutate({
      employeeId: id,
      siteId: logSite,
      date: logDate,
      hajri: logHajri,
      workDescription: logWork,
      rate: logRate * 100
    });
  };

  const handleAddPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;
    savePayMutation.mutate({
      employeeId: id,
      amount: parseInt(payAmount) * 100,
      type: 'ADVANCE',
      paymentMethod: payMethod,
      date: payDate
    });
  };

  if (empLoading) return <div className="p-8 text-gray-500 font-semibold">Loading profile...</div>;

  const daysInMonthCount = getDaysInMonth(currentDate);
  const calendarDays = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  const getRecordForDay = (day: number) => {
    if (!records) return { hajri: 'A', advance: '', remarks: '' };
    const dayRecords = records.filter((r: any) => new Date(r.date).getDate() === day);
    const hajris = dayRecords.filter((r: any) => r.type !== 'PAYMENT' && r.type !== 'ADVANCE');
    const payments = dayRecords.filter((r: any) => r.type === 'PAYMENT' || r.type === 'ADVANCE');
    
    let hajriStr = 'A';
    const totalHajri = hajris.reduce((sum: number, r: any) => sum + r.hajri, 0);
    if (totalHajri > 0) hajriStr = getHajriDisplay(totalHajri);

    let advanceStr = '';
    const totalAdvance = payments.reduce((sum: number, r: any) => sum + r.amount, 0);
    if (totalAdvance > 0) advanceStr = (totalAdvance / 100).toString();

    const remarksStr = dayRecords.map((r: any) => {
      if (r.type === 'PAYMENT' || r.type === 'ADVANCE') return r.note;
      
      const sitePart = r.siteId?.name || '';
      const workPart = r.workDescription || '';
      
      if (sitePart && workPart) return `${sitePart} - ${workPart}`;
      return sitePart || workPart;
    }).filter(Boolean).join(', ');

    return { hajri: hajriStr, advance: advanceStr, remarks: remarksStr };
  };

  const siteWiseHajri = records ? records.reduce((acc: any, record: any) => {
    if (record.type === 'PAYMENT' || record.type === 'ADVANCE') return acc;
    if (!record.hajri) return acc;
    const siteName = record.siteId?.name || 'Unknown Site';
    acc[siteName] = (acc[siteName] || 0) + record.hajri;
    return acc;
  }, {}) : {};

  return (
    <>
    <div className={`flex flex-col gap-6 max-w-5xl mx-auto font-sans text-gray-800 ${showPdfPreview ? 'hidden' : 'block'} print:hidden`}>
      
      {/* Top Header */}
      <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
             <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{employee?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-successGreen border border-green-100 uppercase">
                Active Employee
              </span>
              <span className="text-xs text-gray-500 font-semibold">₹{(employee?.dailyRate / 100 || 0).toFixed(0)}/day base rate</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button 
            onClick={() => navigate(`/employees/${id}/edit`)}
            className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-gray-200 transition-colors shadow-sm whitespace-nowrap"
          >
            Edit Details
          </button>
          <button 
            onClick={() => {
              const text = `BHUMI ENTERPRISES: Your ${displayMonth} attendance/payment statement is ready. Total Hajri: ${report?.totalHajri || 0}, Gross: ₹${((report?.totalEarned || 0) / 100).toLocaleString()}, Advance: ₹${((report?.advance || 0) / 100).toLocaleString()}, Final Payable: ₹${((report?.balance || 0) / 100).toLocaleString()}.`;
              const smsUrl = `sms:${employee?.mobile || ''}?body=${encodeURIComponent(text)}`;
              window.open(smsUrl, '_self');
            }}
            className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-blue-100 transition-colors shadow-sm whitespace-nowrap"
          >
            Send SMS
          </button>
          <button 
            onClick={() => {
              // Generate dynamic private URL
              const baseUrl = window.location.origin;
              const privateLink = `${baseUrl}/statement/${employee?._id}?month=${format(new Date(currentDate), 'yyyy-MM')}`;
              
              const text = `Hello ${employee?.name || 'Worker'},\n\nYour attendance and payment statement for ${displayMonth} is ready.\n\nTotal Hajri: ${report?.totalHajri || 0}\nGross Payment: ₹${((report?.totalEarned || 0) / 100).toLocaleString()}\nAdvance: ₹${((report?.advance || 0) / 100).toLocaleString()}\nFinal Payable: ₹${((report?.balance || 0) / 100).toLocaleString()}\n\nView and download your full statement PDF here:\n${privateLink}`;
              
              const whatsappUrl = `https://wa.me/${employee?.mobile ? (employee.mobile.length === 10 ? '91' + employee.mobile : employee.mobile) : ''}?text=${encodeURIComponent(text)}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="bg-green-500 border border-green-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap"
          >
            WhatsApp
          </button>
          <button onClick={() => setShowPdfPreview(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
            Preview Statement
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] print:hidden">
        <button onClick={handlePrevMonth} className="text-sm text-gray-500 font-bold hover:text-blue-600 flex items-center transition-colors">
          <ChevronLeft size={16} className="mr-1" /> {prevMonthStr}
        </button>
        <span className="font-bold text-xl text-gray-900 tracking-wide">{displayMonth}</span>
        <button onClick={handleNextMonth} className="text-sm text-gray-500 font-bold hover:text-blue-600 flex items-center transition-colors">
          {nextMonthStr} <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 print:hidden">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL HAJRI</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{report?.totalHajri || 0}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Work Credit</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL EARNED</span>
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <Banknote size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">₹{((report?.totalEarned || 0) / 100).toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Labour Value</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ADVANCES PAID</span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-1">₹{((report?.advance || 0) / 100).toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Amount Deducted</div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl border border-blue-700 p-5 shadow-[0_2px_10px_rgba(37,99,235,0.2)] flex flex-col justify-between h-36 text-white">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">FINAL BALANCE</span>
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">₹{((report?.balance || 0) / 100).toLocaleString()}</div>
            <div className="text-[10px] font-bold text-blue-200 uppercase">Due to Employee</div>
          </div>
        </div>
      </div>

      {/* Site-wise Summary */}
      {Object.keys(siteWiseHajri).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] print:hidden">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Site-wise Hajri Breakdown</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(siteWiseHajri).map(([site, hajri]: any) => (
              <div key={site} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 min-w-[200px]">
                <span className="font-bold text-gray-800 text-sm">{site}</span>
                <span className="bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs">{hajri} Hajri</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mt-4 print:hidden">
        {[
          { id: 'LOG', label: 'Daily Work / Hajri' },
          { id: 'PAY', label: 'Payments' },
          { id: 'HISTORY', label: 'History' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forms Area */}
      <div className="print:hidden">
        {activeTab === 'LOG' && (
          <form onSubmit={handleAddLog} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Site <span className="text-red-500">*</span></label>
                <select value={logSite} onChange={e => setLogSite(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white" required>
                  <option value="">Select Site...</option>
                  {sites?.filter((s: any) => s.status === 'ACTIVE')?.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hajri <span className="text-red-500">*</span></label>
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(val => (
                    <button 
                      type="button" 
                      key={val} 
                      onClick={() => setLogHajriWhole(val)} 
                      className={`flex-1 py-3 rounded-xl font-bold border transition-all ${logHajriWhole === val ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {[{val: 0, label: '0'}, {val: 0.25, label: '|'}, {val: 0.5, label: '||'}, {val: 0.75, label: '|||'}].map(item => (
                    <button 
                      type="button" 
                      key={item.val} 
                      onClick={() => setLogHajriFrac(item.val)} 
                      className={`flex-1 py-3 rounded-xl font-bold border transition-all ${logHajriFrac === item.val ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-inner">
                  <span className="text-sm font-bold text-gray-600">Calculated Output:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-600 tracking-wider">{getHajriDisplay(logHajri)}</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full uppercase tracking-wider">{logHajri} Amount</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Work Details (Optional)</label>
                <textarea 
                  placeholder="Describe daily work done..." 
                  value={logWork} 
                  onChange={e => setLogWork(e.target.value)} 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-y min-h-[100px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Daily Rate (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-bold">₹</span>
                  <input type="number" value={logRate} onChange={e => setLogRate(Number(e.target.value))} className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-semibold" required />
                </div>
              </div>
            </div>
            
            <button type="submit" disabled={saveWorkMutation.isPending} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-70 transition-colors mt-2">
              SAVE WORK LOG (₹{(logHajri * Number(logRate)).toLocaleString()})
            </button>
          </form>
        )}

        {activeTab === 'PAY' && (
          <form onSubmit={handleAddPay} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-bold">₹</span>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-semibold" required />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
              <div className="flex gap-3">
                {['CASH', 'ONLINE'].map(method => (
                  <button 
                    type="button" 
                    key={method} 
                    onClick={() => setPayMethod(method)} 
                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${payMethod === method ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-600 hover:text-blue-600'}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={savePayMutation.isPending} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-70 transition-colors mt-2">
              PAY ADVANCE
            </button>
          </form>
        )}

        {activeTab === 'HISTORY' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mt-4">
            {records?.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-semibold">No records found for {displayMonth}.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">DATE</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">SITE</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">WORK DETAILS</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-center">DAILY HAJRI</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-right">AMOUNT</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records?.map((record: any) => {
                      const isPayment = record.type === 'PAYMENT' || record.type === 'ADVANCE'; 
                      const recordDate = new Date(record.date);
                      return (
                        <tr key={record._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{format(recordDate, 'dd MMM')}</span>
                              <span className="text-xs text-gray-500 font-semibold">{format(recordDate, 'EEEE')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800">
                                {isPayment ? 'Advance Payment' : (record.siteId?.name || 'Unknown Site')}
                              </span>
                              <span className="text-[9px] text-gray-400 font-semibold mt-1">
                                {record.updatedBy ? `Updated by ${record.updatedBy.username || record.updatedBy.name}` : (record.createdBy ? `Logged by ${record.createdBy.username || record.createdBy.name}` : '')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">
                              {isPayment ? record.note : (record.workDescription || '-')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPayment ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                              {isPayment ? record.paymentMethod : `${getHajriDisplay(record.hajri)} (${record.hajri})`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-bold text-lg ${isPayment ? 'text-red-600' : 'text-gray-900'}`}>
                              {isPayment ? '-' : '+'}₹{(record.amount / 100).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => navigate(isPayment ? `/edit-payment/${record._id}` : `/edit-work/${record._id}`, { state: { record } })}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                            >
                              <Edit2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* NEW STATEMENT PDF VIEW */}
      <div className={`${showPdfPreview ? 'block bg-gray-500 min-h-screen p-8' : 'hidden'} print:block print:p-0 print:bg-white`}>
        {showPdfPreview && (
          <div className="fixed top-4 right-4 z-50 flex gap-4 print:hidden">
            <button 
              onClick={async () => {
                try {
                  const element = document.getElementById('pdf-content');
                  if (!element) return window.print();
                  
                  const opt = {
                    margin:       10,
                    filename:     `BHUMI_${employee?.name}_${displayMonth}_Statement.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                  };

                  if (!(window as any).html2pdf) {
                    await new Promise((resolve) => {
                      const script = document.createElement('script');
                      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                      script.onload = resolve;
                      document.head.appendChild(script);
                    });
                  }

                  (window as any).html2pdf().set(opt).from(element).save();
                } catch (err) {
                  window.print();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.4)] transition-all"
            >
              Download PDF File
            </button>
            <button onClick={() => setShowPdfPreview(false)} className="bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-2.5 rounded-xl shadow-lg border transition-all">
              Close Preview
            </button>
          </div>
        )}
        
        <div id="pdf-content" className={`${showPdfPreview ? 'shadow-2xl rounded-xl overflow-hidden max-w-[210mm] mx-auto' : ''}`}>
          <WorkerStatementPDF 
            employee={employee}
            displayMonth={displayMonth}
            report={report}
            siteWiseHajri={siteWiseHajri}
            records={records || []}
            getHajriDisplay={getHajriDisplay}
          />
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;
