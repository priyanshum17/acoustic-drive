import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './DriveControls.css';

interface DriveControlsProps {
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
}

const MAX_LEVEL = 6;

export default function DriveControls({ level, setLevel }: DriveControlsProps) {

  const handleForward = () => setLevel(p => Math.min(p + 1, MAX_LEVEL));
  const handleBackward = () => setLevel(p => Math.max(p - 1, -MAX_LEVEL));
  const handleStop = () => setLevel(0);

  return (
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
  );
}

