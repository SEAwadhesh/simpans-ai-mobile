import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,
};

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  return authService.getStoredSession();
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      const token =
        response.session?.access_token ||
        `sim-${encodeURIComponent(email)}-${response.user.id}`;
      return { user: response.user, token };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed');
    }
  },
);

export const signUpUser = createAsyncThunk(
  'auth/signup',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.signup(email, password);
      const token =
        response.session?.access_token ||
        `sim-${encodeURIComponent(email)}-${response.user.id}`;
      return { user: response.user, token };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Registration failed');
    }
  },
);

export const demoLoginUser = createAsyncThunk('auth/demoLogin', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.demoLogin();
    return { user: response.user, token: response.session!.access_token };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Demo login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isHydrated = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(hydrateAuth.rejected, state => {
        state.isHydrated = true;
      });

    const pending = (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    };
    const fulfilled = (
      state: AuthState,
      action: { payload: { user: User; token: string } },
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    };
    const rejected = (fallback: string) => (state: AuthState, action: { payload?: unknown }) => {
      state.isLoading = false;
      state.error = (action.payload as string) || fallback;
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected('Login failed'))
      .addCase(signUpUser.pending, pending)
      .addCase(signUpUser.fulfilled, fulfilled)
      .addCase(signUpUser.rejected, rejected('Sign up failed'))
      .addCase(demoLoginUser.pending, pending)
      .addCase(demoLoginUser.fulfilled, fulfilled)
      .addCase(demoLoginUser.rejected, rejected('Demo login failed'))
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
