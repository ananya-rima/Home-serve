import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from './customerApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  profile: null,
  addresses: [],
  status: 'idle',
  error: null,
};

export const fetchCustomerProfile = createAsyncThunk('customer/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.getProfile();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCustomerProfile = createAsyncThunk(
  'customer/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await customerApi.updateProfile(formData);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createAddress = createAsyncThunk('customer/createAddress', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.createAddress(payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchAddresses = createAsyncThunk('customer/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.getAddresses();
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateAddress = createAsyncThunk(
  'customer/updateAddress',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await customerApi.updateAddress(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteAddress = createAsyncThunk('customer/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    await customerApi.deleteAddress(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const setDefaultAddress = createAsyncThunk('customer/setDefaultAddress', async (id, { rejectWithValue }) => {
  try {
    const { data } = await customerApi.setDefaultAddress(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((a) => ({ ...a, isDefault: false }));
        }
        state.addresses.unshift(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => (a._id === action.payload._id ? action.payload : a));
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => ({ ...a, isDefault: a._id === action.payload._id }));
      });
  },
});

export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
