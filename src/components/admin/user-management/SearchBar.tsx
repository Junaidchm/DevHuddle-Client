import React from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <div className="w-full sm:w-[300px]">
      <div className="relative w-full">
        <button className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          <i className="fas fa-search"></i>
        </button>
        <input
          type="text"
          className="w-full p-2 pl-8 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-800 outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)] transition-all duration-300"
          placeholder="Search users..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;