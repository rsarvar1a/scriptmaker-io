import * as React from 'react';

export default function HeaderSocial (props)
{
    const { to, logo } = props
    const openLink = () => { window.open(to) }

    return (
        <button onClick={openLink} className="h-6 w-6 transition ease-in-out hover:scale-125 duration-300">
            <img src={logo} alt="" className="h-full w-full"/>
        </button>
    )
}