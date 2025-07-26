'use client';

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PollOption {
  id: number;
  text: string;
}

export default function PollModal({ isOpen, onClose }: PollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [pollLength, setPollLength] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, { id: Date.now(), text: '' }]);
    }
  };

  const removeOption = (id: number) => {
    if (options.length > 2) {
      setOptions(options.filter((option) => option.id !== id));
    }
  };

  const updateOption = (id: number, text: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, text } : option)));
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.some((opt) => !opt.text.trim())) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onClose();
    setQuestion('');
    setOptions([
      { id: 1, text: '' },
      { id: 2, text: '' },
    ]);
    setPollLength(7);
  };

  return (
    <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Create a Poll</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close poll modal"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="poll-question">
              Poll Question
            </label>
            <input
              id="poll-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Poll question input"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Choices</h3>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 mb-3">
                <input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label={`Poll choice ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(option.id)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                    aria-label={`Remove choice ${index + 1}`}
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <button
                onClick={addOption}
                className="text-violet-500 text-sm font-medium hover:text-violet-600 transition-colors"
                aria-label="Add another choice"
              >
                + Add another choice
              </button>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="poll-length">
              Poll Length
            </label>
            <select
              id="poll-length"
              value={pollLength}
              onChange={(e) => setPollLength(Number(e.target.value))}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Poll duration"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>1 week</option>
              <option value={14}>2 weeks</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || options.some((opt) => !opt.text.trim()) || isSubmitting}
            className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
              question.trim() && options.every((opt) => opt.text.trim()) && !isSubmitting
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Create poll"
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  );
}