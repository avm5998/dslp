import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
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
    </>
}

export const config = {
    name: 'Line Graph',
    function: ['Patterns', 'Change over Time'],
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