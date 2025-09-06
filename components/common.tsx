
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Customer, ScanResult } from '../types';
import { awardPoints } from '../services/api';

declare const Html5Qrcode: any;
declare const confetti: any;


export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8 text-black' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Icons ---
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
        <div className="p-6">
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
        <Modal isOpen={isOpen} onClose={onClose} title={`QR Code for ${customer.name}`}>
            <div className="text-center">
                <img src={customer.qr_data_url} alt={`QR Code for ${customer.name}`} className="w-64 h-64 mx-auto rounded-lg border" />
                <p className="mt-2 text-gray-600">{customer.phone_number}</p>
                <button
                    onClick={handlePrint}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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

// FIX: Add missing QRScannerModal component used in LandingPage.tsx
export const QRScannerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onScan: (scannedText: string) => void;
}> = ({ isOpen, onClose, onScan }) => {
    const { t } = useLanguage();
    const scannerId = "qr-scanner-modal";
    const qrScannerRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Delay scanner initialization to ensure modal is rendered
            const timerId = setTimeout(() => {
                const scanner = new Html5Qrcode(scannerId);
                qrScannerRef.current = scanner;

                scanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText: string) => {
                        onScan(decodedText);
                    },
                    (errorMessage: string) => {
                        // This callback is called when no QR is found. Ignore.
                    }
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
    }, [isOpen, onScan]);

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
    onScanSuccess: () => void;
}> = ({ isOpen, onClose, businessId, onScanSuccess }) => {
    const { t } = useLanguage();
    const scannerId = "business-qr-scanner";
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    const [rewardMessage, setRewardMessage] = useState('');
    const qrScannerRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            // Delay scanner initialization to ensure modal is rendered
            setTimeout(() => {
                qrScannerRef.current = new Html5Qrcode(scannerId);
                
                const startScanner = () => {
                    qrScannerRef.current.start(
                        { facingMode: "environment" },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        async (decodedText: string) => {
                            qrScannerRef.current.pause();
                            setScanResult(null);
                            setError(null);
                            
                            try {
                                let token = decodedText;
                                try {
                                    const url = new URL(decodedText);
                                    if (url.pathname === '/customer' && url.searchParams.has('token')) {
                                        token = url.searchParams.get('token')!;
                                    }
                                } catch (e) {}

                                if (token.startsWith('cust_')) {
                                   const result = await awardPoints(token, businessId);
                                   setScanResult(result);
                                   if (result.success) {
                                       onScanSuccess(); // Notify parent to refresh data
                                       if (result.rewardWon) {
                                           setRewardMessage(result.rewardMessage || t('giftWonMessage'));
                                           setIsRewardModalOpen(true);
                                       }
                                   }
                                } else {
                                    setError('Not a valid customer QR code.');
                                }
                            } catch (e) {
                                setError(t('errorUnexpected'));
                            } finally {
                                setTimeout(() => {
                                   if (qrScannerRef.current && qrScannerRef.current.getState() === 2) { // 2 = PAUSED
                                        qrScannerRef.current.resume();
                                   }
                                }, 3000);
                            }
                        },
                        (errorMessage: string) => {}
                    ).catch((err: any) => {
                        console.error("Unable to start scanning.", err);
                        setError("Could not start camera. Please grant permission.");
                    });
                };
                
                startScanner();
            }, 100);

            return () => {
                if (qrScannerRef.current && qrScannerRef.current.isScanning) {
                    qrScannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner", err));
                }
            };
        }
    }, [isOpen, businessId, onScanSuccess, t]);
    
    const resultColor = scanResult?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    return (
        <>
            <RewardModal 
                isOpen={isRewardModalOpen}
                onClose={() => setIsRewardModalOpen(false)}
                rewardMessage={rewardMessage}
            />
            <Modal isOpen={isOpen} onClose={onClose} title={t('scanQRCode')}>
                <div id={scannerId} className="w-full" />
                <div className="mt-4 w-full">
                    <h2 className="text-lg font-semibold mb-2">{t('scanResult')}</h2>
                    <div className={`p-3 rounded-lg text-center font-medium ${!scanResult && !error ? 'bg-gray-100' : ''} ${scanResult ? resultColor : ''} ${error ? 'bg-red-100 text-red-800' : ''}`}>
                        {scanResult ? (
                            <div>
                                <p>{scanResult.message}</p>
                                {scanResult.customer && <p>Total Points: {scanResult.newPointsTotal}</p>}
                            </div>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <p className="text-gray-500">Scanning...</p>
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

    // Reset input when modal opens/closes
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