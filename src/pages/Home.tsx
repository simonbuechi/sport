import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DescriptionIcon from '@mui/icons-material/Description';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { getUserProfile, updateUserProfile, getJournalEntries, getTemplates } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { ActivityLog, TrainingTemplate, UserProfile } from '../types';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import SessionCounterWidget from '../components/dashboard/SessionCounterWidget';


const ALL_DASHBOARD_ELEMENTS = [
    'Project Updates',
    'Weight Tracking',
    'Session Counter',
    'Calendar',
    'Profile',
    'Templates',
    'PRs',
    'Favorite Exercises',
    'Measurements',
    'Feedback'
];

const DEFAULT_WIDGETS = ['Project Updates', 'Calendar', 'Session Counter', 'Templates'];

const ASPIRATIONAL_MESSAGES = [
    "Consistency is key! Keep it up.",
    "The only bad workout is the one that didn't happen.",
    "Small steps lead to big results. Stay focused!",
    "You're doing amazing! Your future self will thank you.",
    "Every session brings you closer to your goals.",
    "Discipline is doing what needs to be done, even if you don't feel like it.",
    "Success is the sum of small efforts repeated day in and day out."
];

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [visibleWidgets, setVisibleWidgets] = useState<string[]>([]);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [widgetToClose, setWidgetToClose] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessionsInLast7Days, setSessionsInLast7Days] = useState(0);
    const [aspirationalMessage, setAspirationalMessage] = useState('');
    const [allEntries, setAllEntries] = useState<ActivityLog[]>([]);
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [orderedAllWidgets, setOrderedAllWidgets] = useState<string[]>(ALL_DASHBOARD_ELEMENTS);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const profileData = await getUserProfile(currentUser.uid);

                if (profileData?.dashboardWidgets) {
                    setVisibleWidgets(profileData.dashboardWidgets);

                    // Initialize order: User preference first, then others at the bottom
                    const savedOrder = profileData.dashboardOrder ?? [];
                    const activeSet = new Set(profileData.dashboardWidgets);

                    // Create base order from savedOrder or ALL_DASHBOARD_ELEMENTS
                    const baseOrder = savedOrder.length > 0 ? savedOrder : ALL_DASHBOARD_ELEMENTS;

                    // Sort: Active first, then inactive
                    const sorted = [...baseOrder].sort((a, b) => {
                        const aActive = activeSet.has(a);
                        const bActive = activeSet.has(b);
                        if (aActive && !bActive) return -1;
                        if (!aActive && bActive) return 1;
                        return 0;
                    });

                    setOrderedAllWidgets(sorted);
                } else {
                    setVisibleWidgets(DEFAULT_WIDGETS);
                    setOrderedAllWidgets(ALL_DASHBOARD_ELEMENTS);
                }

                // Fetch session data for widgets
                const entries = await getJournalEntries(currentUser.uid);
                setAllEntries(entries);

                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const recentSessions = entries.filter((entry: ActivityLog) => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= sevenDaysAgo;
                });

                setSessionsInLast7Days(recentSessions.length);

                // Fetch templates
                const templatesData = await getTemplates(currentUser.uid);
                setTemplates(templatesData);

                // Set a random message (or based on number of sessions/day)
                const randomMsg = ASPIRATIONAL_MESSAGES[Math.floor(Math.random() * ASPIRATIONAL_MESSAGES.length)];
                setAspirationalMessage(randomMsg);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboardData();
    }, [currentUser]);

    const handleUpdateWidgets = async (newWidgets: string[], newOrder?: string[]) => {
        if (!currentUser) return;

        try {
            setVisibleWidgets(newWidgets);
            const updates: Partial<UserProfile> = { dashboardWidgets: newWidgets };
            if (newOrder) {
                updates.dashboardOrder = newOrder;
                setOrderedAllWidgets(newOrder);
            }
            await updateUserProfile(currentUser.uid, updates);
        } catch (err) {
            console.error('Failed to update dashboard settings:', err);
            setError('Failed to save dashboard settings.');
        }
    };

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(orderedAllWidgets);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setOrderedAllWidgets(items);

        // When reordering, we also need to update visibleWidgets to maintain the current set of items
        // but the actual order in visibleWidgets should reflect the new order
        const newVisibleWithNewOrder = items.filter(w => visibleWidgets.includes(w));
        void handleUpdateWidgets(newVisibleWithNewOrder, items);
    };

    const removeWidget = () => {
        if (!widgetToClose) return;
        const newWidgets = visibleWidgets.filter((w: string) => w !== widgetToClose);
        void handleUpdateWidgets(newWidgets);
        setWidgetToClose(null);
    };

    const toggleWidget = (widget: string) => {
        const isCurrentlyVisible = visibleWidgets.includes(widget);
        const newVisible = isCurrentlyVisible
            ? visibleWidgets.filter((w: string) => w !== widget)
            : [...visibleWidgets, widget];

        // Re-sort newVisible based on current orderedAllWidgets to maintain sequence
        const sortedVisible = orderedAllWidgets.filter(w => newVisible.includes(w));
        void handleUpdateWidgets(sortedVisible);
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: { xs: 1, md: 2 }, mb: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1">
                    Dashboard
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5
                    }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => { navigate('/journal/new'); }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        New Workout
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => { setIsManageDialogOpen(true); }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Widgets
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: { xs: 2, md: 4 } }}>{error}</Alert>}

            <Grid container spacing={{ xs: 2, md: 3 }}>
                {visibleWidgets.map((widget) => (
                    <Grid key={widget} size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: { xs: 1.5, md: 3 },
                                position: 'relative',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '150px',
                                height: '100%'
                            }}
                        >
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={() => { setWidgetToClose(widget); }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="h6" sx={{ mb: 2, pr: 4 }}>
                                {widget}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }}>
                                {widget === 'Session Counter' ? (
                                    <SessionCounterWidget
                                        sessionsInLast7Days={sessionsInLast7Days}
                                        aspirationalMessage={aspirationalMessage}
                                    />
                                ) : widget === 'Calendar' ? (
                                    <CalendarWidget entries={allEntries} />
                                ) : widget === 'Project Updates' ? (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            v0.2 April 2026: Alpha Version, use with caution
                                        </Typography>
                                        <Link
                                            href="https://github.com/simonbuechi/sport"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            View project repo
                                        </Link>
                                    </Box>
                                ) : widget === 'Templates' ? (
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
                                                    onClick={() => { navigate('/profile?tab=templates'); }}
                                                >
                                                    Create Template
                                                </Button>
                                            </Box>
                                        ) : (
                                            <List disablePadding sx={{ width: '100%' }}>
                                                {templates.slice(0, 5).map((template) => (
                                                    <ListItem key={template.id} disablePadding sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                                                        <ListItemButton
                                                            sx={{ py: 0.75, px: 1, borderRadius: 1 }}
                                                            onClick={() => { navigate('/profile?tab=templates'); }}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                                <DescriptionIcon fontSize="small" color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                                                            onClick={() => { navigate('/profile?tab=templates'); }}
                                                        >
                                                            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                                                View all {templates.length} templates
                                                            </Typography>
                                                        </ListItemButton>
                                                    </ListItem>
                                                )}
                                            </List>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Content for {widget} coming soon...
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Manage Dashboard Dialog */}
            <Dialog
                open={isManageDialogOpen}
                onClose={() => { setIsManageDialogOpen(false); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Manage Dashboard</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select the elements you want to show on your dashboard.
                    </Typography>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="widgets-list">
                            {(provided) => (
                                <List {...provided.droppableProps} ref={provided.innerRef} dense sx={{ py: 0 }}>
                                    {orderedAllWidgets.map((element, index) => (
                                        <Draggable key={element} draggableId={element} index={index}>
                                            {(provided, snapshot) => (
                                                <ListItem
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    dense
                                                    sx={{
                                                        px: 0.5,
                                                        py: 0,
                                                        mb: 0,
                                                        bgcolor: snapshot.isDragging ? 'action.selected' : 'transparent',
                                                        boxShadow: snapshot.isDragging ? 2 : 0,
                                                        borderRadius: 1,
                                                        '&:hover': { bgcolor: 'action.hover' }
                                                    }}
                                                >
                                                    <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary', opacity: 0.6 }}>
                                                        <DragHandleIcon sx={{ fontSize: '1.2rem' }} />
                                                    </Box>
                                                    <FormControlLabel
                                                        sx={{ flexGrow: 1, m: 0 }}
                                                        control={
                                                            <Checkbox
                                                                size="small"
                                                                checked={visibleWidgets.includes(element)}
                                                                onChange={() => { toggleWidget(element); }}
                                                                sx={{ py: 0.5 }}
                                                            />
                                                        }
                                                        label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{element}</Typography>}
                                                    />
                                                </ListItem>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setIsManageDialogOpen(false); }} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Confirmation Dialog for closing a widget */}
            <Dialog
                open={Boolean(widgetToClose)}
                onClose={() => { setWidgetToClose(null); }}
            >
                <DialogTitle>Hide Widget?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to hide the <strong>{widgetToClose}</strong> widget? You can add it back anytime from the &quot;Widgets&quot; menu.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setWidgetToClose(null); }}>Cancel</Button>
                    <Button onClick={removeWidget} color="primary" variant="contained">
                        Hide
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};


export default Home;
