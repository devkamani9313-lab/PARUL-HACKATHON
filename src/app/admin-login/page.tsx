"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  ChevronLeft,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real hackathon, you'd check if the user is in an 'admins' collection
      // For simplicity, we just check credentials
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      setError("Admin authentication failed. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] relative z-10"
      >
        <Link href="/" className="flex items-center gap-4 mb-12 group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 transition-all">
            <ChevronLeft size={20} className="text-gray-400 group-hover:text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Back to Gateway</span>
        </Link>

        <div className="glass-card !p-12 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20">
              <ShieldCheck size={32} color="#000" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-3">Control Center.</h2>
            <p className="text-gray-500 text-sm font-medium">Administrator authorization required for platform oversight.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest mb-8 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Admin Identifier</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input
                  type="email"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-14 pr-6 text-sm outline-none focus:border-red-500/40 text-white placeholder:text-gray-800"
                  placeholder="admin@traveloop.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Override Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input
                  type="password"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-14 pr-6 text-sm outline-none focus:border-red-500/40 text-white placeholder:text-gray-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500 transition-all flex items-center justify-center gap-3 mt-4"
              disabled={loading}
            >
              {loading ? "VERIFYING..." : (
                <>
                  INITIALIZE OVERRIDE
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1 opacity-40">
              <Zap size={14} className="text-red-400" />
              <span className="text-[8px] font-black uppercase tracking-widest">Root Access</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
              <LayoutDashboard size={14} className="text-orange-400" />
              <span className="text-[8px] font-black uppercase tracking-widest">System Logs</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-10 text-[8px] font-black uppercase tracking-[1em] opacity-20 vertical-text text-white">
        TRAVELOOP ADMINISTRATIVE TERMINAL
      </div>
    </main>
  );
}
