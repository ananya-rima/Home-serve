import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { providerApi } from './providerApi';
import { acceptBooking, rejectBooking, updateBookingStatus } from '../booking/bookingSlice';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  
  discoverList: [],
  discoverMeta: null,
  providerDetails: null, 
  publicAvailability: null, 

  
  profile: null,
  completedJobs: 0,
  ratingSummary: { avgRating: 0, totalReviews: 0 },

  
  myServices: [],

  
  availability: [],

  
  bookingRequests: [],
  myBookings: [],

  
  earnings: null,
  myReviews: [],
  ratingDistribution: [],

  status: 'idle',
  error: null,
};

export const discoverProviders = createAsyncThunk('provider/discover', async (params, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.discoverProviders(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProviderDetails = createAsyncThunk('provider/details', async (id, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getProviderDetails(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchPublicAvailability = createAsyncThunk(
  'provider/publicAvailability',
  async ({ id, date }, { rejectWithValue }) => {
    try {
      const { data } = await providerApi.getPublicAvailability(id, date);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchProviderProfile = createAsyncThunk('provider/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getProfile();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateProviderProfile = createAsyncThunk(
  'provider/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await providerApi.updateProfile(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addOfferedService = createAsyncThunk('provider/addService', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.addService(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMyServices = createAsyncThunk('provider/fetchMyServices', async (_, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getMyServices();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateMyService = createAsyncThunk(
  'provider/updateMyService',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await providerApi.updateMyService(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const removeMyService = createAsyncThunk('provider/removeMyService', async (id, { rejectWithValue }) => {
  try {
    await providerApi.removeMyService(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const setAvailability = createAsyncThunk('provider/setAvailability', async (availability, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.setAvailability(availability);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchAvailability = createAsyncThunk('provider/fetchAvailability', async (_, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getAvailability();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchBookingRequests = createAsyncThunk('provider/fetchBookingRequests', async (_, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getBookingRequests();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProviderBookings = createAsyncThunk(
  'provider/fetchMyBookings',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await providerApi.getMyBookings(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchEarnings = createAsyncThunk('provider/fetchEarnings', async (_, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getEarnings();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMyReviews = createAsyncThunk('provider/fetchMyReviews', async (_, { rejectWithValue }) => {
  try {
    const { data } = await providerApi.getMyReviews();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


const syncBooking = (state, updated) => {
  const patch = { status: updated.status, statusHistory: updated.statusHistory, updatedAt: updated.updatedAt };
  state.myBookings = state.myBookings.map((b) => (b._id === updated._id ? { ...b, ...patch } : b));
  if (updated.status !== 'Pending') {
    state.bookingRequests = state.bookingRequests.filter((b) => b._id !== updated._id);
  }
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    clearProviderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(discoverProviders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(discoverProviders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.discoverList = action.payload.data;
        state.discoverMeta = action.payload.meta;
      })
      .addCase(discoverProviders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchProviderDetails.fulfilled, (state, action) => {
        state.providerDetails = action.payload;
      })
      .addCase(fetchPublicAvailability.fulfilled, (state, action) => {
        state.publicAvailability = action.payload;
      })
      .addCase(fetchProviderProfile.fulfilled, (state, action) => {
        state.profile = action.payload.profile;
        state.completedJobs = action.payload.completedJobs;
        state.ratingSummary = action.payload.ratingSummary;
      })
      .addCase(updateProviderProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(addOfferedService.fulfilled, (state, action) => {
        state.myServices.unshift(action.payload);
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.myServices = action.payload;
      })
      .addCase(updateMyService.fulfilled, (state, action) => {
        state.myServices = state.myServices.map((s) => (s._id === action.payload._id ? action.payload : s));
      })
      .addCase(removeMyService.fulfilled, (state, action) => {
        state.myServices = state.myServices.filter((s) => s._id !== action.payload);
      })
      .addCase(setAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      .addCase(fetchBookingRequests.fulfilled, (state, action) => {
        state.bookingRequests = action.payload;
      })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.myBookings = action.payload;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload;
      })
      // Provider actions on bookings (thunks live in bookingSlice) keep these lists in sync
      .addCase(acceptBooking.fulfilled, (state, action) => syncBooking(state, action.payload))
      .addCase(rejectBooking.fulfilled, (state, action) => syncBooking(state, action.payload))
      .addCase(updateBookingStatus.fulfilled, (state, action) => syncBooking(state, action.payload))
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.myReviews = action.payload.reviews;
        state.ratingDistribution = action.payload.ratingDistribution;
        state.ratingSummary = action.payload.summary;
      });
  },
});

export const { clearProviderError } = providerSlice.actions;
export default providerSlice.reducer;
