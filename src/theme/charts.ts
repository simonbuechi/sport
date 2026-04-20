import type { Theme } from '@mui/material/styles';
import type { LineChartProps } from '@mui/x-charts/LineChart';

/**
 * Common chart configuration and standards
 */
export const getChartDefaults = (theme: Theme): Partial<LineChartProps> => ({
    margin: { top: 20, right: 20, bottom: 50, left: 50 },
    slotProps: {
        area: {
            fillOpacity: 0.15,
        },
    },
    // Standard color palette based on theme
    colors: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.success.main,
    ],
    sx: {
        '& .MuiChartsLegend-root': {
            display: 'none',
        },
        '& .MuiAreaElement-root': {
            opacity: 0.15,
            fillOpacity: 0.15,
        },
        '& .MuiLineElement-root': {
            strokeWidth: 1,
        },
        '& .MuiMarkElement-root': {
            display: 'none',
        },
        '& .MuiMarkElement-highlighted': {
            transform: 'scale(1)',
            transformBox: 'fill-box',
            transformOrigin: 'center',
        },
    },
});

/**
 * Standard date formatter for X-axis
 */
export const xAxisDateFormatter = (value: string | number | Date) => {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Standard weight formatter
 */
export const weightFormatter = (value: number | null) => (value !== null ? `${String(value)}kg` : '');
