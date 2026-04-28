import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../components/dashboard/widgets/CalendarWidget';
import WorkoutCounterWidget from '../components/dashboard/widgets/WorkoutCounterWidget';
import WeightWidget from '../components/dashboard/widgets/WeightWidget';
import TemplatesWidget from '../components/dashboard/widgets/TemplatesWidget';
import ProjectUpdatesWidget from '../components/dashboard/widgets/ProjectUpdatesWidget';
import FeedbackWidget from '../components/dashboard/widgets/FeedbackWidget';
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
        error,
        sessionsInLast7Days,
        templates,
        isInitialLoading,
        moveWidget,
        removeWidget,
        toggleWidget
    } = useHomeState();

    const renderWidgetContent = (widget: WidgetType) => {
        switch (widget) {
            case WIDGET_TYPES.WORKOUT_COUNTER:
                return (
                    <WorkoutCounterWidget
                        sessionsInLast7Days={sessionsInLast7Days}
                    />
                );
            case WIDGET_TYPES.CALENDAR:
                return <CalendarWidget />;
            case WIDGET_TYPES.PROJECT_UPDATES:
                return <ProjectUpdatesWidget />;
            case WIDGET_TYPES.TEMPLATES:
                return <TemplatesWidget templates={templates} />;
            case WIDGET_TYPES.WEIGHT:
                return <WeightWidget />;
            case WIDGET_TYPES.FEEDBACK:
                return <FeedbackWidget />;
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
                    <List dense sx={{ py: 0 }}>
                        {orderedAllWidgets.map((element, index) => (
                            <ListItem
                                key={element}
                                dense
                                sx={{
                                    px: 0.5,
                                    py: 0,
                                    mb: 0,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
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
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Move Up" arrow>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => { moveWidget(index, index - 1); }}
                                                disabled={index === 0}
                                                sx={{ color: index === 0 ? 'action.disabled' : 'action.active' }}
                                            >
                                                <KeyboardArrowUpIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Move Down" arrow>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => { moveWidget(index, index + 1); }}
                                                disabled={index === orderedAllWidgets.length - 1}
                                                sx={{ color: index === orderedAllWidgets.length - 1 ? 'action.disabled' : 'action.active' }}
                                            >
                                                <KeyboardArrowDownIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
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
