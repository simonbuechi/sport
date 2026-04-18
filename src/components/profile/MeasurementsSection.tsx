import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DialogContentText from '@mui/material/DialogContentText';
import Grid from '@mui/material/Grid';

import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Straighten from '@mui/icons-material/Straighten';
import type { UserProfile, MeasurementEntry } from '../../types';
import { updateUserProfile } from '../../services/db';

interface MeasurementsSectionProps {
    profile: Partial<UserProfile>;
    onMeasurementsUpdated: (newMeasurements: MeasurementEntry[]) => void;
}

export default function MeasurementsSection({ profile, onMeasurementsUpdated }: MeasurementsSectionProps) {
    const measurements = profile.measurements ?? [];
    
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
            ? (({ id: _id, date: _date, ...rest }) => rest)(sortedMeasurements[0])
            : {};
        setFormData(initialData as Omit<MeasurementEntry, 'id' | 'date'>);
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (entry: MeasurementEntry) => {
        setEditingEntry(entry);
        setFormDate(entry.date);
        const { id: _id, date: _date, ...data } = entry;
        setFormData(data);
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

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!profile.uid) return;
        
        try {
            setSaving(true);
            let newMeasurements = [...measurements];
            const newEntry: Partial<MeasurementEntry> = {
                ...formData,
                date: formDate,
            };
            
            if (editingEntry) {
                const updated: MeasurementEntry = {
                    ...newEntry,
                    id: editingEntry.id
                } as MeasurementEntry;
                const cleaned = Object.fromEntries(
                    Object.entries(updated).filter(([_, v]) => v !== undefined)
                ) as MeasurementEntry;
                newMeasurements = newMeasurements.map(m => m.id === editingEntry.id ? cleaned : m);
            } else {
                const nextEntry: MeasurementEntry = {
                    ...newEntry,
                    id: crypto.randomUUID()
                } as MeasurementEntry;
                const cleaned = Object.fromEntries(
                    Object.entries(nextEntry).filter(([_, v]) => v !== undefined)
                ) as MeasurementEntry;
                newMeasurements.push(cleaned);
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
        if (entry.waist) parts.push(`Waist: ${String(entry.waist)}`);
        if (entry.hips) parts.push(`Hips: ${String(entry.hips)}`);
        if (entry.chest) parts.push(`Chest: ${String(entry.chest)}`);
        return parts.length > 0 ? parts.join(' | ') + (Object.keys(entry).length > 4 ? '...' : '') : 'Empty entry';
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, }}>
            <Stack sx={{ mb: 3 }}>
                <Stack>
                    <Straighten color="primary" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h5" component="h2">Measurements</Typography>
                </Stack>
                <Button 
                    variant="outlined" 
                    startIcon={<Add />} 
                    onClick={handleOpenAdd}
                    size="small"
                >
                    Log Size
                </Button>
            </Stack>
            {sortedMeasurements.length === 0 ? (
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        textAlign: 'center',
                        py: 3,
                        }}>
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
                                        <Stack spacing={0.5}>
                                            <IconButton edge="end" aria-label="edit" size="small" onClick={() => { handleOpenEdit(entry); }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => { handleOpenDelete(entry); }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                }
                            >
                                <ListItemText
                                    primary={<Typography>{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>}
                                    secondary={getMeasurementSummary(entry)}
                                />
                            </ListItem>
                        </Box>
                    ))}
                </List>
            )}
            {/* Add/Edit Dialog */}
            <Dialog open={isAddEditOpen} onClose={() => { if (!saving) { setIsAddEditOpen(false); } }} maxWidth="sm" fullWidth
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (e: React.SyntheticEvent) => { void handleSave(e); },
                    }
                }}
            >
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
                                    onChange={(e) => { setFormDate(e.target.value); }}
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                />
                            </Grid>
                            
                            {/* Core body */}
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField label="Chest" type="number" fullWidth value={formData.chest ?? ''} onChange={(e) => { handleFieldChange('chest', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField label="Shoulders" type="number" fullWidth value={formData.shoulders ?? ''} onChange={(e) => { handleFieldChange('shoulders', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField label="Neck" type="number" fullWidth value={formData.neck ?? ''} onChange={(e) => { handleFieldChange('neck', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Waist" type="number" fullWidth value={formData.waist ?? ''} onChange={(e) => { handleFieldChange('waist', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Hips" type="number" fullWidth value={formData.hips ?? ''} onChange={(e) => { handleFieldChange('hips', e.target.value); }} />
                            </Grid>
                            
                            {/* Arms */}
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Bicep" type="number" fullWidth value={formData.leftBicep ?? ''} onChange={(e) => { handleFieldChange('leftBicep', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Bicep" type="number" fullWidth value={formData.rightBicep ?? ''} onChange={(e) => { handleFieldChange('rightBicep', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Forearm" type="number" fullWidth value={formData.leftForearm ?? ''} onChange={(e) => { handleFieldChange('leftForearm', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Forearm" type="number" fullWidth value={formData.rightForearm ?? ''} onChange={(e) => { handleFieldChange('rightForearm', e.target.value); }} />
                            </Grid>
                            
                            {/* Legs */}
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Thigh" type="number" fullWidth value={formData.leftThigh ?? ''} onChange={(e) => { handleFieldChange('leftThigh', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Thigh" type="number" fullWidth value={formData.rightThigh ?? ''} onChange={(e) => { handleFieldChange('rightThigh', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Left Calf" type="number" fullWidth value={formData.leftCalf ?? ''} onChange={(e) => { handleFieldChange('leftCalf', e.target.value); }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField label="Right Calf" type="number" fullWidth value={formData.rightCalf ?? ''} onChange={(e) => { handleFieldChange('rightCalf', e.target.value); }} />
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
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onClose={() => { if (!saving) { setIsDeleteOpen(false); } }} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Measurements?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the measurements from {entryToDelete?.date ? new Date(entryToDelete.date).toLocaleDateString() : ''}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsDeleteOpen(false); }} color="inherit" disabled={saving}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
                        {saving ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
