
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Customer, ScanResult, Post } from '../types';
import { awardPoints, createPost } from '../services/api';

declare const Html5Qrcode: any;
declare const confetti: any;


export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8 text-indigo-600' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Logo: React.FC<{ className?: string }> = ({ className = "size-8" }) => (
  <div className={`${className} bg-primary rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-primary/20`}>
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
      <path d="M10 14C18 8 30 20 38 14V34C30 40 18 28 10 34V14Z" fill="currentColor" />
    </svg>
  </div>
);

export const BackButton: React.FC<{ onClick?: () => void; className?: string }> = ({ onClick, className }) => {
    const { t } = useLanguage();
    const handleBack = () => {
        if (onClick) onClick();
        else if (window.history.length > 1) window.history.back();
        else window.location.href = '/';
    };
    return (
        <button 
            onClick={handleBack} 
            className={`group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl text-slate-800 font-bold text-sm hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all active:scale-95 ${className}`}
        >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            {t('back')}
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 p-6 font-sans">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #135bec 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="size-24 bg-indigo-50 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[48px]">{target === 'pc' ? 'desktop_windows' : 'smartphone'}</span>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            {target === 'pc' ? 'PC Exclusive' : 'Mobile Experience'}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {target === 'pc' 
                                ? 'The QRoyal Business Portal is designed for large displays. Please switch to a desktop or laptop.' 
                                : 'The Customer Dashboard is optimized for your mobile device. Please scan your QR code on your smartphone.'}
                        </p>
                    </div>
                    <div className="pt-6">
                        <BackButton className="w-full justify-center py-4 border-2 border-slate-100 bg-slate-50 hover:bg-white" />
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

// --- Icons ---
export const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4zm0 10h6v6H4zm10-10h6v6h-6zm0 10h6v6h-6z"></path></svg>
);
export const WebsiteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
);
export const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 00-2 2h2zm0 13l-4-4h8l-4 4zm0 0V8m-4 5h8m-8 0a4 4 0 100 8h0a4 4 0 100-8z"></path></svg>
);
// Added CameraIcon to fix import error in BusinessPage.tsx
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
// Added FacebookIcon to fix import error in BusinessProfilePage.tsx
export const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
);
// Added InstagramIcon to fix import error in BusinessProfilePage.tsx
export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2Z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5282C13.0901 15.9051 12.2384 16.0356 11.4021 15.8997C10.5658 15.7637 9.78504 15.3671 9.17001 14.7622C8.55498 14.1573 8.1368 13.3859 7.97197 12.5532C7.80714 11.7205 7.90483 10.8549 8.25143 10.0762C8.59804 9.29748 9.17646 8.64437 9.89704 8.21271C10.6176 7.78105 11.4423 7.59196 12.23 7.67C13.892 7.828 15.34 8.928 15.82 10.51C15.938 10.79 16 11.08 16 11.37V11.37Z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M17.5 6.5H17.51"></path></svg>
);
// Added PhoneIcon to fix import error in BusinessProfilePage.tsx
export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
export const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
export const PencilIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>

// --- UI & Helper Components ---
export const InputField: React.FC<{label: string, name: string, value: string, onChange: any, placeholder?: string, type?: string}> = ({label, name, value, onChange, placeholder, type = 'text'}) => (
    <div className="group">
        <label htmlFor={name} className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-primary transition-colors">{label}</label>
        <input 
          id={name} 
          name={name} 
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className="mt-1 block w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 placeholder:text-slate-300 font-medium" 
        />
    </div>
);

export const TextAreaField: React.FC<{label: string, name: string, value: string, onChange: any}> = ({label, name, value, onChange}) => (
    <div className="group">
        <label htmlFor={name} className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-primary transition-colors">{label}</label>
        <textarea 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          rows={3} 
          className="mt-1 block w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 placeholder:text-slate-300 font-medium"
        ></textarea>
    </div>
);

export const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, options: {value: string, label: string}[]}> = ({label, name, value, onChange, options}) => (
    <div className="group">
        <label htmlFor={name} className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-primary transition-colors">{label}</label>
        <div className="relative">
            <select 
                id={name} 
                name={name} 
                value={value} 
                onChange={onChange} 
                className="mt-1 block w-full pl-5 pr-12 py-4 bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 rounded-2xl appearance-none font-bold"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
        </div>
    </div>
);


