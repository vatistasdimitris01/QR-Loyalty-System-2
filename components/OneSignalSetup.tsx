import React, { useEffect } from 'react';

// FIX: Add OneSignal to the window interface to resolve TypeScript error.
declare global {
  interface Window {
    OneSignal: any[];
  }
}

declare const OneSignal: any;

const OneSignalSetup: React.FC = () => {
  useEffect(() => {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
      OneSignal.init({
        appId: "ca508e86-601c-4328-baa9-ee011d5a3d3c", // Provided in prompt
      });
    });
  }, []);

  return null; // This component does not render anything
};

export default OneSignalSetup;
