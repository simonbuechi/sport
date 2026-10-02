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
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const infoHow = t(`measurementInfo.${field}`, { defaultValue: MEASUREMENT_INFO[field].how });
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
                                        <Typography variant="body2">{infoHow}</Typography>
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
    const { t, i18n } = useTranslation();
    const { profile, addMeasurement } = useUserProfile();

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

            // Save to database
            await addMeasurement(cleaned);
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
        if (entry.waist) parts.push(`${t('measurements.waist')}: ${String(entry.waist)}cm`);
        if (entry.hips) parts.push(`${t('measurements.hips')}: ${String(entry.hips)}cm`);
        if (entry.chest) parts.push(`${t('measurements.chest')}: ${String(entry.chest)}cm`);
        if (entry.shoulders) parts.push(`${t('measurements.shoulders')}: ${String(entry.shoulders)}cm`);
        return parts.length > 0 ? parts.join(' • ') : t('common.noData', { defaultValue: 'No data recorded' });
    };

    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">{t('profile.measurements')}</Typography>
                <Button
                    variant="text"
                    startIcon={<HelpOutlined />}
                    onClick={() => { setIsExplainOpen(true); }}
                    size="small"
                >
                    {t('profile.explain')}
                </Button>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('profile.latestMeasurement')}</Typography>
                {latestMeasurement ? (
                    <Box>
                        <Typography variant="h6" color="primary">
                            {new Date(latestMeasurement.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                        </Typography>
                        <Typography variant="body2">{getMeasurementSummary(latestMeasurement)}</Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">{t('profile.noMeasurements')}</Typography>
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
                        {t('profile.measureNow')}
                    </Button>
                </Grid>
                <Grid size={6}>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        to="/profile/body/history"
                        fullWidth
                    >
                        {t('profile.viewHistory')}
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
                <DialogTitle>{t('profile.logMeasurements')} (cm)</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                id="measurement-date"
                                label={t('journal.date')}
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
                            <MeasurementField label={t('measurements.chest')} field="chest" value={formData.chest ?? ''} onChange={(val) => { handleFieldChange('chest', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.shoulders')} field="shoulders" value={formData.shoulders ?? ''} onChange={(val) => { handleFieldChange('shoulders', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.neck')} field="neck" value={formData.neck ?? ''} onChange={(val) => { handleFieldChange('neck', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.waist')} field="waist" value={formData.waist ?? ''} onChange={(val) => { handleFieldChange('waist', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.hips')} field="hips" value={formData.hips ?? ''} onChange={(val) => { handleFieldChange('hips', val); }} />
                        </Grid>

                        {/* Arms */}
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.leftBicep')} field="leftBicep" value={formData.leftBicep ?? ''} onChange={(val) => { handleFieldChange('leftBicep', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.rightBicep')} field="rightBicep" value={formData.rightBicep ?? ''} onChange={(val) => { handleFieldChange('rightBicep', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.leftForearm')} field="leftForearm" value={formData.leftForearm ?? ''} onChange={(val) => { handleFieldChange('leftForearm', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.rightForearm')} field="rightForearm" value={formData.rightForearm ?? ''} onChange={(val) => { handleFieldChange('rightForearm', val); }} />
                        </Grid>

                        {/* Legs */}
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.leftThigh')} field="leftThigh" value={formData.leftThigh ?? ''} onChange={(val) => { handleFieldChange('leftThigh', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.rightThigh')} field="rightThigh" value={formData.rightThigh ?? ''} onChange={(val) => { handleFieldChange('rightThigh', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.leftCalf')} field="leftCalf" value={formData.leftCalf ?? ''} onChange={(val) => { handleFieldChange('leftCalf', val); }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <MeasurementField label={t('measurements.rightCalf')} field="rightCalf" value={formData.rightCalf ?? ''} onChange={(val) => { handleFieldChange('rightCalf', val); }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsAddEditOpen(false); }} color="inherit" disabled={saving}>{t('common.cancel')}</Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Explain Dialog */}
            <Dialog open={isExplainOpen} onClose={() => { setIsExplainOpen(false); }} maxWidth="md" fullWidth>
                <DialogTitle>{t('profile.measurementInstructions')}</DialogTitle>
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
                    
                    <Grid container spacing={4}>
                        {(['waist', 'hips', 'neck', 'chest', 'shoulders', 'rightBicep', 'leftBicep', 'rightForearm', 'leftForearm', 'rightThigh', 'leftThigh', 'rightCalf', 'leftCalf'] as const).map((key) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={key}>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>{t(`measurements.${key}`)}</Typography>
                                <Typography variant="body2" color="text.secondary"><strong>{t('profile.explain')}:</strong> {t(`measurementInfo.${key}`)}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsExplainOpen(false); }}>{t('common.close')}</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