// --- Modals ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-400 overflow-hidden border border-white/20">
        <div className="flex justify-between items-center p-8 border-b border-slate-50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{title}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 p-2 rounded-full hover:bg-slate-50 transition-all active:scale-90">
             <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>
        <div className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const CreateCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    qrDataUrl: string;
}> = ({ isOpen, onClose, qrDataUrl }) => {
    const { t } = useLanguage();
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('newCustomerQrModalTitle')}>
            <div className="text-center space-y-8">
                <p className="text-slate-500 font-medium leading-relaxed">{t('newCustomerQrModalDesc')}</p>
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-inner inline-block mx-auto">
                  {qrDataUrl ? (
                      <img src={qrDataUrl} alt="New Customer QR Code" className="w-64 h-64 mx-auto rounded-2xl shadow-xl border-4 border-white" />
                  ) : (
                      <div className="flex justify-center items-center h-64 w-64">
                          <Spinner />
                      </div>
                  )}
                </div>
                <div className="pt-4">
                    <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">{t('close')}</button>
                </div>
            </div>
        </Modal>
    );
};

export const CustomerSetupModal: React.FC<{
    isOpen: boolean;
    onSave: (details: { name: string; phone: string }) => void;
}> = ({ isOpen, onSave }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSave = () => {
        if (name.trim() && phone.trim()) {
            onSave({ name: name.trim(), phone: phone.trim() });
        }
    };
    
    const handleClose = () => {};

    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t('customerSetup')}>
        <div className="space-y-8">
            <p className="text-slate-500 font-medium leading-relaxed">{t('customerSetupPrompt')}</p>
            <InputField label={t('name')} name="setup-name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. John Doe" />
            <InputField label={t('phoneNumber')} name="setup-phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="e.g. +30 69..." />
            <div className="pt-4">
              <button 
                onClick={handleSave} 
                disabled={!name.trim() || !phone.trim()}
                className="w-full bg-primary text-white font-black py-4 px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {t('save')}
              </button>
            </div>
        </div>
      </Modal>
    );
};

export const CustomerQRModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}> = ({ isOpen, onClose, customer }) => {
    const { t } = useLanguage();

    const handlePrint = () => {
        if (!customer) return;
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR for ${customer.name}</title>
                        <style>
                            body { font-family: sans-serif; text-align: center; padding: 40px; color: #1e293b; }
                            img { max-width: 80%; border-radius: 24px; border: 1px solid #e2e8f0; }
                            h2 { margin-bottom: 5px; font-size: 24px; font-weight: 900; }
                            p { margin-top: 0; color: #64748b; font-size: 14px; font-weight: 600; }
                        </style>
                    </head>
                    <body>
                        <h2>${customer.name}</h2>
                        <p>${customer.phone_number || ''}</p>
                        <img src="${customer.qr_data_url}" alt="Customer QR Code" />
                        <script>window.onload = function() { window.print(); window.close(); };</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    if (!customer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={customer.name}>
            <div className="text-center space-y-10">
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-inner inline-block mx-auto">
                   <img src={customer.qr_data_url} alt={`QR Code for ${customer.name}`} className="w-56 h-56 mx-auto rounded-2xl shadow-xl border-4 border-white" />
                </div>
                
                <div className="text-left bg-slate-50 p-6 rounded-[2rem] space-y-3 border border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                        <p className="text-slate-900 font-bold">{customer.phone_number}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Token</p>
                        <code className="text-primary font-black text-sm bg-primary/5 px-2 py-0.5 rounded-lg">{customer.qr_token}</code>
                    </div>
                </div>
                
                <button
                    onClick={handlePrint}
                    className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
                >
                    <span className="material-symbols-outlined">print</span>
                    {t('printQr')}
                </button>
            </div>
        </Modal>
    );
};

export const RewardModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    rewardMessage: string;
}> = ({ isOpen, onClose, rewardMessage }) => {
    const { t } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#135bec', '#C5A059', '#ffffff'] });
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('giftWon')}>
            <div className="text-center space-y-8 py-4">
                <div className="bg-amber-50 size-28 rounded-full flex items-center justify-center mx-auto animate-bounce border-4 border-white shadow-xl shadow-amber-200/50">
                  <GiftIcon className="size-14 text-amber-500" />
                </div>
                <div className="space-y-2">
                    <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{rewardMessage}</p>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed px-4">{t('giftWonMessage')}</p>
                </div>
                 <button
                    onClick={onClose}
                    className="mt-6 w-full bg-slate-900 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl"
                >
                    {t('close')}
                </button>
            </div>
        </Modal>
    );
};

export const QRScannerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onScan: (scannedText: string) => void;
    facingMode?: 'user' | 'environment';
}> = ({ isOpen, onClose, onScan, facingMode = 'environment' }) => {
    const { t } = useLanguage();
    const scannerId = "qr-scanner-modal";
    const qrScannerRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const timerId = setTimeout(() => {
                const scanner = new Html5Qrcode(scannerId);
                qrScannerRef.current = scanner;
                scanner.start({ facingMode }, { fps: 15, qrbox: { width: 250, height: 250 } }, (decodedText: string) => { onScan(decodedText); }, (errorMessage: string) => {}).catch((err: any) => {
                    setError("Camera access denied or unavailable.");
                });
            }, 100);
            return () => {
                clearTimeout(timerId);
                if (qrScannerRef.current && qrScannerRef.current.isScanning) {
                    qrScannerRef.current.stop().catch((err: any) => {});
                }
            };
        }
    }, [isOpen, onScan, facingMode]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-black aspect-square shadow-2xl">
               <div id={scannerId} className="w-full h-full" />
               <div className="absolute inset-0 pointer-events-none border-[60px] border-black/40"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[180px] border-2 border-white/50 rounded-3xl"></div>
            </div>
            {error && <p className="text-rose-500 text-center mt-6 font-bold text-sm bg-rose-50 p-4 rounded-2xl">{error}</p>}
        </Modal>
    );
};

