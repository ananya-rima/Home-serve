import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import categoryReducer from '../features/category/categorySlice';
import serviceReducer from '../features/service/serviceSlice';
import providerReducer from '../features/provider/providerSlice';
import customerReducer from '../features/customer/customerSlice';
import bookingReducer from '../features/booking/bookingSlice';
import reviewReducer from '../features/review/reviewSlice';
import complaintReducer from '../features/complaint/complaintSlice';
import adminReducer from '../features/admin/adminSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    service: serviceReducer,
    provider: providerReducer,
    customer: customerReducer,
    booking: bookingReducer,
    review: reviewReducer,
    complaint: complaintReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
