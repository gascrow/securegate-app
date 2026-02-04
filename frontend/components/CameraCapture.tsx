import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, CheckCircle2, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  label: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isCapturing && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  }, [isCapturing, stream]);

  const startCamera = async () => {
    setIsSaved(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: label.toLowerCase().includes('ktp') ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      setIsCapturing(true);
      setCapturedImage(null);
    } catch (err) {
      console.error(err);
      alert("Gagal mengakses kamera.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
        onCapture(dataUrl);
        setIsSaved(true);
      }
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-[800] text-brand-navy uppercase tracking-widest px-1">{label}</p>
      
      {!isCapturing && !capturedImage && (
        <button 
          type="button"
          onClick={startCamera}
          className="w-full h-56 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-200 hover:text-brand-navy hover:bg-slate-50 transition-all bg-white shadow-inner"
        >
          <div className="bg-slate-50 p-6 rounded-full shadow-md group-hover:scale-110 transition-transform">
             <Camera size={32} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">KLIK UNTUK AMBIL {label}</span>
        </button>
      )}

      {isCapturing && (
        <div className="relative h-56 rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
            style={{ transform: label.toLowerCase().includes('ktp') ? 'none' : 'scaleX(-1)' }}
          />
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-6">
            <button type="button" onClick={takePhoto} className="bg-white text-brand-navy p-4 rounded-full shadow-2xl active:scale-90 transition-transform border-4 border-brand-navy/10"><Check size={28} /></button>
            <button type="button" onClick={stopCamera} className="bg-brand-red text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform border-4 border-white/20"><X size={28} /></button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-brand-green/20 group">
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <button type="button" onClick={startCamera} className="bg-white text-brand-navy px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl">AMBIL ULANG</button>
          </div>
          <div className="absolute top-4 right-4 bg-brand-green text-white p-2 rounded-full shadow-lg">
             <CheckCircle2 size={24} />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
