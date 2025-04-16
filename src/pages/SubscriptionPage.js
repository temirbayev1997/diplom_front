import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar, Modal } from 'react-bootstrap';
import { BiCalendarCheck, BiTime, BiCheckSquare, BiDumbbell } from 'react-icons/bi';
import { getMySubscriptions, getMembershipPlans, cancelSubscription } from '../services/subscriptionService';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Получаем активные абонементы пользователя
      const subscriptionsResponse = await getMySubscriptions();
      setSubscriptions(subscriptionsResponse.data);
      
      // Получаем доступные планы абонементов
      const plansResponse = await getMembershipPlans();
      setAvailablePlans(plansResponse.data);
    } catch (err) {
      console.error('Ошибка при загрузке абонементов:', err);
      setError('Не удалось загрузить информацию об абонементах');
    } finally {
      setLoading(false);
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Функция для расчета оставшихся дней абонемента
  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Функция для получения статуса в виде badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Активный</Badge>;
      case 'expired':
        return <Badge bg="secondary">Истёк</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Отменен</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
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
      
      // Обновляем список подписок после успешной отмены
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
          {subscriptions.length === 0 ? (
            <Card className="text-center p-4">
              <Card.Body>
                <BiDumbbell size={60} className="text-primary mb-3" />
                <h4>У вас пока нет активных абонементов</h4>
                <p className="text-muted">
                  Приобретите абонемент, чтобы получить неограниченный доступ к залам и дополнительные преимущества
                </p>
                <Button variant="primary" href="#available-plans">
                  Выбрать абонемент
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {subscriptions.map(subscription => (
                <Col key={subscription.id} md={6} lg={4} className="mb-4">
                  <Card className="subscription-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="mb-0">{subscription.plan_details?.name || 'Абонемент'}</h5>
                        {getStatusBadge(subscription.status)}
                      </div>
                      
                      {subscription.status === 'active' && (
                        <div className="text-end mb-3">
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleShowCancelModal(subscription.id)}
                          >
                            Отменить абонемент
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-muted mb-3">{subscription.gym_details?.name || 'Тренажерный зал'}</p>
                      
                      {subscription.status === 'active' && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Осталось дней: {calculateDaysLeft(subscription.end_date)}
                          </small>
                          <ProgressBar 
                            now={calculateDaysLeft(subscription.end_date)} 
                            max={subscription.plan_details?.duration_days || 30} 
                            variant="primary" 
                          />
                        </div>
                      )}
                      
                      <div className="subscription-details">
                        <div className="subscription-detail-item">
                          <BiCalendarCheck className="text-primary" />
                          <div>
                            <small className="text-muted">Срок действия</small>
                            <p>{formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}</p>
                          </div>
                        </div>
                        
                        {subscription.visits_left !== null && (
                          <div className="subscription-detail-item">
                            <BiCheckSquare className="text-primary" />
                            <div>
                              <small className="text-muted">Осталось посещений</small>
                              <p>{subscription.visits_left}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          <div id="available-plans" className="mt-5">
            <h2 className="mb-4">Доступные абонементы</h2>
            {availablePlans.length === 0 ? (
              <Alert variant="info">В данный момент нет доступных абонементов</Alert>
            ) : (
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
                        
                        <p className="text-muted mb-4">{plan.description}</p>
                        
                        <ul className="plan-features">
                          <li>
                            <BiTime className="text-primary" />
                            <span>Срок действия: {plan.duration_days} дней</span>
                          </li>
                          {plan.visits_limit && (
                            <li>
                              <BiCheckSquare className="text-primary" />
                              <span>Количество посещений: {plan.visits_limit}</span>
                            </li>
                          )}
                          <li>
                            <BiDumbbell className="text-primary" />
                            <span>Доступ ко всему оборудованию</span>
                          </li>
                        </ul>
                        
                        <div className="d-grid mt-4">
                          <Button variant="outline-primary">Оформить абонемент</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </>
      )}
      
      {/* Модальное окно подтверждения отмены абонемента */}
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
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
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