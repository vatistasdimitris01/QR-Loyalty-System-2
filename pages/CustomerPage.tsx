import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCustomerByQrToken, updateCustomer } from '../services/api';
import { Customer, Discount } from '../types';
import { Spinner, FacebookIcon, GiftIcon, StarIcon, DownloadIcon, GiftWonModal, DiscountModal, CustomerSetupModal } from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../services/supabaseClient';
import { REWARD_THRESHOLD } from '../constants';

declare const confetti: any;

interface CustomerPageProps {
  qrToken: string;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4 border border-gray-200">
        <div className="p-3 rounded-full bg-blue-50">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
        </div>
    </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode, title: string, onClick: () => void }> = ({ icon, title, onClick }) => (
    <div 
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onClick}
    >
        <div className="p-2 rounded-full bg-blue-50">
            {icon}
        </div>
        <div>
            <p className="font-semibold text-gray-800">{title}</p>
        </div>
    </div>
);

const CustomerPage: React.FC<CustomerPageProps> = ({ qrToken }) => {
  const { t } = useLanguage();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGiftWon, setShowGiftWon] = useState(false);
  const [showDiscountsPopup, setShowDiscountsPopup] = useState(false);
  const [isPwa, setIsPwa] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  useEffect(() => {
    setIsPwa(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const { data, error } = await supabase
          .from('discounts')
          .select('*')
          .eq('active', true);

        if (error) {
          throw error;
        }
        setDiscounts(data || []);
      } catch (error) {
        console.error('Error fetching discounts:', error);
      }
    };
    fetchDiscounts();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const discountIdFromUrl = urlParams.get('discount_id');
    if (discountIdFromUrl) {
      const fetchDiscount = async () => {
        try {
          const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .eq('id', discountIdFromUrl)
            .single();

          if (error) throw error;
          if (data) setSelectedDiscount(data);
        } catch (error) {
          console.error('Error fetching discount:', error);
        }
      };
      fetchDiscount();
    }
  }, []);

  const prevPointsRef = useRef<number | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (document.hidden) return;
    try {
      const customerData = await getCustomerByQrToken(qrToken);
      if (customerData) {
        if (customerData.name === "New Customer") {
            setIsSetupModalOpen(true);
        }
        if (prevPointsRef.current !== null && customerData.points < prevPointsRef.current) {
          if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
          }
          setShowGiftWon(true);
        }
        setCustomer(customerData);
        prevPointsRef.current = customerData.points;
      } else {
        setError(t('customerNotFound'));
      }
    } catch {
      setError(t('errorUnexpected'));
    } finally {
      if (loading) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken, t, loading]);

  useEffect(() => {
    fetchCustomer();
    const intervalId = setInterval(fetchCustomer, 3000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetupSave = async (details: { name: string; phone: string }) => {
    if (customer) {
      const updatedCustomer = await updateCustomer(customer.id, { name: details.name, phone_number: details.phone });
      if (updatedCustomer) {
        setCustomer(updatedCustomer);
      }
      setIsSetupModalOpen(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><Spinner className="h-8 w-8 text-black" /></div>;
  if (error || !customer) return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center text-red-500 text-center p-4">
      <div>
          <p className="font-bold text-lg">{t('error')}</p>
          <p>{error || t('customerNotFound')}</p>
      </div>
    </div>
  );

  const points = customer.points ?? 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <GiftWonModal isOpen={showGiftWon} onClose={() => setShowGiftWon(false)} />
        <DiscountModal isOpen={!!selectedDiscount} onClose={() => setSelectedDiscount(null)} discount={selectedDiscount} />
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        
        <div className="max-w-md mx-auto">
            <div className="flex flex-col items-center justify-center mb-8">
                <img src="https://i.postimg.cc/ZKVbR9tP/305767183-771222654127324-7320768528390147926-n.jpg" alt="Business Logo" className="w-24 h-24 rounded-full mb-4 shadow-lg border-4 border-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">{t('welcome')}, {customer.name}</h1>
            </div>

            {customer.phone_number && (
              <div className="flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-gray-700">{customer.phone_number}</span>
              </div>
            )}
            {customer.qr_data_url && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 flex justify-center">
                <img src={customer.qr_data_url} alt="Your QR Code" className="w-48 h-48" />
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 mb-8">
                <StatCard 
                    icon={<StarIcon className="h-6 w-6 text-amber-500" />}
                    label={t('points')}
                    value={`${points} / ${REWARD_THRESHOLD}`}
                />
            </div>

            <div className="space-y-4">
                <ActionCard icon={<GiftIcon className="h-5 w-5 text-purple-600" />} title={t('viewDiscounts')} onClick={() => setShowDiscountsPopup(true)} />
                <ActionCard icon={<FacebookIcon className="h-5 w-5 text-blue-600" />} title={t('visitFacebook')} onClick={() => window.open('https://www.facebook.com/xartagora/', '_blank')} />
                {!isPwa && <ActionCard icon={<DownloadIcon className="h-5 w-5 text-green-600" />} title={t('installPwa')} onClick={() => alert('Follow your browser instructions to "Add to Home Screen".')} />}
            </div>
        </div>

        {showDiscountsPopup && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center p-4">
            <button
              className="absolute top-4 right-4 text-3xl text-gray-700 hover:text-black"
              onClick={() => setShowDiscountsPopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <img src="https://i.postimg.cc/ZKVbR9tP/305767183-771222654127324-7320768528390147926-n.jpg" alt="Business Logo" className="w-24 h-24 rounded-full my-4 shadow-lg border-4 border-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('discounts')}</h2>
            <div className="w-full max-w-md p-4 overflow-y-auto">
              {discounts.length > 0 ? (
                <ul className="space-y-4">
                  {discounts.map((discount) => (
                    <li key={discount.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-bold text-gray-800">{discount.name}</h3>
                      {discount.description && <p className="text-gray-600 mt-1">{discount.description}</p>}
                      {discount.percentage && <p className="text-green-600 font-semibold mt-2">{discount.percentage}% OFF</p>}
                      {discount.expiry_date && <p className="text-sm text-gray-500 mt-2">{t('expires')}: {new Date(discount.expiry_date).toLocaleDateString()}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-700">{t('noDiscounts')}</p>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default CustomerPage;