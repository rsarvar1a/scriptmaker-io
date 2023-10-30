import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as t from './pageTransition';

import logo from '../header/logo.png';
import steward from '../header/steward.png';

export default class Home extends React.Component
{
    render()
    {
        return (
            <motion.div initial={t.initial} animate={t.animate} exit={t.exit} className="w-full h-full flex flex-auto flex-col items-center justify-center">
                <div className="w-full h-full flex flex-auto flex-col items-center justify-center">
                    <div className="w-10/12 h-auto flex flex-row flex-initial items-center justify-center gap-[4vw] md:gap-8 pb-[2vw] md:pb-4">
                        <img src={steward} alt="" className="max-w-2/12 md:max-w-32 max-h-20 md:max-h-32 aspect-square"/>
                        <img src={logo} alt="" className="w-10/12 max-h-20 max-w-md"/> 
                    </div>
                    <Link to="create"><button className="flex-initial w-auto px-4 py-1 text-center rounded-xl text-slate-800 bg-white shadow-md shadow-slate-200 transition ease-in-out hover:scale-110 active:scale-100 duration-300">
                        get started
                    </button></Link>
                </div>
            </motion.div>
        )
    }
}