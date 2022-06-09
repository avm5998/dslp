import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input,Label, Modal, Checkbox } from '../../util/ui'
import { MultiSelect, DropDown, Button } from '../../util/ui_components' 
import { InlineTip } from '../common/tip'
import CommonOption,{setCommonCode,DEFAULT_RESULT} from './commonOption'
const defaultResult = {...DEFAULT_RESULT,...{}}


export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)
    let defaultx = ['--']

    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab==0?'border-b-2 font-bold cursor-default':'cursor-pointer'}`} onClick={e=>setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab==1?'border-b-2 font-bold cursor-default':'cursor-pointer'}`} onClick={e=>setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab==2?'border-b-2 font-bold cursor-default':'cursor-pointer'}`} onClick={e=>setActiveTab(2)}>Common Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab==0?'':'hidden'}`} style={{
                gridTemplateColumns:'10vw 1fr 10vw 1fr'
            }}>
                <Label text='X Axis:'><InlineTip info={`*Optional. Must be int or float type\nData distributed on selected column. Recommend using a column with distinct and continuous values (such as index, id, etc.).`}/></Label>
                <DropDown defaultText='Select X Axis' width='w-60' showOnHover={false} items={[...defaultx, ...dataset.num_cols]} onSelect={e=>result.x = e=='--'?null:e} zIndex={100} />
                <Label text='Y Axis:'><InlineTip info={`*Required. Must be int or float type\nThe data displayed on Y Axis.`}/></Label>
                <DropDown defaultText='Select Y Axis' width='w-60' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.y = e} zIndex={100} />
        
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
    name: 'Line Graph',
    function: ['Patterns', 'Change over Time'],
    getCode: (result,dataset)=>{
        let plotOptions = {
            // x:`"${result.x}"`,
            // y:`"${result.y}"`,
        }
        if (result.x) {
            plotOptions['x'] = `"${result.x}"`
        }
        plotOptions['y'] = `"${result.y}"`
        let prevSteps=[],postSteps = []
        setCommonCode({dataset,result,plotOptions,postSteps,prevSteps})
        
        let dfplotArgs = []
        for (let k in plotOptions){
            dfplotArgs.push(`${k}=${plotOptions[k]}`)
        }
if(result.engine == 'Pandas'){
        return `${prevSteps.length?prevSteps.join('\n'):''}
df.plot(${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}
    `
}else if(result.engine == 'Plotly'){
        return`${prevSteps.length?prevSteps.join('\n'):''}
fig = px.line(df, ${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}
fig.show()
`
}
}
,
    getOperation: ({aggregatedDataset,dataset,options}) => {
        let hasRes = true, res = {}
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
        return {res,hasRes}
    }
}


export default {
    config,view
}