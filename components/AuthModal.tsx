
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => Promise<void>;
  onSignup: (name: string, email: string) => Promise<void>;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignup) {
        await onSignup(name, email);
      } else {
        await onLogin(email);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
           <div className="text-center mb-8">
             <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
               <span className="text-white font-bold text-xl">M</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-800">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
             <p className="text-slate-500 mt-1 text-sm">
               {isSignup ? 'Start your journey to better mental health.' : 'Sign in to continue your sessions.'}
             </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             {isSignup && (
               <div>
                 <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                 <input 
                   type="text" 
                   required={isSignup}
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                   placeholder="John Doe"
                 />
               </div>
             )}
             
             <div>
               <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                 placeholder="you@example.com"
               />
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
               <input 
                 type="password" 
                 required
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                 placeholder="••••••••"
               />
             </div>

             <button 
               type="submit"
               disabled={isLoading}
               className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-100 mt-4 flex justify-center"
             >
               {isLoading ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               ) : (
                 isSignup ? 'Create Account' : 'Sign In'
               )}
             </button>
           </form>

           <div className="mt-6 text-center">
             <p className="text-sm text-slate-600">
               {isSignup ? 'Already have an account?' : "Don't have an account?"}
               <button 
                 onClick={() => setIsSignup(!isSignup)}
                 className="text-teal-600 font-bold ml-1 hover:underline"
               >
                 {isSignup ? 'Log In' : 'Sign Up'}
               </button>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
