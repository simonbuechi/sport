export const ADMIN_UIDS: readonly string[] = [
    'Ib3y7vFU94QZbgbXB7flrrHGbtk1',
];

export const isAdminUser = (uid?: string | null): boolean => {
    if (!uid) return false;
    return ADMIN_UIDS.includes(uid);
};
