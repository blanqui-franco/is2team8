import React from "react";

const hashName = (str) => {
    let res = 0;
    for (let i = 0; i < str.length; i++) {
        res += str.charCodeAt(i);
    }

    return res + 1; // So my name maps to blue
};

const colors = ["red", "yellow", "blue"];

const getNameColor = (name) => {
    return colors[hashName(name) % colors.length];
};

const ProfilePic = ({ user, large }) => {
    // Validar si el usuario tiene todos los datos necesarios
    if (!user || !user.full_name) {
        console.warn("El usuario tiene datos incompletos:", user);
        return (
            <div className={`member member--undefined${large ? " member--large" : ""}`}>
                <span>?</span>
            </div>
        );
    }

    return user.profile_pic ? (
        // Si hay imagen de perfil
        <div className={`member member--image${large ? " member--large" : ""}`}>
            <img src={user.profile_pic} alt={user.full_name} />
        </div>
    ) : (
        // Si no hay imagen de perfil, mostrar iniciales
        <div
            className={`member member--${getNameColor(user.full_name)}${
                large ? " member--large" : ""
            }`}
        >
            {user.full_name.substring(0, 1).toUpperCase()} {/* Inicial del nombre */}
        </div>
    );
};

// Valores predeterminados para la prop `large`
ProfilePic.defaultProps = {
    large: false,
};

export default ProfilePic;
