import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox, DropDownInput } from '../../util/ui'
import * as echarts from 'echarts';
import 'echarts-gl'

import { useDispatch, useSelector } from 'react-redux';
import {loadScript, useSimpleForm, useToggleGroup} from '../../util/util'
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

const PLOTS = {
    'Histogram': {
        function: ['Comparisons', 'Change over Time', 'Distribution', 'Patterns', 'Range']
    },
}

let GraphOptionViews = {}

for(let e of Graphs){
    PLOTS[e.config.name] = {
        function:e.config.function
    }

    GraphOptionViews[e.config.name] = e.view
}

const getEChartOption = (dataset, aggregatedDataset, plotType, options)=>{
    let res = {}
    let hasRes = true

    for(let e of Graphs){
        if(plotType == e.config.name){ 
            let r = e.config.getOperation({
                dataset, aggregatedDataset,options
            })

            res = r.res
            hasRes = r.hasRes
            break
        }
    }

    return {res,hasRes}
}

const Page = () => {
    const [plots, setPlots] = useState(Object.keys(PLOTS))
    const [optionsVisible, showOptions] = useState(0)
    const [currentPlot, setCurrentPlot] = useState('')
    let {result, getData} = useSimpleForm()
    const chartRef = useRef()
    const parentRef = useRef()
    const dataset = useSelector(state => state.dataset)
    const dispatch = useDispatch()
    let aggregatedData = useRef()
    let {ref,hide:hideSelections} = useToggleGroup()
    
    const setPlotsByFunctions = useCallback((functions) => {
        if (!functions || functions.length === 0){
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

    useEffect(() => {
        let div = document.querySelector('#vis_main')

        chartRef.current = echarts.init(div)

        //load script for box plot
        loadScript('https://cdn.jsdelivr.net/npm/echarts-simple-transform/dist/ecSimpleTransform.min.js',()=>{
            let res = {}
            Object.keys(dataset.data).forEach(key=>res[key] = [...Object.values(dataset.data[key])])
            aggregatedData.current = res
            echarts.registerTransform(window.ecSimpleTransform.aggregate);
            // chartRef.current.setOption({
            //     grid3D: {},
            //     xAxis3D: {},
            //     yAxis3D: {},
            //     zAxis3D: {},
            //     series: [{
            //         type: 'scatter3D',
            //         symbolSize: 50,
            //         data: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
            //         itemStyle: {
            //             opacity: 1
            //         }
            //     }]
            // })
        })
    }, [])

    const confirmOption = ()=>{
        let {res,hasRes} = getEChartOption(dataset, aggregatedData.current, currentPlot, getData())
        if (hasRes){
            chartRef.current.clear()
            chartRef.current.setOption(res)
        }
    }


    let OptionView = GraphOptionViews[currentPlot]

    return (<div className='flex flex-col items-center w-full bg-gray-100' style={{height:'calc(100% - 4rem)'}} ref={parentRef} onClick={e=>{
        if(e.target === parentRef.current || e.target === document.querySelector('#vis_main div')){
            hideSelections()
        }
    }}>
        <Modal isOpen={optionsVisible} onClose={() => { }} setIsOpen={showOptions} contentStyleText="mx-auto mt-20" onClose={()=>{
            showOptions(0)
            confirmOption()
        }}>

            {
                GraphOptionViews[currentPlot]?<OptionView dataset={dataset} result={result} showOptions={showOptions} confirmOption={confirmOption}/>:''
            }
        </Modal>
        <div className='grid grid-cols-3 w-full gap-8 p-8 h-auto flex-grow-0'>
            <MultiSelect customHeight={'h-auto'} ref={ref} defaultOpen={false} defaultText='Select what do you need from a graph' selections={Functions} onSelect={e => setPlotsByFunctions(e)} />
            <DropDown ref={ref} defaultText={'Select Graph Type'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={plots} onSelect={e => setCurrentPlot(e)} />
            {/* <DropDownInput ref={ref} defaultText={'test'} showOnHover={false} customStyle={'h-12 w-96'} customUlStyle={'h-auto w-96 pt-1 pb-2'} items={['G1','G2','GGGG','asdadsada']} onInput = {(name,index,value)=>{console.log(name,index,value)}} /> */}
            <Button disabled={!currentPlot} text="Options" overrideClass={`rounded font-semibold py-2 px-4 border focus:outline-none h-10 w-auto  ${!currentPlot?'text-gray-400 cursor-default':'text-black cursor-pointer'}`} onClick={e => { if (currentPlot) showOptions(1) }} hoverAnimation={false} />
        </div>

        <div className='flex-grow-1 w-full'>
            <div id='vis_main' className='h-full w-full' >
            </div>
        </div>
    </div>)
}

export default Page