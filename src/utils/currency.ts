export interface Currency {
  code: string;        // ISO 4217 code: 'USD', 'EUR', etc.
  symbol: string;      // Display symbol: '$', '€', etc.
  name: string;        // Human-readable name: 'US Dollar', 'Euro'
  position: 'prefix' | 'suffix'; // Symbol position
  locale: string;      // Formatting locale: 'en-US', 'de-DE'
  decimals: number;    // Standard decimal places
}

/**
 * Extensible Currency Registry.
 * Primary currencies at the moment are USD ($) and EUR (€).
 * To add a new currency in the future, simply append a new Currency configuration object to this array.
 */
export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'prefix',
    locale: 'en-US',
    decimals: 2,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'suffix',
    locale: 'de-DE',
    decimals: 2,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'prefix',
    locale: 'en-GB',
    decimals: 2,
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    position: 'prefix',
    locale: 'de-CH',
    decimals: 2,
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    position: 'prefix',
    locale: 'en-CA',
    decimals: 2,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    position: 'prefix',
    locale: 'ja-JP',
    decimals: 0,
  },
];

export const DEFAULT_CURRENCY: Currency = SUPPORTED_CURRENCIES[0]; // USD ($)

const CURRENCY_STORAGE_KEY = 'expense_tracker_currency';

/**
 * Formats any monetary amount according to the chosen currency's locale, symbol, and placement.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: Currency | string = DEFAULT_CURRENCY
): string {
  const curr =
    typeof currency === 'string'
      ? SUPPORTED_CURRENCIES.find(
          (c) => c.code.toUpperCase() === currency.toUpperCase() || c.symbol === currency
        ) || DEFAULT_CURRENCY
      : currency;

  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  try {
    const formattedNum = validAmount.toLocaleString(curr.locale, {
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    });

    return curr.position === 'prefix'
      ? `${curr.symbol}${formattedNum}`
      : `${formattedNum} ${curr.symbol}`;
  } catch {
    // Fallback if locale is unsupported
    const fixed = validAmount.toFixed(curr.decimals);
    return curr.position === 'prefix' ? `${curr.symbol}${fixed}` : `${fixed} ${curr.symbol}`;
  }
}

/**
 * Retrieves the stored currency from localStorage, or defaults to USD ($).
 */
export function getSavedCurrency(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved) {
      const found = SUPPORTED_CURRENCIES.find(
        (c) => c.code.toUpperCase() === saved.toUpperCase() || c.symbol === saved
      );
      if (found) return found;
    }
  } catch (err) {
    console.warn('Unable to retrieve stored currency preference:', err);
  }
  return DEFAULT_CURRENCY;
}

/**
 * Persists the user's currency preference in localStorage.
 */
export function saveCurrency(currencyCode: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
  } catch (err) {
    console.warn('Unable to persist currency preference:', err);
  }
}
