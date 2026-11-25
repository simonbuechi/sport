import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { subscribeToProgramLibraryItem, cloneProgramFromLibrary } from '../services/db';
import { getDifficultyColor, getDifficultyLabel, getGoalLabel } from '../utils/programUtils';
import PageHeader from '../components/common/PageHeader';
import PageLoader from '../components/common/PageLoader';
import EmptyState from '../components/common/EmptyState';
import type { Exercise, ProgramLibraryItem, ExerciseSet } from '../types';

const formatSetSummary = (sets?: ExerciseSet[]): string => {
    if (!sets || sets.length === 0) return '3 sets';

    const repsValues = sets.map(s => s.reps).filter((r): r is number => r !== undefined);
    const rpeValues = sets.map(s => s.rpe).filter((r): r is number => r !== undefined);

    const allSameReps = repsValues.length === sets.length && repsValues.every(r => r === repsValues[0]);
    const repsPart = allSameReps
        ? `${String(sets.length)} × ${String(repsValues[0])} reps`
        : `${String(sets.length)} sets (${repsValues.join('/')} reps)`;

    if (rpeValues.length > 0) {
        const minRpe = Math.min(...rpeValues);
        const maxRpe = Math.max(...rpeValues);
        const rpePart = minRpe === maxRpe ? `RPE ${String(minRpe)}` : `RPE ${String(minRpe)}–${String(maxRpe)}`;
        return `${repsPart} · ${rpePart}`;
    }

    return repsPart;
};

const ProgramLibraryDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const { exercises } = useExercises();

    const [program, setProgram] = useState<ProgramLibraryItem | null>(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [isCopying, setIsCopying] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const exerciseMap = useMemo<Record<string, Exercise | undefined>>(() => {
        const map: Record<string, Exercise> = {};
        for (const ex of exercises) {
            map[ex.id] = ex;
        }
        return map;
    }, [exercises]);

    useEffect(() => {
        if (!id) return;

        const unsubscribe = subscribeToProgramLibraryItem(
            id,
            (item) => {
                setProgram(item);
                setLoading(false);
            },
            () => {
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [id]);

    const handleCopy = async () => {
        if (!program) return;
        if (!currentUser) {
            setError(t('auth.unauthenticated', { defaultValue: 'You must be logged in to copy programs.' }));
            return;
        }

        setIsCopying(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await cloneProgramFromLibrary(currentUser.uid, program, exercises);
            setSuccessMessage(t('programs.copySuccess', {
                name: program.name,
                defaultValue: `Program "${program.name}" and its templates have been added to your programs!`
            }));
        } catch (err) {
            console.error('Failed to clone library program:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsCopying(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!program) {
        return (
            <Container maxWidth="md">
                <PageHeader
                    title={t('programs.libraryTitle', { defaultValue: 'Program Library' })}
                    backTo="/routines/library"
                />
                <EmptyState
                    icon={<LocalLibraryIcon />}
                    title={t('programs.notFound', { defaultValue: 'Program not found in library.' })}
                    actions={
                        <Button
                            variant="contained"
                            onClick={() => { void navigate('/routines/library'); }}
                        >
                            {t('programs.browseLibrary', { defaultValue: 'Browse Program Library' })}
                        </Button>
                    }
                />
            </Container>
        );
    }

    const workoutDaysCount = program.days.filter(d => Boolean(d.templateKey)).length;
    const restDaysCount = program.days.length - workoutDaysCount;

    const metaParts: string[] = [];
    if (program.goal) {
        const g = getGoalLabel(t, program.goal);
        if (g) metaParts.push(g);
    }
    if (program.daysPerWeek) {
        metaParts.push(`${String(program.daysPerWeek)} ${t('programs.daysPerWeek', { defaultValue: 'days/week' })}`);
    }
    metaParts.push(
        program.type === 'repetitive'
            ? t('programs.types.repetitive', { defaultValue: 'Repetitive Cycle' })
            : t('programs.types.oneTime', { defaultValue: 'One-Time Cycle' })
    );
    metaParts.push(
        t('programs.cycleSummary', {
            total: program.days.length,
            workouts: workoutDaysCount,
            rest: restDaysCount,
            defaultValue: `${String(program.days.length)} Days (${String(workoutDaysCount)} Workouts, ${String(restDaysCount)} Rest)`
        })
    );
    if (program.author) {
        metaParts.push(program.author);
    }

    return (
        <Container maxWidth="md" sx={{ overflowX: 'hidden' }}>
            <PageHeader
                title={program.name}
                backTo="/routines/library"
                backLabel={t('programs.libraryTitle', { defaultValue: 'Program Library' })}
                subtitle={metaParts.join(' · ')}
                titleAdornment={
                    program.difficulty ? (
                        <Chip
                            size="small"
                            label={getDifficultyLabel(t, program.difficulty)}
                            color={getDifficultyColor(program.difficulty)}
                            variant="outlined"
                        />
                    ) : undefined
                }
                actions={
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isCopying}
                        startIcon={isCopying ? <CircularProgress size={18} color="inherit" /> : <ContentCopyIcon />}
                        onClick={() => { void handleCopy(); }}
                    >
                        {isCopying
                            ? t('programs.copying', { defaultValue: 'Copying...' })
                            : t('programs.useProgram', { defaultValue: 'Use Program' })}
                    </Button>
                }
            />

            {successMessage && (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon fontSize="inherit" />}
                    onClose={() => { setSuccessMessage(null); }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => { void navigate('/routines/programs'); }}
                        >
                            {t('programs.viewInMyPrograms', { defaultValue: 'View in My Programs' })}
                        </Button>
                    }
                    sx={{ mb: 2.5 }}
                >
                    {successMessage}
                </Alert>
            )}

            {error && (
                <Alert severity="error" onClose={() => { setError(null); }} sx={{ mb: 2.5 }}>
                    {error}
                </Alert>
            )}

            {program.description && (
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65, mb: 3 }}>
                    {program.description}
                </Typography>
            )}

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                {t('programs.scheduleOverview', { defaultValue: 'Program Schedule' })}
            </Typography>

            <Stack spacing={2}>
                {program.days.map((day) => {
                    const isRest = !day.templateKey;
                    const tpl = day.templateKey ? program.templates?.[day.templateKey] : null;

                    if (isRest) {
                        return (
                            <Paper
                                key={day.id}
                                variant="outlined"
                                sx={{
                                    px: 2,
                                    py: 1.25,
                                    borderRadius: 1.5,
                                    bgcolor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <BedtimeIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {t('programs.day', { defaultValue: 'Day' })} {day.dayNumber} — {t('programs.restDay', { defaultValue: 'Rest & Recovery' })}
                                    </Typography>
                                    {day.note && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {day.note}
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        );
                    }

                    return (
                        <Paper key={day.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {t('programs.day', { defaultValue: 'Day' })} {day.dayNumber}: {tpl?.name ?? day.templateKey}
                                </Typography>
                                {day.note && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                        {day.note}
                                    </Typography>
                                )}
                                {tpl?.notes && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                        {tpl.notes}
                                    </Typography>
                                )}
                            </Box>

                            {tpl?.exercises && tpl.exercises.length > 0 && (
                                <List disablePadding>
                                    {tpl.exercises.map((ex, exIdx) => (
                                        <React.Fragment key={ex.exerciseId ?? ex.exerciseName ?? String(exIdx)}>
                                            {exIdx > 0 && <Divider component="li" />}
                                            <ListItem
                                                sx={{
                                                    px: 2,
                                                    py: 1.25,
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                                    justifyContent: 'space-between',
                                                    gap: 0.75,
                                                }}
                                            >
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                                        {ex.supersetId && (
                                                            <Tooltip title={ex.supersetNote ?? t('supersets.supersetGroup', { defaultValue: 'Superset Group' })}>
                                                                <LinkIcon color="primary" sx={{ fontSize: '1rem', flexShrink: 0 }} />
                                                            </Tooltip>
                                                        )}
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {exIdx + 1}. {(ex.exerciseId ? exerciseMap[ex.exerciseId]?.name : undefined) ?? ex.exerciseName ?? ex.exerciseId ?? ''}
                                                        </Typography>
                                                    </Box>
                                                    {ex.note && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                            {ex.note}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    color="primary.main"
                                                    sx={{ fontWeight: 500, flexShrink: 0 }}
                                                >
                                                    {formatSetSummary(ex.sets)}
                                                </Typography>
                                            </ListItem>
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    );
                })}
            </Stack>
        </Container>
    );
};

export default ProgramLibraryDetails;
