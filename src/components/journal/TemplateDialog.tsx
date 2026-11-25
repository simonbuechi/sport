import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type { TrainingTemplate } from '../../types';

export interface TemplateFormData {
    name: string;
    notes: string;
    isFavorite: boolean;
    isArchived: boolean;
}

interface TemplateDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: TemplateFormData) => void;
    onDelete?: (id: string) => void;
    saving: boolean;
    editingTemplate: TrainingTemplate | null;
    onCreateSample?: () => void;
}

const TemplateDialog = ({
    open,
    onClose,
    onSave,
    onDelete,
    saving,
    editingTemplate,
    onCreateSample
}: TemplateDialogProps) => {
    const { t } = useTranslation();
    const [name, setName] = useState(editingTemplate?.name ?? '');
    const [notes, setNotes] = useState(editingTemplate?.notes ?? '');
    const [isFavorite, setIsFavorite] = useState(Boolean(editingTemplate?.isFavorite));
    const [isArchived, setIsArchived] = useState(Boolean(editingTemplate?.isArchived));

    const handleSave = () => {
        onSave({
            name,
            notes,
            isFavorite,
            isArchived
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editingTemplate ? t('templates.edit') : t('templates.create')}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 0.5 }}>
                    <TextField
                        label={t('templates.name')}
                        fullWidth
                        value={name}
                        onChange={(e) => { setName(e.target.value); }}
                        placeholder="e.g. Push Day, Leg Routine"
                    />
                    <TextField
                        label={t('templates.notes')}
                        fullWidth
                        multiline
                        rows={3}
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); }}
                        placeholder={t('templates.notesPlaceholder')}
                    />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControlLabel
                            control={<Checkbox checked={isFavorite} onChange={(e) => { setIsFavorite(e.target.checked); }} />}
                            label={t('templates.favorite')}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={isArchived} onChange={(e) => { setIsArchived(e.target.checked); }} />}
                            label={t('templates.archived', { defaultValue: 'Archived' })}
                        />
                    </Box>

                    {!editingTemplate && onCreateSample && (
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                                border: '1px dashed',
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                                {t('templates.samplePrompt', { defaultValue: 'Not sure where to start? Try a sample template:' })}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={onCreateSample}
                            >
                                {t('templates.createSample', { defaultValue: 'Create Sample' })}
                            </Button>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: editingTemplate ? 'space-between' : 'flex-end' }}>
                {editingTemplate && onDelete && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => { onDelete(editingTemplate.id); }}
                    >
                        {t('common.delete')}
                    </Button>
                )}
                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} color="inherit">{t('common.cancel')}</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? t('common.saving') : (editingTemplate ? t('common.save') : t('templates.create'))}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default TemplateDialog;
