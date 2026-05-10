import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentReference
} from "firebase/firestore";
import { db } from "./firebase";

// --- Trip Interfaces ---
export interface Trip {
  id?: string;
  userId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  coverUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  budget?: number;
}

export interface Stop {
  id?: string;
  cityName: string;
  arrivalDate: Date;
  departureDate: Date;
  orderIndex: number;
}

export interface Activity {
  id?: string;
  name: string;
  cost: number;
  duration: number; // in minutes
  category: string;
  timeStart?: string;
  description?: string;
  famousFor?: string;
  imageSearchKeyword?: string;
}

export interface TripNote {
  id?: string;
  content: string;
  category: string;
  createdAt: Date;
  stopId?: string;
}

// --- Helper Functions ---

/**
 * Creates a new trip document
 */
export const createTrip = async (tripData: Omit<Trip, "id" | "createdAt">) => {
  try {
    // Safety check for dates to prevent Firebase Timestamp errors
    const startDate = (tripData.startDate instanceof Date && !isNaN(tripData.startDate.getTime())) 
      ? Timestamp.fromDate(tripData.startDate) 
      : Timestamp.now();
      
    const endDate = (tripData.endDate instanceof Date && !isNaN(tripData.endDate.getTime())) 
      ? Timestamp.fromDate(tripData.endDate) 
      : Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const docRef = await addDoc(collection(db, "trips"), {
      ...tripData,
      createdAt: Timestamp.now(),
      startDate,
      endDate,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding trip: ", error);
    throw error;
  }
};

/**
 * Gets all trips for a specific user
 */
export const getUserTrips = async (userId: string) => {
  const q = query(collection(db, "trips"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: (doc.data().startDate as Timestamp).toDate(),
      endDate: (doc.data().endDate as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    } as Trip))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort in memory
};

/**
 * Adds a stop to a trip (Sub-collection)
 */
export const addStopToTrip = async (tripId: string, stopData: Stop) => {
  const stopsRef = collection(db, "trips", tripId, "stops");
  const docRef = await addDoc(stopsRef, {
    ...stopData,
    arrivalDate: Timestamp.fromDate(stopData.arrivalDate),
    departureDate: Timestamp.fromDate(stopData.departureDate),
  });
  return docRef.id;
};

/**
 * Adds an activity to a specific stop
 */
export const addActivityToStop = async (tripId: string, stopId: string, activityData: Activity) => {
  const activitiesRef = collection(db, "trips", tripId, "stops", stopId, "activities");
  const docRef = await addDoc(activitiesRef, activityData);
  return docRef.id;
};

/**
 * Gets a complete itinerary (Trips -> Stops -> Activities)
 */
export const getFullItinerary = async (tripId: string) => {
  // 1. Get Trip Info
  const tripSnap = await getDoc(doc(db, "trips", tripId));
  if (!tripSnap.exists()) return null;
  const tripData = tripSnap.data();
  const trip = { 
    id: tripSnap.id, 
    ...tripData,
    startDate: (tripData.startDate as Timestamp).toDate(),
    endDate: (tripData.endDate as Timestamp).toDate(),
  } as any;

  // 2. Get Stops
  const stopsSnap = await getDocs(query(collection(db, "trips", tripId, "stops"), orderBy("orderIndex")));
  const stops = await Promise.all(stopsSnap.docs.map(async (stopDoc) => {
    const sData = stopDoc.data();
    const stop = { 
      id: stopDoc.id, 
      ...sData,
      arrivalDate: (sData.arrivalDate as Timestamp).toDate(),
      departureDate: (sData.departureDate as Timestamp).toDate(),
    } as any;
    
    // 3. Get Activities for each stop
    const activitiesSnap = await getDocs(collection(db, "trips", tripId, "stops", stopDoc.id, "activities"));
    const activities = activitiesSnap.docs.map(actDoc => ({ id: actDoc.id, ...actDoc.data() })) as Activity[];
    
    return { ...stop, activities };
  }));

  return { ...trip, stops };
};

export const updateTripPackingList = async (tripId: string, packingList: any[]) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, { packingList });
};

export const deleteTrip = async (tripId: string) => {
  await deleteDoc(doc(db, "trips", tripId));
};

/**
 * Clears all stops for a trip (useful for re-generation)
 */
export const clearTripStops = async (tripId: string) => {
  const stopsRef = collection(db, "trips", tripId, "stops");
  const stopsSnap = await getDocs(stopsRef);
  for (const stopDoc of stopsSnap.docs) {
    await deleteDoc(doc(db, "trips", tripId, "stops", stopDoc.id));
  }
};

/**
 * Deletes all data for a user
 */
export const deleteUserData = async (userId: string) => {
  const q = query(collection(db, "trips"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
};

/**
 * Trip Notes Functions
 */
export const addNoteToTrip = async (tripId: string, note: Omit<TripNote, "id" | "createdAt">) => {
  const notesRef = collection(db, "trips", tripId, "notes");
  const docRef = await addDoc(notesRef, {
    ...note,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getTripNotes = async (tripId: string) => {
  const notesRef = collection(db, "trips", tripId, "notes");
  const q = query(notesRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp).toDate()
  })) as TripNote[];
};

export const deleteNote = async (tripId: string, noteId: string) => {
  await deleteDoc(doc(db, "trips", tripId, "notes", noteId));
};