export const BusinessScannerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    onScanSuccess: (result: ScanResult) => void;
}> = ({ isOpen, onClose, businessId, onScanSuccess }) => {
    const { t } = useLanguage();
    const scannerContainerId = "business-qr-scanner";
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    const [rewardMessage, setRewardMessage] = useState('');
    const qrScannerRef = useRef<any>(null);

    const startScanner = useCallback(() => {
        if (!qrScannerRef.current) { qrScannerRef.current = new Html5Qrcode(scannerContainerId); }
        const html5Qrcode = qrScannerRef.current;
        if (html5Qrcode.isScanning) return;
        setScanResult(null);
        setError(null);
        html5Qrcode.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } },
            async (decodedText: string) => {
                if (html5Qrcode.isScanning) { try { await html5Qrcode.stop(); } catch (e) {} }
                try {
                    let token = decodedText;
                    try { const url = new URL(decodedText); if (url.pathname === '/customer' && url.searchParams.has('token')) { token = url.searchParams.get('token')!; } } catch (e) {}
                    if (token.startsWith('cust_')) {
                       const result = await awardPoints(token, businessId);
                       setScanResult(result);
                       onScanSuccess(result);
                       if (result.success && result.rewardWon) { setRewardMessage(result.rewardMessage || t('giftWonMessage')); setIsRewardModalOpen(true); }
                    } else { setError('Invalid QRoyal ID Code.'); }
                } catch (e) { setError(t('errorUnexpected')); }
            },
            (errorMessage: string) => {}
        ).catch((err: any) => { setError("Could not access tablet camera."); });
    }, [businessId, onScanSuccess, t]);

    useEffect(() => {
        if (isOpen) { const timer = setTimeout(startScanner, 300); return () => clearTimeout(timer); }
        else {
            if (qrScannerRef.current?.isScanning) { qrScannerRef.current.stop().catch((err: any) => {}); }
            setScanResult(null); setError(null);
        }
    }, [isOpen, startScanner]);

    const showScannerView = !scanResult && !error;

    return (
        <>
            <RewardModal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} rewardMessage={rewardMessage} />
            <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
                <div style={{ display: showScannerView ? 'block' : 'none' }}>
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-black aspect-square shadow-2xl">
                      <div id={scannerContainerId} className="w-full" />
                      <div className="absolute inset-0 pointer-events-none border-[60px] border-black/40"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[180px] border-2 border-white/50 rounded-3xl"></div>
                    </div>
                </div>
                
                <div className="mt-8 w-full">
                    <div className={`p-8 rounded-[2.5rem] text-center font-semibold min-h-[160px] flex flex-col justify-center border-2 transition-all duration-500 ${showScannerView ? 'bg-slate-50 border-slate-100' : ''} ${scanResult?.success ? 'bg-emerald-50 text-emerald-900 border-emerald-100' : ''} ${error || (scanResult && !scanResult.success) ? 'bg-rose-50 text-rose-900 border-rose-100' : ''}`}>
                        {showScannerView ? (
                             <div className="flex flex-col items-center gap-4">
                                <Spinner className="size-8 text-primary/40"/>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Position ID Card in frame</p>
                             </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {scanResult ? (
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black tracking-tight">{scanResult.message}</p>
                                        {scanResult.customer && <p className="text-sm font-bold opacity-60">Total Points Wallet: {scanResult.newPointsTotal}</p>}
                                    </div>
                                ) : (<p className="text-xl font-black">{error}</p>)}
                                <button
                                    onClick={startScanner}
                                    className="mt-8 w-full bg-slate-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                                >
                                    {t('scanNext')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export const DeleteAccountModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    customerPhoneNumber: string;
}> = ({ isOpen, onClose, onConfirm, customerPhoneNumber }) => {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const isMatch = inputValue === customerPhoneNumber;

    const handleDelete = async () => { if (!isMatch) return; setIsDeleting(true); await onConfirm(); setIsDeleting(false); };

    useEffect(() => { if (!isOpen) setInputValue(''); }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('deleteAccountConfirmTitle')}>
            <div className="space-y-8">
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] space-y-2">
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{t('deleteAccountWarning')}</p>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">{t('deleteAccountPrompt')}</p>
                    <p className="font-black text-rose-900 text-lg">{customerPhoneNumber}</p>
                </div>
                <InputField label="Verify Phone Number" name="del-phone" value={inputValue} onChange={(e: any) => setInputValue(e.target.value)} placeholder={customerPhoneNumber} />
                <div className="flex flex-col gap-4 pt-4">
                    <button 
                        onClick={handleDelete}
                        disabled={!isMatch || isDeleting}
                        className="w-full py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        {isDeleting && <Spinner className="size-5 text-white" />}
                        {t('deleteAccount')}
                    </button>
                    <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase text-[10px] tracking-[0.2em]">{t('cancel')}</button>
                </div>
            </div>
        </Modal>
    );
};

