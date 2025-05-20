import React, { useState, useEffect } from 'react';
import { Container, Tab, Tabs, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const SubscriptionsPage = () => {
  const [tab, setTab] = useState('all');
  // Мои абонементы
  const [mySubs, setMySubs] = useState([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myError, setMyError] = useState('');
  // Актуальные абонементы
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialGymId = params.get('gym');
  const [selectedGym, setSelectedGym] = useState(initialGymId || '');
  const [gyms, setGyms] = useState([]);
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  
  // Покупка
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyPlanId, setBuyPlanId] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    fetchMySubscriptions();
    fetchPlans();
    fetchGyms();
  }, []);

  useEffect(() => {
    if (showBuyModal && paymentMethod === 'card') {
      fetchSavedCards();
    }
  }, [showBuyModal, paymentMethod]);
  
  const fetchSavedCards = async () => {
    try {
      const res = await api.get('/api/v1/payments/saved-cards/');
      setSavedCards(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSavedCards([]);
    }
  };
  
  const fetchGyms = async () => {
    try {
      const res = await api.get('/api/v1/gyms/');
      setGyms(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch {
      setGyms([]);
    }
  };

  const fetchMySubscriptions = async () => {
    setMyLoading(true); setMyError('');
    try {
      const res = await api.get('/api/v1/subscriptions/my-subscriptions/');
      setMySubs(Array.isArray(res.data?.results) ? res.data.results : res.data);
    } catch {
      setMyError('Ошибка при загрузке моих абонементов');
    } finally {
      setMyLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true); setPlansError('');
    try {
      const res = await api.get('/api/v1/subscriptions/membership-plans/');
      setPlans(Array.isArray(res.data?.results) ? res.data.results : res.data);
    } catch {
      setPlansError('Ошибка при загрузке планов');
    } finally {
      setPlansLoading(false);
    }
  };

  // Открыть модалку покупки с выбранным абонементом
  const handleBuy = (planId) => {
    setBuyPlanId(planId);
    setShowBuyModal(true);
    setBuyError('');
  };

  // Купить абонемент
  const handleConfirmBuy = async () => {
    if (!buyPlanId || !selectedGym) {
      setBuyError('Выберите зал!');
      return;
    }
    setBuyLoading(true);
    setBuyError('');
    try {
      await api.post('/api/v1/subscriptions/', {
        plan: buyPlanId,
        gym: selectedGym,
        start_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        saved_card_id: paymentMethod === 'card' ? selectedCard : null
      });
      setShowBuyModal(false);
      fetchMySubscriptions(); // обновить "Мои абонементы"
      // Редиректим на страницу зала:
      navigate('/profile', { state: { tab: 'payments' } });
    } catch (e) {
      setBuyError('Ошибка при покупке абонемента');
    } finally {
      setBuyLoading(false);
    }
  };

  // ---- ОТРИСОВКА ----

  const renderMySubscriptions = () => {
    if (myLoading) return <Spinner animation="border" />;
    if (myError) return <Alert variant="danger">{myError}</Alert>;
    if (!mySubs.length) return <Alert variant="info">У вас нет активных абонементов</Alert>;
    return (
      <Row>
        {mySubs.map(sub => (
          <Col key={sub.id} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <h5>{sub.plan_details?.name || 'Абонемент'}</h5>
                <div>Зал: {sub.gym_details?.name || '-'}</div>
                <div>Период: {sub.start_date} — {sub.end_date}</div>
                <div>Статус: <b>{sub.status === 'active' ? 'Активный' : sub.status === 'expired' ? 'Истёк' : 'Отменен'}</b></div>
                <div>Осталось посещений: {sub.visits_left ?? '∞'}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderPlans = () => {
    if (plansLoading) return <Spinner animation="border" />;
    if (plansError) return <Alert variant="danger">{plansError}</Alert>;
    if (!plans.length) return <Alert variant="info">Нет доступных абонементов</Alert>;
    return (
      <Row>
        {plans.map(plan => (
          <Col key={plan.id} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <h5>{plan.name}</h5>
                <div>Цена: {plan.price}₸</div>
                <div>Длительность: {plan.duration_days} дней</div>
                <div>Лимит посещений: {plan.visits_limit ?? 'Безлимит'}</div>
                <div className="mt-3">
                  <Button variant="outline-primary" onClick={() => handleBuy(plan.id)}>
                    Купить
                  </Button>
                </div>
                <div className="mt-2 text-muted small">{plan.description}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Модалка покупки абонемента
  const renderBuyModal = () => (
    <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Купить абонемент</Modal.Title>
      </Modal.Header>
      <Modal.Body>
  <Form.Group className="mb-3">
    <Form.Label>Зал</Form.Label>
    <Form.Select
      value={selectedGym}
      onChange={e => setSelectedGym(e.target.value)}
      disabled={!!initialGymId}
    >
      <option value="">-- Выберите зал --</option>
      {gyms.map(gym => (
        <option key={gym.id} value={gym.id}>
          {gym.name}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label>Метод оплаты</Form.Label>
    <Form.Select
      value={paymentMethod}
      onChange={e => setPaymentMethod(e.target.value)}
    >
      <option value="cash">Наличные</option>
      <option value="card">Карта</option>
      <option value="paypal">PayPal</option>
    </Form.Select>
  </Form.Group>
  {paymentMethod === 'card' && (
    <Form.Group className="mb-3">
      <Form.Label>Выберите сохранённую карту</Form.Label>
      <Form.Select
        value={selectedCard}
        onChange={e => setSelectedCard(e.target.value)}
      >
        <option value="">-- Выберите карту --</option>
        {savedCards.map(card => (
          <option key={card.id} value={card.id}>
            {card.masked_card_number} ({card.expiry_month}/{card.expiry_year})
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  )}
  {buyError && <Alert variant="danger">{buyError}</Alert>}
</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleConfirmBuy} disabled={buyLoading}>
          {buyLoading ? 'Покупаем...' : 'Купить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <Container className="">
      <Tabs activeKey={tab} onSelect={setTab} className="mb-4">
        <Tab eventKey="my" title="Мои абонементы">
          {renderMySubscriptions()}
        </Tab>
        <Tab eventKey="all" title="Актуальные абонементы">
          {renderPlans()}
        </Tab>
      </Tabs>
      {renderBuyModal()}
    </Container>
  );
};

export default SubscriptionsPage;
