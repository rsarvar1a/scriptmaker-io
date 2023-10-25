import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./components/RootView";
import ErrorRoot from "./components/ErrorView";

export default class App extends React.Component
{
    constructor()
    {
        this.router = createBrowserRouter([
            {
                path: "/",
                element: <Root />,
                errorElement: <ErrorRoot />,
                children:
                [
                    {
                        path: "create",
                        
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