import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as t from './pageTransition';
import { Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";

import DocumentBadge from "./common/DocumentBadge";
import PagesScroller from './common/PagesScroller';

class ScriptImpl extends React.Component 
{
    constructor(props) 
    {
        super(props)
        this.id = props.id

        this.state =
        {
            name: null,
            json: null,
            logo: null,
            documents: null,
            error: null
        }
    }

    componentDidMount() 
    {
        // Get script info
        axios.get(`/api/${this.id}`).then(
            response => 
            {
                this.setState({ 
                    name: response.data.name.replaceAll('_', ' '), 
                    created_on: response.data.created_on,
                    json: response.data.json_url, 
                    logo: response.data.logo_url 
                })

                // Get available documents
                axios.get(`/api/${this.id}/documents`).then(
                    response => 
                    {
                        Promise.all(
                            response.data.documents.map(doc => axios.get(`/api/${this.id}/documents/${doc}`))
                        ).then(responses => { this.setState({ documents: responses.map(response => response.data) }) })
                    }
                ).catch(err => this.setState({ error: err }))
            }
        ).catch(err => this.setState({ error: err }))
    }

    render() 
    {
        return (
            this.state.error ? 
                <div>{ this.state.error.response.data || this.state.error.message }</div> :
                <AnimatePresence mode="popLayout">
                    <motion.div key="header" className="flex-none flex flex-col md:flex-row items-center justify-items-center justify-center gap-2">
                        { this.state.logo ? <motion.img src={this.state.logo} alt="" className="h-32" /> : <></> }
                        <motion.div key="title-links" className="flex flex-col w-full gap-2 items-center md:items-start justify-center justify-items-center">
                            { this.state.name ?
                                <div className="text-5xl font-dumbledor whitespace-nowrap">{ this.state.name }</div>
                                : <></> 
                            }
                            { this.state.documents ?
                                <motion.div key="links" className="flex flex-row items-center justify-center justify-items-center gap-4">
                                    <DocumentBadge type="json" to={ this.state.json } />
                                    { this.state.documents.map(doc => <DocumentBadge type={doc.document} to={doc.url} /> )}
                                </motion.div> : <></>
                            }
                            <div className="text-md italic">created { moment(this.state.created_on).fromNow() }</div>
                        </motion.div>
                    </motion.div>
                    { this.state.documents ?
                        <PagesScroller shadow="shadow-md shadow-slate-300" flex="flex-none self-center" padding="my-8" height="h-1/2 md:h-3/5" width="w-9/10 md:w-auto" documents={ this.state.documents }/> : <></>
                    }
                </AnimatePresence>
        )
    }
}

export default function Script(props) 
{
    const { id } = useParams()

    return (
        <motion.div initial={t.initial} animate={t.animate} exit={t.exit} className="flex flex-col items-center justify-items-center justify-center gap-4 w-full h-full"> 
            <ScriptImpl id={id} />
        </motion.div>
    )
}