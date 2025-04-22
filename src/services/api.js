import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers["referrerPolicy"] = "unsafe-url";
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Перехватчик для обновления токена при ошибке авторизации
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Если ошибка 401 и не пытались обновить токен
        if (error.response && error.response.status === 401 && !error.config._retry) {
            error.config._retry = true;
            
            try {
                // Попытка обновить токен
                const refreshToken = localStorage.getItem("refresh");
                if (refreshToken) {
                    const response = await axios.post('http://127.0.0.1:8000/api/v1/users/token/refresh/', {
                        refresh: refreshToken
                    });
                    
                    if (response.data.access) {
                        localStorage.setItem("token", response.data.access);
                        
                        // Обновляем токен в заголовке и повторяем запрос
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        error.config.headers['Authorization'] = `Bearer ${response.data.access}`;
                        
                        return api(error.config);
                    }
                }
            } catch (refreshError) {
                console.error("Ошибка обновления токена:", refreshError);
                
                // Если не удалось обновить токен, перенаправляем на страницу входа
                localStorage.removeItem("token");
                localStorage.removeItem("refresh");
                
                // Перенаправление на страницу входа
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;