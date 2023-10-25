import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./components/Root";
import ErrorPage from "./components/ErrorPage";

import Home from "./components/Home";
import CreateBrewPane from "./components/CreatePane";
import SearchPane from "./components/SearchPane";
import ScriptPane from "./components/ScriptPane";

export default class App extends React.Component
{
    constructor()
    {
        this.router = createBrowserRouter([
            {
                path: "/",
                element: <Root />,
                errorElement: <ErrorPage />,
                children:
                [
                    {
                        index: true,
                        element: <Home />
                    },
                    {
                        path: "/create",
                        element: <CreateBrewPane />
                    },
                    {
                        path: "/search",
                        element: <SearchPane />,
                    },
                    {
                        path: "/script/:id",
                        element: <ScriptPane />
                    }
                ]
            }
        ])
    }

    render()
    {
        return (
            <React.StrictMode>
                <RouterProvider router={this.router} />
            </ React.StrictMode>
        )
    }
}