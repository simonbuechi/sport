import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { getDifficultyColor, getDifficultyLabel, getGoalLabel } from '../../utils/programUtils';
import type { ProgramLibraryItem } from '../../types';

interface ProgramLibraryCardProps {
    program: ProgramLibraryItem;
    onSelect: (program: ProgramLibraryItem) => void;
    onCopy: (program: ProgramLibraryItem) => Promise<void>;
    isCopying?: boolean;
}

export const ProgramLibraryCard: React.FC<ProgramLibraryCardProps> = ({
    program,
    onSelect,
    onCopy,
    isCopying = false,
}) => {
    const { t } = useTranslation();

    const workoutDaysCount = program.days.filter(d => Boolean(d.templateKey)).length;
    const metaParts: string[] = [];
    if (program.goal) {
        const label = getGoalLabel(t, program.goal);
        if (label) metaParts.push(label);
    }
    if (program.daysPerWeek) {
        metaParts.push(`${String(program.daysPerWeek)} ${t('programs.daysPerWeek', { defaultValue: 'days/week' })}`);
    }
    metaParts.push(`${String(program.days.length)} ${t('programs.daysCount', { defaultValue: 'days' })} (${String(workoutDaysCount)} ${t('programs.workoutsCount', { defaultValue: 'workouts' })})`);

    return (
        <ListItem
            disablePadding
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
            }}
        >
            <ListItemButton
                onClick={() => { onSelect(program); }}
                sx={{
                    py: 1.75,
                    px: { xs: 2, sm: 2.5 },
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                                {program.name}
                            </Typography>
                            {program.difficulty && (
                                <Chip
                                    size="small"
                                    label={getDifficultyLabel(t, program.difficulty)}
                                    color={getDifficultyColor(program.difficulty)}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    }
                    secondary={
                        <Box component="span" sx={{ display: 'block' }}>
                            <Typography
                                variant="caption"
                                component="span"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.25 }}
                            >
                                {metaParts.join(' · ')}
                            </Typography>
                            {program.description && (
                                <Typography
                                    variant="body2"
                                    component="span"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {program.description}
                                </Typography>
                            )}
                        </Box>
                    }
                />
                <ChevronRightIcon color="action" sx={{ ml: 1, display: { xs: 'none', sm: 'block' }, flexShrink: 0 }} />
            </ListItemButton>

            <Box
                sx={{
                    px: { xs: 2, sm: 2.5 },
                    pb: { xs: 1.5, sm: 0 },
                    pt: { xs: 0, sm: 0 },
                    display: 'flex',
                    justifyContent: 'flex-end',
                    flexShrink: 0,
                }}
            >
                <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    disabled={isCopying}
                    startIcon={isCopying ? <CircularProgress size={16} color="inherit" /> : <ContentCopyIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        void onCopy(program);
                    }}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {isCopying
                        ? t('programs.copying', { defaultValue: 'Copying...' })
                        : t('programs.useProgram', { defaultValue: 'Use Program' })}
                </Button>
            </Box>
        </ListItem>
    );
};
export default ProgramLibraryCard;
