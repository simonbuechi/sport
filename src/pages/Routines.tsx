import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { createProgram, updateProgram, deleteProgram } from '../services/db';
import type { Program } from '../types';
import { ActiveProgramCard } from '../components/routines/ActiveProgramCard';
import { ProgramCard } from '../components/routines/ProgramCard';
import { ProgramDialog, type ProgramFormData } from '../components/routines/ProgramDialog';
import TemplatesSection from '../components/journal/TemplatesSection';

const Routines: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { exercises } = useExercises();
    const {
        templates,
        programs,
        activeProgram,
        programsLoading,
        activateProgram,
        advanceActiveDay,
    } = useWorkouts();

    const initialTab = searchParams.get('tab') === 'templates' ? 1 : 0;
    const [activeTab, setActiveTab] = useState(initialTab);

    // Dialog state for Program creation/editing
    const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [saving, setSaving] = useState(false);

    // Delete dialog state
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'templates') {
            setActiveTab(1);
        } else if (tabParam === 'programs') {
            setActiveTab(0);
        }
    }, [searchParams]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSearchParams({ tab: newValue === 1 ? 'templates' : 'programs' });
    };

    const handleCreateProgram = () => {
        setEditingProgram(null);
        setIsProgramDialogOpen(true);
    };

    const handleEditProgram = (program: Program) => {
        setEditingProgram(program);
        setIsProgramDialogOpen(true);
    };

    const handleSaveProgram = async (data: ProgramFormData) => {
        if (!currentUser) return;
        setSaving(true);
        try {
            if (editingProgram) {
                await updateProgram(currentUser.uid, editingProgram.id, data);
            } else {
                await createProgram(currentUser.uid, data);
            }
            setIsProgramDialogOpen(false);
            setEditingProgram(null);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!currentUser || !programToDelete) return;
        setDeleting(true);
        try {
            await deleteProgram(currentUser.uid, programToDelete.id);
            setProgramToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 1.5, md: 3 } }}>
            {/* Page Header */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                    {t('routines.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('routines.subtitle')}
                </Typography>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="routines tabs">
                    <Tab
                        icon={<CalendarMonthIcon fontSize="small" />}
                        iconPosition="start"
                        label={t('routines.programs')}
                        sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }}
                    />
                    <Tab
                        icon={<DescriptionIcon fontSize="small" />}
                        iconPosition="start"
                        label={t('routines.templates')}
                        sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }}
                    />
                </Tabs>
            </Box>

            {/* TAB 0: Programs */}
            {activeTab === 0 && (
                <Box>
                    {/* Active Program Card at top */}
                    {activeProgram && (
                        <ActiveProgramCard
                            program={activeProgram}
                            templates={templates}
                            onAdvanceDay={advanceActiveDay}
                            onDeactivate={() => activateProgram(null)}
                        />
                    )}

                    {/* Section Header */}
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {t('programs.allPrograms')}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateProgram}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            {t('programs.newProgram')}
                        </Button>
                    </Stack>

                    {/* Programs List */}
                    {programsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : programs.length === 0 ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: { xs: 3, sm: 5 },
                                textAlign: 'center',
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <CalendarMonthIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1.5, opacity: 0.6 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                {t('programs.noProgramsYet')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>
                                {t('programs.emptyDescription')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateProgram}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {t('programs.createFirstProgram')}
                            </Button>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {programs.map((program) => (
                                <ProgramCard
                                    key={program.id}
                                    program={program}
                                    templates={templates}
                                    onEdit={handleEditProgram}
                                    onDelete={(p) => { setProgramToDelete(p); }}
                                    onActivate={activateProgram}
                                />
                            ))}
                        </Stack>
                    )}
                </Box>
            )}

            {/* TAB 1: Templates */}
            {activeTab === 1 && (
                <Box>
                    <TemplatesSection
                        userId={currentUser?.uid ?? ''}
                        exercises={exercises}
                    />
                </Box>
            )}

            {/* Program Create/Edit Dialog */}
            <ProgramDialog
                open={isProgramDialogOpen}
                onClose={() => { setIsProgramDialogOpen(false); }}
                onSave={handleSaveProgram}
                editingProgram={editingProgram}
                templates={templates}
                saving={saving}
            />

            {/* Program Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(programToDelete)}
                onClose={() => { if (!deleting) setProgramToDelete(null); }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {t('programs.deleteProgramTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('programs.deleteProgramConfirm', { name: programToDelete?.name ?? '' })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => { setProgramToDelete(null); }} disabled={deleting} color="inherit">
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={() => void handleDeleteProgram()}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                    >
                        {deleting ? t('common.deleting') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Routines;
