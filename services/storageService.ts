
import { User, ChatSession, Appointment, Resource, JournalEntry } from '../types';

const USER_KEY = 'mansahay_current_user';
const DATA_PREFIX = 'mansahay_data_';

class StorageService {
  // --- Auth Methods ---

  getUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
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
    // Simulating an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
            // Check if we have this user stored locally already to preserve their settings
            const existingUserStr = localStorage.getItem(USER_KEY);
            let userToReturn: User;

            if (existingUserStr && JSON.parse(existingUserStr).email === email) {
                userToReturn = JSON.parse(existingUserStr);
                userToReturn.joinDate = new Date(userToReturn.joinDate);
                userToReturn.emergencyContacts = userToReturn.emergencyContacts || [];
                userToReturn.goals = userToReturn.goals || [];
                userToReturn.triggers = userToReturn.triggers || [];
                userToReturn.preferences = userToReturn.preferences || { aiTone: 'empathetic' };
            } else {
                userToReturn = {
                    id: btoa(email), // simple ID generation
                    name: email.split('@')[0],
                    email: email,
                    joinDate: new Date(),
                    emergencyContacts: [],
                    goals: [],
                    triggers: [],
                    preferences: { aiTone: 'empathetic' }
                };
            }
            
            localStorage.setItem(USER_KEY, JSON.stringify(userToReturn));
            resolve(userToReturn);
        } catch (e) {
            // Fallback for when storage is full or disabled
            const fallbackUser: User = {
                id: 'temp-user',
                name: email.split('@')[0],
                email: email,
                joinDate: new Date(),
                emergencyContacts: [],
                goals: [],
                triggers: [],
                preferences: { aiTone: 'empathetic' }
            };
            resolve(fallbackUser);
        }
      }, 800);
    });
  }

  async signup(name: string, email: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: btoa(email),
          name: name,
          email: email,
          joinDate: new Date(),
          emergencyContacts: [],
          goals: [],
          triggers: [],
          preferences: { aiTone: 'empathetic' }
        };
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        } catch (e) {
            console.warn("Could not persist new user signup", e);
        }
        resolve(newUser);
      }, 800);
    });
  }

  logout() {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (e) {
        console.warn("Logout storage clear failed", e);
    }
  }

  updateUser(user: User) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.warn("Update user failed", e);
      }
  }

  // --- Data Methods ---

  private getUserDataKey(userId: string) {
    return `${DATA_PREFIX}${userId}`;
  }

  saveData(userId: string, sessions: ChatSession[], appointments: Appointment[], resources: Resource[], journalEntries: JournalEntry[] = []) {
    const data = {
      sessions,
      appointments,
      resources,
      journalEntries,
      lastSaved: new Date().toISOString()
    };
    try {
        localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));
    } catch (e) {
        console.warn("Failed to save user data (quota exceeded?)", e);
    }
  }

  loadData(userId: string): { sessions: ChatSession[], appointments: Appointment[], resources: Resource[], journalEntries: JournalEntry[] } {
    try {
      const stored = localStorage.getItem(this.getUserDataKey(userId));
      if (!stored) return { sessions: [], appointments: [], resources: [], journalEntries: [] };
      
      const parsed = JSON.parse(stored);
      
      // Hydrate dates
      const sessions = (parsed.sessions || []).map((s: any) => ({
        ...s,
        lastModified: new Date(s.lastModified),
        analysis: {
            ...s.analysis,
            lastUpdated: new Date(s.analysis.lastUpdated)
        },
        messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
        }))
      }));

      const appointments = parsed.appointments || [];
      
      // Sanitize Resources
      const resources = (parsed.resources || []).map((r: any) => ({
        ...r,
        type: r.type || 'file',
        origin: r.origin || 'user',
        date: new Date(r.date)
      }));

      const journalEntries = (parsed.journalEntries || []).map((j: any) => ({
        ...j,
        createdAt: new Date(j.createdAt),
        updatedAt: new Date(j.updatedAt)
      }));

      return { sessions, appointments, resources, journalEntries };
    } catch (e) {
      console.error("Failed to load user data", e);
      return { sessions: [], appointments: [], resources: [], journalEntries: [] };
    }
  }
}

export const storageService = new StorageService();
