
import React from 'react';
import { EmergencyContact } from '../types';

interface Props {
  onClose: () => void;
  reason: string;
  contacts?: EmergencyContact[];
}

export const EmergencyOverlay: React.FC<Props> = ({ onClose, reason, contacts = [] }) => {
  return (
    <div className="fixed inset-0 z-50 bg-red-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-red-600 p-6 text-white text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-wider">Emergency Protocol Activated</h2>
          <p className="text-red-100 mt-2 text-sm">Reason detected: {reason}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-slate-700 text-center">
            We have detected a potential crisis. Help is being contacted.
          </p>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
             {contacts.length > 0 ? (
                 contacts.map(contact => (
                     <div key={contact.id} className="bg-slate-100 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                        <div>
                            <p className="font-semibold text-slate-800">{contact.name} <span className="text-slate-500 text-xs">({contact.relation})</span></p>
                            <p className="text-sm text-slate-500">Notified via SMS ({contact.phone})</p>
                        </div>
                        <span className="text-green-600 text-sm font-bold flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Sent
                        </span>
                     </div>
                 ))
             ) : (
                 <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-center">
                     <p className="text-orange-800 font-bold text-sm">No emergency contacts configured.</p>
                     <p className="text-orange-600 text-xs">Please add contacts in your profile for future safety.</p>
                 </div>
             )}
             
             <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-semibold text-slate-800">Local Emergency Services</p>
                    <p className="text-sm text-slate-500">Standby for connection</p>
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-sm">
                    Call Now
                </button>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm mt-4"
          >
            I am safe now (Deactivate Protocol)
          </button>
        </div>
      </div>
    </div>
  );
};
