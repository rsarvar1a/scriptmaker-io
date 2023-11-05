import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ErrorBoundary from "./components/ErrorBoundary.js";
import Header from "./components/header/Header.js";

import Create from "./components/pages/Create.js";
import FourOhFour from './components/pages/FourOhFour.js';
import Home from "./components/pages/Home.js";
import Script from "./components/pages/Script.js";
import Search from "./components/pages/Search.js";
import Starred from "./components/pages/Starred.js";

import background from "./components/pages/background.png";
import "./styles.css";

window.React = React
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <ErrorBoundary>
        <HashRouter>
            <div className="flex flex-col h-screen w-screen items-center justify-items-center overflow-clip">
                <div className="flex-none self-stretch z-50"><Header/></div>
                <div style={{ backgroundImage: "url(" + background + ")", backgroundPosition: "center", backgroundSize: "cover" }} className="z-40 flex-none w-full h-[95vh] flex flex-col items-center justify-items-center bg-blend-multiply bg-slate-200">
                    <div className="z-30 backdrop-blur-[2px] flex-auto w-full h-full flex flex-col items-center justify-items-center">
                        <AnimatePresence mode="wait">
                            <Routes key={window.location.pathname}>
                                <Route index element={<Home />} />
                                <Route path="create" element={<Create />} />
                                <Route path="starred" element={<Starred />} />
                                <Route path="script/:id" element={<Script />} />
                                <Route path="search" element={<Search />} />
                                <Route path="starred" element={<Starred />} />
                                <Route path="*" element={<FourOhFour />} />
                            </Routes>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </HashRouter>
    </ErrorBoundary>
)