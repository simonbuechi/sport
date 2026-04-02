import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaContextType {
    isInstallable: boolean;
    install: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

// Global variable to capture the event before the provider mounts
let earlyDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        earlyDeferredPrompt = e as BeforeInstallPromptEvent;
        console.log('early beforeinstallprompt event captured');
    });
}

export const PwaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(earlyDeferredPrompt);
    const [isInstallable, setIsInstallable] = useState(!!earlyDeferredPrompt);

    useEffect(() => {

        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            earlyDeferredPrompt = promptEvent;
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
            console.log('beforeinstallprompt event fired');
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            // Clear the deferredPrompt so it can be garbage collected
            setDeferredPrompt(null);
            setIsInstallable(false);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            return;
        }
        // Show the install prompt
        await deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We've used the prompt, and can't use it again, throw it away
        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
    };

    return (
        <PwaContext.Provider value={{ isInstallable, install }}>
            {children}
        </PwaContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePwa = () => {
    const context = useContext(PwaContext);
    if (context === undefined) {
        throw new Error('usePwa must be used within a PwaProvider');
    }
    return context;
};
