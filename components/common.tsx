
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Customer, Discount } from '../types';

declare const Html5Qrcode: any;


export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8 text-black' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
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


export const GiftWonModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('giftWon')}>
        <div className="text-center">
            <GiftIcon className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-6">{t('giftWonMessage')}</p>
            <button onClick={onClose} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                {t('close')}
            </button>
        </div>
    </Modal>
  );
};


export const DiscountModal: React.FC<{ isOpen: boolean; onClose: () => void; discount: Discount | null; }> = ({ isOpen, onClose, discount }) => {
    const { t } = useLanguage();
    if (!discount) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={discount.name}>
             <div className="space-y-4">
                {discount.description && <p className="text-gray-600">{discount.description}</p>}
                {discount.percentage && <p className="text-2xl font-bold text-green-600">{discount.percentage}% OFF</p>}
                {discount.price && <p className="text-lg font-semibold">Price: ${discount.price.toFixed(2)}</p>}
                {discount.price_cutoff && <p className="text-sm text-gray-500">Minimum purchase: ${discount.price_cutoff.toFixed(2)}</p>}
                {discount.expiry_date && <p className="text-sm text-gray-500 mt-2">{t('expires')}: {new Date(discount.expiry_date).toLocaleDateString()}</p>}
             </div>
        </Modal>
    );
};


export const PhoneNumberInputModal: React.FC<{ isOpen: boolean; onSave: (phone: string) => void; initialPhoneNumber: string | null; }> = ({ isOpen, onSave, initialPhoneNumber }) => {
    const { t } = useLanguage();
    const [phone, setPhone] = useState(initialPhoneNumber || '');

    const handleSave = () => {
        if (phone.trim()) {
            onSave(phone.trim());
        }
    };
    
    // This modal shouldn't be closable by clicking outside
    const handleClose = () => {};

    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t('enterPhoneNumber')}>
        <p className="text-gray-600 mb-4">{t('enterPhoneNumberPrompt')}</p>
        <input 
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('phoneNumber')}
        />
        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            {t('save')}
          </button>
        </div>
      </Modal>
    );
};

export const CustomerEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onUpdate: (customer: Customer) => void;
}> = ({ isOpen, onClose, customer, onUpdate }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [points, setPoints] = useState(0);

    React.useEffect(() => {
        if (customer) {
            setName(customer.name);
            setPoints(customer.points);
        }
    }, [customer]);

    if (!customer) return null;

    const handleUpdate = () => {
        onUpdate({ ...customer, name, points });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('editCustomer')}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('points')}</label>
                    <input type="number" value={points} onChange={e => setPoints(parseInt(e.target.value, 10) || 0)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                <button onClick={handleUpdate} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">{t('update')}</button>
            </div>
        </Modal>
    );
};

export const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

export const NewCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name.trim());
            setName('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('addNewCustomer')}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
                    <input 
                        id="customer-name"
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                        placeholder="John Doe"
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                <button onClick={handleCreate} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">{t('add')}</button>
            </div>
        </Modal>
    );
};

export const QRScannerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onScan: (scannedText: string) => void;
}> = ({ isOpen, onClose, onScan }) => {
    const readerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen && readerRef.current) {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(readerRef.current.id);
            }
            const qrScanner = scannerRef.current;
            
            if (qrScanner.getState() === 1) { // 1 = NOT_STARTED
                qrScanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText: string) => {
                        onScan(decodedText);
                        onClose();
                    },
                    (errorMessage: string) => {}
                ).catch((err: any) => {
                    console.error("QR Scanner Error:", err);
                });
            }
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop();
            }
        };
    }, [isOpen, onScan, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative p-4">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-800 bg-white rounded-full p-1 text-3xl z-10">&times;</button>
                <div id="qr-login-reader" ref={readerRef} className="w-full"></div>
            </div>
        </div>
    );
};
