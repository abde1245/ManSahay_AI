import React, { useState } from 'react';
import { SignIn, SignUp } from "@clerk/clerk-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // These props are required by Typescript but handled internally by Clerk
  onLogin: (email: string) => Promise<void>;
  onSignup: (name: string, email: string) => Promise<void>;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-slate-200 transition-colors z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Clerk Authentication Components */}
          {view === 'sign-in' ? (
            <SignIn 
              appearance={{
                variables: { colorPrimary: '#0d9488' },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none w-full p-8",
                  headerTitle: "text-teal-800 text-xl font-bold",
                  headerSubtitle: "text-slate-500 text-sm",
                  formButtonPrimary: "bg-teal-600 hover:bg-teal-700 text-sm normal-case",
                  // Hiding standard footer to use custom toggle below
                  footerAction: "hidden" 
                }
              }}
            />
          ) : (
            <SignUp 
              appearance={{
                variables: { colorPrimary: '#0d9488' },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none w-full p-8",
                  headerTitle: "text-teal-800 text-xl font-bold",
                  headerSubtitle: "text-slate-500 text-sm",
                  formButtonPrimary: "bg-teal-600 hover:bg-teal-700 text-sm normal-case",
                  // Hiding standard footer to use custom toggle below
                  footerAction: "hidden"
                }
              }}
            />
          )}
          
          {/* Custom Toggle Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-600">
            {view === 'sign-in' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setView(view === 'sign-in' ? 'sign-up' : 'sign-in')}
              className="ml-2 text-teal-600 font-bold hover:underline"
            >
              {view === 'sign-in' ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};