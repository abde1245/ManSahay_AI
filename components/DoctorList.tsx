
import React from 'react';
import { Doctor } from '../types';
import { MOCK_DOCTORS } from '../data/mockData';

export const DoctorList: React.FC<{ specialty: string }> = ({ specialty }) => {
  
  // Simple client-side filtering for the UI widget
  const filteredDoctors = specialty === 'General' 
    ? MOCK_DOCTORS 
    : MOCK_DOCTORS.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()) || specialty.toLowerCase().includes(d.specialty.toLowerCase()));

  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : MOCK_DOCTORS.slice(0, 2);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm my-4 w-full max-w-md animate-fade-in">
      <h3 className="font-semibold text-slate-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        Recommended Professionals
      </h3>
      <div className="space-y-3">
        {displayDoctors.map(doc => (
          <div key={doc.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-300 transition-colors cursor-pointer group">
            <img src={doc.imageUrl} alt={doc.name} className="w-12 h-12 rounded-full object-cover mr-4" />
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 group-hover:text-teal-700">{doc.name}</h4>
              <p className="text-xs text-slate-500">{doc.specialty}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {doc.available}
                </span>
              </div>
            </div>
            <button className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
