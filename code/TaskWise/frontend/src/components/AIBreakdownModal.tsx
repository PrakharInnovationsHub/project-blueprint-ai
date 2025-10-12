import { useState } from 'react';
import { X, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import groqAI from '../services/groqAIService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (subtasks: string[]) => void;
  taskTitle: string;
  taskDescription: string;
}

export default function AIBreakdownModal({ isOpen, onClose, onApply, taskTitle, taskDescription }: Props) {
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [aiInfo] = useState(groqAI.getAPIInfo());

  const handleAIBreakdown = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use real Groq AI if API key is set, otherwise smart mock
      const breakdown = await groqAI.breakdownTask(taskTitle, taskDescription);
      
      setSubtasks(breakdown.subtasks);
      
      if (aiInfo.enabled) {
        toast.success('🚀 Groq AI breakdown generated in milliseconds!', {
          icon: '⚡',
          duration: 3000,
        });
      } else {
        toast.success('AI breakdown generated! (Demo Mode)', {
          icon: '💡',
          duration: 3000,
        });
      }
    } catch (err) {
      setError('Failed to generate breakdown. Please try again.');
      toast.error('AI breakdown failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Task Breakdown</h2>
              <p className="text-sm text-gray-600">Let AI break this down into smaller steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Task Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Task to break down:</h3>
            <p className="text-lg font-medium text-gray-900">{taskTitle}</p>
            {taskDescription && (
              <p className="text-sm text-gray-600 mt-2">{taskDescription}</p>
            )}
          </div>

          {/* AI Info Box */}
          <div className={`border rounded-lg p-4 flex gap-3 ${
            aiInfo.enabled 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              aiInfo.enabled ? 'text-green-600' : 'text-blue-600'
            }`} />
            <div className={`text-sm ${aiInfo.enabled ? 'text-green-900' : 'text-blue-900'}`}>
              {aiInfo.enabled ? (
                <>
                  <p className="font-medium mb-1">⚡ Groq AI Enabled - Ultra Fast!</p>
                  <p>Using {aiInfo.model} • {aiInfo.speed} • {aiInfo.freeLimit}</p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">💡 Demo Mode - Smart Mock AI</p>
                  <p>Add VITE_GROQ_API_KEY to .env for FREE ultra-fast Groq AI! Get your key at console.groq.com</p>
                </>
              )}
            </div>
          </div>

          {/* Generate Button */}
          {subtasks.length === 0 && (
            <button
              onClick={handleAIBreakdown}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing task with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Breakdown
                </>
              )}
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Subtasks List */}
          {subtasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  AI Generated Subtasks ({subtasks.length})
                </h3>
                <button
                  onClick={handleAIBreakdown}
                  disabled={loading}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
              
              <div className="space-y-2">
                {subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{subtask}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Apply Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    onApply(subtasks);
                    toast.success('Subtasks added to description!');
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Apply Subtasks
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Demo Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
            <p className="font-medium">🎯 Demo Mode Active</p>
            <p className="mt-1">This is using intelligent mock AI. To use real AI, add OpenAI or Google Gemini API key. See AI-FEATURES-GUIDE.md for setup.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
