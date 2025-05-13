import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { BiCalendar, BiTime, BiBuilding, BiX } from 'react-icons/bi';
import api from '../services/api';
import './BookingPage.css';

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/v1/bookings/my-bookings/');
      
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data.results) ? response.data.results : []);
  
      setBookings(bookingsData);
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err);
      setError('Не удалось загрузить данные о бронированиях. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">В ожидании</Badge>;
      case 'confirmed':
        return <Badge bg="success">Подтверждено</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Отменено</Badge>;
      case 'completed':
        return <Badge bg="secondary">Завершено</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  const handleShowCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;
    
    try {
      setCancellingBooking(true);
      await api.patch(`api/v1/bookings/${selectedBookingId}/`, { status: 'cancelled' });
      
      // Обновляем список бронирований после успешной отмены
      fetchBookings();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Ошибка при отмене бронирования:', err);
      setError('Не удалось отменить бронирование. Пожалуйста, попробуйте позже.');
    } finally {
      setCancellingBooking(false);
    }
  };

  // Проверка наличия бронирований для отображения
  const hasActiveBookings = bookings.filter(booking => booking.status !== 'cancelled').length > 0;

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Мои бронирования</h1>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Загрузка ваших бронирований...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : bookings.length === 0 ? (
        <Alert variant="info">
          У вас пока нет бронирований. 
          <Button variant="link" href="/gyms">Найти зал для бронирования</Button>
        </Alert>
      ) : (
        <>
          <Row>
            <Col md={12} lg={8} className="mb-4">
              <h5 className="mb-3">Активные бронирования</h5>
              {!hasActiveBookings ? (
                <Alert variant="info">У вас нет активных бронирований</Alert>
              ) : (
                bookings
                  .filter(booking => booking.status !== 'cancelled')
                  .map(booking => (
                    <Card key={booking.id} className="mb-3 booking-card">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5>{booking.gym_details?.name || 'Зал'}</h5>
                            {getStatusBadge(booking.status)}
                          </div>
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleShowCancelModal(booking.id)}
                            >
                              <BiX /> Отменить
                            </Button>
                          )}
                        </div>
                        
                        <hr />
                        
                        <Row className="mt-3">
                          <Col md={4} className="mb-2">
                            <div className="d-flex align-items-center">
                              <BiCalendar className="text-primary me-2" />
                              <div>
                                <small className="text-muted d-block">Дата</small>
                                <div>{formatDate(booking.date)}</div>
                              </div>
                            </div>
                          </Col>
                          <Col md={4} className="mb-2">
                            <div className="d-flex align-items-center">
                              <BiTime className="text-primary me-2" />
                              <div>
                                <small className="text-muted d-block">Время</small>
                                <div>{booking.start_time?.slice(0, 5) || '00:00'} - {booking.end_time?.slice(0, 5) || '00:00'}</div>
                              </div>
                            </div>
                          </Col>
                          <Col md={4} className="mb-2">
                            <div className="d-flex align-items-center">
                              <BiBuilding className="text-primary me-2" />
                              <div>
                                <small className="text-muted d-block">Адрес</small>
                                <div>{booking.gym_details?.address || 'Адрес не указан'}</div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
              )}
            </Col>
            
            <Col md={12} lg={4}>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">История бронирований</h5>
                  {bookings
                    .filter(booking => booking.status === 'cancelled' || booking.status === 'completed')
                    .length === 0 ? (
                    <p className="text-muted">История бронирований пуста</p>
                  ) : (
                    bookings
                      .filter(booking => booking.status === 'cancelled' || booking.status === 'completed')
                      .map(booking => (
                        <div key={booking.id} className="mb-3 border-bottom pb-2">
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="fw-bold">{booking.gym_details?.name || 'Зал'}</div>
                              <small>{formatDate(booking.date)}</small>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      
      {/* Модальное окно подтверждения отмены бронирования */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение отмены</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите отменить бронирование? Эту операцию нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancellingBooking}>
            Нет, оставить
          </Button>
          <Button variant="danger" onClick={handleCancelBooking} disabled={cancellingBooking}>
            {cancellingBooking ? 'Отмена бронирования...' : 'Да, отменить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingPage;