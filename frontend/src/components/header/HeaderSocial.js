import * as React from 'react';

export default function HeaderSocial (props)
{
    const { to, logo } = props
    const openLink = () => { window.open(to) }

    return (
        <button onClick={openLink} className="h-[2.5vh] w-[2.5vh] md:h-6 md:w-6 transition ease-in-out hover:scale-125 active:scale-100 duration-300">
            <img src={logo} alt="" className="h-full w-full"/>
        </button>
    )
}