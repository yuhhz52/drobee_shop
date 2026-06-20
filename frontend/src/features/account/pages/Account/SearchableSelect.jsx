import React, { useCallback, useEffect, useRef, useState } from 'react';
import './SearchableSelect.css';

const SearchableSelect = ({
  options = [],
  value = '',
  displayName = '',
  onChange,
  onSelect,
  placeholder = 'Search...',
  disabled = false,
  required = false,
  name = '',
  filterFn,
  loading = false
}) => {
  const [inputValue, setInputValue] = useState(displayName);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (displayName !== inputValue && !isOpen) {
      setInputValue(displayName);
    }
  }, [displayName, isOpen]);

  useEffect(() => {
    const filtered = filterFn ? filterFn(options, inputValue) : options.slice(0, 10);
    setFilteredOptions(filtered);
  }, [options, inputValue, filterFn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback((option) => {
    setInputValue(option.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  }, [onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const selectedIndex = filteredOptions.findIndex(o => String(o.code) === String(value));
      const nextIndex = selectedIndex < filteredOptions.length - 1 ? selectedIndex + 1 : 0;
      if (filteredOptions[nextIndex]) {
        handleSelect(filteredOptions[nextIndex]);
      }
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const selectedIndex = filteredOptions.findIndex(o => String(o.code) === String(value));
      const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredOptions.length - 1;
      if (filteredOptions[prevIndex]) {
        handleSelect(filteredOptions[prevIndex]);
      }
    }
  }, [filteredOptions, handleSelect, isOpen, value]);

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="searchable-select__input"
        autoComplete="off"
      />
      
      {loading && (
        <div className="searchable-select__spinner">
          <span className="searchable-select__spinner-icon"></span>
        </div>
      )}

      {isOpen && !disabled && (
        <div className="searchable-select__dropdown">
          {filteredOptions.length === 0 ? (
            <div className="searchable-select__empty">
              {loading ? 'Loading...' : 'No results found'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.code}
                className={`searchable-select__option ${String(option.code) === String(value) ? 'is-selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
