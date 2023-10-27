import { useState } from 'react';
import { Link } from 'react-router-dom';

const search_icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5ElEQVR4nO2TTQqCYBCGta20c6GXiK6itCoPYdayKwgdpCtEPzfoGuGqgto9MTiQC9H61DDohVk4A/N8M/NqWX/1QsAAiDTsLgARL80KeWN9HWBLY2DayYp+X/TURWdgBYwBp23ABhh+MoGRi4AJcARuGgcgfBtc03xdMWHatPlEG92BGPAAH5hrThQYu4h8LaK4pJZobW9yZEfzV/32SgAyiejSBsCvAGTGLiJ3iygpqS21tq3rUwUIC0dO9NUSC+ChtcgYYOWQtMKmohPgNoUEwE5/skzWoveU5s3WVAN2FTZ6AgE6sCNozFBCAAAAAElFTkSuQmCC";

export default function SearchBar (props)
{
    const [ query, setQuery ] = useState("")

    return (
        <div className="h-7 w-auto flex flex-row flex-auto items-stretch justify-items-end bg-slate-800 border-2 border-slate-600 rounded-lg">
            <input className="px-2 py-1 bg-slate-800 text-slate-100 rounded-s-md rounded-e-none transition ease-in-out focus:bg-slate-700 focus:outline-none duration-200 border-r-2 border-r-slate-600 flex-auto" placeholder="Enter a script name..." onChange={ event => setQuery(event.target.value) }/>
            <Link to="search" state={{ input_string: query }}>
                { query === "" ?
                <button disabled className="h-full flex-none w-8 flex items-stretch">
                    <img className="bg-slate-800 px-2 py-1 h-auto rounded-s-none rounded-e-md" src={search_icon} alt=""/>
                </button> :
                <button className="h-full flex-none w-8 flex items-stretch">
                    <img className="bg-slate-700 px-2 py-1 h-auto rounded-s-none rounded-e-md transition ease-in-out hover:bg-slate-600" src={search_icon} alt=""/>
                </button>
                }
            </Link>
        </div>
    )
}