"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  addStopToTrip, 
  addActivityToStop, 
  getFullItinerary, 
  updateTripPackingList,
  clearTripStops,
  addNoteToTrip,
  getTripNotes,
  deleteNote,
  Trip, 
  Stop, 
  Activity,
  TripNote 
} from "@/lib/db";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  X,
  Info,
  ChevronRight,
  Book,
  FileText,
  StickyNote,
  Send
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ItineraryBuilder() {
  const { id: tripId } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStop, setShowAddStop] = useState(false);
  
  // New Stop Form State
  const [newStopCity, setNewStopCity] = useState("");
  const [newStopArrival, setNewStopArrival] = useState("");
  const [newStopDeparture, setNewStopDeparture] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (tripId) fetchItinerary();
  }, [tripId, user, authLoading]);

  const fetchItinerary = async () => {
    try {
      const data = await getFullItinerary(tripId);
      setTrip(data);
    } catch (err) {
      console.error("Failed to fetch itinerary", err);
    } finally {
      setLoading(false);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Journal State
  const [showJournal, setShowJournal] = useState(false);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("General");

  useEffect(() => {
    if (tripId) fetchNotes();
  }, [tripId]);

  const fetchNotes = async () => {
    try {
      const data = await getTripNotes(tripId);
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    
    try {
      await addNoteToTrip(tripId, {
        content: newNoteContent,
        category: noteCategory
      });
      setNewNoteContent("");
      fetchNotes();
    } catch (err) {
      alert("Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteNote(tripId, noteId);
      fetchNotes();
    } catch (err) {
      alert("Failed to delete note");
    }
  };

  const handleGenerateAI = async () => {
    if (!trip || isGenerating) return;
    setIsGenerating(true);
    
    try {
      // Clear existing stops first to avoid duplication/clutter
      await clearTripStops(tripId);
      
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: trip.name,
          startDate: trip.startDate,
          endDate: trip.endDate
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Iterate through generated days and save them
      for (const [index, dayData] of data.days.entries()) {
        const date = new Date(trip.startDate);
        date.setDate(date.getDate() + (dayData.dayNumber - 1));

        const stopId = await addStopToTrip(tripId, {
          cityName: dayData.cityName,
          arrivalDate: date,
          departureDate: date,
          orderIndex: index
        });

        // Add activities for this day
        for (const act of dayData.activities) {
          await addActivityToStop(tripId, stopId, {
            name: act.name,
            cost: act.cost,
            duration: act.duration,
            category: act.category,
            timeStart: act.timeStart,
            description: act.description,
            famousFor: act.famousFor,
            imageSearchKeyword: act.imageSearchKeyword
          });
        }
      }

      await fetchItinerary(); // Refresh UI
      alert("AI Itinerary Generated Successfully!");
    } catch (err: any) {
      console.error("AI Generation failed", err);
      alert("AI Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStopToTrip(tripId, {
        cityName: newStopCity,
        arrivalDate: new Date(newStopArrival),
        departureDate: new Date(newStopDeparture),
        orderIndex: trip?.stops?.length || 0
      });
      setShowAddStop(false);
      fetchItinerary(); // Refresh
    } catch (err) {
      alert("Failed to add stop");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[var(--primary)]/30">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{trip?.name || "Edit Itinerary"}</h1>
            <p className="text-xs text-gray-400">{trip?.stops?.length || 0} Days Planned</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10">
            <ImageIcon size={16} />
            <span>Change Cover</span>
          </button>
          <button 
            onClick={() => setShowJournal(true)}
            className="glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10"
          >
            <Book size={16} />
            <span>Trip Journal</span>
          </button>
          <button 
            onClick={() => router.push("/dashboard")}
            className="btn-primary py-2 px-6"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Trip Banner */}
        <div className="h-80 rounded-[2.5rem] overflow-hidden mb-12 relative group shadow-2xl">
          <img 
            src={trip?.coverUrl || `https://loremflickr.com/1200/600/travel,${encodeURIComponent(trip?.name || 'nature')}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt="Cover" 
            onError={(e: any) => {
              e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                  Verified Trip
                </span>
              </div>
              <div className="mt-auto">
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-4xl font-bold">{trip?.name}</h2>
                <div className="px-4 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/10 backdrop-blur-md">
                  {Math.ceil(Math.abs(new Date(trip?.endDate).getTime() - new Date(trip?.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days Journey
                </div>
              </div>
              <p className="text-gray-300 max-w-xl">{trip?.description || "Build your dream itinerary day by day. Add stops, activities, and manage your budget all in one place."}</p>
            </div>
            </div>
          </div>
        </div>

        {/* Timeline & Packing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <MapPin className="text-[var(--primary)]" />
                DAILY ITINERARY
              </h2>
              {trip?.stops?.length === 1 && (
                <div className="text-xs text-gray-500 italic bg-white/5 px-3 py-1 rounded-lg">
                  💡 Tip: Set a longer date range in Dashboard to see more daily sections
                </div>
              )}
            </div>
            
            <div className="space-y-16">
              {trip?.stops?.map((stop: any, index: number) => (
                <div key={stop.id} className="relative group">
                  {/* Vertical Timeline Thread */}
                  {index < (trip.stops.length - 1) && (
                    <div className="absolute left-[31px] top-20 bottom-[-64px] w-[2px] bg-gradient-to-b from-[var(--primary)] to-transparent opacity-20"></div>
                  )}

                  <div className="flex gap-8 items-start">
                    {/* Day Badge */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center shadow-2xl relative z-10 group-hover:border-[var(--primary)] transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">Day</span>
                        <span className="text-2xl font-black text-[var(--primary)]">{index + 1}</span>
                      </div>
                      <div className="absolute inset-0 bg-[var(--primary)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Daily Content Card */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-black tracking-tight">{stop.cityName}</h3>
                          <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            {new Date(stop.arrivalDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setNoteCategory(`Day ${index + 1}`);
                              setShowJournal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-[var(--primary)] transition-colors bg-white/5 rounded-lg"
                            title="Add Daily Note"
                          >
                            <StickyNote size={18} />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-white/5 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {stop.activities?.map((activity: Activity) => (
                          <div 
                            key={activity.id} 
                            onClick={() => setSelectedActivity(activity)}
                            className="glass-card !bg-white/[0.03] !p-5 flex items-center justify-between group/act hover:!bg-white/[0.08] transition-all cursor-pointer border border-white/5 hover:border-[var(--primary)]/30"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[var(--primary)] group-hover/act:scale-110 transition-transform">
                                <Clock size={20} />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold flex items-center gap-2 group-hover/act:text-[var(--primary)] transition-colors">
                                  {activity.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                                    {activity.timeStart || "Morning"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {activity.duration} mins
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Est. Cost</p>
                                <span className="text-xl font-black text-green-400">${activity.cost}</span>
                              </div>
                              <ChevronRight className="text-gray-600 group-hover/act:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                        
                        <button className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-sm font-bold text-gray-500 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all flex items-center justify-center gap-3 group/add">
                          <Plus size={18} className="group-hover/add:rotate-90 transition-transform" />
                          <span>ADD ACTIVITY TO DAY {index + 1}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Stop Button */}
            {!showAddStop ? (
              <button 
                onClick={() => setShowAddStop(true)}
                className="ml-24 flex items-center gap-3 p-6 glass-card border-dashed border-2 border-white/5 text-gray-400 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-all w-[calc(100%-96px)] group/addstop"
              >
                <div className="w-12 h-12 rounded-2xl border-2 border-white/10 flex items-center justify-center group-hover/addstop:border-[var(--primary)] transition-colors">
                  <Plus size={24} />
                </div>
                <span className="text-xl font-bold">Add Next Day manually</span>
              </button>
            ) : (
              <div className="ml-24 glass-card p-8 w-[calc(100%-96px)] animate-fade-in border-[var(--primary)]/20">
                <h3 className="text-xl font-bold mb-6">New Travel Stop</h3>
                <form onSubmit={handleAddStop} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">City Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tokyo, Japan" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[var(--primary)]"
                      value={newStopCity}
                      onChange={(e) => setNewStopCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Arrival Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[var(--primary)]"
                      value={newStopArrival}
                      onChange={(e) => setNewStopArrival(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Departure Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[var(--primary)]"
                      value={newStopDeparture}
                      onChange={(e) => setNewStopDeparture(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-full flex gap-3 mt-4">
                    <button type="submit" className="btn-primary px-8">Confirm Stop</button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddStop(false)}
                      className="glass px-8 py-3 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Side Panel: Packing & Budget */}
          <div className="space-y-8">
            <div className="glass-card p-6 border-[var(--primary)]/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-[var(--primary)]" size={20} />
                Packing Checklist
              </h3>
              <div className="space-y-3">
                {(trip?.packingList || [
                  { label: "Passport & Visa", checked: true },
                  { label: "Universal Adapter", checked: false },
                  { label: "Hiking Shoes", checked: false },
                  { label: "First Aid Kit", checked: true },
                  { label: "Offline Maps", checked: false }
                ]).map((item: any, idx: number) => (
                  <PackingItem 
                    key={idx} 
                    label={item.label} 
                    checked={item.checked} 
                    onToggle={async (newVal) => {
                      const newList = [...(trip?.packingList || [])];
                      if (newList[idx]) {
                        newList[idx].checked = newVal;
                      } else {
                        const defaultItems = [
                          { label: "Passport & Visa", checked: true },
                          { label: "Universal Adapter", checked: false },
                          { label: "Hiking Shoes", checked: false },
                          { label: "First Aid Kit", checked: true },
                          { label: "Offline Maps", checked: false }
                        ];
                        defaultItems[idx].checked = newVal;
                        await updateTripPackingList(tripId, defaultItems);
                        return;
                      }
                      await updateTripPackingList(tripId, newList);
                      fetchItinerary();
                    }}
                  />
                ))}
              </div>
              <button 
                onClick={async () => {
                  const newItem = prompt("What else do you need to pack?");
                  if (newItem) {
                    const currentList = trip?.packingList || [
                      { label: "Passport & Visa", checked: true },
                      { label: "Universal Adapter", checked: false },
                      { label: "Hiking Shoes", checked: false },
                      { label: "First Aid Kit", checked: true },
                      { label: "Offline Maps", checked: false }
                    ];
                    await updateTripPackingList(tripId, [...currentList, { label: newItem, checked: false }]);
                    fetchItinerary();
                  }
                }}
                className="w-full mt-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors border-t border-white/5 pt-4"
              >
                + Add Custom Item
              </button>
            </div>

            <div className="glass p-6 shadow-2xl border-[var(--primary)]/30 sticky top-32">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                  <DollarSign size={20} />
                </div>
                <h4 className="font-bold">Budget Breakdown</h4>
              </div>
              <div className="space-y-3 mb-6">
                <BudgetRow 
                  label="Activities" 
                  value={`$${trip?.stops?.reduce((acc: number, stop: any) => 
                    acc + (stop.activities?.reduce((aAcc: number, act: any) => aAcc + (act.cost || 0), 0) || 0), 0).toLocaleString()}`} 
                />
                <BudgetRow label="Accommodation (Est.)" value="$0" />
                <BudgetRow label="Transport (Est.)" value="$0" />
                <div className="h-[1px] bg-white/10 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-400">Total Est.</span>
                  <span className="text-3xl font-bold gradient-text">
                    ${trip?.stops?.reduce((acc: number, stop: any) => 
                      acc + (stop.activities?.reduce((aAcc: number, act: any) => aAcc + (act.cost || 0), 0) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="btn-primary w-full justify-center py-4 relative overflow-hidden group"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>AI is Planning...</span>
                  </div>
                ) : (
                  <>
                    <TrendingUp size={20} className="group-hover:scale-125 transition-transform" />
                    <span>Generate Itinerary with AI</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Activity Detail Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass max-w-2xl w-full overflow-hidden relative border-[var(--primary)]/30"
            >
              <button 
                onClick={() => setSelectedActivity(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all"
              >
                <X size={20} />
              </button>

              <div className="h-64 relative">
                <img 
                  src={`https://loremflickr.com/800/600/${encodeURIComponent(selectedActivity.name || 'travel')}/all?lock=${selectedActivity.id || 1}`} 
                  className="w-full h-full object-cover"
                  alt={selectedActivity.name}
                  onError={(e: any) => {
                    e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <span className="px-3 py-1 bg-[var(--primary)] text-black text-xs font-bold uppercase rounded-full mb-3 inline-block">
                    {selectedActivity.category}
                  </span>
                  <h2 className="text-4xl font-bold">{selectedActivity.name}</h2>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest mb-2">About this place</h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {selectedActivity.description || "No description available for this activity yet. AI is still learning about this beautiful spot!"}
                  </p>
                </div>

                {selectedActivity.famousFor && (
                  <div className="p-4 bg-[var(--primary)]/5 border-l-4 border-[var(--primary)] rounded-r-xl">
                    <h4 className="text-xs font-bold text-[var(--primary)] uppercase mb-1">Why it's iconic</h4>
                    <p className="text-sm text-gray-200">{selectedActivity.famousFor}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">Duration</p>
                    <p className="font-bold">{selectedActivity.duration} mins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">Est. Cost</p>
                    <p className="font-bold text-green-400">${selectedActivity.cost}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">Time</p>
                    <p className="font-bold">{selectedActivity.timeStart || "Flexible"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* Trip Journal Modal */}
        {showJournal && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              className="glass w-full max-w-md h-screen flex flex-col shadow-2xl border-l border-white/10"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Book className="text-[var(--primary)]" />
                    Trip Journal
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Jot down memories and reminders</p>
                </div>
                <button onClick={() => setShowJournal(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Category</label>
                    <select 
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[var(--primary)]"
                    >
                      <option className="bg-black" value="General">General Note</option>
                      <option className="bg-black" value="Reminder">Reminder</option>
                      <option className="bg-black" value="Hotel">Hotel Info</option>
                      <option className="bg-black" value="Contact">Local Contact</option>
                      {trip?.stops?.map((_: any, i: number) => (
                        <option key={i} className="bg-black" value={`Day ${i + 1}`}>Day {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <textarea 
                      placeholder="Write your note here..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-[var(--primary)] resize-none"
                    ></textarea>
                    <button 
                      type="submit"
                      className="absolute bottom-4 right-4 p-2 bg-[var(--primary)] text-black rounded-lg hover:scale-110 transition-transform shadow-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5 pb-2">Recent Notes</h3>
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto text-gray-700 mb-3" size={40} />
                      <p className="text-sm text-gray-500">Your journal is empty.</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="glass-card !p-4 group/note">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            note.category.includes('Day') ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-white/10 text-gray-400'
                          }`}>
                            {note.category}
                          </span>
                          <button 
                            onClick={() => handleDeleteNote(note.id!)}
                            className="text-gray-600 hover:text-red-500 opacity-0 group-hover/note:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        <p className="text-[9px] text-gray-600 mt-3 font-mono">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

function PackingItem({ label, checked = false, onToggle }: { label: string, checked?: boolean, onToggle?: (val: boolean) => void }) {
  const [isChecked, setIsChecked] = useState(checked);
  
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    const newVal = !isChecked;
    setIsChecked(newVal);
    if (onToggle) onToggle(newVal);
  };

  return (
    <div 
      onClick={handleToggle}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all group"
    >
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-white/20 group-hover:border-[var(--primary)]'}`}>
        {isChecked && <CheckCircle2 size={14} color="#000" />}
      </div>
      <span className={`text-sm transition-all ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{label}</span>
    </div>
  );
}

function BudgetRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
