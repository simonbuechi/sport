import { useState, useMemo, useRef, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { Link as RouterLink } from 'react-router-dom';
import type { ExerciseType, ExerciseCategory, BodyPart } from '../types';
import MarkerIcons from '../components/exercises/MarkerIcons';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminUser } from '../constants/admin';
import { EXERCISE_TYPES, BODY_PARTS, CATEGORIES } from '../constants/exercises';
import { useTranslation } from 'react-i18next';

const Exercises = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const isAdmin = isAdminUser(currentUser?.uid);
    const { exercises, loading: exercisesLoading, error: exercisesError } = useExercises();
    const { profile } = useUserProfile();
    const [filter, setFilter] = useState<ExerciseType | 'all'>('all');
    const [bodypartFilter, setBodypartFilter] = useState<BodyPart | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const observer = useRef<IntersectionObserver | null>(null);
    const [displayCount, setDisplayCount] = useState(30);

    const [prevFilters, setPrevFilters] = useState({ filter, bodypartFilter, categoryFilter, searchTerm });
    if (
        prevFilters.filter !== filter ||
        prevFilters.bodypartFilter !== bodypartFilter ||
        prevFilters.categoryFilter !== categoryFilter ||
        prevFilters.searchTerm !== searchTerm
    ) {
        setDisplayCount(30);
        setPrevFilters({ filter, bodypartFilter, categoryFilter, searchTerm });
    }

    const filteredExercises = useMemo(() => {
        try {
            return exercises
                .filter(exe => {
                    if (filter !== 'all' && exe.type !== filter) return false;
                    if (bodypartFilter !== 'all' && exe.bodypart !== bodypartFilter) return false;
                    if (categoryFilter !== 'all' && exe.category !== categoryFilter) return false;
                    if (searchTerm && !exe.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                    return true;
                })
                .sort((a, b) => {
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    return a.name.localeCompare(b.name);
                });
        } catch {
            return [];
        }
    }, [exercises, filter, bodypartFilter, categoryFilter, searchTerm]);

    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (exercisesLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(obsEntries => {
            if (obsEntries[0].isIntersecting && displayCount < filteredExercises.length) {
                setDisplayCount(prev => prev + 30);
            }
        });

        if (node) observer.current.observe(node);
    }, [exercisesLoading, displayCount, filteredExercises.length]);

    const displayedExercises = useMemo(() => {
        return filteredExercises.slice(0, displayCount);
    }, [filteredExercises, displayCount]);

    const loading = exercisesLoading && exercises.length === 0;

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Skeleton variant="text" width={200} height={48} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={64} sx={{ mb: 3, borderRadius: 2 }} />
                <Stack spacing={1.5}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={68} sx={{ borderRadius: 2 }} />
                    ))}
                </Stack>
            </Container>
        );
    }

    const hasFilters = filter !== 'all' || bodypartFilter !== 'all' || categoryFilter !== 'all' || Boolean(searchTerm);

    return (
        <Container maxWidth="lg">
            <PageHeader
                title={t('exercises.title')}
                actions={
                    isAdmin ? (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            component={RouterLink}
                            to="/exercises/new"
                        >
                            {t('exercises.newExercise')}
                        </Button>
                    ) : undefined
                }
            />

            {/* Unified Filter Toolbar */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 1.5,
                    }}
                >
                    <TextField
                        id="search-exercises"
                        fullWidth
                        size="small"
                        label={t('common.search')}
                        placeholder={t('exercises.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        sx={{ flex: { xs: '1 1 100%', sm: '1 1 220px', md: '1 1 320px' } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 140px', md: '0 0 150px' } }}>
                        <InputLabel id="type-filter-label" htmlFor="type-filter-input">{t('exercises.type')}</InputLabel>
                        <Select
                            labelId="type-filter-label"
                            id="type-filter"
                            inputProps={{ id: 'type-filter-input' }}
                            value={filter}
                            label={t('exercises.type')}
                            onChange={(e) => { setFilter(e.target.value as ExerciseType | 'all'); }}
                            sx={{ textTransform: 'capitalize' }}
                        >
                            <MenuItem value="all">{t('exercises.allTypes')}</MenuItem>
                            {EXERCISE_TYPES.map(type => (
                                <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                    {t(`exerciseTypes.${type}`, { defaultValue: type })}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 140px', md: '0 0 160px' } }}>
                        <InputLabel id="bodypart-filter-label" htmlFor="bodypart-filter-input">{t('exercises.bodyPart')}</InputLabel>
                        <Select
                            labelId="bodypart-filter-label"
                            id="bodypart-filter"
                            inputProps={{ id: 'bodypart-filter-input' }}
                            value={bodypartFilter}
                            label={t('exercises.bodyPart')}
                            onChange={(e) => { setBodypartFilter(e.target.value as BodyPart | 'all'); }}
                        >
                            <MenuItem value="all">{t('exercises.allBodyParts')}</MenuItem>
                            {BODY_PARTS.map(bp => (
                                <MenuItem key={bp} value={bp}>{t(`bodyParts.${bp}`, { defaultValue: bp })}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: '1 1 140px', md: '0 0 160px' } }}>
                        <InputLabel id="category-filter-label" htmlFor="category-filter-input">{t('exercises.category')}</InputLabel>
                        <Select
                            labelId="category-filter-label"
                            id="category-filter"
                            inputProps={{ id: 'category-filter-input' }}
                            value={categoryFilter}
                            label={t('exercises.category')}
                            onChange={(e) => { setCategoryFilter(e.target.value as ExerciseCategory | 'all'); }}
                        >
                            <MenuItem value="all">{t('exercises.allCategories')}</MenuItem>
                            {CATEGORIES.map(cat => (
                                <MenuItem key={cat} value={cat}>{t(`categories.${cat}`, { defaultValue: cat })}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {exercisesError && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                    {exercisesError}
                </Alert>
            )}

            {exercises.length === 0 ? (
                <EmptyState
                    icon={<FitnessCenterIcon />}
                    title={t('exercises.noExercisesInDb')}
                    actions={
                        isAdmin ? (
                            <Button variant="contained" startIcon={<Add />} component={RouterLink} to="/exercises/new">
                                {t('exercises.createFirst')}
                            </Button>
                        ) : undefined
                    }
                />
            ) : displayedExercises.length === 0 ? (
                <EmptyState
                    icon={<Search />}
                    title={t('exercises.noExercisesMatch')}
                    actions={
                        <>
                            {hasFilters && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setFilter('all');
                                        setBodypartFilter('all');
                                        setCategoryFilter('all');
                                        setSearchTerm('');
                                    }}
                                >
                                    {t('common.clearFilters', { defaultValue: 'Clear Filters' })}
                                </Button>
                            )}
                            {isAdmin && (
                                <Button variant="contained" size="small" startIcon={<Add />} component={RouterLink} to="/exercises/new">
                                    {t('exercises.createNewPrompt')}
                                </Button>
                            )}
                        </>
                    }
                />
            ) : (
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                    <List disablePadding>
                        {displayedExercises.map((exercise, index) => (
                            <ListItem
                                key={exercise.id}
                                ref={index === displayedExercises.length - 1 ? lastElementRef : null}
                                divider={index < displayedExercises.length - 1}
                                component={RouterLink}
                                to={`/exercises/${exercise.id}`}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    py: 1.5,
                                    px: { xs: 2, sm: 2.5 },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={exercise.icon_url ? `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}` : undefined}
                                        alt={exercise.name}
                                    >
                                        {exercise.name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center' }} spacing={1}>
                                            <Typography variant="body1">
                                                {exercise.name}
                                            </Typography>
                                            <Chip
                                                label={t(`exerciseTypes.${exercise.type}`, { defaultValue: exercise.type })}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ display: { xs: 'none', sm: 'inline-flex' }, textTransform: 'capitalize' }}
                                            />
                                            <Chip
                                                label={t(`bodyParts.${exercise.bodypart}`, { defaultValue: exercise.bodypart })}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                            />
                                            <Chip
                                                label={t(`categories.${exercise.category}`, { defaultValue: exercise.category })}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                            />
                                            {profile?.markedExercises?.[exercise.id] && (
                                                <MarkerIcons status={profile.markedExercises[exercise.id]} />
                                            )}
                                        </Stack>
                                    }
                                />
                                <ChevronRight color="action" />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {displayCount < filteredExercises.length && (
                <Stack sx={{ my: 4, alignItems: 'center' }}>
                    <CircularProgress size={32} />
                </Stack>
            )}
            {displayCount >= filteredExercises.length && filteredExercises.length > 0 && (
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', my: 4 }}>
                    {t('exercises.endOfList')}
                </Typography>
            )}
        </Container>
    );
};

export default Exercises;
