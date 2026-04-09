import { useState } from 'react';
import Box from '@mui/material/Box';
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

import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import MonitorWeight from '@mui/icons-material/MonitorWeight';
import { LineChart } from '@mui/x-charts/LineChart';
import type { UserProfile, WeightEntry } from '../../types';
import { updateUserProfile } from '../../services/db';

interface WeightSectionProps {
    profile: Partial<UserProfile>;
    onWeightsUpdated: (newWeights: WeightEntry[]) => void;
}

export default function WeightSection({ profile, onWeightsUpdated }: WeightSectionProps) {
    const weights = profile.weights ?? [];
    
    // Sort weights by date descending
    const sortedWeights = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Prepare chart data (last 6 months, sorted ascending)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const chartData = [...weights]
        .filter(w => new Date(w.date) >= sixMonthsAgo)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    const chartDates = chartData.map(w => new Date(w.date));
    const chartWeights = chartData.map(w => w.weightKg);

    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
    const [weightToDelete, setWeightToDelete] = useState<WeightEntry | null>(null);
    const [saving, setSaving] = useState(false);
    
    // Form fields
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formWeight, setFormWeight] = useState('');
    const [formBodyFat, setFormBodyFat] = useState('');

    const handleOpenAdd = () => {
        setEditingWeight(null);
        setFormDate(new Date().toISOString().split('T')[0]);
        // Default to the last recorded weight if available
        setFormWeight(sortedWeights.length > 0 ? sortedWeights[0].weightKg.toString() : '');
        setFormBodyFat('');
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (weight: WeightEntry) => {
        setEditingWeight(weight);
        setFormDate(weight.date);
        setFormWeight(weight.weightKg.toString());
        setFormBodyFat(weight.bodyFatPercent ? weight.bodyFatPercent.toString() : '');
        setIsAddEditOpen(true);
    };

    const handleOpenDelete = (weight: WeightEntry) => {
        setWeightToDelete(weight);
        setIsDeleteOpen(true);
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

            let newWeights = [...weights];
            
            if (editingWeight) {
                // Update existing
                newWeights = newWeights.map(w => {
                    if (w.id === editingWeight.id) {
                        const updated: WeightEntry = { 
                            ...w, 
                            date: formDate, 
                            weightKg: numWeight, 
                            bodyFatPercent: numBodyFat 
                        };
                        // Remove undefined values
                        return Object.fromEntries(
                            Object.entries(updated).filter(([_, v]) => v !== undefined)
                        ) as WeightEntry;
                    }
                    return w;
                });
            } else {
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
            }

            // Save to database
            await updateUserProfile(profile.uid, { weights: newWeights });
            
            // Notify parent
            onWeightsUpdated(newWeights);
            setIsAddEditOpen(false);
        } catch (error) {
            console.error("Failed to save weight", error);
            alert("Failed to save weight entry.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!profile.uid || !weightToDelete) return;
        
        try {
            setSaving(true);
            const newWeights = weights.filter(w => w.id !== weightToDelete.id);
            await updateUserProfile(profile.uid, { weights: newWeights });
            onWeightsUpdated(newWeights);
            setIsDeleteOpen(false);
            setWeightToDelete(null);
        } catch (error) {
            console.error("Failed to delete weight", error);
            alert("Failed to delete weight entry.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3
                }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center"
                    }}>
                    <MonitorWeight color="primary" sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h5" component="h2">Weight Tracking</Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<Add />} 
                    onClick={handleOpenAdd}
                    size="small"
                >
                    Log Weight
                </Button>
            </Box>
            <Box sx={{ width: '100%', height: 250, mt: 2, mb: 4 }}>
                <LineChart
                    xAxis={[{ 
                        data: chartDates, 
                        scaleType: 'time',
                        min: sixMonthsAgo,
                        max: new Date(),
                        tickNumber: 6,
                        valueFormatter: (value) => {
                            const date = new Date(value as string | number | Date);
                            return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                        }
                    }]}
                    series={[{ 
                        data: chartWeights,
                        label: 'Weight (kg)',
                        showMark: true,
                        curve: 'linear'
                    }]}
                    margin={{ top: 20, right: 20, bottom: 35, left: 40 }}
                />
            </Box>
            {sortedWeights.length === 0 ? (
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        textAlign: 'center',
                        py: 3,
                        fontStyle: 'italic'
                    }}>
                    No weight entries recorded yet. Track your progress by logging your first weight.
                </Typography>
            ) : (
                <List disablePadding>
                    {sortedWeights.map((weight, index) => (
                        <Box key={weight.id}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem
                                sx={{ px: 1, py: 1.5 }}
                                secondaryAction={
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 0.5
                                        }}>
                                        <IconButton edge="end" aria-label="edit" size="small" onClick={() => { handleOpenEdit(weight); }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => { handleOpenDelete(weight); }}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={<Typography sx={{
                                        fontWeight: "600"
                                    }}>{weight.weightKg} kg</Typography>}
                                    secondary={`${new Date(weight.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}${weight.bodyFatPercent ? ` • ${String(weight.bodyFatPercent)}% Body Fat` : ''}`}
                                />
                            </ListItem>
                        </Box>
                    ))}
                </List>
            )}
            {/* Add/Edit Dialog */}
            <Dialog open={isAddEditOpen} onClose={() => { if (!saving) { setIsAddEditOpen(false); } }} maxWidth="xs" fullWidth
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (e: React.SyntheticEvent) => { void handleSave(e); },
                    }
                }}
            >
                <DialogTitle>{editingWeight ? 'Edit Weight Entry' : 'Log New Weight'}</DialogTitle>
                    <DialogContent dividers>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                                py: 1
                            }}>
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
                            <TextField
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
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onClose={() => { if (!saving) { setIsDeleteOpen(false); } }} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Weight Entry?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the weight entry of {weightToDelete?.weightKg} kg on {weightToDelete?.date ? new Date(weightToDelete.date).toLocaleDateString() : ''}? This action cannot be undone.
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
