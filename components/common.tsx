import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Customer, ScanResult, Post } from '../types';
import { awardPoints, createPost } from '../services/api';

declare const Html5Qrcode: any;
declare const confetti: any;

export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8 text-[#2bee6c]' }) => (
  <div className={`relative ${className}`}>
      <svg className="animate-spin size-full" viewBox="0 0 24 24">
        <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
        <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
  </div>
);

export const PageLoader: React.FC = () => (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
            <div className="size-24 bg-[#2bee6c] rounded-[2rem] flex items-center justify-center p-4 animate-pulse">
                <svg viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#163a24]">
                    <path d="M216,40H56A16,16,0,0,0,40,56V216a8,8,0,0,0,16,0V144h80l8.3,16.6a8.23,8.23,0,0,0,7.2,4.4H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,112H154.9l-8.3-16.6a8.23,8.23,0,0,0-7.2-4.4H56V56H216Z"></path>
                </svg>
            </div>
            <div className="absolute inset-[-12px] border-2 border-[#2bee6c]/20 rounded-[2.5rem] animate-[ping_2s_infinite]"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#163a24] animate-pulse">Initializing Identity</p>
            <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2bee6c] animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
            </div>
        </div>
        <style>{`
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(250%); }
            }
        `}</style>
    </div>
);

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [isSlashing, setIsSlashing] = useState(false);

    useEffect(() => {
        const slashTimer = setTimeout(() => setIsSlashing(true), 2000);
        const finishTimer = setTimeout(onComplete, 2900);
        return () => {
            clearTimeout(slashTimer);
            clearTimeout(finishTimer);
        };
    }, [onComplete]);

    return (
        <div 
            className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] ${isSlashing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
            style={{ 
                clipPath: isSlashing ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : 'none',
                borderRadius: isSlashing ? '0 0 100% 100%' : '0'
            }}
        >
            <div className={`relative transform transition-all duration-700 ${isSlashing ? 'scale-90 opacity-0 -translate-y-20' : 'scale-100 opacity-100'}`}>
                <div className="size-32 bg-[#2bee6c] rounded-[2.5rem] flex items-center justify-center p-6 shadow-2xl shadow-green-100 animate-in zoom-in-50 duration-700">
                    <svg viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#163a24]">
                        <path d="M216,40H56A16,16,0,0,0,40,56V216a8,8,0,0,0,16,0V144h80l8.3,16.6a8.23,8.23,0,0,0,7.2,4.4H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,112H154.9l-8.3-16.6a8.23,8.23,0,0,0-7.2-4.4H56V56H216Z"></path>
                    </svg>
                </div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max">
                   <h1 className="text-2xl font-black tracking-[0.4em] text-[#163a24] animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700 uppercase">QROYAL</h1>
                </div>
            </div>
            
            <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#2bee6c]/10 to-transparent transition-opacity duration-500 ${isSlashing ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
};

export const Logo: React.FC<{ className?: string }> = ({ className = "size-8" }) => (
    <div className={`${className} bg-[#2bee6c] rounded-xl flex items-center justify-center p-1.5`}>
        <svg viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#163a24]">
            <path d="M216,40H56A16,16,0,0,0,40,56V216a8,8,0,0,0,16,0V144h80l8.3,16.6a8.23,8.23,0,0,0,7.2,4.4H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,112H154.9l-8.3-16.6a8.23,8.23,0,0,0-7.2-4.4H56V56H216Z"></path>
        </svg>
    </div>
);

