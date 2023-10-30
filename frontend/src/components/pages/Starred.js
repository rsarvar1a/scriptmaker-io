import * as React from 'react';
import { motion } from 'framer-motion';
import * as t from './pageTransition';

export default function Starred (props)
{
    return (
        <motion.div initial={t.initial} animate={t.animate} exit={t.exit} className="w-full h-full flex flex-col items-center justify-center justify-items-center gap-4">
            Coming soon...
        </motion.div>
    )
}