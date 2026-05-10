"use client";

import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        
        // SYNC WITH FIRESTORE
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          createdAt: serverTimestamp(),
          lastSync: serverTimestamp(),
          status: "SYNCHRONIZED"
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
      {/* MINIMALIST NEURAL BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.05)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.05)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#050505_100%)]"></div>
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 z-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[1200px] px-6 py-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* BRANDING SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 space-y-12 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-5">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white flex items-center justify-center text-black shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              <Globe size={40} />
            </div>
            <div className="flex flex-col">
              <span className="text-5xl font-black tracking-tighter text-white uppercase leading-none">Traveloop</span>
              <span className="text-[12px] font-black uppercase tracking-[0.6em] text-cyan-400 mt-3">Neural Sync</span>
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.8] text-white">
              PLAN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 uppercase">Beyond.</span>
            </h1>
            <p className="text-gray-400 text-xl lg:text-2xl font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
              Architecture for the modern explorer. <br />
              <span className="text-white/40">Synchronize your journey with the neural travel network.</span>
            </p>
          </div>

          <div className="flex justify-center lg:justify-start gap-12 pt-8">
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Core</span>
              </div>
              <div className="w-full h-[1px] bg-white/10 mt-1"></div>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-purple-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Secure Vault</span>
              </div>
              <div className="w-full h-[1px] bg-white/10 mt-1"></div>
            </div>
          </div>
        </motion.div>

        {/* AUTH CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full lg:w-[480px] relative"
        >
          {/* AMBIENT GLOWS AROUND CARD */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 blur-3xl opacity-50"></div>
          
          <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 lg:p-14 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* SUBTLE INNER LIGHT */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Gateway Authorized</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white mb-3">
                {isLogin ? "Welcome Back" : "New Odyssey"}
              </h2>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Enter your credentials to synchronize with the network.
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Full Name</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-cyan-500 transition-colors" size={18} />
                      <input
                        type="text"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-sm font-medium outline-none focus:border-white/20 focus:bg-white/[0.04] text-white transition-all"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-4">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input
                    type="email"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-sm font-medium outline-none focus:border-white/20 focus:bg-white/[0.04] text-white transition-all"
                    placeholder="name@nexus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Password</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold text-gray-700 hover:text-white transition-colors">Recover?</button>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input
                    type="password"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-sm font-medium outline-none focus:border-white/20 focus:bg-white/[0.04] text-white transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 mt-6 shadow-xl shadow-white/5 active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "VERIFYING..." : (
                  <>
                    LOGIN
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 flex flex-col gap-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] text-white/80 hover:text-white transition-all bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/20"
              >
                {isLogin ? "Initialize Account" : "Return to Gateway"}
              </button>
              
              <Link href="/admin-login" className="block text-center group">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 group-hover:text-red-500 transition-all cursor-pointer">
                  Administrative Override
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FOOTER METADATA */}
      <div className="absolute bottom-10 left-10 text-[8px] font-black uppercase tracking-[1em] opacity-20 text-white vertical-text">
        TRAVELOOP NEURAL INTERFACE v4.0.2
      </div>
      <div className="absolute bottom-10 right-10 text-[8px] font-black uppercase tracking-[1.5em] opacity-20 text-white">
        SYNCHRONIZED &copy; 2026
      </div>
    </main>
  );
}

