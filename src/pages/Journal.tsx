import { useState, useMemo, useCallback, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { deleteWorkout } from '../services/db';
import { parseLocalDate } from '../utils/format';
import type { Workout, Exercise, SessionType } from '../types';
import { ActiveProgramCard } from '../components/routines/ActiveProgramCard';
import WorkoutItem from '../components/journal/WorkoutItem';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const Journal = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const {
        entries,
        templates,
        activeProgram,
        advanceActiveDay,
        activateProgram,
        loading: sessionsLoading,
        error: workoutsError,
        loadMore,
        hasMore
    } = useWorkouts();

    const templateMap = useMemo(() => {
        return templates.reduce<Record<string, string>>((acc, tpl) => {
            acc[tpl.id] = tpl.name;
            return acc;
        }, {});
    }, [templates]);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    const observer = useRef<IntersectionObserver | null>(null);

    const handleEditClick = useCallback((entry: Workout) => {
        void navigate(`/journal/${entry.id}/edit`);
    }, [navigate]);

    const handleDeleteClick = useCallback((id: string) => {
        setDeleteError(null);
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = async () => {
        if (!currentUser || !entryToDelete) return;

        try {
            setDeleteError(null);
            await deleteWorkout(currentUser.uid, entryToDelete);
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
        } catch (err) {
            console.error(err);
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete workout');
        }
    };

    const filteredAndSortedEntries = useMemo(() => {
        return entries
            .filter(entry => {
                if (typeFilter !== 'all' && entry.sessionType !== typeFilter) return false;
                if (startDate && entry.date < startDate) return false;
                if (endDate && entry.date > endDate) return false;
                return true;
            })
            .sort((a, b) => {
                const dateA = parseLocalDate(a.date).getTime();
                const dateB = parseLocalDate(b.date).getTime();
                return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
            });
    }, [entries, typeFilter, startDate, endDate, sortBy]);

    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (sessionsLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(obsEntries => {
            if (obsEntries[obsEntries.length - 1].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [sessionsLoading, hasMore, loadMore]);

    const exerciseMap = useMemo(() => {
        return exercises.reduce<Record<string, Exercise | undefined>>((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
    }, [exercises]);

    const isLoading = (sessionsLoading && entries.length === 0) || (exercisesLoading && exercises.length === 0);

    if (isLoading) return (
        <Container maxWidth="lg">
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="text" width={160} height={48} />
                <Skeleton variant="rectangular" width={120} height={38} sx={{ borderRadius: 2 }} />
            </Stack>
            <Skeleton variant="rectangular" height={52} sx={{ mb: 3, borderRadius: 2 }} />
            <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={112} sx={{ borderRadius: 3 }} />
                ))}
            </Stack>
        </Container>
    );

    const hasActiveFilters = typeFilter !== 'all' || Boolean(startDate) || Boolean(endDate);

    return (
        <Container maxWidth="lg">
            <PageHeader
                title={t('journal.title')}
                actions={
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => { void navigate('/journal/new'); }}
                    >
                        {t('journal.workout')}
                    </Button>
                }
            />

            {(workoutsError ?? deleteError) && (
                <Alert
                    severity="error"
                    sx={{ mb: 2.5 }}
                    onClose={deleteError ? () => { setDeleteError(null); } : undefined}
                >
                    {deleteError ?? workoutsError}
                </Alert>
            )}

            {activeProgram && (
                <ActiveProgramCard
                    compact
                    program={activeProgram}
                    templates={templates}
                    onAdvanceDay={advanceActiveDay}
                    onDeactivate={() => activateProgram(null)}
                />
            )}

            {/* Filter and Sort Bar */}
            <Accordion sx={{ mb: { xs: 2, md: 3 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2">{t('journal.filtersAndSorting')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0.5, pb: 2.5, px: 2.5 }}>
                    <Stack sx={{ alignItems: { xs: 'stretch', md: 'center' } }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
                            <InputLabel id="type-filter-label" htmlFor="type-filter-input">{t('journal.workoutType')}</InputLabel>
                            <Select
                                labelId="type-filter-label"
                                id="type-filter"
                                inputProps={{ id: 'type-filter-input' }}
                                value={typeFilter}
                                label={t('journal.workoutType')}
                                onChange={(e) => { setTypeFilter(e.target.value as SessionType | 'all'); }}
                                sx={{ textTransform: 'capitalize' }}
                            >
                                <MenuItem value="all">{t('journal.allTypes')}</MenuItem>
                                <MenuItem value="strength" sx={{ textTransform: 'capitalize' }}>{t('exerciseTypes.strength')}</MenuItem>
                                <MenuItem value="cardio" sx={{ textTransform: 'capitalize' }}>{t('exerciseTypes.cardio')}</MenuItem>
                                <MenuItem value="flexibility" sx={{ textTransform: 'capitalize' }}>{t('exerciseTypes.flexibility')}</MenuItem>
                                <MenuItem value="other" sx={{ textTransform: 'capitalize' }}>{t('exerciseTypes.other')}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            id="journal-date-from"
                            label={t('journal.from')}
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); }}
                            sx={{ minWidth: { xs: '100%', md: 155 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <TextField
                            id="journal-date-to"
                            label={t('journal.to')}
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); }}
                            sx={{ minWidth: { xs: '100%', md: 155 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 }, ml: { md: 'auto' } }}>
                            <InputLabel id="sort-by-label" htmlFor="sort-by-input">{t('journal.sortBy')}</InputLabel>
                            <Select
                                labelId="sort-by-label"
                                id="sort-by"
                                inputProps={{ id: 'sort-by-input' }}
                                value={sortBy}
                                label={t('journal.sortBy')}
                                onChange={(e) => { setSortBy(e.target.value); }}
                            >
                                <MenuItem value="recent">{t('journal.sortByRecent')}</MenuItem>
                                <MenuItem value="oldest">{t('journal.sortByOldest')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Workouts List */}
            <Box>
                {filteredAndSortedEntries.length === 0 ? (
                    <EmptyState
                        icon={<FitnessCenterIcon />}
                        title={entries.length === 0 ? t('journal.noWorkoutsYet') : t('journal.noWorkoutsMatch')}
                        actions={
                            entries.length === 0 ? (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => { void navigate('/journal/new'); }}
                                >
                                    {t('journal.workout')}
                                </Button>
                            ) : hasActiveFilters ? (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setTypeFilter('all');
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                >
                                    {t('common.clearFilters', { defaultValue: 'Clear Filters' })}
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredAndSortedEntries.map((entry, index) => (
                            <WorkoutItem
                                key={entry.id}
                                ref={index === filteredAndSortedEntries.length - 1 ? lastElementRef : null}
                                entry={entry}
                                exerciseMap={exerciseMap}
                                templateName={entry.templateId ? templateMap[entry.templateId] : undefined}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </List>
                )}
                {hasMore && (
                    <Stack sx={{ my: 4, alignItems: 'center' }}>
                        <CircularProgress size={32} />
                    </Stack>
                )}
                {!hasMore && filteredAndSortedEntries.length > 0 && (
                    <Typography variant="body2" align="center" sx={{ color: 'text.secondary', my: 4 }}>
                        {t('journal.endOfJournal')}
                    </Typography>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); }}>
                <DialogTitle>{t('journal.deleteWorkout')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('journal.deleteConfirmShort')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDeleteDialogOpen(false); }} color="inherit">{t('common.cancel')}</Button>
                    <Button onClick={() => { void confirmDelete(); }} color="error" variant="contained">
                        {t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Journal;
