import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';


const ComplaintFormModal = ({ isOpen, onClose, onSubmit, bookingOptions = [], fixedBookingId }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isOpen) reset({ bookingId: fixedBookingId || '', subject: '', description: '' });
  }, [isOpen, fixedBookingId, reset]);

  const submit = async (values) => {
    await onSubmit({ ...values, bookingId: fixedBookingId || values.bookingId });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise a complaint"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
            Submit Complaint
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {!fixedBookingId && (
          <Select
            label="Booking"
            placeholder="Select the booking"
            options={bookingOptions}
            error={errors.bookingId?.message}
            {...register('bookingId', { required: 'Please select a booking' })}
          />
        )}
        <Input
          label="Subject"
          placeholder="Briefly describe the issue"
          error={errors.subject?.message}
          {...register('subject', { required: 'Subject is required' })}
        />
        <Textarea
          label="Details"
          placeholder="Tell us what went wrong..."
          error={errors.description?.message}
          {...register('description', { required: 'Please describe the issue' })}
        />
      </form>
    </Modal>
  );
};

export default ComplaintFormModal;
