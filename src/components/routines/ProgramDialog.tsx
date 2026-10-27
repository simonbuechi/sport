import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RepeatIcon from '@mui/icons-material/Repeat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HotelIcon from '@mui/icons-material/Hotel';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import type { Program, ProgramDay, ProgramType, TrainingTemplate } from '../../types';

export interface ProgramFormData {
    name: string;
    description: string;
    type: ProgramType;
    days: ProgramDay[];
}

interface ProgramDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ProgramFormData) => Promise<void>;
    editingProgram: Program | null;
    templates: TrainingTemplate[];
    saving: boolean;
}

const generateId = () => crypto.randomUUID();

interface ProgramFormProps {
    editingProgram: Program | null;
    templates: TrainingTemplate[];
    saving: boolean;
    onClose: () => void;
    onSave: (data: ProgramFormData) => Promise<void>;
}

const ProgramForm: React.FC<ProgramFormProps> = ({
    editingProgram,
    templates,
    saving,
    onClose,
    onSave,
}) => {
    const { t } = useTranslation();
    const [name, setName] = useState(editingProgram?.name ?? '');
    const [description, setDescription] = useState(editingProgram?.description ?? '');
    const [type, setType] = useState<ProgramType>(editingProgram?.type ?? 'repetitive');
    const [isFixedDates, setIsFixedDates] = useState(
        Boolean(editingProgram?.days.some((d) => Boolean(d.date)))
    );
    const [days, setDays] = useState<ProgramDay[]>(() => {
        if (editingProgram?.days && editingProgram.days.length > 0) {
            return editingProgram.days;
        }
        return [
            { id: generateId(), dayNumber: 1, templateId: templates[0]?.id ?? null, note: '' },
            { id: generateId(), dayNumber: 2, templateId: templates[1]?.id ?? null, note: '' },
            { id: generateId(), dayNumber: 3, templateId: null, note: '' }, // Rest day
        ];
    });
    const [dayCountInput, setDayCountInput] = useState(String(days.length));
    const [error, setError] = useState('');

    const workoutDaysCount = days.filter((d) => Boolean(d.templateId)).length;
    const restDaysCount = days.length - workoutDaysCount;

    const handleAddDay = (asRest = false) => {
        if (days.length >= 30) return;
        const nextDayNumber = days.length + 1;
        const defaultTemplateId = asRest
            ? null
            : templates.length > 0
                ? templates[(nextDayNumber - 1) % templates.length]?.id ?? null
                : null;

        const newDays = [
            ...days,
            {
                id: generateId(),
                dayNumber: nextDayNumber,
                templateId: defaultTemplateId,
                note: '',
            },
        ];
        setDays(newDays);
        setDayCountInput(String(newDays.length));
    };

    const handleSetDuration = (targetCount: number) => {
        const clamped = Math.max(1, Math.min(30, targetCount));
        if (clamped === days.length) return;
        if (clamped < days.length) {
            const trimmed = days.slice(0, clamped);
            setDays(trimmed);
            setDayCountInput(String(trimmed.length));
            return;
        }

        const additional: ProgramDay[] = [];
        for (let i = days.length; i < clamped; i++) {
            const isWeekEnd = (i + 1) % 7 === 0;
            const tpl = isWeekEnd || templates.length === 0 ? null : templates[i % templates.length];
            additional.push({
                id: generateId(),
                dayNumber: i + 1,
                templateId: tpl?.id ?? null,
                note: '',
            });
        }
        const updated = [...days, ...additional];
        setDays(updated);
        setDayCountInput(String(updated.length));
    };

    const handleRemoveDay = (index: number) => {
        if (days.length <= 1) return;
        const newDays = days.filter((_, i) => i !== index).map((d, i) => ({
            ...d,
            dayNumber: i + 1,
        }));
        setDays(newDays);
        setDayCountInput(String(newDays.length));
    };

    const handleMoveDay = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= days.length) return;

        const newDays = [...days];
        const temp = newDays[index];
        newDays[index] = newDays[targetIndex];
        newDays[targetIndex] = temp;

        const renumbered = newDays.map((d, i) => ({
            ...d,
            dayNumber: i + 1,
        }));
        setDays(renumbered);
    };

    const handleUpdateDay = (index: number, updates: Partial<ProgramDay>) => {
        const newDays = [...days];
        newDays[index] = { ...newDays[index], ...updates };
        setDays(newDays);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError(t('programs.nameRequired'));
            return;
        }
        if (days.length === 0) {
            setError(t('programs.atLeastOneDay'));
            return;
        }

        try {
            await onSave({
                name: name.trim(),
                description: description.trim(),
                type,
                days: days.map(d => ({
                    id: d.id,
                    dayNumber: d.dayNumber,
                    templateId: d.templateId ?? null,
                    ...(d.date ? { date: d.date } : {}),
                    note: d.note ? d.note.trim() : '',
                })),
            });
            onClose();
        } catch (err) {
            console.error('Failed to save program:', err);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {editingProgram ? t('programs.editProgram') : t('programs.createProgram')}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} disabled={saving} size="small" aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {error && (
                        <Alert severity="error" onClose={() => { setError(''); }}>
                            {error}
                        </Alert>
                    )}

                    {/* Basic Info: Program Name & Program Type on top row */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
                            <TextField
                                label={t('programs.programName')}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError('');
                                }}
                                fullWidth
                                required
                                variant="outlined"
                                disabled={saving}
                                placeholder="e.g. 4-Week Hypertrophy Cycle, Push-Pull-Legs"
                                sx={{ flexGrow: 1 }}
                            />

                            {/* Program Type on top next to Program Name, with explanation in tooltip */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                                <ToggleButtonGroup
                                    value={type}
                                    exclusive
                                    onChange={(_, newType: ProgramType | null) => {
                                        if (newType) setType(newType);
                                    }}
                                    disabled={saving}
                                    size="medium"
                                    sx={{ height: 56 }}
                                >
                                    <Tooltip title={t('programs.repetitiveHelp')} arrow>
                                        <ToggleButton
                                            value="repetitive"
                                            aria-label={t('programs.repetitive')}
                                            sx={{ px: { xs: 1.5, sm: 2 }, height: '100%', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            <RepeatIcon sx={{ mr: 0.75 }} fontSize="small" />
                                            {t('programs.repetitive')}
                                        </ToggleButton>
                                    </Tooltip>
                                    <Tooltip title={t('programs.oneTimeHelp')} arrow>
                                        <ToggleButton
                                            value="one-time"
                                            aria-label={t('programs.oneTime')}
                                            sx={{ px: { xs: 1.5, sm: 2 }, height: '100%', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            <CalendarMonthIcon sx={{ mr: 0.75 }} fontSize="small" />
                                            {t('programs.oneTime')}
                                        </ToggleButton>
                                    </Tooltip>
                                </ToggleButtonGroup>
                            </Box>
                        </Box>

                        {type === 'one-time' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Schedule mode:
                                </Typography>
                                <ToggleButtonGroup
                                    value={isFixedDates ? 'fixed' : 'relative'}
                                    exclusive
                                    onChange={(_, mode: 'fixed' | 'relative' | null) => {
                                        if (mode) setIsFixedDates(mode === 'fixed');
                                    }}
                                    size="small"
                                >
                                    <ToggleButton value="relative">
                                        {t('programs.relativeDays')}
                                    </ToggleButton>
                                    <ToggleButton value="fixed">
                                        {t('programs.fixedDates')}
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        )}

                        <TextField
                            label={t('programs.description')}
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); }}
                            fullWidth
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                            disabled={saving}
                            placeholder="Optional description or cycle goals..."
                        />
                    </Box>

                    {/* Schedule Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Section Header: Title + Counters + Duration Number Field + Add Day Buttons */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'stretch', md: 'center' },
                                gap: 1.5,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    {t('programs.programDays')} ({days.length})
                                </Typography>
                                <Chip
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    label={`${String(workoutDaysCount)} ${t('programs.workoutsCount', 'workouts')}`}
                                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                />
                                {restDaysCount > 0 && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`${String(restDaysCount)} ${t('programs.restDaysCount', 'rest')}`}
                                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                    />
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                {/* Field to enter number value of days (1 to 30) */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                        {t('programs.programLength', 'Length (1–30 days)')}:
                                    </Typography>
                                    <TextField
                                        type="number"
                                        size="small"
                                        variant="outlined"
                                        value={dayCountInput}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDayCountInput(val);
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num) && num >= 1 && num <= 30) {
                                                handleSetDuration(num);
                                            }
                                        }}
                                        onBlur={() => {
                                            const num = parseInt(dayCountInput, 10);
                                            if (isNaN(num) || num < 1) {
                                                setDayCountInput('1');
                                                handleSetDuration(1);
                                            } else if (num > 30) {
                                                setDayCountInput('30');
                                                handleSetDuration(30);
                                            } else {
                                                setDayCountInput(String(num));
                                                handleSetDuration(num);
                                            }
                                        }}
                                        slotProps={{
                                            htmlInput: {
                                                min: 1,
                                                max: 30,
                                                style: { textAlign: 'center', fontWeight: 700, width: 44, padding: '6px 4px' },
                                            },
                                        }}
                                        disabled={saving}
                                        sx={{ width: 68 }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {t('programs.daysCount', 'days')}
                                    </Typography>
                                </Box>

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => { handleAddDay(false); }}
                                    size="small"
                                    variant="contained"
                                    disabled={saving || days.length >= 30}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    {t('programs.addDay')}
                                </Button>
                                <Button
                                    startIcon={<HotelIcon />}
                                    onClick={() => { handleAddDay(true); }}
                                    size="small"
                                    variant="outlined"
                                    color="inherit"
                                    disabled={saving || days.length >= 30}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    {t('programs.addRestDay', '+ Rest Day')}
                                </Button>
                            </Box>
                        </Box>

                        {/* Schedule List */}
                        <Paper
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                maxHeight: { xs: 340, sm: 440, md: 500 },
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            {days.map((day, idx) => {
                                const isRest = !day.templateId;
                                return (
                                    <Box
                                        key={day.id || idx}
                                        sx={{
                                            p: { xs: 1.25, sm: 1.5 },
                                            borderBottom: idx < days.length - 1 ? 1 : 0,
                                            borderColor: 'divider',
                                            bgcolor: isRest
                                                ? (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)'
                                                : 'background.paper',
                                            '&:hover': {
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.025)',
                                            },
                                            transition: 'background-color 0.15s ease',
                                        }}
                                    >
                                        {/* Desktop & Tablet (sm+): ALL fields for a day on ONE line */}
                                        <Box
                                            sx={{
                                                display: { xs: 'none', sm: 'flex' },
                                                alignItems: 'center',
                                                gap: 1.5,
                                            }}
                                        >
                                            {/* Day Badge */}
                                            <Chip
                                                icon={isRest ? <HotelIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                                                label={`${t('programs.day')} ${String(day.dayNumber)}`}
                                                size="small"
                                                color={isRest ? 'default' : 'primary'}
                                                variant={isRest ? 'outlined' : 'filled'}
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    height: 32,
                                                    minWidth: 70,
                                                    flexShrink: 0,
                                                }}
                                            />

                                            {/* Template Selector */}
                                            <FormControl
                                                size="small"
                                                sx={{
                                                    minWidth: 180,
                                                    maxWidth: 240,
                                                    flexShrink: 0,
                                                }}
                                                disabled={saving}
                                            >
                                                <Select
                                                    value={day.templateId ?? ''}
                                                    displayEmpty
                                                    variant="outlined"
                                                    onChange={(e) => { handleUpdateDay(idx, { templateId: e.target.value || null }); }}
                                                    sx={{
                                                        bgcolor: 'background.paper',
                                                        fontSize: '0.875rem',
                                                        fontStyle: isRest ? 'italic' : 'normal',
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <HotelIcon fontSize="small" color="action" />
                                                            <em>{t('programs.restDay')}</em>
                                                        </Box>
                                                    </MenuItem>
                                                    {templates.map((tpl) => (
                                                        <MenuItem key={tpl.id} value={tpl.id}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <FitnessCenterIcon fontSize="small" color="primary" />
                                                                <span>{tpl.name}</span>
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {/* Date Picker if fixed */}
                                            {type === 'one-time' && isFixedDates && (
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    label={t('programs.date')}
                                                    value={day.date ?? ''}
                                                    variant="outlined"
                                                    onChange={(e) => { handleUpdateDay(idx, { date: e.target.value }); }}
                                                    slotProps={{ inputLabel: { shrink: true } }}
                                                    sx={{ width: 140, flexShrink: 0 }}
                                                    disabled={saving}
                                                />
                                            )}

                                            {/* Note Field (expands to fill all remaining horizontal space on the line) */}
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                value={day.note ?? ''}
                                                onChange={(e) => { handleUpdateDay(idx, { note: e.target.value }); }}
                                                placeholder={
                                                    isRest
                                                        ? 'Rest day instructions or recovery activities (optional)...'
                                                        : t('programs.notePlaceholder', 'Guidance, focus cues, or target sets (optional)...')
                                                }
                                                disabled={saving}
                                                sx={{
                                                    flexGrow: 1,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '0.875rem',
                                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                                                    },
                                                }}
                                            />

                                            {/* Action Buttons: Up, Down, Delete */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                                <Tooltip title={t('common.moveUp', 'Move Up')}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { handleMoveDay(idx, 'up'); }}
                                                            disabled={idx === 0 || saving}
                                                            aria-label={t('common.moveUp', 'Move Up')}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            <ArrowUpwardIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title={t('common.moveDown', 'Move Down')}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { handleMoveDay(idx, 'down'); }}
                                                            disabled={idx === days.length - 1 || saving}
                                                            aria-label={t('common.moveDown', 'Move Down')}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            <ArrowDownwardIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title={t('common.delete')}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => { handleRemoveDay(idx); }}
                                                            disabled={saving || days.length <= 1}
                                                            aria-label={t('common.delete')}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* Mobile (xs): Stacked layout without horizontal scrolling */}
                                        <Box
                                            sx={{
                                                display: { xs: 'flex', sm: 'none' },
                                                flexDirection: 'column',
                                                gap: 1.25,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Chip
                                                    icon={isRest ? <HotelIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                                                    label={`${t('programs.day')} ${String(day.dayNumber)}`}
                                                    size="small"
                                                    color={isRest ? 'default' : 'primary'}
                                                    variant={isRest ? 'outlined' : 'filled'}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        height: 28,
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Tooltip title={t('common.moveUp', 'Move Up')}>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => { handleMoveDay(idx, 'up'); }}
                                                                disabled={idx === 0 || saving}
                                                                aria-label={t('common.moveUp', 'Move Up')}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <ArrowUpwardIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title={t('common.moveDown', 'Move Down')}>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => { handleMoveDay(idx, 'down'); }}
                                                                disabled={idx === days.length - 1 || saving}
                                                                aria-label={t('common.moveDown', 'Move Down')}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <ArrowDownwardIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title={t('common.delete')}>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => { handleRemoveDay(idx); }}
                                                                disabled={saving || days.length <= 1}
                                                                aria-label={t('common.delete')}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <FormControl size="small" fullWidth disabled={saving}>
                                                <Select
                                                    value={day.templateId ?? ''}
                                                    displayEmpty
                                                    variant="outlined"
                                                    onChange={(e) => { handleUpdateDay(idx, { templateId: e.target.value || null }); }}
                                                    sx={{
                                                        bgcolor: 'background.paper',
                                                        fontSize: '0.875rem',
                                                        fontStyle: isRest ? 'italic' : 'normal',
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <HotelIcon fontSize="small" color="action" />
                                                            <em>{t('programs.restDay')}</em>
                                                        </Box>
                                                    </MenuItem>
                                                    {templates.map((tpl) => (
                                                        <MenuItem key={tpl.id} value={tpl.id}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <FitnessCenterIcon fontSize="small" color="primary" />
                                                                <span>{tpl.name}</span>
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {type === 'one-time' && isFixedDates && (
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={day.date ?? ''}
                                                    variant="outlined"
                                                    onChange={(e) => { handleUpdateDay(idx, { date: e.target.value }); }}
                                                    slotProps={{ inputLabel: { shrink: true } }}
                                                    fullWidth
                                                    disabled={saving}
                                                />
                                            )}

                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                value={day.note ?? ''}
                                                onChange={(e) => { handleUpdateDay(idx, { note: e.target.value }); }}
                                                placeholder={
                                                    isRest
                                                        ? 'Rest day instructions or recovery activities (optional)...'
                                                        : t('programs.notePlaceholder', 'Guidance, focus cues, or target sets (optional)...')
                                                }
                                                fullWidth
                                                disabled={saving}
                                                sx={{
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '0.875rem',
                                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Paper>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, justifyContent: 'space-between', bgcolor: 'grey.50' }}>
                <Button onClick={onClose} disabled={saving} color="inherit">
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={() => void handleSubmit()}
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    sx={{ px: 3, fontWeight: 700 }}
                >
                    {saving ? t('common.saving') : t('common.save')}
                </Button>
            </DialogActions>
        </>
    );
};

export const ProgramDialog: React.FC<ProgramDialogProps> = ({
    open,
    onClose,
    onSave,
    editingProgram,
    templates,
    saving,
}) => {
    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            {open && (
                <ProgramForm
                    key={editingProgram?.id ?? 'new'}
                    editingProgram={editingProgram}
                    templates={templates}
                    saving={saving}
                    onClose={onClose}
                    onSave={onSave}
                />
            )}
        </Dialog>
    );
};
