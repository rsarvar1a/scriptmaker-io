import * as React from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ToggleSlider } from '../ToggleSlider';
import Editor from '@monaco-editor/react';
import { Navigate } from 'react-router-dom';

const spinner = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA/UlEQVR4nGNgwAKsXIK87H2iFjp4Ry4GYXuvyAUWzoEeDISAuaO3l6NvzBZLl8ByCwsLTpi4sbEPF0jM0S96s7mTrytWzdZugQW27qHTCFli4xE6w8IlIAfNZn8va/dggprhhriHzkRxiYNv1FYGEoGjX/QmMENKXsXQwNI5i1QDrFwCq0zsvV1A7GQGBgZWUg1gYFBhh+plSGcgH6TBCUoMSCbPCwxsDAwMSSCGGgMDgzsZBniCAoIBCsrJMKAUmaPGwMAQT4LmBGTbYcAOKkEIJDIwMNjikgS5pIyBgQGU80CBBAMgNkgMJIdhMzYAUgSKHVA0gTCIrYxNJQBd5i4dK5kcagAAAABJRU5ErkJggg=="

export default class Create extends React.Component 
{
    constructor(props) 
    {
        super(props)
        this.state = 
        { 
            useJson: false, 
            jsonError: null, 
            scriptJson: null, 
            scriptURL: "", 
            edition: "", 
            simple: false,
            useNightorder: false,
            firstNightError: null,
            firstNight: [],
            otherNightError: null,
            otherNight: [],
            apiError: null,
            apiCalled: false,
            payloadOk: false,
            payload: null,
            script_id: null,
            redirect: false
        }
        this.editorRef = null
    }

    setSync(state)
    {
        return new Promise(resolve => this.setState(state, () => resolve()))
    }

    async prepState()
    {
        await this.setSync({ payloadOk: false, payload: null})

        let payload =
        {
            source: 
            {
                url: this.state.scriptURL,
                edition: this.state.edition,
                make: ['script']
            }
        }

        if (this.state.edition === "") return
        if (this.state.simple) payload.source['simple'] = true

        if (this.state.useJson)
        {
            if (this.state.jsonError) return
            payload['script'] = this.state.scriptJson

            if (this.state.useNightorder)
            {
                if (this.state.firstNightError || this.state.firstNight === []) return
                if (this.state.otherNightError || this.state.otherNight === []) return 
                payload['nightorder'] = 
                {
                    first: this.state.firstNight,
                    other: this.state.otherNight
                }
            }
        }
        else 
        {
            if (this.state.scriptURL === "") return
        }

        await this.setSync({ payload: payload, payloadOk: true })
    }

