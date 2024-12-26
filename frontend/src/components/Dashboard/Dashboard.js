import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  // Extraer boardId desde la URL
  const getBoardIdFromURL = () => {
    const pathParts = window.location.pathname.split("/"); // Divide la URL en partes
    return pathParts[pathParts.length - 2]; // Obtén el penúltimo elemento (ej: '4' en '/boards/statistics/4/')
  };

  const boardId = getBoardIdFromURL(); // Llama a la función para obtener el boardId

  useEffect(() => {
    if (boardId) {
      axios
        .get(`http://127.0.0.1:8000/boards/statistics/${boardId}/`)
        .then((response) => {
          setStats(response.data);
        })
        .catch((error) => {
          console.error("Error fetching statistics:", error);
        });
    }
  }, [boardId]);

  if (!stats) {
    return <p>Cargando datos...</p>;
  }

  const { tasks, overdue_tasks, tasks_by_user, tasks_by_list } = stats; // Asegúrate de incluir tasks_by_list
  const overduePercentage = ((overdue_tasks / tasks) * 100).toFixed(2);

  const barDataUser = {
    labels: tasks_by_user.map((user) => user.assigned_to__username || "Sin Asignar"),
    datasets: [
      {
        label: "Tareas por usuario",
        data: tasks_by_user.map((user) => user.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Tareas atrasadas", "Tareas a tiempo"],
    datasets: [
      {
        data: [overdue_tasks, tasks - overdue_tasks],
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  // Datos para el gráfico de conteo de listas
  const barDataList = {
    labels: tasks_by_list.map((list) => list.list__title), // Títulos de las listas
    datasets: [
      {
        label: "Tareas por Estado",
        data: tasks_by_list.map((list) => list.count), // Conteo de tareas en cada lista
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Estadísticas del Tablero</h2>
      <div style={{ width: "600px", margin: "0 auto" }}>
        <h3>Porcentaje de Tareas Atrasadas</h3>
        <Pie data={pieData} />
      </div>
      <div style={{ width: "600px", margin: "20px auto" }}>
        <h3>Tareas por Usuario</h3>
        <Bar data={barDataUser} />
      </div>
      <div style={{ width: "600px", margin: "20px auto" }}>
        <h3>Tareas por Estado</h3>
        <Bar data={barDataList} /> {/* Nuevo gráfico para tareas por estado */}
      </div>
    </div>
  );
};

export default Dashboard;
