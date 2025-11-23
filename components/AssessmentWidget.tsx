
import React, { useState } from 'react';
import { AssessmentType } from '../types';

interface Props {
  type: AssessmentType;
  onComplete?: (score: number, type: AssessmentType, answers: number[]) => void;
}

const ASSESSMENTS = {
  PHQ9: {
    title: "Depression Screening (PHQ-9)",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    button: "hover:bg-blue-100",
    questions: [
      "Little interest or pleasure in doing things?",
      "Feeling down, depressed, or hopeless?",
      "Trouble falling or staying asleep, or sleeping too much?",
      "Feeling tired or having little energy?"
    ]
  },
  GAD7: {
    title: "Anxiety Screening (GAD-7)",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    button: "hover:bg-amber-100",
    questions: [
      "Feeling nervous, anxious, or on edge?",
      "Not being able to stop or control worrying?",
      "Worrying too much about different things?",
      "Trouble relaxing?"
    ]
  },
  SLEEP: {
    title: "Sleep Quality Assessment",
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    button: "hover:bg-indigo-100",
    questions: [
      "Difficulty falling asleep?",
      "Waking up during the night?",
      "Waking up too early?",
      "Feeling exhausted upon waking?"
    ]
  }
};

export const AssessmentWidget: React.FC<Props> = ({ type, onComplete }) => {
  const config = ASSESSMENTS[type] || ASSESSMENTS.PHQ9;
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (value: number) => {
    const newScore = score + value;
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < config.questions.length - 1) {
      setScore(newScore);
      setStep(step + 1);
    } else {
      setScore(newScore);
      setIsComplete(true);
      // Trigger callback
      if (onComplete) {
         onComplete(newScore, type, newAnswers);
      }
    }
  };

  return (
    <div className={`p-5 rounded-xl border shadow-md my-4 animate-fade-in ${config.color}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold">{config.title}</h3>
          <p className="text-xs opacity-70">Clinical Self-Assessment Tool</p>
        </div>
        <span className="bg-white/50 text-xs font-semibold px-2.5 py-0.5 rounded">
          {isComplete ? 'Complete' : `Question ${step + 1}/${config.questions.length}`}
        </span>
      </div>
      
      {!isComplete ? (
        <div className="space-y-4">
          <p className="text-sm font-medium min-h-[3rem]">{config.questions[step]}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Not at all', v: 0 },
              { l: 'Several days', v: 1 },
              { l: 'More than half', v: 2 },
              { l: 'Nearly every day', v: 3 }
            ].map((opt) => (
               <button 
                 key={opt.v} 
                 onClick={() => handleAnswer(opt.v)}
                 className={`text-xs border border-black/10 rounded p-3 ${config.button} transition-colors font-medium text-left`}
               >
                 {opt.l}
               </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
           <div className="text-3xl font-bold mb-2">{score} / {config.questions.length * 3}</div>
           <p className="text-sm mb-4">Your responses have been recorded.</p>
           <div className="bg-white/60 p-3 rounded text-xs text-left">
             <strong>Analysis:</strong> Generating detailed report... Check your Wellness Vault shortly.
           </div>
        </div>
      )}
    </div>
  );
};
