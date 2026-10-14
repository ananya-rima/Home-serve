// import { useCallback, useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { ArrowLeft, CalendarDays, MapPin, Phone, Star, Pencil, Trash2, MessageSquareWarning, XCircle, CreditCard } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../../app/hooks';
// import { fetchBookingById, cancelBooking } from '../../features/booking/bookingSlice';
// import { createReview, updateReview, deleteReview } from '../../features/review/reviewSlice';
// import { createComplaint, fetchMyComplaints } from '../../features/complaint/complaintSlice';
// import { reviewApi } from '../../features/review/reviewApi';
// import { COMPLAINT_ELIGIBLE_STATUSES } from '../../utils/constants';
// import { formatCurrency, formatDate, formatDateTime, formatTimeSlot, getErrorMessage } from '../../utils/formatters';
// import Avatar from '../../components/ui/Avatar';
// import Button from '../../components/ui/Button';
// import Card from '../../components/ui/Card';
// import PageLoader from '../../components/ui/PageLoader';
// import RatingStars from '../../components/ui/RatingStars';
// import StatusBadge from '../../components/ui/StatusBadge';
// import BookingTimeline from '../../components/common/BookingTimeline';
// import ComplaintFormModal from '../../components/common/ComplaintFormModal';
// import ComplaintStatusBadge from '../../components/common/ComplaintStatusBadge';
// import ConfirmDialog from '../../components/common/ConfirmDialog';
// import ReviewFormModal from '../../components/common/ReviewFormModal';

// const BookingDetailsPage = () => {
//   const { id } = useParams();
//   const dispatch = useAppDispatch();
//   const { current } = useAppSelector((s) => s.booking);
//   const { myComplaints } = useAppSelector((s) => s.complaint);
//   const tick = useAppSelector((s) => s.ui.realtimeTick);

//   const [myReview, setMyReview] = useState(null);
//   const [reviewOpen, setReviewOpen] = useState(false);
//   const [complaintOpen, setComplaintOpen] = useState(false);
//   const [confirmCancel, setConfirmCancel] = useState(false);
//   const [confirmDeleteReview, setConfirmDeleteReview] = useState(false);
//   const [busy, setBusy] = useState(false);

//   const booking = current?._id === id ? current : null;

//   useEffect(() => {
//     dispatch(fetchBookingById(id));
//     dispatch(fetchMyComplaints());
//   }, [dispatch, id,tick]);

  
//   const loadReview = useCallback(async () => {
//     if (!booking || booking.status !== 'Completed') return;
//     try {
//       const { data } = await reviewApi.getByProvider(booking.providerId._id);
//       setMyReview(data.data.find((r) => r.bookingId === booking._id) || null);
//     } catch {
//       setMyReview(null);
//     }
//   }, [booking]);

//   useEffect(() => {
//     loadReview();
//   }, [loadReview]);

//   if (!booking) return <PageLoader label="Loading booking..." />;

//   const provider = booking.providerId;
//   const address = booking.addressId;
//   const service = booking.serviceId;
//   const canCancel = ['Pending', 'Confirmed'].includes(booking.status);
//   const canComplain = COMPLAINT_ELIGIBLE_STATUSES.includes(booking.status);
//   const bookingComplaints = myComplaints.filter((c) => (c.bookingId?._id || c.bookingId) === booking._id);

//   const handleCancel = async () => {
//     setBusy(true);
//     try {
//       await dispatch(cancelBooking(booking._id)).unwrap();
//       toast.success('Booking cancelled');
//       setConfirmCancel(false);
//     } catch (err) {
//       toast.error(getErrorMessage({ message: err }));
//     } finally {
//       setBusy(false);
//     }
//   };

//   const submitReview = async (payload) => {
//     try {
//       if (myReview) {
//         const updated = await dispatch(updateReview({ id: myReview._id, payload })).unwrap();
//         setMyReview({ ...myReview, ...updated });
//         toast.success('Review updated');
//       } else {
//         const created = await dispatch(createReview({ bookingId: booking._id, ...payload })).unwrap();
//         setMyReview(created);
//         toast.success('Thanks for your review!');
//       }
//     } catch (err) {
//       toast.error(getErrorMessage({ message: err }));
//       throw err;
//     }
//   };

