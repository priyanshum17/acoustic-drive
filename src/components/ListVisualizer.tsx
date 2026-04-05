import { useEffect, useRef, useState } from 'react';
import { MOCK_DIRECTORY } from '../data/mockDirectory';
import { AudioAnnouncer } from '../engine/AudioAnnouncer';
import DriveControls from './DriveControls';
import './ListVisualizer.css';

const ITEM_HEIGHT = 70;
const VISIBLE_COUNT = 15;
const LIST_SIZE = MOCK_DIRECTORY.length;
const MAX_LEVEL = 6;

export default function ListVisualizer() {
  const [level, setLevel] = useState(0);
  const [mode, setMode] = useState<'linear' | 'exponential'>('linear');
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const positionRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const lastTimeRef = useRef<number>(performance.now());
  const announcerRef = useRef(AudioAnnouncer.getInstance());
  
  const lastAnnouncedKeyRef = useRef<string>('');

  // Handle speed and scrolling loops directly
  useEffect(() => {
    let reqId: number;
    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000; // delta time in seconds
      lastTimeRef.current = time;
      
      let velocity = 0;
      if (level !== 0) {
        const sign = Math.sign(level);
        const absLevel = Math.abs(level);
        if (mode === 'linear') {
           velocity = sign * (absLevel * 8); // items per second per level
        } else {
           velocity = sign * Math.pow(2.2, absLevel + 1); // exponential scale
        }
      }
      
      if (velocity !== 0) {
         let newPos = positionRef.current + velocity * dt;
         if (newPos <= 0) {
            newPos = 0;
            setLevel(0);
         } else if (newPos >= LIST_SIZE - 1) {
            newPos = LIST_SIZE - 1;
            setLevel(0);
         }
         
         positionRef.current = newPos;
         setScrollTop(newPos * ITEM_HEIGHT);
         
         if (audioEnabled) {
             const currentIdx = Math.floor(newPos + 0.5); // Closest item
             const item = MOCK_DIRECTORY[currentIdx];
             
             if (item) {
                 const absLevel = Math.abs(level);
                 let keyToAnnounce = '';
                 
                 if (absLevel === 1) {
                    keyToAnnounce = item.name; 
                 } else if (absLevel === 2) {
                    keyToAnnounce = item.name.split(',')[0];
                 } else if (absLevel >= 3) {
                    keyToAnnounce = item.name.charAt(0).toUpperCase();
                 }
                 
                 if (keyToAnnounce !== lastAnnouncedKeyRef.current) {
                    lastAnnouncedKeyRef.current = keyToAnnounce;
                    announcerRef.current.speak(item.name, absLevel);
                 }
             }
         }
      }
      reqId = requestAnimationFrame(loop);
    };
    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [level, mode, audioEnabled]);
  
  // Keyboard Bindings
  useEffect(() => {
     const onKeyDown = (e: KeyboardEvent) => {
        if (!audioEnabled) return; // Prevent controlling before interaction unlocking audio

        if (e.key === 'w' || e.key === 'W') {
           setLevel(prev => Math.min(prev + 1, MAX_LEVEL));
        } else if (e.key === 's' || e.key === 'S') {
           setLevel(prev => Math.max(prev - 1, -MAX_LEVEL));
        } else if (e.key === 'a' || e.key === 'A') {
           setLevel(0);
           announcerRef.current.cancel();
        }
     };
     window.addEventListener('keydown', onKeyDown);
     return () => window.removeEventListener('keydown', onKeyDown);
  }, [audioEnabled]);
  
  const enableAudio = () => {
     announcerRef.current.init();
     setAudioEnabled(true);
  };

  const currentCenterIndex = Math.floor(positionRef.current + 0.5);
  const startIndex = Math.max(0, currentCenterIndex - Math.floor(VISIBLE_COUNT/2));
  const endIndex = Math.min(LIST_SIZE - 1, startIndex + VISIBLE_COUNT);
  
  const items = [];
  for (let i = startIndex; i <= endIndex; i++) {
     const item = MOCK_DIRECTORY[i];
     const offset = (i * ITEM_HEIGHT) - scrollTop;
     const isCenter = i === currentCenterIndex;
     
     // Parallax/Blur effect at high speeds
     const speedBlur = Math.abs(level) >= 4 ? `blur(${Math.abs(level) - 3}px)` : 'none';
     const opacity = Math.abs(offset) < ITEM_HEIGHT ? 1 : 1 - (Math.abs(offset) / (ITEM_HEIGHT * (VISIBLE_COUNT/2)));

     items.push(
        <div 
          key={item.id} 
          className={`virtual-item ${isCenter ? 'active' : ''}`}
          style={{ transform: `translateY(${offset}px)`, opacity: Math.max(0.1, opacity), filter: isCenter ? 'none' : speedBlur }}
        >
           <div className="item-name">{item.name}</div>
           <div className="item-phone">{item.phone}</div>
        </div>
     );
  }
  
  if (!audioEnabled) {
     return (
        <div className="unlock-screen">
           <h2>Screen Reader Offline</h2>
           <p>Audio permissions required to begin navigating.</p>
           <button onClick={enableAudio} className="btn-unlock">Power On</button>
        </div>
     )
  }

  return (
    <div className="visualizer-container">
      <div className="speed-hud">
         <div className="hud-metric">
            <span className="label">GEAR</span>
            <span className={`value gear-${Math.abs(level)}`}>{Math.abs(level) > 0 ? `${level > 0 ? '+' : '-'}${Math.abs(level)}` : 'N'}</span>
         </div>
         <div className="hud-metric mode-toggle" onClick={() => setMode(m => m === 'linear' ? 'exponential' : 'linear')}>
            <span className="label">MODE</span>
            <span className="value">{mode.toUpperCase()}</span>
         </div>
         <div className="hud-metric">
            <span className="label">INDEX</span>
            <span className="value">{(currentCenterIndex + 1).toString().padStart(4, '0')}</span>
         </div>
      </div>
      
      <div className="list-window">
         <div className="highlight-bar"></div>
         <div className="list-content">
            {items}
         </div>
      </div>
      
      <DriveControls level={level} setLevel={setLevel} />
    </div>
  );
}
