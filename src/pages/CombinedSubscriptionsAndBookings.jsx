import React, { useState } from 'react';
import { Container, Tab, Tabs} from 'react-bootstrap';
import SubscriptionPage from './SubscriptionPage'; // Используй обновлённую версию
import BookingPage from './BookingPage'; // Используй обновлённую версию

const CombinedSubscriptionsAndBookings = () => {
  const [key, setKey] = useState('subscriptions');

  return (
    <Container className="py-5">
      <Tabs
        id="subscriptions-bookings-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-4"
      >
        <Tab eventKey="subscriptions" title="Мои абонементы">
          <SubscriptionPage />
        </Tab>
        <Tab eventKey="bookings" title="Мои бронирования">
          <BookingPage />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CombinedSubscriptionsAndBookings;
