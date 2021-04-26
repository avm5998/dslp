import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import CommonOption,{setCommonCode,DEFAULT_RESULT} from './commonOption'
import { InlineTip } from '../common/tip'
const defaultResult = {...DEFAULT_RESULT,...{}}

export const view =  ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode })=> {
    return <>
        <div className='grid grid-cols-2 gap-4 p-8 w-auto'>
            <Label text='Group By:'><InlineTip info={`Group By`}/></Label>
            <DropDown defaultText='Select Group By' customStyle='w-96' blankOption={'Do not group data'} showOnHover={false} items={dataset.cate_cols} onSelect={e => result.group_by = e} />
            <Label text='X Axis:'><InlineTip info={`X Axis`}/></Label>
            <DropDown defaultText='Select X Axis' customStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e => result.x = e} />
            <Label text='Y Axis:'><InlineTip info={`Y Axis`}/></Label>
            <DropDown defaultText='Select Y Axis' customStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e => result.y = e} />
            <div></div>
            <Button onClick={e => {
                showOptions(0)
                setCode(config.getCode({...defaultResult,...result}, dataset))
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Area Graph',
    function: ['Patterns', 'Data over time'],
    getCode:(result,dataset)=>{
        if(result.group_by)
            return `df.groupby(['${result.x}','${result.group_by}'])['${result.y}'].sum().unstack().plot.area()`
        else
            return `df.groupby(['${result.x}'])['${result.y}'].sum().plot.area()`
    },
    getOperation: ({aggregatedDataset,dataset,options}) => {
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

        return {res,hasRes}
    }
}


export default {
    config,view
}