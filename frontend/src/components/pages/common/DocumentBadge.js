import React from 'react';
import { Link } from 'react-router-dom';

const colors = (doc) =>
{
    switch (doc)
    {
        case "json": return "bg-red-200 hover:bg-red-100"
        case "script": return "bg-green-200 hover:bg-green-100"
        case "nightorder": return "bg-blue-200 hover:bg-blue-100"
        case "almanac": return "bg-slate-200 hover:bg-slate-100"
    }
}

export default function DocumentBadge (props)
{
    const { type, to } = props
    const openLink = () => { window.open(to) }

    return (
        <button onClick={openLink} className={ "flex-none rounded-xl px-4 py-[1px] text-slate-900 shadow-md shadow-slate-300 text-center transition ease-in-out active:scale-90 " + colors(type)}>
            { type }
        </button>
    )
}