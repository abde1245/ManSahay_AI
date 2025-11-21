
import { GoogleGenAI, FunctionDeclaration, Type, Tool, Chat, Part } from "@google/genai";
import { MOCK_DOCTORS } from '../data/mockData';
import { MUSIC_LIBRARY } from '../data/musicLibrary';
import { ChatContext, WebSource } from '../types';

// Safely retrieve API key to avoid ReferenceErrors in browser environments
const getApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error reading API_KEY from environment:", e);
  }
  return '';
};

const API_KEY = getApiKey();

// --- Tool Definitions ---

const triggerEmergencyProtocolTool: FunctionDeclaration = {
  name: 'triggerEmergencyProtocol',
  description: 'Activates the emergency response system. Use IMMEDIATELY if the user mentions suicide, self-harm, or harming others.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      riskLevel: { type: Type.STRING, description: 'Must be HIGH_RISK' },
      reason: { type: Type.STRING, description: 'Specific quotes or reasons for triggering the protocol.' }
    },
    required: ['riskLevel', 'reason']
  }
};

const updateRealtimeAnalysisTool: FunctionDeclaration = {
  name: 'updateRealtimeAnalysis',
  description: 'Updates the dashboard with the user\'s current mental state. Call this whenever the user\'s mood or risk level shifts, even slightly.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      level: { 
        type: Type.STRING, 
        enum: ['STABLE', 'ELEVATED', 'DISTRESS', 'HIGH_RISK'],
        description: 'Current risk/stress classification.'
      },
      sentiment: { type: Type.STRING, description: 'One or two words describing mood (e.g. "Anxious", "Hopeful", "Angry").' },
      reason: { type: Type.STRING, description: 'Brief clinical note explaining why this level was chosen (max 1 sentence).' }
    },
    required: ['level', 'sentiment', 'reason']
  }
};

const suggestCopingActivityTool: FunctionDeclaration = {
  name: 'suggestCopingActivity',
  description: 'Suggests a specific interactive coping activity widget. Use "art" for creative expression/distraction. Use "grounding" for panic. Use "journaling" for processing. Use "breathing" for stress.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ['breathing', 'journaling', 'grounding', 'art'], description: 'The type of activity to launch.' },
      focus: { type: Type.STRING, description: 'Goal or prompt for the activity (e.g. "Draw your safety place" or "List 3 gratitudes").' }
    },
    required: ['type', 'focus']
  }
};

const findProfessionalTool: FunctionDeclaration = {
  name: 'findProfessional',
  description: 'Searches for available doctors based on specialty and/or time preference. RETURNS a list of available doctors to the model.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      specialty: { type: Type.STRING, description: 'Required specialty (e.g., Psychiatrist, Therapist).' },
      timePreference: { type: Type.STRING, description: 'Optional preference (e.g., "Today", "Tomorrow", "Morning").' }
    },
    required: ['specialty']
  }
};

const bookAppointmentTool: FunctionDeclaration = {
  name: 'bookAppointment',
  description: 'Books an appointment with a specific doctor. ONLY use this if the user has confirmed a time and doctor.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      doctorName: { type: Type.STRING, description: 'Name of the doctor (e.g. Dr. Sarah Jenkins)' },
      time: { type: Type.STRING, description: 'The confirmed time/date (e.g. "Tomorrow at 10am" or ISO string)' },
      reason: { type: Type.STRING, description: 'Reason for visit' }
    },
    required: ['doctorName', 'time']
  }
};

const startAssessmentTool: FunctionDeclaration = {
  name: 'startAssessment',
  description: 'Initiates a clinical self-assessment questionnaire.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      assessmentType: { 
        type: Type.STRING, 
        enum: ['PHQ9', 'GAD7', 'SLEEP'], 
        description: 'PHQ9 for Depression, GAD7 for Anxiety, SLEEP for Insomnia/Sleep issues.' 
      }
    },
    required: ['assessmentType']
  }
};

