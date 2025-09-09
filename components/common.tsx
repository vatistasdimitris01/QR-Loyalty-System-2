import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Customer, ScanResult, Post } from '../types';
import { awardPoints, createPost } from '../services/api';

declare const Html5Qrcode: any;
declare const confetti: any;


export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8 text-black' }) => (
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
export const UserAddIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
);
export const WebsiteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
);
export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.058 1.281-.072 1.689-.072 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
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
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
);
export const TextAreaField: React.FC<{label: string, name: string, value: string, onChange: any}> = ({label, name, value, onChange}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
    </div>
);
export const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, options: {value: string, label: string}[]}> = ({label, name, value, onChange, options}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
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
                <p className="text-gray-600 mb-4">{t('newCustomerQrModalDesc')}</p>
                {qrDataUrl ? (
                    <img src={qrDataUrl} alt="New Customer QR Code" className="w-64 h-64 mx-auto rounded-lg" />
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                )}
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
    
    // This modal should not be closable by clicking outside
    const handleClose = () => {};

    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t('customerSetup')}>
        <div className="space-y-4">
            <p className="text-gray-600 mb-4">{t('customerSetupPrompt')}</p>
            <div>
                <label htmlFor="setup-name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
                <input 
                    id="setup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    required
                />
            </div>
             <div>
                <label htmlFor="setup-phone" className="block text-sm font-medium text-gray-700">{t('phoneNumber')}</label>
                <input 
                    id="setup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. +30 69..."
                    required
                />
            </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={!name.trim() || !phone.trim()}
            className="w-full bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
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
                            body { font-family: sans-serif; text-align: center; padding: 40px; }
                            img { max-width: 80%; border-radius: 8px; }
                            h2 { margin-bottom: 5px; }
                            p { margin-top: 0; color: #555; }
                        </style>
                    </head>
                    <body>
                        <h2>${customer.name}</h2>
                        <p>${customer.phone_number || ''}</p>
                        <img src="${customer.qr_data_url}" alt="Customer QR Code" />
                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    if (!customer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Details for ${customer.name}`}>
            <div className="text-center space-y-4">
                <img src={customer.qr_data_url} alt={`QR Code for ${customer.name}`} className="w-56 h-56 mx-auto rounded-lg border" />
                
                <div className="text-left bg-gray-50 p-3 rounded-lg">
                    <p><strong>Name:</strong> {customer.name}</p>
                    <p><strong>Phone:</strong> {customer.phone_number}</p>
                    <p><strong>ID:</strong> <code className="text-sm">{customer.id}</code></p>
                    <p><strong>Token:</strong> <code className="text-sm">{customer.qr_token}</code></p>
                </div>
                
                <button
                    onClick={handlePrint}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('giftWon')}>
            <div className="text-center">
                <GiftIcon className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                <p className="text-lg text-gray-700">{rewardMessage}</p>
                 <button
                    onClick={onClose}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
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

                scanner.start(
                    { facingMode },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText: string) => {
                        onScan(decodedText);
                    },
                    (errorMessage: string) => {}
                ).catch((err: any) => {
                    console.error("Unable to start scanning.", err);
                    setError("Could not start camera. Please grant permission.");
                });
            }, 100);

            return () => {
                clearTimeout(timerId);
                if (qrScannerRef.current && qrScannerRef.current.isScanning) {
                    qrScannerRef.current.stop().catch((err: any) => {
                        console.warn("QR Scanner stop failed, likely already stopped.", err);
                    });
                }
            };
        }
    }, [isOpen, onScan, facingMode]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
            <div id={scannerId} className="w-full" />
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
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
        if (!qrScannerRef.current) {
            qrScannerRef.current = new Html5Qrcode(scannerContainerId);
        }
        
        const html5Qrcode = qrScannerRef.current;
        
        if (html5Qrcode.isScanning) {
            return;
        }

        setScanResult(null);
        setError(null);

        html5Qrcode.start(
            { facingMode: "user" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText: string) => {
                if (html5Qrcode.isScanning) {
                    try {
                        await html5Qrcode.stop();
                    } catch (e) {
                        console.warn("Error stopping scanner after scan:", e);
                    }
                }
                
                try {
                    let token = decodedText;
                    try {
                        const url = new URL(decodedText);
                        if (url.pathname === '/customer' && url.searchParams.has('token')) {
                            token = url.searchParams.get('token')!;
                        }
                    } catch (e) { /* Not a URL */ }

                    if (token.startsWith('cust_')) {
                       const result = await awardPoints(token, businessId);
                       setScanResult(result);
                       onScanSuccess(result);
                       if (result.success && result.rewardWon) {
                           setRewardMessage(result.rewardMessage || t('giftWonMessage'));
                           setIsRewardModalOpen(true);
                       }
                    } else {
                        setError('Not a valid customer QR code.');
                    }
                } catch (e) {
                    setError(t('errorUnexpected'));
                }
            },
            (errorMessage: string) => {}
        ).catch((err: any) => {
            console.error("Unable to start scanning.", err);
            setError("Could not start camera. Please grant permission.");
        });
    }, [businessId, onScanSuccess, t]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(startScanner, 300);
            return () => clearTimeout(timer);
        } else {
            if (qrScannerRef.current?.isScanning) {
                qrScannerRef.current.stop().catch((err: any) => {
                    console.warn("QR Scanner stop failed on modal close.", err);
                });
            }
            setScanResult(null);
            setError(null);
        }
    }, [isOpen, startScanner]);

    const handleScanNext = () => {
        startScanner();
    };

    const resultColor = scanResult?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const showScannerView = !scanResult && !error;

    return (
        <>
            <RewardModal 
                isOpen={isRewardModalOpen}
                onClose={() => setIsRewardModalOpen(false)}
                rewardMessage={rewardMessage}
            />
            <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
                <div style={{ display: showScannerView ? 'block' : 'none' }}>
                    <div id={scannerContainerId} className="w-full" />
                </div>
                
                <div className="mt-4 w-full">
                    <h2 className="text-lg font-semibold mb-2">{t('scanResult')}</h2>
                    <div className={`p-3 rounded-lg text-center font-medium min-h-[100px] flex flex-col justify-center ${showScannerView ? 'bg-gray-100' : ''} ${scanResult ? resultColor : ''} ${error ? 'bg-red-100 text-red-800' : ''}`}>
                        {showScannerView ? (
                             <p className="text-gray-500">Scanning...</p>
                        ) : (
                            <div>
                                {scanResult ? (
                                    <div>
                                        <p>{scanResult.message}</p>
                                        {scanResult.customer && <p>Total Points: {scanResult.newPointsTotal}</p>}
                                    </div>
                                ) : (<p>{error}</p>)}
                                <button
                                    onClick={handleScanNext}
                                    className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
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

    const handleDelete = async () => {
        if (!isMatch) return;
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
    };

    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('deleteAccountConfirmTitle')}>
            <div className="space-y-4">
                <p className="text-sm text-gray-700 font-medium bg-yellow-50 border border-yellow-200 p-3 rounded-md">{t('deleteAccountWarning')}</p>
                <p className="text-gray-600">{t('deleteAccountPrompt')} <span className="font-semibold">{customerPhoneNumber}</span></p>
                <div>
                    <input 
                        type="tel"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder={customerPhoneNumber}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">{t('cancel')}</button>
                    <button 
                        onClick={handleDelete}
                        disabled={!isMatch || isDeleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold disabled:bg-red-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isDeleting && <Spinner className="h-4 w-4 text-white" />}
                        {t('deleteAccount')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- QUICK ACTION MODALS ---

// FIX: Export MarkdownEditor to be used in other files.
export const MarkdownEditor: React.FC<{ label: string; name: string; value: string; onChange: (name: string, value: string) => void }> = ({ label, name, value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const applyStyle = (style: 'bold' | 'italic' | 'link') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        let newText;

        switch (style) {
            case 'bold':
                newText = `**${selectedText}**`;
                break;
            case 'italic':
                newText = `*${selectedText}*`;
                break;
            case 'link':
                const url = prompt('Enter the URL:');
                if (url) {
                    newText = `[${selectedText}](${url})`;
                } else {
                    return;
                }
                break;
        }

        const updatedValue = value.substring(0, start) + newText + value.substring(end);
        onChange(name, updatedValue);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 border border-gray-300 rounded-md shadow-sm">
                <div className="p-1 bg-gray-50 border-b flex items-center gap-2">
                    <button type="button" onClick={() => applyStyle('bold')} className="p-1.5 rounded hover:bg-gray-200 font-bold">B</button>
                    <button type="button" onClick={() => applyStyle('italic')} className="p-1.5 rounded hover:bg-gray-200 italic">I</button>
                    <button type="button" onClick={() => applyStyle('link')} className="p-1.5 rounded hover:bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.596a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </button>
                </div>
                <textarea
                    ref={textareaRef}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(name, e.target.value)}
                    rows={5}
                    className="w-full p-2 border-0 focus:ring-0 sm:text-sm"
                />
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
    const emptyForm: Omit<Post, 'id' | 'business_id' | 'created_at'> = { title: '', content: '', image_url: '', post_type: 'standard', video_url: '', price_text: '', external_url: '' };
    const [formState, setFormState] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleMarkdownChange = (name: string, value: string) => {
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const result = await createPost({ ...formState, business_id: businessId });
        setIsSaving(false);
        if (result) {
            onSuccess();
            onClose();
            setFormState(emptyForm);
        } else {
            alert('Failed to create post.');
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('newPost')}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                <InputField label={t('videoUrl')} name="video_url" value={formState.video_url || ''} onChange={handleFormChange} placeholder="https://youtube.com/..." />
                <InputField label={t('priceOffer')} name="price_text" value={formState.price_text || ''} onChange={handleFormChange} placeholder="e.g., $19.99 or 50% OFF" />
                <InputField label={t('externalLink')} name="external_url" value={formState.external_url || ''} onChange={handleFormChange} placeholder="https://yoursite.com/product" />
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center">
                        {isSaving && <Spinner className="h-4 w-4 mr-2" />}
                        {t('createPost')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};