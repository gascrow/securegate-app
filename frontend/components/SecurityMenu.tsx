import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, UserPlus, QrCode, ShieldCheck, ClipboardCheck, Contact } from 'lucide-react';

interface SecurityMenuProps {
  role: UserRole;
  activeView: 'form' | 'list' | 'qr' | 'user_mgmt' | 'staff_dashboard' | 'staff_directory';
  onSelect: (view: 'form' | 'list' | 'qr' | 'user_mgmt' | 'staff_dashboard' | 'staff_directory') => void;
}

const SecurityMenu: React.FC<SecurityMenuProps> = ({ role, activeView, onSelect }) => {
  const getBtnClass = (view: string) => {
    const isActive = activeView === view;
    return `px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 flex items-center gap-3 shrink-0 ${
      isActive 
      ? 'bg-[#00339a] text-white border-[#00339a] shadow-xl shadow-blue-900/20 -translate-y-[2px]' 
      : 'bg-white text-slate-400 border-slate-100 hover:border-blue-100 hover:text-[#00339a] shadow-sm'
    }`;
  };

  return (
    <div className="bg-white border-b border-slate-100 shrink-0 sticky top-[72px] z-40">
      <div className="max-w-full mx-auto px-4 md:px-12 flex flex-row gap-4 py-4 md:py-6 items-center overflow-x-auto no-scrollbar scroll-smooth">
        
        <button onClick={() => onSelect('list')} className={getBtnClass('list')}>
          <LayoutDashboard size={16} /> DASHBOARD PEMANTAUAN
        </button>

        <button onClick={() => onSelect('form')} className={getBtnClass('form')}>
          <UserPlus size={16} /> INPUT TAMU BARU
        </button>

        <button onClick={() => onSelect('staff_directory')} className={getBtnClass('staff_directory')}>
          <Contact size={16} /> DAFTAR PEGAWAI
        </button>

        <button onClick={() => onSelect('qr')} className={getBtnClass('qr')}>
          <QrCode size={16} /> QR PENDAFTARAN
        </button>

        <button onClick={() => onSelect('staff_dashboard')} className={getBtnClass('staff_dashboard')}>
          <ClipboardCheck size={16} /> KONFIRMASI STAF
        </button>

        {/* RESTRIKSI: Hanya tampil untuk ADMIN */}
        {role === UserRole.ADMIN && (
          <button onClick={() => onSelect('user_mgmt')} className={getBtnClass('user_mgmt')}>
            <ShieldCheck size={16} /> MANAJEMEN USER
          </button>
        )}
        
        <div className="flex-grow hidden md:block"></div>
        
        <div className="hidden lg:flex flex-col items-end opacity-20">
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">PT KALTIM KARIANGAU TERMINAL</p>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SecurityMenu;
