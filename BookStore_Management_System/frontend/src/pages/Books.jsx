import { useState, useEffect } from 'react';
import { getBooks, createBook, updateBook, deleteBook } from '../services/api';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, BookPlus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { bookName: '', publishingYear: '', author: '', description: '', totalCount: '' };

const BookForm = ({ initial, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.bookName.trim()) errs.bookName = 'Book name is required.';
    if (!form.author.trim()) errs.author = 'Author is required.';
    const yr = parseInt(form.publishingYear);
    if (!form.publishingYear || isNaN(yr) || yr < 1000 || yr > 2100) errs.publishingYear = 'Valid year required (1000–2100).';
    const cnt = parseInt(form.totalCount);
    if (form.totalCount === '' || isNaN(cnt) || cnt < 0) errs.totalCount = 'Count must be 0 or more.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    className: `input-field ${errors[key] ? 'border-red-400' : ''}`
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Book Name *</label>
        <input {...field('bookName')} placeholder="e.g. Java Programming" />
        {errors.bookName && <p className="mt-1 text-xs text-red-500">{errors.bookName}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year of Publishing *</label>
          <input type="number" {...field('publishingYear')} placeholder="e.g. 2020" min="1000" max="2100" />
          {errors.publishingYear && <p className="mt-1 text-xs text-red-500">{errors.publishingYear}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Count *</label>
          <input type="number" {...field('totalCount')} placeholder="e.g. 10" min="0" />
          {errors.totalCount && <p className="mt-1 text-xs text-red-500">{errors.totalCount}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
        <input {...field('author')} placeholder="e.g. James Gosling" />
        {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...field('description')}
          rows={3}
          placeholder="Optional description..."
          className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : (initial ? 'Update Book' : 'Add Book')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  );
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="space-y-4">
    <p className="text-gray-600">{message}</p>
    <div className="flex gap-3">
      <button onClick={onConfirm} className="btn-danger flex-1">Yes, Delete</button>
      <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
    </div>
  </div>
);

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ type: null, book: null });
  const [saving, setSaving] = useState(false);

  const fetchBooks = async (q = '') => {
    setLoading(true);
    try {
      const res = await getBooks(q);
      setBooks(res.data.data);
    } catch (_) { toast.error('Failed to load books.'); }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchBooks(val);
  };

  const openAdd = () => setModal({ type: 'add', book: null });
  const openEdit = (book) => setModal({ type: 'edit', book });
  const openDelete = (book) => setModal({ type: 'delete', book });
  const closeModal = () => setModal({ type: null, book: null });

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await createBook(form);
      toast.success('Book added successfully!');
      closeModal();
      fetchBooks(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book.');
    }
    setSaving(false);
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await updateBook(modal.book.id, form);
      toast.success('Book updated successfully!');
      closeModal();
      fetchBooks(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update book.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await deleteBook(modal.book.id);
      toast.success('Book deleted successfully!');
      closeModal();
      fetchBooks(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  const handleIssue = (book) => navigate(`/issues/new?bookId=${book.bookId}&bookName=${encodeURIComponent(book.bookName)}`);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Books</h1>
          <p className="text-gray-500 text-sm">Manage your book collection</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {/* Search */}
      <div className="card !p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by Book ID, Name, or Author..."
            className="input-field pl-9 pr-9"
          />
          {search && (
            <button onClick={() => { setSearch(''); fetchBooks(''); }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center">
            <BookPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'No books match your search.' : "No books available. Click 'Add Book' to add your first book."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['S.No', 'Book ID', 'Book Name', 'Year', 'Author', 'Description', 'Total', 'Available', 'Actions'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {books.map((book, i) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td text-gray-400">{i + 1}</td>
                    <td className="table-td"><span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{book.bookId}</span></td>
                    <td className="table-td font-medium text-gray-800">{book.bookName}</td>
                    <td className="table-td">{book.publishingYear}</td>
                    <td className="table-td">{book.author}</td>
                    <td className="table-td max-w-[200px] truncate" title={book.description}>{book.description || '—'}</td>
                    <td className="table-td font-medium">{book.totalCount}</td>
                    <td className="table-td">
                      <span className={`font-semibold ${book.availableCount === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {book.availableCount}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleIssue(book)}
                          disabled={book.availableCount === 0}
                          title={book.availableCount === 0 ? 'No copies available' : 'Issue this book'}
                          className="px-2 py-1 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                        >
                          Issue
                        </button>
                        <button
                          onClick={() => openEdit(book)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(book)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modal.type === 'add'} onClose={closeModal} title="Add New Book">
        <BookForm onSubmit={handleAdd} onCancel={closeModal} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal.type === 'edit'} onClose={closeModal} title={`Edit Book — ${modal.book?.bookId}`}>
        {modal.book && (
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <span className="font-medium">Book ID:</span> {modal.book.bookId}
              {modal.book.totalCount - modal.book.availableCount > 0 && (
                <span className="ml-3 text-amber-600">⚠ {modal.book.totalCount - modal.book.availableCount} copies currently issued</span>
              )}
            </div>
            <BookForm
              initial={{
                bookName: modal.book.bookName,
                publishingYear: String(modal.book.publishingYear),
                author: modal.book.author,
                description: modal.book.description || '',
                totalCount: String(modal.book.totalCount)
              }}
              onSubmit={handleEdit}
              onCancel={closeModal}
              loading={saving}
            />
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={modal.type === 'delete'} onClose={closeModal} title="Delete Book" size="sm">
        {modal.book && (
          <ConfirmDialog
            message={`Are you sure you want to delete "${modal.book.bookName}" (${modal.book.bookId})? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default Books;
