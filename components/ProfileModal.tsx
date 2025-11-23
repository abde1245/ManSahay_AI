import React, { useState, useRef, useEffect } from 'react';
import { User, EmergencyContact } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
}

const TONE_OPTIONS = [
    { id: 'empathetic', label: 'Empathetic & Gentle', desc: 'Soft, validating, and highly supportive.' },
    { id: 'warm', label: 'Warm & Friendly', desc: 'Casual and conversational, like a friend.' },
    { id: 'professional', label: 'Professional & Clinical', desc: 'Objective, factual, and structured.' },
    { id: 'direct', label: 'Direct & Solution-Oriented', desc: 'Action-oriented and concise.' },
];

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdateUser }) => {
  // State
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [dob, setDob] = useState(user.dateOfBirth || '');
  const [medicalHistory, setMedicalHistory] = useState(user.medicalHistory || '');
  
  // User Preferences & Goals
  const [goals, setGoals] = useState<string[]>(user.goals || []);
  const [newGoal, setNewGoal] = useState('');
  const [triggers, setTriggers] = useState<string[]>(user.triggers || []);
  const [newTrigger, setNewTrigger] = useState('');
  
  // Fix: Ensure we safely access the nested preference, defaulting if missing
  const [aiTone, setAiTone] = useState<'empathetic' | 'direct' | 'professional' | 'warm'>(
    user.preferences?.aiTone || 'empathetic'
  );
  
  const [showToneDropdown, setShowToneDropdown] = useState(false);

  // Emergency Contact Form State
  const [contacts, setContacts] = useState<EmergencyContact[]>(user.emergencyContacts || []);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- CRITICAL FIX: Sync State when User Prop Updates or Modal Opens ---
  useEffect(() => {
    if (isOpen && user) {
        setName(user.name);
        setPhone(user.phone || '');
        setDob(user.dateOfBirth || '');
        setMedicalHistory(user.medicalHistory || '');
        setGoals(user.goals || []);
        setTriggers(user.triggers || []);
        setContacts(user.emergencyContacts || []);
        setAiTone(user.preferences?.aiTone || 'empathetic');
    }
  }, [isOpen, user]);
  // --------------------------------------------------------------------

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowToneDropdown(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const updatedUser: User = {
        ...user,
        name,
        phone,
        dateOfBirth: dob,
        medicalHistory,
        emergencyContacts: contacts,
        goals: goals,
        triggers: triggers,
        preferences: { aiTone }
    };
    onUpdateUser(updatedUser);
    onClose();
  };

  const handleAddContact = () => {
      if (newContactName && newContactPhone) {
          const newContact: EmergencyContact = {
              id: Date.now().toString(),
              name: newContactName,
              relation: newContactRelation || 'Friend/Family',
              phone: newContactPhone
          };
          setContacts([...contacts, newContact]);
          setNewContactName('');
          setNewContactRelation('');
          setNewContactPhone('');
          setIsAddingContact(false);
      }
  };

  const handleDeleteContact = (id: string) => {
      setContacts(contacts.filter(c => c.id !== id));
  };

  const addGoal = () => {
      if(newGoal.trim() && !goals.includes(newGoal.trim())) {
          setGoals([...goals, newGoal.trim()]);
          setNewGoal('');
      }
  };

  const removeGoal = (g: string) => setGoals(goals.filter(x => x !== g));

  const addTrigger = () => {
      if(newTrigger.trim() && !triggers.includes(newTrigger.trim())) {
          setTriggers([...triggers, newTrigger.trim()]);
          setNewTrigger('');
      }
  };

  const removeTrigger = (t: string) => setTriggers(triggers.filter(x => x !== t));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold text-lg text-white">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold">My Profile</h2>
                    <p className="text-slate-400 text-xs">Personalize your mental health journey</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
            
            {/* Personal Details */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            value={user.email}
                            disabled
                            className="w-full border border-slate-200 bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input 
                            type="date" 
                            value={dob}
                            onChange={e => setDob(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Therapeutic Goals */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Therapeutic Goals</h3>
                <p className="text-xs text-slate-400 mb-4">What are you hoping to achieve? The AI will focus on these.</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {goals.length === 0 && (
                        <span className="text-xs text-slate-300 italic py-1">No goals added yet.</span>
                    )}
                    {goals.map(g => (
                        <span key={g} className="bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center group transition-colors hover:bg-teal-100">
                            {g}
                            <button onClick={() => removeGoal(g)} className="ml-1.5 text-teal-400 hover:text-teal-700 rounded-full p-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
                
                <div className="flex relative">
                    <input 
                        type="text" 
                        value={newGoal}
                        onChange={e => setNewGoal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addGoal()}
                        placeholder="e.g. Manage social anxiety"
                        className="w-full border border-slate-300 rounded-lg pl-3 pr-16 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                    <button 
                        onClick={addGoal} 
                        disabled={!newGoal.trim()}
                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-teal-100 text-teal-700 px-4 rounded-md text-xs font-bold hover:bg-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Add
                    </button>
                </div>
            </section>

            {/* Triggers & Preferences */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Triggers */}
                    <div className="flex flex-col">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-1">Safety & Triggers</h3>
                            <p className="text-xs text-slate-400 mb-4">Topics the AI should avoid or handle carefully.</p>
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
                                {triggers.length === 0 && (
                                    <span className="text-xs text-slate-300 italic py-1">No triggers added.</span>
                                )}
                                {triggers.map(t => (
                                    <span key={t} className="bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-1 rounded-md text-xs font-medium flex items-center group transition-colors hover:bg-rose-100 hover:border-rose-200">
                                        {t}
                                        <button onClick={() => removeTrigger(t)} className="ml-1.5 text-rose-400 hover:text-rose-700 transition-colors rounded-full p-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex relative mt-auto">
                            <input 
                                type="text" 
                                value={newTrigger}
                                onChange={e => setNewTrigger(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTrigger()}
                                placeholder="e.g. Spiders"
                                className="w-full border border-slate-300 rounded-lg pl-3 pr-16 py-2.5 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder-slate-400"
                            />
                            <button 
                                onClick={addTrigger} 
                                disabled={!newTrigger.trim()}
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-rose-100 text-rose-700 px-4 rounded-md text-xs font-bold hover:bg-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Preferences - Custom Dropdown */}
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-1">Preferences</h3>
                            <p className="text-xs text-slate-400">Customize how Mansahay interacts with you.</p>
                        </div>
                        
                        <div className="mt-auto">
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">AI Personality Tone</label>
                            
                            <div className="relative" ref={dropdownRef}>
                                {/* Trigger */}
                                <button 
                                    onClick={() => setShowToneDropdown(!showToneDropdown)}
                                    className={`w-full flex justify-between items-center border rounded-xl px-4 py-3 text-sm text-left transition-all outline-none bg-white ${showToneDropdown ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-300 hover:border-slate-400'}`}
                                >
                                    <span className="text-slate-700 font-medium">
                                        {TONE_OPTIONS.find(t => t.id === aiTone)?.label || 'Select Tone'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showToneDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {showToneDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                                        {TONE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setAiTone(option.id as any);
                                                    setShowToneDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm transition-colors flex flex-col ${aiTone === option.id ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                                            >
                                                <span className={`font-bold ${aiTone === option.id ? 'text-teal-700' : 'text-slate-700'}`}>
                                                    {option.label}
                                                </span>
                                                <span className="text-xs text-slate-400 mt-0.5 font-normal">
                                                    {option.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Emergency Contacts */}
            <section className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 rounded text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-red-800">Emergency Contacts</h3>
                            <p className="text-[10px] text-red-600">Used by the AI during crisis protocols.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddingContact(true)}
                        disabled={isAddingContact}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        + Add Contact
                    </button>
                </div>

                <div className="space-y-3">
                    {contacts.length === 0 && !isAddingContact && (
                        <p className="text-xs text-slate-400 italic text-center py-4">No emergency contacts added yet. Please add at least one.</p>
                    )}

                    {contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="font-bold text-sm text-slate-700">{contact.name} <span className="text-xs font-normal text-slate-500">({contact.relation})</span></p>
                                <p className="text-xs text-slate-500">{contact.phone}</p>
                            </div>
                            <button onClick={() => handleDeleteContact(contact.id)} className="text-slate-400 hover:text-red-500 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}

                    {isAddingContact && (
                        <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Name" 
                                    value={newContactName}
                                    onChange={e => setNewContactName(e.target.value)}
                                    className="text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-red-300"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Relation (e.g. Mom)" 
                                    value={newContactRelation}
                                    onChange={e => setNewContactRelation(e.target.value)}
                                    className="text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-red-300"
                                />
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    value={newContactPhone}
                                    onChange={e => setNewContactPhone(e.target.value)}
                                    className="text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-red-300"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAddingContact(false)} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1">Cancel</button>
                                <button onClick={handleAddContact} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Save Contact</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Medical Context */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Medical Context</h3>
                <p className="text-xs text-slate-400 mb-3">Optional. Share relevant diagnoses or medications to help the AI provide better context.</p>
                <textarea 
                    value={medicalHistory}
                    onChange={e => setMedicalHistory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none min-h-[80px]"
                    placeholder="E.g., Diagnosed with GAD in 2022, currently taking..."
                />
            </section>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSaveProfile} className="px-6 py-2 bg-teal-600 text-white font-bold text-sm rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Save Changes</button>
        </div>

      </div>
    </div>
  );
};