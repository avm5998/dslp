import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import CommonOption,{setCommonCode,DEFAULT_RESULT} from './commonOption'
const defaultResult = {...DEFAULT_RESULT,...{}}

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.x = e} />
            <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.y = e} />
            <Button onClick={e => {
                showOptions(0)
                setCode(config.getCode({...defaultResult,...result}, dataset))
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Bar Chart',
    function: ['Comparisons', 'Patterns'],
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
df.plot.bar(${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}
`
},
    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let res = {}, hasRes = true
        if (options.x && options.y) {
            let { x, y } = options
            res.xAxis = {}
            res.yAxis = {}
            res.series = [{}]
            let xdata = Object.values(dataset.data[x]), ydata = Object.values(dataset.data[y])
            let data = []
            for (let i = 0; i < xdata.length; i++) {
                data.push([xdata[i], ydata[i]])
            }

            let sort = options.sort || 'X from Low to High'
            res.xAxis.type = dataset.num_cols.indexOf(x) !== -1 ? 'value' : 'category'
            res.yAxis.type = dataset.num_cols.indexOf(y) !== -1 ? 'value' : 'category'
            if (sort === 'X from Low to High') {
                data.sort((a, b) => a[0] < b[0] ? -1 : 1)
            }
            if (sort === 'X from High to Low') {
                data.sort((a, b) => a[0] < b[0] ? 1 : -1)
            }
            if (sort === 'Y from Low to High') {
                data.sort((a, b) => a[1] < b[1] ? -1 : 1)
            }
            if (sort === 'Y from High to Low') {
                data.sort((a, b) => a[1] < b[1] ? 1 : -1)
            }
            res.series[0].data = data
            res.series[0].type = 'bar'
            res.series[0].smooth = !!options.smoothed
        } else {
            hasRes = false
        }
        return { res, hasRes }
    }
}


export default {
    config, view
}