const queryMusicLibraryTool: FunctionDeclaration = {
  name: 'queryMusicLibrary',
  description: 'Searches the music library for available tracks. Use this to find music options before playing or to list tracks for the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Search keywords (title, tag, or mood).' },
      filter: { type: Type.STRING, enum: ['All', 'Nature', 'Ambience', 'Weather', 'Animals'], description: 'Category filter.' }
    }
  }
};

const controlMusicPlayerTool: FunctionDeclaration = {
  name: 'controlMusicPlayer',
  description: 'Controls the ambient background music player. You can Search by MOOD (sad, anxious, calm) or select a SPECIFIC TRACK title.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { 
        type: Type.STRING, 
        enum: ['PLAY', 'PAUSE', 'CHANGE_TRACK'], 
        description: 'The action to perform.' 
      },
      searchQuery: {
        type: Type.STRING,
        description: 'Keywords matching the user\'s mood OR the EXACT TITLE of a track. Required if action is CHANGE_TRACK.'
      }
    },
    required: ['action']
  }
};

const saveResourceTool: FunctionDeclaration = {
  name: 'saveResource',
  description: 'Saves a clinical report, journal entry, or analysis to the user\'s Wellness Vault for future reference.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the document (e.g. "Depression Assessment Report").' },
      content: { type: Type.STRING, description: 'The full text content to save.' },
      type: { type: Type.STRING, enum: ['report', 'journal', 'file'], description: 'Type of resource.' }
    },
    required: ['title', 'content', 'type']
  }
};

const readResourceTool: FunctionDeclaration = {
  name: 'readResource',
  description: 'Retrieves the FULL content of a file/resource from the Wellness Vault by ID. Use this if the user asks questions about their uploaded files or past reports.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      resourceId: { type: Type.STRING, description: 'The ID of the resource to read.' }
    },
    required: ['resourceId']
  }
};

const functionDeclarations: FunctionDeclaration[] = [
  triggerEmergencyProtocolTool,
  updateRealtimeAnalysisTool,
  suggestCopingActivityTool,
  findProfessionalTool,
  bookAppointmentTool,
  startAssessmentTool,
  queryMusicLibraryTool,
  controlMusicPlayerTool,
  saveResourceTool,
  readResourceTool
];

interface ServiceResponse {
  text: string;
  sources?: WebSource[];
}

// --- Service Class ---

