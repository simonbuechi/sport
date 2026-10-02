import { useState, useEffect, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { registerSW } from 'virtual:pwa-register';
import { useTranslation } from 'react-i18next';

const ReloadPrompt = () => {
    const { t } = useTranslation();
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
        void updateSWRef.current?.(true);
    };

    const handleClose = () => {
        setNeedRefresh(false);
        setOfflineReady(false);
    };

    return (
        <>
            <Snackbar
                open={needRefresh}
                message={t('common.newVersionAvailable')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                action={
                    <>
                        <Button color="primary" size="small" onClick={handleUpdate}>
                            {t('common.reload')}
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
                message={t('common.appReadyOffline')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );
};

export default ReloadPrompt;
