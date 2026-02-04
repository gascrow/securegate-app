import React from 'react';
import { UserRole } from '../types';
import { Shield, User, Briefcase, MapPin } from 'lucide-react';

interface HeaderProps {
  role: UserRole;
  onToggleRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, onToggleRole }) => {
  const isSecurity = role === UserRole.SEKURITI;
  const isStaff = role === UserRole.STAF;

  return (
    <header className="bg-white px-6 md:px-12 py-4 sticky top-0 z-50 print:hidden border-b border-slate-100">
      <div className="max-w-full flex items-center justify-between">
        
        {/* BAGIAN KIRI: LOGO & NAMA PERUSAHAAN (GAMBAR 1) */}
        <div className="flex items-center gap-3">
          <div className="text-brand-navy shrink-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.5 12L21.5 3L15.5 21L11.5 13L2.5 12Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[16px] md:text-[19px] font-black text-brand-navy uppercase tracking-tight leading-none">
              KALTIM KARIANGAU TERMINAL
            </h1>
            <p className="text-[10px] font-bold italic text-slate-400 mt-1">
              Handal, Tepat waktu dan Efisien
            </p>
          </div>
        </div>

        {/* BAGIAN KANAN: LOKASI & USER ACTION (PERSIS GAMBAR 1) */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-red fill-brand-red/20" />
              <span className="text-[11px] font-extrabold text-brand-navy uppercase tracking-tight">
                LOBBY - KALTIM KARIANGAU TERMINAL
              </span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
              Sistem Informasi Tamu Digital
            </p>
          </div>

          {/* Garis pemisah vertikal tipis */}
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Tombol Profil Tanpa Background Biru (Hanya Ikon sesuai Gambar 1) */}
          <button 
            onClick={onToggleRole}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-50 transition-all border border-slate-100 shadow-sm"
          >
            <div className="text-brand-navy">
              {isSecurity ? <Shield size={22} /> : isStaff ? <Briefcase size={22} /> : <User size={22} />}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
