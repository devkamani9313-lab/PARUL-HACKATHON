"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // In a real app, you'd check a custom claim or a separate 'admins' collection
    // For this hackathon, we'll assume the first user or a specific email is admin
    if (!loading && !user) {
      router.push("/admin-login");
    } else if (user) {
      setIsAdmin(true); // Simplified for demo
    }
  }, [user, loading]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-[#050505] font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] flex flex-col p-6 sticky top-0 h-screen z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={24} color="#000" />
          </div>
          <span className="text-xl font-black tracking-tighter">Control Center</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full text-left" onClick={() => {}}>
            <AdminNavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            <AdminNavItem icon={<Map size={20} />} label="All Trips" />
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            <AdminNavItem icon={<Users size={20} />} label="User Base" />
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            <AdminNavItem icon={<Globe size={20} />} label="Popular Cities" />
          </button>
          <button className="w-full text-left" onClick={() => {}}>
            <AdminNavItem icon={<BarChart3 size={20} />} label="Revenue" />
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <Link href="/dashboard" className="block">
            <AdminNavItem icon={<Globe size={18} />} label="User Dashboard" />
          </Link>
          <button onClick={() => logout()} className="w-full">
            <AdminNavItem icon={<LogOut size={18} />} label="Terminate Session" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full -z-10"></div>
        
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Platform Pulse.</h1>
            <p className="text-gray-500 text-sm font-medium">Real-time metrics from the neural travel network.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={16} />
              <input 
                type="text" 
                placeholder="Search telemetry..." 
                className="bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:border-red-500/40 outline-none w-64"
              />
            </div>
            <button className="bg-white/[0.02] border border-white/10 p-3 px-5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
              <Filter size={14} />
              <span>Filter Data</span>
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <KPICard label="Neural Nodes (Users)" value="12,402" icon={<Users className="text-blue-400" />} trend="+12% vs last month" />
          <KPICard label="Active Journeys" value="48,291" icon={<Map className="text-purple-400" />} trend="+18% vs last month" />
          <KPICard label="Credit Inflow" value="$242.5k" icon={<DollarSign className="text-green-400" />} trend="+5% vs last month" />
          <KPICard label="Mean Duration" value="8.4 Days" icon={<Clock className="text-orange-400" />} trend="-2% vs last month" />
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Inflow Velocity</h3>
                  <p className="text-xs text-gray-500 font-medium">Daily registration packets synchronized</p>
                </div>
                <select className="bg-white/[0.02] border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none p-2 px-3">
                  <option className="bg-black">Last 30 Days</option>
                  <option className="bg-black">Last 6 Months</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-3">
                {[40, 60, 45, 90, 65, 80, 100, 75, 95, 110, 85, 120].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-gradient-to-t from-red-500/20 to-red-500 rounded-t-lg transition-all hover:opacity-80 relative group cursor-crosshair"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-card !p-2 px-3 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {h * 10}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Interface Distribution</h4>
                <div className="space-y-4">
                  <DeviceStat label="Mobile Neural" percent={65} color="bg-blue-500" />
                  <DeviceStat label="Desktop Console" percent={25} color="bg-purple-500" />
                  <DeviceStat label="Tablet Hub" percent={10} color="bg-orange-500" />
                </div>
              </div>
              <div className="glass-card p-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Hot Sync Points</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-400">Tokyo, JP</span>
                    <span className="font-black text-red-500 tracking-tighter text-lg">2.4k</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-400">Paris, FR</span>
                    <span className="font-black text-red-500 tracking-tighter text-lg">1.8k</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-400">New York, US</span>
                    <span className="font-black text-red-500 tracking-tighter text-lg">1.2k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8">Real-time Stream</h3>
            <div className="space-y-8">
              <ActivityItem user="John Doe" action="created a trip" target="Tokyo Adventure" time="2m ago" />
              <ActivityItem user="Jane Smith" action="shared itinerary" target="Parisian Nights" time="15m ago" />
              <ActivityItem user="Mike Ross" action="updated budget" target="Swiss Alps" time="1h ago" />
              <ActivityItem user="Sarah Kay" action="joined Traveloop" target="" time="3h ago" />
              <ActivityItem user="Alex Hunter" action="added stop" target="Bangkok" time="5h ago" />
            </div>
          </div>
        </div>

        {/* User Table */}
        <section className="mt-12 glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">New Node Registrations</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Recently authenticated explorers</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline underline-offset-8">Expand Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6 font-black">Identifier</th>
                  <th className="p-6 font-black">Status</th>
                  <th className="p-6 font-black">Data Sets</th>
                  <th className="p-6 font-black">Sync Date</th>
                  <th className="p-6 font-black">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <UserRow name="Alice Wang" status="Active" trips="12" joined="May 08, 2024" />
                <UserRow name="Bob Builder" status="Inactive" trips="0" joined="May 05, 2024" />
                <UserRow name="Charlie Day" status="Active" trips="5" joined="May 01, 2024" />
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function DeviceStat({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-white">{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/[0.02] rounded-full overflow-hidden">
        <div className={`h-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function AdminNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all w-full group ${active ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-500 hover:bg-white/[0.02] hover:text-white'}`}>
      <span className={`${active ? 'text-red-500' : 'text-gray-600 group-hover:text-white'} transition-colors`}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function KPICard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="glass-card p-6 border-t-2 border-red-500/20 hover:border-red-500/50 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <span className="p-3 bg-white/[0.02] border border-white/10 rounded-xl group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all">{icon}</span>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{trend}</span>
      </div>
      <h4 className="text-3xl font-black mb-1 tracking-tighter">{value}</h4>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{label}</p>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: { user: string, action: string, target: string, time: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex-shrink-0 flex items-center justify-center">
        <Users size={16} className="text-gray-700" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium leading-relaxed">
          <span className="text-white font-black">{user}</span>
          <span className="text-gray-500 mx-1.5">{action}</span>
          {target && <span className="text-red-500 font-bold">{target}</span>}
        </p>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 mt-1 block">{time}</span>
      </div>
    </div>
  );
}

function UserRow({ name, status, trips, joined }: { name: string, status: string, trips: string, joined: string }) {
  return (
    <tr className="hover:bg-white/[0.01] transition-colors group">
      <td className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center font-black text-gray-700 group-hover:border-red-500/40 transition-all">
            {name.charAt(0)}
          </div>
          <span className="font-black text-sm tracking-tight">{name}</span>
        </div>
      </td>
      <td className="p-6">
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-white/5'}`}>
          {status}
        </span>
      </td>
      <td className="p-6 text-xs font-bold text-gray-400">{trips} Sets</td>
      <td className="p-6 text-xs font-medium text-gray-600">{joined}</td>
      <td className="p-6">
        <button className="p-2 text-gray-700 hover:text-white transition-colors"><MoreVertical size={18} /></button>
      </td>
    </tr>
  );
}
