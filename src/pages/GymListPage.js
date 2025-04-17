import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiSearch, BiX, BiDumbbell } from 'react-icons/bi';
import axios from 'axios';
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
    
    // Если есть параметры поиска в URL, используем их
    if (nameParam) {
      setSearchTerm(nameParam);
      fetchGymsByName(nameParam);
    } else if (searchParam) {
      setSearchTerm(searchParam);
      fetchGymsBySearch(searchParam);
    } else {
      // Иначе загружаем все залы
      fetchAllGyms();
    }
  }, [location.search]);

  // Получение всех залов
  const fetchAllGyms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/gyms/');
      console.log('Fetch all gyms response:', response.data);
      
      processApiResponse(response);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Поиск залов по названию (с главной страницы)
  const fetchGymsByName = async (name) => {
    try {
      setLoading(true);
      // Выполняем GET запрос с параметром name
      const response = await axios.get(`http://localhost:8000/api/v1/gyms/?name=${encodeURIComponent(name)}`);
      console.log('Fetch gyms by name response:', response.data);
      
      processApiResponse(response);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Поиск залов по названию и адресу
  const fetchGymsBySearch = async (query) => {
    try {
      setLoading(true);
      // Выполняем GET запрос с параметром search
      const response = await axios.get(`http://localhost:8000/api/v1/gyms/?search=${encodeURIComponent(query)}`);
      console.log('Fetch gyms by search response:', response.data);
      
      processApiResponse(response);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Обработка ответа API
  const processApiResponse = (response) => {
    let gymsData = [];
    if (Array.isArray(response.data)) {
      gymsData = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      gymsData = response.data.results;
    }
    
    setGyms(gymsData);
    setLoading(false);
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
  const query = searchTerm.trim();
  if (query) {
      // Выполняем поиск по названию и адресу без навигации
       fetchGymsBySearch(query);
  } else {
        // Если поле поиска пустое, загружаем все залы
      fetchAllGyms();
  };
}

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
        <div className="alert alert-info">Залы не найдены</div>
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