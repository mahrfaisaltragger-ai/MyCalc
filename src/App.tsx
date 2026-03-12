import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import { 
  History, 
  Trash2, 
  Sparkles, 
  Delete, 
  RotateCcw, 
  ChevronRight, 
  MessageSquare,
  Cpu,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { processMathQuery } from './services/geminiService';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isAI?: boolean;
  explanation?: string;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [memory, setMemory] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleNumber = (num: string) => {
    if (display === '0' || lastResult === display) {
      setDisplay(num);
      setLastResult(null);
    } else {
      setDisplay(display + num);
    }
    setExpression(expression + num);
  };

  const handleOperator = (op: string) => {
    setLastResult(null);
    setExpression(expression + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleScientific = (func: string) => {
    setExpression(expression + func + '(');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = math.evaluate(expression);
      const resultStr = result.toString();
      
      const newHistory: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression,
        result: resultStr,
        timestamp: Date.now(),
      };

      setHistory([newHistory, ...history]);
      setDisplay(resultStr);
      setExpression(resultStr);
      setLastResult(resultStr);
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setLastResult(null);
  };

  const backspace = () => {
    if (expression.length > 0) {
      const newExpr = expression.trimEnd().slice(0, -1);
      setExpression(newExpr);
      setDisplay(newExpr.split(' ').pop() || '0');
    }
  };

  const handleAIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAIProcessing(true);
    try {
      const data = await processMathQuery(aiQuery);
      let result = '';
      
      try {
        result = math.evaluate(data.expression).toString();
      } catch (e) {
        result = data.result || 'Could not evaluate';
      }

      const newHistory: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression: aiQuery,
        result: result,
        timestamp: Date.now(),
        isAI: true,
        explanation: data.explanation
      };

      setHistory([newHistory, ...history]);
      setDisplay(result);
      setExpression(result);
      setAiQuery('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleMemory = (action: 'M+' | 'M-' | 'MR' | 'MC') => {
    const currentVal = parseFloat(display);
    switch (action) {
      case 'M+': setMemory(memory + currentVal); break;
      case 'M-': setMemory(memory - currentVal); break;
      case 'MR': setDisplay(memory.toString()); setExpression(expression + memory.toString()); break;
      case 'MC': setMemory(0); break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Calculator Unit */}
        <div className="lg:col-span-7 bg-[#151619] rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-bottom border-white/5 flex items-center justify-between bg-[#1a1b1e]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest">System Active</span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-[#8E9299] hover:text-white transition-colors"
                title="History"
              >
                <History size={16} />
              </button>
              <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest">Model: Gemini-3-Flash</span>
            </div>
          </div>

          {/* Display Area */}
          <div className="p-6 calculator-screen flex flex-col items-end justify-end min-h-[160px] gap-2">
            <div className="text-[#8E9299] font-mono text-sm truncate w-full text-right h-6">
              {expression || ' '}
            </div>
            <div className="text-white font-mono text-5xl font-light tracking-tighter overflow-x-auto whitespace-nowrap w-full text-right scrollbar-hide">
              {display}
            </div>
          </div>

          {/* Keypad */}
          <div className="p-6 grid grid-cols-5 gap-2 bg-[#151619]">
            {/* Scientific Row 1 */}
            <button onClick={() => handleScientific('sin')} className="btn-calc btn-scientific">sin</button>
            <button onClick={() => handleScientific('cos')} className="btn-calc btn-scientific">cos</button>
            <button onClick={() => handleScientific('tan')} className="btn-calc btn-scientific">tan</button>
            <button onClick={() => handleScientific('log')} className="btn-calc btn-scientific">log</button>
            <button onClick={() => handleScientific('sqrt')} className="btn-calc btn-scientific">√</button>

            {/* Scientific Row 2 */}
            <button onClick={() => handleScientific('asin')} className="btn-calc btn-scientific">sin⁻¹</button>
            <button onClick={() => handleScientific('acos')} className="btn-calc btn-scientific">cos⁻¹</button>
            <button onClick={() => handleScientific('atan')} className="btn-calc btn-scientific">tan⁻¹</button>
            <button onClick={() => handleScientific('ln')} className="btn-calc btn-scientific">ln</button>
            <button onClick={() => handleOperator('^')} className="btn-calc btn-scientific">xʸ</button>

            {/* Memory Row */}
            <button onClick={() => handleMemory('MC')} className="btn-calc btn-action text-[10px]">MC</button>
            <button onClick={() => handleMemory('MR')} className="btn-calc btn-action text-[10px]">MR</button>
            <button onClick={() => handleMemory('M+')} className="btn-calc btn-action text-[10px]">M+</button>
            <button onClick={() => handleMemory('M-')} className="btn-calc btn-action text-[10px]">M-</button>
            <button onClick={clear} className="btn-calc bg-red-900/40 text-red-400 hover:bg-red-900/60">AC</button>

            {/* Main Pad */}
            <button onClick={() => handleNumber('7')} className="btn-calc btn-number h-14 text-xl">7</button>
            <button onClick={() => handleNumber('8')} className="btn-calc btn-number h-14 text-xl">8</button>
            <button onClick={() => handleNumber('9')} className="btn-calc btn-number h-14 text-xl">9</button>
            <button onClick={() => handleOperator('/')} className="btn-calc btn-operator h-14 text-xl">÷</button>
            <button onClick={backspace} className="btn-calc btn-action h-14"><Delete size={20} /></button>

            <button onClick={() => handleNumber('4')} className="btn-calc btn-number h-14 text-xl">4</button>
            <button onClick={() => handleNumber('5')} className="btn-calc btn-number h-14 text-xl">5</button>
            <button onClick={() => handleNumber('6')} className="btn-calc btn-number h-14 text-xl">6</button>
            <button onClick={() => handleOperator('*')} className="btn-calc btn-operator h-14 text-xl">×</button>
            <button onClick={() => handleNumber('(')} className="btn-calc btn-action h-14 text-xl">(</button>

            <button onClick={() => handleNumber('1')} className="btn-calc btn-number h-14 text-xl">1</button>
            <button onClick={() => handleNumber('2')} className="btn-calc btn-number h-14 text-xl">2</button>
            <button onClick={() => handleNumber('3')} className="btn-calc btn-number h-14 text-xl">3</button>
            <button onClick={() => handleOperator('-')} className="btn-calc btn-operator h-14 text-xl">−</button>
            <button onClick={() => handleNumber(')')} className="btn-calc btn-action h-14 text-xl">)</button>

            <button onClick={() => handleNumber('0')} className="btn-calc btn-number h-14 text-xl">0</button>
            <button onClick={() => handleNumber('.')} className="btn-calc btn-number h-14 text-xl">.</button>
            <button onClick={() => handleScientific('exp')} className="btn-calc btn-scientific h-14 text-xl">exp</button>
            <button onClick={() => handleOperator('+')} className="btn-calc btn-operator h-14 text-xl">+</button>
            <button onClick={calculate} className="btn-calc btn-equal h-14 text-xl">=</button>
          </div>
        </div>

        {/* AI Assistant & History Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Input Card */}
          <div className="bg-[#151619] rounded-2xl p-6 shadow-xl border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Sparkles className="text-orange-500" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">AI Math Assistant</h3>
                <p className="text-[10px] text-[#8E9299] uppercase tracking-wider">Natural Language Processing</p>
              </div>
            </div>

            <form onSubmit={handleAIQuery} className="relative">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask a math question... (e.g., 'What is the volume of a sphere with radius 5?')"
                className="w-full bg-[#1a1b1e] border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-[#8E9299] focus:outline-none focus:border-orange-500/50 min-h-[100px] resize-none"
              />
              <button
                type="submit"
                disabled={isAIProcessing || !aiQuery.trim()}
                className={cn(
                  "absolute bottom-4 right-4 p-2 rounded-lg transition-all",
                  isAIProcessing ? "bg-orange-500/20 text-orange-500" : "bg-orange-500 text-white hover:bg-orange-400"
                )}
              >
                {isAIProcessing ? (
                  <RotateCcw className="animate-spin" size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </form>

            <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
              <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-400/80 leading-relaxed">
                Try asking for unit conversions, geometry problems, or step-by-step calculations.
              </p>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-[#151619] rounded-2xl flex-1 shadow-xl border border-white/5 flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1a1b1e]">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#8E9299]" />
                <span className="text-xs font-medium text-white uppercase tracking-wider">Calculation History</span>
              </div>
              <button 
                onClick={() => setHistory([])}
                className="text-[#8E9299] hover:text-red-400 transition-colors"
                title="Clear History"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
              <AnimatePresence initial={false}>
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#8E9299] gap-2 opacity-50">
                    <Cpu size={32} />
                    <span className="text-xs font-mono uppercase tracking-widest">No Data Logged</span>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        item.isAI ? "bg-orange-500/5 border-orange-500/20" : "bg-white/5 border-white/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono text-[#8E9299] uppercase">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                        {item.isAI && (
                          <div className="flex items-center gap-1">
                            <Sparkles size={10} className="text-orange-500" />
                            <span className="text-[9px] font-mono text-orange-500 uppercase">AI Computed</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#8E9299] font-mono mb-1 truncate">
                        {item.expression}
                      </div>
                      <div className="text-white font-mono text-lg flex items-center justify-between">
                        <span className="text-[#8E9299] mr-2">=</span>
                        <span className="truncate">{item.result}</span>
                      </div>
                      {item.explanation && (
                        <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-[#8E9299] italic leading-relaxed">
                          {item.explanation}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d2f34;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3c42;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
