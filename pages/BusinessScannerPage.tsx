
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { awardPoints } from '../services/api';
import { ScanResult } from '../types';

declare const Html5Qrcode: any;

const BusinessScannerPage: React.FC = () => {
    const { t } = useLanguage();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const qrScanner = new Html5Qrcode("qr-reader");

        const startScanner = () => {
            qrScanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText: string) => {
                    qrScanner.pause();
                    setScanResult(null);
                    setError(null);
                    try {
                        let token = decodedText;
                        try {
                            const url = new URL(decodedText);
                            if (url.pathname === '/customer' && url.searchParams.has('token')) {
                                token = url.searchParams.get('token')!;
                            }
                        } catch (e) {
                            // Fallback for old raw tokens
                        }
                        const result = await awardPoints(token);
                        setScanResult(result);
                    } catch (e) {
                        setError(t('errorUnexpected'));
                    } finally {
                        setTimeout(() => {
                           if(qrScanner.getState() === 2) { // 2 = PAUSED
                                qrScanner.resume();
                           }
                        }, 3000);
                    }
                },
                (errorMessage: string) => {
                    // console.log("QR Code no match.", errorMessage);
                }
            ).catch((err: any) => {
                console.error("Unable to start scanning.", err);
                setError("Could not start camera. Please grant permission and refresh.");
            });
        };
        
        startScanner();

        return () => {
            if (qrScanner && qrScanner.isScanning) {
                qrScanner.stop().catch((err: any) => console.error("Failed to stop scanner", err));
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]);

    const resultColor = scanResult?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
            <header className="w-full max-w-lg flex items-center mb-4">
                <a href="/business" className="text-blue-400 hover:text-blue-300">&larr; {t('back')}</a>
                <h1 className="text-2xl font-bold flex-grow text-center">{t('pointScanner')}</h1>
            </header>
            
            <div id="qr-reader" className="w-full max-w-lg rounded-lg overflow-hidden border-4 border-gray-600"></div>

            <div className="mt-6 w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-2">{t('scanResult')}</h2>
                <div className={`p-4 rounded-lg text-center font-medium ${!scanResult && !error ? 'bg-gray-700' : ''} ${scanResult ? resultColor : ''} ${error ? 'bg-red-100 text-red-800' : ''}`}>
                    {scanResult ? (
                        <div>
                            <p>{scanResult.message}</p>
                            {scanResult.customer && <p>Total Points: {scanResult.newPointsTotal}</p>}
                        </div>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <p>Scanning...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessScannerPage;