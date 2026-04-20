import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Delete from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { getUserProfile, updateUserProfile } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { formatWeight } from '../utils/format';
import type { UserProfile, MeasurementEntry } from '../types';

const BodyHistory = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState(0);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'weight' | 'measurement', date: string, value: string } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const userData = await getUserProfile(currentUser.uid);
                setProfile(userData);
            } catch (err) {
                console.error(err);
                setError('Failed to load body history');
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [currentUser]);

    const handleDeleteClick = (id: string, type: 'weight' | 'measurement', date: string, value: string) => {
        setItemToDelete({ id, type, date, value });
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!currentUser || !itemToDelete || !profile) return;

        try {
            setSaving(true);
            let updatedData: Partial<UserProfile> = {};
            
            if (itemToDelete.type === 'weight') {
                const newWeights = (profile.weights ?? []).filter(w => w.id !== itemToDelete.id);
                updatedData = { weights: newWeights };
            } else {
                const newMeasurements = (profile.measurements ?? []).filter(m => m.id !== itemToDelete.id);
                updatedData = { measurements: newMeasurements };
            }
            
            await updateUserProfile(currentUser.uid, updatedData);
            setProfile({ ...profile, ...updatedData });
            setIsDeleteOpen(false);
            setItemToDelete(null);
        } catch (err) {
            console.error("Failed to delete entry", err);
            alert("Failed to delete entry.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Container sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error || !profile) return <Container sx={{ mt: 4 }}><Typography color="error">{error || 'Profile not found'}</Typography></Container>;

    const sortedWeights = [...(profile.weights ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedMeasurements = [...(profile.measurements ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getMeasurementSummary = (entry: MeasurementEntry) => {
        const parts = [];
        if (entry.waist) parts.push(`Waist: ${String(entry.waist)}cm`);
        if (entry.hips) parts.push(`Hips: ${String(entry.hips)}cm`);
        if (entry.chest) parts.push(`Chest: ${String(entry.chest)}cm`);
        if (entry.shoulders) parts.push(`Shoulders: ${String(entry.shoulders)}cm`);
        if (entry.neck) parts.push(`Neck: ${String(entry.neck)}cm`);
        return parts.length > 0 ? parts.join(' • ') : 'No data';
    };

    const calculateBMI = (weightKg: number) => {
        if (!profile.height) return null;
        const heightM = profile.height / 100;
        return (weightKg / (heightM * heightM)).toFixed(1);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <Button
                    component={RouterLink}
                    to="/profile/body"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2 }}
                >
                    Back to Body
                </Button>
                <Typography variant="h4" component="h1" gutterBottom>
                    Body History
                </Typography>
            </Box>

            <Tabs 
                value={activeTab} 
                onChange={(_, newValue: number) => { setActiveTab(newValue); }}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label={`Weight (${String(sortedWeights.length)})`} />
                <Tab label={`Measurements (${String(sortedMeasurements.length)})`} />
            </Tabs>

            {activeTab === 0 && (
                <Box>
                    {sortedWeights.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Weight</TableCell>
                                        <TableCell align="right">BMI</TableCell>
                                        <TableCell align="right">Body Fat %</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedWeights.map((weight) => (
                                        <TableRow key={weight.id} hover>
                                            <TableCell>
                                                {new Date(weight.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {formatWeight(weight.weightKg)} kg
                                            </TableCell>
                                            <TableCell align="right">
                                                {calculateBMI(weight.weightKg) ?? '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                {weight.bodyFatPercent ? `${String(weight.bodyFatPercent)}%` : '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => { handleDeleteClick(weight.id, 'weight', weight.date, `${String(weight.weightKg)}kg`); }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Paper variant="outlined" sx={{ py: 6, textAlign: 'center', bgcolor: 'background.default' }}>
                            <Typography color="text.secondary">No weight entries recorded.</Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    {sortedMeasurements.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Details</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedMeasurements.map((entry) => (
                                        <TableRow key={entry.id} hover>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{getMeasurementSummary(entry)}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => { handleDeleteClick(entry.id, 'measurement', entry.date, 'measurements'); }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Paper variant="outlined" sx={{ py: 6, textAlign: 'center', bgcolor: 'background.default' }}>
                            <Typography color="text.secondary">No measurements recorded.</Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onClose={() => { if (!saving) { setIsDeleteOpen(false); } }} maxWidth="xs" fullWidth>
                <DialogTitle>Delete {itemToDelete?.type === 'weight' ? 'Weight Entry' : 'Measurements'}?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the {itemToDelete?.type} log from {itemToDelete?.date ? new Date(itemToDelete.date).toLocaleDateString() : ''}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsDeleteOpen(false); }} color="inherit" disabled={saving}>Cancel</Button>
                    <Button onClick={() => { void handleDeleteConfirm(); }} color="error" variant="contained" disabled={saving}>
                        {saving ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BodyHistory;
