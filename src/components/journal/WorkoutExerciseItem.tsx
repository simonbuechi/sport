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
import Chip from '@mui/material/Chip';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import CommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import WorkoutSetItem from './WorkoutSetItem';
import { useTranslation } from 'react-i18next';

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
    supersetTag?: string;
    isInsideSuperset?: boolean;
    onLinkWithNext?: () => void;
    onUnlinkSuperset?: () => void;
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
    previousExercise,
    supersetTag,
    isInsideSuperset,
    onLinkWithNext,
    onUnlinkSuperset
}: WorkoutExerciseItemProps) => {
    const { t } = useTranslation();
    const [noteEditingSetId, setNoteEditingSetId] = useState<string | null>(null);
    const [isEditingExerciseNote, setIsEditingExerciseNote] = useState(false);

    const editingSet = sessionExercise.sets.find(s => s.id === noteEditingSetId);

    return (
        <Paper
            variant="subtle"
            sx={{
                p: { xs: 1.5, sm: 2 },
                mb: isInsideSuperset ? 1.5 : { xs: 2, sm: 2.5 },
                bgcolor: isInsideSuperset ? 'background.paper' : undefined,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: sessionExercise.note ? 0.5 : { xs: 1, sm: 1.5 },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
                    <Box
                        component={Link}
                        to={`/exercises/${sessionExercise.exerciseId}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 0,
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': { opacity: 0.85 }
                        }}
                    >
                        {supersetTag && (
                            <Chip
                                label={supersetTag}
                                size="small"
                                color="primary"
                                sx={{ height: 22, fontWeight: 500, fontSize: '0.75rem', flexShrink: 0 }}
                            />
                        )}
                        <Avatar
                            src={exercise?.icon_url ? `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}` : undefined}
                            alt={exercise?.name ?? t('journal.unknownExercise')}
                            sx={{ width: 32, height: 32, flexShrink: 0 }}
                        >
                            {(exercise?.name ?? 'U').charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ wordBreak: 'break-word', lineHeight: 1.3 }}>
                            {exercise?.name ?? t('journal.unknownExercise')}
                        </Typography>
                    </Box>
                    <Tooltip title={t('journal.addNotes')} arrow>
                        <IconButton
                            size="small"
                            onClick={() => { setIsEditingExerciseNote(true); }}
                            color={sessionExercise.note ? 'primary' : 'default'}
                            sx={{ flexShrink: 0 }}
                        >
                            {sessionExercise.note ? <CommentIcon fontSize="small" /> : <CommentOutlinedIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 0.5 }}>
                    <Tooltip title={t('journal.moveUp')} arrow>
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
                    <Tooltip title={t('journal.moveDown')} arrow>
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
                    {isInsideSuperset ? (
                        <Tooltip title={t('supersets.unlink')} arrow>
                            <IconButton size="small" onClick={onUnlinkSuperset} sx={{ ml: 0.5 }}>
                                <LinkOffIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : onLinkWithNext ? (
                        <Tooltip title={t('supersets.groupWithNext')} arrow>
                            <IconButton size="small" onClick={onLinkWithNext} color="primary" sx={{ ml: 0.5 }}>
                                <LinkIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    <Tooltip title={t('journal.removeExercise')} arrow>
                        <IconButton
                            size="small"
                            onClick={() => { onRemoveExercise(sessionExercise.exerciseId); }}
                            color="error"
                            sx={{ ml: 0.5 }}
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
                    sx={{ mb: 1.5, pl: 0.5, cursor: 'pointer', fontStyle: 'italic' }}
                    onClick={() => { setIsEditingExerciseNote(true); }}
                >
                    {sessionExercise.note}
                </Typography>
            )}

            <Box sx={{ pl: { xs: 0, sm: 0.5 } }}>
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
                    sx={{ mt: 0.5 }}
                >
                    {t('journal.addSet')}
                </Button>
            </Box>

            {/* Set Note Modal */}
            <Dialog
                open={Boolean(noteEditingSetId)}
                onClose={() => { setNoteEditingSetId(null); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{t('journal.setNotesTitle', { number: sessionExercise.sets.findIndex(s => s.id === noteEditingSetId) + 1 })}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        id={`set-notes-${noteEditingSetId ?? 'default'}`}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder={t('journal.setNotesPlaceholder')}
                        value={editingSet?.notes ?? ''}
                        onChange={(e) => {
                            if (noteEditingSetId) {
                                onUpdateSet(sessionExercise.exerciseId, noteEditingSetId, { notes: e.target.value });
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setNoteEditingSetId(null); }} variant="contained">{t('common.done')}</Button>
                </DialogActions>
            </Dialog>

            {/* Exercise Note Modal */}
            <Dialog
                open={isEditingExerciseNote}
                onClose={() => { setIsEditingExerciseNote(false); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{t('journal.exerciseNotesTitle', { name: exercise?.name ?? t('journal.unknownExercise') })}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        id={`exercise-notes-${sessionExercise.exerciseId}`}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder={t('journal.exerciseNotePlaceholder')}
                        value={sessionExercise.note ?? ''}
                        onChange={(e) => { onUpdateExerciseNote(sessionExercise.exerciseId, e.target.value); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setIsEditingExerciseNote(false); }} variant="contained">{t('common.done')}</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default memo(WorkoutExerciseItem);
