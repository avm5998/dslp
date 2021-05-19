import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Modal, Checkbox } from '../../util/ui'
import {DropDown,MultiSelect,Button} from  '../../util/ui_components'
import CommonOption, { setCommonCode, DEFAULT_RESULT } from './commonOption'
import { InlineTip } from '../common/tip'
const defaultResult = { ...DEFAULT_RESULT, ...{} }

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)

    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Common Options</div>
            </div>
            <div className={`grid grid-cols-2 gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`}>
                <Label text='Group By:'><InlineTip info={`Group By`} /></Label>
                <DropDown defaultText='Select Group By' width='w-96' items={dataset.cate_cols} onSelect={e => result.group_by = e} />
                <Label text='X Axis:'><InlineTip info={`X Axis`} /></Label>
                <DropDown defaultText='Select X Axis' width='w-96' items={dataset.num_cols} onSelect={e => result.x = e} />
                <Label text='Y Axis:'><InlineTip info={`Y Axis`} /></Label>
                <DropDown defaultText='Select Y Axis' width='w-96' items={dataset.num_cols} onSelect={e => result.y = e} />
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
                }} width={`w-48 justify-self-end`} text={`Confirm`}/>
            </div>
        </div>

    </>
}

export const config = {
    name: 'Area Graph',
    function: ['Patterns', 'Data over time'],
    getCode: (result, dataset) => {
        let plotOptions = {}
        let prevSteps = [], postSteps = []
        setCommonCode({ dataset, result, plotOptions, postSteps, prevSteps })
        if(result.engine == 'Pandas'){
            if (result.group_by)
                return `df.groupby(['${result.x}','${result.group_by}'])['${result.y}'].sum().unstack().plot.area()`
            else
                return `df.groupby(['${result.x}'])['${result.y}'].sum().plot.area()`
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