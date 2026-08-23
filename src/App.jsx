import { useState, useEffect, useRef } from 'react';
import './App.css';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort, shellSort, countingSort, radixSort } from './utils/sortingAlgorithms';

const ALGORITHMS = {
  'Bubble': bubbleSort,
  'Selection': selectionSort,
  'Insertion': insertionSort,
  'Merge': mergeSort,
  'Quick': quickSort,
  'Heap': heapSort,
  'Shell': shellSort,
  'Counting': countingSort,
  'Radix': radixSort
};

function SortVisualizer({ title = 'SORTLAB' }) {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50); // 1 to 100
  const [algorithm, setAlgorithm] = useState('Quick');
  const [isSorting, setIsSorting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [barStates, setBarStates] = useState([]); // Array of strings: 'unsorted', 'comparing', 'swapping', 'sorted', 'pivot'
  
  // Stats
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [currentOperation, setCurrentOperation] = useState('Ready to sort');

  // New features state
  const [customInput, setCustomInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Refs for intervals and animation
  const timerRef = useRef(null);
  const speedRef = useRef(speed);
  const stopRef = useRef(false);
  
  const isPausedRef = useRef(false);
  const nextStepRef = useRef(false);
  
  speedRef.current = speed;
  isPausedRef.current = isPaused;

  useEffect(() => {
    resetArray();
  }, [arraySize]);

  useEffect(() => {
    document.body.className = isDarkMode ? '' : 'light-theme';
  }, [isDarkMode]);

  useEffect(() => {
    if (isSorting && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 50);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSorting, startTime]);

  const resetArray = () => {
    if (isSorting) return;
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 90) + 10); // 10 to 100
    }
    setArray(newArray);
    setBarStates(new Array(arraySize).fill('unsorted'));
    setComparisons(0);
    setSwaps(0);
    setElapsedTime(0);
    setCurrentOperation('Ready to sort');
  };

  const getDelay = () => {
    // Speed 1 -> 500ms, Speed 100 -> 1ms
    return 500 - (speedRef.current * 4.99); 
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const audioCtxRef = useRef(null);
  const playBeep = (val) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      osc.frequency.value = 200 + (val * 5);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const handleCustomInput = () => {
    if (isSorting) return;
    const vals = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (vals.length > 0) {
      setArray(vals);
      setArraySize(vals.length);
      setBarStates(new Array(vals.length).fill('unsorted'));
      setComparisons(0);
      setSwaps(0);
      setElapsedTime(0);
      setCurrentOperation('Ready to sort custom array');
    }
  };

  const runSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    stopRef.current = false;
    setComparisons(0);
    setSwaps(0);
    setStartTime(Date.now());
    
    // Reset bar states to unsorted before starting
    setBarStates(new Array(arraySize).fill('unsorted'));

    const gen = ALGORITHMS[algorithm](array);
    let newArray = [...array];
    let newStates = new Array(arraySize).fill('unsorted');

    let runningComparisons = 0;
    let runningSwaps = 0;
    let finalTime = 0;
    const startT = Date.now();

    for (let step of gen) {
      if (stopRef.current) break;
      while (isPausedRef.current && !nextStepRef.current && !stopRef.current) {
        await sleep(50);
      }
      nextStepRef.current = false;
      
      // Clear previous transient states (comparing, swapping, pivot) 
      // but keep 'sorted'
      newStates = newStates.map(s => s === 'sorted' ? 'sorted' : 'unsorted');

      if (step.type === 'compare') {
        const [i, j] = step.indices;
        newStates[i] = 'comparing';
        if (j !== undefined) newStates[j] = 'comparing';
        runningComparisons++;
        setComparisons(runningComparisons);
        setCurrentOperation(`Comparing elements at index ${i} and ${j}`);
      } else if (step.type === 'swap') {
        const [i, j] = step.indices;
        newStates[i] = 'swapping';
        newStates[j] = 'swapping';
        playBeep(newArray[i]);
        
        let temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
        
        runningSwaps++;
        setSwaps(runningSwaps);
        setCurrentOperation(`Swapping elements at index ${i} and ${j}`);
      } else if (step.type === 'overwrite') {
        const [i] = step.indices;
        newStates[i] = 'swapping';
        playBeep(step.value);
        newArray[i] = step.value;
        setCurrentOperation(`Overwriting element at index ${i}`);
      } else if (step.type === 'pivot') {
        const [i] = step.indices;
        newStates[i] = 'pivot';
        setCurrentOperation(`Setting pivot at index ${i}`);
      } else if (step.type === 'sorted') {
        const [i] = step.indices;
        newStates[i] = 'sorted';
      }

      setBarStates([...newStates]);
      setArray([...newArray]);
      finalTime = Date.now() - startT;
      
      await sleep(getDelay());
    }

    // Ensure all are green at the end
    if (!stopRef.current) {
      setBarStates(new Array(arraySize).fill('sorted'));
      setHistory(h => [...h, { algo: algorithm, time: finalTime, size: arraySize }]);
    }
    setIsSorting(false);
    setIsPaused(false);
    setCurrentOperation(stopRef.current ? 'Stopped' : 'Sort complete');
  };

  const stopSort = () => {
    stopRef.current = true;
  };

  const getAlgorithmComplexity = () => {
    switch(algorithm) {
      case 'Bubble': return { time: 'O(n²)', space: 'O(1)' };
      case 'Selection': return { time: 'O(n²)', space: 'O(1)' };
      case 'Insertion': return { time: 'O(n²)', space: 'O(1)' };
      case 'Merge': return { time: 'O(n log n)', space: 'O(n)' };
      case 'Quick': return { time: 'O(n log n)', space: 'O(log n)' };
      case 'Heap': return { time: 'O(n log n)', space: 'O(1)' };
      case 'Shell': return { time: 'O(n log n)', space: 'O(1)' };
      case 'Counting': return { time: 'O(n + k)', space: 'O(k)' };
      case 'Radix': return { time: 'O(nk)', space: 'O(n + k)' };
      default: return { time: '-', space: '-' };
    }
  };

  const complexity = getAlgorithmComplexity();

  return (
    <div className="app-container" style={{ flex: 1, minWidth: '300px' }}>
      {/* TOP BAR */}
      <header className="panel top-bar">
        <div className="brand">
          <h1>{title}</h1>
        </div>
        <div className="controls">
          <div className="control-group">
            <label>Custom Array:</label>
            <input 
              type="text" 
              placeholder="10,20,30..." 
              value={customInput} 
              onChange={e => setCustomInput(e.target.value)}
              style={{ width: '80px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)' }}
              disabled={isSorting}
            />
            <button className="btn-secondary" onClick={handleCustomInput} disabled={isSorting}>Set</button>
          </div>
          <div className="control-group">
            <label>Size: <span className="mono">{arraySize}</span></label>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={arraySize} 
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              disabled={isSorting}
            />
          </div>
          <div className="control-group">
            <label>Speed: <span className="mono">{speed}</span></label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={speed} 
              onChange={(e) => setSpeed(parseInt(e.target.value))}
            />
          </div>
          <button className="btn-secondary" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? '🔊 On' : '🔇 Off'}
          </button>
          <button className="btn-secondary" onClick={resetArray} disabled={isSorting}>
            ↻ Reset
          </button>
          <button className="btn-secondary" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀ Light' : '🌙 Dark'}
          </button>
          {isSorting ? (
            <>
              <button className="btn-secondary" onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              {isPaused && (
                <button className="btn-secondary" onClick={() => nextStepRef.current = true}>
                  ⏭ Step
                </button>
              )}
              <button className="btn-primary" style={{backgroundColor: 'var(--bar-swapping)'}} onClick={stopSort}>
                ■ Stop
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={runSort}>
              ▶ Visualize
            </button>
          )}
        </div>
      </header>

      <div className="main-content">
        {/* SIDEBAR */}
        <aside className="panel sidebar">
          <h2 className="section-title">ALGORITHMS</h2>
          <div className="algo-list">
            {Object.keys(ALGORITHMS).map(algo => (
              <button 
                key={algo}
                className={`algo-btn ${algorithm === algo ? 'active' : ''}`}
                onClick={() => { stopSort(); setAlgorithm(algo); }}
              >
                <span className="radio-icon">{algorithm === algo ? '●' : '○'}</span>
                {algo} Sort
              </button>
            ))}
          </div>
          
          <div className="educational-panel">
            <h2 className="section-title">DETAILS</h2>
            <div className="detail-row">
              <span className="label">Complexity:</span>
              <span className="value mono">{complexity.time}</span>
            </div>
            <div className="detail-row">
              <span className="label">Space:</span>
              <span className="value mono">{complexity.space}</span>
            </div>
            <div className="current-op mono">
              {currentOperation}
            </div>
            
            {history.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PERFORMANCE HISTORY</h3>
                {history.slice(-3).map((h, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    {h.algo}({h.size}): <span className="mono">{h.time}ms</span>
                    <div style={{ height: '4px', background: 'var(--accent)', width: `${Math.min(100, h.time / 20)}%` }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* VISUALIZER */}
        <main className="panel visualizer-container">
          <div className="bars-wrapper">
            {array.map((val, idx) => (
              <div 
                key={idx}
                className={`array-bar state-${barStates[idx]}`}
                style={{
                  height: `${val}%`,
                  width: `${100 / arraySize}%`
                }}
              ></div>
            ))}
          </div>
        </main>
      </div>

      {/* STATS BAR */}
      <footer className="panel stats-bar">
        <div className="stat">
          <span className="label">Comparisons</span>
          <span className="value mono">{comparisons}</span>
        </div>
        <div className="stat">
          <span className="label">Swaps</span>
          <span className="value mono">{swaps}</span>
        </div>
        <div className="stat">
          <span className="label">Time</span>
          <span className="value mono">{(elapsedTime / 1000).toFixed(2)}s</span>
        </div>
        <div className="stat">
          <span className="label">Complexity</span>
          <span className="value mono">{complexity.time}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--bar-comparing)' }}></span>
            <span className="label">Comparing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--bar-swapping)' }}></span>
            <span className="label">Swapping</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--bar-sorted)' }}></span>
            <span className="label">Sorted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SortVisualizer;

