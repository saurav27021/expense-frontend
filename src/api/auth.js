import axios from 'axios';

const API_URL = 'http://localhost:5001/auth';

const authApi = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for handling cookies (JWT)
});

export const login = async (email, password) => {
    try {
        const response = await authApi.post('/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Login failed';
    }
};

export const register = async (name, email, password) => {
    try {
        const response = await authApi.post('/register', { name, email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Registration failed';
    }
};
