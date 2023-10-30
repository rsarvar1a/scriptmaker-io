import * as React from 'react';
import { motion } from 'framer-motion';
import * as t from './pageTransition';

import amne from './amne.png';

export default function FourOhFour (props)
{
    return (
        <motion.div initial={t.initial} animate={t.animate} exit={t.exit} className="w-full h-full p-4 self-stretch flex flex-col flex-auto items-center justify-center justify-items-center">
            <div className="w-auto flex-none flex flex-row items-center justify-items-center justify-center gap-4 text-xl">
                <img src={amne} alt="" className="h-16"/>
                Sorry, that page doesn't exist.
            </div>
        </motion.div>
    )
}