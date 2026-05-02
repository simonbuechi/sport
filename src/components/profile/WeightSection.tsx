import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Link as RouterLink } from 'react-router-dom';

import Add from '@mui/icons-material/Add';
import { LineChart } from '@mui/x-charts/LineChart';
import type { WeightEntry } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getChartDefaults, xAxisDateFormatter } from '../../theme/charts';
import { useTheme } from '@mui/material/styles';

type TimeFrame = '1m' | '3m' | '6m' | '1y' | 'all';

export default function WeightSection() {
    const { profile, updateProfile } = useUserProfile();
    const theme = useTheme();
    const defaults = getChartDefaults(theme);

    const weights = useMemo(() => profile?.weights ?? [], [profile?.weights]);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('6m');
    const [metric, setMetric] = useState<'weight' | 'bmi'>('weight');

    // Prepare chart data based on timeframe
    const { chartDates, chartValues } = useMemo(() => {
        const filtered = [...weights]
            .filter(w => {
                if (timeFrame === 'all') return true;
                const cutoff = new Date();
                if (timeFrame === '1m') cutoff.setMonth(cutoff.getMonth() - 1);
                else if (timeFrame === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
                else if (timeFrame === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
                else cutoff.setFullYear(cutoff.getFullYear() - 1);
                return new Date(w.date) >= cutoff;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            chartDates: filtered.map(w => new Date(w.date)),
            chartValues: filtered.map(w => {
                if (metric === 'weight') return w.weightKg;
                if (!profile?.height) return 0;
                const heightM = profile.height / 100;
                return parseFloat((w.weightKg / (heightM * heightM)).toFixed(1));
            })
        };
    }, [weights, timeFrame, metric, profile?.height]);

    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formWeight, setFormWeight] = useState('');
    const [formBodyFat, setFormBodyFat] = useState('');

    if (!profile) return null;

    const handleOpenAdd = () => {
        setFormDate(new Date().toISOString().split('T')[0]);
        // Default to the last recorded weight if available
        const lastWeight = weights.length > 0 ? [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
        setFormWeight(lastWeight ? lastWeight.weightKg.toString() : '');
        setFormBodyFat('');
        setIsAddEditOpen(true);
    };

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!profile.uid) return;

        try {
            setSaving(true);
            const numWeight = parseFloat(formWeight);
            if (isNaN(numWeight) || numWeight <= 0) {
                alert("Please enter a valid weight");
                return;
            }

            const numBodyFat = formBodyFat ? parseFloat(formBodyFat) : undefined;
            if (numBodyFat !== undefined && (isNaN(numBodyFat) || numBodyFat < 0 || numBodyFat > 100)) {
                alert("Please enter a valid body fat percentage (0-100)");
                return;
            }

            const newWeights = [...weights];

            // Add new
            const nextEntry: WeightEntry = {
                id: crypto.randomUUID(),
                date: formDate,
                weightKg: numWeight,
                bodyFatPercent: numBodyFat
            };
            const cleanedEntry = Object.fromEntries(
                Object.entries(nextEntry).filter(([_, v]) => v !== undefined)
            ) as WeightEntry;
            newWeights.push(cleanedEntry);

            // Save to database
            await updateProfile({ weights: newWeights });

            setIsAddEditOpen(false);
        } catch (error) {
            console.error("Failed to save weight", error);
            alert("Failed to save weight entry.");
        } finally {
            setSaving(false);
        }
    };


    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid size={{ xs: 12, sm: 'auto' }}>
                    <Typography variant="h5" component="h2">Weight Tracking</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 'auto' }}>
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                        <Grid>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel id="weight-metric-label" htmlFor="weight-metric-input">Metric</InputLabel>
                                <Select
                                    labelId="weight-metric-label"
                                    id="weight-metric-select"
                                    inputProps={{ id: 'weight-metric-input' }}
                                    value={metric}
                                    label="Metric"
                                    onChange={(e) => { setMetric(e.target.value); }}
                                >
                                    <MenuItem value="weight">Weight</MenuItem>
                                    <MenuItem value="bmi" disabled={!profile.height}>BMI</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel id="weight-timeframe-label" htmlFor="weight-timeframe-input">Timeframe</InputLabel>
                                <Select
                                    labelId="weight-timeframe-label"
                                    id="weight-timeframe-select"
                                    inputProps={{ id: 'weight-timeframe-input' }}
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
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Box sx={{ width: '100%', height: 250, mt: 2, mb: 2 }}>
                <LineChart
                    {...defaults}
                    xAxis={[{
                        data: chartDates,
                        scaleType: 'time',
                        max: new Date(),
                        valueFormatter: xAxisDateFormatter,
                    }]}
                    yAxis={[{
                        min: chartValues.length > 0 ? Math.max(0, Math.min(...chartValues) - (metric === 'bmi' ? 1 : 2)) : 0,
                        max: chartValues.length > 0 ? Math.max(...chartValues) + (metric === 'bmi' ? 1 : 2) : 100,
                    }]}
                    series={[{
                        data: chartValues,
                        label: metric === 'weight' ? 'Weight (kg)' : 'BMI',
                        showMark: false,
                        curve: 'catmullRom',
                        area: true,
                        color: theme.palette.primary.main,
                    }]}
                />
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={6}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenAdd}
                        fullWidth
                    >
                        Log Weight
                    </Button>
                </Grid>
                <Grid size={6}>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/profile/body/history"
                        fullWidth
                    >
                        View History
                    </Button>
                </Grid>
            </Grid>
            {/* Add/Edit Dialog */}
            <Dialog open={isAddEditOpen} onClose={() => { if (!saving) { setIsAddEditOpen(false); } }} maxWidth="xs" fullWidth
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (e: React.SyntheticEvent) => { void handleSave(e); },
                    }
                }}
            >
                <DialogTitle>Log New Weight</DialogTitle>
                <DialogContent dividers>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            py: 1
                        }}>
                        <TextField
                            id="weight-date"
                            label="Date"
                            type="date"
                            fullWidth
                            required
                            value={formDate}
                            onChange={(e) => { setFormDate(e.target.value); }}
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />
                        <TextField
                            id="weight-value"
                            label="Weight (kg)"
                            type="number"
                            fullWidth
                            required
                            value={formWeight}
                            onChange={(e) => { setFormWeight(e.target.value); }}
                            slotProps={{
                                htmlInput: { min: 20, max: 250, step: 0.1 }
                            }}
                        />
                        <TextField
                            id="weight-bodyfat"
                            label="Body Fat %"
                            type="number"
                            fullWidth
                            value={formBodyFat}
                            onChange={(e) => { setFormBodyFat(e.target.value); }}
                            placeholder="Optional"
                            slotProps={{
                                htmlInput: { min: 0, max: 100, step: 0.1 }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsAddEditOpen(false); }} color="inherit" disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
