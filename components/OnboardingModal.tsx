import React, { useState } from 'react';
import { User, EmergencyContact } from '../types';

interface Props {
  isOpen: boolean;
  user: User;
  onComplete: (updatedUser: User) => void;
}

const GOALS = [
  "Reduce Anxiety",
  "Improve Sleep",
  "Manage Depression",
  "Process Grief",
  "Build Self-Esteem",
  "Just Venting"
];

const TONES = [
  { id: 'empathetic', label: 'Empathetic & Gentle', desc: 'Soft, validating, and supportive.' },
  { id: 'direct', label: 'Direct & Solution-Oriented', desc: 'Practical advice and action plans.' },
  { id: 'warm', label: 'Warm & Friendly', desc: 'Like a caring friend.' },
  { id: 'professional', label: 'Professional & Clinical', desc: 'Objective and informative.' },
];

export const OnboardingModal: React.FC<Props> = ({ isOpen, user, onComplete }) => {
  // We now have 4 steps instead of 3
  const [step, setStep] = useState(1);
  
  // Form State
  const [preferredName, setPreferredName] = useState(user.name);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<'empathetic' | 'direct' | 'professional' | 'warm'>('empathetic');
  
  // Emergency Contact State
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  if (!isOpen) return null;

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(prev => prev.filter(g => g !== goal));
    } else {
      if (selectedGoals.length < 3) {
        setSelectedGoals(prev => [...prev, goal]);
      }
    }
  };

  const addContact = () => {
    if (newContactName && newContactPhone) {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: newContactName,
        relation: newContactRelation || 'Friend',
        phone: newContactPhone
      };
      setContacts([...contacts, newContact]);
      setNewContactName('');
      setNewContactRelation('');
      setNewContactPhone('');
    }
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    const updatedUser: User = {
      ...user,
      name: preferredName,
      goals: selectedGoals,
      preferences: { aiTone: selectedTone },
      emergencyContacts: contacts // Save contacts to profile
    };
    onComplete(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[550px]">
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2">
          <div 
            className="bg-teal-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <div className="flex-1 p-8 flex flex-col">
          
          {/* Step 1: Introduction & Name */}
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                👋
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Mansahay</h2>
              <p className="text-slate-500 mb-8">
                I'm your personal AI companion. To help me support you better, I'd like to get to know you a little.
              </p>
              
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What should I call you?</label>
                <input 
                  type="text" 
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="w-full text-lg p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 font-medium"
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What brings you here?</h2>
              <p className="text-slate-500 mb-6 text-sm">Select up to 3 areas you'd like to focus on.</p>
              
              <div className="grid grid-cols-1 gap-3">
                {GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-xl text-left border transition-all flex justify-between items-center ${
                      selectedGoals.includes(goal) 
                        ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500' 
                        : 'border-slate-200 hover:border-teal-300 text-slate-600'
                    }`}
                  >
                    <span className="font-medium">{goal}</span>
                    {selectedGoals.includes(goal) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Tone Preference */}
          {step === 3 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How should I speak?</h2>
              <p className="text-slate-500 mb-6 text-sm">Choose the personality that fits you best.</p>
              
              <div className="space-y-3">
                {TONES.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id as any)}
                    className={`p-4 rounded-xl text-left border transition-all w-full ${
                      selectedTone === tone.id 
                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' 
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="font-bold text-slate-800">{tone.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contacts (NEW) */}
          {step === 4 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                 <h2 className="text-2xl font-bold text-slate-800">Safety Network</h2>
                 <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Important</span>
              </div>
              <p className="text-slate-500 mb-6 text-sm">Who should we notify if a high-risk crisis is detected? This is optional but recommended.</p>
              
              {/* List Added Contacts */}
              <div className="space-y-2 mb-4 max-h-[120px] overflow-y-auto pr-1">
                 {contacts.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                       <div>
                          <p className="text-sm font-bold text-slate-700">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.relation} • {c.phone}</p>
                       </div>
                       <button onClick={() => removeContact(c.id)} className="text-red-400 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                       </button>
                    </div>
                 ))}
              </div>

              {/* Add Contact Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <input 
                      placeholder="Name" 
                      value={newContactName}
                      onChange={e => setNewContactName(e.target.value)}
                      className="p-2 text-sm rounded border border-slate-300 w-full"
                    />
                    <input 
                      placeholder="Relation (e.g. Mom)" 
                      value={newContactRelation}
                      onChange={e => setNewContactRelation(e.target.value)}
                      className="p-2 text-sm rounded border border-slate-300 w-full"
                    />
                 </div>
                 <input 
                    placeholder="Phone Number" 
                    value={newContactPhone}
                    onChange={e => setNewContactPhone(e.target.value)}
                    className="p-2 text-sm rounded border border-slate-300 w-full mb-3"
                 />
                 <button 
                    onClick={addContact}
                    disabled={!newContactName || !newContactPhone}
                    className="w-full py-2 bg-white border border-slate-300 text-slate-600 font-bold text-xs rounded hover:bg-slate-100 disabled:opacity-50 transition-colors"
                 >
                    Add to Safety Network
                 </button>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 flex justify-end items-center">
             {step > 1 && (
               <button 
                 onClick={() => setStep(step - 1)}
                 className="mr-auto text-slate-400 hover:text-slate-600 font-medium text-sm px-4 py-2"
               >
                 Back
               </button>
             )}
             
             <button 
               onClick={handleNext}
               disabled={step === 1 && !preferredName.trim()}
               className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-slate-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {step === 4 ? 'Start Journey' : 'Continue'}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};