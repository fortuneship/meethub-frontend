import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import bookingService from '../../services/booking.service';
import roomService from '../../services/room.service';

const NewBookingPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    room_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '10:00',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomService.getRooms();
      setRooms(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, room_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
    }
  };

  const checkAvailability = async () => {
    if (!formData.room_id || !formData.date || !formData.start_time || !formData.end_time) {
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityMessage('');

    try {
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);

      await bookingService.checkAvailability(
        formData.room_id,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );

      setAvailabilityMessage('✅ Room is available for this time slot');
    } catch (error) {
      if (error.response?.status === 409) {
        setAvailabilityMessage('❌ Room is already booked for this time slot');
      } else {
        setAvailabilityMessage('⚠️ Unable to check availability');
      }
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.room_id, formData.date, formData.start_time, formData.end_time]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`);

    if (startDateTime >= endDateTime) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    if (startDateTime < new Date()) {
      setError('Cannot book a room in the past');
      setLoading(false);
      return;
    }

    try {
      await bookingService.createBooking({
        title: formData.title,
        room_id: formData.room_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });

      navigate('/bookings', { state: { message: 'Booking created successfully!' } });
    } catch (error) {
      if (error.response?.status === 409) {
        setError('This time slot is already booked. Please choose another time.');
      } else {
        setError(error.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
          <p className="text-gray-600 mt-2">Book a conference room for your meeting</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., Team Planning Meeting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room *
            </label>
            <select
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - Capacity: {room.capacity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Availability Check */}
          {availabilityMessage && (
            <div
              className={`p-4 rounded-lg ${
                availabilityMessage.includes('✅')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : availabilityMessage.includes('❌')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              {checkingAvailability ? 'Checking availability...' : availabilityMessage}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || checkingAvailability || availabilityMessage.includes('❌')}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingPage;