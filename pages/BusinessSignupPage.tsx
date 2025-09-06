import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signupBusiness } from '../services/api';
import { Business } from '../types';
import { Spinner } from '../components/common';

interface Message {
  text: string;
  isUser?: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

const ChatBubble: React.FC<{ message: string; isUser?: boolean }> = ({ message, isUser }) => {
  const avatarUrl = "https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white p-3 rounded-xl rounded-br-lg max-w-sm">
          {message}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2">
      <img src={avatarUrl} alt="QRoyal Bot" className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="bg-gray-200 text-gray-800 p-3 rounded-xl rounded-bl-lg max-w-sm">
        {message}
      </div>
    </div>
  );
};

const BusinessSignupPage: React.FC = () => {
    const { t } = useLanguage();
    
    // Read params once at the top to set initial state
    const searchParams = new URLSearchParams(window.location.search);
    const initialName = searchParams.get('name') || '';
    const initialEmail = searchParams.get('email') || '';
    const isPrefilled = !!(initialName && initialEmail);

    const [step, setStep] = useState(isPrefilled ? 3 : 1);
    const [formData, setFormData] = useState({ name: initialName, email: initialEmail, password: '' });
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newBusiness, setNewBusiness] = useState<Business | null>(null);
    
    const [messages, setMessages] = useState<Message[]>(isPrefilled ? [{ text: `Welcome! Let's finish setting up your account for "${initialName}".` }] : []);
    const [isBotTyping, setIsBotTyping] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Define bot messages inside component to access formData
    const botMessages: { [key: number]: string } = {
        1: "Hello! Let's set up your QRoyal business account. First, what's the name of your business?",
        2: `Great name! Now, what's the best email address for this account?`,
        3: "Perfect. Lastly, please choose a secure password.",
        4: `Congratulations, ${formData.name}! Your account is ready. Here is your unique QR code for quick logins.`
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);
    
    // This single effect handles posting bot messages when the step changes.
    useEffect(() => {
        if (step in botMessages) {
            setIsBotTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { text: botMessages[step] }]);
                setIsBotTyping(false);
            }, 1000);
        }
    }, [step]);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!inputValue.trim()) {
            setError('This field is required.');
            return;
        }

        setMessages(prev => [...prev, { text: inputValue, isUser: true }]);

        if (step === 1) {
            setFormData(prev => ({...prev, name: inputValue}));
            setStep(2);
        } else if (step === 2) {
             if (!/^\S+@\S+\.\S+$/.test(inputValue)) {
                setError('Please enter a valid email address.');
                setMessages(prev => prev.slice(0,-1)); // remove invalid user message
                return;
            }
            setFormData(prev => ({...prev, email: inputValue}));
            setStep(3);
        } else if (step === 3) {
            if (inputValue.length < 6) {
                setError('Password must be at least 6 characters long.');
                setMessages(prev => prev.slice(0,-1));
                return;
            }
            const finalData = { ...formData, password: inputValue };
            setFormData(finalData);
            handleSignup(finalData);
        }
        setInputValue('');
    };

    const handleSignup = async (data: typeof formData) => {
        setLoading(true);
        setIsBotTyping(true);
        const result = await signupBusiness(data);
        setLoading(false);
        setIsBotTyping(false);

        if (result.success && result.business) {
            setNewBusiness(result.business);
            setStep(4);
        } else {
            setError(result.message || t('errorUnexpected'));
            setMessages(prev => prev.slice(0,-1)); // remove user message on fail
        }
    };

    const getInputType = () => {
        if (step === 2) return 'email';
        if (step === 3) return 'password';
        return 'text';
    };
    
    const getButtonText = () => {
        if (loading) return t('createAccount') + '...';
        if (step === 3) return t('createAccount');
        return 'Continue';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg h-[90vh] max-h-[700px] bg-white rounded-2xl shadow-xl flex flex-col">
                <header className="p-4 border-b text-center relative">
                    <a href="/business/login" className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800">&larr;</a>
                    <h1 className="text-xl font-bold text-gray-800">{t('businessSignup')}</h1>
                </header>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg.text} isUser={msg.isUser} />
                    ))}
                    {isBotTyping && !newBusiness && (
                         <div className="flex items-end gap-2">
                             <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Bot" className="w-8 h-8 rounded-full bg-gray-200" />
                             <div className="bg-gray-200 p-3 rounded-xl rounded-bl-lg"><TypingIndicator /></div>
                         </div>
                    )}
                    {newBusiness && (
                        <div className="bg-white p-4 rounded-lg flex flex-col items-center text-center">
                            <img src={newBusiness.qr_data_url} alt="Your Business QR Code" className="w-48 h-48 mx-auto" />
                             <a href="/business/login" className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                                Go to Login
                            </a>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                {!newBusiness && (
                    <div className="p-4 border-t bg-gray-50">
                        <form onSubmit={handleNextStep} className="flex items-center gap-2">
                            <input
                                type={getInputType()}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={step === 1 ? 'e.g. The Coffee Shop' : step === 2 ? 'e.g. owner@email.com' : 'Your password...'}
                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                                disabled={isBotTyping || loading}
                                autoFocus
                            />
                            <button type="submit" disabled={isBotTyping || loading} className="bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait transition-colors">
                                {loading ? <Spinner className="w-5 h-5" /> : getButtonText()}
                            </button>
                        </form>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessSignupPage;