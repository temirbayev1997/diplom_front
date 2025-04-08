import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container className="mt-5">
      <Row className="text-center mb-5">
        <Col>
          <h1>Добро пожаловать в Fitness Booking</h1>
          <p className="lead">
            Платформа для бронирования тренажерных залов с функцией прогноза загруженности
          </p>
          <Link to="/gyms">
            <Button variant="primary" size="lg">Найти зал</Button>
          </Link>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Удобное бронирование</Card.Title>
              <Card.Text>
                Бронируйте залы на нужное время заранее и тренируйтесь без очередей.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Прогноз загруженности</Card.Title>
              <Card.Text>
                Узнайте, насколько загружен зал в определенное время для комфортной тренировки.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Абонементы</Card.Title>
              <Card.Text>
                Выбирайте подходящие абонементы для регулярных тренировок и экономьте.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;