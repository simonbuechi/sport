import { useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RepeatIcon from '@mui/icons-material/Repeat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Program, TrainingTemplate } from '../../types';

interface ActiveProgramCardProps {
    program: Program;
    templates: TrainingTemplate[];
    onAdvanceDay: (targetIndex?: number) => Promise<void> | void;
    onDeactivate: () => Promise<void> | void;
    compact?: boolean;
}

export const ActiveProgramCard = ({
    program,
    templates,
    onAdvanceDay,
    onDeactivate,
    compact = false,
}: ActiveProgramCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showAllDays, setShowAllDays] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    const templateMap = useMemo(() => {
        return templates.reduce<Record<string, TrainingTemplate>>((acc, tpl) => {
            acc[tpl.id] = tpl;
            return acc;
        }, {});
    }, [templates]);

    const totalDays = program.days.length;
    const currentIndex = Math.min(Math.max(program.currentDayIndex ?? 0, 0), Math.max(totalDays - 1, 0));
    const currentDay = program.days[currentIndex];
    const templateId = currentDay.templateId;
    const currentTemplate = templateId ? templateMap[templateId] : null;
    const isRestDay = !templateId;

    const handleStep = async (direction: 'prev' | 'next') => {
        if (advancing || totalDays === 0) return;
        setAdvancing(true);
        try {
            let nextIdx: number;
            if (direction === 'next') {
                nextIdx = program.type === 'repetitive'
                    ? (currentIndex + 1) % totalDays
                    : Math.min(currentIndex + 1, totalDays - 1);
            } else {
                nextIdx = program.type === 'repetitive'
                    ? (currentIndex - 1 + totalDays) % totalDays
                    : Math.max(currentIndex - 1, 0);
            }
            await onAdvanceDay(nextIdx);
        } finally {
            setAdvancing(false);
        }
    };

    const handleStartWorkout = () => {
        if (templateId) {
            void navigate(`/journal/new?templateId=${templateId}`);
        }
    };

    const currentDayNumberStr = String(currentDay.dayNumber);
    const progressStr = totalDays > 0 ? `(${String(currentIndex + 1)}/${String(totalDays)})` : '';

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'primary.main',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(255, 255, 255, 1) 100%)',
                mb: 3,
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            label={t('programs.activeProgram')}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {program.name}
                        </Typography>
                        <Chip
                            icon={program.type === 'repetitive' ? <RepeatIcon fontSize="small" /> : <CalendarMonthIcon fontSize="small" />}
                            label={program.type === 'repetitive' ? t('programs.repetitive') : t('programs.oneTime')}
                            size="small"
                            variant="outlined"
                        />
                    </Stack>

                    {!compact && (
                        <Tooltip title={t('programs.deactivate')}>
                            <Button
                                size="small"
                                color="inherit"
                                startIcon={<StopCircleIcon />}
                                onClick={() => { void onDeactivate(); }}
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                {t('programs.deactivate')}
                            </Button>
                        </Tooltip>
                    )}
                </Stack>

                {/* Day status display */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        mb: 2,
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
                    >
                        <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                                    {t('programs.day')} {currentDayNumberStr} {progressStr}
                                </Typography>
                                {Boolean(currentDay.date) && (
                                    <Chip label={currentDay.date} size="small" variant="outlined" />
                                )}
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                                {isRestDay ? (
                                    <>
                                        <HotelIcon color="action" />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {t('programs.restDay')}
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <FitnessCenterIcon color="primary" />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {currentTemplate?.name ?? t('programs.workout')}
                                        </Typography>
                                    </>
                                )}
                            </Stack>

                            {Boolean(currentDay.note) && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                    &ldquo;{currentDay.note}&rdquo;
                                </Typography>
                            )}
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Tooltip title={t('programs.previousDay')}>
                                <span>
                                    <IconButton
                                        size="small"
                                        aria-label={t('programs.previousDay')}
                                        onClick={() => { void handleStep('prev'); }}
                                        disabled={advancing || (program.type === 'one-time' && currentIndex === 0)}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title={t('programs.nextDay')}>
                                <span>
                                    <IconButton
                                        size="small"
                                        aria-label={t('programs.nextDay')}
                                        onClick={() => { void handleStep('next'); }}
                                        disabled={advancing || (program.type === 'one-time' && currentIndex >= totalDays - 1)}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            {!isRestDay && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={handleStartWorkout}
                                    sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                    {t('programs.startWorkout')}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

                {/* Day progression pills */}
                {totalDays > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                        {program.days.map((day, idx) => {
                            const isCurrent = idx === currentIndex;
                            const hasWorkout = Boolean(day.templateId);
                            const dayNumberStr = String(day.dayNumber);
                            return (
                                <Chip
                                    key={day.id || idx}
                                    label={`${t('programs.dayShort', 'D')}${dayNumberStr}`}
                                    size="small"
                                    color={isCurrent ? 'primary' : 'default'}
                                    variant={isCurrent ? 'filled' : 'outlined'}
                                    icon={hasWorkout ? <FitnessCenterIcon fontSize="small" /> : <HotelIcon fontSize="small" />}
                                    onClick={() => { void onAdvanceDay(idx); }}
                                    sx={{
                                        cursor: 'pointer',
                                        fontWeight: isCurrent ? 700 : 500,
                                        '&:hover': { opacity: 0.85 },
                                    }}
                                />
                            );
                        })}

                        {!compact && (
                            <Button
                                size="small"
                                color="inherit"
                                endIcon={showAllDays ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                onClick={() => { setShowAllDays(!showAllDays); }}
                                sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
                            >
                                {showAllDays ? t('programs.hideOverview') : t('programs.viewAllDays')}
                            </Button>
                        )}
                    </Box>
                )}

                {/* Collapsible Overview */}
                <Collapse in={showAllDays && !compact}>
                    <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                            {t('programs.scheduleOverview')}
                        </Typography>
                        <Stack spacing={1}>
                            {program.days.map((day, idx) => {
                                const tpl = day.templateId ? templateMap[day.templateId] : null;
                                const isCurrent = idx === currentIndex;
                                return (
                                    <Box
                                        key={day.id || idx}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: isCurrent ? 'action.selected' : 'background.paper',
                                            border: 1,
                                            borderColor: isCurrent ? 'primary.main' : 'divider',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 500 }}>
                                                {t('programs.day')} {String(day.dayNumber)}: {tpl ? tpl.name : t('programs.restDay')}
                                                {day.date && ` (${day.date})`}
                                            </Typography>
                                            {day.note && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {day.note}
                                                </Typography>
                                            )}
                                        </Box>
                                        {day.templateId && (
                                            <Button
                                                size="small"
                                                variant={isCurrent ? 'contained' : 'outlined'}
                                                onClick={() => {
                                                    if (day.templateId) {
                                                        void navigate(`/journal/new?templateId=${day.templateId}`);
                                                    }
                                                }}
                                                sx={{ textTransform: 'none', py: 0.25, minWidth: 64 }}
                                            >
                                                {t('programs.start')}
                                            </Button>
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};
