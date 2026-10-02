import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/lib/auth-context';

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
    },
    rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
  },
}));

// eslint-disable-next-line import/first
import { supabase } from '@/lib/supabase';

describe('no domain restriction remains', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ error: null });
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });
  });

  it('signInWithPassword accepts any email domain', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signInWithPassword('anyone@gmail.com', 'password123');
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'anyone@gmail.com',
      password: 'password123',
    });
  });

  it('signUpWithPassword accepts any email domain', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUpWithPassword('someone@yahoo.com', 'password123', 'Someone', 'INVITE1');
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'someone@yahoo.com',
      password: 'password123',
      options: { data: { full_name: 'Someone', invite_code: 'INVITE1' } },
    });
  });

  it('signUpWithPassword rejects an invalid invite code before calling signUp', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: false, error: null });
    const { result } = await renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { error: string | null } | undefined;
    await act(async () => {
      response = await result.current.signUpWithPassword(
        'someone@yahoo.com',
        'password123',
        'Someone',
        'BADCODE'
      );
    });

    expect(response?.error).toBe("That invite code isn't valid.");
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });
});
