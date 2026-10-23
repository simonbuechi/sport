import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RepeatIcon from '@mui/icons-material/Repeat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
    const [error, setError] = useState('');

    const handleAddDay = () => {
        const nextDayNumber = days.length + 1;
        setDays([
            ...days,
            {
                id: generateId(),
                dayNumber: nextDayNumber,
                templateId: null,
                note: '',
            },
        ]);
    };

    const handleRemoveDay = (index: number) => {
        const newDays = days.filter((_, i) => i !== index).map((d, i) => ({
            ...d,
            dayNumber: i + 1,
        }));
        setDays(newDays);
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
                days,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {editingProgram ? t('programs.editProgram') : t('programs.createProgram')}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}

                    <TextField
                        label={t('programs.programName')}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        fullWidth
                        required
                        disabled={saving}
                    />

                    <TextField
                        label={t('programs.description')}
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); }}
                        fullWidth
                        multiline
                        rows={2}
                        disabled={saving}
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            {t('programs.programType')}
                        </Typography>
                        <ToggleButtonGroup
                            value={type}
                            exclusive
                            onChange={(_, newType: ProgramType | null) => {
                                if (newType) setType(newType);
                            }}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value="repetitive">
                                <RepeatIcon sx={{ mr: 1 }} fontSize="small" />
                                {t('programs.repetitive')}
                            </ToggleButton>
                            <ToggleButton value="one-time">
                                <CalendarMonthIcon sx={{ mr: 1 }} fontSize="small" />
                                {t('programs.oneTime')}
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {type === 'repetitive'
                                ? t('programs.repetitiveHelp')
                                : t('programs.oneTimeHelp')}
                        </Typography>
                    </Box>

                    {type === 'one-time' && (
                        <Box>
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

                    {/* Days Builder */}
                    <Box>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {t('programs.programDays')} ({days.length})
                            </Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddDay}
                                size="small"
                                variant="outlined"
                                disabled={saving}
                                sx={{ textTransform: 'none' }}
                            >
                                {t('programs.addDay')}
                            </Button>
                        </Stack>

                        <Stack spacing={1.5}>
                            {days.map((day, idx) => (
                                <Paper
                                    key={day.id || idx}
                                    variant="outlined"
                                    sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}
                                >
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ minWidth: 64, fontWeight: 700, color: 'primary.main' }}
                                        >
                                            {t('programs.day')} {day.dayNumber}
                                        </Typography>

                                        {type === 'one-time' && isFixedDates && (
                                            <TextField
                                                type="date"
                                                size="small"
                                                label={t('programs.date')}
                                                value={day.date ?? ''}
                                                onChange={(e) => { handleUpdateDay(idx, { date: e.target.value }); }}
                                                slotProps={{ inputLabel: { shrink: true } }}
                                                sx={{ minWidth: 140 }}
                                            />
                                        )}

                                        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 180 }}>
                                            <InputLabel>{t('programs.routine')}</InputLabel>
                                            <Select
                                                value={day.templateId ?? ''}
                                                label={t('programs.routine')}
                                                onChange={(e) => { handleUpdateDay(idx, { templateId: e.target.value || null }); }}
                                            >
                                                <MenuItem value="">
                                                    <em>{t('programs.restDay')}</em>
                                                </MenuItem>
                                                {templates.map((tpl) => (
                                                    <MenuItem key={tpl.id} value={tpl.id}>
                                                        {tpl.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            size="small"
                                            label={t('programs.note')}
                                            value={day.note ?? ''}
                                            onChange={(e) => { handleUpdateDay(idx, { note: e.target.value }); }}
                                            placeholder={t('programs.notePlaceholder')}
                                            sx={{ flexGrow: 1 }}
                                        />

                                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                                            <Tooltip title={t('common.moveUp', 'Move Up')}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => { handleMoveDay(idx, 'up'); }}
                                                        disabled={idx === 0 || saving}
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
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={() => void handleSubmit()}
                    variant="contained"
                    disabled={saving}
                    color="primary"
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
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
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
