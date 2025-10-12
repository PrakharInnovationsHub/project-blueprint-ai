import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  taskId?: string;
  taskTitle?: string;
}

export default function PomodoroTimer({ taskTitle }: Props) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
  
  // Mode settings with durations in SECONDS for demo, MINUTES for normal
  const modeSettings = isDemoMode ? {
    work: { duration: 15, label: 'Focus Time (Demo)', color: 'bg-red-500', icon: Target, isSeconds: true },
    break: { duration: 9, label: 'Short Break (Demo)', color: 'bg-green-500', icon: Coffee, isSeconds: true },
    longBreak: { duration: 18, label: 'Long Break (Demo)', color: 'bg-blue-500', icon: Coffee, isSeconds: true }
  } : {
    work: { duration: 25, label: 'Focus Time', color: 'bg-red-500', icon: Target, isSeconds: false },
    break: { duration: 5, label: 'Short Break', color: 'bg-green-500', icon: Coffee, isSeconds: false },
    longBreak: { duration: 15, label: 'Long Break', color: 'bg-blue-500', icon: Coffee, isSeconds: false }
  };

  const currentMode = modeSettings[mode];
  
  // Initialize time based on mode (seconds for demo, minutes for normal)
  const getInitialTime = () => {
    if (currentMode.isSeconds) {
      return { minutes: 0, seconds: currentMode.duration };
    } else {
      return { minutes: currentMode.duration, seconds: 0 };
    }
  };

  const [minutes, setMinutes] = useState(getInitialTime().minutes);
  const [seconds, setSeconds] = useState(getInitialTime().seconds);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    
    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Switch to break
      if (newCount % 4 === 0) {
        switchMode('longBreak');
        toast.success('Great work! Take a long break! 🎉');
      } else {
        switchMode('break');
        toast.success('Pomodoro complete! Take a short break! ☕');
      }
    } else {
      switchMode('work');
      toast.success('Break over! Ready to focus? 💪');
    }
  };

  const playSound = () => {
    // Play a simple beep sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvfYiTYIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBSqAzvfXiDcIHm3A7OWhTwwOT6vo86xfFQlAl+Duu2kfBQ==');
    audio.play().catch(() => {
      // Silent fail if audio doesn't play
    });
  };

  const switchMode = (newMode: 'work' | 'break' | 'longBreak') => {
    setMode(newMode);
    const newModeSettings = isDemoMode ? {
      work: { duration: 15, isSeconds: true },
      break: { duration: 9, isSeconds: true },
      longBreak: { duration: 18, isSeconds: true }
    } : {
      work: { duration: 25, isSeconds: false },
      break: { duration: 5, isSeconds: false },
      longBreak: { duration: 15, isSeconds: false }
    };
    
    const newSettings = newModeSettings[newMode];
    if (newSettings.isSeconds) {
      setMinutes(0);
      setSeconds(newSettings.duration);
    } else {
      setMinutes(newSettings.duration);
      setSeconds(0);
    }
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const current = modeSettings[mode];
    if (current.isSeconds) {
      setMinutes(0);
      setSeconds(current.duration);
    } else {
      setMinutes(current.duration);
      setSeconds(0);
    }
  };

  // Calculate progress
  const totalSeconds = currentMode.isSeconds ? currentMode.duration : currentMode.duration * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  return (
    <div className="card bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pomodoro Timer
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newDemoMode = !isDemoMode;
              setIsDemoMode(newDemoMode);
              
              // Set initial time based on new mode
              if (newDemoMode) {
                // Switching to demo mode - 15 seconds
                setMinutes(0);
                setSeconds(15);
              } else {
                // Switching to normal mode - 25 minutes
                setMinutes(25);
                setSeconds(0);
              }
              setIsActive(false);
              toast.success(newDemoMode ? '⚡ Demo Mode: 15-second intervals!' : '✅ Normal Mode: 25-minute intervals');
            }}
            className={`px-3 py-1 text-xs rounded font-medium ${
              isDemoMode 
                ? 'bg-yellow-500 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={isDemoMode ? 'Switch to Normal Mode (25 min)' : 'Switch to Demo Mode (15 sec)'}
          >
            {isDemoMode ? '⚡ Demo' : '🕐 Normal'}
          </button>
          <button
            onClick={() => switchMode('work')}
            className={`px-3 py-1 text-xs rounded ${mode === 'work' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-3 py-1 text-xs rounded ${mode === 'break' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Break
          </button>
        </div>
      </div>

      {isDemoMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900 font-medium">
            ⚡ Demo Mode Active: Work = 15s, Break = 9s, Long Break = 18s
          </p>
        </div>
      )}

      {taskTitle && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Working on:</span> {taskTitle}
          </p>
        </div>
      )}

      <div className="relative mb-6">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className={`${currentMode.color.replace('bg-', 'text-')} transition-all duration-1000`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className={`text-sm font-medium ${currentMode.color.replace('bg-', 'text-')}`}>
              {currentMode.label}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={toggleTimer}
          className={`${currentMode.color} text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition`}
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{completedPomodoros}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{Math.floor(completedPomodoros / 4)}</div>
          <div className="text-xs text-gray-600">Cycles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {isDemoMode ? Math.round(completedPomodoros * 0.25) : completedPomodoros * 25}
          </div>
          <div className="text-xs text-gray-600">{isDemoMode ? 'Seconds' : 'Minutes'}</div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded ${
              i < (completedPomodoros % 4) ? currentMode.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
