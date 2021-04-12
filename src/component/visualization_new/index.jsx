import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox, DropDownInput, Input } from '../../util/ui'

import { useDispatch, useSelector } from 'react-redux';
import { loadScript, useSimpleForm, useToggleGroup,fetchByJSON,useCachedData } from '../../util/util'
// import {TooltipComponent} from 'echarts/components';

import AreaGraph from './areaGraph'
import BarChart from './barChart'
import BoxPlot from './boxPlot'
import CandleStickChart from './candleStickChart'
import LineGraph from './lineGraph'
import Histogram from './histogram'
import PieChart from './pieChart'
import RadarGraph from './radarGraph'
import ScatterPlot from './scatterPlot'
import ThreeDScatterPlot from './threeDScatterPlot'
import NightingaleRoseChart from './nightingaleRoseChart';
import { ChromePicker } from 'react-color';
import './index.css'
import { InlineTip } from '../common/tip';

const Graphs = [
    AreaGraph,
    BarChart,
    BoxPlot,
    CandleStickChart,
    Histogram,
    LineGraph,
    NightingaleRoseChart,
    PieChart,
    RadarGraph,
    ScatterPlot,
    ThreeDScatterPlot,
]

const Functions = [
    'Distribution',
    'Range',
    'Patterns',
    'Change over Time',
    'Comparisons',
    'Proportions',
    'Relationships',
    'Comparisons',
    '3D'
]

const PLOTS = {}

let GraphOptionViews = {}, GraphConfigs = {}

for (let e of Graphs) {
    PLOTS[e.config.name] = {
        function: e.config.function
    }
    GraphConfigs[e.config.name] = e.config
    GraphOptionViews[e.config.name] = e.view
}

const initialCode = data=>`import pandas as pd
from io import StringIO
import matplotlib.pyplot as plt
import numpy as np
import matplotlib.pyplot as plt

data_json = StringIO("""${data}""")
df = pd.read_json(data_json)
`


export default function(){
    useCachedData()
    const [plots, setPlots] = useState(Object.keys(PLOTS))
    const [optionsVisible, showOptions] = useState(0)
    let { ref, hide: hideSelections } = useToggleGroup()
    const [currentPlot, setCurrentPlot] = useState('')
    const [code,setCode] = useState('')
    const [activateStatus,setActivateStatus] = useState('Loading...')
    let [dfJSON,setDfJSON] = useState('')//dataframe json
    let dataset = useSelector(state => state.dataset)
    let { result, getData } = useSimpleForm()
    let codeParent = useRef()
    let kernelRef = useRef()
    
    //Not just rerun the current code
    //It's reinject the data and rerun the current code
    const runCode = e=>{
        kernelRef.current.requestExecute({code:initialCode(dfJSON)})
        document.querySelector('.thebelab-run-button').click()
    }

    useEffect(()=>{
        if(!code) return
        codeParent.current.innerHTML = ''
        let pre = document.createElement('pre')
        pre.setAttribute('data-executable','true')
        pre.setAttribute('data-language','python')
        codeParent.current.appendChild(pre)
        pre.innerHTML = code
        thebelab.bootstrap();
    },[code])

    //start thebelab automatically
    //load current dataframe
    useEffect(()=>{
        if(!dataset.filename){
            setActivateStatus('No data')
            return
        }

        thebelab.bootstrap();

        //excute code in advance on thebelab to import libraries and set dataframe variable
        thebelab.on("status", async function (evt, data) {
            if(data.status === 'ready' && dataset.filename){
                let res = await fetchByJSON('current_data_json',{
                    filename:dataset.filename
                })

                let g = await res.json()
                kernelRef.current = data.kernel
                data.kernel.requestExecute({code:initialCode(g.data)})
                setDfJSON(g.data)
                setActivateStatus('Ready')
            }
            console.log("Status changed:", data.status, data.message);
        })

    },[dataset.filename])

    const setPlotsByFunctions = useCallback((functions) => {
        if (!functions || functions.length === 0) {
            setPlots(Object.keys(PLOTS))
            return
        }

        const res = new Set()
        for (let key in PLOTS) {
            for (let func of PLOTS[key].function) {
                let selected = 0
                for (let selectedFunc of functions) {
                    if (func.indexOf(selectedFunc) > -1) {
                        selected = 1
                        break
                    }
                }
                if (selected) {
                    res.add(key)
                }
            }
        }

        setPlots([...res])
    }, [setPlots])

    let OptionView = GraphOptionViews[currentPlot]

    return (<div className='flex flex-col items-center w-full bg-gray-100' style={{ height: 'calc(100% - 0rem)' }}>
        <Modal fixedModalPosition={{
            left:'20vw',
            top:'10vh',
            width:'60vw'
        }} zIndex={11} isOpen={optionsVisible} onClose={() => { }} setIsOpen={showOptions} onClose={() => {
            showOptions(0)
            // setCode(GraphConfigs[currentPlot].getCode(result), dataset)
        }}>
            {
                GraphOptionViews[currentPlot] ? <OptionView setCode={setCode} dataset={dataset} result={result} showOptions={showOptions}/> : ''
            }
        </Modal>

        <div className='flex justify-between items-center w-full h-auto box-border py-2 px-4'>
            <div className='w-72'>
                <MultiSelect customHeight={'h-10'} customeWidth={'w-72'} ref={ref} defaultOpen={false} defaultText='Select what you need from a graph' selections={Functions} onSelect={e => setPlotsByFunctions(e)} />
            </div>
            <div className='w-72'>
                <DropDown ref={ref} defaultText={'Select Graph Type'} showOnHover={false} customStyle={'h-10 w-72'} customUlStyle={'h-10 w-72'} items={plots} onSelect={e => setCurrentPlot(e)} />
            </div>
            <div className='w-auto flex justify-center items-center'>
                <div className={``}>{activateStatus}</div>
                <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.'/>
            </div>
            <div className='w-72'>
                <Button hasPadding={false} disabled={!currentPlot} text="Options" overrideClass={`w-full rounded font-semibold border focus:outline-none h-10  ${!currentPlot ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} onClick={e => { if (currentPlot) showOptions(1) }} hoverAnimation={false} />
            </div>
            <div className='w-72'>
                <Button hasPadding={false} disabled={!code} text="Run" overrideClass={`w-full rounded font-semibold border focus:outline-none h-10 text-black cursor-pointer ${!code
                     ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} onClick={runCode} hoverAnimation={false} />
            </div>
        </div>
        <div className='flex-grow-1 w-full' ref={codeParent}>
            {code?'':<div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                Select a plot type to see the corresponding code
            </div>}
        </div>
    </div>)
}