import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';


const ImageUploadInput = ({ label, currentImageUrl, onChange, shape = 'circle' }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentImageUrl || null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const clear = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isCircle = shape === 'circle';

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-ink-700">{label}</p>}
      <div className="flex items-center gap-4">
        <div
          className={`relative flex h-20 w-20 items-center justify-center overflow-hidden border-2 border-dashed border-ink-200 bg-ink-50 ${
            isCircle ? 'rounded-full' : 'rounded-xl'
          }`}
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-ink-300" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
          >
            Choose Photo
          </button>
          {preview && (
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
};

export default ImageUploadInput;
