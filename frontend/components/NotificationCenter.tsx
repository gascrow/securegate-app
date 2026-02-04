import React, { useState, useEffect } from 'react';
import { Notification, GuestStatus, GuestEntry } from '../types';
import { Bell, X, Info, Check, Ban, MessageSquare, UserCircle, BellRing } from 'lucide-react';

interface NotificationCenterProps {
  notifications: Notification[];
  guests: GuestEntry[];
  onClear: () => void;
  onAction: (guestId: string, status: GuestStatus, catatan: string, notifId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, guests, onClear, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const unActioned = notifications.filter(n => !n.isActioned);
    if (unActioned.length > 0) {
      setHasNew(true);
      const timer = setTimeout(() => setHasNew(false), 20000);
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);

  const activeNotifs = notifications.filter(n => !n.isActioned);

  if (notifications.length === 0) return null;

  const handleAction = (notif: Notification, status: GuestStatus) => {
    onAction(notif.guestId, status, notes[notif.id] || '', notif.id);
  };

  const getGuestDetails = (guestId: string) => {
    return guests.find(g => g.id === guestId);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-6 pointer-events-none">
      {hasNew && activeNotifs.length > 0 && (
        <div className="bg-slate-900 text-white rounded-[3rem] shadow-[0_48px_100px_rgba(0,0,0,0.4)] border border-slate-700 w-[450px] animate-bounce-in pointer-events-auto overflow-hidden ring-4 ring-indigo-500/30">
           <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-5 flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <BellRing size={20} className="animate-pulse" /> Panggilan Masuk
              </span>
              <button onClick={() => setHasNew(false)} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                <X size={22} />
              </button>
           </div>
           
           <div className="p-10 flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                    <UserCircle size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Instruksi Untuk</p>
                    <p className="text-lg font-black text-slate-100">{getGuestDetails(activeNotifs[0].guestId)?.penanggungJawab || 'Staf Internal'}</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                  <p className="text-sm font-medium leading-relaxed text-slate-200">
                    {activeNotifs[0].message}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-800 px-6 py-5 rounded-2xl border border-slate-700 focus-within:border-indigo-500 transition-all">
                  <MessageSquare size={20} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Beri instruksi/catatan..." 
                    className="bg-transparent text-sm w-full outline-none placeholder:text-slate-600 text-slate-100 font-bold"
                    value={notes[activeNotifs[0].id] || ''}
                    onChange={(e) => setNotes({...notes, [activeNotifs[0].id]: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleAction(activeNotifs[0], GuestStatus.DIIZINKAN)}
                    className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    <Check size={20} /> SETUJUI
                  </button>
                  <button 
                    onClick={() => handleAction(activeNotifs[0], GuestStatus.DITOLAK)}
                    className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    <Ban size={20} /> TOLAK
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white p-6 rounded-[2.5rem] shadow-[0_24px_48px_-8px_rgba(0,0,0,0.12)] border border-slate-200 text-indigo-600 hover:bg-slate-50 hover:scale-110 active:scale-90 transition-all pointer-events-auto ring-8 ring-transparent hover:ring-indigo-50 group"
      >
        <Bell size={32} className={activeNotifs.length > 0 ? 'animate-ring' : ''} />
        {activeNotifs.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[12px] font-black h-8 w-8 flex items-center justify-center rounded-full border-4 border-white shadow-xl animate-pulse">
            {activeNotifs.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-200 w-[450px] max-h-[650px] flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 duration-500">
          <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-black text-slate-800 flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                <Bell size={20} className="text-indigo-600" /> Log Notifikasi
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">Riwayat Konfirmasi Lobby</span>
            </div>
            <button onClick={onClear} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              Hapus Semua
            </button>
          </div>
          <div className="overflow-y-auto p-6 space-y-6 bg-slate-50/20">
            {notifications.length === 0 ? (
              <div className="py-24 text-center">
                <div className="bg-white inline-block p-6 rounded-[2.5rem] shadow-sm mb-6 border border-slate-100">
                  <Bell size={40} className="text-slate-200" />
                </div>
                <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest">Belum ada pesan masuk</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-6 rounded-[2.5rem] border relative group transition-all ${notif.isActioned ? 'bg-white/40 border-slate-100 opacity-60' : 'bg-white border-indigo-200 shadow-xl ring-4 ring-indigo-50'}`}>
                  <div className="flex gap-6">
                    <div className={`p-4 rounded-2xl shrink-0 h-fit ${notif.isActioned ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}>
                      <Info size={24} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                           Ke: {getGuestDetails(notif.guestId)?.penanggungJawab}
                         </span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className={`text-sm leading-relaxed font-bold ${notif.isActioned ? 'text-slate-500' : 'text-slate-900'}`}>
                        {notif.message}
                      </p>
                      
                      {!notif.isActioned && (
                        <div className="mt-6 space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 rounded-2xl shadow-sm">
                             <MessageSquare size={16} className="text-slate-400" />
                             <input 
                              type="text" 
                              placeholder="Ketik instruksi..." 
                              className="w-full text-xs py-4 outline-none bg-transparent font-bold"
                              value={notes[notif.id] || ''}
                              onChange={(e) => setNotes({...notes, [notif.id]: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => handleAction(notif, GuestStatus.DIIZINKAN)}
                              className="bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                            >
                              Izinkan
                            </button>
                            <button 
                              onClick={() => handleAction(notif, GuestStatus.DITOLAK)}
                              className="bg-red-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {notif.isActioned && (
                         <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl w-fit border border-emerald-100">
                            <Check size={16} className="text-emerald-600" />
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Selesai Dikonfirmasi</span>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translateY(60px) scale(0.9); opacity: 0; }
          60% { transform: translateY(-10px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes ring {
          0% { transform: rotate(0); }
          5% { transform: rotate(20deg); }
          10% { transform: rotate(-20deg); }
          15% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          25% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-ring { animation: ring 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
