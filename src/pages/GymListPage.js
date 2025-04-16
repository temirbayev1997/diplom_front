import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiSearch, BiX } from 'react-icons/bi';
import gymService from '../services/gymService';
import './GymListPage.css';

const GymListPage = () => {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Загрузка всех залов при монтировании компонента
  useEffect(() => {
    fetchGyms();
  }, []);

  // Обработка параметров URL при их изменении
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const nameParam = queryParams.get('name');
    const searchParam = queryParams.get('search');
    
    // Устанавливаем значение поиска из URL-параметров
    if (nameParam) {
      setSearchTerm(nameParam);
    } else if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Обновляем отфильтрованные залы при изменении поискового запроса или данных
  useEffect(() => {
    if (!gyms || !gyms.length) return;

    const queryParams = new URLSearchParams(location.search);
    const nameParam = queryParams.get('name');
    
    let filtered = [...gyms];
    
    if (searchTerm) {
      if (nameParam) {
        // Поиск только по названию, если пришли с главной страницы
        filtered = gyms.filter(gym => 
          gym.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        // Полный поиск по названию и адресу
        filtered = gyms.filter(gym => 
          gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gym.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }
    
    setFilteredGyms(filtered);
  }, [searchTerm, gyms, location.search]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const response = await gymService.getAll();
      
      // Обработка разных форматов ответа
      const gymsData = Array.isArray(response.data) ? response.data : 
                       (response.data.results ? response.data.results : []);
      
      setGyms(gymsData);
      setFilteredGyms(gymsData);
    } catch (err) {
      console.error('Error fetching gyms:', err);
      setError('Не удалось загрузить список залов');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/gyms?search=${searchTerm}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Если строка поиска пуста и мы не на начальном URL, возвращаемся
    if (!value && location.search) {
      navigate('/gyms');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    navigate('/gyms');
  };

  const handleViewGym = (gymId) => {
    navigate(`/gyms/${gymId}`);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Тренажерные залы</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <InputGroup className="search-bar shadow-sm">
              <InputGroup.Text className="bg-white border-end-0">
                <BiSearch size={20} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Поиск по названию или адресу"
                value={searchTerm}
                onChange={handleInputChange}
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
          </Form>
        </Col>
      </Row>

      {filteredGyms.length === 0 ? (
        <div className="alert alert-info">Залы не найдены</div>
      ) : (
        <Row>
          {filteredGyms.map(gym => (
            <Col key={gym.id} md={4} className="mb-4">
              <Card className="gym-card h-100">
                {gym.image ? (
                  <Card.Img 
                    variant="top" 
                    src={gym.image} 
                    style={{ height: '200px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="bg-light text-center py-5" style={{ height: '200px' }}>
                    <i className="bi bi-building" style={{ fontSize: '3rem' }}></i>
                    <p>Нет изображения</p>
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
                    onClick={() => handleViewGym(gym.id)}
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