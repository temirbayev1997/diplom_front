// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Логирование запросов
api.interceptors.request.use(
    (config) => {
        console.log("Отправка запроса:", {
            url: config.baseURL + config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Логирование ответов
api.interceptors.response.use(
    (response) => {
        console.log("Получен ответ:", {
            status: response.status,
            contentType: response.headers['content-type'],
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error("Ошибка ответа:", {
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default api;