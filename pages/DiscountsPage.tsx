
import React, { useState, useEffect } from 'react';
import { Spinner } from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../services/supabaseClient';
import { Discount } from '../types';

const DiscountsPage: React.FC = () => {
  const { t } = useLanguage();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (err) {
      console.error('Error fetching discounts:', err);
      setError(t('errorUnexpected'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCardFlip = (discountId: string) => {
    setFlippedCards(prev => ({ ...prev, [discountId]: !prev[discountId] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans">
      <style>{`
        .perspective { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
      <div className="w-full max-w-md flex items-center mb-6">
        <a href="javascript:history.back()" className="text-blue-600 hover:text-blue-800 mr-4 p-2 rounded-full hover:bg-gray-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </a>
        <h1 className="text-2xl font-bold text-gray-800 flex-grow text-center">{t('discounts')}</h1>
         <div className="w-10"></div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8"><Spinner /></div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : discounts.length === 0 ? (
        <div className="text-gray-500 text-center py-4">{t('noDiscounts')}</div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {discounts.map(discount => (
            <div 
              key={discount.id} 
              className="perspective"
              style={{ height: discount.image_url ? '200px' : 'auto' }}
              onClick={() => discount.image_url && handleCardFlip(discount.id)}
            >
              <div 
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${flippedCards[discount.id] ? 'rotate-y-180' : ''}`}
              >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden rounded-lg shadow-lg overflow-hidden cursor-pointer">
                  {discount.image_url ? (
                    <div className="relative w-full h-full">
                      <img src={discount.image_url} alt={discount.name} className="w-full h-full object-cover"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <h2 className="text-xl font-bold text-white">{discount.name}</h2>
                        {discount.percentage && <p className="text-2xl font-bold text-white">{discount.percentage}% OFF</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg h-full flex flex-col justify-between border">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{discount.name}</h2>
                        {discount.description && <p className="text-sm text-gray-600 mt-1">{discount.description}</p>}
                      </div>
                      <div className="mt-2">
                        {discount.percentage && <p className="text-xl font-bold text-blue-600">{discount.percentage}% OFF</p>}
                        {discount.expiry_date && <p className="text-xs text-gray-500 mt-1">{t('expires')} {new Date(discount.expiry_date).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Back */}
                {discount.image_url && (
                  <div className="absolute w-full h-full backface-hidden rounded-lg shadow-lg overflow-hidden bg-gray-800 text-white p-6 rotate-y-180 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold mb-2">{discount.name}</h2>
                        {discount.description && <p className="text-sm mb-3">{discount.description}</p>}
                        {discount.percentage && <p className="text-xl font-bold mb-2">{discount.percentage}% OFF</p>}
                        {discount.price && <p className="text-lg mb-2">Price: ${discount.price.toFixed(2)}</p>}
                        {discount.price_cutoff && <p className="text-sm">Minimum purchase: ${discount.price_cutoff.toFixed(2)}</p>}
                        {discount.expiry_date && <p className="text-xs text-gray-300 mt-3">{t('expires')} {new Date(discount.expiry_date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;