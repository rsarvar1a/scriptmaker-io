import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary.js";
import Layout from "./components/Layout.js";

import Create from "./components/pages/Create.js";
import FourOhFour from './components/pages/FourOhFour.js';
import Home from "./components/pages/Home.js";
import Script from "./components/pages/Script.js";
import Search from "./components/pages/Search.js";
import Starred from "./components/pages/Starred.js";

import "./styles.css";

window.React = React
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <ErrorBoundary>
        <HashRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="create" element={<Create />} />
                    <Route path="starred" element={<Starred />} />
                    <Route path="script" element={<Script />} />
                    <Route path="search" element={<Search />} />
                    <Route path="starred" element={<Starred />} />
                    <Route path="*" element={<FourOhFour />} />
                </Route>
            </Routes>
        </HashRouter>
    </ErrorBoundary>
)