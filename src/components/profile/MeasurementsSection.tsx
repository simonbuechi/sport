import { useState } from 'react';
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
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';

import Add from '@mui/icons-material/Add';
import HelpOutlined from '@mui/icons-material/HelpOutlined';
import { Link as RouterLink } from 'react-router-dom';
import type { MeasurementEntry } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';

const MEASUREMENT_INFO: Record<string, { how: string }> = {
    waist: {
        how: 'Stand upright and exhale naturally. Wrap the measuring tape horizontally around the torso directly over the belly button (umbilicus). Ensure the tape rests flat against the skin without compressing it.'
    },
    hips: {
        how: 'Stand upright with feet together. Wrap the tape measure horizontally around the absolute widest part of the buttocks. Ensure the tape remains perfectly parallel to the floor all the way around.'
    },
    neck: {
        how: 'Stand upright, looking straight ahead with shoulders completely relaxed. Wrap the tape horizontally around the lower part of the neck, resting just below the Adam\'s apple.'
    },
    chest: {
        how: 'Stand upright and exhale to a resting lung capacity. Wrap the tape measure around the torso exactly at nipple level. Keep arms resting downward at the sides. The tape must remain perfectly horizontal across the back and chest.'
    },
    shoulders: {
        how: 'Stand upright with arms relaxed at the sides. Pass the tape measure around the body over the widest, most prominent point of the lateral deltoids. Keep the tape parallel to the floor. (Note: This typically requires a partner for accuracy).'
    },
    rightBicep: {
        how: 'Raise the right arm to shoulder height, parallel to the floor. Bend the elbow to 90 degrees and forcefully flex the arm. Wrap the tape strictly around the highest peak of the bicep and the thickest belly of the tricep.'
    },
    leftBicep: {
        how: 'Raise the left arm to shoulder height, parallel to the floor. Bend the elbow to 90 degrees and forcefully flex the arm. Wrap the tape strictly around the highest peak of the bicep and the thickest belly of the tricep.'
    },
    rightForearm: {
        how: 'Let the right arm hang at the side. Form a tight fist and flex the forearm muscles. Wrap the tape measure around the thickest, widest part of the forearm, which is located just below the elbow joint.'
    },
    leftForearm: {
        how: 'Let the left arm hang at the side. Form a tight fist and flex the forearm muscles. Wrap the tape measure around the thickest, widest part of the forearm, located just below the elbow joint.'
    },
    rightThigh: {
        how: 'Stand upright with weight evenly distributed on both feet. Tense the right leg muscles slightly. Wrap the tape horizontally around the absolute thickest part of the upper thigh, which is typically just below the gluteal fold (where the glute meets the hamstring).'
    },
    leftThigh: {
        how: 'Stand upright with weight evenly distributed on both feet. Tense the left leg muscles slightly. Wrap the tape horizontally around the absolute thickest part of the upper thigh, directly below the gluteal fold.'
    },
    rightCalf: {
        how: 'Stand upright with weight evenly distributed flat on both feet. Flex the right calf by pressing the ball of the right foot firmly into the floor. Wrap the tape horizontally around the widest, most prominent part of the calf muscle belly.'
    },
    leftCalf: {
        how: 'Stand upright with weight evenly distributed flat on both feet. Flex the left calf by pressing the ball of the left foot firmly into the floor. Wrap the tape horizontally around the widest, most prominent part of the calf muscle belly.'
    }
};


const MeasurementField = ({ 
    label, 
    field, 
    value, 
    onChange 
}: { 
    label: string, 
    field: keyof Omit<MeasurementEntry, 'id' | 'date'>, 
    value: string | number, 
    onChange: (val: string) => void 
}) => {
    const info = MEASUREMENT_INFO[field];
    return (
        <TextField
            id={`measurement-${field}`}
            label={label}
            type="number"
            fullWidth
            value={value}
            onChange={(e) => { onChange(e.target.value); }}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{label}</Typography>
                                        <Typography variant="body2">{info.how}</Typography>
                                    </Box>
                                }
                                arrow
                            >
                                <HelpOutlined sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help', opacity: 0.6 }} />
                            </Tooltip>
                        </InputAdornment>
                    )
                }
            }}
        />
    );
};

