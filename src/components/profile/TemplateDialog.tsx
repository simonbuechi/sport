import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

import type { TrainingTemplate } from '../../types';

interface TemplateDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    onDelete?: (id: string) => void;
    saving: boolean;
    editingTemplate: TrainingTemplate | null;
    name: string;
    setName: (name: string) => void;
    notes: string;
    setNotes: (notes: string) => void;
    isFavorite: boolean;
    setIsFavorite: (fav: boolean) => void;
    isArchived: boolean;
    setIsArchived: (archived: boolean) => void;
    onCreateSample?: () => void;
}

const TemplateDialog = ({
    open,
    onClose,
    onSave,
    onDelete,
    saving,
    editingTemplate,
    name,
    setName,
    notes,
    setNotes,
    isFavorite,
    setIsFavorite,
    isArchived,
    setIsArchived,
    onCreateSample
}: TemplateDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editingTemplate ? 'Rename Template' : 'Create Template'}</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Template Name"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => { setName(e.target.value); }}
                    placeholder="e.g. Push Day, Leg Routine"
                />
                <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); }}
                    placeholder="General notes about this routine..."
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <FormControlLabel
                        control={<Checkbox checked={isFavorite} onChange={(e) => { setIsFavorite(e.target.checked); }} color="warning" />}
                        label="Favorite"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isArchived} onChange={(e) => { setIsArchived(e.target.checked); }} />}
                        label="Archived"
                    />
                </Box>

                {!editingTemplate && onCreateSample && (
                    <Box sx={{ 
                        mt: 4, 
                        p: 2, 
                        bgcolor: 'primary.50', 
                        borderRadius: 2, 
                        border: '1px dashed', 
                        borderColor: 'primary.main',
                        textAlign: 'center'
                    }}>
                        <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                            Not sure about this? Try a sample template
                        </Typography>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={onCreateSample}
                            sx={{ fontWeight: 600 }}
                        >
                            Create Sample
                        </Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: editingTemplate ? 'space-between' : 'flex-end' }}>
                {editingTemplate && onDelete && (
                    <Button color="error" startIcon={<DeleteIcon />} onClick={() => { onDelete(editingTemplate.id); }}>
                        Delete
                    </Button>
                )}
                <Box>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={onSave} disabled={saving || !name.trim()}>
                        {saving ? 'Saving...' : (editingTemplate ? 'Save Name' : 'Create Template')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default TemplateDialog;
