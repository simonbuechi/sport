import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import type { Exercise } from '../../types';
import type { ReactNode } from 'react';

interface ExerciseListSectionProps {
    icon: ReactNode;
    title: string;
    techniques: Exercise[];
    expanded: boolean;
    onToggle: () => void;
}

const ExerciseListSection = ({ icon, title, techniques, expanded, onToggle }: ExerciseListSectionProps) => {
    return (
        <Paper elevation={3} sx={{ p: 3, }}>
            <Box
                onClick={onToggle}
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: 'pointer'
                }}>
                <Typography
                    variant="h6"
                    sx={{
                        display: "flex",
                        alignItems: "center"
                    }}>
                    {icon} {title} ({techniques.length})
                </Typography>
                <IconButton size="small" disableRipple sx={{ p: 0 }}>
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>
            <Collapse in={expanded}>
                <Box sx={{
                    mt: 2
                }}>
                    <Divider sx={{ mb: 2 }} />
                    {techniques.length === 0 ? (
                        <Typography variant="body2" sx={{
                            color: "text.secondary"
                        }}>No techniques in this category.</Typography>
                    ) : (
                        <List disablePadding>
                            {techniques.map(tech => (
                                <ListItem
                                    key={tech.id}
                                    component={RouterLink}
                                    to={`/exercises/${tech.id}`}
                                    dense
                                    sx={{
                                        px: 1,
                                        py: 0.5,
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center',
                                        gap: 1.5
                                    }}
                                >
                                    <Chip
                                        label={tech.type}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{
                                            flexShrink: 0,
                                            minWidth: '75px',
                                            pointerEvents: 'none',
                                            display: { xs: 'none', sm: 'inline-flex' }
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tech.name}
                                    </Typography>
                                    {tech.links && tech.links.length > 0 && <LinkIcon sx={{ fontSize: 14, color: 'text.secondary', ml: 'auto' }} />}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default ExerciseListSection;
