import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";

const Dashboard = ({ boardId }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        console.log("Board ID recibido en Dashboard:", boardId); // Agregar log
        fetchStats();
    }, [boardId]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`/boards/${boardId}/stats/`);
            setStats(data);
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
        }
    };

    if (!stats) return <p>Cargando estadísticas...</p>;

    const tasksByStatusData = {
        labels: Object.keys(stats.tasks_by_status),
        datasets: [
            {
                label: "Tareas por Estado",
                data: Object.values(stats.tasks_by_status),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
        ],
    };

    const tasksOverdueData = {
        labels: ["Atrasadas", "A tiempo"],
        datasets: [
            {
                label: "Tareas",
                data: [stats.tasks_overdue.overdue, stats.tasks_overdue.on_time],
                backgroundColor: ["#FF6384", "#36A2EB"],
            },
        ],
    };

    const tasksByUserData = {
        labels: Object.keys(stats.tasks_by_user),
        datasets: [
            {
                label: "Tareas por Usuario",
                data: Object.values(stats.tasks_by_user),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            },
        ],
    };

    return (
        <div>
            <h2>Dashboard de Estadísticas</h2>
            <div style={{ width: "50%", margin: "auto" }}>
                <h3>Tareas por Estado</h3>
                <Bar data={tasksByStatusData} />
            </div>
            <div style={{ width: "50%", margin: "auto" }}>
                <h3>Tareas Atrasadas</h3>
                <Pie data={tasksOverdueData} />
            </div>
            <div style={{ width: "50%", margin: "auto" }}>
                <h3>Tareas por Usuario</h3>
                <Bar data={tasksByUserData} />
            </div>
        </div>
    );
};

export default Dashboard;
