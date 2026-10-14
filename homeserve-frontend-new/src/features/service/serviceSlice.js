import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceApi } from './serviceApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  list: [],
  meta: null,
  current: null, 
  status: 'idle',
  error: null,
};

export const fetchServices = createAsyncThunk('service/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await serviceApi.getAll(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchServiceById = createAsyncThunk('service/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await serviceApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createService = createAsyncThunk('service/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await serviceApi.create(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateService = createAsyncThunk('service/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await serviceApi.update(id, formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteService = createAsyncThunk('service/delete', async (id, { rejectWithValue }) => {
  try {
    await serviceApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    clearServiceError: (state) => {
      state.error = null;
    },
    clearCurrentService: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchServiceById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.list = state.list.map((s) => (s._id === action.payload._id ? action.payload : s));
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearServiceError, clearCurrentService } = serviceSlice.actions;
export default serviceSlice.reducer;
