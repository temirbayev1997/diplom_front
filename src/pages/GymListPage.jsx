import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiSearch, BiX, BiDumbbell } from 'react-icons/bi';
import api from '../services/api';
import './GymListPage.css';

const GymListPage = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Эффект для обработки URL при первой загрузке и при изменении
  useEffect(() => {
    // Получаем параметры из URL
    const queryParams = new URLSearchParams(location.search);
    const nameParam = queryParams.get('name');
    const searchParam = queryParams.get('search');
    
    // Отладочные логи
    console.log('URL Parameters:', { nameParam, searchParam });
    
    // Устанавливаем термин поиска из URL
    if (nameParam) {
      setSearchTerm(nameParam);
    } else if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    // Выполняем соответствующий запрос
    if (nameParam) {
      fetchGymsByName(nameParam);
    } else if (searchParam) {
      fetchGymsBySearch(searchParam);
    } else {
      fetchAllGyms();
    }
  }, [location.search]);

  // Получение всех залов
  const fetchAllGyms = async () => {
    try {
      setLoading(true);
      console.log('Fetching all gyms...');
      const response = await api.get('/api/v1/gyms/');
      
      if (response.data) {
        console.log('Gyms data received:', response.data);
        setGyms(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('No data received');
        setGyms([]);
      }
      setLoading(false);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Поиск залов по названию (с главной страницы)
  const fetchGymsByName = async (name) => {
    try {
      setLoading(true);
      console.log(`Fetching gyms by name: ${name}`);
      const response = await api.get(`/api/v1/gyms/?name=${encodeURIComponent(name)}`);
      
      if (response.data) {
        console.log('Gyms data received:', response.data);
        setGyms(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('No data received');
        setGyms([]);
      }
      setLoading(false);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Поиск залов по названию и адресу
  const fetchGymsBySearch = async (query) => {
    try {
      setLoading(true);
      console.log(`Fetching gyms by search: ${query}`);
      const response = await api.get(`/api/v1/gyms/?search=${encodeURIComponent(query)}`);
      
      if (response.data) {
        console.log('Gyms data received:', response.data);
        setGyms(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('No data received');
        setGyms([]);
      }
      setLoading(false);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Обработка ошибок API
  const handleApiError = (err) => {
    console.error('API Error:', err);
    setError('Не удалось загрузить список залов. Попробуйте позже.');
    setLoading(false);
  };

  // Обработка изменения поля поиска
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Обработка отправки формы поиска
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      console.log('Submitting search:', searchTerm);
      // Выполняем поиск по названию и адресу и направляем на URL с поисковым запросом
      navigate(`/gyms?search=${encodeURIComponent(searchTerm)}`);
    } else {
      // Если поле поиска пустое, возвращаемся к списку всех залов
      navigate('/gyms');
    }
  };

  // Очистка поиска
  const handleClearSearch = () => {
    setSearchTerm('');
    navigate('/gyms');
  };

  // Переход на страницу деталей зала
  const handleGymClick = (gymId) => {
    navigate(`/gyms/${gymId}`);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Загрузка залов...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">
          {error}
          <Button className="ms-3" variant="outline-primary" onClick={fetchAllGyms}>
            Попробовать снова
          </Button>
        </div>
      </Container>
    );
  }

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
                placeholder="Поиск по названию или адресу"
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
              <Button variant="primary" type="submit">
                Найти
              </Button>
            </InputGroup>
            <small className="text-muted d-block mt-2">
              Для расширенного поиска используйте название и адрес
            </small>
          </Form>
        </Col>
      </Row>

      {gyms.length === 0 ? (
        <Alert variant="info">Залы не найдены</Alert>
      ) : (
        <Row>
          {gyms.map(gym => (
            <Col key={gym.id} md={4} className="mb-4">
              <Card className="gym-card h-100">
                {gym.image ? (
                  <Card.Img variant="top" src={gym.image} style={{ height: '200px', objectFit: 'cover' }} />
                ) : (
                  <div className="default-image d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <BiDumbbell size={50} className="mb-2" />
                      <p>Нет изображения</p>
                    </div>
                  </div>
                )}
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
      )}
    </Container>
  );
};

export default GymListPage;