class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
    
    this.chat = this.ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are Mansahay, an advanced mental health AI assistant.
        
        CORE RESPONSIBILITIES:
        1. **Real-time Analysis**: You must constantly evaluate the user's mental state. If their mood shifts, you MUST use the 'updateRealtimeAnalysis' tool.
        2. **Safety First**: If suicide/self-harm is implied, use 'triggerEmergencyProtocol'.
        3. **Booking & Professionals**:
           - When a user needs a doctor, use 'findProfessional' to search.
           - READ the results returned by 'findProfessional'. It will contain a list of REAL doctors and their REAL available slots.
           - Present these specific options to the user. 
           - Only use 'bookAppointment' once the user explicitly selects a doctor and a time slot from the available options.
        4. **Environment Control & Music Therapy**: 
           - You have complete control over the Music Player.
           - You DO NOT have the list of all tracks in your memory. You MUST use 'queryMusicLibrary' to find available music or list options for the user.
           - If the user asks "What music do you have?", call 'queryMusicLibrary'.
           - Use 'controlMusicPlayer' to actually play the music.
           - **IMPORTANT**: You MUST Explain WHY you are changing the music in your response.
        5. **Wellness Vault (Contextual RAG)**:
           - You have access to a list of files in the 'Wellness Vault' in the system context.
           - If the user refers to a file (e.g., "What did my last report say?" or "Analyze the PDF I just uploaded"), you MUST use the 'readResource' tool with the correct ID.
           - After completing an assessment (PHQ9/GAD7), generate a detailed clinical analysis and use 'saveResource' to store it.
        6. **Tools**:
           - Use 'startAssessment' for clinical screening.
           - Use 'suggestCopingActivity' for stress. If the user struggles to express themselves with words, suggest 'art' (Art Therapy).
        
        CONTEXT AWARENESS:
        - You will be provided with the user's Local Time and Location (if available).

        TONE & FORMAT:
        - Empathetic, professional, calm, and concise.
        - Use Markdown formatting.
        
        RISK LEVELS:
        - STABLE: Casual conversation.
        - ELEVATED: Worry, mild stress.
        - DISTRESS: Panic, hopelessness.
        - HIGH_RISK: Self-harm, suicide.`,
        temperature: 0.6,
        maxOutputTokens: 800,
        tools: [{ functionDeclarations }]
      }
    });
  }

  async sendMessage(
    message: string, 
    onToolCall: (toolName: string, args: any) => void,
    context?: ChatContext,
    useWebSearch: boolean = false
  ): Promise<ServiceResponse> {
    if (!API_KEY) {
      console.error("API_KEY is missing.");
      return { text: "Configuration Error: API Key is missing. Please check your environment variables." };
    }

    try {
      // Inject Context if provided
      let messageToSend = message;
      if (context) {
        const aptList = context.appointments.length > 0 
          ? context.appointments.map(a => `${a.doctorName} (${a.date})`).join(', ')
          : 'None';
        
        // SAFE ACCESS: Ensure r.type and r.origin exist before calling toUpperCase()
        const resourceList = context.resources.length > 0
          ? context.resources.map(r => `- [${(r.type || 'file').toUpperCase()}] [${(r.origin || 'user').toUpperCase()}] ${r.title} (ID: ${r.id})`).join('\n')
          : 'Vault is empty.';
        
        const playingTrack = context.currentMusicTrack 
            ? `${context.currentMusicTrack.title} (${context.currentMusicTrack.category})` 
            : 'None';

        const contextBlock = `[SYSTEM_CONTEXT]
Current Mood: ${context.mood}
Local Time: ${context.localTime || 'Unknown'}
User Location: ${context.location || 'Unknown'}
Currently Playing Music: ${playingTrack}
Existing Appointments: ${aptList}

[WELLNESS VAULT INDEX]
${resourceList}
[/SYSTEM_CONTEXT]`;

        if (useWebSearch) {
            messageToSend = `${contextBlock}
            
[WEB SEARCH MODE ENABLED]
You are currently in Web Search Mode.
- Your 'Function Tools' (like saving resources, booking appointments, controlling music) are TEMPORARILY DISABLED.
- Please focus ONLY on answering the user's query using Google Search results.
- Do not attempt to call tools in this turn.

