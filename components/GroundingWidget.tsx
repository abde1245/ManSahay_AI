
import React, { useState, useEffect } from 'react';

const SENSES = [
  { 
    id: 'sight',
    count: 5, 
    label: "Sight", 
    instruction: "Find 5 things you can see.",
    detail: "Look for shadows, light, colors, or small details.",
    color: "from-rose-400 to-orange-400",
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    id: 'touch',
    count: 4, 
    label: "Touch", 
    instruction: "Find 4 things you can feel.",
    detail: "The weight of your body, fabric texture, the air temperature.",
    color: "from-amber-400 to-yellow-400",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" clipRule="evenodd" />
        <path d="M15 12a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    id: 'sound',
    count: 3, 
    label: "Sound", 
    instruction: "Find 3 things you can hear.",
    detail: "Traffic, wind, humming appliances, your own breath.",
    color: "from-emerald-400 to-teal-400",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    id: 'smell',
    count: 2, 
    label: "Smell", 
    instruction: "Find 2 things you can smell.",
    detail: "Soap, coffee, fresh air. Or recall a favorite scent.",
    color: "from-sky-400 to-blue-400",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
         <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    id: 'taste',
    count: 1, 
    label: "Taste", 
    instruction: "Find 1 thing you can taste.",
    detail: "Toothpaste, coffee? Or say one good thing about yourself.",
    color: "from-indigo-400 to-violet-400",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    )
  },
];

export const GroundingWidget: React.FC = () => {
  const [step, setStep] = useState(-1); // -1 = intro, 5 = complete
  const [itemsFound, setItemsFound] = useState(0);
  const [animate, setAnimate] = useState(false);

  const handleStart = () => {
    setStep(0);
    setItemsFound(0);
  };

  const handleItemClick = (idx: number) => {
    if (idx <= itemsFound) {
      // Vibrate on mobile for tactile feedback
      if (navigator.vibrate) navigator.vibrate(50);
      
      const newCount = itemsFound + 1;
      setItemsFound(newCount);
      
      // Trigger ripple animation logic here if complex, otherwise CSS
    }
  };

  const nextStep = () => {
    setAnimate(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setItemsFound(0);
      setAnimate(false);
    }, 300);
  };

  // Completion View
  if (step >= SENSES.length) {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-2xl border border-teal-100 shadow-sm my-4 animate-fade-in text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce">
           <span className="text-4xl">🌟</span>
        </div>
        <h3 className="text-teal-900 font-bold text-2xl mb-2">You are here.</h3>
        <p className="text-teal-700 max-w-xs mx-auto leading-relaxed">
           You've grounded your senses. Take one final deep breath and carry this calm with you.
        </p>
        <button 
           onClick={() => setStep(-1)}
           className="mt-8 px-6 py-2 bg-white border border-teal-200 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-50 transition-colors"
        >
           Restart Exercise
        </button>
      </div>
    );
  }

  // Intro View
  if (step === -1) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md my-4 text-center min-h-[250px] flex flex-col items-center justify-center group hover:border-teal-200 transition-colors">
        <div className="mb-4 p-3 bg-slate-50 rounded-full group-hover:bg-teal-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 group-hover:text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
        </div>
        <h3 className="font-bold text-xl text-slate-800 mb-1">5-4-3-2-1 Grounding</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
            A proven technique to manage anxiety by anchoring yourself in the present moment.
        </p>
        <button 
            onClick={handleStart}
            className="w-full max-w-xs bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
        >
            Begin Exercise
        </button>
      </div>
    );
  }

  const currentSense = SENSES[step];
  const isStepComplete = itemsFound >= currentSense.count;

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-lg my-4 transition-colors duration-500 ${currentSense.bg} ${currentSense.border}`}>
       
       {/* Progress Bar */}
       <div className="flex space-x-1 p-1">
          {SENSES.map((s, i) => (
              <div 
                key={s.id} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? `bg-gradient-to-r ${s.color}` : 'bg-black/5'}`}
              ></div>
          ))}
       </div>

       <div className={`p-6 flex flex-col items-center min-h-[320px] transition-opacity duration-300 ${animate ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          
          {/* Header */}
          <div className={`p-3 rounded-full bg-white shadow-sm mb-4 ${currentSense.text}`}>
             {currentSense.icon}
          </div>
          
          <h3 className={`text-2xl font-black mb-1 ${currentSense.text} transition-colors`}>
              {currentSense.label}
          </h3>
          
          <p className="text-slate-700 font-medium text-lg text-center mb-1">
             {currentSense.instruction}
          </p>
          <p className="text-slate-500 text-xs text-center mb-8 max-w-xs">
             {currentSense.detail}
          </p>

          {/* Interaction Grid */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-[280px]">
             {Array.from({ length: currentSense.count }).map((_, idx) => {
                 const isChecked = idx < itemsFound;
                 return (
                    <button
                        key={idx}
                        onClick={() => handleItemClick(idx)}
                        disabled={isChecked}
                        className={`
                            w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-300
                            ${isChecked 
                                ? `bg-gradient-to-br ${currentSense.color} border-transparent text-white shadow-md scale-100 rotate-0` 
                                : `bg-white/50 border-black/10 text-black/20 hover:bg-white hover:scale-110 scale-95`
                            }
                            ${idx === itemsFound && !isStepComplete ? 'animate-pulse ring-4 ring-white/50' : ''}
                        `}
                    >
                        {isChecked && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-fade-in" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                 );
             })}
          </div>

          {/* Next Button */}
          <div className="mt-auto w-full px-4">
             <button
                onClick={nextStep}
                disabled={!isStepComplete}
                className={`
                    w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2
                    ${isStepComplete 
                        ? `bg-slate-900 text-white shadow-lg hover:bg-teal-600 cursor-pointer transform translate-y-0 opacity-100` 
                        : 'bg-black/5 text-black/20 cursor-not-allowed transform translate-y-2 opacity-50'
                    }
                `}
             >
                <span>{step === SENSES.length - 1 ? "Finish" : "Next Sense"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
             </button>
          </div>

       </div>
    </div>
  );
};
