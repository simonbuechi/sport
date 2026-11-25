import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
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
import ProgramLibrarySection from '../components/routines/ProgramLibrarySection';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

const Routines: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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

    const isTemplatesPath = location.pathname === '/routines/templates' || searchParams.get('tab') === 'templates';
    const isLibraryPath = location.pathname === '/routines/library' || searchParams.get('tab') === 'library';
    const activeTab = isLibraryPath ? 2 : (isTemplatesPath ? 1 : 0);

    const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [saving, setSaving] = useState(false);

    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'templates') {
            void navigate('/routines/templates', { replace: true });
        } else if (tabParam === 'programs') {
            void navigate('/routines/programs', { replace: true });
        } else if (tabParam === 'library') {
            void navigate('/routines/library', { replace: true });
        } else if (location.pathname === '/routines') {
            void navigate('/routines/programs', { replace: true });
        }
    }, [location.pathname, searchParams, navigate]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        if (newValue === 2) void navigate('/routines/library');
        else if (newValue === 1) void navigate('/routines/templates');
        else void navigate('/routines/programs');
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
        if (!currentUser) throw new Error('User is not authenticated');
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
        <Container maxWidth="lg">
            <PageHeader
                title={t('routines.title')}
                subtitle={t('routines.subtitle')}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="routines tabs">
                    <Tab
                        icon={<CalendarMonthIcon fontSize="small" />}
                        iconPosition="start"
                        label={t('routines.programs')}
                    />
                    <Tab
                        icon={<DescriptionIcon fontSize="small" />}
                        iconPosition="start"
                        label={t('routines.templates')}
                    />
                    <Tab
                        icon={<LocalLibraryIcon fontSize="small" />}
                        iconPosition="start"
                        label={t('routines.library')}
                    />
                </Tabs>
            </Box>

            {/* TAB 0: Programs */}
            {activeTab === 0 && (
                <Box>
                    {activeProgram && (
                        <ActiveProgramCard
                            program={activeProgram}
                            templates={templates}
                            onAdvanceDay={advanceActiveDay}
                            onDeactivate={() => activateProgram(null)}
                        />
                    )}

                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6">
                            {t('programs.allPrograms')}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<LocalLibraryIcon />}
                                onClick={() => { void navigate('/routines/library'); }}
                            >
                                {t('programs.browseLibrary', { defaultValue: 'Browse Library' })}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateProgram}
                            >
                                {t('programs.newProgram')}
                            </Button>
                        </Stack>
                    </Stack>

                    {programsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : programs.length === 0 ? (
                        <EmptyState
                            icon={<CalendarMonthIcon />}
                            title={t('programs.noProgramsYet')}
                            description={t('programs.emptyDescription')}
                            actions={
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={handleCreateProgram}
                                    >
                                        {t('programs.createFirstProgram')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<LocalLibraryIcon />}
                                        onClick={() => { void navigate('/routines/library'); }}
                                    >
                                        {t('programs.browseLibrary', { defaultValue: 'Browse Program Library' })}
                                    </Button>
                                </>
                            }
                        />
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
                <TemplatesSection
                    userId={currentUser?.uid ?? ''}
                    exercises={exercises}
                />
            )}

            {/* TAB 2: Program Library */}
            {activeTab === 2 && (
                <ProgramLibrarySection
                    onProgramCopied={() => {
                        void navigate('/routines/programs');
                    }}
                />
            )}

            <ProgramDialog
                open={isProgramDialogOpen}
                onClose={() => { setIsProgramDialogOpen(false); }}
                onSave={handleSaveProgram}
                editingProgram={editingProgram}
                templates={templates}
                saving={saving}
            />

            <Dialog
                open={Boolean(programToDelete)}
                onClose={() => { if (!deleting) setProgramToDelete(null); }}
            >
                <DialogTitle>
                    {t('programs.deleteProgramTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('programs.deleteProgramConfirm', { name: programToDelete?.name ?? '' })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
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
