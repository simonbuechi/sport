import { useState, useEffect, useRef } from 'react';
import { Snackbar, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { registerSW } from 'virtual:pwa-register';

const ReloadPrompt = () => {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [offlineReady, setOfflineReady] = useState(false);
    const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

    useEffect(() => {
        updateSWRef.current = registerSW({
            onNeedRefresh() {
                setNeedRefresh(true);
            },
            onOfflineReady() {
                setOfflineReady(true);
            },
        });
    }, []);

    const handleUpdate = () => {
        updateSWRef.current?.(true);
    };

    const handleClose = () => {
        setNeedRefresh(false);
        setOfflineReady(false);
    };

    return (
        <>
            <Snackbar
                open={needRefresh}
                message="A new version is available."
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                action={
                    <>
                        <Button color="primary" size="small" onClick={handleUpdate}>
                            Reload
                        </Button>
                        <IconButton size="small" color="inherit" onClick={handleClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                }
            />
            <Snackbar
                open={offlineReady}
                autoHideDuration={5000}
                onClose={handleClose}
                message="App ready to work offline."
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );
};

export default ReloadPrompt;
