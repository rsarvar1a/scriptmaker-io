import * as React from 'react';
import { Link } from 'react-router-dom';

import logo from "./logo.png";

export default function Branding (props)
{
    return (
        <Link to="/">
            <img src={logo} alt="" className="justify-self-center flex-none h-9"/>
        </Link>
    )
}