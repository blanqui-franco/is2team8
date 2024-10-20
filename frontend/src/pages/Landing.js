import React from "react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

import bgImage from "../static/img/bg1.jpg";

const Landing = () => {
    useDocumentTitle("YvyPlan");
    return (
        <div className="landing-banner">
            <img className="landing-banner__image" src={bgImage} />
            <div className="landing-banner__content">
                <h1 className="landing-banner__title">
                    YvyPlan te permite trabajar de forma más colaborativa y hacer más cosas
                </h1>
                <h4 className="landing-banner__subtitle">
                    Los tableros, listas y tarjetas de Trello le permiten organizar y
                    priorice sus proyectos de una manera divertida y flexible.
                </h4>
                <Link to="/register" className="btn">
                    Regístrate gratis
                </Link>
            </div>
        </div>
    );
};

export default Landing;
