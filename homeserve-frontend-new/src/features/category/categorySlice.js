import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryApi } from './categoryApi';
import { getErrorMessage } from '../../utils/formatters';

const initialState = {
  list: [],
  meta: null,
  current: null,
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk('category/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await categoryApi.getAll(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCategoryById = createAsyncThunk('category/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await categoryApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createCategory = createAsyncThunk('category/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await categoryApi.create(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateCategory = createAsyncThunk('category/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await categoryApi.update(id, formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteCategory = createAsyncThunk('category/delete', async (id, { rejectWithValue }) => {
  try {
    await categoryApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const toggleCategoryStatus = createAsyncThunk('category/toggleStatus', async (id, { rejectWithValue }) => {
  try {
    const { data } = await categoryApi.toggleStatus(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.list = state.list.map((c) => (c._id === action.payload._id ? action.payload : c));
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.list = state.list.map((c) => (c._id === action.payload._id ? action.payload : c));
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
