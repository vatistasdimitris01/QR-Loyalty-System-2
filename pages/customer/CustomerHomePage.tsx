
import React from 'react';
import { Customer, Membership, Business } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StarIcon } from '../../components/common';

interface CustomerHomePageProps {
    customer: Customer;
    memberships: Membership[];
    onViewBusiness: (business: Business) => void;
}

const CustomerHomePage: React.FC<CustomerHomePageProps> = ({ customer, memberships, onViewBusiness }) => {
    const { t } = useLanguage();
    
    return (
        <div className="p-6 max-w-lg mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                 <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('welcome')}, {customer.name.split(' ')[0]}!</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">You have {memberships.length} active cards</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                 </div>
            </header>
            
            {/* Customer Universal Card */}
            <div className="relative group perspective-1000">
              <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 overflow-hidden transform-gpu transition-all duration-500 hover:scale-[1.02] active:scale-95">
                  {/* Decorative mesh background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
                  
                  <div className="relative flex flex-col items-center">
                       <div className="flex justify-between w-full mb-6 items-center">
                          <div className="flex items-center gap-2">
                            <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal" className="w-8 h-8 filter brightness-0 invert opacity-80" />
                            <span className="text-white font-black tracking-widest text-sm opacity-50">QROYAL</span>
                          </div>
                          <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Universal Card</span>
                       </div>

                       <div className="bg-white p-4 rounded-3xl shadow-inner-xl mb-6 scale-110 md:scale-100 transition-transform">
                          {customer.qr_data_url ? (
                              <img src={customer.qr_data_url} alt="Universal QR" className="w-44 h-44 rounded-xl" />
                          ) : (
                              <div className="w-44 h-44 bg-slate-100 rounded-xl animate-pulse" />
                          )}
                       </div>

                       <div className="w-full text-center">
                          <p className="text-white font-bold text-xl tracking-wide">{customer.name}</p>
                          <p className="text-indigo-200 text-xs mt-1 font-medium tracking-widest opacity-80">{customer.qr_token.toUpperCase()}</p>
                       </div>
                  </div>
              </div>
            </div>


            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('myMemberships')}</h2>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">View All</span>
              </div>

              {memberships.length === 0 ? (
                  <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-10 rounded-[2rem] text-center text-slate-400 space-y-2">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <StarIcon className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="font-bold text-slate-500">{t('noMemberships')}</p>
                      <p className="text-sm">Scan a business QR to get started</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4">
                      {memberships.map((membership, idx) => {
                          if (!membership.businesses) return null;
                          return (
                              <div 
                                  key={membership.id} 
                                  onClick={() => onViewBusiness(membership.businesses as Business)}
                                  className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-100 active:scale-95 transition-all group animate-in slide-in-from-bottom-4 duration-500"
                                  style={{ animationDelay: `${idx * 100}ms` }}
                              >
                                  <div className="flex items-center gap-4">
                                      <div className="relative">
                                        <img 
                                            src={membership.businesses.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                                            alt="logo"
                                            className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border-2 border-slate-50 transition-transform group-hover:scale-110"
                                        />
                                      </div>
                                      <div>
                                          <p className="font-extrabold text-slate-800 text-lg leading-tight">{membership.businesses.public_name}</p>
                                          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">Member since {new Date(membership.created_at).getFullYear()}</p>
                                      </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                          <StarIcon className="h-4 w-4 text-indigo-500 group-hover:text-white" />
                                          <span className="font-black text-indigo-700 group-hover:text-white">{membership.points}</span>
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )}
            </section>
        </div>
    );
};

export default CustomerHomePage;
