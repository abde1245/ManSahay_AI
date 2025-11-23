
import React from 'react';

interface Props {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<Props> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-y-auto">
      {/* Navbar */}
      <nav className="w-full py-6 px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold text-slate-800">Mansahay</span>
        </div>
        <div className="space-x-4">
          <button onClick={onLoginClick} className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Log In</button>
          <button onClick={onLoginClick} className="bg-teal-600 text-white px-5 py-2 rounded-full font-medium hover:bg-teal-700 transition-all shadow-lg shadow-teal-200">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-8 pt-10 pb-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6 md:pr-10">
          <div className="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold mb-2">
            AI-Powered Mental Health
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Your Safe Space,<br />
            <span className="text-teal-600">Available 24/7.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Experience a new era of mental wellness. Mansahay combines empathetic AI support, real-time crisis intervention, and seamless professional interfacing to ensure no one walks alone.
          </p>
          <div className="flex space-x-4 pt-4">
             <button onClick={onLoginClick} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-xl flex items-center">
                Start Talking Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
             </button>
          </div>
          <p className="text-sm text-slate-400">Private & Secure • No Credit Card Required</p>
        </div>

        <div className="md:w-1/2 mt-12 md:mt-0 relative">
           <div className="absolute inset-0 bg-teal-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
           <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-slate-100">
              {/* Mock Chat UI */}
              <div className="space-y-4">
                  <div className="flex items-start">
                     <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 mr-3"></div>
                     <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-slate-600 text-sm max-w-xs">
                        I've been feeling really anxious lately about my future.
                     </div>
                  </div>
                  <div className="flex items-start justify-end">
                     <div className="bg-teal-600 text-white p-3 rounded-2xl rounded-br-none text-sm max-w-xs">
                        I hear you. It's completely normal to feel that way. Let's try a quick grounding exercise together?
                     </div>
                     <div className="w-8 h-8 bg-teal-100 rounded-full flex-shrink-0 ml-3 flex items-center justify-center text-teal-700 font-bold text-xs">M</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">5-4-3-2-1 Grounding</span>
                      <button className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">Start</button>
                  </div>
              </div>
           </div>
        </div>
      </main>

      {/* Features Strip */}
      <div className="bg-slate-50 py-16">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-6">
                 <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <h3 className="font-bold text-lg mb-2">Always On</h3>
                 <p className="text-slate-600">Support whenever you need it, day or night. No waiting lists, no appointments necessary for initial help.</p>
             </div>
             <div className="p-6">
                 <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                 </div>
                 <h3 className="font-bold text-lg mb-2">Crisis Detection</h3>
                 <p className="text-slate-600">Advanced algorithms detect distress signals in real-time to trigger safety protocols when it matters most.</p>
             </div>
             <div className="p-6">
                 <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                 </div>
                 <h3 className="font-bold text-lg mb-2">Professional Connection</h3>
                 <p className="text-slate-600">Seamlessly find and book appointments with human professionals based on the AI's preliminary assessment.</p>
             </div>
         </div>
      </div>
    </div>
  );
};
