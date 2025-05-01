import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BiLock, BiUser } from 'react-icons/bi';
import api from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/v1/users/token/', formData);
      
      // Сохраняем токен в localStorage
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        
        if (response.data.refresh) {
          localStorage.setItem('refresh', response.data.refresh);
        }
        
        // Уведомляем другие компоненты о входе
        window.dispatchEvent(new Event('storage'));
        
        // Переходим на главную страницу
        navigate('/');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      
      if (err.response && err.response.data) {
        // Обрабатываем ошибки от API
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (typeof err.response.data === 'object') {
          // Преобразуем объект ошибок в строку
          const errorMessages = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError('Произошла ошибка при входе');
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
        <Col md={6} lg={5}>
          <Card className="login-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold">Вход в систему</h3>
                <p className="text-muted">Введите свои данные для входа</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
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
                    className="login-input"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
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
                    className="login-input"
                    disabled={loading}
                  />
                </Form.Group>

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
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  Еще нет аккаунта?{' '}
                  <Link to="/register" className="text-primary fw-bold">
                    Зарегистрироваться
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

export default LoginPage;