export const MarkdownEditor: React.FC<{ label: string; name: string; value: string; onChange: (name: string, value: string) => void }> = ({ label, name, value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const applyStyle = (style: 'bold' | 'italic' | 'link') => {
        const textarea = textareaRef.current; if (!textarea) return;
        const start = textarea.selectionStart; const end = textarea.selectionEnd; const selectedText = value.substring(start, end); let newText;
        switch (style) {
            case 'bold': newText = `**${selectedText}**`; break;
            case 'italic': newText = `*${selectedText}*`; break;
            case 'link': const url = prompt('Enter the URL:'); if (url) newText = `[${selectedText}](${url})`; else return; break;
        }
        onChange(name, value.substring(0, start) + newText + value.substring(end));
    };

    return (
        <div className="group">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-primary transition-colors">{label}</label>
            <div className="mt-1 border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary transition-all bg-slate-50/50">
                <div className="p-3 bg-white/50 border-b border-slate-200 flex items-center gap-2">
                    <button type="button" onClick={() => applyStyle('bold')} className="size-10 rounded-xl hover:bg-white text-slate-700 font-black transition-all shadow-sm flex items-center justify-center">B</button>
                    <button type="button" onClick={() => applyStyle('italic')} className="size-10 rounded-xl hover:bg-white text-slate-700 italic transition-all shadow-sm flex items-center justify-center">I</button>
                    <button type="button" onClick={() => applyStyle('link')} className="size-10 rounded-xl hover:bg-white text-slate-700 transition-all shadow-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">link</span>
                    </button>
                </div>
                <textarea ref={textareaRef} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} rows={5} className="w-full p-6 bg-transparent border-0 focus:ring-0 text-slate-900 font-medium" />
            </div>
        </div>
    );
};

export const CreatePostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    onSuccess: () => void;
}> = ({ isOpen, onClose, businessId, onSuccess }) => {
    const { t } = useLanguage();
    const [formState, setFormState] = useState<Omit<Post, 'id' | 'business_id' | 'created_at'>>({ title: '', content: '', image_url: '', post_type: 'standard', video_url: '', price_text: '', external_url: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setFormState(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleMarkdownChange = (name: string, value: string) => { setFormState(prev => ({...prev, [name]: value})); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSaving(true);
        const result = await createPost({ ...formState, business_id: businessId });
        setIsSaving(false);
        if (result) { onSuccess(); onClose(); setFormState({ title: '', content: '', image_url: '', post_type: 'standard', video_url: '', price_text: '', external_url: '' }); }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('newPost')}>
             <form onSubmit={handleSubmit} className="space-y-8">
                <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                <div className="flex flex-col gap-4 pt-6">
                    <button type="submit" disabled={isSaving} className="w-full bg-primary text-white font-black py-5 px-6 rounded-[1.5rem] hover:bg-blue-700 disabled:bg-slate-200 flex items-center justify-center transition-all shadow-xl shadow-primary/20 active:scale-95">
                        {isSaving && <Spinner className="size-5 mr-3 text-white" />}
                        {t('createPost')}
                    </button>
                    <button type="button" onClick={onClose} className="w-full py-2 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase text-[10px] tracking-[0.2em]">{t('cancel')}</button>
                </div>
            </form>
        </Modal>
    );
};
