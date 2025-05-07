import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
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
import analyticsService from '../../services/analyticsService';

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

const LoadPredictionChart = ({ gymId, date }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getPredictions(gymId, date);
        const data = Array.isArray(response.data) ? response.data : [];
        setPredictionData(data);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Не удалось загрузить прогноз загруженности');
        setPredictionData([]); // <--- важно!
      } finally {
        setLoading(false);
      }
    };
  
    if (gymId && date) {
      fetchPredictions();
    }
  }, [gymId, date]);
  

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!predictionData || predictionData.length === 0) {
    return <Alert variant="info">Нет данных о загруженности на выбранную дату</Alert>;
  }

  // Подготовка данных для графика
  const chartData = {
    labels: (predictionData || []).map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Прогнозируемая загруженность',
        data: (predictionData || []).map(item => item.predicted_load),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Прогноз загруженности на ${date}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Количество посетителей',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LoadPredictionChart;