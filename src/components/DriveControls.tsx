import { ChevronLeft, ChevronRight, X, SlidersHorizontal, MousePointerClick } from 'lucide-react';
import { useState } from 'react';
import './DriveControls.css';

interface DriveControlsProps {
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
}

const MAX_LEVEL = 5;

export default function DriveControls({ level, setLevel }: DriveControlsProps) {
  const [mode, setMode] = useState<'buttons' | 'slider'>('buttons');

  const handleForward = () => setLevel(p => Math.min(p + 1, MAX_LEVEL));
  const handleBackward = () => setLevel(p => Math.max(p - 1, -MAX_LEVEL));
  const handleStop = () => setLevel(0);

  return (
    <div className="lux-drive-container">
      <div className="drive-header">
         <span className="drive-title">Transmission Mode</span>
         <button className="mode-toggle" onClick={() => setMode(m => m === 'buttons' ? 'slider' : 'buttons')}>
            {mode === 'buttons' ? <SlidersHorizontal size={14} /> : <MousePointerClick size={14} />}
            <span>{mode === 'buttons' ? 'Use Slider' : 'Use Buttons'}</span>
         </button>
      </div>

      {mode === 'buttons' ? (
        <div className="lux-drive-bay">
          <button 
             className={`lux-btn backward ${level < 0 ? 'active' : ''}`} 
             onClick={handleBackward}
          >
            <ChevronLeft size={18} />
            <span>Reverse</span>
          </button>
          
          <button 
             className={`lux-btn stop ${level === 0 ? 'active' : ''}`} 
             onClick={handleStop}
          >
            <X size={18} />
            <span>Hard Stop</span>
          </button>

          <button 
             className={`lux-btn forward ${level > 0 ? 'active' : ''}`} 
             onClick={handleForward}
          >
            <span>Accelerate</span>
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className="lux-slider-bay">
           <input 
              type="range" 
              min="-5" max="5" step="1" 
              value={level} 
              onChange={(e) => setLevel(parseInt(e.target.value))} 
              className="lux-drive-slider"
           />
           <div className="slider-marks">
              <span>-5 (Rev)</span>
              <span>0 (Stop)</span>
              <span>+5 (Fwd)</span>
           </div>
        </div>
      )}
    </div>
  );
}

