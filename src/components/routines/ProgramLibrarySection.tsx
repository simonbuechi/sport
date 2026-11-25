import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useExercises } from '../../context/ExercisesContext';
import {
    subscribeToProgramLibrary,
    cloneProgramFromLibrary,
} from '../../services/db';
import { getDifficultyLabel, getGoalLabel } from '../../utils/programUtils';
import type { ProgramLibraryItem, ProgramDifficulty, ProgramGoal } from '../../types';
import ProgramLibraryCard from './ProgramLibraryCard';
import EmptyState from '../common/EmptyState';

interface ProgramLibrarySectionProps {
    onProgramCopied?: (programId: string) => void;
}

export const ProgramLibrarySection: React.FC<ProgramLibrarySectionProps> = ({
    onProgramCopied,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises } = useExercises();

    const [programs, setPrograms] = useState<ProgramLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<ProgramDifficulty | 'all'>('all');
    const [selectedGoal, setSelectedGoal] = useState<ProgramGoal | 'all'>('all');

    // Copying state
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToProgramLibrary(
            (items) => {
                setPrograms(items);
                setLoading(false);
            },
            (err) => {
                console.error('Error in program library subscription:', err);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    const filteredPrograms = useMemo(() => {
        return programs.filter((p) => {
            if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) {
                return false;
            }
            if (selectedGoal !== 'all' && p.goal !== selectedGoal) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const nameMatch = p.name.toLowerCase().includes(q);
                const descMatch = p.description?.toLowerCase().includes(q) ?? false;
                const authorMatch = p.author?.toLowerCase().includes(q) ?? false;
                if (!nameMatch && !descMatch && !authorMatch) {
                    return false;
                }
            }
            return true;
        });
    }, [programs, selectedDifficulty, selectedGoal, searchQuery]);

    const handleCopy = async (item: ProgramLibraryItem) => {
        if (!currentUser) {
            setError(t('auth.unauthenticated', { defaultValue: 'You must be logged in to copy programs.' }));
            return;
        }

        setCopyingId(item.id);
        setError(null);
        setSuccessMessage(null);

        try {
            const { programId } = await cloneProgramFromLibrary(currentUser.uid, item, exercises);
            setSuccessMessage(t('programs.copySuccess', {
                name: item.name,
                defaultValue: `"${item.name}" was successfully added to your programs!`
            }));
            setLastCopiedId(programId);
        } catch (err) {
            console.error('Failed to clone library program:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setCopyingId(null);
        }
    };

    const difficulties: (ProgramDifficulty | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced'];
    const goals: (ProgramGoal | 'all')[] = ['all', 'strength', 'hypertrophy', 'fitness'];

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            {/* Header info */}
            <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" component="h2" sx={{ mb: 0.5 }}>
                    {t('programs.libraryTitle', { defaultValue: 'Program Library' })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('programs.librarySubtitle', {
                        defaultValue: 'Explore structured, community-tested training programs. Select any program to create your own customizable copy with all included templates.'
                    })}
                </Typography>
            </Box>

            {/* Notifications */}
            {successMessage && (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon fontSize="inherit" />}
                    onClose={() => { setSuccessMessage(null); }}
                    action={
                        lastCopiedId && onProgramCopied ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => { onProgramCopied(lastCopiedId); }}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {t('programs.viewInMyPrograms', { defaultValue: 'View in My Programs' })}
                            </Button>
                        ) : undefined
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

            {/* Search & Filter Toolbar */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('programs.searchPlaceholder', { defaultValue: 'Search by program name, goal, or keyword...' })}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                        }
                    }}
                    sx={{ mb: 2 }}
                />

                <Stack spacing={1.25}>
                    {/* Goal Filters */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ fontWeight: 500, minWidth: 60, color: 'text.secondary' }}>
                            {t('programs.goal', { defaultValue: 'Goal' })}:
                        </Typography>
                        {goals.map((g) => (
                            <Chip
                                key={g}
                                label={g === 'all' ? t('common.all', { defaultValue: 'All' }) : (getGoalLabel(t, g) ?? g)}
                                size="small"
                                color={selectedGoal === g ? 'primary' : 'default'}
                                variant={selectedGoal === g ? 'filled' : 'outlined'}
                                onClick={() => { setSelectedGoal(g); }}
                                sx={{ cursor: 'pointer', fontWeight: selectedGoal === g ? 500 : 400 }}
                            />
                        ))}
                    </Box>

                    {/* Difficulty Filters */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ fontWeight: 500, minWidth: 60, color: 'text.secondary' }}>
                            {t('programs.difficulty', { defaultValue: 'Level' })}:
                        </Typography>
                        {difficulties.map((d) => (
                            <Chip
                                key={d}
                                label={d === 'all' ? t('common.all', { defaultValue: 'All' }) : (getDifficultyLabel(t, d) ?? d)}
                                size="small"
                                color={selectedDifficulty === d ? 'primary' : 'default'}
                                variant={selectedDifficulty === d ? 'filled' : 'outlined'}
                                onClick={() => { setSelectedDifficulty(d); }}
                                sx={{ cursor: 'pointer', fontWeight: selectedDifficulty === d ? 500 : 400 }}
                            />
                        ))}
                    </Box>
                </Stack>
            </Paper>

            {/* Programs List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : filteredPrograms.length === 0 ? (
                <EmptyState
                    icon={<SearchIcon />}
                    title={t('programs.noLibraryMatches', { defaultValue: 'No programs match your search filters' })}
                    actions={
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedDifficulty('all');
                                setSelectedGoal('all');
                            }}
                        >
                            {t('common.clearFilters', { defaultValue: 'Clear Filters' })}
                        </Button>
                    }
                />
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <List disablePadding>
                        {filteredPrograms.map((prog, idx) => (
                            <React.Fragment key={prog.id}>
                                {idx > 0 && <Divider component="li" />}
                                <ProgramLibraryCard
                                    program={prog}
                                    onSelect={(p) => { void navigate(`/routines/library/${p.id}`); }}
                                    onCopy={handleCopy}
                                    isCopying={copyingId === prog.id}
                                />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};
export default ProgramLibrarySection;
