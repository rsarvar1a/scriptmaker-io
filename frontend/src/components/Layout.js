import * as React from 'react';
import { Outlet } from 'react-router-dom';

import Header from "./header/Header.js";

export default function Layout (props)
{
    return (
        <div className="flex flex-col h-screen w-screen items-stretch justify-items-center">
            <div className="flex-none"><Header /></div>
            <div className="flex-initial p-4 h-full"><Outlet /></div>
        </div>
    )
}