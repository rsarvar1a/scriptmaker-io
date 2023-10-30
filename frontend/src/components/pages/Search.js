import * as React from 'react';
import { motion } from 'framer-motion';
import * as t from './pageTransition';

export default class Search extends React.Component
{
    render()
    {
        return (
            <motion.div initial={t.initial} animate={t.animate} exit={t.exit}>
                Search
            </motion.div>
        )
    }
}