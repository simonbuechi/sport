import { memo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from 'react-router-dom';
import type { TrainingTemplate } from '../../../types';

interface TemplatesWidgetProps {
    templates: TrainingTemplate[];
}

const TemplatesWidget = ({ templates }: TemplatesWidgetProps) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {templates.length === 0 ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        start creating workout templates for faster journaling
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => { void navigate('/profile?tab=templates'); }}
                    >
                        Create Template
                    </Button>
                </Box>
            ) : (
                <List disablePadding sx={{ width: '100%' }}>
                    {templates.slice(0, 5).map((template: TrainingTemplate) => (
                        <ListItem key={template.id} disablePadding sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                            <ListItemButton
                                sx={{ py: 0.75, px: 1, }}
                                onClick={() => { void navigate('/profile?tab=templates'); }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <DescriptionIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2">
                                            {template.name}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {templates.length > 5 && (
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ py: 0.5, px: 1, justifyContent: 'center' }}
                                onClick={() => { void navigate('/profile?tab=templates'); }}
                            >
                                <Typography variant="caption" color="primary">
                                    View all {templates.length} templates
                                </Typography>
                            </ListItemButton>
                        </ListItem>
                    )}
                </List>
            )}
        </Box>
    );
};

export default memo(TemplatesWidget);
