// src/components/Dashboard.js
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

    useEffect(() => {
        const data = { todo: 0, inProgress: 0, done: 0, overdue: 0 };
        const userTaskCount = {};

        tasks.forEach((task) => {
            // Contar tareas por estado
            if (task.status === "To Do") data.todo += 1;
            if (task.status === "In Progress") data.inProgress += 1;
            if (task.status === "Done") data.done += 1;

            // Contar tareas atrasadas
            if (new Date(task.dueDate) < new Date() && task.status !== "Done") {
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

    return (
        <div>
            <h2>Dashboard de Estadísticas</h2>
            <div style={{ width: "50%", margin: "20px auto" }}>
                <Bar data={statusData} options={{ plugins: { title: { display: true, text: "Task Distribution by Status" } } }} />
            </div>
            <div style={{ width: "50%", margin: "20px auto" }}>
                <Pie data={statusData} options={{ plugins: { title: { display: true, text: "Task Distribution by Status (Pie)" } } }} />
            </div>
            <div style={{ width: "50%", margin: "20px auto" }}>
                <Bar data={userTaskData} options={{ plugins: { title: { display: true, text: "Tasks per User" } } }} />
            </div>
        </div>
    );
};

export default Dashboard;
