import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select Variable' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.x = e}/>
                <DropDown defaultText='Select Bins' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={[3,5,10,20]} onSelect={e=>result.bins = e}/>
                <input className='w-full py-1 px-2 rounded-sm focus:outline-none' placeholder="Custom bins" onInput={e=>result.customBins = e.target.value}/>
                {/* <Checkbox label={'Smoothed'} defaultChecked={false} onChange={e=>result.smoothed = e.target.checked}/> */}
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
    </>
}

export const config = {
    name: 'Histogram',
    function: ['Comparisons', 'Data over Time','Distribution','Patterns','Range'],
    getOperation: ({aggregatedDataset,dataset,options}) => {
        let hasRes = true, res = {}
        if(options.x && (options.bins || options.customBins)){
            let bins = Number(options.customBins || options.bins), x = options.x
            let {max,min} = dataset.num_lists[x]
            let slots = [...Array(bins).keys()].map(i=>i*(max-min)/bins+min), data = [...Array(bins).keys()].fill(0)

            aggregatedDataset[x].forEach(value=>{
                for(let i=slots.length-1;i>=0;i--){
                    if(slots[i]<=value){
                        data[i]++;
                        break
                    }
                }
            })

            res = {
                title: {
                    left: 'center',
                    text: 'Data',
                },
                xAxis: {
                    type: 'category',
                    data:slots.map(slot=>`>=${slot}`)
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        name: '',
                        type: 'bar',
                        smooth: options.smoothed,
                        symbol: 'none',
                        areaStyle: {},
                        data: data
                    }
                ]
            }

        }else{
            hasRes = false
        }
        return {res,hasRes}
    }
}


export default {
    config,view
}