    render() 
    {
        const handleAPIbrew = async () =>
        {
            try
            {
                await this.prepState()
                this.setState({ apiCalled: true })

                const { payload, payloadOk } = this.state
                console.log(this.state)
                console.log("api call: ", payloadOk, payload)

                await new Promise(r => setTimeout(r, 2000));
                const resp = await axios.post('/api/brew', payload)

                if (resp.status !== 200) throw resp.statusText
                const { id } = resp.data

                this.setState({ script_id: id, redirect: true, apiCalled: false })
            }
            catch (err)
            {
                this.setState({ apiError: err, apiCalled: false })
            }
        }

        const handleJson = (value, event) =>
        {
            try 
            {
                const json = JSON.parse(value)
                this.setState({ jsonError: null, scriptJson: json })
            }
            catch (err)
            {
                this.setState({ scriptJson: null, jsonError: err })
            }
            finally
            {
                this.prepState()
            }
        }

        const handleFirstNight = event =>
        {
            try
            {
                if (event.target.value === "")
                {
                    this.setState({ firstNightError: null, firstNight: [] })
                    return
                }

                const lst = `[${event.target.value.split('\n').map((v, i, a) => `"${v}"`).join(', ')}]`
                const json = JSON.parse(lst)
                this.setState({ firstNightError: null, firstNight: json })
            }
            catch (err)
            {
                this.setState({ firstNightError: err })
            }
            finally
            {
                this.prepState()
            }
        }

        const handleOtherNight = event =>
        {
            try
            {
                if (event.target.value === "")
                {
                    this.setState({ otherNightError: null, otherNight: [] })
                    return
                }

                const lst = `[${event.target.value.split('\n').map((v, i, a) => `"${v}"`).join(', ')}]`
                const json = JSON.parse(lst)
                this.setState({ otherNightError: null, otherNight: json })
            }
            catch (err)
            {
                this.setState({ otherNightError: err })
            }
            finally
            {
                this.prepState()
            }
        }

        const t =
        {
            initial: 
            {
                opacity: 0,
                scale: 0.9,
            },
            animate:
            {
                opacity: 1,
                scale: 1.0
            },
            exit:
            {
                opacity: 0,
                scale: 0.9
            },
            transition:
            {
                duration: 0.3
            }
        }

        return (
            <motion.div initial={t.initial} animate={t.animate} exit={t.exit} className="p-4 md:p-12 flex flex-col flex-auto w-11/12 md:w-4/5 self-center h-full items-stretch justify-center gap-4">
                <div className="flex flex-col items-stretch justify-items-stretch justify-stretch gap-4">
                    <AnimatePresence mode='popLayout'>
                        <motion.div layout key="buttons" className="flex flex-col md:flex-row gap-4 items-start justify-items-start md:items-center md:justify-items-center">
                            <div className="flex flex-row flex-none items-center justify-items-center justify-center gap-2 text-slate-600 italic">
                                <ToggleSlider onToggle={state => { this.setState({ useJson: state, useNightorder: state ? this.useNightorder : state }) }} />
                                script JSON
                            </div>
                            { 
                                this.state.useJson ?
                                    <div className="flex flex-row flex-none md:items-center justify-items-center justify-center gap-2 text-slate-600 italic">
                                        <ToggleSlider onToggle={state => { this.setState({ useNightorder: state }) }} />
                                        nightorder
                                    </div> : 
                                    <></>
                            }
                            <div className="flex flex-row flex-none items-center justify-items-center justify-center gap-2 text-slate-600 italic">
                                <ToggleSlider onToggle={state => { this.setState({ simple: state }) }} />
                                simple
                            </div>
                        </motion.div>
                        {
                            this.state.useJson ?
                                <motion.div layout initial={t.initial} animate={t.animate} exit={t.exit} transition={t.transition} key="jsonpanel" className="flex flex-col flex-auto w-full min-h-1/2 px-2 py-1 rounded-md border-2 border-slate-200 bg-white text-slate-900 shadow-md shadow-slate-300">
                                    <Editor keepCurrentModel='true' height="33vh" defaultLanguage='json' className="font-mono border-none focus:outline-none bg-white text-slate-900" onChange={handleJson}></Editor>
                                </motion.div> :
                                <motion.input layout initial={t.initial} animate={t.animate} exit={t.exit} transition={t.transition} key="url" className="font-mono flex flex-col flex-auto w-full px-2 py-1 rounded-md border-2 border-slate-200 bg-white text-slate-900 shadow-md shadow-slate-300 focus:outline-none" placeholder="enter a URL" onBlur={event => { this.setState({ scriptURL: event.target.value }) }}></motion.input>
                        }
                        {
                            this.state.useNightorder ?
                                <motion.div layout initial={t.initial} animate={t.animate} exit={t.exit} transition={t.transition} key="orders" className="flex flex-col md:flex-row flex-auto w-full min-h-1/2 gap-4">
                                    <textarea rows={4} className="font-mono border-non focus:outline-none flex flex-col flex-auto w-full min-h-1/2 px-2 py-1 rounded-md border-2 border-slate-200 bg-white text-slate-900 shadow-md shadow-slate-300" placeholder="enter first night characters (one per line)..."
                                    onBlur={handleFirstNight}></textarea>
                                    <textarea rows={4} className="font-mono border-non focus:outline-none flex flex-col flex-auto w-full min-h-1/2 px-2 py-1 rounded-md border-2 border-slate-200 bg-white text-slate-900 shadow-md shadow-slate-300" placeholder="enter other night characters (one per line)..."
                                    onBlur={handleOtherNight}></textarea>
                                </motion.div> : <></>
                        }
                        <motion.input layout key="edition" className="font-mono px-2 py-1 rounded-md border-2 border-slate-200 bg-white shadow-md shadow-slate-300 focus:outline-none" placeholder="name your edition" onBlur={event => { this.setState({ edition: event.target.value }) }} />
                        <motion.div layout key="create-button" className="relative self-center flex flex-row items-center justify-center justify-items-center gap-4">
                            <div className={"self-center flex flex-row items-center justify-items-center justify-center rounded-xl px-4 py-1 bg-white border-slate-200 border-2 shadow-md shadow-slate-300" + (this.state.payloadOk ? (this.state.apiCalled ? "" : " transition ease-in-out hover:scale-110 active:scale-100") : "")}>
                            {
                                this.state.apiCalled ?
                                    <button disabled className="flex flex-row w-auto h-auto items-stretch justify-items-center justify-center gap-2">
                                        <img src={spinner} alt="" className="mt-1 animate-spin h-4 w-4"/>
                                        processing...
                                    </button> :
                                    <button onClick={handleAPIbrew}>create brew</button>
                            }
                            </div>
                        {
                            this.state.apiError ?
                                <motion.button key="error-icon" className="relative self-center flex" onClick={() => this.setState({ showError: ! this.state.showError })}>
                                    <svg className="h-5 w-5" viewBox="0 0 32 32"><circle cx="16" cy="16" id="BG" r="16" style={{ fill: "#D72828" }}/><path d="M14.5,25h3v-3h-3V25z M14.5,6v13h3V6H14.5z" style={{ fill: "#E6E6E6"}}/></svg>
                                    {
                                    this.state.apiError && this.state.showError ?
                                        <div>
                                            <div className="h-0 w-0 border-x-8 border-x-transparent border-b-[16px] border-b-red-700 absolute left-1/2 top-8 -translate-x-1/2"></div>
                                            <div className="w-[40vw] md:w-[20vw] absolute -left-[30vw] md:left-1/2 md:-translate-x-1/2 top-10 px-4 py-1 rounded-xl bg-white border-red-700 shadow-md shadow-slate-300 border-2 text-red-700">{ this.state.apiError.message }</div>
                                        </div>
                                        : <></>
                                    }
                                </motion.button>
                                : <></>
                        }
                        </motion.div>
                    </AnimatePresence>
                    {
                        this.state.redirect ?
                            <Navigate to={`/script/${this.state.script_id}`}/>
                            : <></>
                    }
                </div>
            </motion.div>
        )
    }
}