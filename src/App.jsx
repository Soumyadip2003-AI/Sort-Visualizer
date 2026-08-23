import { useState, useEffect, useRef } from 'react';
import './App.css';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort } from './utils/sortingAlgorithms';

const ALGORITHMS = {
  'Bubble': bubbleSort,
  'Selection': selectionSort,
  'Insertion': insertionSort,
  'Merge': mergeSort,
  'Quick': quickSort,
  'Heap': heapSort,
};

function App() {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50); // 1 to 100
  const [algorithm, setAlgorithm] = useState('Quick');
  const [isSorting, setIsSorting] = useState(false);
  
  const [barStates, setBarStates] = useState([]); // Array of strings: 'unsorted', 'comparing', 'swapping', 'sorted', 'pivot'
  
  // Stats
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [currentOperation, setCurrentOperation] = useState('Ready to sort');

  // Refs for intervals and animation
  const animationRef = useRef(null);
  const timerRef = useRef(null);
  const speedRef = useRef(speed);
  const stopRef = useRef(false);
  speedRef.current = speed;

  useEffect(() => {
    resetArray();
  }, [arraySize]);

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

    for (let step of gen) {
      if (stopRef.current) break;
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
        
        let temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
        
        runningSwaps++;
        setSwaps(runningSwaps);
        setCurrentOperation(`Swapping elements at index ${i} and ${j}`);
      } else if (step.type === 'overwrite') {
        const [i] = step.indices;
        newStates[i] = 'swapping';
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
      
      await sleep(getDelay());
    }

    // Ensure all are green at the end
    if (!stopRef.current) setBarStates(new Array(arraySize).fill('sorted'));
    setIsSorting(false);
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
      default: return { time: '-', space: '-' };
    }
  };

  const complexity = getAlgorithmComplexity();

  return (
    <div className="app-container">
      {/* TOP BAR */}
      <header className="panel top-bar">
        <div className="brand">
          <h1>SORTLAB</h1>
        </div>
        <div className="controls">
          <div className="control-group">
            <label>Array Size: <span className="mono">{arraySize}</span></label>
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
          <button className="btn-secondary" onClick={resetArray} disabled={isSorting}>
            ↻ Reset
          </button>
          {isSorting ? (
            <button className="btn-primary" style={{backgroundColor: 'var(--bar-swapping)'}} onClick={stopSort}>
              ■ Stop
            </button>
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
      </footer>
    </div>
  );
}

export default App;
