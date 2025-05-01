import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BiLock, BiUser, BiEnvelope, BiPhone } from 'react-icons/bi';
import api from '../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем, совпадают ли пароли
    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Отправляем запрос на регистрацию
      await api.post('/v1/users/register/', formData);
      
      // Показываем сообщение об успехе
      setSuccess('Регистрация прошла успешно! Сейчас вы будете перенаправлены на страницу входа.');
      
      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      
      if (err.response && err.response.data) {
        // Обрабатываем ошибки от API
        if (typeof err.response.data === 'object') {
          // Преобразуем объект ошибок в строку
          const errorMessages = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError('Произошла ошибка при регистрации');
        }
      } else {
        setError('Не удалось подключиться к серверу');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="register-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold">Регистрация</h3>
                <p className="text-muted">Создайте учетную запись для бронирования залов</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <BiUser className="me-2 text-primary" /> Имя пользователя
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Введите имя пользователя"
                        required
                        className="register-input"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <BiEnvelope className="me-2 text-primary" /> Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Введите email"
                        required
                        className="register-input"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Имя</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Введите имя"
                        className="register-input"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Фамилия</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Введите фамилию"
                        className="register-input"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <BiPhone className="me-2 text-primary" /> Телефон
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Введите номер телефона"
                    className="register-input"
                    disabled={loading}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <BiLock className="me-2 text-primary" /> Пароль
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Введите пароль"
                        required
                        className="register-input"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <BiLock className="me-2 text-primary" /> Подтверждение пароля
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        placeholder="Повторите пароль"
                        required
                        className="register-input"
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={loading}
                    className="mb-3"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Регистрация...
                      </>
                    ) : (
                      'Зарегистрироваться'
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  Уже есть аккаунт?{' '}
                  <Link to="/login" className="text-primary fw-bold">
                    Войти
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;