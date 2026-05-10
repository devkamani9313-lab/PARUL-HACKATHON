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
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // In a real app, you'd check a custom claim or a separate 'admins' collection
    // For this hackathon, we'll assume the first user or a specific email is admin
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setIsAdmin(true); // Simplified for demo
    }
  }, [user, loading]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg">
            <ShieldCheck size={24} color="#000" />
          </div>
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-2">
          <AdminNavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <AdminNavItem icon={<Map size={20} />} label="All Trips" />
          <AdminNavItem icon={<Users size={20} />} label="User Base" />
          <AdminNavItem icon={<Globe size={20} />} label="Popular Cities" />
          <AdminNavItem icon={<BarChart3 size={20} />} label="Revenue" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">Platform Overview</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] outline-none"
              />
            </div>
            <button className="glass p-2 px-4 flex items-center gap-2 text-sm">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <KPICard label="Active Users" value="12,402" icon={<Users className="text-blue-400" />} trend="+12% vs last month" />
          <KPICard label="Trips Created" value="48,291" icon={<Map className="text-purple-400" />} trend="+18% vs last month" />
          <KPICard label="Total Revenue" value="$242.5k" icon={<DollarSign className="text-green-400" />} trend="+5% vs last month" />
          <KPICard label="Avg Trip Duration" value="8.4 Days" icon={<Clock className="text-orange-400" />} trend="-2% vs last month" />
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">User Growth</h3>
                  <p className="text-xs text-gray-500">Real-time daily registrations</p>
                </div>
                <select className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 outline-none p-2">
                  <option>Last 30 Days</option>
                  <option>Last 6 Months</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {[40, 60, 45, 90, 65, 80, 100, 75, 95, 110, 85, 120].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-gradient-to-t from-[var(--primary-glow)] to-[var(--primary)] rounded-t-lg transition-all hover:opacity-80 relative group"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {h * 10}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <h4 className="font-bold mb-4">Device Distribution</h4>
                <div className="space-y-3">
                  <DeviceStat label="Mobile" percent={65} color="bg-blue-500" />
                  <DeviceStat label="Desktop" percent={25} color="bg-purple-500" />
                  <DeviceStat label="Tablet" percent={10} color="bg-orange-500" />
                </div>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold mb-4">Top Destinations</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Tokyo</span><span className="font-bold text-[var(--primary)]">2.4k</span></div>
                  <div className="flex justify-between text-sm"><span>Paris</span><span className="font-bold text-[var(--primary)]">1.8k</span></div>
                  <div className="flex justify-between text-sm"><span>New York</span><span className="font-bold text-[var(--primary)]">1.2k</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              <ActivityItem user="John Doe" action="created a trip" target="Tokyo Adventure" time="2m ago" />
              <ActivityItem user="Jane Smith" action="shared itinerary" target="Parisian Nights" time="15m ago" />
              <ActivityItem user="Mike Ross" action="updated budget" target="Swiss Alps" time="1h ago" />
              <ActivityItem user="Sarah Kay" action="joined Traveloop" target="" time="3h ago" />
            </div>
          </div>
        </div>

        {/* User Table */}
        <section className="mt-12 glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold">New Registrations</h3>
            <button className="text-sm text-[var(--primary)] hover:underline">View All Users</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Trips</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <UserRow name="Alice Wang" status="Active" trips="12" joined="May 08, 2024" />
              <UserRow name="Bob Builder" status="Inactive" trips="0" joined="May 05, 2024" />
              <UserRow name="Charlie Day" status="Active" trips="5" joined="May 01, 2024" />
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function DeviceStat({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function AdminNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full ${active ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function KPICard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-[var(--primary)]">
      <div className="flex items-center justify-between mb-4">
        <span className="p-2 bg-white/5 rounded-lg">{icon}</span>
        <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
      </div>
      <h4 className="text-2xl font-bold mb-1">{value}</h4>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: { user: string, action: string, target: string, time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0"></div>
      <div>
        <p className="text-sm">
          <span className="font-semibold">{user}</span> {action} {target && <span className="text-[var(--primary)]">{target}</span>}
        </p>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
}

function UserRow({ name, status, trips, joined }: { name: string, status: string, trips: string, joined: string }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-800"></div>
        <span className="font-medium">{name}</span>
      </td>
      <td className="p-4">
        <span className={`text-xs px-2 py-1 rounded-full ${status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
          {status}
        </span>
      </td>
      <td className="p-4 text-sm">{trips}</td>
      <td className="p-4 text-sm text-gray-400">{joined}</td>
      <td className="p-4 text-sm">
        <button className="text-gray-400 hover:text-white"><MoreVertical size={18} /></button>
      </td>
    </tr>
  );
}
