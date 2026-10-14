import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingApi } from './bookingApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  myBookings: [],
  meta: null,
  current: null,
  lastCreated: null,
  status: 'idle',
  error: null,
};

export const createBooking = createAsyncThunk('booking/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await bookingApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMyBookings = createAsyncThunk('booking/fetchMine', async (params, { rejectWithValue }) => {
  try {
    const { data } = await bookingApi.getMyBookings(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchBookingById = createAsyncThunk('booking/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bookingApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const acceptBooking = createAsyncThunk('booking/accept', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bookingApi.accept(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const rejectBooking = createAsyncThunk('booking/reject', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bookingApi.reject(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateBookingStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await bookingApi.updateStatus(id, status);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const cancelBooking = createAsyncThunk('booking/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await bookingApi.cancel(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


const applyUpdatedBooking = (state, updated) => {
  const patch = { status: updated.status, statusHistory: updated.statusHistory, updatedAt: updated.updatedAt };
  state.myBookings = state.myBookings.map((b) => (b._id === updated._id ? { ...b, ...patch } : b));
  if (state.current && state.current._id === updated._id) {
    state.current = { ...state.current, ...patch };
  }
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastCreated = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myBookings = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => applyUpdatedBooking(state, action.payload))
      .addCase(rejectBooking.fulfilled, (state, action) => applyUpdatedBooking(state, action.payload))
      .addCase(updateBookingStatus.fulfilled, (state, action) => applyUpdatedBooking(state, action.payload))
      .addCase(cancelBooking.fulfilled, (state, action) => applyUpdatedBooking(state, action.payload));
  },
});

export const { clearBookingError, clearLastCreated } = bookingSlice.actions;
export default bookingSlice.reducer;
