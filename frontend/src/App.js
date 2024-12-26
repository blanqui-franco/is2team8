import React, { useEffect, useContext } from "react";
import { Route, Switch } from "react-router-dom";

import globalContext from "./context/globalContext";
import Header from "./components/headers/Header";
import LandingHeader from "./components/headers/LandingHeader";
import AddBoardModal from "./components/modals/AddBoardModal";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Project from "./pages/Project";
import Error404 from "./pages/Error404";
import Dashboard from './components/Dashboard/Dashboard';


function App() {
    const { checkAuth, checkedAuth, authUser } = useContext(globalContext);

    useEffect(() => {
        checkAuth();
    }, []);
    console.log("Auth user:", authUser); // Debug
    console.log("Checked auth:", checkedAuth); // Debug
    if (!checkedAuth) {
        return null;
    }

    if (authUser){
       console.log("Usuario autenticado, cargando aplicación"); // Debug//
        return (
            <>
                <Route path="/" component={Header} />
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/b/:id" component={Board} />
                    <Route exact path="/test" component={AddBoardModal} />
                    <Route exact path="/p/:id" component={Project} />
                    <Route path="/b/:boardId/dashboard" component={Dashboard} />
                    <Route path="" component={Error404} />
                </Switch>
            </>
        );
    }else
     console.log("Usuario no autenticado, mostrando pantalla de inicio"); // Debug
        return (
            <>
                <Route
                    path="/"
                    render={(props) => {
                        const { pathname } = props.location;
                        if (pathname === "/login" || pathname === "/register")
                            return null;
                        return <LandingHeader />;
                    }}
                />
                <Switch>
                    <Route exact path="/" component={Landing} />
                    <Route exact path="/login" component={Login} />
                    <Route
                        exact
                        path="/register"
                        render={(props) => <Login {...props} login={false} />}
                    />
                    <Route path="" component={Error404} />
                </Switch>
            </>
        );
}

export default App;
