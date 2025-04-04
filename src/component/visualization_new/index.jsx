import React, { useCallback, useEffect, useState, useRef } from 'react'
import { LineChart, AreaChart } from 'react-chartkick'
import { Label, Button, Modal, Checkbox, DropDownInput, Input } from '../../util/ui'
import { MultiSelect, DropDown } from '../../util/ui_components'

import { useDispatch, useSelector } from 'react-redux';
import { loadScript, useSimpleForm, useToggleGroup, fetchByJSON, useCachedData, toUnicode } from '../../util/util'
// import {TooltipComponent} from 'echarts/components';

import AreaGraph from './areaGraph'
import BarChart from './barChart'
import BoxPlot from './boxPlot'
import CandleStickChart from './candleStickChart'
import LineGraph from './lineGraph'
import Histogram from './histogram'
import Heatmap from './heatmap'
import PieChart from './pieChart'
import RadarGraph from './radarGraph'
import ScatterPlot from './scatterPlot'
import ThreeDScatterPlot from './threeDScatterPlot'
import NightingaleRoseChart from './nightingaleRoseChart';
import { ChromePicker } from 'react-color';
import './index.css'
import { InlineTip } from '../common/tip';
import Waffle from './waffleChart'
//
const Graphs = [
    AreaGraph,
    BarChart,
    BoxPlot,
    // CandleStickChart,
    Histogram,
    LineGraph,
    // NightingaleRoseChart,
    PieChart,
    Heatmap,
    // RadarGraph,
    ScatterPlot,
    // ThreeDScatterPlot,
    // Waffle
]

