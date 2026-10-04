import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { reauthenticateWithPopup, deleteUser } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { googleProvider } from '../firebase/config';
import { softDeleteUserProfile } from '../services/db';
import { getWorkoutDraftKey } from '../hooks/useWorkoutForm';
import { useTranslation } from 'react-i18next';

const DeleteAccount: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser, googleSignIn } = useAuth();

    const [isDeleted, setIsDeleted] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setLoginLoading(true);
            setError(null);
            await googleSignIn();
        } catch (err: unknown) {
            console.error('Failed to log in with Google', err);
            setError(err instanceof Error ? err.message : t('auth.failedToLoginGoogle'));
        } finally {
            setLoginLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setConfirmationInput('');
        setError(null);
        setConfirmDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (loading) return;
        setConfirmDialogOpen(false);
        setConfirmationInput('');
    };

    const handleDeleteAccount = async () => {
        if (!currentUser || confirmationInput.trim() !== 'DELETE') return;

        setLoading(true);
        setError(null);

        try {
            const uid = currentUser.uid;

            // 1. Re-authenticate with Google to ensure fresh credentials for deletion
            await reauthenticateWithPopup(currentUser, googleProvider);

            // 2. Soft delete user profile in Firestore
            await softDeleteUserProfile(uid);

            // 3. Clear local storage drafts and broadcast update
            try {
                const draftKey = getWorkoutDraftKey(uid, 'new');
                localStorage.removeItem(draftKey);
                localStorage.removeItem('workout_draft_new');
                window.dispatchEvent(new Event('draft-updated'));
            } catch (storageErr) {
                console.warn('Failed to clear local draft storage', storageErr);
            }

            // 4. Delete Firebase Auth user
            await deleteUser(currentUser);

            // 5. Mark deleted state
            setIsDeleted(true);
            setConfirmDialogOpen(false);
        } catch (err: unknown) {
            console.error('Failed to delete account:', err);
            const errCode = typeof err === 'object' && err !== null && 'code' in err 
                ? String((err as { code: unknown }).code) 
                : undefined;
            if (errCode === 'auth/popup-closed-by-user') {
                setError(t('deleteAccount.reauthRequired'));
            } else {
                setError(err instanceof Error ? err.message : t('deleteAccount.error'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (isDeleted) {
        return (
            <Container maxWidth="sm" sx={{ py: 6 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        textAlign: 'center',
                        borderRadius: 3,
                    }}
                >
                    <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {t('deleteAccount.successTitle')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        {t('deleteAccount.successMessage')}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => void navigate('/')}
                        sx={{ minWidth: 200 }}
                    >
                        {t('deleteAccount.returnHome')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => void navigate(-1)}
                    sx={{ mb: 1, textTransform: 'none' }}
                >
                    {t('common.back')}
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main' }}>
                    {t('deleteAccount.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('deleteAccount.subtitle')}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => { setError(null); }}>
                    {error}
                </Alert>
            )}

            {!currentUser ? (
                <Paper
                    elevation={2}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 1.5 }}>
                        {t('deleteAccount.notLoggedIn')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('deleteAccount.description')}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={loginLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                        disabled={loginLoading}
                        onClick={() => void handleGoogleLogin()}
                        sx={{ py: 1.2, px: 3 }}
                    >
                        {loginLoading ? t('common.loading') : t('auth.loginWithGoogle')}
                    </Button>
                </Paper>
            ) : (
                <Paper
                    elevation={2}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        border: 1,
                        borderColor: 'error.light',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('deleteAccount.accountDetails')}
                    </Typography>
                    <Box sx={{ mb: 3, bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>{t('deleteAccount.email')}:</strong> {currentUser.email ?? 'N/A'}
                        </Typography>
                        {currentUser.displayName && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                <strong>{t('deleteAccount.name')}:</strong> {currentUser.displayName}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>{t('deleteAccount.userId')}:</strong> {currentUser.uid}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon color="error" />
                        {t('deleteAccount.warningTitle')}
                    </Typography>

                    <List dense sx={{ mb: 3 }}>
                        <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                •
                            </ListItemIcon>
                            <ListItemText primary={t('deleteAccount.warning1')} />
                        </ListItem>
                        <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                •
                            </ListItemIcon>
                            <ListItemText primary={t('deleteAccount.warning2')} />
                        </ListItem>
                        <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                •
                            </ListItemIcon>
                            <ListItemText primary={t('deleteAccount.warning3')} />
                        </ListItem>
                    </List>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={handleOpenDialog}
                        fullWidth
                        size="large"
                        sx={{ py: 1.2, fontWeight: 700 }}
                    >
                        {t('deleteAccount.deleteButton')}
                    </Button>
                </Paper>
            )}

            {/* Safeguard Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                aria-labelledby="confirm-delete-dialog-title"
            >
                <DialogTitle id="confirm-delete-dialog-title" sx={{ color: 'error.main', fontWeight: 700 }}>
                    {t('deleteAccount.dialogTitle')}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {t('deleteAccount.dialogPrompt', { email: currentUser?.email ?? '' })}
                    </Typography>

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="DELETE"
                        value={confirmationInput}
                        onChange={(e) => { setConfirmationInput(e.target.value); }}
                        disabled={loading}
                        error={confirmationInput.length > 0 && confirmationInput !== 'DELETE'}
                        helperText={confirmationInput.length > 0 && confirmationInput !== 'DELETE' ? t('deleteAccount.typeToConfirm') : ''}
                        sx={{ mt: 1 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={handleCloseDialog} disabled={loading} color="inherit">
                        {t('deleteAccount.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={loading || confirmationInput.trim() !== 'DELETE'}
                        onClick={() => void handleDeleteAccount()}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <DeleteForeverIcon />}
                    >
                        {loading ? t('deleteAccount.deleting') : t('deleteAccount.confirmButton')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DeleteAccount;
