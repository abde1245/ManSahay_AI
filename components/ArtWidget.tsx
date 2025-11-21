
import React, { useRef, useState, useEffect } from 'react';
import { Resource } from '../types';
import { geminiService } from '../services/geminiService';

interface Props {
  onSave: (resource: Resource) => void;
}

const COLORS = ['#000000', '#4B5563', '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A', '#059669', '#0D9488', '#0284C7', '#2563EB', '#7C3AED', '#C026D3', '#DB2777', '#ffffff'];
const BRUSH_SIZES = [2, 5, 10, 20, 40];
type BrushType = 'pencil' | 'marker' | 'watercolor' | 'eraser';

export const ArtWidget: React.FC<Props> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPos = useRef<{x: number, y: number} | null>(null);
  
  // State
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<BrushType>('pencil');
  const [symmetry, setSymmetry] = useState(0); // 0 = off, 4, 8, 12
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
      // Handle high DPI displays
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
        saveHistory(); // Initial blank state
      }
      
      // Reset styles on resize implies we lose data unless we redraw history, 
      // but for this widget we assume fixed size or just keep it simple.
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

    // Calculate position relative to the canvas element
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Prevent scrolling on touch devices
    if (e.type === 'touchstart') {
        // e.preventDefault(); // Can't preventDefault on passive listener in React, handled via CSS touch-action: none
    }

    setIsDrawing(true);
    const coords = getCoordinates(e, canvas);
    prevPos.current = coords;
    
    // Draw a single dot for a click
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

    // Configure Context based on Brush
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

    // Canvas logical dimensions (CSS pixels)
    const width = canvas.getBoundingClientRect().width;
    const height = 450; // Fixed height in CSS
    const centerX = width / 2;
    const centerY = height / 2;

    // Symmetry Logic
    const sectors = symmetry === 0 ? 1 : symmetry;
    const angleStep = (Math.PI * 2) / sectors;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < sectors; i++) {
        ctx.rotate(angleStep);
        
        // Calculate coordinates relative to center
        const x1 = startPos.x - centerX;
        const y1 = startPos.y - centerY;
        const x2 = currentPos.x - centerX;
        const y2 = currentPos.y - centerY;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (symmetry > 0) {
           // Mirror effect
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
    
    // Update previous position
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
        ctx.fillRect(0, 0, rect.width, 450); // Use logical pixels, dpr handled by context scale
        saveHistory();
      }
    }
  };

  const handleAnalyze = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsAnalyzing(true);
    setShowAI(true);
    setAiAnalysis(""); // clear old
    
    const dataUrl = canvas.toDataURL('image/png');
    const result = await geminiService.analyzeImage(dataUrl);
    
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsAnalyzing(true); 

    // Auto-generate analysis if not present
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
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>
         
         {/* Symmetry */}
         <div className="flex md:flex-col gap-2 items-center">
             <button 
               onClick={() => setSymmetry(prev => prev === 0 ? 4 : (prev === 4 ? 8 : (prev === 8 ? 12 : 0)))}
               className={`p-2 rounded-lg transition-colors relative ${symmetry > 0 ? 'bg-teal-100 text-teal-600' : 'text-slate-400 hover:bg-white'}`} 
               title="Mandala Mode"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               {symmetry > 0 && <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-teal-500 text-white w-3 h-3 rounded-full flex items-center justify-center">{symmetry}</span>}
             </button>
         </div>
         
         <div className="flex-1"></div>
         
         {/* Actions */}
         <button onClick={undo} disabled={historyStep <= 0} className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button>
         <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
         <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-red-500" title="Clear"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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

      {/* AI Analysis Sidebar (Collapsible) */}
      <div className={`absolute inset-y-0 right-0 w-64 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 z-20 ${showAI ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-purple-800">AI Companion</h3>
               <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
               {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-40 space-y-3">
                     <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                     <p className="text-xs text-slate-500 text-center">Connecting to vision center...<br/>Observing your strokes...</p>
                  </div>
               ) : aiAnalysis ? (
                  <div className="prose prose-sm prose-purple text-slate-600 text-sm leading-relaxed animate-fade-in">
                     {aiAnalysis}
                  </div>
               ) : (
                  <p className="text-xs text-slate-400 italic text-center mt-10">
                     Tap "Interpret Art" to have Mansahay look at your drawing and offer a supportive reflection.
                  </p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
