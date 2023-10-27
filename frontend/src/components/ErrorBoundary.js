import * as React from 'react';

export default class ErrorBoundary extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state = { error_state: false, error: null, info: null }
    }

    componentDidCatch(error, info)
    {
        this.setState({ error_state: true, error: error, info: info })
    }

    render()
    {
        const { error_state, error, info } = this.state
        if (! error_state) return this.props.children

        return (
            <div className="w-screen h-screen flex items-center justify-items-center bg-slate-700 text-slate-300 text-center">
                <div className="flex-auto h-auto">
                    <h1 className="text-6xl align-middle">You've broken the website.</h1>
                    <p className="align-middle mb-4">Not really, but here's what went wrong.</p>
                    <p className="font-mono font-bold text-red-500 align-middle">{ error.status || error.message }</p>
                    <div className="font-mono text-red-400 align-middle whitespace-pre-wrap">{ info.componentStack }</div>
                </div>
            </div>
        )
    }
}