import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import roomService from '../../services/room.service';
import { useAuth } from '../../contexts/AuthContext';

const RoomsPage = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCapacity =
      filterCapacity === 'all' ||
      (filterCapacity === 'small' && room.capacity <= 6) ||
      (filterCapacity === 'medium' && room.capacity > 6 && room.capacity <= 12) ||
      (filterCapacity === 'large' && room.capacity > 12);

    return matchesSearch && matchesCapacity;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Conference Rooms</h1>
          <p className="text-gray-600 mt-2">Browse and book available rooms</p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/rooms/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            ➕ Add Room
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Rooms
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Capacity
            </label>
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Rooms</option>
              <option value="small">Small (1-6 people)</option>
              <option value="medium">Medium (7-12 people)</option>
              <option value="large">Large (13+ people)</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">
            {searchQuery || filterCapacity !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No rooms available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {room.capacity} people
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {room.location || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  {room.description || 'No description available'}
                </p>

                {room.facilities && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Facilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.facilities.split(',').map((facility, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {facility.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Link
                    to="/bookings/new"
                    state={{ roomId: room.id }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-medium rounded-lg transition"
                  >
                    Book Now
                  </Link>
                  {isAdmin && (
                    <Link
                      to={`/admin/rooms/${room.id}/edit`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;