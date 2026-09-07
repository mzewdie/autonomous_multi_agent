import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Coins } from 'lucide-react';
import { Currency, SUPPORTED_CURRENCIES } from '../utils/currency';

interface CurrencySelectorProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  onCurrencyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const mainCurrencies = SUPPORTED_CURRENCIES.slice(0, 2); // USD ($) and EUR (€)
  const additionalCurrencies = SUPPORTED_CURRENCIES.slice(2); // Extensible future currencies

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="btn-currency-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
        title="Change application display currency"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
          {currentCurrency.symbol}
        </span>
        <span className="font-mono text-slate-700">{currentCurrency.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
              <Coins className="w-3 h-3 text-slate-400" />
              <span>Select Currency</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Extensible</span>
          </div>

          {/* Primary Currencies ($ and €) */}
          <div className="px-2 py-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 block">
              Primary
            </span>
            {mainCurrencies.map((curr) => {
              const isSelected = curr.code === currentCurrency.code;
              return (
                <button
                  key={curr.code}
                  id={`currency-option-${curr.code}`}
                  onClick={() => {
                    onCurrencyChange(curr);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-xs">
                      {curr.symbol}
                    </span>
                    <span>{curr.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          {/* Extensible Additional Currencies */}
          {additionalCurrencies.length > 0 && (
            <div className="border-t border-slate-100 px-2 py-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 block">
                Additional / Future
              </span>
              {additionalCurrencies.map((curr) => {
                const isSelected = curr.code === currentCurrency.code;
                return (
                  <button
                    key={curr.code}
                    id={`currency-option-${curr.code}`}
                    onClick={() => {
                      onCurrencyChange(curr);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-xs">
                        {curr.symbol}
                      </span>
                      <span>{curr.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
