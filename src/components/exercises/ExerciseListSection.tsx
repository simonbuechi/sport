import { Typography, Box, Paper, List, ListItem, Chip, IconButton, Collapse, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
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
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
                                    to={`/techniques/${tech.id}`}
                                    dense
                                    sx={{
                                        px: 1,
                                        py: 0.5,
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        borderRadius: 1,
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
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tech.name}
                                    </Typography>
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
