import React, { useState, useEffect } from 'react';
import { ShopwareService } from './services/shopwareService';
import { GeminiService } from './services/geminiService';
import { Login } from './components/Login';
import { ShopConfig, AppStatus, DashboardData } from './types';
import { 
  Bell,
  RefreshCw,
  LogOut,
  TrendingUp
} from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOGIN);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [insights, setInsights] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // We keep the config in state to allow refreshing
  const [currentConfig, setCurrentConfig] = useState<ShopConfig | null>(null);

  const handleConnect = async (config: ShopConfig) => {
    setCurrentConfig(config);
    setStatus(AppStatus.LOADING);
    setError(undefined);
    try {
      const service = new ShopwareService(config);
      const dashboardData = await service.getDashboardData();
      setData(dashboardData);
      setStatus(AppStatus.DASHBOARD);
    } catch (err) {
      setStatus(AppStatus.LOGIN);
      setError(err instanceof Error ? err.message : 'Verbindung fehlgeschlagen');
    }
  };

  const handleRefresh = () => {
      if (currentConfig) {
          handleConnect(currentConfig);
      }
  };

  const handleLogout = () => {
      setStatus(AppStatus.LOGIN);
      setData(null);
      setCurrentConfig(null);
  };

  const generateInsights = async () => {
    if (!data) return;
    setAnalyzing(true);
    try {
      const gemini = new GeminiService();
      const result = await gemini.analyzeShopPerformance(data);
      setInsights(result);
    } catch (e) {
      setInsights('Konnte keine Analyse erstellen.');
    } finally {
      setAnalyzing(false);
    }
  };

  const requestNotifications = () => {
    if (!("Notification" in window)) {
      alert("Dieser Browser unterstützt keine Benachrichtigungen");
    } else if (Notification.permission === "granted") {
      new Notification("Shopware Insight", { body: "Benachrichtigungen sind aktiv für schlafgut.com" });
      setNotificationsEnabled(true);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Shopware Insight", { body: "Du wirst über neue Bestellungen benachrichtigt." });
          setNotificationsEnabled(true);
        }
      });
    }
  };

  useEffect(() => {
    if (status === AppStatus.DASHBOARD && data && !insights) {
      generateInsights();
    }
    if ("Notification" in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
    }
  }, [status, data]);

  if (status === AppStatus.LOGIN || status === AppStatus.ERROR) {
    return (
      <Login 
        onConnect={handleConnect} 
        error={error} 
        isLoading={false} 
      />
    );
  }

  if (status === AppStatus.LOADING) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-white">
         <div className="relative">
            <div className="h-16 w-16 border-4 border-blue-100 border-t-[#189eff] rounded-full animate-spin"></div>
         </div>
         <p className="text-gray-500 font-medium mt-6 animate-pulse">Hole Live-Daten für schlafgut.com...</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 px-6 py-6 flex justify-between items-start">
        <div>
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dashboard</span>
           <h1 className="text-xl font-extrabold text-gray-900">schlafgut.com</h1>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleRefresh}
                className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-[#189eff] transition-colors"
            >
                <RefreshCw size={20} />
            </button>
            <button 
                onClick={handleLogout}
                className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
                <LogOut size={20} />
            </button>
        </div>
      </header>

      <main className="px-6 pt-4 pb-12 max-w-md mx-auto flex flex-col items-center">
        
        {/* Live Badge */}
        <div className="inline-flex items-center justify-center space-x-2 bg-green-50 text-green-600 px-3 py-1 rounded-full mb-12 border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wide">Heute Live</span>
        </div>

        {/* PRIMARY KPI: REVENUE */}
        <div className="text-center w-full mb-12">
            <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-none">
                {data?.dailyRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </h2>
            <p className="text-gray-400 font-medium mt-2 text-xl uppercase tracking-wide">Tagesumsatz</p>
        </div>

        {/* SECONDARY KPI: ORDER COUNT */}
        <div className="bg-blue-50 rounded-3xl p-8 w-full mb-8 flex flex-col items-center justify-center border border-blue-100 shadow-sm">
             <span className="text-[#189eff] mb-2">
                <TrendingUp size={32} />
             </span>
             <span className="text-5xl font-bold text-gray-900 mb-1">{data?.totalOrders}</span>
             <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Bestellungen Heute</span>
        </div>

        {/* AI Insight Text Bubble */}
        <div className="bg-white rounded-2xl p-6 w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative">
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-[#189eff] to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    KI ZUSAMMENFASSUNG
                </div>
                {analyzing ? (
                    <div className="space-y-2 mt-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                ) : (
                    <p className="text-base text-gray-600 leading-relaxed italic font-medium mt-2">
                    "{insights}"
                    </p>
                )}
        </div>

        <div className="mt-12 flex items-center justify-center text-gray-300">
             <button onClick={requestNotifications} className="flex items-center text-xs font-medium hover:text-blue-500 transition-colors">
                <Bell size={14} className="mr-1" />
                {notificationsEnabled ? 'Benachrichtigungen aktiv' : 'Benachrichtigungen aktivieren'}
             </button>
        </div>

      </main>
    </div>
  );
};

export default App;
