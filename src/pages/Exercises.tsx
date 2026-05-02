import { useState, useMemo, useRef, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
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
import { Link as RouterLink } from 'react-router-dom';
import type { ExerciseType, ExerciseCategory, BodyPart } from '../types';
import MarkerIcons from '../components/exercises/MarkerIcons';
import { useExercises } from '../context/ExercisesContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { EXERCISE_TYPES, BODY_PARTS, CATEGORIES } from '../constants/exercises';

const Exercises = () => {
    const { exercises, loading: exercisesLoading } = useExercises();
    const { profile } = useUserProfile();
    const [filter, setFilter] = useState<ExerciseType | 'all'>('all');
    const [bodypartFilter, setBodypartFilter] = useState<BodyPart | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const [displayCount, setDisplayCount] = useState(30);

    // Adjust display count when filters change (React recommendation for derived state reset)
    const [prevFilters, setPrevFilters] = useState({ filter, bodypartFilter, categoryFilter, searchTerm });
    if (prevFilters.filter !== filter || 
        prevFilters.bodypartFilter !== bodypartFilter || 
        prevFilters.categoryFilter !== categoryFilter || 
        prevFilters.searchTerm !== searchTerm) {
        setDisplayCount(30);
        setPrevFilters({ filter, bodypartFilter, categoryFilter, searchTerm });
    }

    const filteredExercises = useMemo(() => {
        try {
            return exercises
                .filter(exe => {
                    // filter by type
                    if (filter !== 'all' && exe.type !== filter) return false;

                    // filter by bodypart
                    if (bodypartFilter !== 'all' && exe.bodypart !== bodypartFilter) return false;

                    // filter by category
                    if (categoryFilter !== 'all' && exe.category !== categoryFilter) return false;

                    // filter by search term
                    if (searchTerm && !exe.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

                    return true;
                })
                .sort((a, b) => {
                    // Popular status first (desc)
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    // Then by name (asc)
                    return a.name.localeCompare(b.name);
                });
        } catch (_err) {
            return [];
        }
    }, [exercises, filter, bodypartFilter, categoryFilter, searchTerm]);

    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (exercisesLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && displayCount < filteredExercises.length) {
                setDisplayCount(prev => prev + 30);
            }
        });

        if (node) observer.current.observe(node);
    }, [exercisesLoading, displayCount, filteredExercises.length]);

    const displayedExercises = useMemo(() => {
        return filteredExercises.slice(0, displayCount);
    }, [filteredExercises, displayCount]);


    // Profile is now handled by useUserProfile hook

    const loading = exercisesLoading && exercises.length === 0;


    const renderSkeletons = () => (
        <Stack spacing={1.5}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: 1 }} />
            ))}
        </Stack>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Stack spacing={2} sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="40%" height={60} />
                    <Skeleton variant="rectangular" height={100} />
                </Stack>
                {renderSkeletons()}
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Stack direction="column" spacing={{ xs: 0.5, md: 2 }} sx={{ mt: { xs: 0.5, md: 2 }, mb: { xs: 1.5, md: 4 } }}>
                <Stack sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h4" component="h1">
                        Exercises
                    </Typography>
                </Stack>

                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        alignItems: { xs: 'stretch', sm: 'flex-end' }, 
                        gap: 2 
                    }}
                >
                    <TextField
                        id="search-exercises"
                        fullWidth
                        size="small"
                        variant="standard"
                        label="Search"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        sx={{
                            flex: { xs: '1 1 100%', sm: '1 1 200px', md: '1 1 300px' },
                            maxWidth: { sm: '400px' }
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 140px', md: '0 0 auto' }, minWidth: 120 }}>
                        <InputLabel id="type-filter-label" htmlFor="type-filter-input">Type</InputLabel>
                        <Select
                            labelId="type-filter-label"
                            id="type-filter"
                            inputProps={{ id: 'type-filter-input' }}
                            value={filter}
                            label="Type"
                            onChange={(e) => { setFilter(e.target.value as ExerciseType | 'all'); }}
                            sx={{ textTransform: 'capitalize' }}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            {EXERCISE_TYPES.map(type => (
                                <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 140px', md: '0 0 auto' }, minWidth: 120 }}>
                        <InputLabel id="bodypart-filter-label" htmlFor="bodypart-filter-input">Body Part</InputLabel>
                        <Select
                            labelId="bodypart-filter-label"
                            id="bodypart-filter"
                            inputProps={{ id: 'bodypart-filter-input' }}
                            value={bodypartFilter}
                            label="Body Part"
                            onChange={(e) => { setBodypartFilter(e.target.value as BodyPart | 'all'); }}
                        >
                            <MenuItem value="all">All Body Parts</MenuItem>
                            {BODY_PARTS.map(bp => (
                                <MenuItem key={bp} value={bp}>{bp}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ flex: { xs: '1 1 100%', sm: '1 1 140px', md: '0 0 auto' }, minWidth: 120 }}>
                        <InputLabel id="category-filter-label" htmlFor="category-filter-input">Category</InputLabel>
                        <Select
                            labelId="category-filter-label"
                            id="category-filter"
                            inputProps={{ id: 'category-filter-input' }}
                            value={categoryFilter}
                            label="Category"
                            onChange={(e) => { setCategoryFilter(e.target.value as ExerciseCategory | 'all'); }}
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {CATEGORIES.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Stack>
            {exercises.length === 0 ? (
                <Alert 
                    severity="info" 
                    sx={{ mt: 4 }}
                    action={
                        <IconButton
                            color="inherit"
                            size="small"
                            component={RouterLink}
                            to="/exercises/new"
                            aria-label="add new exercise"
                        >
                            <Add />
                        </IconButton>
                    }
                >
                    No exercises found in the database. <RouterLink to="/exercises/new" style={{ color: 'inherit' }}>Create the first one.</RouterLink>
                </Alert>
            ) : displayedExercises.length === 0 ? (
                <Alert 
                    severity="info" 
                    sx={{ mt: 2 }}
                    action={
                        <IconButton
                            color="inherit"
                            size="small"
                            component={RouterLink}
                            to="/exercises/new"
                            aria-label="add new exercise"
                        >
                            <Add />
                        </IconButton>
                    }
                >
                    No exercises match the selected filter or search. <RouterLink to="/exercises/new" style={{ color: 'inherit' }}>Create a new one?</RouterLink>
                </Alert>
            ) : (
                <Paper variant="outlined">
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
                                    py: { xs: 1.5, md: 2 }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={exercise.icon_url ?
                                            `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                                            : undefined}
                                        alt={exercise.name}
                                    >
                                        {exercise.name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Stack sx={{ flexWrap: "wrap" }} spacing={1}>
                                            <Typography variant="body1">
                                                {exercise.name}
                                            </Typography>
                                            <Chip
                                                label={exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                            />
                                            <Chip
                                                label={exercise.bodypart}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                            />
                                            <Chip
                                                label={exercise.category}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                                            />
                                            {profile?.markedExercises?.[exercise.id] && (
                                                <Box sx={{ ml: 1 }}>
                                                    <MarkerIcons status={profile.markedExercises[exercise.id]} />
                                                </Box>
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
                <Stack sx={{ my: 4 }}>
                        <CircularProgress size={32} />
                    </Stack>
            )}
            {displayCount >= filteredExercises.length && filteredExercises.length > 0 && (
                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        color: "text.secondary",
                        my: 4
                    }}>
                    You&apos;ve reached the end of the list.
                </Typography>
            )}
        </Container>
    );
};

export default Exercises;
