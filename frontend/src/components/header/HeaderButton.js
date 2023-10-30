import * as React from 'react';

import { Link } from 'react-router-dom';

export default function HeaderButton (props)
{
    return (
        <Link to={ props.to }>
            <button className="rounded-md bg-slate-800 border-slate-600 border-2 text-slate-100 transition ease-in-out hover:bg-slate-600 active:scale-90 duration-150 items-stretch justify-items-center font-sans px-2">
                { props.children }
            </button>
        </Link>
    )
}