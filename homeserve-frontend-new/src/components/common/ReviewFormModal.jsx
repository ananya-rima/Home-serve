import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import StarInput from './StarInput';


const ReviewFormModal = ({ isOpen, onClose, onSubmit, initial, providerName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initial?.rating || 0);
      setComment(initial?.comment || '');
      setError('');
    }
  }, [isOpen, initial]);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Please choose a rating from 1 to 5 stars');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit your review' : 'Write a review'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting}>
            {initial ? 'Save Changes' : 'Submit Review'}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-ink-500">
        How was your experience{providerName ? ` with ${providerName}` : ''}?
      </p>
      <StarInput value={rating} onChange={setRating} />
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
      <div className="mt-5">
        <Textarea
          label="Comment (optional)"
          placeholder="Share details that help others choose..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default ReviewFormModal;
