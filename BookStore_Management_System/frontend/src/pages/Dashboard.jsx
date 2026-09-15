import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { BookOpen, BookMarked, RotateCcw, Library, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => (
  <div
    onClick={onClick}
    className={`card flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your book store</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Books"
            value={stats?.totalBooks}
            icon={Library}
            color="bg-indigo-500"
            onClick={() => navigate('/books')}
            subtitle="Click to manage"
          />
          <StatCard
            title="Available Copies"
            value={stats?.totalAvailable}
            icon={BookOpen}
            color="bg-emerald-500"
            subtitle={`of ${stats?.totalCopies} total`}
          />
          <StatCard
            title="Currently Issued"
            value={stats?.currentlyIssued}
            icon={BookMarked}
            color="bg-amber-500"
            onClick={() => navigate('/issues?status=issued')}
            subtitle="Click to view"
          />
          <StatCard
            title="Returned Books"
            value={stats?.totalReturned}
            icon={RotateCcw}
            color="bg-sky-500"
            onClick={() => navigate('/issues?status=returned')}
            subtitle="Click to view"
          />
        </div>
      )}

      {/* Quick Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-700">Quick Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="font-medium text-indigo-700 mb-1">Charge Rate</p>
            <p className="text-2xl font-bold text-indigo-800">₹3 <span className="text-sm font-normal">/ day</span></p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="font-medium text-amber-700 mb-1">Day Calculation</p>
            <p className="text-sm text-amber-800">Inclusive counting<br />(Issue day + Return day both counted)</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="font-medium text-emerald-700 mb-1">Example</p>
            <p className="text-sm text-emerald-800">3 Aug → 10 Aug<br />= 8 days × ₹3 = ₹24</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
