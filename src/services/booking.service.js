import api from './api';

const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getBookings() {
    const response = await api.get('/bookings');
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async updateBooking(id, bookingData) {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  async checkAvailability(roomId, startTime, endTime) {
    const response = await api.post('/bookings/check', {
      room_id: roomId,
      start_time: startTime,
      end_time: endTime,
    });
    return response.data;
  },
};

export default bookingService;