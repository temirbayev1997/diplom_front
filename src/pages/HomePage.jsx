import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BiSearch, BiDumbbell, BiCalendar, BiCreditCard } from 'react-icons/bi';
import api from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularGyms, setPopularGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = localStorage.getItem('token');

  // Загрузка популярных залов при первом рендере
  useEffect(() => {
    fetchPopularGyms();
  }, []);
  
  // Получение всех залов (или популярных, если будет такой фильтр на бэкенде)
  const fetchPopularGyms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/gyms/');
      
      const gymsArray = Array.isArray(response.data?.results)
        ? response.data.results
        : Array.isArray(response.data)
          ? response.data
          : [];
  
      setPopularGyms(gymsArray.slice(0, 3));
    } catch (err) {
      console.error('Ошибка при загрузке залов:', err);
      setError('Не удалось загрузить список популярных залов');
    } finally {
      setLoading(false);
    }
  };  

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      console.log('Search initiated on HomePage:', query);      
      navigate(`/gyms?search=${encodeURIComponent(query)}`);
    }
  }
  
  return (
    <Container className="mt-5">
      {!isAuthenticated && (
        <Row className="auth-banner mb-5 p-4 rounded">
          <Col md={8} className="text-center text-md-start">
            <h2 className="mb-3">Добро пожаловать в FitBooking</h2>
            <p className="lead mb-4">
              Войдите или зарегистрируйтесь, чтобы получить доступ ко всем возможностям платформы
            </p>
          </Col>
          <Col md={4} className="d-flex align-items-center justify-content-center">
            <div className="d-grid gap-2 w-100">
              <Button variant="primary" size="lg" as={Link} to="/login">
                Войти
              </Button>
              <Button variant="outline-primary" size="lg" as={Link} to="/register">
                Регистрация
              </Button>
            </div>
          </Col>
        </Row>
      )}

      <Row className="text-center mb-5">
        <Col>
          <h1>Добро пожаловать в Fitness Booking</h1>
          <p className="lead">
            Платформа для бронирования тренажерных залов с функцией прогноза загруженности
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          <Form onSubmit={handleSearch}>
            <InputGroup className="search-bar shadow-sm">
              <InputGroup.Text className="bg-white border-end-0">
                <BiSearch size={20} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Найти тренажерный зал по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
              <Button variant="primary" type="submit">
                Найти
              </Button>
            </InputGroup>
            <small className="text-muted d-block mt-2 text-center">
              Введите название зала для быстрого поиска
            </small>
          </Form>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="feature-card h-100">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div className="icon-container mb-3">
                <BiDumbbell size={40} className="text-primary" />
              </div>
              <Card.Title>Удобное бронирование</Card.Title>
              <Card.Text>
                Бронируйте залы на нужное время заранее и тренируйтесь без очередей.
              </Card.Text>
              <Button variant="outline-primary" className="mt-auto" as={Link} to="/gyms">
                Найти зал
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="feature-card h-100">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div className="icon-container mb-3">
                <BiCalendar size={40} className="text-primary" />
              </div>
              <Card.Title>Прогноз загруженности</Card.Title>
              <Card.Text>
                Узнайте, насколько загружен зал в определенное время для комфортной тренировки.
              </Card.Text>
              <Button variant="outline-primary" className="mt-auto" as={Link} to="/gym-load-status">
                Посмотреть прогноз
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="feature-card h-100">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div className="icon-container mb-3">
                <BiCreditCard size={40} className="text-primary" />
              </div>
              <Card.Title>Абонементы</Card.Title>
              <Card.Text>
                Выбирайте подходящие абонементы для регулярных тренировок и экономьте.
              </Card.Text>
              <Button variant="outline-primary" className="mt-auto" as={Link} to="/subscriptions">
                Узнать об абонементах
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Популярные залы */}
      <Row className="mb-5">
        <Col>
          <h2 className="mb-4 text-center">Популярные залы</h2>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Загрузка залов...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : popularGyms.length === 0 ? (
            <Alert variant="info">Нет доступных залов</Alert>
          ) : (
            <Row>
              {popularGyms.map(gym => (
                <Col key={gym.id} md={4} className="mb-4">
                  <Card className="gym-card h-100">
                    {gym.image ? (
                      <Card.Img variant="top" src={gym.image} style={{ height: '200px', objectFit: 'cover' }} />
                    ) : (
                      <div className="default-image d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                        <div className="text-center">
                          <BiDumbbell size={50} className="mb-2" />
                          <p>Нет изображения</p>
                        </div>
                      </div>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{gym.name}</Card.Title>
                      <Card.Text className="text-muted small">{gym.address}</Card.Text>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate(`/gyms/${gym.id}`)}
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
          <div className="text-center mt-4">
            <Button variant="outline-primary" as={Link} to="/gyms">
              Показать все залы
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <div className="cta-section p-5 text-center rounded">
            <h2 className="mb-4">Готовы начать тренировки?</h2>
            <p className="lead mb-4">Найдите подходящий зал прямо сейчас и забронируйте свое время</p>
            <Button variant="primary" size="lg" as={Link} to="/gyms">
              Найти зал
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;