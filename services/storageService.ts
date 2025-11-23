import { User, ChatSession, Appointment, Resource, JournalEntry } from '../types';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || "");
const USER_KEY = 'mansahay_current_user';
const DATA_PREFIX = 'mansahay_data_';

class StorageService {
  
  // --- Data Helpers ---
  // Convert Date objects to ISO strings for Convex
  private serialize(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  // Convert ISO strings back to Date objects for App
  private rehydrateDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(v => this.rehydrateDates(v));
    }
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key in obj) {
        res[key] = this.rehydrateDates(obj[key]);
      }
      return res;
    }
    return obj;
  }

  private getUserDataKey(userId: string) {
    return `${DATA_PREFIX}${userId}`;
  }

  // --- Auth & User Methods ---

  getUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      
      // Hydrate Dates for Profile
      return {
        ...parsed,
        joinDate: new Date(parsed.joinDate),
        emergencyContacts: parsed.emergencyContacts || [],
        goals: parsed.goals || [],
        triggers: parsed.triggers || [],
        preferences: parsed.preferences || { aiTone: 'empathetic' }
      };
    } catch (e) {
      console.warn("Storage access failed", e);
      return null;
    }
  }

  async login(email: string): Promise<User> {
    try {
      // 1. Try to get from Cloud DB
      let userConfig = await convex.query(api.api.getUser, { email });

      // 2. Auto-create if Clerk login succeeded but no DB record
      if (!userConfig) {
         console.log("User missing in DB, auto-creating...");
         userConfig = await convex.mutation(api.api.createUser, {
             name: email.split('@')[0],
             email: email
         });
      }

      if (userConfig) {
        const user: User = {
          id: userConfig._id,
          name: userConfig.name,
          email: userConfig.email,
          joinDate: new Date(userConfig.joinDate),
          phone: userConfig.phone,
          dateOfBirth: userConfig.dateOfBirth,
          medicalHistory: userConfig.medicalHistory,
          emergencyContacts: userConfig.emergencyContacts || [],
          goals: userConfig.goals || [],
          triggers: userConfig.triggers || [],
          preferences: userConfig.preferences || { aiTone: 'empathetic' }
        };
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      throw new Error("User retrieval failed");
    } catch (e) {
      console.error("Login error", e);
      // Throwing to allow App UI to handle failure
      throw e; 
    }
  }

  async signup(name: string, email: string): Promise<User> {
    const userRecord = await convex.mutation(api.api.createUser, {
        name, 
        email
    });

    const user: User = {
        id: userRecord._id,
        name: userRecord.name,
        email: userRecord.email,
        joinDate: new Date(userRecord.joinDate),
        emergencyContacts: [],
        goals: [],
        triggers: [],
        preferences: { aiTone: 'empathetic' }
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  async updateUser(user: User) {
      // 1. Update Local Cache
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // 2. Update Cloud
      try {
          await convex.mutation(api.api.updateUser, {
              id: user.id as Id<"users">,
              name: user.name,
              phone: user.phone,
              dateOfBirth: user.dateOfBirth,
              medicalHistory: user.medicalHistory,
              goals: user.goals,
              triggers: user.triggers,
              preferences: user.preferences,
              emergencyContacts: user.emergencyContacts
          });
      } catch(e) {
          console.error("Failed to sync profile update to cloud", e);
      }
  }

  logout() {
    localStorage.removeItem(USER_KEY);
    // Optional: Clear cached session data too
    const userId = this.getUser()?.id;
    if(userId) localStorage.removeItem(this.getUserDataKey(userId));
  }

  // --- Application Data Methods (Chats, etc) ---

  saveData(userId: string, sessions: ChatSession[], appointments: Appointment[], resources: Resource[], journalEntries: JournalEntry[] = []) {
    // 1. Save Local (Sync) for performance
    const data = {
      sessions,
      appointments,
      resources,
      journalEntries,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));

    // 2. Save Cloud (Async)
    convex.mutation(api.api.saveUserData, {
      userId,
      sessions: this.serialize(sessions),
      appointments: this.serialize(appointments),
      resources: this.serialize(resources),
      journalEntries: this.serialize(journalEntries),
      lastSaved: data.lastSaved
    }).catch(e => console.error("Cloud save failed", e));
  }

  loadData(userId: string): { sessions: ChatSession[], appointments: Appointment[], resources: Resource[], journalEntries: JournalEntry[] } {
    // 1. Trigger Cloud Sync in background
    this.syncFromCloud(userId);

    // 2. Return Local Cache immediately
    try {
      const stored = localStorage.getItem(this.getUserDataKey(userId));
      if (!stored) return { sessions: [], appointments: [], resources: [], journalEntries: [] };
      
      const parsed = JSON.parse(stored);
      return this.rehydrateDates(parsed);
    } catch (e) {
      return { sessions: [], appointments: [], resources: [], journalEntries: [] };
    }
  }

  private async syncFromCloud(userId: string) {
      try {
          const cloudData = await convex.query(api.api.loadUserData, { userId });
          if (cloudData) {
              const hydrated = {
                  sessions: this.rehydrateDates(cloudData.sessions),
                  appointments: this.rehydrateDates(cloudData.appointments),
                  resources: this.rehydrateDates(cloudData.resources),
                  journalEntries: this.rehydrateDates(cloudData.journalEntries),
                  lastSaved: cloudData.lastSaved
              };
              // Update local cache silently
              localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(hydrated));
          }
      } catch(e) {
          console.error("Cloud sync failed", e);
      }
  }
}

export const storageService = new StorageService();