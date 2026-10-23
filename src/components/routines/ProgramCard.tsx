import { useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RepeatIcon from '@mui/icons-material/Repeat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HotelIcon from '@mui/icons-material/Hotel';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';
import type { Program, TrainingTemplate } from '../../types';

interface ProgramCardProps {
    program: Program;
    templates: TrainingTemplate[];
    onEdit: (program: Program) => void;
    onDelete: (program: Program) => void;
    onActivate: (programId: string | null) => Promise<void>;
    actionLoading?: boolean;
}

export const ProgramCard = ({
    program,
    templates,
    onEdit,
    onDelete,
    onActivate,
    actionLoading = false,
}: ProgramCardProps) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    const templateMap = useMemo(() => {
        return templates.reduce<Record<string, TrainingTemplate>>((acc, tpl) => {
            acc[tpl.id] = tpl;
            return acc;
        }, {});
    }, [templates]);

    const workoutDaysCount = program.days.filter(d => Boolean(d.templateId)).length;
    const restDaysCount = program.days.length - workoutDaysCount;

    return (
        <Card
            elevation={1}
            sx={{
                borderRadius: 2.5,
                border: 1,
                borderColor: program.isActive ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                '&:hover': {
                    boxShadow: 3,
                },
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }} spacing={1}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {program.name}
                            </Typography>

                            {program.isActive && (
                                <Chip
                                    icon={<CheckCircleIcon fontSize="small" />}
                                    label={t('programs.active')}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 700 }}
                                />
                            )}

                            <Chip
                                icon={program.type === 'repetitive' ? <RepeatIcon fontSize="small" /> : <CalendarMonthIcon fontSize="small" />}
                                label={program.type === 'repetitive' ? t('programs.repetitive') : t('programs.oneTime')}
                                size="small"
                                variant="outlined"
                            />

                            <Typography variant="caption" color="text.secondary">
                                {program.days.length} {t('programs.daysCount', { count: program.days.length })} ({workoutDaysCount} {t('programs.workoutsCount', 'workouts')}, {restDaysCount} {t('programs.restDaysCount', 'rest')})
                            </Typography>
                        </Stack>

                        {program.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {program.description}
                            </Typography>
                        )}
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                        {program.isActive ? (
                            <Button
                                size="small"
                                color="inherit"
                                variant="outlined"
                                disabled={actionLoading}
                                onClick={() => void onActivate(null)}
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                {t('programs.deactivate')}
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                color="primary"
                                variant="contained"
                                startIcon={<PlayArrowIcon />}
                                disabled={actionLoading}
                                onClick={() => void onActivate(program.id)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {t('programs.activate')}
                            </Button>
                        )}

                        <Tooltip title={t('common.edit')}>
                            <IconButton size="small" onClick={() => { onEdit(program); }} disabled={actionLoading}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t('common.delete')}>
                            <IconButton size="small" color="error" onClick={() => { onDelete(program); }} disabled={actionLoading}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <IconButton size="small" onClick={() => { setExpanded(!expanded); }}>
                            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Stack>
                </Stack>

                {/* Collapsible Days list */}
                <Collapse in={expanded}>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('programs.schedule')}:
                        </Typography>
                        <Stack spacing={0.75}>
                            {program.days.map((day) => {
                                const tpl = day.templateId ? templateMap[day.templateId] : null;
                                return (
                                    <Box
                                        key={day.id}
                                        sx={{
                                            py: 0.75,
                                            px: 1.25,
                                            borderRadius: 1.5,
                                            bgcolor: 'action.hover',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            {day.templateId ? (
                                                <FitnessCenterIcon fontSize="small" color="primary" />
                                            ) : (
                                                <HotelIcon fontSize="small" color="action" />
                                            )}
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {t('programs.day')} {day.dayNumber}:
                                            </Typography>
                                            <Typography variant="body2">
                                                {tpl ? tpl.name : t('programs.restDay')}
                                            </Typography>
                                            {day.date && (
                                                <Chip label={day.date} size="small" variant="outlined" sx={{ height: 20 }} />
                                            )}
                                        </Stack>
                                        {day.note && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: '40%' }} noWrap>
                                                {day.note}
                                            </Typography>
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
