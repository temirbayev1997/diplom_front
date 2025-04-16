import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BiSearch, BiDumbbell, BiCalendar, BiCreditCard } from 'react-icons/bi';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const isAuthenticated = localStorage.getItem('token');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/gyms?name=${searchQuery}`);
  };
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
            <div className="d-grid gap-2 w-75">
              <Button variant="outline-primary" size="lg" as={Link} to="/login">
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
              <Button variant="outline-primary" className="mt-auto" as={Link} to="/gyms">
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