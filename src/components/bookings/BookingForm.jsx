import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { BiCalendar, BiTimeFive } from 'react-icons/bi';
import api from '../../services/api';
import './BookingForm.css';

const BookingForm = ({ gymId, onSuccess, onCancel }) => {
  // Получаем текущую дату и задаем начальную дату бронирования как завтра
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    gym: gymId,
    date: tomorrowFormatted,
    start_time: '10:00',
    end_time: '11:00'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Проверяем, что время окончания позже времени начала
    if (formData.start_time >= formData.end_time) {
      setError('Время окончания должно быть позже времени начала');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/v1/bookings/', formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Ошибка при создании бронирования:', err);
      if (err.response && err.response.data) {
        // Форматируем ошибки от API
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Произошла ошибка при создании бронирования');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="d-flex align-items-center">
            <BiCalendar className="me-2 text-primary" /> Дата
          </Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={tomorrowFormatted}
            required
            className="booking-input"
          />
          <Form.Text className="text-muted">
            Бронирование доступно на любую дату начиная с завтрашнего дня
          </Form.Text>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <BiTimeFive className="me-2 text-primary" /> Время начала
              </Form.Label>
              <Form.Control
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="booking-input"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center">
                <BiTimeFive className="me-2 text-primary" /> Время окончания
              </Form.Label>
              <Form.Control
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="booking-input"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button 
            variant="outline-secondary" 
            onClick={onCancel} 
            disabled={loading}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Бронирование...' : 'Забронировать'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BookingForm;