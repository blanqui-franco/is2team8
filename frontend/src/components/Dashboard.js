import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ tasks }) => {
    const [taskData, setTaskData] = useState({
        todo: 0,
        inProgress: 0,
        done: 0,
        overdue: 0,
    });
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = { todo: 0, inProgress: 0, done: 0, overdue: 0 };
        const userTaskCount = {};

        tasks.forEach((task) => {
            // Contar tareas por estado
            if (task.status === "To Do") data.todo += 1;
            if (task.status === "In Progress") data.inProgress += 1;
            if (task.status === "Done") data.done += 1;

            // Contar tareas atrasadas (solo si dueDate es válida)
            if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done") {
                data.overdue += 1;
            }

            // Contar tareas por usuario asignado
            const user = task.assignedUser;
            if (user) {
                userTaskCount[user] = (userTaskCount[user] || 0) + 1;
            }
        });

        setTaskData(data);
        setUserData(userTaskCount);
        setLoading(false);  // Finaliza el estado de carga
    }, [tasks]);

    const statusData = {
        labels: ["To Do", "In Progress", "Done", "Overdue"],
        datasets: [
            {
                label: "Task Distribution",
                data: [taskData.todo, taskData.inProgress, taskData.done, taskData.overdue],
                backgroundColor: ["#FF6384", "#36A2EB", "#4CAF50", "#FFCE56"],
            },
        ],
    };

    const userTaskData = {
        labels: Object.keys(userData),
        datasets: [
            {
                label: "Tasks per User",
                data: Object.values(userData),
                backgroundColor: "#42A5F5",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: "Tasks by Status",
            },
            tooltip: {
                enabled: true,
            },
            legend: {
                display: true,
                position: "top",
            },
        },
    };

    if (loading) return <p>Cargando datos...</p>;

    return (
        <div>
            <h2>Dashboard de Estadísticas</h2>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
                <div style={{ width: "45%", margin: "20px 0" }}>
                    <Bar data={statusData} options={options} />
                </div>
                <div style={{ width: "45%", margin: "20px 0" }}>
                    <Pie data={statusData} options={options} />
                </div>
                <div style={{ width: "45%", margin: "20px 0" }}>
                    <Bar data={userTaskData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
