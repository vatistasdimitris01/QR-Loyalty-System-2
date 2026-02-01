
import React from 'react';
import { Customer } from '../../types';

interface CustomerQRPageProps {
    customer: Customer;
}

const CustomerQRPage: React.FC<CustomerQRPageProps> = ({ customer }) => {
    return (
        <div className="flex flex-col bg-[#f8fcf9] min-h-screen text-[#0d1b12]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12">Loyalty</h2>
            </div>
            
            <div className="pb-3">
                <div className="flex border-b border-[#cfe7d7] px-4 gap-8">
                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-[#11d452] text-[#0d1b12] pb-[13px] pt-4">
                        <p className="text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em]">Identity</p>
                    </div>
                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#4c9a66] pb-[13px] pt-4 opacity-50">
                        <p className="text-[#4c9a66] text-sm font-bold leading-normal tracking-[0.015em]">Access</p>
                    </div>
                </div>
            </div>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[#0d1b12] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Scan your Identity Code</h2>
                <p className="text-[#0d1b12] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
                    Your unique code is your key to unlocking rewards across all participating businesses.
                </p>
                
                <div className="flex px-4 py-8 justify-center">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-[#e7f3eb]">
                        <img src={customer.qr_data_url} alt="Identity Code" className="w-64 h-64 object-contain rounded-xl" />
                    </div>
                </div>

                <div className="flex px-4 py-3 justify-center">
                    <button
                        onClick={() => window.print()}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#11d452] text-[#0d1b12] gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em] active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path>
                        </svg>
                        <span className="truncate">Print Code</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default CustomerQRPage;
