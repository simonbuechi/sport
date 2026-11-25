/**
 * Formats a number with a thousands separator based on the user's locale.
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
 * Parses an ISO date string (YYYY-MM-DD or full ISO timestamp) into a local Date
 * without shifting YYYY-MM-DD backward by one day in negative UTC offsets.
 */
export const parseLocalDate = (dateStr: string): Date => {
    const trimmed = dateStr.trim();
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]) - 1;
        const day = Number(dateOnlyMatch[3]);
        return new Date(year, month, day);
    }
    return new Date(trimmed);
};

/**
 * Returns the current date and time in a format suitable for HTML5 input fields.
 */
export const getDefaultDateTime = () => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:00`
    };
};
