import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Badge, Button, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchSavedCards();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/payments/');
      setPayments(Array.isArray(response.data?.results) ? response.data.results : response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка покупок');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCards = async () => {
    try {
      const res = await api.get('/api/v1/payments/saved-cards/');
      setCards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setCards([]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Оплачено</Badge>;
      case 'pending':
        return <Badge bg="warning">В ожидании</Badge>;
      case 'failed':
        return <Badge bg="danger">Ошибка</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handlePay = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setShowPayModal(true);
    setPaySuccess('');
    setSelectedCard('');
  };

  const handleConfirmPay = async () => {
    if (!selectedPaymentId || !selectedCard) return;
    setPayLoading(true);
    setPaySuccess('');
    try {
      await api.post(`/api/v1/payments/pay/${selectedPaymentId}/`, {
        saved_card_id: selectedCard,
      });
      setPaySuccess('Оплата прошла успешно!');
      fetchPayments();
      setTimeout(() => setShowPayModal(false), 1500);
    } catch (err) {
      setPaySuccess('Ошибка при оплате');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (payments.length === 0) return <Alert variant="info">Нет записей об оплате</Alert>;

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Назначение</th>
            <th>Метод</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Дата</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={payment.id}>
              <td>{index + 1}</td>
              <td>{payment.purpose || 'Не указано'}</td>
              <td>{payment.payment_method}</td>
              <td>{payment.amount}₸</td>
              <td>{getStatusBadge(payment.status)}</td>
              <td>{new Date(payment.created_at).toLocaleString()}</td>
              <td>
                {payment.status === 'pending' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handlePay(payment.id)}
                  >
                    Оплатить
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Оплата</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paySuccess && <Alert variant={paySuccess.startsWith('Ошибка') ? 'danger' : 'success'}>{paySuccess}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Выберите карту для оплаты</Form.Label>
            <Form.Select
              value={selectedCard}
              onChange={e => setSelectedCard(e.target.value)}
              disabled={payLoading}
            >
              <option value="">-- Выберите карту --</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.masked_card_number} ({card.expiry_month}/{card.expiry_year})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)} disabled={payLoading}>
            Отмена
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmPay}
            disabled={!selectedCard || payLoading}
          >
            {payLoading ? 'Оплата...' : 'Оплатить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserPayments;
