
import React, { useState } from 'react';
import { Doctor, Appointment } from '../types';
import { MOCK_DOCTORS } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (apt: Appointment) => void;
  onCancel: (aptId: string) => void;
}

export const AppointmentModal: React.FC<Props> = ({ isOpen, onClose, appointments, onBook, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-appointments'>('browse');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Filter state
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  if (!isOpen) return null;

  const handleBook = () => {
    if (selectedDoctor && selectedSlot) {
      const newApt: Appointment = {
        id: Date.now().toString(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        location: selectedDoctor.location,
        date: selectedSlot,
        notes: 'Initial consultation via Mansahay'
      };
      onBook(newApt);
      setActiveTab('my-appointments');
      setSelectedDoctor(null);
      setSelectedSlot(null);
    }
  };

  const generateGoogleCalendarLink = (apt: Appointment) => {
    const text = encodeURIComponent(`Appointment with ${apt.doctorName}`);
    const details = encodeURIComponent(`Specialty: ${apt.specialty}\nLocation: ${apt.location}\nBooked via Mansahay.`);
    const location = encodeURIComponent(apt.location);
    const start = new Date(); 
    start.setDate(start.getDate() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${formatDate(start)}/${formatDate(end)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  const filteredDoctors = specialtyFilter === 'All' 
    ? MOCK_DOCTORS 
    : MOCK_DOCTORS.filter(doc => doc.specialty.includes(specialtyFilter));

  const specialties = ['All', ...Array.from(new Set(MOCK_DOCTORS.map(d => d.specialty)))];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-teal-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Professional Care</h2>
            <p className="text-teal-100 text-sm">Find trusted specialists or manage your sessions.</p>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0 bg-white">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'browse' ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            Browse Specialists
          </button>
          <button 
            onClick={() => setActiveTab('my-appointments')}
            className={`flex-1 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'my-appointments' ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            My Appointments ({appointments.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {activeTab === 'browse' && (
            <>
              {/* Filters */}
              <div className="mb-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {specialties.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSpecialtyFilter(spec)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap border ${specialtyFilter === spec ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredDoctors.map(doc => (
                  <div key={doc.id} className={`bg-white p-4 rounded-xl border transition-all cursor-pointer ${selectedDoctor?.id === doc.id ? 'ring-2 ring-teal-500 border-teal-500 shadow-md' : 'border-slate-200 hover:border-teal-300 shadow-sm'}`}
                    onClick={() => { setSelectedDoctor(doc); setSelectedSlot(null); }}
                  >
                    <div className="flex items-start space-x-4">
                      <img src={doc.imageUrl} alt={doc.name} className="w-16 h-16 rounded-full object-cover border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{doc.name}</h3>
                        <p className="text-teal-600 text-sm font-medium">{doc.specialty}</p>
                        <p className="text-slate-500 text-xs mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {doc.location}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-yellow-500 flex text-xs font-bold mr-2">★ {doc.rating}</span>
                          <span className="text-slate-400 text-xs">{doc.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Slots Section */}
                    {selectedDoctor?.id === doc.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Available Slots</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doc.slots.map(slot => (
                            <button 
                              key={slot}
                              onClick={(e) => { e.stopPropagation(); setSelectedSlot(slot); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedSlot === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        <button 
                          disabled={!selectedSlot}
                          onClick={(e) => { e.stopPropagation(); handleBook(); }}
                          className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'my-appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                   </div>
                   <p className="text-slate-500">No upcoming appointments.</p>
                   <button onClick={() => setActiveTab('browse')} className="text-teal-600 font-medium mt-2 hover:underline">Browse Specialists</button>
                </div>
              ) : (
                appointments.map(apt => (
                  <div key={apt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                       <h3 className="font-bold text-lg text-slate-800">{apt.doctorName}</h3>
                       <p className="text-teal-600 font-medium">{apt.specialty}</p>
                       <div className="text-slate-500 text-sm mt-1 space-y-1">
                          <p className="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             {apt.date}
                          </p>
                          <p className="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                             {apt.location}
                          </p>
                       </div>
                    </div>
                    <div className="flex space-x-2">
                        <a 
                          href={generateGoogleCalendarLink(apt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                          </svg>
                          Calendar
                        </a>
                        <button 
                          onClick={() => onCancel(apt.id)}
                          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
