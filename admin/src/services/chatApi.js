import axios from 'axios';

export const fetchChannels = async () => {
  const { data } = await axios.get('/api/chat/channels');
  return data.data;
};

export const getOrCreateRoom = async (channel, orderId) => {
  const { data } = await axios.post('/api/chat/rooms', { channel, orderId });
  return data.data;
};

export const fetchRoomMessages = async (roomId, params = {}) => {
  const { data } = await axios.get(`/api/chat/rooms/${roomId}/messages`, { params });
  return data.data;
};

export const sendMessage = async (roomId, content, messageType) => {
  const { data } = await axios.post(`/api/chat/rooms/${roomId}/messages`, { content, messageType });
  return data.data;
};

export const markRoomRead = async (roomId) => {
  const { data } = await axios.put(`/api/chat/rooms/${roomId}/read`);
  return data;
};

export const sendTyping = async (roomId, channel) => {
  await axios.post('/api/chat/typing', { roomId, channel });
};
