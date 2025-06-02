import React, { useEffect, useState } from "react";
import { fetchAttendanceHeatmap } from "../services/adminApi";

export default function HeatmapPanel({ gymId, gymName, onClose }) {
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHeatmap(gymId)
      .then(res => setHeatmap(res.data))
      .finally(() => setLoading(false));
  }, [gymId]);

  if (loading) return <div>Загрузка тепловой карты...</div>;

  // Можно использовать библиотеку, например, react-heatmap-grid, или отрендерить как таблицу:
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <b>Тепловая карта по: {gymName}</b>
        <button className="btn btn-danger btn-sm" onClick={onClose}>X</button>
      </div>
      <div className="card-body">
        <pre style={{ maxHeight: 300, overflow: "auto" }}>
          {JSON.stringify(heatmap, null, 2)}
        </pre>
        {/* TODO: Можно добавить красивую визуализацию */}
      </div>
    </div>
  );
}
