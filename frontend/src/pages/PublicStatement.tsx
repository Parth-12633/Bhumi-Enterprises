import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Printer, AlertCircle, Loader2 } from 'lucide-react';
import WorkerStatementPDF from '../components/WorkerStatementPDF';
import { format } from 'date-fns';

const PublicStatement = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month'); // YYYY-MM
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        if (!id || !month) {
          setError('Invalid link. Missing employee ID or month.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/public/statement/${id}?month=${month}`);
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load statement. Please verify the link is correct.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, [id, month]);

  const getHajriDisplay = (val: number) => {
    if (val === 0) return 'A';
    if (val === 1) return 'PP';
    if (val === 0.25) return 'P|';
    if (val === 0.5) return 'P||';
    if (val === 0.75) return 'P|||';
    return val.toString();
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('pdf-content');
      if (!element) return;
      
      const opt = {
        margin:       10,
        filename:     `BHUMI_${data.employee.name}_${month}_Statement.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Dynamically load html2pdf if not present
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
      console.error('PDF Generation Error:', err);
      window.print(); // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading your statement...</h2>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Statement Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-400">Please ask your supervisor for a new link.</p>
        </div>
      </div>
    );
  }

  // Format month for display
  const displayMonth = month ? format(new Date(month + '-01'), 'MMMM yyyy') : '';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* Public Top Bar (Hides on print) */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black text-[#1e3a8a] tracking-tight uppercase">Bhumi Enterprises</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Worker Portal</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleDownload}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)]"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="hidden sm:flex bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold items-center gap-2 transition-all border border-gray-200"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="flex-1 p-4 sm:p-8 print:p-0 overflow-auto">
        <div id="pdf-content" className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none sm:rounded-xl overflow-hidden print:rounded-none">
          <WorkerStatementPDF 
            employee={data.employee}
            displayMonth={displayMonth}
            report={data.report}
            siteWiseHajri={data.siteWiseHajri}
            records={data.records}
            getHajriDisplay={getHajriDisplay}
          />
        </div>
      </div>

    </div>
  );
};

export default PublicStatement;
