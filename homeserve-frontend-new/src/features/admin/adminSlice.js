import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from './adminApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  dashboard: null,
  revenue: [],
  topServices: [],
  topProviders: [],
  providerRatings: [],
  providersWithServices: [],

  customers: [],
  customersMeta: null,
  customerDetails: null,

  providers: [],
  providersMeta: null,
  providerDetails: null,

  bookings: [],
  bookingsMeta: null,
  bookingDetails: null,

  reviews: [],
  reviewsMeta: null,

  complaints: [],
  complaintsMeta: null,

  status: 'idle',
  error: null,
};


export const fetchDashboard = createAsyncThunk('admin/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getDashboard();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchRevenue = createAsyncThunk('admin/fetchRevenue', async (_, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getRevenue();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchTopServices = createAsyncThunk('admin/fetchTopServices', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getTopServices(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchTopProviders = createAsyncThunk('admin/fetchTopProviders', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getTopProviders(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProviderRatings = createAsyncThunk('admin/fetchProviderRatings', async (_, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getProviderRatings();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProvidersWithServices = createAsyncThunk(
  'admin/fetchProvidersWithServices',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminApi.getProvidersWithServices();
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);


export const fetchCustomers = createAsyncThunk('admin/fetchCustomers', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getCustomers(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCustomerDetails = createAsyncThunk('admin/fetchCustomerDetails', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getCustomerDetails(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const toggleCustomerBlock = createAsyncThunk('admin/toggleCustomerBlock', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.toggleCustomerBlock(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


export const fetchAdminProviders = createAsyncThunk('admin/fetchProviders', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getProviders(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchAdminProviderDetails = createAsyncThunk(
  'admin/fetchProviderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await adminApi.getProviderDetails(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const approveProvider = createAsyncThunk('admin/approveProvider', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.approveProvider(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const rejectProvider = createAsyncThunk('admin/rejectProvider', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.rejectProvider(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const toggleProviderBlock = createAsyncThunk('admin/toggleProviderBlock', async (id, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.toggleProviderBlock(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


export const fetchAllBookings = createAsyncThunk('admin/fetchAllBookings', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getAllBookings(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchAdminBookingDetails = createAsyncThunk(
  'admin/fetchBookingDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await adminApi.getBookingDetails(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);


export const fetchAdminReviews = createAsyncThunk('admin/fetchReviews', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getReviews(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const removeAdminReview = createAsyncThunk('admin/removeReview', async (id, { rejectWithValue }) => {
  try {
    await adminApi.removeReview(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


export const fetchAdminComplaints = createAsyncThunk('admin/fetchComplaints', async (params, { rejectWithValue }) => {
  try {
    const { data } = await adminApi.getComplaints(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateAdminComplaint = createAsyncThunk(
  'admin/updateComplaint',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await adminApi.updateComplaint(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.revenue = action.payload;
      })
      .addCase(fetchTopServices.fulfilled, (state, action) => {
        state.topServices = action.payload;
      })
      .addCase(fetchTopProviders.fulfilled, (state, action) => {
        state.topProviders = action.payload;
      })
      .addCase(fetchProviderRatings.fulfilled, (state, action) => {
        state.providerRatings = action.payload;
      })
      .addCase(fetchProvidersWithServices.fulfilled, (state, action) => {
        state.providersWithServices = action.payload;
      })
      
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload.data;
        state.customersMeta = action.payload.meta;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.customerDetails = action.payload;
      })
      .addCase(toggleCustomerBlock.fulfilled, (state, action) => {
        state.customers = state.customers.map((c) => (c._id === action.payload._id ? action.payload : c));
      })
      
      .addCase(fetchAdminProviders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminProviders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.providers = action.payload.data;
        state.providersMeta = action.payload.meta;
      })
      .addCase(fetchAdminProviders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAdminProviderDetails.fulfilled, (state, action) => {
        state.providerDetails = action.payload;
      })
      .addCase(approveProvider.fulfilled, (state, action) => {
        state.providers = state.providers.map((p) => (p._id === action.payload._id ? action.payload : p));
      })
      .addCase(rejectProvider.fulfilled, (state, action) => {
        state.providers = state.providers.map((p) => (p._id === action.payload._id ? action.payload : p));
      })
      .addCase(toggleProviderBlock.fulfilled, (state, action) => {
        state.providers = state.providers.map((p) => (p._id === action.payload._id ? action.payload : p));
      })
     
      .addCase(fetchAllBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload.data;
        state.bookingsMeta = action.payload.meta;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAdminBookingDetails.fulfilled, (state, action) => {
        state.bookingDetails = action.payload;
      })
     
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.reviews = action.payload.data;
        state.reviewsMeta = action.payload.meta;
      })
      .addCase(removeAdminReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      })
     
      .addCase(fetchAdminComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload.data;
        state.complaintsMeta = action.payload.meta;
      })
      .addCase(updateAdminComplaint.fulfilled, (state, action) => {
        state.complaints = state.complaints.map((c) => (c._id === action.payload._id ? action.payload : c));
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
