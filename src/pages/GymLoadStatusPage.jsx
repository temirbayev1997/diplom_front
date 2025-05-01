import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Alert, Form, Row, Col, Card } from 'react-bootstrap';
import api from '../services/api';

const GymLoadStatusPage = () => {
  const [gyms, setGyms] = useState([]);
  const [loadData, setLoadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('today'); // today, tomorrow, week
  const [selectedHour, setSelectedHour] = useState('current'); // current or specific hour
  
  useEffect(() => {
    // Fetch gyms list
    fetchGyms();
  }, []);
  
  useEffect(() => {
    // When gyms are loaded, fetch prediction data
    if (gyms.length > 0) {
      fetchPredictions();
    }
  }, [gyms, selectedDay, selectedHour]);
  
  const fetchGyms = async () => {
    try {
      setLoading(true);
      // Используем правильный URL для получения списка залов
      const response = await api.get('/api/v1/gyms/gyms/');
      
      if (response.data) {
        console.log('Gym data received:', response.data);
        setGyms(Array.isArray(response.data) ? response.data : []);
      } else {
        setGyms([]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке залов:', err);
      setError('Не удалось загрузить список залов');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      
      // Get current date and time for filtering
      const now = new Date();
      const currentHour = now.getHours();
      const todayFormatted = now.toISOString().split('T')[0];
      
      // Calculate tomorrow's date
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
      
      // Determine which hour to show
      let hourFilter = currentHour;
      if (selectedHour !== 'current') {
        hourFilter = parseInt(selectedHour, 10);
      }
      
      // Fetch predictions for all gyms
      const loadDataMap = {};
      
      // Create requests for all gyms in parallel
      const requests = gyms.map(gym => 
        // Используем прямой путь к API прогнозов
        api.get(`/api/v1/analytics/predictions/gym/${gym.id}/date/${selectedDay === 'today' ? todayFormatted : tomorrowFormatted}/`)
      );
      
      console.log('Sending prediction requests for gyms:', gyms.map(g => g.id));
      
      // Execute all requests in parallel
      const responses = await Promise.all(requests);
      
      // Process responses
      responses.forEach((response, index) => {
        const gymId = gyms[index].id;
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Received data for gym ${gymId}:`, response.data);
          
          // Filter data for the selected hour
          const hourData = response.data.find(item => item.hour === hourFilter);
          
          if (hourData) {
            loadDataMap[gymId] = {
              predicted_load: hourData.predicted_load,
              capacity: gyms[index].capacity,
              percentage: Math.round((hourData.predicted_load / gyms[index].capacity) * 100)
            };
          }
        }
      });
      
      console.log('Processed load data:', loadDataMap);
      setLoadData(loadDataMap);
    } catch (err) {
      console.error('Ошибка при загрузке данных загруженности:', err);
      setError('Не удалось загрузить данные о загруженности залов');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to get status badge based on percentage
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
  
  // Function to get current hour (for default selection)
  const getCurrentHour = () => {
    return new Date().getHours();
  };
  
  // Generate hours array for the select input
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
                        value={selectedHour} 
                        onChange={(e) => setSelectedHour(e.target.value)}
                      >
                        <option value="current">Текущий час ({getCurrentHour()}:00)</option>
                        {hoursOptions.map(hour => (
                          <option key={hour.value} value={hour.value}>{hour.label}</option>
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
              <h5 className="mb-3">Легенда</h5>
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
                {gyms.map((gym, index) => {
                  const gymLoad = loadData[gym.id] || { predicted_load: 0, percentage: 0 };
                  
                  return (
                    <tr key={gym.id}>
                      <td>{index + 1}</td>
                      <td>{gym.name}</td>
                      <td>{gym.address}</td>
                      <td>{gym.capacity} чел.</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${gymLoad.percentage < 30 ? 'success' : gymLoad.percentage < 60 ? 'warning' : gymLoad.percentage < 85 ? 'danger' : 'dark'}`} 
                              role="progressbar" 
                              style={{ width: `${gymLoad.percentage}%` }} 
                              aria-valuenow={gymLoad.percentage} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <span className="ms-2">{Math.round(gymLoad.predicted_load)} чел. ({gymLoad.percentage}%)</span>
                        </div>
                      </td>
                      <td>{getLoadStatusBadge(gymLoad.percentage)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default GymLoadStatusPage;