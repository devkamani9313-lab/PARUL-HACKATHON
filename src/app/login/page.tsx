"use client";

import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Globe, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles,
  ChevronLeft,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* LEFT SIDE: STYLE (50%) */}
      <div className="relative w-full lg:w-1/2 h-[350px] lg:h-screen overflow-hidden bg-[#050505] border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="relative z-10 h-full p-12 lg:p-24 flex flex-col justify-between">
          <Link href="/" className="inline-flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black">
              <Globe size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Traveloop</span>
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-cyan-400 mt-2">Neural Sync</span>
            </div>
          </Link>

          <div className="space-y-10">
            <h1 className="text-7xl lg:text-[9rem] font-black tracking-tighter leading-[0.8] text-white">
              PLAN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">Beyond.</span>
            </h1>
            <p className="text-gray-400 text-2xl font-medium max-w-xl leading-relaxed border-l-4 border-cyan-500/50 pl-12">
              The world's most advanced travel planning architecture. Engineered for those who demand excellence.
            </p>
          </div>

          <div className="flex gap-12 opacity-30">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Core</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Secure Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: PORTAL (50%) */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full"></div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[480px] relative z-10"
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 lg:p-16 shadow-2xl relative overflow-hidden">
            <div className="mb-14">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-cyan-400" size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Security Gate</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                {isLogin ? "Authenticate Account." : "Initialize Odyssey."}
              </h2>
              <p className="text-gray-500 font-medium text-base">
                Enter your credentials to synchronize with the neural network.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-10 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 ml-4">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800" size={20} />
                      <input
                        type="text"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm font-bold uppercase tracking-widest outline-none focus:border-cyan-500/40 text-white placeholder:text-gray-900"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800" size={20} />
                  <input
                    type="email"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm font-bold uppercase tracking-widest outline-none focus:border-cyan-500/40 text-white placeholder:text-gray-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Security Key</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold text-gray-700 hover:text-white">Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800" size={20} />
                  <input
                    type="password"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm font-bold outline-none focus:border-cyan-500/40 text-white placeholder:text-gray-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-16 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] hover:bg-cyan-400 transition-all flex items-center justify-center gap-4 mt-8"
                disabled={loading}
              >
                {loading ? "AUTHORIZING..." : (
                  <>
                    AUTHORIZE ENTRY
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-14 flex flex-col gap-6 items-center pt-10 border-t border-white/5">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 hover:text-white transition-all"
              >
                {isLogin ? (
                  <>NEW EXPLORER? <span className="text-cyan-400 underline underline-offset-8">JOIN THE ODYSSEY</span></>
                ) : (
                  <>BACK TO LOGIN</>
                )}
              </button>
              
              <Link href="/admin-login" className="group">
                <div className="flex items-center gap-3 py-3 px-6 bg-white/[0.02] border border-white/5 rounded-xl hover:border-red-500/30 transition-all">
                  <ShieldCheck size={14} className="text-gray-800 group-hover:text-red-500 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-800 group-hover:text-white">Administrative Portal</span>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-10 right-10 text-[8px] font-black uppercase tracking-[1em] opacity-10">
          TRAVELOOP AI &copy; 2026
        </div>
      </div>

    </main>
  );
}
