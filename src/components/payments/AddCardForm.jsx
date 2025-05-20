import React, { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import api from '../../services/api';

const AddCardForm = ({ onCardAdded }) => {
  const [form, setForm] = useState({
    cardholder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/v1/payments/save-card/', form);
      setSuccess('Карта успешно сохранена!');
      setForm({ cardholder_name: '', card_number: '', expiry_month: '', expiry_year: '' });
      if (onCardAdded) onCardAdded();
    } catch (err) {
      setError('Ошибка при сохранении карты');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label>Владелец карты</Form.Label>
            <Form.Control name="cardholder_name" value={form.cardholder_name} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label>Номер карты</Form.Label>
            <Form.Control name="card_number" value={form.card_number} onChange={handleChange} required maxLength={16} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label>Месяц окончания</Form.Label>
            <Form.Control name="expiry_month" value={form.expiry_month} onChange={handleChange} required type="number" min="1" max="12" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-2">
            <Form.Label>Год окончания</Form.Label>
            <Form.Control name="expiry_year" value={form.expiry_year} onChange={handleChange} required type="number" min="2024" />
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? 'Сохраняем...' : 'Сохранить карту'}
      </Button>
    </Form>
  );
};

export default AddCardForm;
