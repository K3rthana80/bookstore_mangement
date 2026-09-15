import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getIssues, calculateCharge, returnBook } from '../services/api';
import Modal from '../components/Modal';
import { BookMarked, RotateCcw, Plus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ReturnModal = ({ issue, onClose, onSuccess }) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [calc, setCalc] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [calcError, setCalcError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'preview' | 'success'
  const [result, setResult] = useState(null);

  const handleCalculate = async () => {
    if (!returnDate) { setCalcError('Return date is required.'); return; }
    setCalcLoading(true);
    setCalcError('');
    try {
      const res = await calculateCharge(issue.id, returnDate);
      setCalc(res.data.data);
      setStep('preview');
    } catch (err) {
      setCalcError(err.response?.data?.message || 'Failed to calculate charge.');
    }
    setCalcLoading(false);
  };

  const handleSubmitPayment = async () => {
    setSubmitLoading(true);
    try {
      const res = await returnBook(issue.id, returnDate);
      setResult(res.data.data);
      setStep('success');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return.');
    }
    setSubmitLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Book Returned Successfully!</h3>
        <p className="text-gray-500 text-sm">Book returned successfully and payment submitted.</p>
        <div className="bg-emerald-50 rounded-xl p-4 text-left space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-600">Book</span><span className="font-medium">{result?.bookName}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Person</span><span className="font-medium">{result?.personName}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Days</span><span className="font-medium">{result?.numberOfDays}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Rate</span><span className="font-medium">₹{result?.dailyCharge}/day</span></div>
          <div className="flex justify-between text-base font-bold border-t border-emerald-200 pt-2 mt-2">
            <span className="text-gray-700">Total Charge</span>
            <span className="text-emerald-700">₹{result?.totalCharge}</span>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Status</span><span className="badge-returned">Returned</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Payment</span><span className="badge-paid">Paid</span></div>
        </div>
        <button onClick={onClose} className="btn-primary w-full">Close</button>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-2">Charge Calculation</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Person</span><span className="font-medium">{issue.personName}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Book</span><span className="font-medium">{issue.bookName} ({issue.bookId})</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Issued Date</span><span className="font-medium">{formatDate(calc?.issuedDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Return Date</span><span className="font-medium">{formatDate(calc?.returnDate)}</span></div>
            <div className="border-t border-blue-200 my-2" />
            <div className="flex justify-between"><span className="text-gray-600">Number of Days</span><span className="font-semibold text-blue-700">{calc?.numberOfDays} days</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Daily Charge</span><span className="font-medium">₹{calc?.dailyCharge}/day</span></div>
            <div className="flex justify-between text-base font-bold border-t border-blue-200 pt-2">
              <span className="text-gray-800">Total Amount</span>
              <span className="text-blue-700">₹{calc?.totalCharge}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Calculation: {calc?.numberOfDays} days × ₹{calc?.dailyCharge} = ₹{calc?.totalCharge} (inclusive counting)
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSubmitPayment} disabled={submitLoading} className="btn-success flex-1">
            {submitLoading ? 'Processing...' : '✓ Payment Submitted'}
          </button>
          <button onClick={() => setStep('form')} className="btn-secondary flex-1">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Person</span><span className="font-medium">{issue.personName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Book</span><span className="font-medium">{issue.bookName} ({issue.bookId})</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Author</span><span className="font-medium">{issue.author}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Issued Date</span><span className="font-medium">{formatDate(issue.issuedDate)}</span></div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Return / Submitted Date *</label>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => { setReturnDate(e.target.value); setCalcError(''); }}
          min={issue.issuedDate}
          className="input-field"
        />
        {calcError && <p className="mt-1 text-xs text-red-500">{calcError}</p>}
      </div>
      <div className="flex gap-3">
        <button onClick={handleCalculate} disabled={calcLoading} className="btn-primary flex-1">
          {calcLoading ? 'Calculating...' : 'Calculate Charge'}
        </button>
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      </div>
    </div>
  );
};

const IssuedBooks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [returnModal, setReturnModal] = useState({ open: false, issue: null });

  const fetchIssues = async (status) => {
    setLoading(true);
    try {
      const res = await getIssues(status);
      setIssues(res.data.data);
    } catch (_) { toast.error('Failed to load issued books.'); }
    setLoading(false);
  };

  useEffect(() => { fetchIssues(statusFilter); }, [statusFilter]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
  };

  const openReturn = (issue) => setReturnModal({ open: true, issue });
  const closeReturn = () => setReturnModal({ open: false, issue: null });
  const onReturnSuccess = () => fetchIssues(statusFilter);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Issued Books</h1>
          <p className="text-gray-500 text-sm">Track all issued and returned books</p>
        </div>
        <button
          onClick={() => navigate('/issues/new')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Issue Book
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: 'all' },
          { label: 'Issued', value: 'issued' },
          { label: 'Returned', value: 'returned' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center">
            <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {statusFilter === 'issued' ? 'No books are currently issued.' :
               statusFilter === 'returned' ? 'No returned books yet.' :
               'No issued books yet.'}
            </p>
            <button onClick={() => navigate('/issues/new')} className="mt-3 btn-primary text-sm">
              Issue First Book
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['S.No', 'Person Name', 'Book ID', 'Book Name', 'Author', 'Issued Date', 'Return Date', 'Days', 'Charge', 'Status', 'Action'].map(h => (
                    <th key={h} className="table-th whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {issues.map((issue, i) => (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td text-gray-400">{i + 1}</td>
                    <td className="table-td font-medium text-gray-800 whitespace-nowrap">{issue.personName}</td>
                    <td className="table-td"><span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{issue.bookId}</span></td>
                    <td className="table-td whitespace-nowrap">{issue.bookName}</td>
                    <td className="table-td whitespace-nowrap">{issue.author}</td>
                    <td className="table-td whitespace-nowrap">{formatDate(issue.issuedDate)}</td>
                    <td className="table-td whitespace-nowrap">{issue.returnDate ? formatDate(issue.returnDate) : '—'}</td>
                    <td className="table-td">{issue.numberOfDays ?? '—'}</td>
                    <td className="table-td">{issue.totalCharge != null ? `₹${issue.totalCharge}` : '—'}</td>
                    <td className="table-td">
                      <span className={issue.status === 'issued' ? 'badge-issued' : 'badge-returned'}>
                        {issue.status === 'issued' ? 'Issued' : 'Returned'}
                      </span>
                    </td>
                    <td className="table-td">
                      {issue.status === 'issued' ? (
                        <button
                          onClick={() => openReturn(issue)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={returnModal.open}
        onClose={closeReturn}
        title={`Return Book — ${returnModal.issue?.bookName}`}
        size="md"
      >
        {returnModal.issue && (
          <ReturnModal
            issue={returnModal.issue}
            onClose={closeReturn}
            onSuccess={onReturnSuccess}
          />
        )}
      </Modal>
    </div>
  );
};

export default IssuedBooks;
