import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from './complaintApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  myComplaints: [],
  current: null,
  status: 'idle',
  error: null,
};

export const createComplaint = createAsyncThunk('complaint/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await complaintApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMyComplaints = createAsyncThunk('complaint/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await complaintApi.getMyComplaints();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchComplaintById = createAsyncThunk('complaint/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await complaintApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    clearComplaintError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyComplaints.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myComplaints = action.payload;
      })
      .addCase(fetchMyComplaints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.myComplaints.unshift(action.payload);
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearComplaintError } = complaintSlice.actions;
export default complaintSlice.reducer;
