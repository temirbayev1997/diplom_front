import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Alert, Form, Row, Col, Card } from 'react-bootstrap';
import api from '../services/api';

const GymLoadStatusPage = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('today'); 
  const [selectedHour, setSelectedHour] = useState('current'); 
  const [selectedRange, setSelectedRange] = useState('0-3');

  
  useEffect(() => {
    fetchAvailableGyms();
  }, [selectedDay, selectedRange]);

  const hourRanges = Array.from({ length: 8 }, (_, i) => {
    const startHour = i * 3;
    const endHour = (i + 1) * 3;
    const format = (h) => h.toString().padStart(2, '0') + ':00';
    return {
      value: `${startHour}-${endHour === 24 ? 0 : endHour}`,
      label: `${format(startHour)} - ${format(endHour === 24 ? 0 : endHour)}`
    };
  });  

  const fetchAvailableGyms = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      const formatLocalDate = (dateObj) => dateObj.toLocaleDateString('en-CA');
      const todayFormatted = formatLocalDate(now);
      const tomorrowFormatted = formatLocalDate(tomorrow);
      const dateParam = selectedDay === 'today' ? todayFormatted : tomorrowFormatted;
  
      let hourParam;
      if (selectedHour === 'current') {
        hourParam = now.getHours();
      } else {
        // Если выбран диапазон
        hourParam = parseInt(selectedHour.split('-')[0], 10); // Только начало диапазона!
      }
  
      const response = await api.get('/api/v1/analytics/predictions/by-interval/', {
        params: {
          date: dateParam,
          interval: selectedRange
        },
      });      
  
      const data = Array.isArray(response.data) ? response.data : [];
      setGyms(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке загруженности залов:', err);
      setError('Не удалось загрузить данные');
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const getLoadStatusBadge = (percentage) => {
    if (percentage < 30) {
      return <Badge bg="success">Низкая загруженность</Badge>;
    } else if (percentage < 60) {
      return <Badge bg="warning">Средняя загруженность</Badge>;
    } else if (percentage < 85) {
      return <Badge bg="danger">Высокая загруженность</Badge>;
    } else {
      return <Badge bg="dark">Очень высокая загруженность</Badge>;
    }
  };
  
  const getCurrentHour = () => {
    return new Date().getHours();
  };
  
  const hoursOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: i, label: `${hour}:00` };
  });
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Статус загруженности залов</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Фильтры</h5>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>День</Form.Label>
                      <Form.Select 
                        value={selectedDay} 
                        onChange={(e) => setSelectedDay(e.target.value)}
                      >
                        <option value="today">Сегодня</option>
                        <option value="tomorrow">Завтра</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Время</Form.Label>
                      <Form.Select
                        value={selectedRange}
                        onChange={e => setSelectedRange(e.target.value)}
                      >
                        {hourRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="mb-3">Статус загруженности залов</h5>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#198754', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span>Низкая загруженность (&lt;30%)</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#ffc107', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span>Средняя загруженность (30-60%)</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#dc3545', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span>Высокая загруженность (60-85%)</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#212529', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span>Очень высокая загруженность (&gt;85%)</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Загрузка данных о залах...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : gyms.length === 0 ? (
        <Alert variant="info">Залы не найдены</Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Название зала</th>
                  <th>Адрес</th>
                  <th>Вместимость</th>
                  <th>Текущая загруженность</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {gyms.map((gym, index) => (
                  <tr key={gym.gym_id}>
                    <td>{index + 1}</td>
                    <td>{gym.gym_name}</td>
                    <td>{gym.address}</td>
                    <td>{gym.capacity} чел.</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar bg-${gym.percentage < 30 ? 'success' : gym.percentage < 60 ? 'warning' : gym.percentage < 85 ? 'danger' : 'dark'}`} 
                            role="progressbar" 
                            style={{ width: `${gym.percentage}%` }} 
                            aria-valuenow={gym.percentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2">
  {isNaN(Number(gym.predicted_load)) ? '0' : Math.round(Number(gym.predicted_load))} чел. 
  ({isNaN(Number(gym.percentage)) ? 0 : gym.percentage}%)
</span>
                      </div>
                    </td>
                    <td>{getLoadStatusBadge(gym.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default GymLoadStatusPage;