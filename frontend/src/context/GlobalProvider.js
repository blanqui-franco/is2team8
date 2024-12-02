import React, { useReducer } from "react";
import { useHistory } from "react-router-dom";

import { backendUrl } from "../static/js/const";
import { authAxios } from "../static/js/util";
import globalContext from "./globalContext";
import {
    globalReducer,
    LOGIN,
    LOGOUT,
    SET_BOARD_CONTEXT,
    SET_PROJECT
} from "./globalReducer";

const GlobalProvider = (props) => {
    const history = useHistory();
    const [globalState, dispatch] = useReducer(globalReducer, {
        authUser: null,
        checkedAuth: false,
        board: null,
        setBoard: null,
        project: null, // Nuevo: Proyecto actual
    });

    const login = async (resData) => {
        localStorage.setItem("accessToken", resData.access);
        localStorage.setItem("refreshToken", resData.refresh);
        const url = backendUrl + "/me/";

        // No try catch block so error bubbles up to LoginForm.js to be handled there
        const { data: user } = await authAxios.get(url);
        dispatch({ type: LOGIN, user });
        history.push("/");
    };

    const checkAuth = async () => {
        const url = backendUrl + "/me/";
        try {
            const { data: user } = await authAxios.get(url);
            dispatch({ type: LOGIN, user });
        } catch (err) {
            dispatch({ type: LOGOUT });
        }
    };

    const logout = () => {
        // Eliminar los tokens de localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    
        // Actualizar el estado global para reflejar que el usuario está deslogueado
        dispatch({ type: LOGOUT });
    
        // Redireccionar al usuario a la página de inicio de sesión
        history.push("/login");
    };
    

    const setBoardContext = (board, setBoard) => {
        dispatch({ type: SET_BOARD_CONTEXT, board, setBoard });
    };
    const setProject = (project) => {
        console.log("Actualizando el contexto global con el proyecto:", project);
        dispatch({ type: SET_PROJECT, project });
    };
    

    return (
        <>
         {console.log("Estado global actual:", globalState)} {/* Depuración */}
        <globalContext.Provider
            value={{
                authUser: globalState.authUser,
                checkedAuth: globalState.checkedAuth,
                board: globalState.board,
                setBoard: globalState.setBoard,
                project: globalState.project, // Proyecto actual
                setProject, // Setter para el proyecto
                checkAuth,
                login,
                logout,
                setBoardContext,
            }}
        >
            {props.children}
        </globalContext.Provider>
        </>
    );
    
};

export default GlobalProvider;