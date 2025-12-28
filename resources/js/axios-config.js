import axios from 'axios';

// Tự động detect production hoặc local
const baseURL = import.meta.env.PROD 
  ? window.location.origin  // Production: dùng URL hiện tại
  : 'http://localhost:8000';  // Local dev

axios.defaults.baseURL = baseURL;

export default axios;