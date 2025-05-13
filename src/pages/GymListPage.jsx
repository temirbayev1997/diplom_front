// src/pages/GymListPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiSearch, BiX, BiDumbbell } from 'react-icons/bi';
import api from '../services/api';
import './GymListPage.css';
import { searchGymsByPost } from '../services/gymService';
// URL API-эндпоинтов
const API_ENDPOINTS = {
  GYMS: '/api/v1/gyms/',
  GYM_DETAIL: (id) => `/api/v1/gyms/${id}/`,
};

const GymListPage = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchPerformed, setSearchPerformed] = useState(false);

  const processGymData = (data) => {
    // Преобразуем данные к стандартному формату
    const gymData = Array.isArray(data) 
      ? data 
      : (data.results || []);
    
    // Проверяем и нормализуем поля
    return gymData.map(gym => ({
      id: gym.id,
      name: gym.name || 'Без названия',
      address: gym.address || 'Адрес не указан',
      opening_time: gym.opening_time || '00:00',
      closing_time: gym.closing_time || '00:00',
      capacity: gym.capacity || 0,
      image: gym.image || null
    }));
  };


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const nameParam = queryParams.get('name');
    const searchParam = queryParams.get('search');
    
    if (nameParam) {
      setSearchTerm(nameParam);
      fetchGymsByName(nameParam);
    } else if (searchParam) {
      setSearchTerm(searchParam);
      fetchGymsBySearch(searchParam);
    } else {
      fetchAllGyms();
    }
  }, [location.search]);

  const fetchAllGyms = async () => {
    try {
      setLoading(true);
      console.log('Отправка запроса GET /api/v1/gyms/');
      const response = await api.get('/api/v1/gyms/');
      console.log('Ответ:', response);
      
      if (response.data) {
        const gyms = Array.isArray(response.data?.results) ? response.data.results : [];
        setGyms(gyms);
      } else {
        setGyms([]);
      }
    } catch (err) {
      console.error('Полная ошибка:', err);
      setError('Ошибка при загрузке залов. Подробности в консоли.');
    } finally {
      setLoading(false);
      setSearchPerformed(false); // сбрасываем, если просто открыли список без фильтра
    }
  };

  const fetchGymsByName = async (name) => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.GYMS, {
        params: { name }
      });
      
      if (response.data) {
        // Стандартизированная обработка данных
        const gymData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || []);
        
        const processedGyms = gymData.map(gym => ({
          id: gym.id,
          name: gym.name || 'Без названия',
          address: gym.address || 'Адрес не указан',
          opening_time: gym.opening_time || '00:00',
          closing_time: gym.closing_time || '00:00',
          capacity: gym.capacity || 0,
          image: gym.image || null
        }));
        
        setGyms(processedGyms);
      } else {
        setGyms([]);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGymsBySearch = async (query) => {
    try {
      setLoading(true);
      setSearchPerformed(true);
      const response = await searchGymsByPost({ query });
      const gyms = Array.isArray(response.data) ? response.data : [];
      setGyms(gyms);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleApiError = (err) => {
    console.error('API Error:', err);
    
    if (err.response) {
      if (err.response.headers['content-type'] && 
          !err.response.headers['content-type'].includes('application/json')) {
        setError('Сервер вернул ответ в неправильном формате. Ожидался JSON.');
      } else {
        setError(err.response.data?.detail || 'Ошибка при загрузке данных');
      }
    } else if (err.request) {
      setError('Не удалось получить ответ от сервера');
    } else {
      setError('Ошибка при выполнении запроса');
    }
    
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      navigate(`/gyms?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/gyms');
    }
  };

  // Метод для прямого поиска без изменения URL
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await fetchGymsBySearch(searchTerm);
    } else {
      await fetchAllGyms();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    navigate('/gyms');
  };

  const handleGymClick = (gymId) => {
    navigate(`/gyms/${gymId}`);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Тренажерные залы</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup className="gym-search-bar">
              <InputGroup.Text className="bg-white border-end-0">
                <BiSearch size={20} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Поиск по названию"
                value={searchTerm}
                onChange={handleSearchChange}
                className="border-start-0"
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClearSearch}
                >
                  <BiX size={20} />
                </Button>
              )}
              <Button variant="primary" onClick={handleSearch} type="button">
                Найти
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : gyms.length === 0 ? (
  <Alert variant="info">
    {searchPerformed
      ? `Ничего не найдено по запросу: "${searchTerm}"`
      : "Залы не найдены"}
  </Alert>
) : (
  <>
    {searchPerformed && (
      <Alert variant="success">
        Найдено {gyms.length} зал(а/ов) по запросу: "<strong>{searchTerm}</strong>"
      </Alert>
    )}
    <Row>
      {gyms.map(gym => (
        <Col key={gym.id} md={4} className="mb-4">
          <Card className="gym-card h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>{gym.name}</Card.Title>
              <Card.Text className="text-muted small">{gym.address}</Card.Text>
              <Card.Text>
                <small>Часы работы: {gym.opening_time?.slice(0, 5)} - {gym.closing_time?.slice(0, 5)}</small>
              </Card.Text>
              <Card.Text>
                Вместимость: {gym.capacity} чел.
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => handleGymClick(gym.id)}
                className="mt-auto"
              >
                Подробнее
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </>
)}
    </Container>
  );
};

export default GymListPage;