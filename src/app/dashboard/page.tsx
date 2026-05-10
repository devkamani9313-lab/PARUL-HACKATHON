"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserTrips, createTrip, getFullItinerary, deleteUserData, deleteTrip, Trip } from "@/lib/db";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Search, 
  Settings, 
  LogOut,
  ChevronRight,
  Compass,
  Trash2,
  User as UserIcon,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Globe,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, loading, logout, deleteAccount } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [tripFilter, setTripFilter] = useState("all");
  const [settingsView, setSettingsView] = useState("profile");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingStops: 0,
    totalBudget: 0
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    
    if (user) {
      fetchTrips();
    }
  }, [user, loading]);

  const fetchTrips = async () => {
    if (user) {
      const userTrips = await getUserTrips(user.uid);
      setTrips(userTrips);
      
      // Calculate real stats
      let totalBudget = 0;
      let totalStops = 0;

      for (const trip of userTrips) {
        const fullData = await getFullItinerary(trip.id!);
        if (fullData) {
          totalStops += fullData.stops?.length || 0;
          const tripBudget = fullData.stops?.reduce((acc: number, stop: any) => 
            acc + (stop.activities?.reduce((aAcc: number, act: any) => aAcc + (act.cost || 0), 0) || 0), 0) || 0;
          totalBudget += tripBudget;
        }
      }

      setStats({
        totalTrips: userTrips.length,
        upcomingStops: totalStops,
        totalBudget: totalBudget
      });
      setLoadingTrips(false);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");
  const [newTripBudget, setNewTripBudget] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Robust date formatting (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Set default dates when modal opens
  useEffect(() => {
    if (showCreateModal) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      setNewTripStart(formatDate(today));
      setNewTripEnd(formatDate(nextWeek));
    }
  }, [showCreateModal]);

  // Smart Sync: When Start Date changes, ensure End Date is valid
  const handleStartDateChange = (val: string) => {
    setNewTripStart(val);
    const start = new Date(val);
    const end = new Date(newTripEnd);
    if (!newTripEnd || isNaN(end.getTime()) || end < start) {
      const next = new Date(start);
      next.setDate(start.getDate() + 7);
      setNewTripEnd(formatDate(next));
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const start = new Date(newTripStart);
      const end = new Date(newTripEnd);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        alert("Please select valid start and end dates.");
        setIsCreating(false);
        return;
      }

      const tripId = await createTrip({
        userId: user!.uid,
        name: newTripName,
        description: "Plan your next adventure...",
        startDate: start,
        endDate: end,
        isPublic: false,
        budget: newTripBudget ? parseFloat(newTripBudget) : 0
      });
      setShowCreateModal(false);
      router.push(`/trips/${tripId}/edit`);
    } catch (err) {
      alert("Error creating trip");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(tripId);
        fetchTrips(); // Refresh the list
      } catch (err) {
        alert("Error deleting trip");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you absolutely sure? This will permanently delete your account and all your trips. This action cannot be undone.")) {
      try {
        await deleteUserData(user!.uid);
        await deleteAccount();
        router.push("/login");
      } catch (err) {
        alert("Error deleting account. You may need to log in again to perform this sensitive action.");
      }
    }
  };

  if (loading || loadingTrips) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050505] relative">
      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-8 w-full max-w-lg border-[var(--primary)]/30 shadow-[0_0_50px_rgba(0,201,255,0.2)]"
          >
            <h2 className="text-3xl font-bold mb-6 gradient-text">Start New Journey</h2>
            <form onSubmit={handleCreateTrip} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Trip Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Summer in Tokyo 2026" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[var(--primary)] transition-all"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[var(--primary)] transition-all"
                    value={newTripStart}
                    min={formatDate(new Date())}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">End Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-[var(--primary)] transition-all"
                    value={newTripEnd}
                    min={newTripStart || formatDate(new Date())}
                    onChange={(e) => setNewTripEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Maximum Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="number" 
                    placeholder="e.g. 2500" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[var(--primary)] transition-all"
                    value={newTripBudget}
                    onChange={(e) => setNewTripBudget(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center py-4 text-lg">
                  {isCreating ? "Creating..." : "Launch Itinerary"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="glass px-8 py-4 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-white/5 bg-[#0A0A0A] flex flex-col p-4 md:p-6 transition-all">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg">
            <Compass size={24} color="#000" />
          </div>
          <span className="text-2xl font-bold hidden md:block tracking-tighter">Traveloop</span>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Overview" 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <NavItem 
            icon={<MapPin size={20} />} 
            label="My Trips" 
            active={activeTab === "my-trips"} 
            onClick={() => setActiveTab("my-trips")} 
          />
          <NavItem 
            icon={<Search size={20} />} 
            label="Explore" 
            active={activeTab === "explore"}
            onClick={() => setActiveTab("explore")} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")} 
          />
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-3 p-4 text-gray-500 hover:text-red-500 transition-colors w-full px-2"
        >
          <LogOut size={20} />
          <span className="hidden md:block font-medium">Log Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">

        {activeTab === "overview" && (
          <div className="animate-fade-in space-y-12">
            {/* Command Center Header */}
            <div className="relative p-10 rounded-[3rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--secondary)]/5 to-transparent"></div>
              <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-[var(--primary)]/5 blur-[120px] rounded-full animate-pulse"></div>
              
              <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[var(--primary)] font-black text-xs uppercase tracking-[0.3em]">
                    <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
                    {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening"}
                  </div>
                  <h2 className="text-6xl font-black tracking-tighter leading-none">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">{user?.displayName?.split(' ')[0] || "Traveler"}!</span>
                  </h2>
                  <p className="text-gray-400 text-lg font-medium max-w-md">
                    You have {trips.filter(t => new Date(t.startDate) > new Date()).length} upcoming adventures waiting for you.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative group flex-1 sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search journeys or cities..."
                      className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--primary)] transition-all font-medium text-white shadow-2xl"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length > 2) setActiveTab("explore");
                      }}
                    />
                  </div>
                  <button onClick={() => setShowCreateModal(true)} className="btn-primary py-4 px-8 shadow-[0_0_50px_rgba(0,201,255,0.2)] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={24} strokeWidth={3} />
                    <span className="font-bold tracking-tight">PLAN NEW TRIP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "ACTIVE PLANS", value: trips.filter(t => new Date(t.startDate) > new Date()).length, icon: <MapPin size={24} />, color: "from-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
                { label: "STOPS PLANNED", value: stats.upcomingStops, icon: <Calendar size={24} />, color: "from-purple-500/20", border: "border-purple-500/30", text: "text-purple-400" },
                { label: "TOTAL BUDGET", value: `$${stats.totalBudget.toLocaleString()}`, icon: <TrendingUp size={24} />, color: "from-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400" }
              ].map((item, i) => (
                <div key={i} className={`relative glass-card p-8 bg-gradient-to-br ${item.color} to-black/40 border ${item.border} group hover:border-[var(--primary)] transition-all duration-500 overflow-hidden`}>
                  <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-colors"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`text-[10px] font-black tracking-[0.2em] opacity-60 ${item.text}`}>{item.label}</p>
                      <h3 className="text-5xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">{item.value}</h3>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-all duration-500 ${item.text}`}>
                      {item.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Journeys Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[var(--primary)] rounded-full"></div>
                  <h2 className="text-2xl font-black tracking-tight">Recent Journeys</h2>
                </div>
                <button onClick={() => setActiveTab('my-trips')} className="text-sm font-bold text-[var(--primary)] hover:opacity-80">
                  View Library
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.slice(0, 3).map(trip => (
                  <Link key={trip.id} href={`/trips/${trip.id}/edit`} className="block">
                    <TripCard trip={trip} onDelete={() => handleDeleteTrip(trip.id!)} />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "my-trips" && (
          <section className="animate-fade-in space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 text-[var(--primary)] font-black text-xs uppercase tracking-[0.3em] mb-4">
                  <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
                  Collections
                </div>
                <h2 className="text-6xl font-black tracking-tighter leading-none">Your Library</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative group w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--primary)] transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 p-1.5 bg-white/5 w-fit rounded-2xl border border-white/5">
              {['all', 'upcoming', 'completed'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setTripFilter(f)}
                  className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    tripFilter === f 
                    ? 'bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips
                .filter(trip => {
                  const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const isUpcoming = new Date(trip.startDate) > new Date();
                  
                  if (tripFilter === 'upcoming') return matchesSearch && isUpcoming;
                  if (tripFilter === 'completed') return matchesSearch && !isUpcoming;
                  return matchesSearch;
                })
                .map(trip => (
                  <Link key={trip.id} href={`/trips/${trip.id}/edit`} className="block">
                    <TripCard trip={trip} onDelete={() => handleDeleteTrip(trip.id!)} />
                  </Link>
                ))}
            </div>
          </section>
        )}

        {activeTab === "explore" && (
          <section className="animate-fade-in space-y-12">
            <div>
              <div className="flex items-center gap-3 text-[var(--primary)] font-black text-xs uppercase tracking-[0.3em] mb-4">
                <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
                World Discovery
              </div>
              <h2 className="text-6xl font-black tracking-tighter leading-none">Explore Destinations</h2>
            </div>

            <div className="relative h-[600px] rounded-[3.5rem] overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
              <img 
                src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=1600" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4000ms]"
                alt="Explore Hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-16">
                <div className="max-w-3xl space-y-8">
                  <div className="flex items-center gap-3 text-[var(--primary)] font-black text-xs uppercase tracking-[0.4em]">
                    <div className="w-12 h-[2px] bg-[var(--primary)]"></div>
                    Featured Experience
                  </div>
                  <h2 className="text-[120px] font-black tracking-tighter leading-[0.75] italic text-white mix-blend-difference">London,<br/>Calling.</h2>
                  <p className="text-gray-300 text-2xl font-medium leading-relaxed max-w-xl opacity-90">
                    Dive into the neon-lit streets of Soho or the historic halls of Westminster. Your British adventure starts here.
                  </p>
                  <button 
                    onClick={() => {
                      setNewTripName("Trip to London, UK");
                      setShowCreateModal(true);
                    }} 
                    className="btn-primary py-6 px-16 text-2xl group/btn shadow-[0_0_60px_rgba(0,201,255,0.4)]"
                  >
                    PLAN THIS JOURNEY
                    <ChevronRight className="group-hover:translate-x-3 transition-transform" size={28} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 text-[var(--primary)] font-black text-xs uppercase tracking-[0.3em] mb-4">
                    <div className="w-8 h-[2px] bg-[var(--primary)]"></div>
                    Trending
                  </div>
                  <h2 className="text-6xl font-black tracking-tighter leading-none">Popular Destinations</h2>
                </div>
                <div className="relative group w-full md:w-[450px]">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" size={24} />
                  <input 
                    type="text" 
                    placeholder="Where do you want to go?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 focus:outline-none focus:border-[var(--primary)] transition-all font-bold text-lg shadow-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                  { title: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1540959733332-e94e270b4d82?auto=format&fit=crop&q=80&w=800", trips: "98%", cost: 4 },
                  { title: "Paris, France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800", trips: "99%", cost: 5 },
                  { title: "New York, USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800", trips: "97%", cost: 5 },
                  { title: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800", trips: "95%", cost: 2 },
                  { title: "Rome, Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800", trips: "96%", cost: 3 },
                  { title: "Dubai, UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800", trips: "94%", cost: 5 },
                  { title: "London, UK", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800", trips: "98%", cost: 5 },
                  { title: "Bangkok, Thailand", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579367?auto=format&fit=crop&q=80&w=800", trips: "97%", cost: 2 },
                  { title: "Barcelona, Spain", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800", trips: "95%", cost: 3 },
                  { title: "Kyoto, Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800", trips: "92%", cost: 3 }
                ].filter(dest => dest.title.toLowerCase().includes(searchQuery.toLowerCase())).map((dest, i) => (
                  <div key={i} className="glass-card !p-0 overflow-hidden group/city cursor-pointer h-[400px]" onClick={() => {
                    setNewTripName(`Journey to ${dest.title}`);
                    setShowCreateModal(true);
                  }}>
                    <div className="h-48 relative">
                      <img src={dest.image} className="w-full h-full object-cover group-hover/city:scale-110 transition-transform duration-500" alt={dest.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-6">
                        <h3 className="text-2xl font-bold">{dest.title}</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cost Index</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <DollarSign key={i} size={12} className={i < dest.cost ? "text-green-400" : "text-gray-700"} />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase font-black block tracking-widest">Popularity</span>
                          <span className="text-xl font-black text-[var(--primary)]">{dest.trips}</span>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-black transition-all">
                        Launch Journey
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="animate-fade-in py-12 px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-12">
                
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                  <h2 className="text-2xl font-bold mb-8 px-2">Settings</h2>
                  {[
                    { id: 'profile', label: 'Profile Information', icon: <UserIcon size={18} /> },
                    { id: 'preferences', label: 'Travel Preferences', icon: <Compass size={18} /> },
                    { id: 'security', label: 'Security & Privacy', icon: <ShieldCheck size={18} /> },
                    { id: 'notifications', label: 'Notifications', icon: <Zap size={18} /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsView(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${settingsView === item.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Settings Content Area */}
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {settingsView === 'profile' && (
                      <motion.div 
                        key="profile"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        <div className="glass-card p-8 lg:p-10">
                          <h3 className="text-xl font-bold mb-8">Profile Details</h3>
                          <div className="flex items-center gap-8 mb-10 pb-10 border-b border-white/5">
                            <div className="relative group">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-4xl font-black text-black shadow-2xl">
                                {user?.displayName?.charAt(0) || "U"}
                              </div>
                              <button className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">Change</button>
                            </div>
                            <div>
                              <p className="text-2xl font-black tracking-tight">{user?.displayName || "User"}</p>
                              <p className="text-gray-500 font-medium">{user?.email}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Display Name</label>
                              <input 
                                type="text" 
                                defaultValue={user?.displayName || ""} 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[var(--primary)] outline-none font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Location</label>
                              <input 
                                type="text" 
                                placeholder="e.g. New York, USA"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[var(--primary)] outline-none font-medium"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Short Bio</label>
                              <textarea 
                                placeholder="Tell us about your travel style..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[var(--primary)] outline-none font-medium min-h-[100px]"
                              />
                            </div>
                          </div>
                          <button className="btn-primary mt-10 px-8">Save Changes</button>
                        </div>
                      </motion.div>
                    )}

                    {settingsView === 'preferences' && (
                      <motion.div 
                        key="preferences"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        <div className="glass-card p-8 lg:p-10">
                          <h3 className="text-xl font-bold mb-8">Travel Intel</h3>
                          
                          <div className="space-y-10">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Preferred Travel Style</label>
                              <div className="flex flex-wrap gap-3">
                                {['Adventure', 'Relaxation', 'Luxury', 'Budget', 'Culture', 'Backpacking'].map(style => (
                                  <button key={style} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-[var(--primary)] hover:text-black transition-all">
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Dietary Preferences</label>
                              <div className="flex flex-wrap gap-3">
                                {['No Preference', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free'].map(diet => (
                                  <button key={diet} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-[var(--secondary)] hover:text-black transition-all">
                                    {diet}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Preferred Currency</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[var(--primary)] outline-none font-medium appearance-none">
                                  <option>USD ($)</option>
                                  <option>EUR (€)</option>
                                  <option>INR (₹)</option>
                                  <option>GBP (£)</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Travel Pace</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[var(--primary)] outline-none font-medium appearance-none">
                                  <option>Relaxed (1-2 places/day)</option>
                                  <option>Balanced (3-4 places/day)</option>
                                  <option>Fast (5+ places/day)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <button className="btn-primary mt-10 px-8">Save Preferences</button>
                        </div>
                      </motion.div>
                    )}

                    {settingsView === 'security' && (
                      <motion.div 
                        key="security"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        <div className="glass-card p-8 lg:p-10">
                          <h3 className="text-xl font-bold mb-8">Security & Connectivity</h3>
                          
                          <div className="space-y-10">
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                  <Lock size={20} className="text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold">Two-Factor Authentication</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recommended for elite safety</p>
                                </div>
                              </div>
                              <div className="w-12 h-6 bg-white/10 rounded-full relative p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Connected Accounts</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-blue-400" />
                                    <span className="text-sm font-bold">Google</span>
                                  </div>
                                  <span className="text-[9px] font-black text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded">Linked</span>
                                </div>
                                <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                  <div className="flex items-center gap-3 opacity-50">
                                    <Zap size={18} className="text-gray-400" />
                                    <span className="text-sm font-bold">Apple ID</span>
                                  </div>
                                  <button className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest hover:underline">Link Now</button>
                                </div>
                              </div>
                            </div>

                            <div className="pt-10 border-t border-white/5">
                              <h4 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-widest">Danger Zone</h4>
                              <p className="text-xs text-gray-500 mb-6">These actions are permanent and cannot be reversed.</p>
                              <button 
                                onClick={handleDeleteAccount}
                                className="px-6 py-3 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
                              >
                                Terminate Account
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {settingsView === 'notifications' && (
                      <motion.div 
                        key="notifications"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        <div className="glass-card p-8 lg:p-10">
                          <h3 className="text-xl font-bold mb-8">Neural Alerts</h3>
                          
                          <div className="space-y-6">
                            {[
                              { label: "Trip Collaboration", desc: "Get notified when someone adds you to a trip." },
                              { label: "Itinerary Updates", desc: "Neural alerts when your plan changes." },
                              { label: "Flight Status", desc: "Real-time alerts for delays and gate changes." },
                              { label: "Elite Insights", desc: "Personalized travel tips based on your style." }
                            ].map((note, i) => (
                              <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold">{note.label}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{note.desc}</p>
                                </div>
                                <div className="w-12 h-6 bg-[var(--primary)]/20 rounded-full relative p-1 cursor-pointer">
                                  <div className="w-4 h-4 bg-[var(--primary)] rounded-full float-right"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full px-2 ${active ? 'bg-[var(--primary)] text-black font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span className="hidden md:block">{label}</span>
    </button>
  );
}

function StatCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="glass-card p-6">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <h3 className="text-3xl font-bold mb-2">{value}</h3>
      <p className="text-xs text-[var(--primary)]">{trend}</p>
    </div>
  );
}

function TripCard({ trip, onDelete }: { trip: any, onDelete: () => void }) {
  const isUpcoming = new Date(trip.startDate) > new Date();
  
  // Intelligence Mapping: Keywords to Specific High-Quality Photos
  const getSmartPhoto = (name: string) => {
    const n = name.toLowerCase().trim();
    
    // Gujarat Specifics
    if (n.includes('ahmedabad')) return "1584861596773-424683072b22"; // Adalaj Stepwell
    if (n.includes('gir') || n.includes('sasan')) return "1591823376771-47752e50550f"; // Lion/Gir Forest
    if (n.includes('junagadh')) return "1589308078034-453046f25414"; // Girnar Hills
    if (n.includes('somnath')) return "1624483096644-8395e54d890d";
    if (n.includes('dwarka')) return "1619443143113-eb15a3d47f01";
    if (n.includes('keshod')) return "1589308078034-453046f25414"; // Generic Junagadh area
    
    // Rest of India
    if (n.includes('varanasi')) return "1561361513-2d000a50f0dc";
    if (n.includes('jaipur')) return "1477587458883-47145ed94245";
    if (n.includes('ladakh') || n.includes('leh')) return "1544085311-11a028465b03";
    if (n.includes('goa')) return "1512343879784-a960bf40e7f2";
    if (n.includes('mumbai')) return "1566548971394-89ec9101febf";
    if (n.includes('delhi')) return "1585133073231-163e063c7b5d";
    if (n.includes('india')) return "1524491991444-24584285b542";
    
    // Global Hubs
    if (n.includes('tokyo') || n.includes('japan')) return "1503899036014-c24c607242d7";
    if (n.includes('paris') || n.includes('france')) return "1502602898657-3e91760cbb34";
    if (n.includes('london') || n.includes('uk') || n.includes('kingdom')) return "1505761671935-60b3a7427bad";
    if (n.includes('new york') || n.includes('nyc') || n.includes('usa')) return "1496442226666-8d4d0e62e6e9";
    if (n.includes('bali') || n.includes('indonesia')) return "1537996194471-e657df975ab4";
    if (n.includes('kyoto')) return "1493976040374-85c8e12f0c0e";
    if (n.includes('rome') || n.includes('italy')) return "1552832230-c0197dd311b5";
    if (n.includes('santorini') || n.includes('greece')) return "1570077188670-e3a8d69ac5ff";
    if (n.includes('swiss') || n.includes('alps') || n.includes('switzerland')) return "1464822759023-fed622ff2c3b";
    
    // Fallback to stable random selection (if no keyword matches)
    const fallbacks = [
      "1469854523086-cc02fe5d8800", "1501785888041-af3ef285b470", 
      "1507525428034-b723cf961d3e", "1493246507139-91e8bef99c17",
      "1500835595337-f756271f26f6", "1476514525535-07fb3b4ae5f1"
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    return fallbacks[Math.abs(hash) % fallbacks.length];
  };

  const photoId = getSmartPhoto(trip.name);
  const imageUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=800`;

  return (
    <div className="group glass-card overflow-hidden border-none shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-[480px] relative">
      <div className="h-2/3 relative overflow-hidden">
        <img 
          src={trip.coverUrl || imageUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          alt={trip.name}
          onError={(e: any) => {
            e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800";
          }}
        />
        <div className="absolute top-4 left-4">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl border ${isUpcoming ? 'bg-[var(--primary)] text-black border-transparent' : 'bg-white/10 text-white border-white/20'}`}>
            {isUpcoming ? "Upcoming" : "Completed"}
          </div>
        </div>
        
        {/* Delete Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="p-8 flex-1 flex flex-col justify-between bg-white/[0.02]">
        <div className="space-y-3">
          <h3 className="text-2xl font-black tracking-tight group-hover:text-[var(--primary)] transition-colors line-clamp-1">
            {trip.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[var(--primary)]" />
              <span>{trip.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--primary)]" />
              <span>{isUpcoming ? "Planning" : "Archived"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">View Itinerary</span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExploreCard({ title, image, trips, onPlan }: { title: string, image: string, trips: string, onPlan: () => void }) {
  return (
    <div className="glass-card overflow-hidden group cursor-pointer border-none shadow-xl relative h-[400px]">
      <img 
        src={image} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        alt={title} 
        onError={(e: any) => {
          e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
        <h4 className="text-2xl font-bold mb-1">{title}</h4>
        <p className="text-sm text-gray-400 mb-6">{trips} explorers planned here</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPlan();
          }}
          className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-bold hover:bg-[var(--primary)] hover:text-black transition-all"
        >
          Plan This Trip
        </button>
      </div>
    </div>
  );
}

function RecommendedItem({ title, image }: { title: string, image: string }) {
  return (
    <div className="min-w-[200px] h-32 rounded-2xl overflow-hidden relative group cursor-pointer">
      <img src={image} className="w-full h-full object-cover" alt={title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
        <span className="text-sm font-semibold">{title}</span>
      </div>
    </div>
  );
}
