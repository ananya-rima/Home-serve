import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewApi } from './reviewApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  providerReviews: [],
  status: 'idle',
  error: null,
};

export const createReview = createAsyncThunk('review/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await reviewApi.create(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchReviewsForProvider = createAsyncThunk(
  'review/fetchForProvider',
  async (providerId, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.getByProvider(providerId);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateReview = createAsyncThunk('review/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await reviewApi.update(id, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteReview = createAsyncThunk('review/delete', async (id, { rejectWithValue }) => {
  try {
    await reviewApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsForProvider.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviewsForProvider.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.providerReviews = action.payload;
      })
      .addCase(fetchReviewsForProvider.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.providerReviews.unshift(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.providerReviews = state.providerReviews.map((r) => (r._id === action.payload._id ? action.payload : r));
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.providerReviews = state.providerReviews.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
