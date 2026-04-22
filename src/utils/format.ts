/**
 * Formats a number with a thousands separator based on the user's locale.
 * Default is 'de-CH' or 'en-US' style depending on browser settings, 
 * but consistently provides a separator for large numbers.
 * 
 * @param value The number to format
 * @param maximumFractionDigits Optional maximum number of fraction digits (default 1)
 * @returns The formatted string
 */
export const formatNumber = (value: number | string, maximumFractionDigits = 1): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    
    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits,
    }).format(num);
};

/**
 * Formats a weight value specifically, often used for volume or 1RM.
 */
export const formatWeight = (value: number | string): string => {
    return formatNumber(value, 1);
};

/**
 * Formats a count value (like reps) which usually shouldn't have decimals.
 */
export const formatCount = (value: number | string): string => {
    return formatNumber(value, 0);
};
/**
 * Returns the current date and time in a format suitable for HTML5 input fields.
 */
export const getDefaultDateTime = () => {
    const now = new Date();
    return {
        date: now.toISOString().split('T')[0],
        time: `${now.getHours().toString().padStart(2, '0')}:00`
    };
};
