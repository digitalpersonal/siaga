
import React, { useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import type { User } from '../types';

interface BiometricUpdateModalProps {
    user: User;
    onSuccess: (newImageUrl: string) => void;
}

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const BiometricUpdateModal: React.FC<BiometricUpdateModalProps> = ({ user, onSuccess }) => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: 400, height: 400 } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
        }
    };

    // Auto-start camera on mount
    React.useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            setScanning(true);
            setTimeout(() => {
                if (videoRef.current && canvasRef.current) {
                    const context = canvasRef.current.getContext('2d');
                    if (context) {
                        context.drawImage(videoRef.current, 0, 0, 300, 300);
                        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
                        setCapturedImage(imageDataUrl);
                        
                        // Stop stream after capture
                        if (videoRef.current.srcObject) {
                            const stream = videoRef.current.srcObject as MediaStream;
                            stream.getTracks().forEach(track => track.stop());
                        }
                    }
                }
                setScanning(false);
            }, 1000);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleSave = async () => {
        if (!capturedImage) return;
        setUploading(true);
        setError(null);

        try {
            const res = await fetch(capturedImage);
            const blob = await res.blob();
            // Use ID for unique filename, replacing old one if exists
            const fileName = `${user.id}_biometric_update.jpg`; 
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            if (!urlData.publicUrl) throw new Error("Falha ao gerar URL pública.");

            const newImageUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Bust cache

            // Update user profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ image_url: newImageUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            onSuccess(newImageUrl);

        } catch (err: any) {
            console.error(err);
            setError("Erro ao salvar biometria. Tente novamente.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative flex flex-col items-center">
                
                <WarningIcon />
                <h3 className="text-xl font-bold text-stone-800 mb-2 text-center">Atualização Cadastral</h3>
                <p className="text-sm text-stone-500 mb-6 text-center leading-relaxed">
                    Identificamos que seu cadastro foi realizado presencialmente. Para acessar o aplicativo com segurança, precisamos registrar sua <strong>biometria facial (selfie)</strong>.
                </p>

                <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden mb-6 border-4 border-teal-500 shadow-xl">
                    {!capturedImage ? (
                        <>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                            />
                            {scanning && <div className="absolute inset-0 bg-teal-500/20 animate-pulse z-10"></div>}
                            <div className="absolute inset-0 border-[20px] border-black/30 rounded-full z-0"></div>
                            {scanning && <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] animate-scan z-20"></div>}
                        </>
                    ) : (
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                    )}
                    <canvas ref={canvasRef} width="300" height="300" className="hidden" />
                </div>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                {!capturedImage ? (
                    <button 
                        onClick={handleCapture}
                        disabled={scanning}
                        className="flex items-center bg-teal-600 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg w-full justify-center"
                    >
                        {scanning ? 'Capturando...' : (
                            <>
                                <CameraIcon /> <span className="ml-2">Tirar Selfie</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="w-full space-y-3">
                        <button 
                            onClick={handleSave}
                            disabled={uploading}
                            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                        >
                            {uploading ? 'Salvando...' : 'Confirmar e Acessar'}
                        </button>
                        <button 
                            onClick={handleRetake}
                            disabled={uploading}
                            className="w-full text-stone-500 text-sm hover:text-stone-800 py-2 font-medium"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
