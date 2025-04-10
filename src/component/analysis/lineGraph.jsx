import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input,Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import { InlineTip } from '../common/tip'
import CommonOption,{setCommonCode,DEFAULT_RESULT} from './commonOption'
const defaultResult = {...DEFAULT_RESULT,...{}}


export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)

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
                <Label text='X Axis:'><InlineTip info={`*Required\nThe data on X Axis`}/></Label>
                <DropDown defaultText='Select X Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e=>result.x = e}/>
                <Label text='Y Axis:'><InlineTip info={`*Required\nThe data on Y Axis`}/></Label>
                <DropDown defaultText='Select Y Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e=>result.y = e}/>
                <Label text='Transformation column:'><InlineTip info={`Apply transformation function to a column, the code are straight forward and you can modify the code to transform more columns `}/></Label>
                <DropDown defaultText='Column' customStyle='w-60' showOnHover={false} blankOption={'Do not transform'} items={dataset.cols} onSelect={(e,i)=>result.trans_col = e}/>
                <Label text='Transformation function:'><InlineTip info={`Transformation type, Logarithm function is: f(x)=log10(x), Exponential function is: f(x)=e^x`}/></Label>
                <DropDown defaultText='Convert type' customStyle='w-60' showOnHover={false} items={['Logarithm','Square root','Exponential','Logit']} onSelect={(e,i)=>result.trans_fn = e}/>
        
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
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>

        </div>
    </>
}


export const config = {
    name: 'Line Graph',
    function: ['Patterns', 'Change over Time'],
    getCode: (result,dataset)=>{
        let plotOptions = {
            x:`"${result.x}"`,
            y:`"${result.y}"`,
        }
        let prevSteps=[],postSteps = []
        setCommonCode({dataset,result,plotOptions,postSteps,prevSteps})
        
        let dfplotArgs = []
        for (let k in plotOptions){
            dfplotArgs.push(`${k}=${plotOptions[k]}`)
        }

        return `${prevSteps.length?prevSteps.join('\n'):''}
df.plot(${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}
`
},
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