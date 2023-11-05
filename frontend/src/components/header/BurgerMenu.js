import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import SearchBar from './SearchBar';

import burger from './burger.svg';

export default function BurgerMenu (props)
{
    const [open, setOpen] = useState(false)
    const toggle = (() => setOpen(!open))
    
    const location = useLocation()
    useEffect(() => 
    {
        setOpen(false)
    }, [location])

    return (
        <div className="-z-1 relative md:hidden flex-initial flex flex-row items-stretch justify-items-center">
            <button className={"transition ease-in-out hover:bg-slate-700 rounded-xl px-1 py-1 bg-slate-" + (open ? "700" : "800")} onClick={toggle}>
                <img src={burger} alt="" className="h-[3vh] md:h-7"/>
            </button>
            <AnimatePresence>
                { open ?
                <motion.div key="burger-motion" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
                className="absolute left-0 top-14 mx-[1vw] px-[4vw] py-4 rounded-2xl bg-slate-800 shadow-slate-800 shadow-lg">
                    <div className="flex flex-col items-stretch justify-items-stretch gap-1 text-slate-300">
                        <Link to="create"><div className="transition ease-in-out hover:text-slate-100">
                            Create a new brew...
                        </div></Link>
                        <Link to="starred"><div className="transition ease-in-out hover:text-slate-100">
                            View your starred brews...
                        </div></Link>
                        <div className="border-b-2 border-slate-600 w-[84vw] mt-2 mb-2"></div>
                        <SearchBar/>
                    </div>
                </motion.div> : <></> }
            </AnimatePresence>
        </div>
    )
}