// src/components/analytics/PersonalRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { BiCalendar, BiTimeFive, BiBuilding, BiUser } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PersonalRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/analytics/recommendations/');
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error('Ошибка при загрузке рекомендаций:', err);
      setError('Не удалось загрузить персональные рекомендации');
    } finally {
      setLoading(false);
    }
  };

  const handleGymClick = (gymId) => {
    navigate(`/gyms/${gymId}`);
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  const getLoadBadge = (percentage) => {
    if (percentage < 30) {
      return <Badge bg="success">Низкая загрузка</Badge>;
    } else if (percentage < 60) {
      return <Badge bg="warning">Средняя загрузка</Badge>;
    } else if (percentage < 85) {
      return <Badge bg="danger">Высокая загрузка</Badge>;
    } else {
      return <Badge bg="dark">Очень высокая загрузка</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка рекомендаций...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (recommendations.length === 0) {
    return (
      <Alert variant="info">
        У нас пока недостаточно данных для формирования персональных рекомендаций.
        <br />
        Совершите несколько бронирований, чтобы мы могли подобрать для вас оптимальное время.
      </Alert>
    );
  }

  return (
    <div className="personal-recommendations">
      <h5 className="mb-3">Персональные рекомендации</h5>
      
      <Row>
        {recommendations.slice(0, 3).map((recommendation, index) => (
          <Col lg={4} md={6} key={index} className="mb-3">
            <Card className="h-100 recommendation-card">
              <Card.Body>
                <Card.Title className="mb-3">
                  {recommendation.gym_name}
                  {recommendation.rating && (
                    <span className="ms-2 text-warning">
                      {recommendation.rating} ★
                    </span>
                  )}
                </Card.Title>
                
                <div className="recommendation-details">
                  <div className="detail-item d-flex align-items-center mb-2">
                    <BiCalendar className="text-primary me-2" />
                    <div>
                      <small className="text-muted d-block">Дата</small>
                      <div>{formatDate(recommendation.date)}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item d-flex align-items-center mb-2">
                    <BiTimeFive className="text-primary me-2" />
                    <div>
                      <small className="text-muted d-block">Время</small>
                      <div>{recommendation.hour}:00 - {recommendation.hour + 1}:00</div>
                    </div>
                  </div>
                  
                  <div className="detail-item d-flex align-items-center mb-3">
                    <BiUser className="text-primary me-2" />
                    <div>
                      <small className="text-muted d-block">Загруженность</small>
                      <div>
                        {getLoadBadge(recommendation.capacity_percentage)}
                        <small className="ms-2 text-muted">
                          {Math.round(recommendation.predicted_load)} чел. ({recommendation.capacity_percentage}%)
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => handleGymClick(recommendation.gym_id)}
                  >
                    Перейти к залу
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {recommendations.length > 3 && (
        <div className="text-center mt-3">
          <Button variant="link" onClick={() => setRecommendations(recommendations)}>
            Показать больше рекомендаций
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonalRecommendations;