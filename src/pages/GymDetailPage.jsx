import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs, Alert, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { BiTimeFive, BiUser, BiDumbbell, BiCalendarCheck } from 'react-icons/bi';
import gymService from '../services/gymService';
import LoadPredictionChart from '../components/analytics/LoadPredictionChart';
import LoadHeatmap from '../components/analytics/LoadHeatmap'; 
import GymRating from '../components/gyms/GymRating'; 
import BookingForm from '../components/bookings/BookingForm';
import './GymDetailPage.css';


const GymDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        setLoading(true);
        const gymResponse = await gymService.getById(id);
        setGym(gymResponse.data);
        
        const equipmentResponse = await gymService.getEquipment(id);
        setEquipment(equipmentResponse.data);
      } catch (err) {
        console.error('Ошибка при загрузке информации о зале:', err);
        setError('Не удалось загрузить информацию о зале');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGymDetails();
    }
  }, [id]);

  const handleBookingClick = () => {
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    // Показываем сообщение об успешном бронировании
    alert('Бронирование успешно создано!');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка информации о зале...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/gyms')}>
          Вернуться к списку залов
        </Button>
      </Container>
    );
  }

  if (!gym) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Зал не найден</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/gyms')}>
          Вернуться к списку залов
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <div className="mb-4">
            <h1>{gym.name}</h1>
            <p className="text-muted">{gym.address}</p>
          </div>
          <Card className="main-image-card mb-4">
          {gym.image_url ? (
            <Card.Img 
            src={gym.image_url} 
            alt={gym.name} 
            className="gym-main-image"
            />
            ) : (
              <div className="default-main-image d-flex align-items-center justify-content-center">
                <BiDumbbell size={64} />
                <p>Изображение отсутствует</p>
              </div>
            )}
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <Row className="mb-4">
                <Col md={4} className="text-center border-end">
                  <BiTimeFive size={24} className="text-primary mb-2" />
                  <h5>Часы работы</h5>
                  <p className="mb-0">{gym.opening_time.slice(0, 5)} - {gym.closing_time.slice(0, 5)}</p>
                </Col>
                <Col md={4} className="text-center border-end">
                  <BiUser size={24} className="text-primary mb-2" />
                  <h5>Вместимость</h5>
                  <p className="mb-0">{gym.capacity} человек</p>
                </Col>
                <Col md={4} className="text-center">
                  <BiCalendarCheck size={24} className="text-primary mb-2" />
                  <h5>Загруженность</h5>
                  <Badge bg="success" className="px-3 py-2">Низкая</Badge>
                </Col>
              </Row>
              
              <h4>О зале</h4>
              <p>{gym.description || 'Описание отсутствует'}</p>
              
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleBookingClick}
                  disabled={showBookingForm}
                >
                  Забронировать место
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate(`/subscriptions?gym=${id}`)}
                  className="mt-2"
                >
                  Купить абонемент
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {showBookingForm && (
            <Card className="mb-4 booking-form-card">
              <Card.Body>
                <h4>Новое бронирование</h4>
                <BookingForm 
                  gymId={id} 
                  onSuccess={handleBookingSuccess}
                  onCancel={() => setShowBookingForm(false)}
                />
              </Card.Body>
            </Card>
          )}
          
          {/* Добавляем компонент рейтинга */}
          <GymRating gymId={id} />
        </Col>
        
        <Col lg={4}>
          <Tabs defaultActiveKey="prediction" className="mb-3">
            <Tab eventKey="prediction" title="Загруженность">
              <Card className="side-card">
                <Card.Body>
                  <h5>Прогноз загруженности</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Выберите дату</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </Form.Group>
                  <LoadPredictionChart 
                    gymId={id} 
                    date={selectedDate} 
                  />
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="heatmap" title="Тепловая карта">
              <Card className="side-card">
                <Card.Body>
                  <LoadHeatmap gymId={id} />
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="equipment" title="Оборудование">
            <Card className="side-card">
  <Card.Body>
    <h5>Доступное оборудование</h5>
    {!Array.isArray(equipment) || equipment.length === 0 ? (
      <Alert variant="info">Информация об оборудовании отсутствует</Alert>
    ) : (
      <div className="equipment-list">
        {equipment.map(item => (
          <div key={item.id} className="equipment-item d-flex justify-content-between align-items-center p-2 border-bottom">
            <div>
              <p className="mb-0 fw-bold">{item.name}</p>
              {item.description && <p className="small text-muted mb-0">{item.description}</p>}
            </div>
            <Badge bg="secondary">{item.quantity} шт.</Badge>
          </div>
        ))}
      </div>
    )}
  </Card.Body>
</Card>

            </Tab>
          </Tabs>
          
          <Card className="mt-3 side-card">
            <Card.Body>
              <h5>Рекомендации</h5>
              <ul className="recommendation-list">
                <li>Лучшее время для посещения: 10:00 - 12:00</li>
                <li>Наименее загруженные дни: вторник, четверг</li>
                <li>Не забудьте взять полотенце и воду</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GymDetailPage;