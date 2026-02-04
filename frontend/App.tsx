import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, GuestEntry, GuestStatus } from './types';
import Header from './components/Header';
import GuestForm from './components/GuestForm';
import GuestList from './components/GuestList';
import SecurityLogin from './components/SecurityLogin';
import SecurityMenu from './components/SecurityMenu';
import StaffApprovalView from './components/StaffApprovalView';
import StaffDashboard from './components/StaffDashboard';
import QRCodeModal from './components/QRCodeModal';
import UserManagement from './components/UserManagement';
import StaffDirectory from './components/StaffDirectory';
import { 
  getGuests, 
  createGuest, 
  updateGuest, 
  deleteGuest,
  approveGuest
} from './services/api/guests';
import { ArrowRight, UserCheck, Loader2, Shield } from 'lucide-react';
import { login as authLogin, logout as authLogout } from './services/api/auth';

const App: React.FC = () => {
  const [isSecurityLoggedIn, setIsSecurityLoggedIn] = useState(() => 
    !!localStorage.getItem('token')
  );
  
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('role') as UserRole;
    return savedRole || UserRole.TAMU;
  });

  const [view, setView] = useState<'form' | 'list' | 'success' | 'approval' | 'staff_dashboard' | 'qr' | 'user_mgmt' | 'staff_directory'>(
    isSecurityLoggedIn ? 'list' : 'form'
  );

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // RESTORASI: Mengambil data nyata dari API
  const fetchGuests = useCallback(async () => {
    console.log('fetchGuests called');
    setIsLoading(true);
    try {
      const data = await getGuests();
      console.log('fetchGuests data:', data);
      setGuests(data || []);
    } catch (error) {
      console.error("Gagal sinkronisasi data:", error);
      setGuests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSecurityLoggedIn) {
      fetchGuests();
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('approval')) {
      setView('approval');
      // Role STAF diset secara virtual untuk tampilan approval link
      setRole(UserRole.STAF);
    }
  }, [fetchGuests, isSecurityLoggedIn]);

  const handleSecurityLogin = async (username: string, password: string) => {
    setLoginError(null);
    try {
      const result = await authLogin(username, password);

      // persist JWT auth
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);

      const finalRole = (result.role as UserRole) || UserRole.SEKURITI;
      setRole(finalRole);
      setIsSecurityLoggedIn(true);
      setShowLoginModal(false);
      setView('list');
      await fetchGuests();
    } catch (err: any) {
      setLoginError(err?.response?.data?.error || 'Login gagal! Periksa kembali kredensial Anda.');
    }
  };

  const handleAddGuest = useCallback(async (newEntry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => {
  setIsLoading(true);
  try {
    const result = await createGuest({ ...newEntry, status: GuestStatus.PENDING });
    if (result.success) {
      if (role === UserRole.TAMU) {
        setView('success');
      } else {
        // Fetch guest list terbaru agar dashboard admin terupdate
        const updatedGuests = await getGuests();
        setGuests(updatedGuests);
        setView('list');
      }
    }
  } catch (err) {
    console.error('Gagal menambahkan tamu:', err);
  } finally {
    setIsLoading(false);
  }
}, [role]);

  const handleStaffAction = async (guestId: string, status: GuestStatus, catatan: string, notifId?: string) => {
    setIsLoading(true);
    try {
      const result = await approveGuest(guestId, status, catatan);
      if (result.success) {
        alert(`Tamu berhasil di-${status.toLowerCase()}.`);
        console.log('Approval berhasil, memperbarui data guest list...');
        // Fetch updated guest list to refresh dashboard AND guestlist
        await fetchGuests();
        console.log('Data guest list berhasil diperbarui');
        // Kembali ke dashboard jika dari staff dashboard
        if (view === 'staff_dashboard') setView('staff_dashboard');
      } else {
        console.error('Approval gagal:', result);
      }
    } catch (error) {
      console.error('Error saat approval:', error);
      alert('Gagal melakukan approval. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = useCallback(async (id: string) => {
    // Format waktu ke HH:mm (backend requirement)
    const now = new Date();
    const jamKeluar = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setIsLoading(true);
    try {
      const result = await updateGuest(id, { jamKeluar, status: GuestStatus.LOGGED });
      if (result.success) {
        await fetchGuests();
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchGuests]);

  const handleDeleteGuest = useCallback(async (id: string) => {
    if (window.confirm("Hapus log kunjungan ini?")) {
      setIsLoading(true);
      try {
        const result = await deleteGuest(id);
        if (result.success) await fetchGuests();
      } finally {
        setIsLoading(false);
      }
    }
  }, [fetchGuests]);

  const logout = async () => {
    setIsLoading(true);
    try {
      authLogout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setIsSecurityLoggedIn(false);
      setRole(UserRole.TAMU);
      setView('form');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      <Header role={role} onToggleRole={() => {
        if (role === UserRole.TAMU) { 
           if(!isSecurityLoggedIn) {
             setLoginError(null);
             setShowLoginModal(true); 
           }
           else { 
             const savedRole = localStorage.getItem('kkt_user_role') as UserRole || UserRole.SEKURITI;
             setRole(savedRole); 
             setView('list'); 
           }
        } else { 
          setRole(UserRole.TAMU); 
          setView('form'); 
        }
      }} />
      
      {showLoginModal && (
        <SecurityLogin 
          onLogin={handleSecurityLogin} 
          onCancel={() => setShowLoginModal(false)} 
          errorMessage={loginError}
        />
      )}

      {isSecurityLoggedIn && (role === UserRole.SEKURITI || role === UserRole.ADMIN) && (
        <SecurityMenu role={role} activeView={view as any} onSelect={(v) => setView(v as any)} />
      )}

      <main className="flex-grow relative overflow-hidden flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-brand-navy mb-4" size={40} />
            <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest italic">Sinkronisasi Database...</p>
          </div>
        )}

        <div className={`w-full h-full max-w-full mx-auto flex flex-col ${view === 'form' || view === 'approval' || view === 'staff_dashboard' || view === 'user_mgmt' || view === 'staff_directory' ? 'px-0 overflow-y-auto' : 'px-0 py-0'}`}>
          {view === 'approval' ? (
            <div className="w-full flex justify-center py-6 px-4 md:px-0"><StaffApprovalView guest={undefined} onAction={handleStaffAction} /></div>
          ) : view === 'staff_dashboard' ? (
             <div className="w-full py-6 px-4 md:px-12"><StaffDashboard guests={guests} notifications={[]} onAction={handleStaffAction} /></div>
          ) : view === 'qr' ? (
             <QRCodeModal onClose={() => setView('list')} />
          ) : view === 'staff_directory' ? (
             <div className="h-full px-4 md:px-12 py-8"><StaffDirectory role={role} /></div>
          ) : view === 'user_mgmt' ? (
             role === UserRole.ADMIN ? (
               <div className="h-full px-4 md:px-12 py-8"><UserManagement /></div>
             ) : (
               <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Shield className="mx-auto text-slate-100 mb-4" size={64} />
                    <p className="text-slate-300 font-black uppercase tracking-widest italic">Akses Terbatas: Hanya Admin</p>
                  </div>
               </div>
             )
          ) : view === 'success' ? (
            <div className="flex-grow flex items-center justify-center p-6 text-center">
              <div className="bg-white rounded-[3rem] shadow-2xl p-16 max-w-xl w-full border border-slate-100 animate-in zoom-in duration-500">
                <div className="bg-brand-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-lg ring-4 ring-emerald-50">
                   <UserCheck size={32} />
                </div>
                <h2 className="text-[20px] font-black text-brand-navy mb-4 uppercase italic tracking-tighter">REGISTRASI SELESAI</h2>
                <p className="text-slate-500 font-bold mb-10 text-[11px] uppercase tracking-widest">Data Anda telah tercatat di sistem SecureGate KKT.</p>
                <button onClick={() => setView('form')} className="bg-brand-navy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 mx-auto">BERANDA <ArrowRight size={16} /></button>
              </div>
            </div>
          ) : view === 'form' ? (
            <div className="w-full"><GuestForm onSubmit={handleAddGuest} role={role} /></div>
          ) : view === 'list' ? (
            <div className="h-full flex flex-col overflow-hidden px-4 md:px-12 py-4"><GuestList guests={guests} onCheckout={handleCheckout} onDelete={handleDeleteGuest} role={role} isSecurity={true} /></div>
          ) : null}
        </div>
      </main>

      {isSecurityLoggedIn && (
        <button onClick={logout} className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-md border border-slate-200 text-brand-navy hover:bg-brand-red hover:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl z-50 flex items-center gap-2">
          <Shield size={14} /> KELUAR ({role})
        </button>
      )}
    </div>
  );
};
1
export default App;
