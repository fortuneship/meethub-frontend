import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import bookingService from '../../services/booking.service';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filter]);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        filtered = bookings.filter(
          (b) => b.status === 'BOOKED' && new Date(b.start_time) > now
        );
        break;
      case 'past':
        filtered = bookings.filter((b) => new Date(b.end_time) < now);
        break;
      case 'cancelled':
        filtered = bookings.filter((b) => b.status === 'CANCELLED');
        break;
      default:
        filtered = bookings;
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await bookingService.cancelBooking(selectedBooking.id);
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: 'CANCELLED' } : b
        )
      );
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusColor = (booking) => {
    if (booking.status === 'CANCELLED') return 'bg-red-100 text-red-800';
    
    const now = new Date();
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    if (start <= now && end >= now) return 'bg-green-100 text-green-800';
    if (start > now) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (booking) => {
    if (booking.status === 'CANCELLED') return 'Cancelled';
    
    const now = new Date();
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    if (start <= now && end >= now) return 'Active';
    if (start > now) return 'Upcoming';
    return 'Completed';
  };

  const canCancel = (booking) => {
    return (
      booking.status === 'BOOKED' &&
      new Date(booking.start_time) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage all your room bookings</p>
        </div>
        <Link
          to="/bookings/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          ➕ New Booking
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex space-x-1 p-2">
          {[
            { key: 'all', label: 'All', count: bookings.length },
            {
              key: 'upcoming',
              label: 'Upcoming',
              count: bookings.filter(
                (b) => b.status === 'BOOKED' && new Date(b.start_time) > new Date()
              ).length,
            },
            {
              key: 'past',
              label: 'Past',
              count: bookings.filter((b) => new Date(b.end_time) < new Date()).length,
            },
            {
              key: 'cancelled',
              label: 'Cancelled',
              count: bookings.filter((b) => b.status === 'CANCELLED').length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "You haven't made any bookings yet"
              : `You have no ${filter} bookings`}
          </p>
          <Link
            to="/bookings/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Booking
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking
                      )}`}
                    >
                      {getStatusText(booking)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>
                        {format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">⏰</span>
                      <span>
                        {format(new Date(booking.start_time), 'h:mm a')} -{' '}
                        {format(new Date(booking.end_time), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {canCancel(booking) && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel "{selectedBooking?.title}"? This action cannot
              be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;