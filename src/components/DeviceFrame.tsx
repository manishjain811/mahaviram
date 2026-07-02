/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, RefreshCw, Sparkles, Building2, MapPin } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  onResetDatabase?: () => void;
}

export default function DeviceFrame({ children, onResetDatabase }: DeviceFrameProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 bg-grid-pattern text-slate-100 font-sans flex flex-col">
      {/* Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-lg">
        

        

        
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 gap-8 overflow-hidden max-w-7xl mx-auto w-full">
        
 
       

        {/* Right Side / Middle Side: The Device Emulator */}
        <div className={`flex-1 flex justify-center items-center w-full transition-all duration-300`}>
          {!isFullscreen ? (
            /* PHONE MOCKUP SHELL */
            <div className="relative bg-slate-950 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800 w-full max-w-[400px] h-[820px] flex flex-col ring-12 ring-slate-900/50">
              {/* Speaker / Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-950 rounded-b-2xl z-55 flex items-center justify-center gap-1.5">
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
              </div>

              {/* Phone Content Screen Container */}
              <div className="w-full h-full rounded-[30px] bg-slate-50 text-slate-900 overflow-hidden flex flex-col relative m3-shadow-2">
                
                {/* Fake Android Status Bar */}
                <div className="bg-slate-50 text-slate-700 h-9 px-6 flex items-center justify-between text-xs font-semibold select-none z-40 border-b border-slate-100">
                  <span className="font-mono">{time}</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5 text-slate-600" />
                    <Wifi className="w-3.5 h-3.5 text-slate-600" />
                    <div className="flex items-center gap-0.5">
                      <Battery className="w-4 h-4 text-slate-600" />
                      <span className="text-[10px] font-mono">100%</span>
                    </div>
                  </div>
                </div>

                {/* Real Live App Code inside Frame */}
                <div className="flex-1 flex flex-col overflow-y-auto relative bg-surface-bg select-none">
                  {children}
                </div>

                {/* Fake Android Navigation Bar Area */}
                <div className="bg-slate-50 h-8 flex items-center justify-center z-40 border-t border-slate-100">
                  <div className="w-32 h-1.5 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>
          ) : (
            /* FULL RESPONSIVE VIEW (NO PHONE BEZEL) */
            <div className="w-full min-h-[750px] max-h-[820px] bg-surface-bg rounded-3xl overflow-hidden shadow-2xl text-slate-900 flex flex-col relative border border-slate-800 m3-shadow-3">
              {/* Simple Top Status Bar */}
              <div className="bg-slate-50 text-slate-700 h-9 px-6 flex items-center justify-between text-xs font-semibold select-none border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono tracking-wider text-slate-400">TABLET & DESKTOP SIMULATOR ACTIVE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{time}</span>
                </div>
              </div>

              {/* The Actual Application View */}
              <div className="flex-1 overflow-y-auto bg-surface-bg flex flex-col relative">
                {children}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          © 2026 Mahaviram Apartment Society • Udaipur, Rajasthan, India
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Target SDK: Android 14 (API 34)</span>
          <span>•</span>
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