//   const handleDeleteReview = async () => {
//     setBusy(true);
//     try {
//       await dispatch(deleteReview(myReview._id)).unwrap();
//       setMyReview(null);
//       toast.success('Review deleted');
//       setConfirmDeleteReview(false);
//     } catch (err) {
//       toast.error(getErrorMessage({ message: err }));
//     } finally {
//       setBusy(false);
//     }
//   };

//   const submitComplaint = async (payload) => {
//     try {
//       await dispatch(createComplaint(payload)).unwrap();
//       toast.success('Complaint submitted');
//     } catch (err) {
//       toast.error(getErrorMessage({ message: err }));
//       throw err;
//     }
//   };

//   return (
//     <div>
//       <Link to="/customer/bookings" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
//         <ArrowLeft className="h-4 w-4" /> Back to bookings
//       </Link>

//       <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <p className="font-mono text-xs text-ink-400">Booking #{booking._id.slice(-8).toUpperCase()}</p>
//           <h1 className="text-2xl font-extrabold text-ink-950">{service?.name}</h1>
//         </div>
//         <StatusBadge status={booking.status} />
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
//         <div className="space-y-6">
//           <Card className="space-y-5">
//             <h2 className="text-base font-bold text-ink-900">Schedule & location</h2>
//             <div className="grid gap-5 sm:grid-cols-2">
//               <div className="flex gap-3">
//                 <CalendarDays className="mt-0.5 h-5 w-5 text-brand-600" />
//                 <div>
//                   <p className="text-xs uppercase tracking-wide text-ink-400">Date & time</p>
//                   <p className="font-semibold text-ink-900">{formatDate(booking.bookingDate, 'EEEE, dd MMM yyyy')}</p>
//                   <p className="text-sm text-ink-500">{formatTimeSlot(booking.timeSlot)}</p>
//                 </div>
//               </div>
//               <div className="flex gap-3">
//                 <MapPin className="mt-0.5 h-5 w-5 text-brand-600" />
//                 <div>
//                   <p className="text-xs uppercase tracking-wide text-ink-400">Address ({address?.label})</p>
//                   <p className="text-sm font-semibold text-ink-900">
//                     {address?.houseNo}, {address?.street}
//                   </p>
//                   <p className="text-sm text-ink-500">
//                     {address?.area}, {address?.city}, {address?.state} - {address?.pincode}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </Card>

//           <Card className="space-y-4">
//             <h2 className="text-base font-bold text-ink-900">Your provider</h2>
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <Avatar src={provider?.profileImage} name={provider?.name} size="h-14 w-14" />
//                 <div>
//                   <p className="font-bold text-ink-900">{provider?.name}</p>
//                   {provider?.phone && (
//                     <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
//                       <Phone className="h-3.5 w-3.5" /> {provider.phone}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <Link to={`/customer/providers/${provider?._id}`}>
//                 <Button variant="outline" size="sm">
//                   View profile
//                 </Button>
//               </Link>
//             </div>
//           </Card>

//           <Card className="space-y-3">
//             <h2 className="text-base font-bold text-ink-900">Payment</h2>
//             <div className="flex items-center justify-between">
//               <span className="flex items-center gap-2 text-sm text-ink-500">
//                 <CreditCard className="h-4 w-4" /> Total amount
//               </span>
//               <span className="font-display text-2xl font-extrabold text-brand-700">{formatCurrency(booking.price)}</span>
//             </div>
//             <p className="text-xs text-ink-400">
//               Payment status: <b className="capitalize text-ink-600">{booking.paymentStatus}</b>
//             </p>
//           </Card>

//           {booking.status === 'Completed' && (
//             <Card className="space-y-4">
//               <h2 className="text-base font-bold text-ink-900">Your review</h2>
//               {myReview ? (
//                 <div>
//                   <div className="flex items-center justify-between gap-3">
//                     <RatingStars rating={myReview.rating} />
//                     <div className="flex gap-1">
//                       <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setReviewOpen(true)}>
//                         Edit
//                       </Button>
//                       <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setConfirmDeleteReview(true)}>
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                   {myReview.comment && <p className="mt-2 text-sm text-ink-600">{myReview.comment}</p>}
//                   <p className="mt-2 text-xs text-ink-400">Reviewed on {formatDate(myReview.createdAt)}</p>
//                 </div>
//               ) : (
//                 <div className="flex flex-wrap items-center justify-between gap-3">
//                   <p className="text-sm text-ink-500">Your job is complete — how did it go?</p>
//                   <Button icon={Star} onClick={() => setReviewOpen(true)}>
//                     Write a review
//                   </Button>
//                 </div>
//               )}
//             </Card>
//           )}

