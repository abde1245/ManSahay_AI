
import React, { useState } from 'react';
import { User } from '../types';

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
  const [step, setStep] = useState(1);
  const [preferredName, setPreferredName] = useState(user.name);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<'empathetic' | 'direct' | 'professional' | 'warm'>('empathetic');

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

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    const updatedUser: User = {
      ...user,
      name: preferredName,
      goals: selectedGoals,
      preferences: { aiTone: selectedTone }
    };
    onComplete(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2">
          <div 
            className="bg-teal-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
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
               {step === 3 ? 'Start Journey' : 'Continue'}
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