const Functions = [
    'Distribution',
    'Range',
    'Patterns',
    'Change over Time',
    'Comparisons',
    'Proportions',
    'Relationships',
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

const initialCode = data => `import pandas as pd
from io import StringIO
import numpy as np
import math
import matplotlib.pyplot as plt
import plotly.express as px

data_json = StringIO(r"""${toUnicode(data)}""")
df = pd.read_json(data_json)

`


export default function ({ location }) {
    useCachedData()
    const [plots, setPlots] = useState(Object.keys(PLOTS))
    const [optionsVisible, showOptions] = useState(0)
    let { ref, hide: hideSelections } = useToggleGroup()
    const [currentPlot, setCurrentPlot] = useState('')
    const [code, setCode] = useState('')
    const [activateStatus, setActivateStatus] = useState('Loading...')
    let [dfJSON, setDfJSON] = useState('')//dataframe json
    let dataset = useSelector(state => state.dataset)
    let { result, getData } = useSimpleForm()
    let codeParent = useRef()
    let kernelRef = useRef()
    let [guideStep, setGuideStep] = useState(0)
    let [image, setImage] = useState('')

    useEffect(() => {
        switch (guideStep) {
            case 0:
                if (location?.state?.guide) {
                    setGuideStep(1)
                }
                break
            case 1:
                document.querySelector('#functionSelection')?.classList.add('btn-blink')
                document.querySelector('#functionSelection+div div:nth-child(5)')?.classList.add('btn-inner-blink')
                break
            case 2:
                document.querySelector('#functionSelection')?.classList.remove('btn-blink')
                document.querySelector('#functionSelection+div div:nth-child(5)')?.classList.remove('btn-blink')
                document.querySelector('#graphTypeSelection')?.classList.add('btn-blink')
                document.querySelector('#graphTypeSelection+div div:nth-child(5)')?.classList.add('btn-inner-blink')
                break
            case 3:
                document.querySelector('#graphTypeSelection')?.classList.remove('btn-blink')
                document.querySelector('#graphTypeSelection+div div:nth-child(5)')?.classList.remove('btn-inner-blink')
                document.querySelector('#optionsButton')?.classList.add('btn-blink')
                break
            case 4:
                document.querySelector('#optionsButton')?.classList.remove('btn-blink')
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown button')[0]?.classList.add('btn-blink')
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown ul li:nth-child(3)')[0]?.classList.add('btn-inner-blink')
                break
            case 5:
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown button')[0]?.classList.remove('btn-blink')
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown ul li:nth-child(3)')[0]?.classList.remove('btn-inner-blink')
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown button')[1]?.classList.add('btn-blink')
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown ul li:nth-child(2)')[1]?.classList.add('btn-inner-blink')
                break
            case 6:
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown button')[1]?.classList.remove('btn-blink')
                document.querySelectorAll('#visModal>div>div:nth-child(2) .dropdown ul li:nth-child(2)')[1]?.classList.remove('btn-inner-blink')
                document.querySelector('#scatterPlotConfirm')?.classList.add('btn-blink')
                break
            case 7:
                document.querySelector('#scatterPlotConfirm')?.classList.remove('btn-blink')
                document.querySelector('#runButton')?.classList.add('btn-blink')
                break
            case 8:
                document.querySelector('#runButton')?.classList.remove('btn-blink')
                break
        }
    }, [guideStep])

    //Not just rerun the current code
    //It's reinject the data and rerun the current code
    const runCode = async (e) => {
        let res = await kernelRef.current.requestExecute({ code: initialCode(dfJSON) }).done
        if(guideStep == 7) setGuideStep(8)
        // console.log(res);
        // console.log(result)
        document.querySelector('.thebelab-run-button').click()
    }

    useEffect(() => {
        if (!code) return
        codeParent.current.innerHTML = ''
        let pre = document.createElement('pre')
        pre.setAttribute('data-executable', 'true')
        pre.setAttribute('data-language', 'python')
        codeParent.current.appendChild(pre)
        pre.innerHTML = code
        thebelab.bootstrap();
        // console.log("image", image)
    }, [code])

    //start thebelab automatically
    //load current dataframe
    useEffect(() => {
        if (!dataset.filename) {
            setActivateStatus('No data')
            return
        }

        thebelab.bootstrap();

        //excute code in advance on thebelab to import libraries and set dataframe variable
        thebelab.on("status", async function (evt, data) {
            if (data.status === 'ready' && dataset.filename) {
                let res = await fetchByJSON('current_data_json', {
                    filename: dataset.filename
                })

                let g = await res.json()
                kernelRef.current = data.kernel
                // alert('X')
                let res2 = await data.kernel.requestExecute({ code: initialCode(g.data) }).done
                setDfJSON(g.data)
                setActivateStatus('Ready')
                // document.getElementById("img1").src = image
            }
            // console.log("Status changed:", data.status, data.message);
        })

    }, [dataset.filename])

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
        <Modal id="visModal" fixedModalPosition={{
            left: '20vw',
            top: '10vh',
            width: 'fit-content'
        }} zIndex={11} isOpen={optionsVisible} setIsOpen={showOptions} onClose={() => {
            showOptions(0)
            // setCode(GraphConfigs[currentPlot].getCode(result), dataset)
        }}>
            {
                GraphOptionViews[currentPlot] ? <OptionView guideStep={guideStep} setGuideStep={setGuideStep} setCode={setCode} /*setChartData={setChartData}*/ setImage={setImage} dataset={dataset} result={result} showOptions={showOptions} /> : ''
            }
        </Modal>

        <div className='flex justify-between items-center w-full h-20 box-border py-2 px-4 shadow-md' style={{ zIndex: 10 }}>
            <div className='w-72 px-1'>
                <MultiSelect id="functionSelection" ref={ref} defaultText='Select graph property' selections={Functions} onSelect={e => {
                    setPlotsByFunctions(e)
                    if (guideStep == 1) setGuideStep(2)
                }} customStyle={{ fontSize: 'medium' }} />
            </div>
            <div className='w-72 px-1'>
                <DropDown id="graphTypeSelection" ref={ref} defaultText={'Select Graph Type'} width={'w-72'} items={plots} onSelect={e => {
                    setCurrentPlot(e)
                    if (guideStep == 2) setGuideStep(3)
                }} />
            </div>
            {/* <div className='w-auto flex justify-center items-center px-1'>
                <InlineTip info='<Type description>' />
            </div> */}
            <div className='w-auto flex justify-center items-center px-1'>
                <div className={``}>{activateStatus}</div>
                <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
            </div>
            <div className='w-72 px-1'>
                <Button id="optionsButton" hasPadding={false} disabled={!currentPlot} text="Options" overrideClass={`w-full rounded font-semibold border focus:outline-none h-10  ${!currentPlot ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} onClick={e => { 
                    if (currentPlot) showOptions(1) 
                    if (guideStep == 3) setGuideStep(4)
                }} hoverAnimation={false} />
            </div>
            <div className='w-72 px-1'>
                <Button id="runButton" hasPadding={false} disabled={!code} text="Run" overrideClass={`w-full rounded font-semibold border focus:outline-none h-10 text-black cursor-pointer ${!code
                    ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} onClick={runCode} hoverAnimation={false} />
            </div>
        </div>
        <div className='flex-grow-1 w-full' ref={codeParent}>
            {code ? '' : <div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                Select a plot type to see the corresponding code
            </div>}
        </div>
        {/* section below is for getting img from local backend instead of server kernel */}
        {/* <div className='flex-grow-1 w-full' >
            <img id="img1" src={image} />
        </div> */}
    </div>)
}