//           {bookingComplaints.length > 0 && (
//             <Card className="space-y-3">
//               <h2 className="text-base font-bold text-ink-900">Complaints on this booking</h2>
//               {bookingComplaints.map((c) => (
//                 <div key={c._id} className="rounded-xl bg-ink-50 p-4">
//                   <div className="flex items-center justify-between gap-3">
//                     <p className="text-sm font-semibold text-ink-900">{c.subject}</p>
//                     <ComplaintStatusBadge status={c.status} />
//                   </div>
//                   <p className="mt-1 text-xs text-ink-500">Raised {formatDateTime(c.createdAt)}</p>
//                   {c.adminRemark && (
//                     <p className="mt-2 rounded-lg bg-white p-3 text-xs text-ink-600">
//                       <b>Admin remark:</b> {c.adminRemark}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </Card>
//           )}
//         </div>

//         <aside className="space-y-6">
//           <Card>
//             <h2 className="mb-5 text-base font-bold text-ink-900">Booking timeline</h2>
//             <BookingTimeline statusHistory={booking.statusHistory} status={booking.status} />
//           </Card>

//           {(canCancel || canComplain) && (
//             <Card className="space-y-3">
//               <h2 className="text-base font-bold text-ink-900">Actions</h2>
//               {canCancel && (
//                 <Button variant="danger" className="w-full" icon={XCircle} onClick={() => setConfirmCancel(true)}>
//                   Cancel booking
//                 </Button>
//               )}
//               {canComplain && (
//                 <Button variant="outline" className="w-full" icon={MessageSquareWarning} onClick={() => setComplaintOpen(true)}>
//                   Raise a complaint
//                 </Button>
//               )}
//             </Card>
//           )}
//         </aside>
//       </div>

//       <ConfirmDialog
//         isOpen={confirmCancel}
//         onClose={() => setConfirmCancel(false)}
//         onConfirm={handleCancel}
//         isLoading={busy}
//         title="Cancel this booking?"
//         message="The provider will be notified and this slot will be released. This can't be undone."
//         confirmLabel="Yes, cancel booking"
//       />
//       <ConfirmDialog
//         isOpen={confirmDeleteReview}
//         onClose={() => setConfirmDeleteReview(false)}
//         onConfirm={handleDeleteReview}
//         isLoading={busy}
//         title="Delete your review?"
//         message="Your rating and comment will be permanently removed."
//         confirmLabel="Delete review"
//       />
//       <ReviewFormModal
//         isOpen={reviewOpen}
//         onClose={() => setReviewOpen(false)}
//         onSubmit={submitReview}
//         initial={myReview}
//         providerName={provider?.name}
//       />
//       <ComplaintFormModal
//         isOpen={complaintOpen}
//         onClose={() => setComplaintOpen(false)}
//         onSubmit={submitComplaint}
//         fixedBookingId={booking._id}
//       />
//     </div>
//   );
// };

// export default BookingDetailsPage;




