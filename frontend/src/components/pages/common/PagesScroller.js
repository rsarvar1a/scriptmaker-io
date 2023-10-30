import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default class PagesScroller extends React.Component
{
    constructor (props)
    {
        super(props)
        this.docs = props.documents
        this.state = 
        {
            has_pages: false,
            page_urls: [],
            error: null
        }
    }

    componentDidMount()
    {
        const requests = this.docs.map(
            doc => axios.get(`/api/${doc.id}/documents/${doc.document}/pages/all`)
        )

        Promise.all(requests).then(
            responses => 
            {
                console.log(responses)
                const page_urls = responses.map(response => response.data.pages.map(entry => entry.url)).flat()  
                this.setState({ has_pages: page_urls.length > 0, page_urls: page_urls })
            }        
        ).catch(
            err => 
            {
                console.log(err)
                this.setState({ error: err })
            }
        )
    }

    render()
    {
        return (
            this.state.has_pages ?
                <motion.div key="scroller" className={`${this.props.height} ${this.props.width} ${this.props.padding} ${this.props.shadow} ${this.props.flex} flex flex-row gap-2 items-center justify-start justify-items-start overflow-x-scroll overflow-y-clip scroll-smooth snap-x snap-center transition ease-in-out`}>
                { this.state.page_urls.map(
                    url => <img src={url} alt="" className="object-contain snap-center h-full shadow-lg shadow-slate-300"/>
                )}
                </motion.div>
                : <></>
        )
    }
}