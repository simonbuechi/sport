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
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { deleteWorkout } from '../services/db';
import type { Workout, Exercise, SessionType } from '../types';
import WorkoutItem from '../components/journal/WorkoutItem';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';

const Journal = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, loading: sessionsLoading, loadMore, hasMore } = useWorkouts();

    const templateMap = useMemo(() => {
        return templates.reduce<Record<string, string>>((acc, t) => {
            acc[t.id] = t.name;
            return acc;
        }, {});
    }, [templates]);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Filter and Sort State
    const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    // Infinite Scroll State
    const observer = useRef<IntersectionObserver | null>(null);


    const handleEditClick = useCallback((entry: Workout) => {
        void navigate(`/journal/${entry.id}/edit`);
    }, [navigate]);

    const handleDeleteClick = useCallback((id: string) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = async () => {
        if (!currentUser || !entryToDelete) return;

        try {
            await deleteWorkout(currentUser.uid, entryToDelete);
            // entries state is managed by WorkoutsContext and will update via onSnapshot
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
        } catch (err) {
            console.error(err);
        }
    };

    // Filtered and Sorted entries
    const filteredAndSortedEntries = useMemo(() => {
        return entries
            .filter(entry => {
                // Type filter
                if (typeFilter !== 'all' && entry.sessionType !== typeFilter) return false;

                // Date filter
                if (startDate && entry.date < startDate) return false;
                if (endDate && entry.date > endDate) return false;

                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
            });
    }, [entries, typeFilter, startDate, endDate, sortBy]);

    // Infinite Scroll Logic
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

    const displayedEntries = filteredAndSortedEntries;

    const exerciseMap = useMemo(() => {
        return exercises.reduce<Record<string, Exercise | undefined>>((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
    }, [exercises]);

    const isLoading = (sessionsLoading && entries.length === 0) || (exercisesLoading && exercises.length === 0);

    if (isLoading) return (
        <Container maxWidth="lg">
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                sx={{ 
                    justifyContent: "space-between", 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mt: { xs: 0.5, md: 2 }, 
                    mb: { xs: 1.5, md: 4 } 
                }}
            >
                <Skeleton variant="text" width={150} height={60} />
                <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'space-between', sm: 'flex-end' }, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                </Stack>
            </Stack>
            <Skeleton variant="rectangular" height={56} sx={{ mb: { xs: 2, md: 3 }, borderRadius: 2 }} />
            <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                ))}
            </Stack>
        </Container>
    );

    return (
        <Container maxWidth="lg">
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                sx={{ 
                    justifyContent: "space-between", 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mt: { xs: 0.5, md: 2 }, 
                    mb: { xs: 1.5, md: 4 } 
                }}
            >
                <Typography variant="h4" component="h1">
                    {t('journal.title')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'space-between', sm: 'flex-end' }, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DescriptionIcon />}
                        onClick={() => navigate('/journal/templates')}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        {t('journal.templates')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/journal/new')}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        {t('journal.workout')}
                    </Button>
                </Stack>
            </Stack>

            {/* Filter and Sort Bar */}
            <Accordion
                elevation={0}
                sx={{
                    bgcolor: 'background.default',
                    mb: { xs: 2, md: 3 },
                    '&:before': { display: 'none' },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px !important'
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 2 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t('journal.filtersAndSorting')}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                    <Stack sx={{ alignItems: { xs: 'stretch', md: 'flex-end' } }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
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
                            sx={{ minWidth: { xs: '100%', md: 150 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <TextField
                            id="journal-date-to"
                            label={t('journal.to')}
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); }}
                            sx={{ minWidth: { xs: '100%', md: 150 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 }, ml: { md: 'auto' } }}>
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
                    <Alert severity="info" variant="outlined">
                        {entries.length === 0
                            ? t('journal.noWorkoutsYet')
                            : t('journal.noWorkoutsMatch')}
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {displayedEntries.map((entry, index) => (
                            <WorkoutItem
                                key={entry.id}
                                ref={index === displayedEntries.length - 1 ? lastElementRef : null}
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
                    <Typography
                        variant="body2"
                        align="center"
                        sx={{
                            color: "text.secondary",
                            my: 4
                        }}>
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
                    <Button onClick={() => { setDeleteDialogOpen(false); }}>{t('common.cancel')}</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        {t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default Journal;
