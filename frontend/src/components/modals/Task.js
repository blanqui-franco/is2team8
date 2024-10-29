// src/components/modals/Task.js
import React from "react";

const Task = ({ task, onToggle }) => {
    return (
        <div className="task">
            <input
                type="checkbox"
                checked={task.status === "closed"}
                onChange={() => onToggle(task.id)}
            />
            <span>{task.description}</span>
        </div>
    );
};

export default Task;
