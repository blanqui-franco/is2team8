export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SET_BOARD_CONTEXT = "SET_BOARD_CONTEXT";
export const SET_PROJECT = "SET_PROJECT";


export const globalReducer = (state, action) => {
    switch (action.type) {
        case LOGIN:
            return { ...state, authUser: action.user, checkedAuth: true };
        case LOGOUT:
            return { ...state, authUser: null, checkedAuth: true };
        case SET_BOARD_CONTEXT:
            return { ...state, board: action.board, setBoard: action.setBoard };
        case SET_PROJECT: // Nuevo caso
            return { ...state, project: action.project };
        default:
            return state;
    }
};
