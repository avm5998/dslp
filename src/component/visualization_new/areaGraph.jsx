import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Modal, Checkbox } from '../../util/ui'
import { fetchByJSON } from '../../util/util'
import { DropDown, MultiSelect, Button } from  '../../util/ui_components'
import CommonOption, { setCommonCode, DEFAULT_RESULT } from './commonOption'
import { InlineTip } from '../common/tip'
const defaultResult = { ...DEFAULT_RESULT, ...{} }

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)

    // tried to transmit and display chart data through react-chartkick in visualization page, but didn't work
    // useEffect(async (result, dataset) => {
    //     let jres = await fetchByJSON('v_area', {
    //         cond: JSON.stringify(result),
    //         filename: dataset.filename
    //     })
    //     let json = await jres.json()
    //     // return json.res
    //     setLocalData(json.res)
    // }, [])

    // const getChartData = async (result, dataset) => {
    //     let jres = await fetchByJSON('v_area', {
    //         cond: JSON.stringify(result),
    //         filename: dataset.filename
    //     })
    //     let json = await jres.json()
    //     // return json.res
    //     setLocalData(json.res)
    // }

    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Common Options</div>
            </div>
            <div className={`grid grid-cols-2 gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns:'10vw 1fr 10vw 1fr'
            }}>
                <Label text='Group By:'><InlineTip info={`*Required. Must be string or object type\nSeperation of different groups based on selected column. Each object in selected column will be displayed as a distinct area.`} /></Label>
                <DropDown defaultText='Select Group By' width='w-60' items={dataset.cate_cols} onSelect={e => result.group_by = e} zIndex={100} />
                <Label text='X Axis:'><InlineTip info={`*Required. Must be int or float type\nDistribution on x-axis based on selected column. The selected column will be represented as x-axis.`} /></Label>
                <DropDown defaultText='Select X Axis' width='w-60' items={dataset.num_cols} onSelect={e => result.x = e} zIndex={99} />
                <Label text='Y Axis:'><InlineTip info={`*Required. Must be int or float type\nThe aggregation of selected column at each x index and group. The sum of selected column will be represented as y-axis.`} /></Label>
                <DropDown defaultText='Select Y Axis' width='w-60' items={dataset.num_cols} onSelect={e => result.y = e} zIndex={98}/>
                <Label text='Result transformation'><InlineTip info={`*Optional\nApplying math transformation to calculated value on y-axis`} /></Label>
                <DropDown defaultText='Convert type' width='w-60' items={['--', 'Logarithm', 'Square root', 'Exponential', 'Logit']} onSelect={(e, i) => result.res_trans = e=='--'?null:e} defaultValue={'--'} zIndex={97} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab==1?'hidden':'hidden'}`} style={{
                gridTemplateColumns:'5vw 1fr 10vw 1fr'
            }}>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab==2?'':'hidden'}`} style={{
                gridTemplateColumns:'10vw 1fr 10vw 1fr'
            }}>
                <CommonOption dataset={dataset} result={result}/>
            </div>
            <div className='flex justify-end'>
                <Button onClick={e=>{
                    showOptions(0)
                    setCode(config.getCode({...defaultResult,...result}, dataset))
                    // getChartData(result, dataset)
                    // setChartData(localData)
                    // console.log(localData)
                }} width={`w-48 justify-self-end`} text={`Confirm`}/>
            </div>
        </div>

    </>
}

export const config = {
    name: 'Area Graph',
    function: ['Patterns', 'Data over time'],
    getCode: (result, dataset) => {
        let lambda = {
            'Logarithm': 'math.log(x,10)',
            'Square root': 'math.sqrt(x)',
            'Exponential': 'math.pow(math.e,x)',
            'Logit': 'math.log(x/(1-x),10)',
        }[result.res_trans]
        let plotOptions = {}
        let prevSteps = [], postSteps = []
        setCommonCode({ dataset, result, plotOptions, postSteps, prevSteps })
        let currentCode = ''
        if(result.engine == 'Pandas'){
            let dfplotArgs = []
            for (let k in plotOptions){
                dfplotArgs.push(`${k}=${plotOptions[k]}`)
            }
            if (result.group_by) {
                if (result.res_trans) {
                    currentCode = `df.groupby(['${result.x}','${result.group_by}'])['${result.y}'].sum().apply(lambda x:${lambda}).unstack().plot.area(${dfplotArgs.join(',')})`
                    // return `df.groupby(['${result.x}','${result.group_by}'])['${result.y}'].sum().apply(lambda x:${lambda}).unstack().plot.area()`
                } else {
                    currentCode = `df.groupby(['${result.x}','${result.group_by}'])['${result.y}'].sum().unstack().plot.area(${dfplotArgs.join(',')})`
                    // return `df.groupby(['${result.x}','${result.group_by}'])['${result.y}'].sum().unstack().plot.area()`
                }
            } else {
                if (result.res_trans) {
                    currentCode = `df.groupby(['${result.x}'])['${result.y}'].sum().apply(lambda x:${lambda}).plot.area(${dfplotArgs.join(',')})`
                    // return `df.groupby(['${result.x}'])['${result.y}'].sum().apply(lambda x:${lambda}).plot.area()`
                } else {
                    currentCode = `df.groupby(['${result.x}'])['${result.y}'].sum().plot.area(${dfplotArgs.join(',')})`
                    // return `df.groupby(['${result.x}'])['${result.y}'].sum().plot.area()`
                }
            }
            return `${prevSteps.length?prevSteps.join('\n'):''}
${currentCode}
${postSteps.length?postSteps.join('\n'):''}`
        }else if(result.engine == 'Plotly'){
            return `fig = px.area(df, x="${result.x}", y="${result.y}", color="${result.group_by}",line_group="${result.group_by}")
fig.show()`
        }
    },
    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let hasRes = true
        let xdata = aggregatedDataset[options.x], ydata = aggregatedDataset[options.y]
        let res = {
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xdata
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: ydata,
                type: 'line',
                areaStyle: {}
            }]
        };

        return { res, hasRes }
    }
}


export default {
    config, view
}