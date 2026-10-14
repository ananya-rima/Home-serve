import { io } from 'socket.io-client';
import axiosClient from './axiosClient';
import { storage } from '../utils/storage';

const socketUrl = axiosClient.defaults.baseURL.replace(/\/api\/?$/, '');

export const socket = io(socketUrl, {
  autoConnect: false,
  auth: (cb) => cb({ token: storage.getAccessToken() }),
});

let retries = 0;
socket.on('connect', () => {
  retries = 0;
});


socket.on('connect_error', async (err) => {
  if (err.message !== 'Unauthorized' || retries >= 2) return;
  retries += 1;
  try {
    await axiosClient.get('/auth/me');
    socket.connect();
  } catch {
    
  }
});