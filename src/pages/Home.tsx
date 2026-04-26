import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import type { TrainingTemplate } from '../types';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import WorkoutCounterWidget from '../components/dashboard/WorkoutCounterWidget';
import { useHomeState, WIDGET_TYPES, type WidgetType } from '../hooks/useHomeState';

const Home = () => {
    const navigate = useNavigate();
    const {
        visibleWidgets,
        orderedAllWidgets,
        isManageDialogOpen,
        setIsManageDialogOpen,
        widgetToClose,
        setWidgetToClose,
        aspirationalMessage,
        error,
        sessionsInLast7Days,
        allEntries,
        templates,
        isInitialLoading,
        handleOnDragEnd,
        removeWidget,
        toggleWidget
    } = useHomeState();

    const renderWidgetContent = (widget: WidgetType) => {
        switch (widget) {
            case WIDGET_TYPES.WORKOUT_COUNTER:
                return (
                    <WorkoutCounterWidget
                        sessionsInLast7Days={sessionsInLast7Days}
                        aspirationalMessage={aspirationalMessage}
                    />
                );
            case WIDGET_TYPES.CALENDAR:
                return <CalendarWidget entries={allEntries} />;
            case WIDGET_TYPES.PROJECT_UPDATES:
                return (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            v0.2 April 2026: Alpha Version, use with caution
                        </Typography>
                        <Link
                            href="https://github.com/simonbuechi/sport"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2"
                        >
                            View project repo
                        </Link>
                    </Box>
                );
            case WIDGET_TYPES.TEMPLATES:
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
            default:
                return (
                    <Typography variant="body2" color="text.secondary">
                        Content for {widget} coming soon...
                    </Typography>
                );
        }
    };

    if (isInitialLoading) {
        return (
            <Stack sx={{ mt: 8 }}><CircularProgress /></Stack>
        );
    }

    return (
        <Container maxWidth="lg">
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2 }}
                sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mt: { xs: 0.5, md: 2 },
                    mb: { xs: 1.5, md: 4 }
                }}
            >
                <Typography variant="h4" component="h1">
                    Dashboard
                </Typography>
                <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'space-between', sm: 'flex-end' }, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => { void navigate('/journal/new'); }}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        Workout
                    </Button>
                    <Tooltip title="Manage Widgets">
                        <IconButton
                            onClick={() => { setIsManageDialogOpen(true); }}
                            color="primary"
                            aria-label="manage widgets"
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: { xs: 2, md: 4 } }}>{error}</Alert>}

            <Grid container spacing={{ xs: 2, md: 3 }}>
                {visibleWidgets.map((widget) => (
                    <Grid key={widget} size={{ xs: 12, md: 4 }}>
                        <Paper
                            variant="widget"
                            elevation={2}
                        >
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={() => { setWidgetToClose(widget); }}
                                aria-label={`remove ${widget} widget`}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="h6" sx={{ mb: 2, pr: 4 }}>
                                {widget}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }}>
                                {renderWidgetContent(widget)}
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
