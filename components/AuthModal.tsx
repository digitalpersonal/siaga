
import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';

interface AuthModalProps {
    onClose: () => void;
}

// --- Mask Helpers ---
const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .slice(0, 15);
};

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskSUS = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .slice(0, 18); // 15 digits + spaces
};

// --- Icons ---
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.673.12 2.458.342M10.125 10.125a3 3 0 114.242 4.242M10.125 10.125L13.875 13.875M3.828 4.828l16.344 16.344" />
    </svg>
);

const FaceIdIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LockClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [step, setStep] = useState<'form' | 'biometrics'>('form');
    
    // Form States
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    
    // New Document Fields
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [motherName, setMotherName] = useState('');
    const [susCardNumber, setSusCardNumber] = useState('');

    // Address Split States
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper to create synthetic email from phone
    const getSyntheticEmail = (phoneNumber: string) => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        return `${cleanPhone}@siaga.app`;
    };

    const startCamera = async () => {
        setCameraActive(true);
        setError(null);
        setCapturedImage(null); // Clear previous image
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: 400, height: 400 } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            setError("Não foi possível acessar a câmera. Verifique as permissões.");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            setScanning(true);
            // Simulate scanning delay
            setTimeout(() => {
                if (videoRef.current && canvasRef.current) {
                    const context = canvasRef.current.getContext('2d');
                    if (context) {
                        // Ensure canvas dimensions match video for full capture
                        canvasRef.current.width = videoRef.current.videoWidth;
                        canvasRef.current.height = videoRef.current.videoHeight;
                        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
                        setCapturedImage(imageDataUrl);
                        stopCamera();
                    }
                }
                setScanning(false);
            }, 1500);
        }
    };

    const handleLogin = async () => {
        if (!phone || !password) {
            setError("Por favor, preencha telefone e senha.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const email = getSyntheticEmail(phone);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                setError("Número de telefone ou senha incorretos.");
            } else {
                setError(error.message);
            }
        } else {
            onClose();
        }
        setLoading(false);
    };

    const handleSignup = async () => {
        // Validation: Clients MUST have a photo
        if (!capturedImage) {
            setError("A verificação facial é obrigatória para pacientes.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const email = getSyntheticEmail(phone);
        const cleanPhone = phone.replace(/\D/g, '');
        let avatarUrl = `https://i.pravatar.cc/150?u=${email}`; // Fallback default avatar

        // Upload Biometric Photo if available
        if (capturedImage) {
            try {
                const res = await fetch(capturedImage);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const blob = await res.blob();
                const fileName = `${cleanPhone}_biometric.jpg`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, blob, { upsert: true });

                if (uploadError) {
                    console.error("Supabase Upload Error:", uploadError);
                    throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
                }

                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                
                if (!urlData.publicUrl) {
                    console.error("Supabase Public URL Error: URL pública não gerada.");
                    throw new Error("URL pública não foi gerada.");
                }
                
                avatarUrl = urlData.publicUrl;

            } catch (e: any) {
                console.error("Detailed Biometric Upload Error:", e);
                setError(`Erro ao processar/enviar biometria: ${e.message}`);
                setLoading(false);
                return;
            }
        }

        // Concatenate separate fields into full address
        const fullAddress = `${street}, Nº ${number} - ${neighborhood} - CEP: 37810-000`;

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                    role: 'client', // Hardcoded as Client for public signup
                    whatsapp: cleanPhone,
                    address: fullAddress, // Saved with fixed CEP and format
                    imageUrl: avatarUrl,
                    // New Fields
                    cpf: cpf.replace(/\D/g, ''),
                    rg: rg,
                    birthDate: birthDate,
                    motherName: motherName,
                    susCardNumber: susCardNumber.replace(/\D/g, '')
                },
            },
        });

        if (signUpError) {
            console.error("Supabase Signup Error:", signUpError);
            setError(signUpError.message);
        } else {
            alert('Cadastro realizado com sucesso! Use seu número e senha para entrar.');
            onClose();
        }
        setLoading(false);
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (activeTab === 'signup') {
            if (!phone || !password || !name || !street || !number || !neighborhood || !cpf || !birthDate || !motherName) {
                setError("Preencha todos os campos obrigatórios (*).");
                return;
            }
            if (cpf.replace(/\D/g, '').length !== 11) { // Check for 11 digits after masking
                setError("CPF inválido. Por favor, insira 11 dígitos.");
                return;
            }
            // Always require biometrics for public signup
            setStep('biometrics');
            startCamera();
        } else {
            // Login flow
            handleLogin();
        }
    };

    // Reset state when switching tabs
    const switchTab = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        setStep('form');
        setError(null);
        setCapturedImage(null);
        stopCamera();
    };

    const renderBiometricStep = () => (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-stone-800 mb-2">
                Cadastro de Biometria
            </h3>
            <p className="text-sm text-stone-500 mb-4 text-center">
                Posicione seu rosto no centro da câmera para segurança da sua conta.
            </p>

            <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden mb-6 border-4 border-teal-500 shadow-xl">
                {!capturedImage ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />
                        {/* Scanning Overlay */}
                        {scanning && (
                            <div className="absolute inset-0 bg-teal-500/20 animate-pulse z-10"></div>
                        )}
                        <div className="absolute inset-0 border-[20px] border-black/30 rounded-full z-0"></div>
                        {scanning && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] animate-scan z-20"></div>
                        )}
                    </>
                ) : (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
                <canvas ref={canvasRef} width="300" height="300" className="hidden" />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {!capturedImage ? (
                <button 
                    onClick={handleCapture}
                    disabled={scanning || !cameraActive}
                    className="flex items-center bg-teal-600 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg"
                >
                    {scanning ? 'Capturando...' : (
                        <>
                            <CameraIcon /> <span className="ml-2">Capturar Rosto</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="w-full space-y-3">
                    <button 
                        onClick={handleSignup}
                        disabled={loading}
                        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        {loading ? 'Finalizando Cadastro...' : 'Confirmar e Criar Conta'}
                    </button>
                    <button 
                        onClick={() => { setCapturedImage(null); startCamera(); }}
                        className="w-full text-stone-500 text-sm hover:text-stone-800 py-2"
                    >
                        Tentar Novamente
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${activeTab === 'signup' ? 'max-w-xl' : 'max-w-sm'} p-8 relative overflow-hidden flex flex-col max-h-[90vh]`}>
                <button onClick={() => { stopCamera(); onClose(); }} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors z-20">
                    <XIcon />
                </button>
                
                {step === 'form' && (
                    <>
                        <div className="flex border-b mb-6 flex-shrink-0">
                            <button 
                                onClick={() => switchTab('login')}
                                className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'login' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-stone-500'}`}
                            >
                                Entrar
                            </button>
                             <button 
                                onClick={() => switchTab('signup')}
                                className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'signup' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-stone-500'}`}
                            >
                                Cadastrar
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded border border-red-200 flex-shrink-0">{error}</p>}

                        <form onSubmit={handleNextStep} className="overflow-y-auto pr-2">
                            {activeTab === 'signup' && (
                                <div className="space-y-4 mb-4">
                                    {/* Personal Info */}
                                    <div>
                                        <label className="block text-stone-600 mb-1 text-sm font-semibold" htmlFor="name">Nome Completo *</label>
                                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder="Ex: Maria Silva" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-stone-600 mb-1 text-sm font-semibold">Data Nasc. *</label>
                                            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
                                        </div>
                                        <div>
                                            <label className="block text-stone-600 mb-1 text-sm font-semibold">CPF *</label>
                                            <input 
                                                type="text" 
                                                value={cpf} 
                                                onChange={e => setCpf(maskCPF(e.target.value))} 
                                                placeholder="000.000.000-00" 
                                                maxLength={14}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-stone-600 mb-1 text-sm font-semibold">RG</label>
                                            <input type="text" value={rg} onChange={e => setRg(e.target.value)} placeholder="00.000.000" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
                                        </div>
                                        <div>
                                            <label className="block text-stone-600 mb-1 text-sm font-semibold">Cartão SUS</label>
                                            <input 
                                                type="text" 
                                                value={susCardNumber} 
                                                onChange={e => setSusCardNumber(maskSUS(e.target.value))} 
                                                placeholder="000 0000 0000 0000" 
                                                maxLength={18}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-stone-600 mb-1 text-sm font-semibold">Nome da Mãe *</label>
                                        <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} placeholder="Nome completo da mãe" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
                                    </div>

                                    <div className="border-t pt-4">
                                        <label className="block text-stone-600 mb-1 text-sm font-semibold">Endereço Residencial (Guaranésia) *</label>
                                        
                                        <input 
                                            type="text" 
                                            value={street} 
                                            onChange={e => setStreet(e.target.value)} 
                                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 mb-2" 
                                            placeholder="Rua / Logradouro" 
                                        />
                                        
                                        <div className="flex gap-2 mb-2">
                                            <input 
                                                type="text" 
                                                value={number} 
                                                onChange={e => setNumber(e.target.value)} 
                                                className="w-24 px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" 
                                                placeholder="Nº" 
                                            />
                                            <input 
                                                type="text" 
                                                value={neighborhood} 
                                                onChange={e => setNeighborhood(e.target.value)} 
                                                className="flex-grow px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" 
                                                placeholder="Bairro" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                             <div className="mb-4">
                                <label className="block text-stone-600 mb-1 text-sm font-semibold" htmlFor="phone">Celular (WhatsApp) *</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    value={phone} 
                                    onChange={e => setPhone(maskPhone(e.target.value))} 
                                    maxLength={15}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" 
                                    placeholder="(35) 99999-9999" 
                                />
                            </div>
                             <div className="mb-6">
                                <label className="block text-stone-600 mb-1 text-sm font-semibold" htmlFor="password">Senha *</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3 pb-2">
                                {activeTab === 'signup' ? (
                                    <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-300 flex justify-center items-center shadow-md">
                                        <FaceIdIcon />
                                        <span className="ml-2">Continuar para Biometria</span>
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading} className="w-full bg-stone-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-stone-900 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center shadow-md">
                                        {loading ? 'Acessando...' : (
                                            <>
                                                <LockClosedIcon />
                                                <span>Acessar Conta</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}

                {step === 'biometrics' && renderBiometricStep()}

            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};