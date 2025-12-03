'use client';

import React, { useState, KeyboardEvent } from 'react';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  maxSkills?: number;
}

const SkillsInput = ({ value = [], onChange, error, maxSkills = 20 }: SkillsInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !value.includes(inputValue.trim())) {
      e.preventDefault();
      if (value.length < maxSkills) {
        onChange([...value, inputValue.trim()]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const handleInputBlur = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim()) && value.length < maxSkills) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  return (
    <div className="form-group mb-6">
      <label className="form-label block mb-2 font-medium text-gray-800 text-[0.95rem]">
        Skills & Technologies
      </label>
      <div className={`form-input w-full min-h-[48px] px-4 py-2 border ${
        error ? "border-red-500" : "border-gray-200"
      } rounded-lg font-['Inter'] text-sm text-gray-800 focus-within:outline-none focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/10 transition-colors flex flex-wrap gap-2 items-center`}>
        {value.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="ml-2 text-indigo-700 hover:text-indigo-900 focus:outline-none"
              aria-label={`Remove ${skill}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </span>
        ))}
        {value.length < maxSkills && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? "Add a skill and press Enter" : ""}
            className="flex-1 min-w-[150px] outline-none bg-transparent text-sm"
          />
        )}
      </div>
      <div className="form-help mt-2 text-sm text-gray-500">
        {value.length < maxSkills
          ? `Add skills by typing and pressing Enter. ${value.length}/${maxSkills} skills added.`
          : `Maximum ${maxSkills} skills reached. Remove a skill to add another.`}
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default SkillsInput;

