import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

export interface SetDialogData {
    tid: string;
    exerciseIdx: number;
    setIdx?: number;
    weight: number | undefined;
    reps: number | undefined;
    count: number;
}

interface TemplateSetDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    onDelete: (tid: string, exerciseIdx: number, setIdx: number) => void;
    data: SetDialogData | null;
    setData: React.Dispatch<React.SetStateAction<SetDialogData | null>>;
}

const TemplateSetDialog = ({
    open,
    onClose,
    onSave,
    onDelete,
    data,
    setData
}: TemplateSetDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{data?.setIdx !== undefined ? 'Edit Set' : 'Add Set(s)'}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                    <TextField
                        label="Weight (kg)"
                        type="number"
                        fullWidth
                        value={data?.weight ?? ''}
                        onChange={(e) => { setData(prev => prev ? { ...prev, weight: e.target.value === '' ? undefined : Number(e.target.value) } : null); }}
                    />
                    <TextField
                        label="Reps"
                        type="number"
                        fullWidth
                        value={data?.reps ?? ''}
                        onChange={(e) => { setData(prev => prev ? { ...prev, reps: e.target.value === '' ? undefined : Number(e.target.value) } : null); }}
                    />
                    {data?.setIdx === undefined && (
                        <TextField
                            label="Number of Sets"
                            type="number"
                            fullWidth
                            value={data?.count ?? 1}
                            onChange={(e) => { setData(prev => prev ? { ...prev, count: Number(e.target.value) } : null); }}
                            helperText="Adds this set multiple times"
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: data?.setIdx !== undefined ? 'space-between' : 'flex-end' }}>
                {data?.setIdx !== undefined && (
                    <Button color="error" startIcon={<DeleteIcon />} onClick={() => { if (data.setIdx !== undefined) { onDelete(data.tid, data.exerciseIdx, data.setIdx); } }}>
                        Delete
                    </Button>
                )}
                <Box>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={onSave} color="primary">
                        {data?.setIdx !== undefined ? 'Save' : 'Add'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default TemplateSetDialog;
