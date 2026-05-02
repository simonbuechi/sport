import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import CommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WorkoutSetItem from './WorkoutSetItem';

import type { WorkoutExercise, Exercise, ExerciseSet } from '../../types';

interface WorkoutExerciseItemProps {
    sessionExercise: WorkoutExercise;
    exercise: Exercise | undefined;
    onRemoveExercise: (exerciseId: string) => void;
    onAddSet: (exerciseId: string) => void;
    onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
    onRemoveSet: (exerciseId: string, setId: string) => void;
    onUpdateExerciseNote: (exerciseId: string, note: string) => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    previousExercise?: WorkoutExercise;
}

const WorkoutExerciseItem = ({
    sessionExercise,
    exercise,
    onRemoveExercise,
    onAddSet,
    onUpdateSet,
    onRemoveSet,
    onUpdateExerciseNote,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
    previousExercise
}: WorkoutExerciseItemProps) => {
    const [noteEditingSetId, setNoteEditingSetId] = useState<string | null>(null);
    const [isEditingExerciseNote, setIsEditingExerciseNote] = useState(false);

    const editingSet = sessionExercise.sets.find(s => s.id === noteEditingSetId);

    return (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, bgcolor: 'grey.50', }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: sessionExercise.note ? 0.5 : { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                        component={Link} 
                        to={`/exercises/${sessionExercise.exerciseId}`}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': {
                                opacity: 0.8
                            }
                        }}
                    >
                        <Avatar
                            src={exercise?.icon_url ?
                                `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                                : undefined}
                            alt={exercise?.name ?? 'Unknown Exercise'}
                            sx={{ width: 32, height: 32 }}
                        >
                            {(exercise?.name ?? 'U').charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            {exercise?.name ?? 'Unknown Exercise'}
                        </Typography>
                    </Box>
                    <Tooltip title="Add Notes" arrow>
                        <IconButton
                            size="small"
                            onClick={() => { setIsEditingExerciseNote(true); }}
                            color={sessionExercise.note ? "primary" : "default"}
                            sx={{ ml: 0.5 }}
                        >
                            {sessionExercise.note ? <CommentIcon fontSize="small" /> : <CommentOutlinedIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Move Up" arrow>
                        <span>
                            <IconButton 
                                size="small" 
                                onClick={onMoveUp} 
                                disabled={isFirst}
                                sx={{ color: isFirst ? 'action.disabled' : 'action.active' }}
                            >
                                <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Move Down" arrow>
                        <span>
                            <IconButton 
                                size="small" 
                                onClick={onMoveDown} 
                                disabled={isLast}
                                sx={{ color: isLast ? 'action.disabled' : 'action.active' }}
                            >
                                <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Remove Exercise" arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => { onRemoveExercise(sessionExercise.exerciseId); }} 
                            color="error"
                            sx={{ ml: 1 }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            
            {sessionExercise.note && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, pl: 0.5, cursor: 'pointer' }}
                    onClick={() => { setIsEditingExerciseNote(true); }}
                >
                    {sessionExercise.note}
                </Typography>
            )}
            
            <Box sx={{ pl: { xs: 0, sm: 1 } }}>
                {sessionExercise.sets.map((set, index) => (
                    <WorkoutSetItem
                        key={set.id}
                        exerciseId={sessionExercise.exerciseId}
                        set={set}
                        index={index}
                        onUpdateSet={onUpdateSet}
                        onRemoveSet={onRemoveSet}
                        onEditNotes={setNoteEditingSetId}
                        previousSet={previousExercise?.sets[index]}
                    />
                ))}
                <Button 
                    startIcon={<AddIcon />} 
                    size="small" 
                    onClick={() => { onAddSet(sessionExercise.exerciseId); }}
                >
                    Add Set
                </Button>
            </Box>

            {/* Note Modal */}
            <Dialog 
                open={Boolean(noteEditingSetId)} 
                onClose={() => { setNoteEditingSetId(null); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Set {sessionExercise.sets.findIndex(s => s.id === noteEditingSetId) + 1} Notes</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        id={`set-notes-${noteEditingSetId ?? 'default'}`}
                        variant="filled"
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Add notes for this set..."
                        value={editingSet?.notes ?? ''}
                        onChange={(e) => { 
                            if (noteEditingSetId) {
                                onUpdateSet(sessionExercise.exerciseId, noteEditingSetId, { notes: e.target.value });
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setNoteEditingSetId(null); }} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>

            {/* Exercise Note Modal */}
            <Dialog 
                open={isEditingExerciseNote} 
                onClose={() => { setIsEditingExerciseNote(false); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{exercise?.name ?? 'Exercise'} Notes</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        id={`exercise-notes-${sessionExercise.exerciseId}`}
                        variant="filled"
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="General notes for this exercise..."
                        value={sessionExercise.note ?? ''}
                        onChange={(e) => { onUpdateExerciseNote(sessionExercise.exerciseId, e.target.value); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setIsEditingExerciseNote(false); }} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default memo(WorkoutExerciseItem);
