import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import * as echarts from 'echarts';
import 'echarts-gl'

import { useDispatch, useSelector } from 'react-redux';
import {loadScript, useSimpleForm, useToggleGroup} from '../../util/util'
// import {TooltipComponent} from 'echarts/components';
import RadarGraph from './radarGraph'
import AreaGraph from './areaGraph'
import CandleStickChart from './candleStickChart'
const Graphs = [
    RadarGraph,
    AreaGraph,
    CandleStickChart,
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
]

const PLOTS = {
    'Line Graph': {
        function: ['Patterns', 'Change over Time']
    },
    'Bar Chart': {
        function: ['Comparisons', 'Patterns']
    },
    'Box Plot': {
        function: ['Distribution', 'Range']
    },
    'Histogram': {
        function: ['Comparisons', 'Change over Time', 'Distribution', 'Patterns', 'Range']
    },
    'Pie Chart': {
        function: ['Comparisons', 'Proportions']
    },
    'Scatter Plot': {
        function: ['Comparisons', 'Relationships']
    },
    '3D Scatter Plot': {
        function: ['Comparisons', 'Relationships']
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
            res = e.config.getOperation({
                dataset, aggregatedDataset,options
            })
            break
        }
    }

    if (plotType === 'Line Graph'){
        if(options.x && options.y){
            let {x,y} = options
            res.xAxis = {}
            res.yAxis = {}
            res.series = [{}]
            let xdata = Object.values(dataset.data[x]), ydata = Object.values(dataset.data[y])
            let data = []
            for(let i = 0;i<xdata.length;i++){
                data.push([xdata[i], ydata[i]])
            }

            let sort = options.sort || 'X from Low to High'
            res.xAxis.type = dataset.num_cols.indexOf(x)!==-1?'value':'category'
            res.yAxis.type = dataset.num_cols.indexOf(y)!==-1?'value':'category'
            if (sort === 'X from Low to High'){
                data.sort((a,b)=>a[0]<b[0]?-1:1)
            }
            if (sort === 'X from High to Low'){
                data.sort((a,b)=>a[0]<b[0]?1:-1)
            }
            if (sort === 'Y from Low to High'){
                data.sort((a,b)=>a[1]<b[1]?-1:1)
            }
            if (sort === 'Y from High to Low'){
                data.sort((a,b)=>a[1]<b[1]?1:-1)
            }
            res.series[0].data = data
            res.series[0].type = 'line'
            res.series[0].smooth = !!options.smoothed
        }else{
            hasRes = false
        }
    }

    if (plotType === 'Bar Chart'){
        if(options.x && options.y){
            let {x,y} = options
            res.xAxis = {}
            res.yAxis = {}
            res.series = [{}]
            let xdata = Object.values(dataset.data[x]), ydata = Object.values(dataset.data[y])
            let data = []
            for(let i = 0;i<xdata.length;i++){
                data.push([xdata[i], ydata[i]])
            }

            let sort = options.sort || 'X from Low to High'
            res.xAxis.type = dataset.num_cols.indexOf(x)!==-1?'value':'category'
            res.yAxis.type = dataset.num_cols.indexOf(y)!==-1?'value':'category'
            if (sort === 'X from Low to High'){
                data.sort((a,b)=>a[0]<b[0]?-1:1)
            }
            if (sort === 'X from High to Low'){
                data.sort((a,b)=>a[0]<b[0]?1:-1)
            }
            if (sort === 'Y from Low to High'){
                data.sort((a,b)=>a[1]<b[1]?-1:1)
            }
            if (sort === 'Y from High to Low'){
                data.sort((a,b)=>a[1]<b[1]?1:-1)
            }
            res.series[0].data = data
            res.series[0].type = 'bar'
            res.series[0].smooth = !!options.smoothed
        }else{
            hasRes = false
        }
    }

    if(plotType == 'Box Plot'){
        if(options.category && options.target){
            let {category, target} = options
            
            res = {
                dataset: [{
                    id: 'raw',
                    source: aggregatedDataset
                }, {
                    id: 'aggregated_data',
                    fromDatasetId: 'raw',
                    transform: [{
                        type: 'ecSimpleTransform:aggregate',
                        config: {
                            resultDimensions: [
                                { name: 'min', from: target, method: 'min' },
                                { name: 'Q1', from: target, method: 'Q1' },
                                { name: 'median', from: target, method: 'median' },
                                { name: 'Q3', from: target, method: 'Q3' },
                                { name: 'max', from: target, method: 'max' },
                                { name: category, from: category }
                            ],
                            groupBy: category
                        }
                    }, {
                        type: 'sort',
                        config: {
                            dimension: 'Q3',
                            order: 'asc'
                        }
                    }]
                }],
                title: {
                    text: ''
                },
                tooltip: {
                    show:true,
                    trigger: 'axis',
                    confine: true
                },
                xAxis: {
                    name: target,
                    nameLocation: 'middle',
                    nameGap: 30,
                    scale: true,
                },
                yAxis: {
                    type: 'category'
                },
                grid: {
                    bottom: 100
                },
                legend: {
                    selected: { detail: false }
                },
                dataZoom: [{
                    type: 'inside'
                }, {
                    type: 'slider',
                    height: 20,
                }],
                series: [{
                    name: 'boxplot',
                    type: 'boxplot',
                    datasetId: 'aggregated_data',
                    itemStyle: {
                        color: '#b8c5f2'
                    },
                    encode: {
                        x: ['min', 'Q1', 'median', 'Q3', 'max'],
                        y: category,
                        itemName: [category],
                        tooltip: ['min', 'Q1', 'median', 'Q3', 'max']
                    }
                }]
            };
        }else{
            hasRes = false
        }
    }

    if(plotType === 'Pie Chart'){
        if(options.category){
            let {category} = options
            let counter = {}, data = []
            aggregatedDataset[category].forEach(e=>{
                counter[e] = (counter[e] || 0) + 1
            })

            for(let key in counter){
                data.push({
                    value:counter[key],
                    name:key
                })
            }

            res = {
                title: {
                    text: '',
                    subtext: '',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                },
                series: [
                    {
                        name: 'data',
                        type: 'pie',
                        radius: '50%',
                        data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
        }else{
            hasRes = false
        }
    }

    if (plotType === 'Scatter Plot'){
        if(options.x && options.y){
            let {x,y} = options
            res.xAxis = {}
            res.yAxis = {}
            res.series = [{}]
            let xdata = Object.values(dataset.data[x]), ydata = Object.values(dataset.data[y])
            let data = []
            for(let i = 0;i<xdata.length;i++){
                data.push([xdata[i], ydata[i]])
            }

            let sort = options.sort || 'X from Low to High'
            // res.xAxis.type = dataset.num_cols.indexOf(x)!==-1?'value':'category'
            // res.yAxis.type = dataset.num_cols.indexOf(y)!==-1?'value':'category'
            res.xAxis.scale = true
            res.yAxis.scale = true
            if (sort === 'X from Low to High'){
                data.sort((a,b)=>a[0]<b[0]?-1:1)
            }
            if (sort === 'X from High to Low'){
                data.sort((a,b)=>a[0]<b[0]?1:-1)
            }
            if (sort === 'Y from Low to High'){
                data.sort((a,b)=>a[1]<b[1]?-1:1)
            }
            if (sort === 'Y from High to Low'){
                data.sort((a,b)=>a[1]<b[1]?1:-1)
            }
            res.series[0].data = data
            res.series[0].type = 'scatter'
        }else{
            hasRes = false
        }
    }

    if (plotType === '3D Scatter Plot'){
        if(options.x && options.y && options.z){
            let {x,y,z} = options

            res = {
                grid3D: {},
                xAxis3D: {
                    // type:'category'
                    type: dataset.num_cols.indexOf(x)!==-1?'value':'category'
                },
                yAxis3D: {
                    type: dataset.num_cols.indexOf(y)!==-1?'value':'category'
                },
                zAxis3D: {
                    type: dataset.num_cols.indexOf(z)!==-1?'value':'category'
                },
                dataset: {
                    id:'raw',
                    source:aggregatedDataset
                },
                series: [
                    {
                        type: 'scatter3D',
                        symbolSize: 2.5,
                        encode: {
                            x,y,z,
                            tooltip: [0, 1, 2, 3, 4]
                        }
                    }
                ]
            };
        }else{
            hasRes = false
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
        let height = parentRef.current.getBoundingClientRect().height
        let width = parentRef.current.getBoundingClientRect().width
        let div = document.querySelector('#vis_main')
        div.style.setProperty('height', Number(height * 5 / 6).toFixed(0) + 'px')
        div.style.setProperty('width', width + 'px')

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

    return (<div className='flex flex-col items-center w-full h-screen bg-gray-100' ref={parentRef} onClick={e=>{
        if(e.target === parentRef.current || e.target === document.querySelector('#vis_main div')){
            hideSelections()
        }
    }}>
        <div className='block w-full' style={{minHeight:'40px'}}></div>
        <Modal isOpen={optionsVisible} onClose={() => { }} setIsOpen={showOptions} contentStyleText="mx-auto mt-20" onClose={()=>{
            showOptions(0)
            confirmOption()
        }}>
            {currentPlot === 'Line Graph'?<>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.x = e}/>
                <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.y = e}/>
                <DropDown defaultText='Sort' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={['X from Low to High','X from High to Low','Y from Low to High','Y from High to Low']} onSelect={e=>result.sort = e}/>
                <Checkbox label={'Smoothed'} defaultChecked={false} onChange={e=>result.smoothed = e.target.checked}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
            </>:''}

            {currentPlot === 'Bar Chart'?<>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.x = e}/>
                <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.y = e}/>
                <DropDown defaultText='Sort' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={['X from Low to High','X from High to Low','Y from Low to High','Y from High to Low']} onSelect={e=>result.sort = e}/>
                <Checkbox label={'Smoothed'} defaultChecked={false} onChange={e=>result.smoothed = e.target.checked}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
            </>:''}

            {currentPlot === 'Box Plot'?<>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select Category' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cate_cols} onSelect={e=>result.category = e}/>
                <DropDown defaultText='Select Aggregation Target' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.target = e}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
            </>:''}

            {currentPlot === 'Pie Chart'?<>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select Category' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cate_cols} onSelect={e=>result.category = e}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
            </>:''}

            {currentPlot === 'Scatter Plot'?<>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.x = e}/>
                <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.y = e}/>
                <DropDown defaultText='Sort' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={['X from Low to High','X from High to Low','Y from Low to High','Y from High to Low']} onSelect={e=>result.sort = e}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
            </>:''}

            {currentPlot === '3D Scatter Plot'?<>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.x = e}/>
                <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.y = e}/>
                <DropDown defaultText='Select Z Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e=>result.z = e}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
            </>:''}

            {
                GraphOptionViews[currentPlot]?<OptionView dataset={dataset} result={result} showOptions={showOptions} confirmOption={confirmOption}/>:''
            }
        </Modal>

        <div className='grid grid-cols-3 w-full gap-8 p-8 h-1/6'>
            <MultiSelect ref={ref} defaultOpen={false} defaultText='Select what do you need from a graph' selections={Functions} onSelect={e => setPlotsByFunctions(e)} />
            <DropDown ref={ref} defaultText={'Select Graph Type'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={plots} onSelect={e => setCurrentPlot(e)} />
            <Button disabled={!currentPlot} text="Options" overrideClass={`rounded font-semibold py-2 px-4 border focus:outline-none h-10 w-auto  ${!currentPlot?'text-gray-400 cursor-default':'text-black cursor-pointer'}`} onClick={e => { if (currentPlot) showOptions(1) }} hoverAnimation={false} />
        </div>

        <div>
            <div id='vis_main' className='' width='1000px' height='800px'>
            </div>
        </div>
    </div>)
}

export default Page