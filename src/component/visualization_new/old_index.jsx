import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox, DropDownInput, Input } from '../../util/ui'
import * as echarts from 'echarts';
import 'echarts-gl'

import { useDispatch, useSelector } from 'react-redux';
import { loadScript, useSimpleForm, useToggleGroup } from '../../util/util'
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

for (let e of Graphs) {
    PLOTS[e.config.name] = {
        function: e.config.function
    }

    GraphOptionViews[e.config.name] = e.view
}

const getEChartOption = (dataset, aggregatedDataset, plotType, options) => {
    let res = {}
    let hasRes = true

    for (let e of Graphs) {
        if (plotType == e.config.name) {
            let r = e.config.getOperation({
                dataset, aggregatedDataset, options
            })

            res = r.res
            hasRes = r.hasRes
            break
        }
    }

    return { res, hasRes }
}

const Page = () => {
    const [plots, setPlots] = useState(Object.keys(PLOTS))
    const [optionsVisible, showOptions] = useState(0)
    const [commonOptionsVisible, showCommonOptions] = useState(0)
    const [currentPlot, setCurrentPlot] = useState('')
    let { result, getData } = useSimpleForm()
    let { result: commonResult, getData: getCommonData } = useSimpleForm({ title: {}, toolbox: { feature: {} } })
    const chartRef = useRef()
    const parentRef = useRef()
    const dataset = useSelector(state => state.dataset)
    const dispatch = useDispatch()
    let aggregatedData = useRef()
    let { ref, hide: hideSelections } = useToggleGroup()
    let [currentColor, setCurrentColor] = useState(0)
    let [showColorPicker, setShowColorPicker] = useState(0)
    let [colors,setColors] = useState(['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'])

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

    useEffect(() => {
        let div = document.querySelector('#vis_main')

        chartRef.current = echarts.init(div)

        //load script for box plot
        loadScript('https://cdn.jsdelivr.net/npm/echarts-simple-transform/dist/ecSimpleTransform.min.js', () => {
            let res = {}
            Object.keys(dataset.data).forEach(key => res[key] = [...Object.values(dataset.data[key])])
            aggregatedData.current = res
            echarts.registerTransform(window.ecSimpleTransform.aggregate);
        })
    }, [])

    const confirmOption = () => {
        let { res, hasRes } = getEChartOption(dataset, aggregatedData.current, currentPlot, getData())
        let commonOption = getCommonData()
        commonOption.color = colors
        if (hasRes) {
            chartRef.current.clear()
            chartRef.current.setOption({...res,...commonOption})
        }
    }


    let OptionView = GraphOptionViews[currentPlot]

    return (<div className='flex flex-col items-center w-full bg-gray-100' style={{ height: 'calc(100% - 0rem)' }} ref={parentRef} onClick={e => {
        if (e.target === parentRef.current || e.target === document.querySelector('#vis_main div')) {
            hideSelections()
        }
    }}>
        <Modal isOpen={optionsVisible} onClose={() => { }} setIsOpen={showOptions} contentStyleText="mx-auto mt-20" onClose={() => {
            showOptions(0)
            confirmOption()
        }}>
            {
                GraphOptionViews[currentPlot] ? <OptionView dataset={dataset} result={result} showOptions={showOptions} confirmOption={confirmOption} /> : ''
            }
        </Modal>
        <Modal isOpen={commonOptionsVisible} setIsOpen={showCommonOptions} contentStyleText="mx-auto mt-20" onClose={() => {
            showCommonOptions(0)
        }}>
            <div className='grid grid-cols-4 p-4 gap-4'>
                <Label text='Title' />
                <Input placeholder='Set title' customStyle={'text-center'} onInput={(e) => {
                    commonResult.title.text = e.target.value
                }} />

                <Label text='Title left position' />

                <DropDown defaultText={'Select title left position'} customStyle={'w-64'} customUlStyle={'w-64'} showOnHover={false} additionalInput={true} items={['left', 'center', 'right']} onSelect={(name, index, source) => {
                    commonResult.title.left = name
                }} />

                <Label text='Title top position' />

                <DropDown defaultText={'Select title top position'} customStyle={'w-64'} customUlStyle={'w-64'} showOnHover={false} additionalInput={true} items={['left', 'center', 'right']} onSelect={(name, index, source) => {

                    commonResult.title.top = name
                }} />

                <Label text='Tool box' />
                <MultiSelect defaultText={'Select tools'} customWidth={'w-64'} customHeight={'h-10'} defaultOpen={false}
                    selections={['Data View', 'Restore', 'Save as image']} onSelect={e => {
                        commonResult.toolbox.show = !!e.length

                        if (e.indexOf('Data View') > -1) {
                            commonResult.toolbox.feature.dataView = { readOnly: false }
                        }

                        if (e.indexOf('Restore') > -1) {
                            commonResult.toolbox.feature.restore = {}
                        }

                        if (e.indexOf('Save as image') > -1) {
                            commonResult.toolbox.feature.saveAsImage = {}
                        }
                    }} />

                <Checkbox label={'Enable animation'} defaultChecked={true} onClick={e => {
                    commonResult.animation = e.target.checked
                }} />

                <div className='col-span-3'>
                    {[...Array(9).keys()].map(i =>
                        <button className='m-2' style={{color:colors[i]}} onClick={() => {
                            setCurrentColor(i)
                            setShowColorPicker(s => 1 - s)
                        }}>{'Color'+(i+1)}</button>
                    )}


                    {showColorPicker ? <div className='absolute'><ChromePicker color={colors[currentColor]} onChange={e=>{
                        colors[currentColor] = e.hex
                        setColors([...colors])}}/></div> : null}
                </div>


                <Button onClick={e => {
                    showCommonOptions(0)
                    let data = getCommonData()
                    data.color = colors
                    chartRef.current.setOption(data)
                }} customStyle={`col-span-4 w-48 h-10 justify-self-end`} text={`Confirm`} />
            </div>
        </Modal>
        <div className='grid grid-cols-4 w-full gap-8 p-8 h-auto flex-grow-0'>
            <MultiSelect customHeight={'h-auto'} ref={ref} defaultOpen={false} defaultText='Select what do you need from a graph' selections={Functions} onSelect={e => setPlotsByFunctions(e)} />
            <DropDown ref={ref} defaultText={'Select Graph Type'} showOnHover={false} customStyle={'h-10 w-full'} customUlStyle={'h-10 w-96'} items={plots} onSelect={e => setCurrentPlot(e)} />
            {/* <DropDownInput ref={ref} defaultText={'test'} showOnHover={false} customStyle={'h-12 w-96'} customUlStyle={'h-auto w-96 pt-1 pb-2'} items={['G1','G2','GGGG','asdadsada']} onInput = {(name,index,value)=>{console.log(name,index,value)}} /> */}
            <Button disabled={!currentPlot} text="Options" overrideClass={`rounded font-semibold py-2 px-4 border focus:outline-none h-10 w-auto  ${!currentPlot ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} onClick={e => { if (currentPlot) showOptions(1) }} hoverAnimation={false} />
            <Button text="Common Options" overrideClass={`rounded font-semibold py-2 px-4 border focus:outline-none h-10 w-auto text-black cursor-pointer`} onClick={e => { showCommonOptions(1) }} hoverAnimation={false} />
        </div>

        <div className='flex-grow-1 w-full'>
            <div id='vis_main' className='h-full w-full' >
            </div>
        </div>
    </div>)
}

export default Page