import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    activeBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/bookings');
      const bookings = response.data;

      const now = new Date();
      const upcoming = bookings.filter(
        (b) => b.status === 'BOOKED' && new Date(b.start_time) > now
      );
      const active = bookings.filter(
        (b) =>
          b.status === 'BOOKED' &&
          new Date(b.start_time) <= now &&
          new Date(b.end_time) >= now
      );

      setStats({
        totalBookings: bookings.length,
        upcomingBookings: upcoming.length,
        activeBookings: active.length,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your bookings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon="📅"
          color="bg-blue-50"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingBookings}
          icon="⏰"
          color="bg-green-50"
        />
        <StatCard
          title="Active Now"
          value={stats.activeBookings}
          icon="✅"
          color="bg-purple-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/bookings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 transition transform hover:scale-105"
        >
          <div className="text-3xl mb-3">➕</div>
          <h3 className="font-semibold text-lg">New Booking</h3>
          <p className="text-sm text-blue-100 mt-1">Book a room now</p>
        </Link>

        <Link
          to="/bookings"
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition"
        >
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-lg text-gray-900">My Bookings</h3>
          <p className="text-sm text-gray-600 mt-1">View all bookings</p>
        </Link>

        <Link
          to="/rooms"
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition"
        >
          <div className="text-3xl mb-3">🏢</div>
          <h3 className="font-semibold text-lg text-gray-900">Browse Rooms</h3>
          <p className="text-sm text-gray-600 mt-1">Find available rooms</p>
        </Link>

        <Link
          to="/profile"
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition"
        >
          <div className="text-3xl mb-3">👤</div>
          <h3 className="font-semibold text-lg text-gray-900">Profile</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your account</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <Link
              to="/bookings"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600">No bookings yet</p>
              <Link
                to="/bookings/new"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Booking
              </Link>
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{booking.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(booking.start_time), 'MMM dd, yyyy • h:mm a')} -{' '}
                      {format(new Date(booking.end_time), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'BOOKED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;