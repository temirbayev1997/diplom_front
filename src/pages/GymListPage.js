import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { gymService } from '../services/api';
const GymListPage = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        setLoading(true);
        const response = await gymService.getAll();
        
        // Проверяем структуру ответа
        console.log('API response:', response);
        
        // Обработка разных форматов ответа
        const gymsData = Array.isArray(response.data) ? response.data : 
                         (response.data.results ? response.data.results : []);
        
        setGyms(gymsData);
      } catch (err) {
        console.error('Error fetching gyms:', err);
        setError('Не удалось загрузить список залов');
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  // Убедитесь, что gyms - это массив перед фильтрацией
  const filteredGyms = Array.isArray(gyms) 
    ? gyms.filter(gym => 
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        gym.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
          <InputGroup>
            <Form.Control
              placeholder="Поиск по названию или адресу"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                Очистить
              </Button>
            )}
          </InputGroup>
        </Col>
      </Row>

      {filteredGyms.length === 0 ? (
        <div className="alert alert-info">Залы не найдены</div>
      ) : (
        <Row>
          {filteredGyms.map(gym => (
            <Col key={gym.id} md={4} className="mb-4">
              <Card>
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
                <Card.Body>
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