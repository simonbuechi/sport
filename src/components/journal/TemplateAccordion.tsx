import { memo } from 'react';
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

import type { TrainingTemplate, Exercise } from '../../types';

interface TemplateAccordionProps {
    template: TrainingTemplate;
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
}

const TemplateAccordion = ({
    template,
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
    onOpenSetDialog
}: TemplateAccordionProps) => {

    const getExercise = (id: string) => {
        return exerciseMap[id];
    };

    const getExerciseName = (id: string) => {
        return getExercise(id)?.name ?? 'Unknown Exercise';
    };

    return (
        <Accordion
            elevation={4}
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
                <Box sx={{ mr: 2 }} onClick={(e) => { e.stopPropagation(); }}>
                    <Tooltip title="Edit Template">
                        <Box
                            component="span"
                            onClick={() => { onEdit(template); }}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1,
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
                        <List sx={{ p: 0 }}>
                            {template.exercises.map((ex, idx) => (
                                <Box
                                    key={`${template.id}-${String(idx)}`}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        py: 1.5,
                                        px: 1,
                                        '&:hover': { bgcolor: 'action.hover' },
                                        borderBottom: idx < template.exercises.length - 1 ? '1px dashed' : 'none',
                                        borderColor: 'divider',
                                        position: 'relative'
                                    }}
                                >
                                    <Box sx={{
                                        flexGrow: 1
                                    }}>
                                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
                                                {ex.sets.map((set, sIdx) => (
                                                    <Chip
                                                        key={set.id}
                                                        variant="outlined"
                                                        size="small"
                                                        label={`${String(set.weight)}kg x ${String(set.reps)}`}
                                                        onClick={() => { onOpenSetDialog(template.id, idx, sIdx); }}
                                                        sx={{ borderRadius: '4px' }}
                                                    />
                                                ))}
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
                                                    color: "text.secondary",
                                                    display: "block",
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
                            ))}
                        </List>
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
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default memo(TemplateAccordion);
