import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar, Modal, Form } from 'react-bootstrap';
import { BiCalendarCheck, BiTime, BiCheckSquare, BiDumbbell } from 'react-icons/bi';
import { getMySubscriptions, getMembershipPlans, cancelSubscription } from '../services/subscriptionService';
import './SubscriptionPage.css';
import api from '../services/api';

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [selectedGymsByPlan, setSelectedGymsByPlan] = useState({});
  const [paymentMethodByPlan, setPaymentMethodByPlan] = useState({});

  useEffect(() => {
    fetchSubscriptions();
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const response = await api.get('/api/v1/gyms/');
      const data = Array.isArray(response.data?.results) ? response.data.results : [];
      setGyms(data);
    } catch (err) {
      console.error('Ошибка при загрузке залов:', err);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');

      const subscriptionsResponse = await getMySubscriptions();
      const data = Array.isArray(subscriptionsResponse.data?.results)
        ? subscriptionsResponse.data.results
        : [];
      setSubscriptions(data);

      const plansResponse = await getMembershipPlans();
      const plans = Array.isArray(plansResponse.data?.results)
        ? plansResponse.data.results
        : [];
      setAvailablePlans(plans);

    } catch (err) {
      console.error('Ошибка при загрузке абонементов:', err);
      setError('Не удалось загрузить информацию об абонементах');
      setSubscriptions([]);
      setAvailablePlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    const gymId = selectedGymsByPlan[planId];
    const paymentMethod = paymentMethodByPlan[planId] || 'cash';

    if (!gymId) {
      setError('Выберите зал перед оформлением абонемента.');
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const subResponse = await api.post('/api/v1/subscriptions/', {
        plan: planId,
        start_date: today,
        gym: gymId,
      });

      const subscriptionId = subResponse?.data?.id;

      if (subscriptionId) {
        await api.post(`/api/v1/payments/for-subscription/${subscriptionId}/`, {
          method: paymentMethod,
        });
      }

      await fetchSubscriptions();
    } catch (err) {
      console.error('Ошибка при оформлении абонемента:', err.response?.data || err);
      setError('Не удалось оформить абонемент. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge bg="success">Активный</Badge>;
      case 'expired': return <Badge bg="secondary">Истёк</Badge>;
      case 'cancelled': return <Badge bg="danger">Отменен</Badge>;
      default: return <Badge bg="info">{status}</Badge>;
    }
  };

  const handleShowCancelModal = (subscriptionId) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowCancelModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscriptionId) return;
    try {
      setCancelling(true);
      await cancelSubscription(selectedSubscriptionId);
      await fetchSubscriptions();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Ошибка при отмене абонемента:', err);
      setError('Не удалось отменить абонемент. Пожалуйста, попробуйте позже.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Мои абонементы</h1>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Загрузка абонементов...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row>
            {availablePlans.map(plan => (
              <Col key={plan.id} md={6} lg={4} className="mb-4">
                <Card className="plan-card">
                  <Card.Body>
                    <div className="text-center mb-3">
                      <h5>{plan.name}</h5>
                      <div className="plan-price">
                        <span className="amount">{plan.price} ₽</span>
                        <span className="period">/ {plan.duration_days} дней</span>
                      </div>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Зал</Form.Label>
                      <Form.Select
                        value={selectedGymsByPlan[plan.id] || ''}
                        onChange={(e) =>
                          setSelectedGymsByPlan(prev => ({ ...prev, [plan.id]: e.target.value }))
                        }
                      >
                        <option value="">-- Зал не выбран --</option>
                        {gyms.map(gym => (
                          <option key={gym.id} value={gym.id}>{gym.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Метод оплаты</Form.Label>
                      <Form.Select
                        value={paymentMethodByPlan[plan.id] || 'cash'}
                        onChange={(e) =>
                          setPaymentMethodByPlan(prev => ({ ...prev, [plan.id]: e.target.value }))
                        }
                      >
                        <option value="cash">Наличные</option>
                        <option value="card">Карта</option>
                        <option value="paypal">PayPal</option>
                      </Form.Select>
                    </Form.Group>
                    <Button variant="outline-primary" onClick={() => handleSubscribe(plan.id)}>
                      Оформить абонемент
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение отмены</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите отменить абонемент? Эту операцию нельзя отменить.</p>
          <p>Обратите внимание, что средства за неиспользованные дни абонемента возвращаются в соответствии с правилами возврата.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
            Нет, оставить
          </Button>
          <Button variant="danger" onClick={handleCancelSubscription} disabled={cancelling}>
            {cancelling ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Отмена...
              </>
            ) : (
              'Да, отменить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubscriptionPage;