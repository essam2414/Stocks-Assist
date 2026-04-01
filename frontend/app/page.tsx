"use client";

import { useState } from "react";

interface StockData {
  symbol: string;
  price: number;
  currency: string;
  name: string;
  lastUpdate: string;
  session: string;
}

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/stock/${ticker}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch stock data");
      }
      const data = await response.json();
      setStock(data);
    } catch (err: any) {
      setError(err.message);
      setStock(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white selection:bg-indigo-500/30 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(63,94,251,0.1),rgba(252,70,107,0.05))] pointer-events-none" />
      
      <main className="relative z-10 flex flex-col items-center gap-12 px-6 text-center max-w-4xl w-full">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
            Stock Assist
          </h1>
          <p className="text-zinc-500 tracking-widest uppercase text-sm font-medium">
            Intelligent Market Analysis
          </p>
        </div>
        
        <form 
          onSubmit={fetchStockPrice}
          className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200"
        >
          <div className="relative group">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter Ticker (e.g. AAPL)"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
              spellCheck="false"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white px-6 rounded-xl font-semibold transition-all transform active:scale-95 flex items-center justify-center min-w-[100px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </form>

        <div className="w-full max-w-md min-h-[220px] flex items-center justify-center">
          {error && (
            <div className="animate-in fade-in zoom-in duration-300 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl w-full">
              {error}
            </div>
          )}

          {stock && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 w-full bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 ">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Live {stock.lastUpdate}</span>
                </div>
                <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest bg-zinc-900/50 px-2 py-0.5 rounded-full border border-zinc-800/50">
                  {stock.session}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-zinc-500 font-medium tracking-wider uppercase text-xs">{stock.name}</span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold tracking-tight">{stock.symbol}</h2>
                  <span className="text-blue-500 font-bold">{stock.currency}</span>
                </div>
                <div className="mt-4 text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                  {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}
          
          {!stock && !error && !loading && (
            <div className="text-zinc-600 font-light italic">
              Enter a symbol to see real-time data
            </div>
          )}
        </div>
      </main>
      
      <footer className="absolute bottom-8 text-zinc-600 text-[10px] tracking-[0.2em] uppercase">
        Powered by yfinance & FastAPI
      </footer>

    </div>
  );
}