User Query: ${message}`;
        } else {
            messageToSend = `${contextBlock}\n\nUser Message: ${message}`;
        }
      }

      const requestTools: Tool[] = [];
      
      if (useWebSearch) {
          requestTools.push({ googleSearch: {} });
      } else {
          requestTools.push({ functionDeclarations });
      }

      let response = await this.chat.sendMessage({ 
          message: messageToSend,
          config: {
              tools: requestTools
          }
      });
      
      let calls = response.functionCalls;
      
      while (calls && calls.length > 0) {
        const functionResponses: Part[] = [];
        
        for (const call of calls) {
            onToolCall(call.name, call.args);
            
            let result: any = { status: "success", note: "Action processed" };

            if (call.name === 'findProfessional') {
              const { specialty, timePreference } = call.args as any;
              let matches = MOCK_DOCTORS.filter(d => 
                d.specialty.toLowerCase().includes((specialty || '').toLowerCase())
              );
              if (timePreference) {
                matches = matches.filter(d => 
                  d.slots.some(s => s.toLowerCase().includes(timePreference.toLowerCase()))
                );
              }
              const readableResults = matches.map(d => ({
                name: d.name,
                specialty: d.specialty,
                location: d.location,
                availableSlots: d.slots,
                price: d.price
              }));
              result = readableResults.length > 0 
                  ? { count: readableResults.length, doctors: readableResults, note: "Present these options to the user." }
                  : { count: 0, note: "No doctors found matching criteria." };
            }
            else if (call.name === 'readResource') {
              const { resourceId } = call.args as any;
              const found = context?.resources.find(r => r.id === resourceId);
              if (found) {
                result = {
                    title: found.title,
                    type: found.type || 'file',
                    content: found.type === 'image' ? "Image data retrieved." : found.content,
                    date: found.date.toISOString()
                };
              } else {
                result = { error: "Resource not found in vault." };
              }
            }
            else if (call.name === 'queryMusicLibrary') {
                const { query, filter } = call.args as any;
                let tracks = MUSIC_LIBRARY;
                
                if (filter && filter !== 'All') {
                    tracks = tracks.filter(t => t.category === filter);
                }
                
                if (query) {
                    const q = query.toLowerCase();
                    tracks = tracks.filter(t => 
                        t.title.toLowerCase().includes(q) || 
                        t.tags.some(tag => tag.includes(q)) ||
                        t.category.toLowerCase().includes(q)
                    );
                }
                
                // Return simplified list to save tokens
                result = tracks.map(t => ({
                    title: t.title,
                    category: t.category,
                    tags: t.tags
                }));
                
                if (result.length === 0) {
                    result = { count: 0, note: "No tracks found matching your criteria." };
                }
            }

            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { result },
                id: call.id
              }
            });
        }

        response = await this.chat.sendMessage({ 
            message: functionResponses,
            config: {
                tools: requestTools
            }
        });
        calls = response.functionCalls;
      }

      // --- Extract Grounding Metadata (Sources) ---
      let sources: WebSource[] = [];
      const candidates = (response as any).candidates;
      if (candidates && candidates[0] && candidates[0].groundingMetadata) {
          const metadata = candidates[0].groundingMetadata;
          if (metadata.groundingChunks) {
              metadata.groundingChunks.forEach((chunk: any) => {
                  if (chunk.web && chunk.web.uri && chunk.web.title) {
                      sources.push({
                          title: chunk.web.title,
                          uri: chunk.web.uri
                      });
                  }
              });
          }
      }

      sources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

      return {
          text: response.text || "",
          sources: sources.length > 0 ? sources : undefined
      };

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMessage = error.message || error.toString();
      return { text: `Connection Error: ${errorMessage}` };
    }
  }

  async generateChatTitle(firstMessage: string): Promise<string> {
    if (!API_KEY) return "New Chat";
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following user message into a very short title (max 4 words) for a chat history list. Do not use quotes. Message: "${firstMessage}"`,
      });
      return response.text?.trim() || "New Conversation";
    } catch (e) {
      return "New Conversation";
    }
  }

  async analyzeImage(base64Image: string): Promise<string> {
    if (!API_KEY) return "I'm unable to analyze this image right now.";
    try {
      // Strip data prefix if present
      const cleanBase64 = base64Image.split(',')[1] || base64Image;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash is fast and has vision capabilities
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: cleanBase64
              }
            },
            {
              text: "You are an empathetic Art Therapist. Analyze this drawing provided by the user. Focus on the choice of colors, the strokes (are they chaotic or calm?), and the overall structure. Provide a brief, warm, and supportive interpretation of what feelings this art might represent. Do not be critical. End with a gentle, encouraging question. Max 100 words."
            }
          ]
        }
      });
      return response.text || "I see your beautiful artwork. It speaks volumes.";
    } catch (e) {
      console.error("Vision analysis error", e);
      return "I tried to look at your art, but I'm having trouble connecting to my vision center right now.";
    }
  }
}

export const geminiService = new GeminiService();
