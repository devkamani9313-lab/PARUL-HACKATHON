"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  where
} from "firebase/firestore";
import { 
  Users, 
  Map, 
  DollarSign, 
  Clock, 
  BarChart3, 
  LayoutDashboard, 
  Globe,
  MoreVertical,
  Search,
  Filter,
  ShieldCheck,
  ChevronLeft,
  LogOut,
  Zap,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // REAL DATA STATE
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalStops: 0,
    avgBudget: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [itineraryStats, setItineraryStats] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    if (!loading && !user) {
      // Emergency override for demo/hackathon if redirect fails
      const timer = setTimeout(() => {
        if (!user) router.push("/admin-login");
      }, 3000);
      return () => clearTimeout(timer);
    } else if (user) {
      setIsAdmin(true); 
    }
  }, [user, loading]);

  useEffect(() => {
    if (!isAdmin) return;

    // 1. Fetch Global Stats & Real-time Listeners
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentUsers(users.slice(0, 5));
    });

    const unsubscribeTrips = onSnapshot(collection(db, "trips"), (snapshot) => {
      setStats(prev => ({ ...prev, totalTrips: snapshot.size }));
      const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort by creation date descending
      const sortedTrips = trips.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
        return dateB - dateA;
      });

      setAllTrips(sortedTrips);
      setRecentTrips(sortedTrips.slice(0, 8));

      // Calculate hourly aggregation for chart (last 12 hours)
      const now = new Date();
      const hourlyCounts = new Array(12).fill(0);
      trips.forEach((t: any) => {
        const tripDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
        const diffHours = Math.floor((now.getTime() - tripDate.getTime()) / (1000 * 60 * 60));
        if (diffHours >= 0 && diffHours < 12) {
          hourlyCounts[11 - diffHours]++;
        }
      });
      setChartData(hourlyCounts);
      
      // Calculate avg budget
      const totalBudget = trips.reduce((acc, t: any) => acc + (Number(t.budget) || 0), 0);
      setStats(prev => ({ ...prev, avgBudget: totalBudget / (trips.length || 1) }));
    });

    setDataLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeTrips();
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-[#050505] font-sans text-white selection:bg-red-500/30">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0A0A0A] flex flex-col p-8 sticky top-0 h-screen z-20 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <ShieldCheck size={28} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">NEURAL</span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mt-1">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <AdminNavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <AdminNavItem 
            icon={<Map size={20} />} 
            label="All Trips" 
            active={activeTab === "trips"} 
            onClick={() => setActiveTab("trips")} 
          />
          <AdminNavItem 
            icon={<Users size={20} />} 
            label="User Base" 
            active={activeTab === "users"} 
            onClick={() => setActiveTab("users")} 
          />

          <AdminNavItem 
            icon={<BarChart3 size={20} />} 
            label="Telemetry" 
            active={activeTab === "telemetry"} 
            onClick={() => setActiveTab("telemetry")} 
          />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-3">
          <Link href="/dashboard" className="block">
            <div className="flex items-center gap-5 p-5 rounded-[1.25rem] transition-all w-full group border text-gray-600 border-transparent hover:bg-white/[0.03] hover:text-white cursor-pointer">
              <span className="text-gray-700 group-hover:text-white transition-colors"><Globe size={18} /></span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Exit to Interface</span>
            </div>
          </Link>
          <div className="w-full">
            <AdminNavItem icon={<LogOut size={18} />} label="Terminate Admin" onClick={() => logout()} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 relative overflow-y-auto">
        {/* BACKGROUND GLOW */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 blur-[150px] rounded-full -z-10 animate-pulse"></div>
        
        <header className="flex items-center justify-between mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black tracking-tight mb-3">Platform Pulse<span className="text-red-500">.</span></h1>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Real-time Telemetry Active</p>
            </div>
          </motion.div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className="bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold uppercase tracking-widest focus:border-red-500/40 outline-none w-80 transition-all"
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <KPICard label="Neural Nodes (Users)" value={stats.totalUsers.toLocaleString()} icon={<Users className="text-blue-500" />} trend="+12%" />
                <KPICard label="Active Journeys" value={stats.totalTrips.toLocaleString()} icon={<Map className="text-purple-500" />} trend="+18%" />
                <KPICard label="Mean Allocation" value={`$${Math.round(stats.avgBudget).toLocaleString()}`} icon={<DollarSign className="text-green-500" />} trend="+5%" />
                <KPICard label="Sync Velocity" value="Real-time" icon={<Activity className="text-red-500" />} trend="LIVE" />
              </div>

              {/* Charts & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="glass-card p-10 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-2xl font-black">Sync Velocity</h3>
                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-1">Global registration packets</p>
                      </div>
                    </div>
                    <div className="h-72 flex items-end justify-between gap-4">
                      {chartData.map((count, i) => {
                        const maxCount = Math.max(...chartData, 1);
                        const heightPercent = Math.max((count / maxCount) * 100, 5); 
                        return (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            key={i} 
                            className="w-full bg-gradient-to-t from-red-600/20 to-red-600 rounded-t-xl transition-all hover:brightness-125 relative group cursor-crosshair"
                          >
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass-card !p-2 px-4 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all z-10 whitespace-nowrap shadow-2xl">
                              {count} JOURNEYS
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-gray-700">
                              {11 - i}H AGO
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="glass-card p-8">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
                        <Zap size={14} className="text-cyan-500" />
                        Node Distribution
                      </h4>
                      <div className="space-y-6">
                        <DeviceStat label="Interface Alpha (Desktop)" percent={stats.totalUsers > 0 ? 45 : 0} color="bg-blue-500" />
                        <DeviceStat label="Interface Beta (Mobile)" percent={stats.totalUsers > 0 ? 55 : 0} color="bg-purple-500" />
                      </div>
                    </div>
                    <div className="glass-card p-8">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
                        <Globe size={14} className="text-red-500" />
                        Hot Sync Points
                      </h4>
                      <div className="space-y-5">
                        {recentTrips.length > 0 ? recentTrips.slice(0, 3).map((trip, i) => (
                          <div key={i} className="flex justify-between items-center group">
                            <span className="font-bold text-gray-400 group-hover:text-white transition-colors truncate max-w-[150px]">{trip.name || "Unnamed"}</span>
                            <span className="font-black text-red-500 tracking-tighter text-lg">${Math.round(trip.budget || 0).toLocaleString()}</span>
                          </div>
                        )) : (
                          <p className="text-[10px] text-gray-800 font-black uppercase tracking-widest text-center py-4">No active syncs</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-10 border-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-10 border-b border-white/5 pb-4">Live Telemetry Stream</h3>
                  <div className="space-y-10">
                    {recentTrips.length > 0 ? recentTrips.map((trip, i) => (
                      <ActivityItem 
                        key={i}
                        user={trip.userId?.slice(0, 8) || "Explorer"} 
                        action="initialized journey" 
                        target={trip.name} 
                        time="ACTIVE" 
                      />
                    )) : (
                      <div className="py-20 text-center space-y-4">
                        <Activity className="mx-auto text-gray-800 animate-spin" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">Waiting for sync...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Table */}
              <section className="glass-card overflow-hidden border-white/5">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="text-2xl font-black">Neural Registrations</h3>
                    <p className="text-xs text-gray-500 mt-2 font-black uppercase tracking-widest">Active nodes in the ecosystem</p>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors px-6 py-3 border border-red-500/20 rounded-xl hover:bg-red-500/10">Full Registry</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                      <tr>
                        <th className="p-8">Node Identifier</th>
                        <th className="p-8 text-center">Status</th>
                        <th className="p-8 text-center">Data Packets</th>
                        <th className="p-8">Last Sync</th>
                        <th className="p-8 text-right">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentUsers.map((u, i) => (
                        <UserRow 
                          key={i}
                          name={u.displayName || u.email || "Anonymous"} 
                          status={u.status || "SYNCHRONIZED"} 
                          trips={0} // This will need a secondary aggregation if you want exact per-user counts
                          joined={u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString() : "RECENT"} 
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "trips" && (
            <motion.div 
              key="trips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Global Journey Registry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTrips.map((trip, i) => (
                  <div key={i} className="glass-card p-8 border-white/5 hover:border-red-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <Map size={24} />
                      </div>
                      <span className="text-[10px] font-black px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg uppercase tracking-widest">Active</span>
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">{trip.name}</h4>
                    <p className="text-xs text-gray-500 mb-6 line-clamp-2 leading-relaxed">{trip.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">ID: {trip.id?.slice(0, 8)}</span>
                      <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Inspect</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">User Base Telemetry</h2>
              <div className="glass-card p-10 border-white/5 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl font-black">
                        {u.displayName?.charAt(0) || u.email?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black truncate group-hover:text-blue-400 transition-colors">{u.displayName || "Explorer"}</h4>
                        <p className="text-[10px] font-bold text-gray-600 truncate uppercase tracking-widest mt-1">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "telemetry" && (
            <motion.div 
              key="telemetry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Command & Control</h2>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Neural Security & Platform Oversight</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all">Emergency Lockdown</button>
                </div>
              </div>

              {/* Utility Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-green-500/5 to-transparent">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Security Nodes</h4>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-black text-green-500">{stats.totalUsers}</span>
                    <ShieldCheck className="text-green-500 mb-1" size={24} />
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase">Active authenticated explorers currently verified within the neural network.</p>
                </div>
                
                <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Sync Health</h4>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-black text-blue-500">{(stats.totalTrips / Math.max(stats.totalUsers, 1)).toFixed(1)}</span>
                    <Activity className="text-blue-500 mb-1" size={24} />
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase">Average datasets (trips) per node. Reflects platform engagement levels.</p>
                </div>

                <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Database State</h4>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-black text-purple-500">LIVE</span>
                    <Globe className="text-purple-500 mb-1" size={24} />
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase">Real-time Firestore synchronization active. Listening for global event packets.</p>
                </div>
              </div>

              {/* Premium Area Line Chart in Telemetry */}
              <div className="glass-card p-12 border-white/5 bg-[#080808] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-10"></div>
                
                <div className="flex items-center justify-between mb-16">
                  <div>
                    <h3 className="text-xl font-black text-white">Activity Pulse</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Historical Packet Ingestion</p>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right text-white">
                      <span className="text-2xl font-black tracking-tighter">{stats.totalTrips}</span>
                      <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">Total Packets</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-80 w-full relative">
                  <svg className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Area path */}
                    <motion.path
                      initial={{ d: "M 0 320 Q 50 320 100 320 T 200 320 T 300 320 T 400 320 T 500 320 T 600 320 T 700 320 T 800 320 T 900 320 T 1000 320 L 1000 320 L 0 320 Z" }}
                      animate={{ 
                        d: `M 0 320 ${chartData.map((count, i) => {
                          const maxCount = Math.max(...chartData, 1);
                          const x = (i / (chartData.length - 1)) * 1000;
                          const y = 320 - (count / maxCount) * 280;
                          return `L ${x} ${y}`;
                        }).join(" ")} L 1000 320 L 0 320 Z`
                      }}
                      fill="url(#areaGradient)"
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />

                    {/* Line path */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        d: `M 0 ${320 - (chartData[0] / Math.max(...chartData, 1)) * 280} ${chartData.map((count, i) => {
                          const maxCount = Math.max(...chartData, 1);
                          const x = (i / (chartData.length - 1)) * 1000;
                          const y = 320 - (count / maxCount) * 280;
                          return `L ${x} ${y}`;
                        }).join(" ")}`
                      }}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {chartData.map((count, i) => {
                      const maxCount = Math.max(...chartData, 1);
                      const x = (i / (chartData.length - 1)) * 1000;
                      const y = 320 - (count / maxCount) * 280;
                      return (
                        <g key={i} className="group/point">
                          <circle cx={x} cy={y} r="6" fill="#000" stroke="#ef4444" strokeWidth="2" className="transition-all group-hover/point:r-8" />
                          <circle cx={x} cy={y} r="15" fill="#ef4444" fillOpacity="0.1" className="animate-pulse" />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Labels */}
                  <div className="absolute -bottom-10 left-0 w-full flex justify-between px-2">
                    {chartData.map((_, i) => (
                      <span key={i} className="text-[9px] font-black text-gray-800 uppercase tracking-tighter">
                        {11 - i}H
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Live Stream Packets</p>
                </div>
                <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto font-mono text-[10px]">
                  {allTrips.slice(0, 20).map((trip, i) => (
                    <div key={i} className="flex gap-6 items-center border-b border-white/5 pb-4 last:border-0 group">
                      <span className="text-gray-800 group-hover:text-gray-500 transition-colors">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-white font-bold group-hover:text-red-500">EVENT_PUSH</span>
                      <span className="text-red-500 font-black tracking-widest">{trip.id?.slice(0,12)}</span>
                      <span className="text-gray-700 ml-auto">VERIFIED</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function DeviceStat({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-white">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color} shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
        ></motion.div>
      </div>
    </div>
  );
}

function AdminNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-5 p-5 rounded-[1.25rem] transition-all w-full group border ${active ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'text-gray-600 border-transparent hover:bg-white/[0.03] hover:text-white'}`}
    >
      <span className={`${active ? 'text-red-500' : 'text-gray-700 group-hover:text-white'} transition-colors`}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function KPICard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-8 border-t-4 border-red-500/20 hover:border-red-500/60 transition-all group relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
      <div className="flex items-center justify-between mb-8">
        <span className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all">{icon}</span>
        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${trend.includes('+') || trend === 'LIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{trend}</span>
      </div>
      <h4 className="text-4xl font-black mb-2 tracking-tighter text-white">{value}</h4>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-gray-400 transition-colors">{label}</p>
    </motion.div>
  );
}

function ActivityItem({ user, action, target, time }: { user: string, action: string, target: string, time: string }) {
  return (
    <div className="flex items-start gap-5 group">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex-shrink-0 flex items-center justify-center group-hover:border-red-500/30 transition-all">
        <Activity size={20} className="text-gray-700 group-hover:text-red-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed">
          <span className="text-white font-black">{user}</span>
          <span className="text-gray-500 mx-2">{action}</span>
          {target && <span className="text-red-500 font-black uppercase tracking-widest text-[10px]">{target}</span>}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{time}</span>
        </div>
      </div>
    </div>
  );
}

function UserRow({ name, status, trips, joined }: { name: string, status: string, trips: number, joined: string }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-all group">
      <td className="p-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-gray-600 group-hover:border-red-500/40 group-hover:text-white transition-all">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight">{name}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 mt-1">Authorized Explorer</span>
          </div>
        </div>
      </td>
      <td className="p-8 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          {status}
        </span>
      </td>
      <td className="p-8 text-center">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white tracking-tighter">{trips}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Datasets</span>
        </div>
      </td>
      <td className="p-8">
        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{joined}</span>
      </td>
      <td className="p-8 text-right">
        <button className="p-3 text-gray-800 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"><MoreVertical size={20} /></button>
      </td>
    </tr>
  );
}

