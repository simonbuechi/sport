import { useState, useMemo, memo } from 'react';
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
import { useTranslation } from 'react-i18next';
import type { Workout } from '../../types';
import { getChartDefaults, xAxisDateFormatter } from '../../theme/charts';
import { summarizeExerciseSets } from '../../utils/fitness';
import { parseLocalDate } from '../../utils/format';

interface ExerciseProgressChartProps {
    workouts: Workout[];
    exerciseId: string;
}

type TimeFrame = '1m' | '3m' | '6m' | '1y' | 'all';

const ExerciseProgressChart = ({ workouts, exerciseId }: ExerciseProgressChartProps) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('6m');

    const allRelevantData = useMemo(() => {
        const dataPoints = workouts.map(w => {
            const exerciseData = w.exercises.find(ex => ex.exerciseId === exerciseId);
            const max1RM = exerciseData ? summarizeExerciseSets(exerciseData.sets).max1RM : 0;

            return {
                date: parseLocalDate(w.date),
                weight: Math.round(max1RM)
            };
        });

        return dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [workouts, exerciseId]);

    const chartData = useMemo(() => {
        if (timeFrame === 'all') return allRelevantData;

        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        if (timeFrame === '1m') cutoff.setMonth(cutoff.getMonth() - 1);
        else if (timeFrame === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
        else if (timeFrame === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
        else cutoff.setFullYear(cutoff.getFullYear() - 1);

        return allRelevantData.filter(d => d.date >= cutoff);
    }, [allRelevantData, timeFrame]);

    const chartDates = chartData.map(d => d.date);
    const chartWeights = chartData.map(d => d.weight);

    const defaults = getChartDefaults(theme);

    return (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 } }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    {t('exercises.weightProgress', { defaultValue: 'Weight Progress' })}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="timeframe-label" htmlFor="timeframe-input">
                        {t('common.timeframe', { defaultValue: 'Timeframe' })}
                    </InputLabel>
                    <Select
                        labelId="timeframe-label"
                        id="timeframe-select"
                        inputProps={{ id: 'timeframe-input' }}
                        value={timeFrame}
                        label={t('common.timeframe', { defaultValue: 'Timeframe' })}
                        onChange={(e) => { setTimeFrame(e.target.value as TimeFrame); }}
                    >
                        <MenuItem value="1m">{t('common.lastMonth', { defaultValue: 'Last Month' })}</MenuItem>
                        <MenuItem value="3m">{t('common.last3Months', { defaultValue: 'Last 3 Months' })}</MenuItem>
                        <MenuItem value="6m">{t('common.last6Months', { defaultValue: 'Last 6 Months' })}</MenuItem>
                        <MenuItem value="1y">{t('common.lastYear', { defaultValue: 'Last Year' })}</MenuItem>
                        <MenuItem value="all">{t('common.allTime', { defaultValue: 'All Time' })}</MenuItem>
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
                        label: `${t('exercises.estimated1RM', { defaultValue: 'Max 1RM' })} (kg)`,
                        showMark: false,
                        area: true,
                        color: theme.palette.primary.main,
                    }]}
                />
            </Box>
            {chartData.length < 2 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    {t('exercises.notEnoughChartData', { defaultValue: 'Not enough data points yet to show progress.' })}
                </Typography>
            )}
        </Paper>
    );
};

export default memo(ExerciseProgressChart);
