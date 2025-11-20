import React, { useState, useEffect } from 'react';
import { ShopConfig } from '../types';
import { LayoutDashboard, AlertCircle, ScanFace, ArrowRight } from 'lucide-react';

interface LoginProps {
  onConnect: (config: ShopConfig) => void;
  error?: string;
  isLoading: boolean;
}

export const Login: React.FC<LoginProps> = ({ onConnect, error, isLoading }) => {
  const [url, setUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [hasSavedCreds, setHasSavedCreds] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shopware-creds');
    if (saved) setHasSavedCreds(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.replace(/\/$/, '');
    const config = { url: cleanUrl, clientId, clientSecret };
    
    // Simple "Save" simulation for "FaceID" next time
    localStorage.setItem('shopware-creds', JSON.stringify(config));
    onConnect(config);
  };

  const handleBiometricLogin = () => {
    const saved = localStorage.getItem('shopware-creds');
    if (saved) {
        const config = JSON.parse(saved);
        onConnect(config);
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex flex-col justify-center items-center px-6 pb-safe-bottom">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-[#189eff] to-blue-400 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 mb-8">
            <LayoutDashboard className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopware Insight</h2>
          <p className="mt-2 text-base text-gray-500">
            Live Dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Anmeldung fehlgeschlagen</h3>
                <p className="mt-1 text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {hasSavedCreds && (
             <button
                onClick={handleBiometricLogin}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl shadow-sm bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
             >
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-[#189eff] mr-4">
                        <ScanFace size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-gray-900">Face ID Login</p>
                        <p className="text-xs text-gray-500">Schnellzugriff</p>
                    </div>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
             </button>
          )}

          {!hasSavedCreds && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Shop URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://mein-shop.de"
                  className="block w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#189eff] focus:border-transparent transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Zugangs-ID (Access Key)</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#189eff] focus:border-transparent transition-all"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Sicherheitsschlüssel (Secret)</label>
                <input
                  type="password"
                  required
                  className="block w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#189eff] focus:border-transparent transition-all"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-base font-bold text-white bg-[#189eff] hover:bg-blue-600 focus:outline-none active:scale-[0.98] transition-all"
              >
                {isLoading ? 'Verbinde...' : 'Shop verbinden'}
              </button>
            </form>
          )}
          
          {hasSavedCreds && (
              <button onClick={() => setHasSavedCreds(false)} className="block w-full text-center text-sm text-gray-400 mt-4">
                  Zugangsdaten manuell eingeben
              </button>
          )}
        </div>
      </div>
    </div>
  );
};
