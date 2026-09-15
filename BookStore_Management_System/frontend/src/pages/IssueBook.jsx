import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBooks, issueBook } from '../services/api';
import { ArrowLeft, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const IssueBook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preBookId = searchParams.get('bookId') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    personName: '',
    phone: '',
    email: '',
    bookId: preBookId,
    issuedDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getBooks().then(res => {
      // Only show books with available copies
      setBooks(res.data.data.filter(b => b.availableCount > 0));
    }).catch(() => toast.error('Failed to load books.'));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.personName.trim()) errs.personName = 'Person name is required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-+()]/g, ''))) errs.phone = 'Enter a valid phone number.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.bookId) errs.bookId = 'Please select a book.';
    if (!form.issuedDate) errs.issuedDate = 'Issue date is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await issueBook(form);
      toast.success('Book issued successfully!');
      navigate('/issues');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book.');
    }
    setLoading(false);
  };

  const field = (key, type = 'text') => ({
    type,
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    className: `input-field ${errors[key] ? 'border-red-400' : ''}`
  });

  const selectedBook = books.find(b => b.bookId === form.bookId);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Issue Book</h1>
          <p className="text-gray-500 text-sm">Issue a book to a person</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Person Info */}
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Person Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Person Name *</label>
                <input {...field('personName')} placeholder="Full name" />
                {errors.personName && <p className="mt-1 text-xs text-red-500">{errors.personName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input {...field('phone', 'tel')} placeholder="e.g. 9876543210" />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input {...field('email', 'email')} placeholder="email@example.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Book Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Book *</label>
                <select
                  value={form.bookId}
                  onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                  className={`input-field ${errors.bookId ? 'border-red-400' : ''}`}
                >
                  <option value="">— Select a book —</option>
                  {books.map(b => (
                    <option key={b.bookId} value={b.bookId}>
                      {b.bookId} — {b.bookName} by {b.author} ({b.availableCount} available)
                    </option>
                  ))}
                </select>
                {errors.bookId && <p className="mt-1 text-xs text-red-500">{errors.bookId}</p>}
                {books.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">⚠ No books available to issue right now.</p>
                )}
              </div>

              {selectedBook && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-indigo-800">{selectedBook.bookName}</p>
                    <p className="text-indigo-600 text-xs">By {selectedBook.author} · {selectedBook.availableCount} copies available</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date *</label>
                <input {...field('issuedDate', 'date')} />
                {errors.issuedDate && <p className="mt-1 text-xs text-red-500">{errors.issuedDate}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || books.length === 0} className="btn-primary flex-1">
              {loading ? 'Issuing...' : 'Issue Book'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueBook;
