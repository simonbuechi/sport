import { useTranslation } from 'react-i18next';
import { memo, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

import type { TrainingTemplate, Exercise, Workout, TemplateExercise } from '../../types';
import { subscribeToWorkoutsByTemplate } from '../../services/db';
import { formatWeight } from '../../utils/format';
import { groupExercisesIntoBlocks, type SupersetGroup } from '../../utils/supersetUtils';
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatExertionLabel } from '../../utils/exertionUtils';

interface TemplateAccordionProps {
    template: TrainingTemplate;
    userId: string;
    exercises: Exercise[];
    exerciseMap: Record<string, Exercise | undefined>;
    activeSearchId: string | null;
    setActiveSearchId: (id: string | null) => void;
    editingNotePath: { tid: string, idx: number } | null;
    setEditingNotePath: (path: { tid: string, idx: number } | null) => void;
    onEdit: (template: TrainingTemplate) => void;
    onInlineAdd: (templateId: string, exercise: Exercise | null) => void;
    onInlineRemove: (templateId: string, index: number) => void;
    onInlineUpdateNote: (templateId: string, index: number, note: string) => void;
    onMoveExercise: (templateId: string, fromIndex: number, toIndex: number) => void;
    onOpenSetDialog: (tid: string, exerciseIdx: number, setIdx?: number) => void;
    onLinkSuperset?: (templateId: string, index: number) => void;
    onUnlinkSuperset?: (templateId: string, index: number) => void;
    onUpdateSupersetNote?: (templateId: string, supersetId: string, note: string) => void;
}

