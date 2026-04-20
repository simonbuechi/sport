import { useState, useMemo } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import type { Workout } from '../../types';
import { getChartDefaults, xAxisDateFormatter } from '../../theme/charts';
import { calculate1RM } from '../../utils/fitness';

interface ExerciseProgressChartProps {
    workouts: Workout[];
    exerciseId: string;
}

type TimeFrame = '1m' | '3m' | '6m' | '1y' | 'all';

const ExerciseProgressChart = ({ workouts, exerciseId }: ExerciseProgressChartProps) => {
    const theme = useTheme();
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('6m');

    const chartData = useMemo(() => {
        // 1. Filter workouts for this exercise and those that have structured exercise data
        const relevantWorkouts = workouts.filter(w =>
            w.exerciseIds.includes(exerciseId) && w.exercises
        );

        // 2. Extract max 1RM for each workout
        const dataPoints = relevantWorkouts.map(w => {
            const exerciseData = w.exercises?.find(ex => ex.exerciseId === exerciseId);
            const max1RM = exerciseData?.sets.reduce((max, set) => {
                const current1RM = calculate1RM(set.weight ?? 0, set.reps ?? 0);
                return current1RM > max ? current1RM : max;
            }, 0) ?? 0;

            return {
                date: new Date(w.date),
                weight: Math.round(max1RM)
            };
        });

        // 3. Sort by date ascending
        const sortedData = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

        // 4. Filter by timeframe
        if (timeFrame === 'all') return sortedData;

        const cutoff = new Date();
        if (timeFrame === '1m') cutoff.setMonth(cutoff.getMonth() - 1);
        else if (timeFrame === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
        else if (timeFrame === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
        else if (timeFrame === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1);

        return sortedData.filter(d => d.date >= cutoff);
    }, [workouts, exerciseId, timeFrame]);

    const chartDates = chartData.map(d => d.date);
    const chartWeights = chartData.map(d => d.weight);

    const defaults = getChartDefaults(theme);

    return (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 } }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Weight Progress</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="timeframe-label">Timeframe</InputLabel>
                    <Select
                        labelId="timeframe-label"
                        value={timeFrame}
                        label="Timeframe"
                        onChange={(e) => { setTimeFrame(e.target.value as TimeFrame); }}
                    >
                        <MenuItem value="1m">Last Month</MenuItem>
                        <MenuItem value="3m">Last 3 Months</MenuItem>
                        <MenuItem value="6m">Last 6 Months</MenuItem>
                        <MenuItem value="1y">Last Year</MenuItem>
                        <MenuItem value="all">All Time</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Box sx={{ width: '100%', height: 300 }}>
                <LineChart
                    {...defaults}
                    xAxis={[{
                        data: chartDates,
                        scaleType: 'time',
                        valueFormatter: xAxisDateFormatter,
                    }]}
                    yAxis={[{
                        min: chartWeights.length > 0 ? Math.max(0, Math.min(...chartWeights) - 5) : 0,
                        max: chartWeights.length > 0 ? Math.max(...chartWeights) + 5 : 100,
                    }]}
                    series={[{
                        data: chartWeights,
                        label: 'Max 1RM (kg)',
                        showMark: false,
                        area: true,
                        color: theme.palette.primary.main,
                    }]}
                />
            </Box>
            {chartData.length < 2 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    Not enough data points yet to show progress.
                </Typography>
            )}
        </Paper>
    );
};

export default ExerciseProgressChart;
