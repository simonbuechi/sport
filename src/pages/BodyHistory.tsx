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

import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { formatWeight } from '../utils/format';
import type { UserProfile, MeasurementEntry } from '../types';
import { useTranslation } from 'react-i18next';

const BodyHistory = () => {
    const { t, i18n } = useTranslation();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState(0);

    const { profile, updateProfile, loading, error: profileError } = useUserProfile();
    const [error, setError] = useState('');
    
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'weight' | 'measurement', date: string, value: string } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profileError) setError(profileError);
    }, [profileError]);

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
            
            await updateProfile(updatedData);
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
        if (entry.waist) parts.push(`${t('measurements.waist')}: ${String(entry.waist)}cm`);
        if (entry.hips) parts.push(`${t('measurements.hips')}: ${String(entry.hips)}cm`);
        if (entry.chest) parts.push(`${t('measurements.chest')}: ${String(entry.chest)}cm`);
        if (entry.shoulders) parts.push(`${t('measurements.shoulders')}: ${String(entry.shoulders)}cm`);
        if (entry.neck) parts.push(`${t('measurements.neck')}: ${String(entry.neck)}cm`);
        return parts.length > 0 ? parts.join(' • ') : t('common.noData', { defaultValue: 'No data' });
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
                    to="/profile"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2 }}
                >
                    {t('common.back')}
                </Button>
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('profile.history')}
                </Typography>
            </Box>

            <Tabs 
                value={activeTab} 
                onChange={(_, newValue: number) => { setActiveTab(newValue); }}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label={`${t('dashboard.weight')} (${String(sortedWeights.length)})`} />
                <Tab label={`${t('profile.measurements')} (${String(sortedMeasurements.length)})`} />
            </Tabs>

            {activeTab === 0 && (
                <Box>
                    {sortedWeights.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('journal.date')}</TableCell>
                                        <TableCell align="right">{t('dashboard.weight')}</TableCell>
                                        <TableCell align="right">{t('profile.bmi')}</TableCell>
                                        <TableCell align="right">{t('profile.bodyFat')}</TableCell>
                                        <TableCell align="right">{t('common.delete')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedWeights.map((weight) => (
                                        <TableRow key={weight.id} hover>
                                            <TableCell>
                                                {new Date(weight.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}
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
                                                    aria-label={t('common.delete')}
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
                            <Typography color="text.secondary">{t('dashboard.noWeightData')}</Typography>
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
                                        <TableCell>{t('journal.date')}</TableCell>
                                        <TableCell>{t('profile.overview')}</TableCell>
                                        <TableCell align="right">{t('common.delete')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedMeasurements.map((entry) => (
                                        <TableRow key={entry.id} hover>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                {new Date(entry.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{getMeasurementSummary(entry)}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => { handleDeleteClick(entry.id, 'measurement', entry.date, 'measurements'); }}
                                                    aria-label={t('common.delete')}
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
                            <Typography color="text.secondary">{t('profile.noMeasurements')}</Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onClose={() => { if (!saving) { setIsDeleteOpen(false); } }} maxWidth="xs" fullWidth>
                <DialogTitle>{t('profile.deleteEntryTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('profile.deleteEntryConfirm')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setIsDeleteOpen(false); }} color="inherit" disabled={saving}>{t('common.cancel')}</Button>
                    <Button onClick={() => { void handleDeleteConfirm(); }} color="error" variant="contained" disabled={saving}>
                        {saving ? t('common.loading') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BodyHistory;
