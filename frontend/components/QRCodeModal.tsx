import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Building2, Smartphone, ShieldCheck, Download } from 'lucide-react';

interface QRCodeModalProps {
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const registrationUrl = window.location.origin + window.location.pathname;

  useEffect(() => {
    QRCode.toDataURL(registrationUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#00339a',
        light: '#ffffff'
      }
    }, (err, url) => {
      if (!err) setQrUrl(url);
    });
  }, [registrationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'QR_CODE_TAMU_KKT.png';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300">
        
        {/* HEADER MODAL */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Smartphone className="text-brand-navy" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">QR Code Registrasi</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-brand-red transition-colors"><X size={20} /></button>
        </div>

        {/* PRINTABLE AREA */}
        <div id="qr-poster-print" className="p-8 text-center flex flex-col items-center">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
               <Building2 size={24} className="text-brand-navy" />
               <h2 className="text-[18px] font-black text-brand-navy tracking-tighter uppercase italic">KALTIM KARIANGAU TERMINAL</h2>
            </div>
            <div className="h-0.5 w-16 bg-brand-red mx-auto rounded-full"></div>
          </div>

          <div className="relative mb-8">
             <div className="relative bg-white p-4 rounded-[1.5rem] border-2 border-brand-navy shadow-xl">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64 mx-auto" />
                ) : (
                  <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-xl"></div>
                )}
             </div>
          </div>

          <div className="space-y-2">
             <h3 className="text-[22px] font-black text-slate-900 tracking-tighter uppercase italic">SCAN UNTUK DAFTAR</h3>
             <p className="text-slate-500 font-bold text-[13px] max-w-xs mx-auto leading-relaxed">Silakan gunakan kamera handphone Anda untuk registrasi tamu secara mandiri.</p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-brand-navy uppercase tracking-[0.3em]">
             <ShieldCheck size={14} /> SAFE & SECURE GUEST SYSTEM
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3 print:hidden">
          <button onClick={handleDownload} className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-brand-navy transition-all"><Download size={16} /> DOWNLOAD</button>
          <button onClick={handlePrint} className="flex items-center justify-center gap-2 py-3 bg-brand-navy text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-red transition-all shadow-lg"><Printer size={16} /> PRINT POSTER</button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
