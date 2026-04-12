import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import type { ActivityLog } from '../../types';

interface CalendarWidgetProps {
    entries: ActivityLog[];
}

const CalendarWidget = ({ entries }: CalendarWidgetProps) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    // Days in month
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 is Sunday
    
    // Normalize to Monday start: 0=Mon, 1=Tue, ..., 6=Sun
    const firstDayAdjusted = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const activeDates = new Set(entries.map(e => {
        // e.date is YYYY-MM-DD
        return e.date.split('T')[0];
    }));

    const days = [];
    // Padding for first day
    for (let i = 0; i < firstDayAdjusted; i++) {
        days.push(<Box key={`pad-${String(i)}`} sx={{ p: 1 }} />);
    }

    const monthStr = String(viewDate.getMonth() + 1).padStart(2, '0');
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const fullDateStr = `${String(viewDate.getFullYear())}-${monthStr}-${dayStr}`;
        const hasSession = activeDates.has(fullDateStr);
        const isToday = today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();

        days.push(
            <Box
                key={day}
                sx={{
                    textAlign: 'center',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    lineHeight: '28px',
                    margin: 'auto',
                    bgcolor: hasSession ? 'primary.main' : 'transparent',
                    color: hasSession ? 'white' : 'text.primary',
                    border: isToday ? '2px solid' : 'none',
                    borderColor: 'primary.light',
                    fontWeight: isToday || hasSession ? 600 : 400,
                    fontSize: '0.75rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: hasSession ? 'primary.dark' : 'action.hover'
                    }
                }}
            >
                {day}
            </Box>
        );
    }

    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                    {monthName} {year}
                </Typography>
                <Box>
                     <IconButton size="small" onClick={() => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }}>
                        <KeyboardArrowLeft fontSize="small" sx={{ fontSize: '0.9rem' }} />
                     </IconButton>
                     <IconButton size="small" onClick={() => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }}>
                        <KeyboardArrowRight fontSize="small" sx={{ fontSize: '0.9rem' }} />
                     </IconButton>
                </Box>
            </Box>
            <Grid container columns={7} spacing={0}>
                {weekDays.map((d, i) => (
                    <Grid key={i} size={1} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{d}</Typography>
                    </Grid>
                ))}
                {days.map((d, i) => (
                    <Grid key={i} size={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.25 }}>
                        {d}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CalendarWidget;