export const FlagLogo = Logo;

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "size-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.244 2.244 0 0 1-2.244 2.077H8.084a2.244 2.244 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className = "size-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export const BackButton: React.FC<{ onClick?: () => void; className?: string }> = ({ onClick, className }) => {
    const handleBack = () => {
        if (onClick) onClick();
        else window.location.href = '/';
    };
    return (
        <button 
            onClick={handleBack} 
            className={`group flex items-center justify-center p-3 bg-[#2bee6c]/10 rounded-2xl text-[#163a24] hover:bg-[#2bee6c]/20 transition-all active:scale-90 ${className}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
        </button>
    );
};

export const DeviceGuard: React.FC<{ children: React.ReactNode; target: 'mobile' | 'pc' }> = ({ children, target }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const { t } = useLanguage();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isWrongDevice = (target === 'mobile' && !isMobile) || (target === 'pc' && isMobile);

    if (isWrongDevice) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#ffffff] p-6 font-display">
                <div className="w-full max-w-md bg-white rounded-[3rem] border border-slate-100 p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="size-20 bg-[#163a24] text-[#2bee6c] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                        <FlagLogo className="size-12 !bg-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-[#163a24] tracking-tighter">
                            {target === 'pc' ? 'Desktop Gateway' : 'Mobile Access'}
                        </h2>
                        <p className="text-[#4c9a66] font-medium leading-relaxed">
                            {target === 'pc' 
                                ? 'The QRoyal Hub is optimized for large displays.' 
                                : 'The Digital Wallet lives on your phone. Scan with your camera.'}
                        </p>
                    </div>
                    <div className="pt-6">
                        <BackButton className="w-full justify-center py-4 border-none bg-[#163a24] text-[#2bee6c]" />
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export const InputField: React.FC<{label: string, name: string, value: string, onChange: any, placeholder?: string, type?: string}> = ({label, name, value, onChange, placeholder, type = 'text'}) => (
    <div className="group">
        <label htmlFor={name} className="block text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.2em] mb-3 transition-colors pl-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-[#2bee6c] focus:ring-0 transition-all text-[#163a24] placeholder:text-[#4c9a66]/30 font-medium" />
    </div>
);

export const TextAreaField: React.FC<{label: string, name: string, value: string, onChange: any}> = ({label, name, value, onChange}) => (
    <div className="group">
        <label htmlFor={name} className="block text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.2em] mb-3 transition-colors pl-1">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={4} className="mt-1 block w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-[#2bee6c] focus:ring-0 transition-all text-[#163a24] placeholder:text-[#4c9a66]/30 font-medium"></textarea>
    </div>
);

export const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, options: {value: string, label: string}[]}> = ({label, name, value, onChange, options}) => (
    <div className="group">
        <label htmlFor={name} className="block text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.2em] mb-3 transition-colors pl-1">{label}</label>
        <div className="relative">
            <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full pl-6 pr-12 py-4 bg-white border border-slate-100 focus:outline-none focus:border-[#2bee6c] transition-all text-[#163a24] rounded-2xl appearance-none font-bold">
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-[#4c9a66] pointer-events-none">expand_more</span>
        </div>
    </div>
);

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#163a24]/20 backdrop-blur-sm z-[110] flex justify-center items-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-400 overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center p-10 border-b border-slate-50">
          <h3 className="text-2xl font-black text-[#163a24] tracking-tighter">{title}</h3>
          <button onClick={onClose} className="text-[#4c9a66] hover:text-[#163a24] p-2 rounded-full hover:bg-slate-50 transition-all">
             <span className="material-icons-round text-[28px]">close</span>
          </button>
        </div>
        <div className="p-10 max-h-[80vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const CreateCustomerModal: React.FC<{ isOpen: boolean; onClose: () => void; qrDataUrl: string; }> = ({ isOpen, onClose, qrDataUrl }) => {
    const { t } = useLanguage();
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('newCustomerQrModalTitle')}>
            <div className="text-center space-y-8">
                <p className="text-[#4c9a66] font-medium leading-relaxed">{t('newCustomerQrModalDesc')}</p>
                <div className="bg-white p-8 rounded-[3rem] border border-slate-50 inline-block mx-auto relative group">
                  <div className="absolute inset-0 bg-[#2bee6c]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR" className="w-64 h-64 mx-auto rounded-xl relative z-10" />
                  ) : (
                      <div className="flex justify-center items-center h-64 w-64 relative z-10"><Spinner /></div>
                  )}
                </div>
                <button onClick={onClose} className="w-full py-4 bg-[#163a24] text-[#2bee6c] rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">{t('close')}</button>
            </div>
        </Modal>
    );
};

export const CustomerSetupModal: React.FC<{ isOpen: boolean; onSave: (details: { name: string; phone: string }) => void; }> = ({ isOpen, onSave }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const handleSave = () => { if (name.trim() && phone.trim()) onSave({ name: name.trim(), phone: phone.trim() }); };
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title={t('customerSetup')}>
        <div className="space-y-8">
            <InputField label={t('name')} name="setup-name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Full Name" />
            <InputField label={t('phoneNumber')} name="setup-phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="+30 ..." />
            <button onClick={handleSave} disabled={!name.trim() || !phone.trim()} className="w-full bg-[#2bee6c] text-[#163a24] font-black py-4 px-6 rounded-2xl active:scale-95 disabled:opacity-30 transition-all">
                {t('save')}
            </button>
        </div>
      </Modal>
    );
};

export const QRScannerModal: React.FC<{ isOpen: boolean; onClose: () => void; onScan: (scannedText: string) => void; facingMode?: 'user' | 'environment'; }> = ({ isOpen, onClose, onScan, facingMode = 'environment' }) => {
    const { t } = useLanguage();
    const scannerId = "qr-scanner-modal";
    const qrScannerRef = useRef<any>(null);
    useEffect(() => {
        if (isOpen) {
            const timerId = setTimeout(() => {
                const scanner = new Html5Qrcode(scannerId);
                qrScannerRef.current = scanner;
                scanner.start({ facingMode }, { fps: 15, qrbox: { width: 250, height: 250 } }, (decodedText: string) => { onScan(decodedText); }, (errorMessage: string) => {}).catch((err: any) => {});
            }, 100);
            return () => {
                clearTimeout(timerId);
                if (qrScannerRef.current && qrScannerRef.current.isScanning) qrScannerRef.current.stop().catch((err: any) => {});
            };
        }
    }, [isOpen, onScan, facingMode]);
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#163a24] aspect-square">
               <div id={scannerId} className="w-full h-full" />
            </div>
        </Modal>
    );
};

export const BusinessScannerModal: React.FC<{ isOpen: boolean; onClose: () => void; businessId: string; onScanSuccess: (result: ScanResult) => void; }> = ({ isOpen, onClose, businessId, onScanSuccess }) => {
    const { t } = useLanguage();
    const scannerContainerId = "business-qr-scanner";
    const qrScannerRef = useRef<any>(null);
    const startScanner = useCallback(() => {
        if (!qrScannerRef.current) qrScannerRef.current = new Html5Qrcode(scannerContainerId);
        const html5Qrcode = qrScannerRef.current;
        if (html5Qrcode.isScanning) return;
        html5Qrcode.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } },
            async (decodedText: string) => {
                if (html5Qrcode.isScanning) { try { await html5Qrcode.stop(); } catch (e) {} }
                try {
                    let token = decodedText;
                    try { const url = new URL(decodedText); if (url.pathname === '/customer' && url.searchParams.has('token')) token = url.searchParams.get('token')!; } catch (e) {}
                    if (token.startsWith('cust_')) {
                       const result = await awardPoints(token, businessId);
                       onScanSuccess(result);
                       onClose();
                    }
                } catch (e) {}
            }, (errorMessage: string) => {}
        ).catch((err: any) => {});
    }, [businessId, onScanSuccess, onClose]);
    useEffect(() => {
        if (isOpen) { const timer = setTimeout(startScanner, 300); return () => clearTimeout(timer); }
        else if (qrScannerRef.current?.isScanning) qrScannerRef.current.stop().catch((err: any) => {});
    }, [isOpen, startScanner]);
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#163a24] aspect-square">
              <div id={scannerContainerId} className="w-full h-full" />
            </div>
        </Modal>
    );
};

export const DeleteAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => Promise<void>; customerPhoneNumber: string; }> = ({ isOpen, onClose, onConfirm, customerPhoneNumber }) => {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const isMatch = inputValue === customerPhoneNumber;
    const handleDelete = async () => { if (!isMatch) return; setIsDeleting(true); await onConfirm(); setIsDeleting(false); };
    useEffect(() => { if (!isOpen) setInputValue(''); }, [isOpen]);
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('deleteAccountConfirmTitle')}>
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">{t('deleteAccountWarning')}</p>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">{t('deleteAccountPrompt')}</p>
                </div>
                <InputField label="Verify Mobile" name="del-phone" value={inputValue} onChange={(e: any) => setInputValue(e.target.value)} placeholder={customerPhoneNumber} />
                <button onClick={handleDelete} disabled={!isMatch || isDeleting} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black disabled:opacity-30 transition-all">
                    {isDeleting ? 'Deleting...' : t('deleteAccount')}
                </button>
            </div>
        </Modal>
    );
};

export const MarkdownEditor: React.FC<{ label: string; name: string; value: string; onChange: (name: string, value: string) => void }> = ({ label, name, value, onChange }) => (
    <div className="group">
        <label className="block text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.2em] mb-3 transition-colors pl-1">{label}</label>
        <textarea name={name} value={value} onChange={(e) => onChange(name, e.target.value)} rows={5} className="w-full p-8 bg-white border border-slate-100 rounded-[3rem] focus:outline-none focus:border-[#2bee6c] text-[#163a24] font-medium transition-all" />
    </div>
);