import { useState } from 'react';
import {
    Box, Typography, Paper, Button, List, ListItem, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Divider, DialogContentText, Grid
} from '@mui/material';
import { Edit, Delete, Add, Straighten } from '@mui/icons-material';
import type { UserProfile, MeasurementEntry } from '../../types';
import { updateUserProfile } from '../../services/db';

interface MeasurementsSectionProps {
    profile: Partial<UserProfile>;
    onMeasurementsUpdated: (newMeasurements: MeasurementEntry[]) => void;
}

export default function MeasurementsSection({ profile, onMeasurementsUpdated }: MeasurementsSectionProps) {
    const measurements = profile.measurements || [];
    
    const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<MeasurementEntry | null>(null);
    const [entryToDelete, setEntryToDelete] = useState<MeasurementEntry | null>(null);
    const [saving, setSaving] = useState(false);
    
    // Form fields
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState<Omit<MeasurementEntry, 'id' | 'date'>>({});

    const handleOpenAdd = () => {
        setEditingEntry(null);
        setFormDate(new Date().toISOString().split('T')[0]);
        // Default to last measurements as starting point
        const initialData = sortedMeasurements.length > 0 
            ? (({ id, date, ...rest }) => rest)(sortedMeasurements[0])
            : {};
        setFormData(initialData as Omit<MeasurementEntry, 'id' | 'date'>);
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (entry: MeasurementEntry) => {
        setEditingEntry(entry);
        setFormDate(entry.date);
        const { id, date, ...data } = entry;
        setFormData(data as any);
        setIsAddEditOpen(true);
    };

    const handleOpenDelete = (entry: MeasurementEntry) => {
        setEntryToDelete(entry);
        setIsDeleteOpen(true);
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.uid) return;
        
        try {
            setSaving(true);
            let newMeasurements = [...measurements];
            const newEntry: any = {
                ...formData,
                date: formDate,
            };
            
            if (editingEntry) {
                newEntry.id = editingEntry.id;
                Object.keys(newEntry).forEach(key => newEntry[key] === undefined && delete newEntry[key]);
                newMeasurements = newMeasurements.map(m => m.id === editingEntry.id ? (newEntry as MeasurementEntry) : m);
            } else {
                newEntry.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
                Object.keys(newEntry).forEach(key => newEntry[key] === undefined && delete newEntry[key]);
                newMeasurements.push(newEntry as MeasurementEntry);
            }

            await updateUserProfile(profile.uid, { measurements: newMeasurements });
            onMeasurementsUpdated(newMeasurements);
            setIsAddEditOpen(false);
        } catch (error) {
            console.error("Failed to save measurement", error);
            alert("Failed to save measurement entry.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!profile.uid || !entryToDelete) return;
        
        try {
            setSaving(true);
            const newMeasurements = measurements.filter(m => m.id !== entryToDelete.id);
            await updateUserProfile(profile.uid, { measurements: newMeasurements });
            onMeasurementsUpdated(newMeasurements);
            setIsDeleteOpen(false);
            setEntryToDelete(null);
        } catch (error) {
            console.error("Failed to delete measurement", error);
            alert("Failed to delete measurement entry.");
        } finally {
            setSaving(false);
        }
    };

    // Helper to format displayed measurements overview
    const getMeasurementSummary = (entry: MeasurementEntry) => {
        const parts = [];
        if (entry.waist) parts.push(`Waist: ${entry.waist}`);
        if (entry.hips) parts.push(`Hips: ${entry.hips}`);
        if (entry.chest) parts.push(`Chest: ${entry.chest}`);
        return parts.length > 0 ? parts.join(' | ') + (Object.keys(entry).length > 4 ? '...' : '') : 'Empty entry';
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Straighten color="primary" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h5" component="h2">Measurements</Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<Add />} 
                    onClick={handleOpenAdd}
                    size="small"
                >
                    Log Size
                </Button>
            </Box>

            {sortedMeasurements.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 3, fontStyle: 'italic' }}>
                    No body measurements recorded yet. Track your progress.
                </Typography>
            ) : (
                <List disablePadding>
                    {sortedMeasurements.map((entry, index) => (
                        <Box key={entry.id}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem
                                sx={{ px: 1, py: 1.5 }}
                                secondaryAction={
                                    <Box display="flex" gap={0.5}>
                                        <IconButton edge="end" aria-label="edit" size="small" onClick={() => handleOpenEdit(entry)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => handleOpenDelete(entry)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={<Typography fontWeight="600">{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>}
                                    secondary={getMeasurementSummary(entry)}
                                />
                            </ListItem>
                        </Box>
                    ))}
                </List>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isAddEditOpen} onClose={() => !saving && setIsAddEditOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSave}>
                    <DialogTitle>{editingEntry ? 'Edit Measurements (cm)' : 'Log Measurements (cm)'}</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Date"
                                    type="date"
                                    fullWidth
                                    required
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            
                            {/* Core body */}
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField label="Chest" type="number" fullWidth value={formData.chest || ''} onChange={(e) => handleFieldChange('chest', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField label="Shoulders" type="number" fullWidth value={formData.shoulders || ''} onChange={(e) => handleFieldChange('shoulders', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField label="Neck" type="number" fullWidth value={formData.neck || ''} onChange={(e) => handleFieldChange('neck', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Waist" type="number" fullWidth value={formData.waist || ''} onChange={(e) => handleFieldChange('waist', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Hips" type="number" fullWidth value={formData.hips || ''} onChange={(e) => handleFieldChange('hips', e.target.value)} />
                            </Grid>
                            
                            {/* Arms */}
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Bicep" type="number" fullWidth value={formData.leftBicep || ''} onChange={(e) => handleFieldChange('leftBicep', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Bicep" type="number" fullWidth value={formData.rightBicep || ''} onChange={(e) => handleFieldChange('rightBicep', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Forearm" type="number" fullWidth value={formData.leftForearm || ''} onChange={(e) => handleFieldChange('leftForearm', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Forearm" type="number" fullWidth value={formData.rightForearm || ''} onChange={(e) => handleFieldChange('rightForearm', e.target.value)} />
                            </Grid>
                            
                            {/* Legs */}
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Thigh" type="number" fullWidth value={formData.leftThigh || ''} onChange={(e) => handleFieldChange('leftThigh', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Thigh" type="number" fullWidth value={formData.rightThigh || ''} onChange={(e) => handleFieldChange('rightThigh', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Calf" type="number" fullWidth value={formData.leftCalf || ''} onChange={(e) => handleFieldChange('leftCalf', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Calf" type="number" fullWidth value={formData.rightCalf || ''} onChange={(e) => handleFieldChange('rightCalf', e.target.value)} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setIsAddEditOpen(false)} color="inherit" disabled={saving}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onClose={() => !saving && setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Measurements?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the measurements from {entryToDelete?.date ? new Date(entryToDelete.date).toLocaleDateString() : ''}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsDeleteOpen(false)} color="inherit" disabled={saving}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
                        {saving ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
