
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

// --- Icons ---
export const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4zm0 10h6v6H4zm10-10h6v6h-6zm0 10h6v6h-6z"></path></svg>
);
export const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
);
// FIX: Added missing InstagramIcon
export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>
);
// FIX: Added missing WebsiteIcon
export const WebsiteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
);
export const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 00-2 2h2zm0 13l-4-4h8l-4 4zm0 0V8m-4 5h8m-8 0a4 4 0 100 8h0a4 4 0 100-8z"></path></svg>
);
export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
);
export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
);
export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
export const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
export const PencilIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>

// --- UI & Helper Components ---
export const InputField: React.FC<{label: string, name: string, value: string, onChange: any, placeholder?: string, type?: string}> = ({label, name, value, onChange, placeholder, type = 'text'}) => (
    <div className="group">
        <label htmlFor={name} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
        <input 
          id={name} 
          name={name} 
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400" 
        />
    </div>
);

export const TextAreaField: React.FC<{label: string, name: string, value: string, onChange: any}> = ({label, name, value, onChange}) => (
    <div className="group">
        <label htmlFor={name} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
        <textarea 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          rows={3} 
          className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
        ></textarea>
    </div>
);

export const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, options: {value: string, label: string}[]}> = ({label, name, value, onChange, options}) => (
    <div className="group">
        <label htmlFor={name} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
        <select 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="mt-1 block w-full pl-4 pr-10 py-3 bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 rounded-xl appearance-none"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-white transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">
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
            <div className="text-center">
                <p className="text-slate-600 mb-6">{t('newCustomerQrModalDesc')}</p>
                <div className="bg-white p-4 rounded-3xl border shadow-inner inline-block mx-auto">
                  {qrDataUrl ? (
                      <img src={qrDataUrl} alt="New Customer QR Code" className="w-64 h-64 mx-auto rounded-xl" />
                  ) : (
                      <div className="flex justify-center items-center h-64 w-64">
                          <Spinner />
                      </div>
                  )}
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
        <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed">{t('customerSetupPrompt')}</p>
            <InputField label={t('name')} name="setup-name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. John Doe" />
            <InputField label={t('phoneNumber')} name="setup-phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="e.g. +30 69..." />
        </div>
        <div className="mt-8">
          <button 
            onClick={handleSave} 
            disabled={!name.trim() || !phone.trim()}
            className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {t('save')}
          </button>
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
                            img { max-width: 80%; border-radius: 16px; border: 1px solid #e2e8f0; }
                            h2 { margin-bottom: 5px; font-size: 24px; }
                            p { margin-top: 0; color: #64748b; font-size: 14px; }
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
            <div className="text-center space-y-6">
                <div className="bg-white p-4 rounded-3xl border shadow-inner inline-block mx-auto">
                   <img src={customer.qr_data_url} alt={`QR Code for ${customer.name}`} className="w-56 h-56 mx-auto rounded-xl" />
                </div>
                
                <div className="text-left bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                    <p className="text-sm"><span className="font-semibold text-slate-500 uppercase tracking-tighter mr-2">Phone:</span> <span className="text-slate-900">{customer.phone_number}</span></p>
                    <p className="text-sm"><span className="font-semibold text-slate-500 uppercase tracking-tighter mr-2">Token:</span> <code className="text-indigo-600 bg-indigo-50 px-1 rounded">{customer.qr_token}</code></p>
                </div>
                
                <button
                    onClick={handlePrint}
                    className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
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
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ['#6366f1', '#10b981', '#f59e0b'] });
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('giftWon')}>
            <div className="text-center space-y-4">
                <div className="bg-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <GiftIcon className="h-12 w-12 text-amber-500" />
                </div>
                <p className="text-xl font-bold text-slate-800">{rewardMessage}</p>
                <p className="text-slate-500 text-sm">{t('giftWonMessage')}</p>
                 <button
                    onClick={onClose}
                    className="mt-6 w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95"
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
                scanner.start({ facingMode }, { fps: 10, qrbox: { width: 250, height: 250 } }, (decodedText: string) => { onScan(decodedText); }, (errorMessage: string) => {}).catch((err: any) => {
                    setError("Could not start camera. Please grant permission.");
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
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-square">
               <div id={scannerId} className="w-full" />
               <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40"></div>
            </div>
            {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}
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
        html5Qrcode.start({ facingMode: "user" }, { fps: 10, qrbox: { width: 250, height: 250 } },
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
                    } else { setError('Not a valid customer QR code.'); }
                } catch (e) { setError(t('errorUnexpected')); }
            },
            (errorMessage: string) => {}
        ).catch((err: any) => { setError("Could not start camera. Please grant permission."); });
    }, [businessId, onScanSuccess, t]);

    useEffect(() => {
        if (isOpen) { const timer = setTimeout(startScanner, 300); return () => clearTimeout(timer); }
        else {
            if (qrScannerRef.current?.isScanning) { qrScannerRef.current.stop().catch((err: any) => {}); }
            setScanResult(null); setError(null);
        }
    }, [isOpen, startScanner]);

    const resultColor = scanResult?.success ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100';
    const showScannerView = !scanResult && !error;

    return (
        <>
            <RewardModal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} rewardMessage={rewardMessage} />
            <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
                <div style={{ display: showScannerView ? 'block' : 'none' }}>
                    <div className="relative overflow-hidden rounded-3xl bg-black aspect-square shadow-inner">
                      <div id={scannerContainerId} className="w-full" />
                    </div>
                </div>
                
                <div className="mt-6 w-full">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('scanResult')}</h2>
                    <div className={`p-6 rounded-3xl text-center font-semibold min-h-[140px] flex flex-col justify-center border-2 transition-all ${showScannerView ? 'bg-slate-50 border-slate-100' : ''} ${scanResult ? resultColor : ''} ${error ? 'bg-rose-50 text-rose-800 border-rose-100' : ''}`}>
                        {showScannerView ? (
                             <div className="flex flex-col items-center gap-2"><Spinner className="w-6 h-6 text-indigo-400"/><p className="text-slate-400 animate-pulse">Scanning...</p></div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {scanResult ? (
                                    <div className="space-y-1">
                                        <p className="text-lg">{scanResult.message}</p>
                                        {scanResult.customer && <p className="text-sm opacity-80">Total Points: {scanResult.newPointsTotal}</p>}
                                    </div>
                                ) : (<p>{error}</p>)}
                                <button
                                    onClick={startScanner}
                                    className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95"
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
            <div className="space-y-6">
                <p className="text-sm text-rose-600 font-medium bg-rose-50 border border-rose-100 p-4 rounded-2xl leading-relaxed">{t('deleteAccountWarning')}</p>
                <div className="space-y-2">
                  <p className="text-slate-600 text-sm">{t('deleteAccountPrompt')}</p>
                  <p className="font-bold text-slate-900 text-lg">{customerPhoneNumber}</p>
                </div>
                <InputField label="Confirm Phone Number" name="del-phone" value={inputValue} onChange={(e: any) => setInputValue(e.target.value)} placeholder={customerPhoneNumber} />
                <div className="flex flex-col gap-3 pt-4">
                    <button 
                        onClick={handleDelete}
                        disabled={!isMatch || isDeleting}
                        className="w-full py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-bold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {isDeleting && <Spinner className="h-4 w-4 text-white" />}
                        {t('deleteAccount')}
                    </button>
                    <button onClick={onClose} className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors">{t('cancel')}</button>
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
            <div className="mt-1 border border-slate-200 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-slate-50">
                <div className="p-2 bg-slate-100/50 border-b border-slate-200 flex items-center gap-2">
                    <button type="button" onClick={() => applyStyle('bold')} className="p-2 w-10 h-10 rounded-lg hover:bg-white text-slate-600 font-bold transition-all shadow-sm">B</button>
                    <button type="button" onClick={() => applyStyle('italic')} className="p-2 w-10 h-10 rounded-lg hover:bg-white text-slate-600 italic transition-all shadow-sm">I</button>
                    <button type="button" onClick={() => applyStyle('link')} className="p-2 w-10 h-10 rounded-lg hover:bg-white text-slate-600 transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.596a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </button>
                </div>
                <textarea ref={textareaRef} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} rows={5} className="w-full p-4 bg-transparent border-0 focus:ring-0 text-slate-900" />
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
             <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                <div className="flex flex-col gap-4 pt-6">
                    <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center transition-all active:scale-95">
                        {isSaving && <Spinner className="h-5 w-5 mr-2 text-white" />}
                        {t('createPost')}
                    </button>
                    <button type="button" onClick={onClose} className="w-full py-2 text-slate-500 font-semibold hover:text-slate-700 transition-colors">{t('cancel')}</button>
                </div>
            </form>
        </Modal>
    );
};
