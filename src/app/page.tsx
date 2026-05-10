"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Globe, 
  Map, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Compass,
  Star,
  CheckCircle2,
  Play,
  TrendingUp,
  Sparkles,
  Command,
  Layout,
  MousePointer2,
  MapPin
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[var(--primary)] selection:text-black font-sans overflow-x-hidden">
      {/* Navbar - Ultra Sleek */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-8 py-3 flex items-center gap-12 border border-white/10 rounded-full backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary-glow)]">
            <Compass size={18} color="#000" />
          </div>
          <span className="text-xl font-black tracking-tighter">Traveloop</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">Intelligence</a>
          <a href="#showcase" className="hover:text-[var(--primary)] transition-colors">Showcase</a>
          <a href="#premium" className="hover:text-[var(--primary)] transition-colors">Elite</a>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs font-bold hover:text-[var(--primary)] transition-colors">Login</Link>
          <Link href="/login" className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
            Join Elite
          </Link>
        </div>
      </nav>

      {/* Hero Section - The "Trillion Dollar" Impression */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 brightness-50"
            alt="Beach background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <motion.div 
          style={{ opacity }}
          className="container max-w-6xl text-center relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md"
          >
            <Sparkles size={12} className="animate-spin-slow" />
            <span>AI-Driven Travel Architecture</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10vw] md:text-[7vw] font-black tracking-tight leading-[0.85] mb-8"
          >
            DISCOVER <br />
            <span className="gradient-text tracking-tighter italic">EVERYWHERE.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-xl mx-auto glass p-2 rounded-full border-white/10 mb-12 flex items-center pr-2"
          >
            <div className="pl-6 text-gray-500">
              <MapPin size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Where is your dream destination?"
              className="bg-transparent border-none outline-none flex-1 px-4 py-4 text-sm font-bold placeholder:text-gray-600"
            />
            <Link href="/login" className="bg-[var(--primary)] text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
              Plan Trip
            </Link>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium"
          >
            The world's first cinematic travel planner. Experience high-performance itineraries powered by neural exploration.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/login" className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black text-xs font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full shadow-[0_0_50px_rgba(0,201,255,0.3)] hover:scale-105 hover:shadow-[0_0_70px_rgba(0,201,255,0.5)] transition-all flex items-center gap-3 group">
              Start Your Odyssey <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <button className="glass px-12 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border-white/10 flex items-center gap-3">
              <Play size={16} fill="currentColor" /> Watch Showcase
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Elements - Visual Gravity */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 hidden lg:block"
        >
          <div className="flex gap-12 opacity-30">
            <MousePointer2 className="animate-bounce" />
            <Command className="animate-pulse" />
            <Layout className="animate-bounce delay-700" />
          </div>
        </motion.div>
      </section>

      {/* Intelligence Grid - High Performance Section */}
      <section id="showcase" className="py-40 px-6 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-[var(--primary)]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">The Architecture</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">ENGINEERED FOR <br /><span className="text-gray-700">EXPLORATION.</span></h2>
            </div>
            <p className="text-gray-500 max-w-xs text-right font-medium leading-relaxed">
              Proprietary neural networks optimized for high-density travel logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[900px]">
            {/* Main Visual Feature */}
            <div className="md:col-span-8 glass-card group overflow-hidden relative border-white/5 p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative h-full w-full rounded-[2.9rem] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  alt="Scenic Route" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-12 flex flex-col justify-end">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white">
                      <Zap size={40} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black tracking-tight">Neural Sync™</h3>
                      <p className="text-gray-400">Zero-latency itinerary generation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Column Features */}
            <div className="md:col-span-4 flex flex-col gap-8">
              <div className="flex-1 glass-card p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity">
                  <TrendingUp size={80} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">Performance</h4>
                <h3 className="text-3xl font-black mb-6 leading-tight">Elite Budget <br /> Architecture.</h3>
                <p className="text-gray-500 font-medium">Automated currency intelligence and cost optimization for the top 1%.</p>
              </div>

              <div className="flex-1 glass-card p-12 relative overflow-hidden group bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white">
                <div className="absolute bottom-[-20px] right-[-20px] p-8 opacity-40 group-hover:rotate-12 transition-transform">
                  <Globe size={120} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Connectivity</h4>
                <h3 className="text-3xl font-black mb-6 leading-tight">Global Meta <br /> Access.</h3>
                <p className="font-medium opacity-90">Real-time planetary data at your fingertips.</p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="md:col-span-4 glass-card p-10 border-white/5">
              <Layout size={32} className="text-gray-400 mb-6" />
              <h3 className="text-2xl font-black mb-4 tracking-tight">Seamless Layouts</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Multi-device synchronization across mobile, desktop, and neural interfaces.</p>
            </div>
            
            <div className="md:col-span-4 glass-card p-10 border-white/5">
              <Shield size={32} className="text-green-500 mb-6" />
              <h3 className="text-2xl font-black mb-4 tracking-tight">Encrypted Vaults</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Your travel DNA is protected by military-grade end-to-end encryption.</p>
            </div>

            <div className="md:col-span-4 glass-card p-10 border-white/5 flex items-center justify-between group">
              <div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Join The Fleet</h3>
                <p className="text-gray-500 text-sm">Access the beta program.</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Marquee - Visual Wow Factor */}
      <section className="py-20 border-y border-white/5 bg-[#080808]">
        <div className="container max-w-7xl mx-auto mb-16 px-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 text-center">Global Reach</h3>
        </div>
        <div className="flex gap-8 whitespace-nowrap animate-scroll-text">
          {[
            { name: "Tokyo", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800" },
            { name: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800" },
            { name: "Rome", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800" },
            { name: "Dubai", img: "https://images.pexels.com/photos/325193/pexels-photo-325193.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { name: "Bali", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800" },
            { name: "NYC", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800" },
            { name: "London", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800" },
            { name: "Sydney", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800" },
          ].map((dest, i) => (
            <div key={i} className="w-[350px] h-[450px] rounded-[3rem] overflow-hidden relative shrink-0 group">
              <img 
                src={dest.img} 
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                alt={dest.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <h4 className="text-3xl font-black tracking-tighter text-white drop-shadow-2xl">{dest.name}</h4>
                <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">Explore Itinerary</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Stats Section */}
      <section className="py-20 border-y border-white/5 overflow-hidden">
        <div className="flex gap-20 whitespace-nowrap animate-scroll-text text-8xl font-black text-white/5 uppercase select-none">
          <span>Global Access • Neural Planning • Elite Support • Travel Redefined • </span>
          <span>Global Access • Neural Planning • Elite Support • Travel Redefined • </span>
        </div>
      </section>

      {/* CTA Section - The "Trillion Dollar" Closer */}
      <section id="premium" className="py-40 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary-glow)_0%,_transparent_70%)] opacity-20"></div>
        
        <div className="container max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            whileInView={{ opacity: [0, 1], scale: [0.9, 1] }}
            className="glass p-20 rounded-[4rem] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10">THE FUTURE <br /> IS CALLING.</h2>
            <p className="text-gray-400 text-xl mb-16 max-w-2xl mx-auto">Join the new era of high-performance travel architecture. Access the tools that empower the top 1% of explorers.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/login" className="bg-white text-black px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all">
                Become a Member
              </Link>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-[#050505]" alt="User" />
                ))}
                <div className="w-12 h-12 rounded-full bg-white/5 border-4 border-[#050505] flex items-center justify-center text-[10px] font-bold">
                  +2k
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimalist Luxury */}
      <footer className="py-20 px-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <Compass size={24} color="#000" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">Traveloop</span>
        </div>
        
        <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest">
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Security</a>
          <a href="#" className="hover:text-[var(--primary)] transition-colors">Twitter</a>
        </div>
        
        <p className="text-[10px] font-bold text-gray-600">&copy; 2026 TRAVELOOP ARCHITECTURE. ALL RIGHTS RESERVED.</p>
      </footer>

      {/* Global CSS for custom animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { rotate: 0deg; }
          to { rotate: 360deg; }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes scroll-text {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-text {
          animation: scroll-text 30s linear infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 3rem;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
