import React from "react";
import { v4 as uuidv4 } from "uuid";

const Labels = ({ labels = [] }) => { // Asignamos un valor predeterminado como arreglo vacío
    if (!Array.isArray(labels) || labels.length === 0) return null; // Verificamos si es un arreglo y tiene elementos

    return (
        <div className="labels">
            {labels.map((label) => (
                <p
                    className="labels__label"
                    key={uuidv4()}
                    style={{ color: `#${label.color}` }} // Usamos el color del label
                >
                    {label.name || "___"} {/* Muestra el nombre del label o un texto por defecto */}
                </p>
            ))}
        </div>
    );
};

export default Labels;
