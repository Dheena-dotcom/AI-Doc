/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  AlertCircle, 
  ChevronRight, 
  History, 
  Info, 
  Loader2, 
  Plus, 
  Search, 
  ShieldAlert, 
  Stethoscope, 
  X,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getDiagnosis } from './services/gemini';
import { DiagnosisResult, SymptomEntry } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [history, setHistory] = useState<SymptomEntry[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('aidoc_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const accepted = localStorage.getItem('aidoc_disclaimer_accepted');
    if (accepted === 'true') {
      setHasAcceptedDisclaimer(true);
      setShowDisclaimer(false);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    setShowDisclaimer(false);
    localStorage.setItem('aidoc_disclaimer_accepted', 'true');
  };

  const handleDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    try {
      const data = await getDiagnosis(symptoms);
      setResult(data);
      
      const newEntry: SymptomEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        symptoms,
        result: data
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('aidoc_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error(error);
      alert('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('aidoc_history');
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">AI Doc</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Privacy</a>
            <button 
              onClick={() => setShowDisclaimer(true)}
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors"
            >
              Disclaimer
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input & History */}
          <div className="lg:col-span-1 space-y-6">
            <section className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                New Analysis
              </h2>
              <form onSubmit={handleDiagnosis} className="space-y-4">
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-zinc-500 mb-2">
                    Describe your symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    rows={4}
                    className="w-full rounded-2xl border-zinc-200 bg-zinc-50 focus:border-emerald-500 focus:ring-emerald-500 text-sm p-4 transition-all"
                    placeholder="e.g., I have a persistent dry cough, mild fever, and fatigue for the past 3 days..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !symptoms.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-medium py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Analyze Symptoms
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-zinc-400" />
                  Recent History
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">No recent analyses</p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setResult(item.result)}
                      className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all group"
                    >
                      <p className="text-sm font-medium text-zinc-700 line-clamp-1 group-hover:text-emerald-600">
                        {item.symptoms}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {new Date(item.timestamp).toLocaleDateString()} • {item.result.severity} Severity
                      </p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!result && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl border-dashed border-2 border-zinc-200 bg-transparent"
                >
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <Activity className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-2">Ready to Analyze</h3>
                  <p className="text-zinc-500 max-w-sm">
                    Enter your symptoms on the left to get an AI-powered health assessment and guidance.
                  </p>
                </motion.div>
              ) : isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 glass-card rounded-3xl"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium mt-6 text-zinc-900">Analyzing Symptoms...</h3>
                  <p className="text-sm text-zinc-500 mt-2">Our AI is cross-referencing medical databases.</p>
                </motion.div>
              ) : (
                <motion.div
                  key={JSON.stringify(result)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Severity Banner */}
                  <div className={cn(
                    "p-6 rounded-3xl flex items-center gap-4 shadow-sm",
                    result?.severity === 'Emergency' ? "bg-red-50 text-red-900 border border-red-100" :
                    result?.severity === 'High' ? "bg-orange-50 text-orange-900 border border-orange-100" :
                    result?.severity === 'Medium' ? "bg-amber-50 text-amber-900 border border-amber-100" :
                    "bg-emerald-50 text-emerald-900 border border-emerald-100"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      result?.severity === 'Emergency' ? "bg-red-100" :
                      result?.severity === 'High' ? "bg-orange-100" :
                      result?.severity === 'Medium' ? "bg-amber-100" :
                      "bg-emerald-100"
                    )}>
                      {result?.severity === 'Emergency' ? <AlertCircle className="w-6 h-6" /> :
                       result?.severity === 'High' ? <AlertTriangle className="w-6 h-6" /> :
                       <ShieldCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Severity: {result?.severity}</h3>
                      <p className="text-sm opacity-80">{result?.recommendation}</p>
                    </div>
                  </div>

                  {/* Potential Conditions */}
                  <div className="glass-card rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Search className="w-5 h-5 text-emerald-600" />
                      Potential Conditions
                    </h3>
                    <div className="space-y-6">
                      {result?.potentialConditions.map((condition, idx) => (
                        <div key={idx} className="group relative">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                              {condition.name}
                            </h4>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                              condition.likelihood === 'High' ? "bg-red-100 text-red-700" :
                              condition.likelihood === 'Moderate' ? "bg-amber-100 text-amber-700" :
                              "bg-zinc-100 text-zinc-600"
                            )}>
                              {condition.likelihood} Likelihood
                            </span>
                          </div>
                          <p className="text-sm text-zinc-600 mb-3 leading-relaxed">
                            {condition.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {condition.commonSymptoms.map((s, i) => (
                              <span key={i} className="text-[11px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                          {idx !== result.potentialConditions.length - 1 && (
                            <div className="h-px bg-zinc-100 w-full mt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps & Guidance */}
                  <div className="glass-card rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Recommended Next Steps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result?.nextSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-zinc-700 leading-snug">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Disclaimer */}
                  <div className="bg-zinc-900 text-zinc-400 p-6 rounded-3xl text-xs leading-relaxed flex gap-4">
                    <ShieldAlert className="w-5 h-5 text-zinc-500 shrink-0" />
                    <p>{result?.disclaimer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
              onClick={() => hasAcceptedDisclaimer && setShowDisclaimer(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-4">Medical Disclaimer</h2>
                <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
                  <p>
                    AI Doc is an informational tool powered by artificial intelligence. 
                    <strong> It is NOT a medical device and does not provide professional medical diagnosis, treatment, or advice.</strong>
                  </p>
                  <p>
                    The information provided is for educational purposes only. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                  <p className="font-semibold text-zinc-900">
                    If you think you may have a medical emergency, call your doctor, go to the nearest emergency department, or call emergency services immediately.
                  </p>
                </div>
                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptDisclaimer}
                    className="flex-1 bg-zinc-900 text-white font-semibold py-4 rounded-2xl hover:bg-zinc-800 transition-all"
                  >
                    I Understand & Accept
                  </button>
                  {hasAcceptedDisclaimer && (
                    <button
                      onClick={() => setShowDisclaimer(false)}
                      className="px-6 py-4 text-zinc-500 font-medium hover:text-zinc-900 transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-zinc-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Stethoscope className="w-4 h-4" />
            <span className="text-sm font-semibold">AI Doc</span>
          </div>
          <p className="text-xs text-zinc-400 text-center md:text-left">
            © 2026 AI Doc. For informational purposes only. Not for medical use.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900">Terms</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900">Privacy</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
