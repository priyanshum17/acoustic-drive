import './DriveControls.css';
import { LucideArrowUp, LucideArrowDown, LucideSquare } from 'lucide-react';

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
    <div className="drive-controls">
      <div className="controls-hint">
        <span><kbd>W</kbd> Accelerate</span>
        <span><kbd>A</kbd> Halt</span>
        <span><kbd>S</kbd> Decelerate / Rewind</span>
      </div>
      
      <div className="buttons-group">
        <button 
           className={`control-btn forward ${level > 0 ? 'active' : ''}`} 
           onClick={handleForward}
           title="W"
        >
          <LucideArrowUp size={28} />
        </button>
        <button 
           className={`control-btn stop ${level === 0 ? 'active' : ''}`} 
           onClick={handleStop}
           title="A"
        >
          <LucideSquare size={24} fill="currentColor" />
        </button>
        <button 
           className={`control-btn backward ${level < 0 ? 'active' : ''}`} 
           onClick={handleBackward}
           title="S"
        >
          <LucideArrowDown size={28} />
        </button>
      </div>
    </div>
  );
}
