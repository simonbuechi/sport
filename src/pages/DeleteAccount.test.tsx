import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DeleteAccount from './DeleteAccount';

const mockGoogleSignIn = vi.fn();
let mockCurrentUser: { uid: string; email: string; displayName?: string } | null = null;

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        currentUser: mockCurrentUser,
        googleSignIn: mockGoogleSignIn,
        logout: vi.fn(),
    }),
}));

vi.mock('../services/db', () => ({
    softDeleteUserProfile: vi.fn(),
}));

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/auth')>();
    return {
        ...actual,
        reauthenticateWithPopup: vi.fn(),
        deleteUser: vi.fn(),
    };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe('DeleteAccount Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentUser = null;
    });

    it('renders unauthenticated prompt when user is not logged in', () => {
        mockCurrentUser = null;
        render(
            <MemoryRouter>
                <DeleteAccount />
            </MemoryRouter>
        );

        expect(screen.getByText('Delete Account')).toBeInTheDocument();
        expect(screen.getByText('You need to sign in to delete your account.')).toBeInTheDocument();
        expect(screen.getByText('Log in with Google')).toBeInTheDocument();
    });

    it('renders user details and delete button when authenticated', () => {
        mockCurrentUser = {
            uid: 'test-user-123',
            email: 'athlete@example.com',
            displayName: 'Athlete Pro',
        };

        render(
            <MemoryRouter>
                <DeleteAccount />
            </MemoryRouter>
        );

        expect(screen.getByText('Account Information')).toBeInTheDocument();
        expect(screen.getByText(/athlete@example.com/)).toBeInTheDocument();
        expect(screen.getByText(/Athlete Pro/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete My Account/i })).toBeInTheDocument();
    });

    it('opens confirmation modal and enables confirm button only when "DELETE" is typed', () => {
        mockCurrentUser = {
            uid: 'test-user-123',
            email: 'athlete@example.com',
        };

        render(
            <MemoryRouter>
                <DeleteAccount />
            </MemoryRouter>
        );

        const deleteBtn = screen.getByRole('button', { name: /Delete My Account/i });
        fireEvent.click(deleteBtn);

        // Dialog opened
        expect(screen.getByText('Confirm Account Deletion')).toBeInTheDocument();

        const confirmBtn = screen.getByRole('button', { name: /Permanently Delete Account/i });
        expect(confirmBtn).toBeDisabled();

        const input = screen.getByPlaceholderText('DELETE');
        fireEvent.change(input, { target: { value: 'del' } });
        expect(confirmBtn).toBeDisabled();

        fireEvent.change(input, { target: { value: 'DELETE' } });
        expect(confirmBtn).not.toBeDisabled();
    });
});
