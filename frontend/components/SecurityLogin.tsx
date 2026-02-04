import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, X, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

interface SecurityLoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onCancel: () => void;
  errorMessage?: string | null;
}

const SecurityLogin: React.FC<SecurityLoginProps> = ({ onLogin, onCancel, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setIsSubmitting(true);
      await onLogin(username, password);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-navy/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-500">
        <div className="relative bg-brand-navy p-10 text-white text-center">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
              <Shield size={24} className="text-white" />
          </div>
          <h3 className="text-[18px] md:text-[20px] font-black tracking-tight text-white italic uppercase leading-none">SECURITY LOGIN</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-3 text-white/50 leading-relaxed">Sistem Informasi Tamu Digital</p>
          <button 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors p-1.5 disabled:opacity-0"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {errorMessage && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight leading-tight">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest px-1">ID PETUGAS</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/50" size={14} />
                        <input 
                          type="text" 
                          placeholder="Username" 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-brand-navy outline-none font-bold text-[13px] disabled:opacity-50" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                          disabled={isSubmitting}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest px-1">PASSWORD</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/50" size={14} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••" 
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-brand-navy outline-none font-bold text-[13px] disabled:opacity-50" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          disabled={isSubmitting}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>
            </div>
            <button 
              type="submit" 
              disabled={!username || !password || isSubmitting} 
              className="w-full bg-brand-navy text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-red disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  MEMVERIFIKASI...
                </>
              ) : (
                <>
                  MASUK <ArrowRight size={16} />
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityLogin;
