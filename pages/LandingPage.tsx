import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal } from '../components/common';
import { loginBusinessWithQrToken } from '../services/api';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanError, setScanError] = useState('');

  const handleScan = async (scannedText: string) => {
    setIsScannerOpen(false);
    setScanError('');

    let token = scannedText;
    let joinBusinessId: string | null = null;
    try {
        const url = new URL(scannedText);
        token = url.searchParams.get('token') || '';
        joinBusinessId = url.searchParams.get('join');
    } catch (e) {
        // Not a valid URL, assume it's a raw token (for backward compatibility)
    }

    if (token.startsWith('cust_')) {
      let customerUrl = `/customer?token=${token}`;
      if (joinBusinessId) {
          customerUrl += `&join=${joinBusinessId}`;
      }
      window.location.href = customerUrl;
    } else if (token.startsWith('biz_')) {
      const result = await loginBusinessWithQrToken(token);
      if (result.success && result.business) {
        sessionStorage.setItem('isBusinessLoggedIn', 'true');
        sessionStorage.setItem('business', JSON.stringify(result.business));
        window.location.href = '/business';
      } else {
        setScanError('Invalid Business QR Code.');
      }
    } else {
      setScanError('This is not a valid loyalty QR code.');
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      // Automatically handle the token from the URL
      // This is primarily for business login now
      handleScan(window.location.href);
    }
  }, []);


  return (
    <>
      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="text-center">
          <img src="https://i.postimg.cc/ZKVbR9tP/305767183-771222654127324-7320768528390147926-n.jpg" alt="Business Logo" className="w-32 h-32 rounded-full mx-auto mb-6 shadow-lg border-4 border-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">QR Loyalty Rewards</h1>
          <p className="text-lg text-gray-600 mb-8">Your digital punch card solution.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              {t('customerSignin')}
            </button>
             <a 
              href="/signup/customer"
              className="bg-white text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-50 transition-transform transform hover:scale-105"
            >
              {t('customerSignup')}
            </a>
          </div>
          
          {scanError && <p className="text-red-500 mt-4">{scanError}</p>}

        </div>

        <div className="absolute bottom-6 text-center">
           <a href="/signup/business" className="text-gray-600 hover:text-gray-800 font-medium text-sm mb-2 block">
              {t('businessSignup')}
          </a>
          <a href="/business/login" className="text-blue-600 hover:text-blue-800 font-medium">
            {t('businessLogin')}
          </a>
        </div>
      </div>
    </>
  );
};

export default LandingPage;