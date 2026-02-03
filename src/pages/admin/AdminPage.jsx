import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';

const AdminPage = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalRooms: 0,
    activeBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [bookingsRes, usersRes, roomsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/rooms'),
      ]);

      const bookings = bookingsRes.data;
      const now = new Date();
      const active = bookings.filter(
        (b) =>
          b.status === 'BOOKED' &&
          new Date(b.start_time) <= now &&
          new Date(b.end_time) >= now
      );

      setStats({
        totalBookings: bookings.length,
        totalUsers: usersRes.data.length,
        totalRooms: roomsRes.data.length,
        activeBookings: active.length,
      });

      setRecentBookings(bookings.slice(0, 10));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link
      to={link}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </Link>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage rooms, bookings, and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon="📅"
          color="bg-blue-50"
          link="/bookings"
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon="🏢"
          color="bg-green-50"
          link="/rooms"
        />
        <StatCard
          title="Active Now"
          value={stats.activeBookings}
          icon="✅"
          color="bg-purple-50"
          link="/bookings"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-orange-50"
          link="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/rooms/new"
          className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition"
        >
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="font-semibold text-lg text-gray-900">Add New Room</h3>
          <p className="text-sm text-gray-600 mt-1">Create a conference room</p>
        </Link>

        <Link
          to="/bookings"
          className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-lg text-gray-900">View All Bookings</h3>
          <p className="text-sm text-gray-600 mt-1">Manage all bookings</p>
        </Link>

        <Link
          to="/rooms"
          className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition"
        >
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="font-semibold text-lg text-gray-900">Manage Rooms</h3>
          <p className="text-sm text-gray-600 mt-1">Edit and delete rooms</p>
        </Link>
      </div>

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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{booking.booked_by || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {format(new Date(booking.start_time), 'MMM dd, yyyy • h:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'BOOKED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;