const TemplateAccordion = ({
    template,
    userId,
    exercises,
    exerciseMap,
    activeSearchId,
    setActiveSearchId,
    editingNotePath,
    setEditingNotePath,
    onEdit,
    onInlineAdd,
    onInlineRemove,
    onInlineUpdateNote,
    onMoveExercise,
    onOpenSetDialog,
    onLinkSuperset,
    onUnlinkSuperset,
    onUpdateSupersetNote
}: TemplateAccordionProps) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const { profile } = useUserProfile();
    const isExertionEnabled = Boolean(profile?.settings?.enableExertionTracking);
    const exertionMode = profile?.settings?.exertionMode ?? 'rpe';
    const isSupersetsEnabled = profile?.settings?.enableSupersets ?? true;
    const [editingSupersetId, setEditingSupersetId] = useState<string | null>(null);
    const [tempSupersetNote, setTempSupersetNote] = useState("");

    const exerciseBlocks = useMemo<SupersetGroup<TemplateExercise>[]>(() => groupExercisesIntoBlocks<TemplateExercise>(template.exercises), [template.exercises]);

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loadingWorkouts, setLoadingWorkouts] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!userId || !template.id || !isExpanded) return;

        const unsubscribe = subscribeToWorkoutsByTemplate(userId, template.id, (data) => {
            setWorkouts(data);
            setLoadingWorkouts(false);
        });

        return () => {
            unsubscribe();
        };
    }, [userId, template.id, isExpanded]);


    const renderExerciseRow = (
        ex: TemplateExercise,
        idx: number,
        tag?: string,
        isInsideSuperset?: boolean,
        isLastInGroup?: boolean
    ) => (
        <Box
            key={`${template.id}-${String(idx)}`}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1.5,
                px: 1,
                '&:hover': { bgcolor: 'action.hover' },
                borderBottom: isLastInGroup ? 'none' : '1px dashed',
                borderColor: 'divider',
                position: 'relative'
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    {tag && (
                        <Chip
                            label={tag}
                            size="small"
                            color="primary"
                            sx={{ height: 22, fontWeight: 700, fontSize: '0.75rem' }}
                        />
                    )}
                    <Avatar
                        src={getExercise(ex.exerciseId)?.icon_url ?
                            `${import.meta.env.BASE_URL}exercises/${getExercise(ex.exerciseId)?.icon_url ?? ''}`
                            : undefined}
                        alt={getExerciseName(ex.exerciseId)}
                        sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem'
                        }}
                    >
                        {getExerciseName(ex.exerciseId).charAt(0)}
                    </Avatar>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {getExerciseName(ex.exerciseId)}
                    </Typography>
                </Stack>

                {/* Sets List */}
                {ex.sets && ex.sets.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {ex.sets.map((set, sIdx) => {
                            const exertionTag = isExertionEnabled ? formatExertionLabel(set, exertionMode) : '';
                            const label = `${String(set.weight)}kg x ${String(set.reps)}${exertionTag ? ` ${exertionTag}` : ''}`;
                            return (
                                <Chip
                                    key={set.id}
                                    variant="outlined"
                                    size="small"
                                    label={label}
                                    onClick={() => { onOpenSetDialog(template.id, idx, sIdx); }}
                                    sx={{ borderRadius: '4px' }}
                                />
                            );
                        })}
                    </Box>
                )}

                {editingNotePath?.tid === template.id && editingNotePath.idx === idx ? (
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        defaultValue={ex.note}
                        onBlur={(e) => { onInlineUpdateNote(template.id, idx, e.target.value); }}
                        sx={{ mt: 1 }}
                        placeholder="Add sets/reps notes..."
                    />
                ) : ex.note ? (
                    <Typography
                        variant="body2"
                        onClick={() => { setEditingNotePath({ tid: template.id, idx }); }}
                        sx={{
                            color: 'text.secondary',
                            display: 'block',
                            cursor: 'pointer',
                            mt: 0.5
                        }}>
                        {ex.note}
                    </Typography>
                ) : null}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Tooltip title="Move Up" arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => { onMoveExercise(template.id, idx, idx - 1); }}
                            disabled={idx === 0}
                            sx={{ color: idx === 0 ? 'action.disabled' : 'action.active' }}
                        >
                            <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Move Down" arrow>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => { onMoveExercise(template.id, idx, idx + 1); }}
                            disabled={idx === template.exercises.length - 1}
                            sx={{ color: idx === template.exercises.length - 1 ? 'action.disabled' : 'action.active' }}
                        >
                            <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => { onOpenSetDialog(template.id, idx); }}
                    sx={{ whiteSpace: 'nowrap', ml: 1 }}
                >
                    Set
                </Button>
                {!ex.note && (
                    <Tooltip title="Add notes">
                        <IconButton size="small" onClick={() => { setEditingNotePath({ tid: template.id, idx }); }}>
                            <NoteAddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                {isInsideSuperset ? (
                    <Tooltip title={t('supersets.unlink')} arrow>
                        <IconButton
                            size="small"
                            onClick={() => { onUnlinkSuperset?.(template.id, idx); }}
                        >
                            <LinkOffIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ) : isSupersetsEnabled && idx < template.exercises.length - 1 ? (
                    <Tooltip title={t('supersets.groupWithNext')} arrow>
                        <IconButton
                            size="small"
                            onClick={() => { onLinkSuperset?.(template.id, idx); }}
                            color="primary"
                        >
                            <LinkIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ) : null}

                <Tooltip title="Remove Exercise">
                    <IconButton
                        size="small"
                        onClick={() => { onInlineRemove(template.id, idx); }}
                    >
                        <DeleteIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );

    const getExercise = (id: string) => {
        return exerciseMap[id];
    };

    const getExerciseName = (id: string) => {
        return getExercise(id)?.name ?? 'Unknown Exercise';
    };

    return (
        <Accordion
            elevation={4}
            expanded={isExpanded}
            onChange={(_, expanded) => {
                setIsExpanded(expanded);
                if (expanded) setLoadingWorkouts(true);
            }}
            sx={{
                borderRadius: '12px !important',
                border: '1px solid',
                borderColor: 'divider',
                mb: 2,
                opacity: template.isArchived ? 0.6 : 1,
                bgcolor: template.isArchived ? 'action.hover' : 'background.paper',
                '&:before': { display: 'none' }
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    px: 3,
                    py: 1,
                    '& .MuiAccordionSummary-content': {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                }}
            >
                <Box>
                    <Stack spacing={1}>
                        {template.isFavorite && <StarIcon color="warning" fontSize="small" />}
                        <Typography variant="h6">
                            {template.name}
                            {template.isArchived && " (Archived)"}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{
                        color: "text.secondary"
                    }}>
                        {template.exercises.length} exercises
                        {template.notes && ` • ${template.notes}`}
                    </Typography>
                </Box>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => { e.stopPropagation(); }}>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<PlayArrowIcon fontSize="small" />}
                        onClick={() => { void navigate(`/journal/new?templateId=${template.id}`); }}
                        sx={{ textTransform: 'none', py: 0.25, px: 1.25, borderRadius: 2 }}
                    >
                        Use
                    </Button>
                    <Tooltip title="Edit Template">
                        <Box
                            component="span"
                            onClick={() => { onEdit(template); }}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 0.75,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                color: 'action.active',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </Box>
                    </Tooltip>
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Box sx={{ mt: 1 }}>
                    {template.exercises.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {exerciseBlocks.map((block: SupersetGroup<TemplateExercise>, blockIdx: number) => {
                                if (block.isSuperset) {
                                    return (
                                        <Paper
                                            key={`superset-${block.supersetId ?? String(blockIdx)}`}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                borderLeft: '4px solid',
                                                borderColor: 'primary.main',
                                                bgcolor: 'action.hover',
                                                borderRadius: 2
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Chip
                                                        icon={<LinkIcon fontSize="small" />}
                                                        label={t('supersets.supersetTitle', { letter: block.letter })}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                    {block.note && editingSupersetId !== block.supersetId && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: 'text.secondary', fontStyle: 'italic', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setEditingSupersetId(block.supersetId ?? null);
                                                                setTempSupersetNote(block.note ?? '');
                                                            }}
                                                        >
                                                            &ldquo;{block.note}&rdquo;
                                                        </Typography>
                                                    )}
                                                </Stack>
                                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                                    <Tooltip title={block.note ? t('supersets.editNote') : t('supersets.addNote')}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setEditingSupersetId(block.supersetId ?? null);
                                                                setTempSupersetNote(block.note ?? '');
                                                            }}
                                                        >
                                                            <NoteAddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={t('supersets.unlink')}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                block.items.forEach(item => {
                                                                    onUnlinkSuperset?.(template.id, item.originalIndex);
                                                                });
                                                            }}
                                                        >
                                                            <LinkOffIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Box>

                                            {editingSupersetId === block.supersetId && (
                                                <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        placeholder={t('supersets.notePlaceholder')}
                                                        value={tempSupersetNote}
                                                        onChange={(e) => { setTempSupersetNote(e.target.value); }}
                                                        />
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => {
                                                            if (block.supersetId) {
                                                                onUpdateSupersetNote?.(template.id, block.supersetId, tempSupersetNote);
                                                            }
                                                            setEditingSupersetId(null);
                                                        }}
                                                    >
                                                        {t('common.save')}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => { setEditingSupersetId(null); }}
                                                    >
                                                        {t('common.cancel')}
                                                    </Button>
                                                </Box>
                                            )}

                                            <List sx={{ p: 0 }}>
                                                {block.items.map(({ item, originalIndex, tag }, itemIdx) => (
                                                    renderExerciseRow(item, originalIndex, tag, true, itemIdx === block.items.length - 1)
                                                ))}
                                            </List>
                                        </Paper>
                                    );
                                }

                                const single = block.items[0];
                                return (
                                    <List key={`single-${single.item.exerciseId}-${String(single.originalIndex)}`} sx={{ p: 0 }}>
                                        {renderExerciseRow(single.item, single.originalIndex, undefined, false, true)}
                                    </List>
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{
                                color: "text.secondary",
                                py: 2
                            }}>
                            No exercises. Start by adding one below.
                        </Typography>
                    )}

                    <Box sx={{ mt: 2 }}>
                        {activeSearchId === template.id ? (
                            <Box sx={{ p: 2, bgcolor: 'action.selected', }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1
                                    }}>
                                    <Typography variant="body2">Search Exercise</Typography>
                                    <Tooltip title="Close Search">
                                        <IconButton size="small" onClick={() => { setActiveSearchId(null); }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Autocomplete
                                    options={exercises}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(_, newValue) => { onInlineAdd(template.id, newValue); }}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="Bench Press, Squats..."
                                            slotProps={{
                                                ...params.slotProps,
                                                input: { ...params.slotProps.input, startAdornment: <SearchIcon color="action" sx={{ mr: 1, fontSize: 18 }} /> }
                                            }}
                                        />
                                    )}
                                    value={null}
                                    openOnFocus
                                />
                            </Box>
                        ) : (
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => { setActiveSearchId(template.id); }}
                                variant="text"
                                color="primary"
                            >
                                Add Exercise
                            </Button>
                        )}
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    <Box sx={{ mt: 1 }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <HistoryIcon color="primary" fontSize="small" />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Workouts with this Template
                                </Typography>
                                <Chip
                                    size="small"
                                    label={loadingWorkouts ? '...' : workouts.length}
                                    color={workouts.length > 0 ? "primary" : "default"}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                />
                            </Stack>
                            <Button
                                size="small"
                                variant="text"
                                color="primary"
                                startIcon={<PlayArrowIcon fontSize="small" />}
                                onClick={() => { void navigate(`/journal/new?templateId=${template.id}`); }}
                                sx={{ textTransform: 'none' }}
                            >
                                Start Workout
                            </Button>
                        </Stack>

                        {loadingWorkouts ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                                <CircularProgress size={18} />
                                <Typography variant="body2" color="text.secondary">
                                    Loading workout history...
                                </Typography>
                            </Box>
                        ) : workouts.length === 0 ? (
                            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    No workouts have been logged with this template yet.
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => { void navigate(`/journal/new?templateId=${template.id}`); }}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Log First Workout
                                </Button>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {workouts.map((w) => {
                                    const totalSets = w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                                    const totalVolume = w.exercises.reduce((sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + ((s.weight ?? 0) * (s.reps ?? 0)), 0), 0);
                                    const exerciseNames = w.exercises
                                        .map(ex => getExerciseName(ex.exerciseId))
                                        .filter(Boolean)
                                        .join(' • ');

                                    return (
                                        <Paper
                                            key={w.id}
                                            variant="outlined"
                                            sx={{
                                                p: 1.25,
                                                mb: 1,
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
                                            }}
                                            onClick={() => { void navigate(`/journal/${w.id}`); }}
                                        >
                                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                        {w.time && ` • ${w.time}`}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: 'block',
                                                            whiteSpace: 'nowrap',
                                                            textOverflow: 'ellipsis',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {exerciseNames}
                                                    </Typography>
                                                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.25 }}>
                                                        {w.exercises.length} exercises • {totalSets} sets • {formatWeight(totalVolume)} kg
                                                        {w.length ? ` • ${String(w.length)} min` : ''}
                                                    </Typography>
                                                </Box>
                                                <IconButton size="small" color="primary" aria-label="view workout details">
                                                    <ChevronRightIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default memo(TemplateAccordion);
