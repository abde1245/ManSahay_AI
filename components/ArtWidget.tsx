import React, { useRef, useState, useEffect } from 'react';
import { Resource } from '../types';
import { geminiService } from '../services/geminiService';

// ==========================================
// Shared Types & Props
// ==========================================

interface Props {
  onSave: (resource: Resource) => void;
}

interface ModeProps extends Props {
  onSwitchMode: () => void;
}

// ==========================================
// MODE 1: Normal / Simple Mode 
// ==========================================

const NormalMode: React.FC<ModeProps> = ({ onSave, onSwitchMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPos = useRef<{x: number, y: number} | null>(null);
  
  // Constants unique to Normal Mode
  const COLORS = ['#000000', '#4B5563', '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A', '#059669', '#0D9488', '#0284C7', '#2563EB', '#7C3AED', '#C026D3', '#DB2777', '#ffffff'];
  const BRUSH_SIZES = [2, 5, 10, 20, 40];
  type BrushType = 'pencil' | 'marker' | 'watercolor' | 'eraser';

  // State
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<BrushType>('pencil');
  const [symmetry, setSymmetry] = useState(0); 
  const [isDrawing, setIsDrawing] = useState(false);
  
  // History
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // AI Companion State
  const [showAI, setShowAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = 450 * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, 450);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        saveHistory(); 
      }
    }
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const coords = getCoordinates(e, canvas);
    prevPos.current = coords;
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCoordinates(e, canvas);
    const startPos = prevPos.current || currentPos;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushType === 'eraser' ? '#ffffff' : color;
    
    if (brushType === 'watercolor') {
        ctx.globalAlpha = 0.1; 
        ctx.shadowBlur = 2;
        ctx.shadowColor = color;
    } else {
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }
    
    if (brushType === 'marker') {
        ctx.globalAlpha = 0.5;
    }

    const width = canvas.getBoundingClientRect().width;
    const height = 450; 
    const centerX = width / 2;
    const centerY = height / 2;

    const sectors = symmetry === 0 ? 1 : symmetry;
    const angleStep = (Math.PI * 2) / sectors;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < sectors; i++) {
        ctx.rotate(angleStep);
        
        const x1 = startPos.x - centerX;
        const y1 = startPos.y - centerY;
        const x2 = currentPos.x - centerX;
        const y2 = currentPos.y - centerY;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (symmetry > 0) {
           ctx.save();
           ctx.scale(1, -1);
           ctx.beginPath();
           ctx.moveTo(x1, y1);
           ctx.lineTo(x2, y2);
           ctx.stroke();
           ctx.restore();
        }
    }

    ctx.restore();
    prevPos.current = currentPos;
  };

  const stopDrawing = () => {
    if (isDrawing) {
        setIsDrawing(false);
        prevPos.current = null;
        saveHistory();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, 450); 
        saveHistory();
      }
    }
  };

  const handleAnalyze = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsAnalyzing(true);
    setShowAI(true);
    setAiAnalysis(""); 
    
    const dataUrl = canvas.toDataURL('image/png');
    const result = await geminiService.analyzeImage(dataUrl);
    
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsAnalyzing(true); 

    let remarks = aiAnalysis;
    if (!remarks) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        remarks = await geminiService.analyzeImage(dataUrl);
        setAiAnalysis(remarks);
        setShowAI(true); 
      } catch (e) {
        console.error("Failed to auto-analyze art", e);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    
    const newResource: Resource = {
      id: Date.now().toString(),
      title: `Art Therapy - ${new Date().toLocaleDateString()}`,
      type: 'image',
      origin: 'user',
      content: dataUrl,
      date: new Date(),
      remarks: remarks 
    };
    
    onSave(newResource);
    setIsAnalyzing(false);
    setIsSaved(true);
  };

  if (isSaved) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center animate-fade-in my-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-purple-800 mb-2">Masterpiece Saved</h3>
        <p className="text-purple-600">Your art and the AI's interpretation have been saved to the Wellness Vault (Art Tab).</p>
        <button onClick={() => setIsSaved(false)} className="mt-4 text-sm text-purple-700 underline">Draw Another</button>
      </div>
    );
  }

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl shadow-lg my-4 overflow-hidden animate-fade-in flex flex-col md:flex-row h-[600px] md:h-[500px]">
      
      {/* Sidebar Tools */}
      <div className="w-full md:w-16 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex md:flex-col items-center p-2 gap-2 overflow-x-auto md:overflow-visible scrollbar-hide flex-shrink-0 z-10">
         {/* Brush Type */}
         <div className="flex md:flex-col gap-2 border-r md:border-r-0 md:border-b border-slate-200 pr-2 md:pr-0 md:pb-2 mr-2 md:mr-0 md:mb-2">
            <button onClick={() => setBrushType('pencil')} className={`p-2 rounded-lg transition-colors ${brushType === 'pencil' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-white'}`} title="Pencil">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button onClick={() => setBrushType('marker')} className={`p-2 rounded-lg transition-colors ${brushType === 'marker' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-white'}`} title="Marker">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" /></svg>
            </button>
            <button onClick={() => setBrushType('watercolor')} className={`p-2 rounded-lg transition-colors ${brushType === 'watercolor' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-white'}`} title="Watercolor">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </button>
            <button onClick={() => setBrushType('eraser')} className={`p-2 rounded-lg transition-colors ${brushType === 'eraser' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-white'}`} title="Eraser">
               <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 256 256" 
                    fill="currentColor" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeLinejoin="round"
                    >
                    <path d="M216.001 211.833H120.6875l98.14258-98.1416a20.0237 20.0237 0 0 0-.001-28.28418L173.57422 40.15234a20.01987 20.01987 0 0 0-28.2832 0l-56.564 56.564-.00537.00439-.00439.00537-56.564 56.564a20.02163 20.02163 0 0 0 0 28.2832l37.08887 37.08789a4.00051 4.00051 0 0 0 2.82812 1.17188H216.001a4 4 0 0 0 0-8ZM150.94727 45.80859a12.0157 12.0157 0 0 1 16.9707 0l45.25488 45.25489a12.016 12.016 0 0 1 0 16.97168L159.43213 161.7749 97.20654 99.54932ZM109.37305 211.833H73.72754l-35.918-35.916a12.01392 12.01392 0 0 1 0-16.9707l53.74072-53.74072 62.22559 62.22558Z" />
                </svg> 
            </button>
         </div>
         
         {/* Symmetry */}
         <div className="flex md:flex-col gap-2 items-center">
             <button 
               onClick={() => setSymmetry(prev => prev === 0 ? 4 : (prev === 4 ? 8 : (prev === 8 ? 12 : 0)))}
               className={`p-2 rounded-lg transition-colors relative ${symmetry > 0 ? 'bg-teal-100 text-teal-600' : 'text-slate-400 hover:bg-white'}`} 
               title="Mandala Mode"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
               {symmetry > 0 && <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-teal-500 text-white w-3 h-3 rounded-full flex items-center justify-center">{symmetry}</span>}
               {symmetry > 0 && <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-teal-500 text-white w-3 h-3 rounded-full flex items-center justify-center">{symmetry}</span>}
             </button>
         </div>
         
         <div className="flex-1"></div>
         
         {/* Actions */}
         <button onClick={undo} disabled={historyStep <= 0} className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button>
         <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"><svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            style={{ transform: 'rotate(180deg)' }} 
            >
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg></button>
         <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-red-500" title="Clear"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>

         {/* NEW: Zen Mode / Full Screen Trigger */}
         <button 
           onClick={onSwitchMode} 
           className="p-2 mt-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors shadow-sm"
           title="Enter Full Screen Zen Mode"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
           </svg>
         </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-slate-100 cursor-crosshair overflow-hidden" style={{ touchAction: 'none' }}>
         <canvas
           ref={canvasRef}
           onMouseDown={startDrawing}
           onMouseMove={draw}
           onMouseUp={stopDrawing}
           onMouseLeave={stopDrawing}
           onTouchStart={startDrawing}
           onTouchMove={draw}
           onTouchEnd={stopDrawing}
           className="w-full h-full block"
           style={{ width: '100%', height: '450px' }}
         />
         
         {/* Floating Tool: Color & Size */}
         <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg flex items-center justify-between border border-slate-200">
             <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
               {COLORS.map(c => (
                 <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full flex-shrink-0 border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-white/50'}`} style={{ backgroundColor: c }} />
               ))}
             </div>
             <div className="w-px h-6 bg-slate-200 mx-2"></div>
             <div className="flex items-center gap-2 pr-2">
               {BRUSH_SIZES.map(s => (
                  <button key={s} onClick={() => setBrushSize(s)} className={`bg-slate-800 rounded-full transition-all ${brushSize === s ? 'opacity-100' : 'opacity-20'}`} style={{ width: Math.max(6, s/2), height: Math.max(6, s/2) }} />
               ))}
             </div>
         </div>

         {/* AI Toggle Button */}
         <button 
            onClick={handleAnalyze}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-purple-100 text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-2"
         >
             {isAnalyzing ? (
                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
             ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
             )}
             <span className="text-xs font-bold">Interpret Art</span>
         </button>
         
         {/* Save Button */}
         <button 
            onClick={handleSave}
            disabled={isAnalyzing}
            className="absolute top-4 left-4 bg-teal-600 text-white p-2 rounded-xl shadow-lg hover:bg-teal-700 transition-all font-bold text-xs px-4 disabled:opacity-70 disabled:cursor-wait"
         >
            {isAnalyzing ? 'Analyzing...' : 'Done & Save'}
         </button>
      </div>

      {/* AI Analysis Sidebar (UPDATED to match Zen Mode) */}
      <div className={`absolute inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-30 ${showAI ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-full flex flex-col bg-slate-50">
             <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                     </div>
                     <h3 className="font-bold text-slate-800">Art Interpretation</h3>
                 </div>
                 <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>
             <div className="flex-1 overflow-y-auto p-6">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm font-medium text-purple-800 animate-pulse">Analyzing your creative expression...</p>
                        <p className="text-xs text-slate-500 max-w-[200px]">Looking at colors, forms, and composition to understand the emotion.</p>
                    </div>
                ) : aiAnalysis ? (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                            <p className="text-sm text-slate-700 leading-relaxed font-serif italic">"{aiAnalysis}"</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setShowAI(false)} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold">Keep Drawing</button>
                           <button onClick={handleSave} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-200">Save to Vault</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-10 opacity-50">
                        <p className="text-sm">Click "Interpret" to get AI feedback.</p>
                    </div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};

// ==========================================
// MODE 2: Zen / Zoom Mode (Fixed & Optimized)
// ==========================================

const ZenMode: React.FC<ModeProps> = ({ onSave, onSwitchMode }) => {
  // Constants unique to Zen Mode
  const COLORS = ['#000000', '#4B5563', '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A', '#059669', '#0D9488', '#0284C7', '#2563EB', '#7C3AED', '#C026D3', '#DB2777', '#ffffff'];
  const BRUSH_SIZES = [2, 5, 10, 20, 40, 80];
  
  // 1. OPTIMIZED SIZE: 3000px is huge but safe for browser GPU limits.
  const CANVAS_SIZE = 2000; 

  type ToolType = 'pencil' | 'marker' | 'watercolor' | 'glow' | 'spray' | 'rainbow' | 'eraser' | 'fill';

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Transform State
  const [zoom, setZoom] = useState(0.7); // Start zoomed out
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Drawing State
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<ToolType>('pencil');
  const [symmetry, setSymmetry] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // History State
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceOpacity, setReferenceOpacity] = useState(0.3);

  // AI State
  const [showAI, setShowAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const hueRef = useRef(0);
  const lastPosRef = useRef<{x: number, y: number} | null>(null);

  // ==========================================
  // PREVENT BROWSER ZOOM
  // ==========================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        setZoom(z => Math.min(Math.max(0.1, z + delta), 5));
      } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // ==========================================
  // INITIALIZATION & CENTER MATH
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        saveHistory();
      }
      
      // 3. CALCULATE TRUE CENTER
      if (containerRef.current) {
         const viewportWidth = window.innerWidth;
         const viewportHeight = window.innerHeight;
         
         // Formula: (Viewport / 2) - (CanvasSize * Zoom / 2)
         // This centers the scaled canvas in the viewport
         const startX = (viewportWidth - (CANVAS_SIZE * 0.7)) / 2;
         const startY = (viewportHeight - (CANVAS_SIZE * 0.7)) / 2;
         
         setPan({ x: startX, y: startY });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.code === 'Space') {
           if ((e.target as HTMLElement).tagName !== 'INPUT') {
             e.preventDefault(); 
             setIsSpacePressed(true);
           }
       }
       if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
           e.preventDefault();
           undo();
       }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
       if (e.code === 'Space') setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ==========================================
  // COORDINATE SYSTEM
  // ==========================================
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
     const canvas = canvasRef.current;
     if (!canvas) return { x: 0, y: 0 };

     const rect = canvas.getBoundingClientRect();

     let clientX, clientY;
     if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
     } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
     }

     const xRaw = clientX - rect.left;
     const yRaw = clientY - rect.top;

     const scaleX = canvas.width / rect.width;
     const scaleY = canvas.height / rect.height;

     return {
       x: xRaw * scaleX,
       y: yRaw * scaleY
     };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
     if (e.button === 1 || isSpacePressed) {
         e.preventDefault();
         setIsPanning(true);
     } else {
         startDrawing(e);
     }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
     if (isPanning) {
         setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
     } else {
         draw(e);
     }
  };

  const handleMouseUp = () => {
      setIsPanning(false);
      stopDrawing();
  };

  // ==========================================
  // DRAWING LOGIC
  // ==========================================
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (tool === 'fill') {
         const coords = getCanvasCoordinates(e);
         floodFill(Math.floor(coords.x), Math.floor(coords.y), color);
         saveHistory();
         return;
      }
      
      setIsDrawing(true);
      const coords = getCanvasCoordinates(e);
      lastPosRef.current = coords;
      draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const currentPos = getCanvasCoordinates(e);
      const startPos = lastPosRef.current || currentPos;

      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';

      if (tool === 'eraser') {
          ctx.strokeStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
      } else if (tool === 'glow') {
          ctx.strokeStyle = color;
          ctx.shadowBlur = 30; 
          ctx.shadowColor = color;
          ctx.globalAlpha = 1; 
      } else if (tool === 'watercolor') {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.1; 
          ctx.shadowBlur = 2;
          ctx.shadowColor = color;
          ctx.globalCompositeOperation = 'multiply';
      } else if (tool === 'marker') {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.6; 
          ctx.shadowBlur = 0;
      } else if (tool === 'rainbow') {
          hueRef.current = (hueRef.current + 5) % 360;
          const rainbowColor = `hsl(${hueRef.current}, 100%, 50%)`;
          ctx.strokeStyle = rainbowColor;
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
      } else {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sectors = symmetry === 0 ? 1 : symmetry;
      const angleStep = (Math.PI * 2) / sectors;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < sectors; i++) {
          ctx.rotate(angleStep);
          
          const x1 = startPos.x - centerX;
          const y1 = startPos.y - centerY;
          const x2 = currentPos.x - centerX;
          const y2 = currentPos.y - centerY;
          
          if (tool === 'spray') {
             ctx.fillStyle = color;
             const density = brushSize * 2;
             for (let j = 0; j < density; j++) {
                 const offsetX = (Math.random() - 0.5) * brushSize * 3;
                 const offsetY = (Math.random() - 0.5) * brushSize * 3;
                 ctx.fillRect(x2 + offsetX, y2 + offsetY, 1, 1);
             }
          } else {
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
          }

          if (symmetry > 0) {
              ctx.save();
              ctx.scale(1, -1); 
              if (tool !== 'spray') {
                  ctx.beginPath();
                  ctx.moveTo(x1, y1);
                  ctx.lineTo(x2, y2);
                  ctx.stroke();
              }
              ctx.restore();
          }
      }

      ctx.restore();
      lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
      if (isDrawing) {
          setIsDrawing(false);
          lastPosRef.current = null;
          saveHistory();
      }
  };

  // ==========================================
  // UTILITIES (FloodFill, History, Save)
  // ==========================================
  const floodFill = (startX: number, startY: number, fillColor: string) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const tempCtx = document.createElement('canvas').getContext('2d');
      if (!tempCtx) return;
      tempCtx.fillStyle = fillColor;
      tempCtx.fillRect(0,0,1,1);
      const fData = tempCtx.getImageData(0,0,1,1).data;
      const targetR = fData[0], targetG = fData[1], targetB = fData[2], targetA = fData[3];

      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const stack = [[startX, startY]];
      const startPos = (startY * width + startX) * 4;
      
      const startR = data[startPos];
      const startG = data[startPos + 1];
      const startB = data[startPos + 2];
      const startA = data[startPos + 3];

      if (startR === targetR && startG === targetG && startB === targetB && startA === targetA) return;

      const matchStartColor = (pos: number) => {
          return data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA;
      };

      const colorPixel = (pos: number) => {
          data[pos] = targetR;
          data[pos + 1] = targetG;
          data[pos + 2] = targetB;
          data[pos + 3] = targetA;
      };

      while (stack.length) {
          const pixel = stack.pop();
          if (!pixel) continue;
          let x = pixel[0];
          let y = pixel[1];
          let pixelPos = (y * width + x) * 4;

          while (y-- >= 0 && matchStartColor(pixelPos)) {
              pixelPos -= width * 4;
          }
          pixelPos += width * 4;
          y++;
          
          let reachLeft = false;
          let reachRight = false;
          
          while (y++ < height - 1 && matchStartColor(pixelPos)) {
              colorPixel(pixelPos);
              if (x > 0) {
                  if (matchStartColor(pixelPos - 4)) {
                      if (!reachLeft) {
                          stack.push([x - 1, y]);
                          reachLeft = true;
                      }
                  } else if (reachLeft) {
                      reachLeft = false;
                  }
              }
              if (x < width - 1) {
                  if (matchStartColor(pixelPos + 4)) {
                      if (!reachRight) {
                          stack.push([x + 1, y]);
                          reachRight = true;
                      }
                  } else if (reachRight) {
                      reachRight = false;
                  }
              }
              pixelPos += width * 4;
          }
      }
      ctx.putImageData(imageData, 0, 0);
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newHistory = history.slice(0, historyStep + 1);
    if (newHistory.length > 20) newHistory.shift();
    
    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setReferenceImage(ev.target?.result as string);
          };
          reader.readAsDataURL(file);
          e.target.value = '';
      }
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          saveHistory();
      }
  };

  const handleAnalyze = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsAnalyzing(true);
    setShowAI(true);
    const dataUrl = canvas.toDataURL('image/png');
    const result = await geminiService.analyzeImage(dataUrl);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsAnalyzing(true); 
    
    let remarks = aiAnalysis;
    if (!remarks) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        remarks = await geminiService.analyzeImage(dataUrl);
        setAiAnalysis(remarks);
        setShowAI(true); 
      } catch (e) { console.error(e); }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const newResource: Resource = {
      id: Date.now().toString(),
      title: `Art Therapy - ${new Date().toLocaleDateString()}`,
      type: 'image',
      origin: 'user',
      content: dataUrl,
      date: new Date(),
      remarks: remarks 
    };
    onSave(newResource);
    setIsAnalyzing(false);
    setIsSaved(true);
  };

  if (isSaved) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center animate-fade-in my-4 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-purple-800 mb-2">Masterpiece Saved!</h3>
        <p className="text-purple-600 max-w-md mx-auto">Your creative expression has been safely stored in the Wellness Vault. The AI's thoughts are attached.</p>
        <button onClick={() => setIsSaved(false)} className="mt-8 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors">Create New Art</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 rounded-none bg-slate-100 border border-slate-300 shadow-xl overflow-hidden flex flex-col animate-fade-in transition-all duration-300">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between shrink-0 z-20 shadow-sm relative">
         <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pr-4">
            <button onClick={onSwitchMode} className="p-2 text-slate-500 hover:text-purple-600 flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 <span className="text-xs font-bold hidden md:inline">Back</span>
            </button>

            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                {[
                    { id: 'pencil', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
                    { id: 'marker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" /></svg> },
                    { id: 'watercolor', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
                    { id: 'spray', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 -15.97 183.958 183.958" fill="currentColor"><path d="M737.5,1277.072a4,4,0,1,0,5.657,0A4,4,0,0,0,737.5,1277.072Z" transform="translate(-711.581 -1251.969)" /><path d="M889.883,1332.579l-4.95,4.95-67.882-67.882L822,1264.7l-5.656-5.657-7.57,7.569a31.27,31.27,0,0,0-21.529-6.986,35.488,35.488,0,0,0-17.843,6.216l-13.87-13.87-10.606,10.607,13.8,13.8a35.566,35.566,0,0,0-6.5,18.265,31.249,31.249,0,0,0,6.985,21.529l-8.63,8.63,5.658,5.657,5.656-5.657,67.882,67.883-5.657,5.656,5.658,5.657,65.76-65.761Zm-129.67-37.486a30.72,30.72,0,0,1,27.482-27.482,22.944,22.944,0,0,1,15.385,4.693l-38.174,38.172A22.95,22.95,0,0,1,760.213,1295.093Zm7.34,24.051,43.841-43.84,67.881,67.881-43.839,43.841Z" transform="translate(-711.581 -1251.969)" /></svg> },
                    { id: 'glow', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg> },
                    { id: 'rainbow', icon: <span className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 block"></span> },
                    { id: 'fill', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" /></svg> },
                    { id: 'eraser', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 256 256" fill="currentColor"><path d="M216.001 211.833H120.6875l98.14258-98.1416a20.0237 20.0237 0 0 0-.001-28.28418L173.57422 40.15234a20.01987 20.01987 0 0 0-28.2832 0l-56.564 56.564-.00537.00439-.00439.00537-56.564 56.564a20.02163 20.02163 0 0 0 0 28.2832l37.08887 37.08789a4.00051 4.00051 0 0 0 2.82812 1.17188H216.001a4 4 0 0 0 0-8ZM150.94727 45.80859a12.0157 12.0157 0 0 1 16.9707 0l45.25488 45.25489a12.016 12.016 0 0 1 0 16.97168L159.43213 161.7749 97.20654 99.54932ZM109.37305 211.833H73.72754l-35.918-35.916a12.01392 12.01392 0 0 1 0-16.9707l53.74072-53.74072 62.22559 62.22558Z" /></svg> },
                ].map((t) => (
                    <button 
                        key={t.id} 
                        onClick={() => setTool(t.id as ToolType)}
                        className={`p-2 rounded transition-all ${tool === t.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-purple-600'}`}
                        title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>

            <button 
               onClick={() => setSymmetry(prev => prev === 0 ? 4 : (prev === 4 ? 8 : (prev === 8 ? 12 : 0)))}
               className={`p-2 rounded-lg transition-colors relative ${symmetry > 0 ? 'bg-teal-100 text-teal-600' : 'text-slate-400 hover:bg-slate-50'}`} 
               title="Kaleidoscope / Symmetry"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
               {symmetry > 0 && <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-teal-500 text-white w-3 h-3 rounded-full flex items-center justify-center">{symmetry}</span>}
            </button>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                <button onClick={undo} disabled={historyStep <= 0} className="p-2 text-slate-500 hover:text-purple-600 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button>
                <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 text-slate-500 hover:text-purple-600 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ transform: 'rotate(180deg)' }}><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button>
            </div>
            
            <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-red-500" title="Clear Canvas"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
         </div>

         <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleReferenceUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200" title="Add Reference Image">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>

            <button onClick={handleAnalyze} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showAI ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {isAnalyzing ? <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>}
                <span className="text-xs font-bold hidden md:inline">Interpret</span>
            </button>
            
            <button onClick={handleSave} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all">
               Save Art
            </button>
         </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden bg-slate-200 flex" ref={containerRef}>
          
          {/* Zoom/Pan Controls Overlay */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-slate-200">
             <button onClick={() => setZoom(z => Math.min(z + 0.1, 5))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
             <div className="text-[10px] text-center font-mono text-slate-500">{Math.round(zoom * 100)}%</div>
             <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.1))} className="p-1 hover:bg-slate-100 rounded text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
             <button onClick={() => { 
                 if (containerRef.current) {
                    const vW = window.innerWidth;
                    const vH = window.innerHeight;
                    setPan({ x: (vW - (CANVAS_SIZE * 0.7)) / 2, y: (vH - (CANVAS_SIZE * 0.7)) / 2 });
                    setZoom(0.7);
                 }
             }} className="border-t border-slate-100 mt-1 pt-1 text-[10px] text-slate-400 hover:text-purple-600">Reset</button>
          </div>

          {/* Floating Palette */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-slate-200">
             <div className="grid grid-cols-2 gap-2 mb-3">
                 {COLORS.slice(0, 10).map(c => (
                     <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                 ))}
             </div>
             <div className="h-px bg-slate-200 my-2"></div>
             <div className="flex flex-col gap-2">
                 <p className="text-[9px] uppercase font-bold text-slate-400">Size</p>
                 <div className="flex items-center gap-1">
                    {BRUSH_SIZES.map(s => (
                        <button key={s} onClick={() => setBrushSize(s)} className={`bg-slate-800 rounded-full transition-all ${brushSize === s ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`} style={{ width: Math.max(8, s/3), height: Math.max(8, s/3) }} />
                    ))}
                 </div>
             </div>
             {referenceImage && (
                 <>
                   <div className="h-px bg-slate-200 my-2"></div>
                   <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-400">
                         <span>Ref Opacity</span>
                         <button onClick={() => setReferenceImage(null)} className="text-red-400 hover:text-red-600">×</button>
                      </div>
                      <input type="range" min="0" max="1" step="0.1" value={referenceOpacity} onChange={e => setReferenceOpacity(parseFloat(e.target.value))} className="w-full accent-purple-600 h-1 bg-slate-200 rounded-lg appearance-none" />
                   </div>
                 </>
             )}
          </div>

          {/* The Transformable Massive Canvas Container */}
          <div 
             className={`origin-top-left transition-transform duration-75 ease-out ${isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : (tool === 'fill' ? 'cursor-cell' : 'cursor-crosshair')}`}
             style={{ 
                 transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                 width: `${CANVAS_SIZE}px`, 
                 height: `${CANVAS_SIZE}px` 
             }}
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onTouchStart={startDrawing}
             onTouchMove={draw}
             onTouchEnd={stopDrawing}
          >
              {/* Added shadow-2xl so the white paper is visible against the white background */}
              <div className="relative w-full h-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-slate-100">
                  <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full block"
                    style={{ cursor: isPanning ? 'grab' : 'crosshair', touchAction: 'none' }} 
                  />
                  
                  {/* Reference Layer (overlay) */}
                  {referenceImage && (
                      <img 
                        src={referenceImage} 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        style={{ opacity: referenceOpacity }} 
                        alt="Reference"
                      />
                  )}
              </div>
          </div>
          
          {/* Instructions Overlay (Fades out) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none bg-black/50 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm opacity-0 animate-fade-in" style={{ animationDuration: '3s', animationFillMode: 'forwards' }}>
              Hold Space + Drag to Pan • Scroll to Zoom
          </div>
      </div>

      {/* AI Sidebar */}
      <div className={`absolute inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-30 ${showAI ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-full flex flex-col bg-slate-50">
             <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                     </div>
                     <h3 className="font-bold text-slate-800">Art Interpretation</h3>
                 </div>
                 <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>
             <div className="flex-1 overflow-y-auto p-6">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm font-medium text-purple-800 animate-pulse">Analyzing your creative expression...</p>
                        <p className="text-xs text-slate-500 max-w-[200px]">Looking at colors, forms, and composition to understand the emotion.</p>
                    </div>
                ) : aiAnalysis ? (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                            <p className="text-sm text-slate-700 leading-relaxed font-serif italic">"{aiAnalysis}"</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setShowAI(false)} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold">Keep Drawing</button>
                           <button onClick={handleSave} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-200">Save to Vault</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-10 opacity-50">
                        <p className="text-sm">Click "Interpret" to get AI feedback.</p>
                    </div>
                )}
             </div>
         </div>
      </div>

    </div>
  );
};

// ==========================================
// MAIN WIDGET EXPORT
// ==========================================

export const ArtWidget: React.FC<Props> = (props) => {
  const [mode, setMode] = useState<'normal' | 'zen'>('normal');

  if (mode === 'zen') {
    return <ZenMode {...props} onSwitchMode={() => setMode('normal')} />;
  }

  return <NormalMode {...props} onSwitchMode={() => setMode('zen')} />;
};