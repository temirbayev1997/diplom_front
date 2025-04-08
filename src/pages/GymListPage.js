import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { BiSearch, BiTimeFive, BiUser, BiStar, BiDumbbell } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GymListPage.css';

const GymListPage = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        setLoading(true);
        const response = await api.get('/gyms/');
        setGyms(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке залов:', err);
        setError('Не удалось загрузить список залов');
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  // Фильтрация залов по поисковому запросу
  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gym.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGymSelect = (id) => {
    navigate(`/gyms/${id}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка тренажерных залов...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Тренажерные залы</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <BiSearch />
            </InputGroup.Text>
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
        <div className="alert alert-info">
          Залы не найдены. Попробуйте изменить параметры поиска.
        </div>
      ) : (
        <Row>
          {filteredGyms.map(gym => (
            <Col key={gym.id} lg={4} md={6} className="mb-4">
              <Card className="gym-card h-100" onClick={() => handleGymSelect(gym.id)}>
                <div className="gym-card-image">
                  {gym.image ? (
                    <Card.Img variant="top" src={gym.image} alt={gym.name} />
                  ) : (
                    <div className="default-image d-flex align-items-center justify-content-center">
                      <BiDumbbell size={48} />
                    </div>
                  )}
                </div>
                <Card.Body>
                  <Card.Title>{gym.name}</Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    <i className="bi bi-geo-alt me-1"></i> {gym.address}
                  </Card.Text>
                  
                  <div className="d-flex align-items-center mb-2">
                    <BiTimeFive className="me-1 text-primary" />
                    <span className="small">
                      {gym.opening_time.slice(0, 5)} - {gym.closing_time.slice(0, 5)}
                    </span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-3">
                    <BiUser className="me-1 text-primary" />
                    <span className="small">Вместимость: {gym.capacity} чел.</span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex align-items-center">
                      <BiStar className="text-warning" />
                      <span className="ms-1 fw-bold">4.8</span>
                      <span className="text-muted small ms-1">(42 отзыва)</span>
                    </div>
                    
                    <Badge bg="info" className="load-badge">
                      Низкая загруженность
                    </Badge>
                  </div>
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