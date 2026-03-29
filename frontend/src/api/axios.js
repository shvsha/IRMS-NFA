import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000'
})

// this attach token generated from the backend to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // get new access token using refresh token
          const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
            refresh: refreshToken
          });

          const newAccessToken = response.data.access;

          localStorage.setItem('access_token', newAccessToken)

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          // get kick out IF REFRESH TOKEN is also expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          alert('Your session has expired. Please login again.');
          window.location.href = '/';
        }
      } else {
        // no refresh token
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;