import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, MapPin, Phone, Star, Pencil, Trash2, MessageSquareWarning, XCircle, CreditCard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBookingById, cancelBooking } from '../../features/booking/bookingSlice';
import { createReview, updateReview, deleteReview } from '../../features/review/reviewSlice';
import { createComplaint, fetchMyComplaints } from '../../features/complaint/complaintSlice';
import { reviewApi } from '../../features/review/reviewApi';
import axiosClient from '../../api/axiosClient';
import { COMPLAINT_ELIGIBLE_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate, formatDateTime, formatTimeSlot, getErrorMessage } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageLoader from '../../components/ui/PageLoader';
import RatingStars from '../../components/ui/RatingStars';
import StatusBadge from '../../components/ui/StatusBadge';
import BookingTimeline from '../../components/common/BookingTimeline';
import ComplaintFormModal from '../../components/common/ComplaintFormModal';
import ComplaintStatusBadge from '../../components/common/ComplaintStatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ReviewFormModal from '../../components/common/ReviewFormModal';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((s) => s.booking);
  const { myComplaints } = useAppSelector((s) => s.complaint);
  const tick = useAppSelector((s) => s.ui.realtimeTick);

  const [myReview, setMyReview] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDeleteReview, setConfirmDeleteReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);

  const booking = current?._id === id ? current : null;

  useEffect(() => {
    dispatch(fetchBookingById(id));
    dispatch(fetchMyComplaints());
  }, [dispatch, id, tick]);

  const loadReview = useCallback(async () => {
    if (!booking || booking.status !== 'Completed') return;
    try {
      const { data } = await reviewApi.getByProvider(booking.providerId._id);
      setMyReview(data.data.find((r) => r.bookingId === booking._id) || null);
    } catch {
      setMyReview(null);
    }
  }, [booking]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  if (!booking) return <PageLoader label="Loading booking..." />;

  const provider = booking.providerId;
  const address = booking.addressId;
  const service = booking.serviceId;
  const canCancel = ['Pending', 'Confirmed'].includes(booking.status);
  const canComplain = COMPLAINT_ELIGIBLE_STATUSES.includes(booking.status);
  const bookingComplaints = myComplaints.filter((c) => (c.bookingId?._id || c.bookingId) === booking._id);

  const handleCancel = async () => {
    setBusy(true);
    try {
      await dispatch(cancelBooking(booking._id)).unwrap();
      toast.success('Booking cancelled');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const { data } = await axiosClient.post('/payments/create-order', {
        amount: booking.price,
      });

      if (!data.success) {
        toast.error('Failed to initiate payment order.');
        setPaying(false);
        return;
      }

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
        amount: order.amount,
        currency: order.currency,
        name: 'HomeServe',
        description: `Payment for booking #${booking._id.slice(-8)}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            
            const verifyRes = await axiosClient.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id, 
            });

            if (verifyRes.data.success) {
              toast.success('Payment successful & verified!');
              dispatch(fetchBookingById(id));
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            toast.error('Error verifying payment signature.');
          }
        },
        prefill: {
          name: booking.customerId?.name || 'Customer',
          email: booking.customerId?.email || 'customer@example.com',
          contact: booking.customerId?.phone || '9999999999',
        },
        theme: { color: '#3399cc' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Could not connect to payment gateway.');
    } finally {
      setPaying(false);
    }
  };

  const submitReview = async (payload) => {
    try {
      if (myReview) {
        const updated = await dispatch(updateReview({ id: myReview._id, payload })).unwrap();
        setMyReview({ ...myReview, ...updated });
        toast.success('Review updated');
      } else {
        const created = await dispatch(createReview({ bookingId: booking._id, ...payload })).unwrap();
        setMyReview(created);
        toast.success('Thanks for your review!');
      }
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
      throw err;
    }
  };

  const handleDeleteReview = async () => {
    setBusy(true);
    try {
      await dispatch(deleteReview(myReview._id)).unwrap();
      setMyReview(null);
      toast.success('Review deleted');
      setConfirmDeleteReview(false);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  const submitComplaint = async (payload) => {
    try {
      await dispatch(createComplaint(payload)).unwrap();
      toast.success('Complaint submitted');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
      throw err;
    }
  };

  return (
    <div>
      <Link to="/customer/bookings" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink-400">Booking #{booking._id.slice(-8).toUpperCase()}</p>
          <h1 className="text-2xl font-extrabold text-ink-950">{service?.name}</h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-ink-900">Schedule & location</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-400">Date & time</p>
                  <p className="font-semibold text-ink-900">{formatDate(booking.bookingDate, 'EEEE, dd MMM yyyy')}</p>
                  <p className="text-sm text-ink-500">{formatTimeSlot(booking.timeSlot)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-400">Address ({address?.label})</p>
                  <p className="text-sm font-semibold text-ink-900">
                    {address?.houseNo}, {address?.street}
                  </p>
                  <p className="text-sm text-ink-500">
                    {address?.area}, {address?.city}, {address?.state} {address?.pincode}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-base font-bold text-ink-900">Your provider</h2>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={provider?.profileImage} name={provider?.name} size="h-14 w-14" />
                <div>
                  <p className="font-bold text-ink-900">{provider?.name}</p>
                  {provider?.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                      <Phone className="h-3.5 w-3.5" /> {provider.phone}
                    </p>
                  )}
                </div>
              </div>
              <Link to={`/customer/providers/${provider?._id}`}>
                <Button variant="outline" size="sm">
                  View profile
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-base font-bold text-ink-900">Payment</h2>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-ink-500">
                <CreditCard className="h-4 w-4" /> Total amount
              </span>
              <span className="font-display text-2xl font-extrabold text-brand-700">{formatCurrency(booking.price)}</span>
            </div>
            <p className="text-xs text-ink-400">
              Payment status: <b className="capitalize text-ink-600">{booking.paymentStatus}</b>
            </p>

           
            {booking.status === 'Completed' && booking.paymentStatus !== 'paid' && (
              <Button 
                className="mt-3 w-full" 
                icon={CreditCard} 
                onClick={handlePayment} 
                isLoading={paying}
              >
                Pay Now ({formatCurrency(booking.price)})
              </Button>
            )}

            {booking.paymentStatus === 'paid' && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                ✓ Payment completed successfully
              </p>
            )}
          </Card>

          {booking.status === 'Completed' && (
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-ink-900">Your review</h2>
              {myReview ? (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <RatingStars rating={myReview.rating} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setReviewOpen(true)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setConfirmDeleteReview(true)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  {myReview.comment && <p className="mt-2 text-sm text-ink-600">{myReview.comment}</p>}
                  <p className="mt-2 text-xs text-ink-400">Reviewed on {formatDate(myReview.createdAt)}</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-500">Your job is complete — how did it go?</p>
                  <Button icon={Star} onClick={() => setReviewOpen(true)}>
                    Write a review
                  </Button>
                </div>
              )}
            </Card>
          )}

          {bookingComplaints.length > 0 && (
            <Card className="space-y-3">
              <h2 className="text-base font-bold text-ink-900">Complaints on this booking</h2>
              {bookingComplaints.map((c) => (
                <div key={c._id} className="rounded-xl bg-ink-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">{c.subject}</p>
                    <ComplaintStatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">Raised {formatDateTime(c.createdAt)}</p>
                  {c.adminRemark && (
                    <p className="mt-2 rounded-lg bg-white p-3 text-xs text-ink-600">
                      <b>Admin remark:</b> {c.adminRemark}
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <h2 className="mb-5 text-base font-bold text-ink-900">Booking timeline</h2>
            <BookingTimeline statusHistory={booking.statusHistory} status={booking.status} />
          </Card>

          {(canCancel || canComplain) && (
            <Card className="space-y-3">
              <h2 className="text-base font-bold text-ink-900">Actions</h2>
              {canCancel && (
                <Button variant="danger" className="w-full" icon={XCircle} onClick={() => setConfirmCancel(true)}>
                  Cancel booking
                </Button>
              )}
              {canComplain && (
                <Button variant="outline" className="w-full" icon={MessageSquareWarning} onClick={() => setComplaintOpen(true)}>
                  Raise a complaint
                </Button>
              )}
            </Card>
          )}
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        isLoading={busy}
        title="Cancel this booking?"
        message="The provider will be notified and this slot will be released. This can't be undone."
        confirmLabel="Yes, cancel booking"
      />
      <ConfirmDialog
        isOpen={confirmDeleteReview}
        onClose={() => setConfirmDeleteReview(false)}
        onConfirm={handleDeleteReview}
        isLoading={busy}
        title="Delete your review?"
        message="Your rating and comment will be permanently removed."
        confirmLabel="Delete review"
      />
      <ReviewFormModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={submitReview}
        initial={myReview}
        providerName={provider?.name}
      />
      <ComplaintFormModal
        isOpen={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        onSubmit={submitComplaint}
        fixedBookingId={booking._id}
      />
    </div>
  );
};

export default BookingDetailsPage;