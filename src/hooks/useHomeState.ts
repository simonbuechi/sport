import { useState, useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { updateUserProfile } from '../services/db';
import type { Workout, UserProfile } from '../types';

export const WIDGET_TYPES = {
    PROJECT_UPDATES: 'Project Updates',
    WEIGHT_TRACKING: 'Weight Tracking',
    WORKOUT_COUNTER: 'Workout Counter',
    CALENDAR: 'Calendar',
    PROFILE: 'Profile',
    TEMPLATES: 'Templates',
    PRS: 'PRs',
    FAVORITE_EXERCISES: 'Favorite Exercises',
    MEASUREMENTS: 'Measurements',
    FEEDBACK: 'Feedback'
} as const;

export type WidgetType = typeof WIDGET_TYPES[keyof typeof WIDGET_TYPES];

export const ALL_DASHBOARD_ELEMENTS: WidgetType[] = Object.values(WIDGET_TYPES);
export const DEFAULT_WIDGETS: WidgetType[] = [
    WIDGET_TYPES.PROJECT_UPDATES,
    WIDGET_TYPES.CALENDAR,
    WIDGET_TYPES.WORKOUT_COUNTER,
    WIDGET_TYPES.TEMPLATES
];

const ASPIRATIONAL_MESSAGES = [
    "Consistency is key! Keep it up.",
    "The only bad workout is the one that didn't happen.",
    "Small steps lead to big results. Stay focused!",
    "You're doing amazing! Your future self will thank you.",
    "Every workout brings you closer to your goals.",
    "Discipline is doing what needs to be done, even if you don't feel like it.",
    "Success is the sum of small efforts repeated day in and day out."
];

export const useHomeState = () => {
    const { currentUser } = useAuth();
    const { entries: allEntries, templates, loading: sessionsLoading } = useWorkouts();
    const { profile, loading: profileLoading, error: profileError } = useUserProfile();

    const [visibleWidgets, setVisibleWidgets] = useState<WidgetType[]>([]);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [widgetToClose, setWidgetToClose] = useState<WidgetType | null>(null);
    const [aspirationalMessage] = useState(() => 
        ASPIRATIONAL_MESSAGES[Math.floor(Math.random() * ASPIRATIONAL_MESSAGES.length)]
    );
    const [orderedAllWidgets, setOrderedAllWidgets] = useState<WidgetType[]>(ALL_DASHBOARD_ELEMENTS);
    const [error, setError] = useState('');

    // Sync state with profile (React recommendation for mirroring state from props/other state)
    const [prevProfileWidgets, setPrevProfileWidgets] = useState<string | null>(null);
    const widgetsJson = JSON.stringify(profile?.dashboardWidgets);
    const orderJson = JSON.stringify(profile?.dashboardOrder);
    
    if (profile && (widgetsJson !== prevProfileWidgets || orderJson !== prevProfileWidgets)) {
        if (profile.dashboardWidgets) {
            setVisibleWidgets(profile.dashboardWidgets as WidgetType[]);
            const savedOrder = profile.dashboardOrder as WidgetType[];
            const activeSet = new Set(profile.dashboardWidgets);
            const baseOrder = savedOrder.length > 0 ? savedOrder : ALL_DASHBOARD_ELEMENTS;
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
        setPrevProfileWidgets(widgetsJson);
    }


    // Sync error from profile
    const [prevProfileError, setPrevProfileError] = useState<string | null>(null);
    if (profileError && profileError !== prevProfileError) {
        setError(profileError);
        setPrevProfileError(profileError);
    }

    const sessionsInLast7Days = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return allEntries.filter((entry: Workout) => {
            const entryDate = new Date(entry.date);
            return entryDate >= sevenDaysAgo;
        }).length;
    }, [allEntries]);

    const handleUpdateWidgets = async (newWidgets: WidgetType[], newOrder?: WidgetType[]) => {
        if (!currentUser) return;

        const previousWidgets = [...visibleWidgets];
        const previousOrder = [...orderedAllWidgets];

        try {
            setVisibleWidgets(newWidgets);
            const updates: Partial<UserProfile> = { dashboardWidgets: newWidgets };
            if (newOrder) {
                updates.dashboardOrder = newOrder;
                setOrderedAllWidgets(newOrder);
            }
            await updateUserProfile(currentUser.uid, updates);
        } catch (_err) {
            // console.error('Failed to update dashboard settings:', _err);
            setError('Failed to save dashboard settings. Your changes were rolled back.');
            setVisibleWidgets(previousWidgets);
            setOrderedAllWidgets(previousOrder);
            setTimeout(() => { setError(''); }, 5000);
        }
    };

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(orderedAllWidgets);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setOrderedAllWidgets(items);

        const newVisibleWithNewOrder = items.filter(w => visibleWidgets.includes(w));
        void handleUpdateWidgets(newVisibleWithNewOrder, items);
    };

    const removeWidget = () => {
        if (!widgetToClose) return;
        const newWidgets = visibleWidgets.filter((w: WidgetType) => w !== widgetToClose);
        void handleUpdateWidgets(newWidgets);
        setWidgetToClose(null);
    };

    const toggleWidget = (widget: WidgetType) => {
        const isCurrentlyVisible = visibleWidgets.includes(widget);
        const newVisible = isCurrentlyVisible
            ? visibleWidgets.filter((w: WidgetType) => w !== widget)
            : [...visibleWidgets, widget];

        const sortedVisible = orderedAllWidgets.filter(w => newVisible.includes(w));
        void handleUpdateWidgets(sortedVisible);
    };

    const isInitialLoading = (profileLoading && visibleWidgets.length === 0) || (sessionsLoading && allEntries.length === 0);

    return {
        visibleWidgets,
        orderedAllWidgets,
        isManageDialogOpen,
        setIsManageDialogOpen,
        widgetToClose,
        setWidgetToClose,
        aspirationalMessage,
        error,
        setError,
        sessionsInLast7Days,
        allEntries,
        templates,
        isInitialLoading,
        handleOnDragEnd,
        removeWidget,
        toggleWidget
    };
};
