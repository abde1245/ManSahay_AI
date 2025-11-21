
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
        joinDate: new Date(parsed.joinDate)
      };
    } catch (e) {
      return null;
    }
  }

  async login(email: string): Promise<User> {
    // Simulating an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser: User = {
          id: btoa(email), // simple ID generation
          name: email.split('@')[0],
          email: email,
          joinDate: new Date()
        };
        
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        resolve(mockUser);
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
          joinDate: new Date()
        };
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 800);
    });
  }

  logout() {
    localStorage.removeItem(USER_KEY);
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
    localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));
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
      
      // Sanitize Resources: ensure type and origin exist (for legacy data compatibility)
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
