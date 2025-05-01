// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import { BiBarChart, BiUser, BiCalendar, BiDumbbell, BiPlus, BiEdit, BiTrash } from 'react-icons/bi';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import analyticsService from '../services/analyticsService';

// Импорты для настройки Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gymData, setGymData] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    if (selectedGym) {
      fetchStatistics();
      fetchChartData();
    }
  }, [selectedGym, dateRange]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/gyms/');
      setGymData(response.data);
      if (response.data.length > 0) {
        setSelectedGym(response.data[0].id);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных залов:', err);
      setError('Не удалось загрузить список залов');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!selectedGym) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/v1/analytics/extended-analytics/?type=general&gym=${selectedGym}&days=${dateRange}`);
      setStatistics(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      setError('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    if (!selectedGym) return;

    try {
      setLoading(true);
      // Получаем данные по дням
      const dailyResponse = await api.get(`/api/v1/analytics/extended-analytics/?type=daily&gym=${selectedGym}&days=${dateRange}`);
      
      // Форматируем данные для графика
      const labels = dailyResponse.data.map(item => item.date);
      const visitors = dailyResponse.data.map(item => item.total_visitors);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Количество посетителей',
            data: visitors,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ],
      });
    } catch (err) {
      console.error('Ошибка при загрузке данных для графика:', err);
      setError('Не удалось загрузить данные для графика');
    } finally {
      setLoading(false);
    }
  };

  // Изменение выбранного зала
  const handleGymChange = (e) => {
    setSelectedGym(e.target.value);
  };

  // Изменение диапазона дат
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  if (loading && !gymData.length) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Загрузка данных...</p>
      </Container>
    );
  }

  if (error && !gymData.length) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Панель администратора</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Выберите зал</Form.Label>
            <Form.Select value={selectedGym || ''} onChange={handleGymChange}>
              {gymData.map(gym => (
                <option key={gym.id} value={gym.id}>{gym.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Период анализа</Form.Label>
            <Form.Select value={dateRange} onChange={handleDateRangeChange}>
              <option value="7">Последние 7 дней</option>
              <option value="30">Последние 30 дней</option>
              <option value="90">Последние 3 месяца</option>
              <option value="180">Последние 6 месяцев</option>
              <option value="365">Последний год</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Tab.Container id="admin-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row>
          <Col md={3} lg={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="d-flex align-items-center">
                  <BiBarChart className="me-2" /> Обзор
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="bookings" className="d-flex align-items-center">
                  <BiCalendar className="me-2" /> Бронирования
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users" className="d-flex align-items-center">
                  <BiUser className="me-2" /> Пользователи
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="gyms" className="d-flex align-items-center">
                  <BiDumbbell className="me-2" /> Управление залами
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          
          <Col md={9} lg={10}>
            <Tab.Content>
              {/* Обзор */}
              <Tab.Pane eventKey="overview">
                <h2 className="mb-4">Обзор</h2>
                
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <>
                    <Row className="mb-4">
                      <Col md={4}>
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h3 className="display-4">{statistics?.total_visits || 0}</h3>
                            <p className="text-muted">Всего посещений</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h3 className="display-4">{statistics?.daily_average?.toFixed(1) || 0}</h3>
                            <p className="text-muted">Среднее за день</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center h-100">
                          <Card.Body>
                            <h3 className="display-4">{statistics?.busiest_hour || '-'}</h3>
                            <p className="text-muted">Самый загруженный час</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Card className="mb-4">
                      <Card.Body>
                        <Card.Title>Динамика посещаемости</Card.Title>
                        {chartData ? (
                          <Line 
                            data={chartData} 
                            options={{
                              responsive: true,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                },
                              },
                            }}
                          />
                        ) : (
                          <Alert variant="info">Нет данных для отображения графика</Alert>
                        )}
                      </Card.Body>
                    </Card>
                  </>
                )}
              </Tab.Pane>
              
              {/* Бронирования */}
              <Tab.Pane eventKey="bookings">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Бронирования</h2>
                  <Button variant="outline-primary">
                    <BiPlus className="me-1" /> Новое бронирование
                  </Button>
                </div>
                
                <Card>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Пользователь</th>
                          <th>Дата</th>
                          <th>Время</th>
                          <th>Статус</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>user123</td>
                          <td>2023-04-25</td>
                          <td>15:00-16:00</td>
                          <td><span className="badge bg-success">Подтверждено</span></td>
                          <td>
                            <Button variant="link" size="sm" className="text-primary p-0 me-2">
                              <BiEdit />
                            </Button>
                            <Button variant="link" size="sm" className="text-danger p-0">
                              <BiTrash />
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>sportuser</td>
                          <td>2023-04-26</td>
                          <td>11:00-12:30</td>
                          <td><span className="badge bg-warning">В ожидании</span></td>
                          <td>
                            <Button variant="link" size="sm" className="text-primary p-0 me-2">
                              <BiEdit />
                            </Button>
                            <Button variant="link" size="sm" className="text-danger p-0">
                              <BiTrash />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              {/* Пользователи */}
              <Tab.Pane eventKey="users">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Пользователи</h2>
                  <Button variant="outline-primary">
                    <BiPlus className="me-1" /> Добавить пользователя
                  </Button>
                </div>
                
                <Card>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Имя пользователя</th>
                          <th>Email</th>
                          <th>Имя</th>
                          <th>Статус</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>john_doe</td>
                          <td>john@example.com</td>
                          <td>Иван Иванов</td>
                          <td><span className="badge bg-success">Активен</span></td>
                          <td>
                            <Button variant="link" size="sm" className="text-primary p-0 me-2">
                              <BiEdit />
                            </Button>
                            <Button variant="link" size="sm" className="text-danger p-0">
                              <BiTrash />
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>maria_s</td>
                          <td>maria@example.com</td>
                          <td>Мария Сидорова</td>
                          <td><span className="badge bg-success">Активен</span></td>
                          <td>
                            <Button variant="link" size="sm" className="text-primary p-0 me-2">
                              <BiEdit />
                            </Button>
                            <Button variant="link" size="sm" className="text-danger p-0">
                              <BiTrash />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              {/* Управление залами */}
              <Tab.Pane eventKey="gyms">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Управление залами</h2>
                  <Button variant="outline-primary">
                    <BiPlus className="me-1" /> Добавить зал
                  </Button>
                </div>
                
                <Card>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Название</th>
                          <th>Адрес</th>
                          <th>Вместимость</th>
                          <th>Часы работы</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gymData.map((gym, index) => (
                          <tr key={gym.id}>
                            <td>{index + 1}</td>
                            <td>{gym.name}</td>
                            <td>{gym.address}</td>
                            <td>{gym.capacity}</td>
                            <td>{gym.opening_time?.slice(0, 5)} - {gym.closing_time?.slice(0, 5)}</td>
                            <td>
                              <Button variant="link" size="sm" className="text-primary p-0 me-2">
                                <BiEdit />
                              </Button>
                              <Button variant="link" size="sm" className="text-danger p-0">
                                <BiTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AdminDashboard;