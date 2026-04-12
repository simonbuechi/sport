import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
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
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ViewModule from '@mui/icons-material/ViewModule';
import ViewList from '@mui/icons-material/ViewList';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import { getUserProfile } from '../services/db';
import type { ExerciseType, UserProfile, ExerciseCategory, BodyPart } from '../types';
import ExerciseCard from '../components/exercises/ExerciseCard';
import MarkerIcons from '../components/exercises/MarkerIcons';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';

const Exercises = () => {
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading, error: exercisesError } = useExercises();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [filter, setFilter] = useState<ExerciseType | 'all'>('all');
    const [bodypartFilter, setBodypartFilter] = useState<BodyPart | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const [displayCount, setDisplayCount] = useState(30);

    // Reset display count when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayCount(30);
    }, [filter, bodypartFilter, categoryFilter, searchTerm]);

    const filteredExercises = useMemo(() => {
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


    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                const userProfile = await getUserProfile(currentUser.uid);
                setProfile(userProfile);
            } catch (err) {
                console.error(err);
            }
        };

        void fetchProfile();
    }, [currentUser]);

    const loading = exercisesLoading && exercises.length === 0;
    const currentError = exercisesError;

    const handleViewChange = (
        _event: React.MouseEvent<HTMLElement>,
        newView: 'grid' | 'list' | null,
    ) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    const renderSkeletons = () => (
        <Grid container spacing={{ xs: 2, md: 3 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
            ))}
        </Grid>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="40%" height={60} />
                    <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
                </Box>
                {renderSkeletons()}
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1">
                        Exercises
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="New Exercise">
                            <IconButton
                                component={RouterLink}
                                to="/exercises/new"
                                color="primary"
                                sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}
                            >
                                <Add />
                            </IconButton>
                        </Tooltip>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewChange}
                            aria-label="view mode"
                            size="small"
                        >
                            <Tooltip title="Grid View">
                                <ToggleButton value="grid" aria-label="grid view">
                                    <ViewModule />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip title="List View">
                                <ToggleButton value="list" aria-label="list view">
                                    <ViewList />
                                </ToggleButton>
                            </Tooltip>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: 'flex-start'
                }}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            flex: { md: '1 1 300px' }
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

                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        width: { xs: '100%', md: 'auto' },
                        flex: { md: '0 0 auto' }
                    }}>
                        <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 150 } }}>
                            <InputLabel id="type-filter-label">Type</InputLabel>
                            <Select
                                labelId="type-filter-label"
                                id="type-filter"
                                value={filter}
                                label="Type"
                                onChange={(e) => { setFilter(e.target.value as ExerciseType | 'all'); }}
                                sx={{ textTransform: 'capitalize' }}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="strength" sx={{ textTransform: 'capitalize' }}>Strength</MenuItem>
                                <MenuItem value="cardio" sx={{ textTransform: 'capitalize' }}>Cardio</MenuItem>
                                <MenuItem value="flexibility" sx={{ textTransform: 'capitalize' }}>Flexibility</MenuItem>
                                <MenuItem value="other" sx={{ textTransform: 'capitalize' }}>Other</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 150 } }}>
                            <InputLabel id="bodypart-filter-label">Body Part</InputLabel>
                            <Select
                                labelId="bodypart-filter-label"
                                id="bodypart-filter"
                                value={bodypartFilter}
                                label="Body Part"
                                onChange={(e) => { setBodypartFilter(e.target.value as BodyPart | 'all'); }}
                            >
                                <MenuItem value="all">All Body Parts</MenuItem>
                                <MenuItem value="Whole Body">Whole Body</MenuItem>
                                <MenuItem value="Legs">Legs</MenuItem>
                                <MenuItem value="Back">Back</MenuItem>
                                <MenuItem value="Shoulders">Shoulders</MenuItem>
                                <MenuItem value="Chest">Chest</MenuItem>
                                <MenuItem value="Biceps">Biceps</MenuItem>
                                <MenuItem value="Triceps">Triceps</MenuItem>
                                <MenuItem value="Core">Core</MenuItem>
                                <MenuItem value="Forearms">Forearms</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                            <InputLabel id="category-filter-label">Category</InputLabel>
                            <Select
                                labelId="category-filter-label"
                                id="category-filter"
                                value={categoryFilter}
                                label="Category"
                                onChange={(e) => { setCategoryFilter(e.target.value as ExerciseCategory | 'all'); }}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                <MenuItem value="Bodyweight">Bodyweight</MenuItem>
                                <MenuItem value="Barbell">Barbell</MenuItem>
                                <MenuItem value="Dumbbell">Dumbbell</MenuItem>
                                <MenuItem value="Machine">Machine</MenuItem>
                                <MenuItem value="Cable">Cable</MenuItem>
                                <MenuItem value="Kettlebell">Kettlebell</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Box>
            {currentError && <Alert severity="error" sx={{ mb: 4 }}>{currentError}</Alert>}
            {exercises.length === 0 && !currentError ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    No exercises found in the database.
                </Alert>
            ) : displayedExercises.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No exercises match the selected filter or search.
                </Alert>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {displayedExercises.map((exercise, index) => (
                        <Grid
                            size={{ xs: 12, sm: 6, md: 4 }}
                            key={exercise.id}
                            ref={index === displayedExercises.length - 1 ? lastElementRef : null}
                        >
                            <ExerciseCard exercise={exercise} userProfile={profile} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography variant="body1" sx={{
                                                fontWeight: 600
                                            }}>
                                                {exercise.name}
                                            </Typography>
                                            <Chip
                                                label={exercise.type}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ textTransform: 'capitalize', display: { xs: 'none', sm: 'inline-flex' } }}
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
                                            {profile?.markedExercises[exercise.id] && (
                                                <Box sx={{ ml: 1 }}>
                                                    <MarkerIcons status={profile.markedExercises[exercise.id]} />
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                />
                                <ChevronRight color="action" />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
            {displayCount < filteredExercises.length && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress size={32} />
                </Box>
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
