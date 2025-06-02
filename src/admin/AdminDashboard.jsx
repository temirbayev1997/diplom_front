import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge } from "react-bootstrap";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmap, setHeatmap] = useState(null);
  const [error, setError] = useState("");

  // Получаем данные
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get("analytics/admin-dashboard/stats/");
        setStats(statsRes.data);
        // (пример) для тепловой карты
        const heatmapRes = await api.get("analytics/admin-dashboard/attendance-heatmap/");
        setHeatmap(heatmapRes.data);
      } catch (err) {
        setError("Ошибка при загрузке данных аналитики");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center"><Spinner animation="border" /> Загрузка...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="py-4">
      <h1 className="mb-4">Админ-панель</h1>
      <Row className="mb-4">
        <Col md={3}><Card body>Пользователей: <strong>{stats?.total_users}</strong></Card></Col>
        <Col md={3}><Card body>Бронирований: <strong>{stats?.total_bookings}</strong></Card></Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <b>Список залов и загруженность</b>
        </Card.Header>
        <Card.Body>
          <Table striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Название зала</th>
                <th>Вместимость</th>
                <th>Текущая загруженность</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.gyms || []).map((gym, idx) => (
                <tr key={gym.name}>
                  <td>{idx + 1}</td>
                  <td>{gym.name}</td>
                  <td>{gym.capacity} чел.</td>
                  <td>
                    <Badge bg="info">{gym.current_load ?? "N/A"} чел.</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <b>Тепловая карта посещаемости</b>
        </Card.Header>
        <Card.Body>
          {!heatmap ? (
            <div>Нет данных для отображения тепловой карты</div>
          ) : (
            // ВСТАВЬ СЮДА компонент визуализации heatmap (например, твой <HeatmapPanel data={heatmap}/> )
            <pre>{JSON.stringify(heatmap, null, 2)}</pre>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminDashboard;