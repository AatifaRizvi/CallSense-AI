import axios from 'axios';
import { supabase } from '../supabaseClient';

const API_BASE = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

// Attach the current Supabase session's access token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const getStats       = ()       => api.get('/stats');
export const getCalls       = (params) => api.get('/calls', { params });
export const getCallDetail  = (id)     => api.get(`/calls/${id}`);
export const getReviews     = (params) => api.get('/reviews', { params });
export const getReviewDetail = (id)    => api.get(`/reviews/${id}`);

export const analyzeText = (text, source_type) =>
  api.post('/analyze/text', { text, source_type });

export const analyzeAudio = (formData) =>
  api.post('/analyze/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const analyzeCsv = (formData) =>
  api.post('/analyze/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const analyzeCsvDownload = (formData) =>
  api.post('/analyze/csv/download', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob'
  });

export const saveHistory = (data) => api.post('/history', data);
export const getHistory  = ()     => api.get('/history');

export default api;