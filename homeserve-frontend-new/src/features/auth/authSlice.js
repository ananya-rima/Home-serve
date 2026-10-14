import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { storage } from '../../utils/storage';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  user: storage.getUser(),
  isAuthenticated: Boolean(storage.getAccessToken() && storage.getUser()),
  pendingOtp: null, 
  status: 'idle', 
  error: null,
};


export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload);
    return data.data; 
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(payload);
    return data.data; 
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.verifyOtp(payload);
    return data.data; 
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.resendOtp(payload);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.getMe();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const refreshToken = storage.getRefreshToken();
    await authApi.logout(refreshToken);
    return true;
  } catch (err) {
    
    return rejectWithValue(getErrorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSession: (state) => {
      storage.clear();
      state.user = null;
      state.isAuthenticated = false;
      state.pendingOtp = null;
    },
    
    setPendingOtp: (state, action) => {
      state.pendingOtp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOtp = {
          email: action.payload.email,
          otpExpiresInMinutes: action.payload.otpExpiresInMinutes,
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.pendingOtp = null;
        storage.setSession({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          user: action.payload.user,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.pendingOtp = null;
        storage.setSession({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          user: action.payload.user,
        });
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload;
      })
     
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        storage.setSession({ user: action.payload });
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
     
      .addCase(logoutUser.fulfilled, (state) => {
        storage.clear();
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        storage.clear();
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthError, clearSession, setPendingOtp } = authSlice.actions;
export default authSlice.reducer;
