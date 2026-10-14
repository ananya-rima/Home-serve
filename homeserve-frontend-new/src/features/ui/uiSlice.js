import { createSlice } from '@reduxjs/toolkit';


const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isGlobalLoading: false,
    sidebarOpen: false,
    realtimeTick: 0,
  },
  reducers: {
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    bumpRealtimeTick: (state) => { state.realtimeTick += 1; },
  },
});

export const { setGlobalLoading, toggleSidebar, setSidebarOpen,bumpRealtimeTick } = uiSlice.actions;
export default uiSlice.reducer;
