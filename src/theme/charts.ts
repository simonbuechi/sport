import type { Theme } from '@mui/material/styles';
import type { LineChartProps } from '@mui/x-charts/LineChart';

/**
 * Common chart configuration and visual standards
 */
export const getChartDefaults = (theme: Theme): Partial<LineChartProps> => ({
    margin: { top: 16, right: 12, bottom: 40, left: 38 },
    slotProps: {
        area: {
            fillOpacity: 0.16,
        },
    },
    colors: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.info.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
    ],
    sx: {
        '& .MuiChartsLegend-root': {
            display: 'none',
        },
        '& .MuiAreaElement-root': {
            opacity: 0.16,
            fillOpacity: 0.16,
        },
        '& .MuiLineElement-root': {
            strokeWidth: 2.5,
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