export default function MeasurementsSection() {
    const { profile, updateProfile } = useUserProfile();

    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isExplainOpen, setIsExplainOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState<Omit<MeasurementEntry, 'id' | 'date'>>({});

    if (!profile) return null;

    const measurements = profile.measurements ?? [];
    const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleOpenAdd = () => {
        setFormDate(new Date().toISOString().split('T')[0]);
        // Default to last measurements as starting point
        const initialData = sortedMeasurements.length > 0
            ? (({ id: _id, date: _date, ...rest }) => rest)(sortedMeasurements[0])
            : {};
        setFormData(initialData as Omit<MeasurementEntry, 'id' | 'date'>);
        setIsAddEditOpen(true);
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!profile.uid) return;

        try {
            setSaving(true);
            const newMeasurements = [...measurements];
            const nextEntry: MeasurementEntry = {
                ...formData,
                date: formDate,
                id: crypto.randomUUID()
            } as MeasurementEntry;

            const cleaned = Object.fromEntries(
                Object.entries(nextEntry).filter(([_, v]) => v !== undefined)
            ) as MeasurementEntry;
            newMeasurements.push(cleaned);

            await updateProfile({ measurements: newMeasurements });
            setIsAddEditOpen(false);
        } catch (error) {
            console.error("Failed to save measurement", error);
            alert("Failed to save measurement entry.");
        } finally {
            setSaving(false);
        }
    };


    // Helper to format displayed measurements overview
    const latestMeasurement = sortedMeasurements.length > 0 ? sortedMeasurements[0] : null;

    const getMeasurementSummary = (entry: MeasurementEntry) => {
        const parts = [];
        if (entry.waist) parts.push(`Waist: ${String(entry.waist)}cm`);
        if (entry.hips) parts.push(`Hips: ${String(entry.hips)}cm`);
        if (entry.chest) parts.push(`Chest: ${String(entry.chest)}cm`);
        if (entry.shoulders) parts.push(`Shoulders: ${String(entry.shoulders)}cm`);
        return parts.length > 0 ? parts.join(' • ') : 'No data recorded';
    };

    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">Measurements</Typography>
                <Button
                    variant="text"
                    startIcon={<HelpOutlined />}
                    onClick={() => { setIsExplainOpen(true); }}
                    size="small"
                >
                    Explain
                </Button>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Latest Measurement</Typography>
                {latestMeasurement ? (
                    <Box>
                        <Typography variant="h6" color="primary">
                            {new Date(latestMeasurement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Typography>
                        <Typography variant="body2">{getMeasurementSummary(latestMeasurement)}</Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">No measurements recorded yet.</Typography>
                )}
            </Box>

            <Grid container spacing={2}>
                <Grid size={6}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenAdd}
                        fullWidth
                    >
                        Measure now
                    </Button>
                </Grid>
                <Grid size={6}>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/profile/body/history"
                        fullWidth
                    >
                        History
                    </Button>
                </Grid>
            </Grid>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddEditOpen} onClose={() => { if (!saving) { setIsAddEditOpen(false); } }} maxWidth="sm" fullWidth
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (e: React.SyntheticEvent) => { void handleSave(e); },
                    }
                }}
            >
                <DialogTitle>Log Measurements (cm)</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                id="measurement-date"
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
                        </Grid>

                        {/* Core body */}
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Chest" field="chest" value={formData.chest ?? ''} onChange={(val) => { handleFieldChange('chest', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Shoulders" field="shoulders" value={formData.shoulders ?? ''} onChange={(val) => { handleFieldChange('shoulders', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Neck" field="neck" value={formData.neck ?? ''} onChange={(val) => { handleFieldChange('neck', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Waist" field="waist" value={formData.waist ?? ''} onChange={(val) => { handleFieldChange('waist', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Hips" field="hips" value={formData.hips ?? ''} onChange={(val) => { handleFieldChange('hips', val); }} />
                        </Grid>

                        {/* Arms */}
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Left Bicep" field="leftBicep" value={formData.leftBicep ?? ''} onChange={(val) => { handleFieldChange('leftBicep', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Right Bicep" field="rightBicep" value={formData.rightBicep ?? ''} onChange={(val) => { handleFieldChange('rightBicep', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Left Forearm" field="leftForearm" value={formData.leftForearm ?? ''} onChange={(val) => { handleFieldChange('leftForearm', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Right Forearm" field="rightForearm" value={formData.rightForearm ?? ''} onChange={(val) => { handleFieldChange('rightForearm', val); }} />
                        </Grid>

                        {/* Legs */}
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Left Thigh" field="leftThigh" value={formData.leftThigh ?? ''} onChange={(val) => { handleFieldChange('leftThigh', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Right Thigh" field="rightThigh" value={formData.rightThigh ?? ''} onChange={(val) => { handleFieldChange('rightThigh', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Left Calf" field="leftCalf" value={formData.leftCalf ?? ''} onChange={(val) => { handleFieldChange('leftCalf', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label="Right Calf" field="rightCalf" value={formData.rightCalf ?? ''} onChange={(val) => { handleFieldChange('rightCalf', val); }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsAddEditOpen(false); }} color="inherit" disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Explain Dialog */}
            <Dialog open={isExplainOpen} onClose={() => { setIsExplainOpen(false); }} maxWidth="md" fullWidth>
                <DialogTitle>How to Measure</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Box 
                            component="img" 
                            src="/body/measurements.webp" 
                            alt="Body Measurement Guide" 
                            sx={{ 
                                width: '100%', 
                                maxWidth: 600, 
                                borderRadius: 2,
                                boxShadow: 2,
                                bgcolor: 'background.paper'
                            }} 
                        />
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        Taking consistent body measurements is a great way to track progress alongside the scale. For the most accurate results, measure at the same time of day and under the same conditions.
                    </Typography>

                    <Grid container spacing={4}>
                        {[
                            { name: 'Waist', explanation: 'Measures the circumference of the midsection. This tracks core fat loss or hypertrophy in the abdominal and oblique muscles.', how: 'Stand upright and exhale naturally. Wrap the measuring tape horizontally around the torso directly over the belly button (umbilicus). Ensure the tape rests flat against the skin without compressing it.' },
                            { name: 'Hips', explanation: 'Measures the circumference of the lower pelvic region. This tracks total mass across the glutes and hips.', how: 'Stand upright with feet together. Wrap the tape measure horizontally around the absolute widest part of the buttocks. Ensure the tape remains perfectly parallel to the floor all the way around.' },
                            { name: 'Neck', explanation: 'Measures neck circumference. This is used in standardized body fat calculations and to track trapezius/neck muscle growth.', how: 'Stand upright, looking straight ahead with shoulders completely relaxed. Wrap the tape horizontally around the lower part of the neck, resting just below the Adam\'s apple.' },
                            { name: 'Chest', explanation: 'Measures the circumference of the upper torso. This tracks overall development of the pectoral muscles and latissimus dorsi.', how: 'Stand upright and exhale to a resting lung capacity. Wrap the tape measure around the torso exactly at nipple level. Keep arms resting downward at the sides. The tape must remain perfectly horizontal across the back and chest.' },
                            { name: 'Shoulders', explanation: 'Measures the total circumference of the shoulder girdle. This indicates lateral deltoid width and upper body structural size.', how: 'Stand upright with arms relaxed at the sides. Pass the tape measure around the body over the widest, most prominent point of the lateral deltoids. Keep the tape parallel to the floor. (Note: This typically requires a partner for accuracy).' },
                            { name: 'Right Bicep', explanation: 'Measures the maximum circumference of the right upper arm. In bodybuilding, this is tracked in a flexed state to record peak size of the biceps brachii and triceps brachii.', how: 'Raise the right arm to shoulder height, parallel to the floor. Bend the elbow to 90 degrees and forcefully flex the arm. Wrap the tape strictly around the highest peak of the bicep and the thickest belly of the tricep.' },
                            { name: 'Left Bicep', explanation: 'Measures the maximum circumference of the left upper arm. This tracks left-side arm mass and highlights bilateral symmetry when compared to the right bicep.', how: 'Raise the left arm to shoulder height, parallel to the floor. Bend the elbow to 90 degrees and forcefully flex the arm. Wrap the tape strictly around the highest peak of the bicep and the thickest belly of the tricep.' },
                            { name: 'Right Forearm', explanation: 'Measures the circumference of the right lower arm. This tracks the development of the brachioradialis and wrist flexors/extensors.', how: 'Let the right arm hang at the side. Form a tight fist and flex the forearm muscles. Wrap the tape measure around the thickest, widest part of the forearm, which is located just below the elbow joint.' },
                            { name: 'Left Forearm', explanation: 'Measures the circumference of the left lower arm. This tracks left-side grip musculature and highlights bilateral symmetry.', how: 'Let the left arm hang at the side. Form a tight fist and flex the forearm muscles. Wrap the tape measure around the thickest, widest part of the forearm, located just below the elbow joint.' },
                            { name: 'Right Thigh', explanation: 'Measures the circumference of the right upper leg. This tracks the combined mass of the quadriceps and hamstrings.', how: 'Stand upright with weight evenly distributed on both feet. Tense the right leg muscles slightly. Wrap the tape horizontally around the absolute thickest part of the upper thigh, which is typically just below the gluteal fold (where the glute meets the hamstring).' },
                            { name: 'Left Thigh', explanation: 'Measures the circumference of the left upper leg. This tracks left-side upper leg mass and highlights bilateral symmetry.', how: 'Stand upright with weight evenly distributed on both feet. Tense the left leg muscles slightly. Wrap the tape horizontally around the absolute thickest part of the upper thigh, directly below the gluteal fold.' },
                            { name: 'Right Calf', explanation: 'Measures the circumference of the right lower leg. This tracks the hypertrophy of the gastrocnemius and soleus muscles.', how: 'Stand upright with weight evenly distributed flat on both feet. Flex the right calf by pressing the ball of the right foot firmly into the floor. Wrap the tape horizontally around the widest, most prominent part of the calf muscle belly.' },
                            { name: 'Left Calf', explanation: 'Measures the circumference of the left lower leg. This tracks left-side lower leg mass and highlights bilateral symmetry.', how: 'Stand upright with weight evenly distributed flat on both feet. Flex the left calf by pressing the ball of the left foot firmly into the floor. Wrap the tape horizontally around the widest, most prominent part of the calf muscle belly.' }
                        ].map((part) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={part.name}>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>{part.name}</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}><strong>Explanation:</strong> {part.explanation}</Typography>
                                <Typography variant="body2" color="text.secondary"><strong>How to Measure:</strong> {part.how}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsExplainOpen(false); }}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
