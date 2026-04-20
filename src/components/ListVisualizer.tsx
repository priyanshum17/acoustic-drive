import { useEffect, useRef, useState, useMemo } from 'react';
import { MOCK_DIRECTORY } from '../data/mockDirectory';
import { AudioAnnouncer } from '../engine/AudioAnnouncer';
import { TrieNavigator, TrieNode } from '../engine/TrieNavigator';
import DriveControls from './DriveControls';
import { Activity, Gauge, Navigation, Layers, History, Clock } from 'lucide-react';
import './ListVisualizer.css';

const ITEM_HEIGHT = 80;
const VISIBLE_COUNT = 15;
const LIST_SIZE = MOCK_DIRECTORY.length;
const MAX_LEVEL = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function ListVisualizer() {
  const [level, setLevel] = useState(0);
  const [mode, setMode] = useState<'linear' | 'exponential'>('linear');
  const [baseSpeed, setBaseSpeed] = useState(1.5);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [displayVelocity, setDisplayVelocity] = useState(0);
  
  // New Metrics & Immersion
  const [peakWpm, setPeakWpm] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const spokenItems = useRef<Set<string>>(new Set());
  
  const trieNavigator = useMemo(() => new TrieNavigator(MOCK_DIRECTORY), []);
  const currentNodeRef = useRef<TrieNode>(trieNavigator.getLeafAt(0));
  const lastSpokenNodeRef = useRef<TrieNode | null>(null);
  const clutchUntilRef = useRef<number>(0);
  const hopProgressRef = useRef(0);
  const targetLinearIndexRef = useRef(0);
  
  const positionRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const lastTimeRef = useRef<number>(performance.now());
  const announcerRef = useRef(AudioAnnouncer.getInstance());

  // Transparently enable audio on first interaction
  useEffect(() => {
    if (audioEnabled) return;
    
    const unlock = () => {
       announcerRef.current.init();
       setAudioEnabled(true);
    };
    
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => {
       window.removeEventListener('keydown', unlock);
       window.removeEventListener('pointerdown', unlock);
    };
  }, [audioEnabled]);

  // Handle speed and scrolling loops directly
  useEffect(() => {
    let reqId: number;
    let speakTimer: any;

    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000; 
      lastTimeRef.current = time;
      
      let velocity = 0;
      if (level !== 0) {
        const sign = Math.sign(level);
        const absLevel = Math.abs(level);
        if (mode === 'linear') {
           velocity = sign * (absLevel * baseSpeed);
        } else {
           velocity = sign * baseSpeed * Math.pow(1.8, absLevel - 1);
        }
      }
      
      if (Math.abs(velocity) !== Math.abs(displayVelocity)) {
          setDisplayVelocity(velocity);
          const currentWpm = Math.abs(Math.round(velocity * 60));
          setPeakWpm(prev => Math.max(prev, currentWpm));
      }
      
      if (level !== 0) {
         const sign = Math.sign(level);
         const absLevel = Math.abs(level);
         
         // 1. Shift Gears (Vertical movement in Trie)
         let targetDepth = 5; // Gear 1 (Leaf)
         if (absLevel === 2) targetDepth = 4;
         if (absLevel === 3) targetDepth = 3;
         if (absLevel === 4) targetDepth = 2;
         if (absLevel >= 5) targetDepth = 1;
         
         if (currentNodeRef.current.depth > targetDepth) {
            currentNodeRef.current = currentNodeRef.current.getAncestorAtDepth(targetDepth);
         } else if (currentNodeRef.current.depth < targetDepth) {
            let curr = currentNodeRef.current;
            while (curr.depth < targetDepth && curr.children.length > 0) {
               curr = curr.children[0];
            }
            currentNodeRef.current = curr;
         }
         
         // 2. Horizontal Hopping
         let hopRate = baseSpeed;
         if (time > clutchUntilRef.current) {
             hopProgressRef.current += hopRate * dt;
         }
         
         let hopped = false;
         while (hopProgressRef.current >= 1) {
             hopProgressRef.current -= 1;
             let nextNode = sign > 0 ? currentNodeRef.current.nextSibling : currentNodeRef.current.prevSibling;
             if (nextNode) {
                 currentNodeRef.current = nextNode;
                 hopped = true;
             }
         }
         
         // 3. Audio & UI side effects on Hop
         if (hopped && audioEnabled) {
             const leaf = currentNodeRef.current.depth === 5 ? currentNodeRef.current : currentNodeRef.current.getFirstLeaf();
             const char = currentNodeRef.current.prefix.charAt(0);
             
             announcerRef.current.playTick(char);
             
             // Adaptive Talking Rate
             const talkingRate = 1.0;
             const spellOut = targetDepth < 5; // Spell out prefixes
             
             const actuallySpoke = announcerRef.current.speak(currentNodeRef.current.prefix, talkingRate, spellOut, false);
             if (actuallySpoke) {
                lastSpokenNodeRef.current = currentNodeRef.current;
             }
             
             // Pulse Effect & History
             setIsSpeaking(true);
             clearTimeout(speakTimer);
             speakTimer = setTimeout(() => setIsSpeaking(false), 200);

             if (leaf.contact && !spokenItems.current.has(leaf.contact.id)) {
               spokenItems.current.add(leaf.contact.id);
               setSessionCount(spokenItems.current.size);
               setHistory(prev => [leaf.contact!.name, ...prev].slice(0, 10));
             }
         }
      }
      
      // 4. Update target linear index
      targetLinearIndexRef.current = currentNodeRef.current.depth === 5 
        ? currentNodeRef.current.linearIndex 
        : currentNodeRef.current.getFirstLeaf().linearIndex;

      // 5. Smooth visual interpolation
      const diff = targetLinearIndexRef.current - positionRef.current;
      positionRef.current += diff * 15 * dt; // frame-rate independent easing
      if (Math.abs(diff) < 0.05) positionRef.current = targetLinearIndexRef.current;
      
      setScrollTop(positionRef.current * ITEM_HEIGHT);
      reqId = requestAnimationFrame(loop);
    };
    reqId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(reqId);
      clearTimeout(speakTimer);
    };
  }, [level, mode, audioEnabled, baseSpeed, displayVelocity]);
  
  // Keyboard Bindings
  useEffect(() => {
     const onKeyDown = (e: KeyboardEvent) => {
        if (!audioEnabled) return; 

        if (e.key === 'w' || e.key === 'W') {
           setLevel(prev => {
              clutchUntilRef.current = performance.now() + 2000;
              return Math.min(prev + 1, MAX_LEVEL);
           });
        } else if (e.key === 's' || e.key === 'S') {
           setLevel(prev => {
              clutchUntilRef.current = performance.now() + 2000;
              return Math.max(prev - 1, -MAX_LEVEL);
           });
        } else if (e.key === 'a' || e.key === 'A') {
           setLevel(() => {
              if (lastSpokenNodeRef.current) {
                 currentNodeRef.current = lastSpokenNodeRef.current;
              }
              return 0;
           });
           announcerRef.current.cancel();
        }
     };
     window.addEventListener('keydown', onKeyDown);
     return () => window.removeEventListener('keydown', onKeyDown);
  }, [audioEnabled]);

  const currentCenterIndex = Math.floor(positionRef.current + 0.5);
  const currentItem = MOCK_DIRECTORY[currentCenterIndex];
  const currentLetter = currentItem?.name.charAt(0).toUpperCase();

  const startIndex = Math.max(0, currentCenterIndex - Math.floor(VISIBLE_COUNT/2));
  const endIndex = Math.min(LIST_SIZE - 1, startIndex + VISIBLE_COUNT);
  
  const items = useMemo(() => {
    const list = [];
    for (let i = startIndex; i <= endIndex; i++) {
        const item = MOCK_DIRECTORY[i];
        const offset = (i * ITEM_HEIGHT) - scrollTop;
        const isCenter = i === currentCenterIndex;
        
        const distFromCenter = Math.abs(offset);
        const opacity = distFromCenter < ITEM_HEIGHT ? 1 : Math.max(0, 1 - (distFromCenter / (ITEM_HEIGHT * (VISIBLE_COUNT/2.8))));
        const blur = distFromCenter < ITEM_HEIGHT ? 0 : Math.min(6, distFromCenter / 120);

        list.push(
            <div 
              key={item.id} 
              className={`virtual-item ${isCenter ? 'active' : ''}`}
              style={{ 
                transform: `translateY(${offset}px) scale(${isCenter ? 1.08 : 1})`, 
                opacity,
                filter: `blur(${blur}px)`
              }}
            >
              <div className="item-card">
                <div className="item-name serif-text">{item.name}</div>
                <div className="item-phone">{item.phone}</div>
              </div>
            </div>
        );
    }
    return list;
  }, [startIndex, endIndex, scrollTop, currentCenterIndex]);

  const wpm = Math.abs(Math.round(displayVelocity * 60));
  const progress = (positionRef.current / (LIST_SIZE - 1)) * 100;

  return (
    <div className="lux-console-fullscreen">
      {/* Side: Alphabet Quick-Nav */}
      <nav className="alphabet-bar">
        {ALPHABET.map(letter => (
          <div key={letter} className={`alpha-letter ${letter === currentLetter ? 'active' : ''}`}>
             {letter}
          </div>
        ))}
      </nav>

      {/* Main Container */}
      <div className="console-workspace">
        
        {/* Top: Integrated Status Bar */}
        <header className="console-header-integrated">
          <div className="brand-suite">
            <h1 className="main-title serif-text">Acoustic <span className="accent">Drive</span></h1>
            <div className="id-strip">
              <span className="serial">MOD-5000</span>
              <div className="pulse-container" data-speaking={isSpeaking}>
                <div className="pulse-bar"></div>
                <div className="pulse-bar"></div>
                <div className="pulse-bar"></div>
              </div>
            </div>
          </div>

          <div className="global-stats">
             <div className="stat-blob">
                <span className="label">PEAK</span>
                <span className="value">{peakWpm}</span>
             </div>
             <div className="stat-blob">
                <span className="label">ENCOUNTERS</span>
                <span className="value">{sessionCount}</span>
             </div>
             <div className="stat-blob linked">
                <span className="label">SYSTEM</span>
                <span className="value status" data-linked={audioEnabled}>
                  {audioEnabled ? 'READY' : 'WAIT'}
                </span>
             </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="console-main-layout">
          
          <section className="viewport-primary">
            <div className="viewport-overflow">
              <div className="focal-anchor"></div>
              <div className="list-content-frame">
                {items}
              </div>
              
              {/* Discrete Progress Scrubber */}
              <div className="global-scrubber">
                <div className="scrubber-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <footer className="footer-controls">
              <DriveControls level={level} setLevel={setLevel} />
            </footer>
          </section>

          {/* Right Sidebar: Data Density */}
          <aside className="console-details">
            <div className="metric-panel pulse-aware" data-active={Math.abs(level) > 0}>
              <Gauge size={18} className="icon-gold" />
              <div className="metric-readout">
                <span className="label">Velocity WPM</span>
                <div className="big-num">{wpm}</div>
                <div className="gear-tag">G{Math.abs(level)} • {mode}</div>
              </div>
            </div>

            <div className="config-panel" onClick={() => setMode(m => m === 'linear' ? 'exponential' : 'linear')}>
              <div className="cfg-header">
                <Activity size={14} />
                <span>Physics Mode</span>
              </div>
              <div className="cfg-val">{mode}</div>
            </div>

             <div className="config-panel slider-panel">
               <div className="cfg-header">
                 <Clock size={14} />
                 <span>Sens: {baseSpeed.toFixed(2)}</span>
               </div>
               <input 
                  type="range" min="0.01" max="5.00" step="0.01" 
                  value={baseSpeed} onChange={(e) => setBaseSpeed(parseFloat(e.target.value))} 
                  className="lux-slider-mini"
               />
            </div>

            <div className="history-panel">
               <div className="history-header">
                  <History size={14} />
                  <span>Recent Encounters</span>
               </div>
               <div className="history-list">
                  {history.map((name, i) => (
                    <div key={i} className="history-item">{name}</div>
                  ))}
               </div>
            </div>

            <div className="system-footprint">
               <div className="foot-row">
                 <Layers size={14} />
                 <span>List Depth: {LIST_SIZE}</span>
               </div>
               <div className="foot-row">
                 <Navigation size={14} />
                 <span>Offset: {Math.round(positionRef.current)}</span>
               </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}


