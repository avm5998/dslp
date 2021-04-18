import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input,Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import { InlineTip } from '../common/tip'

const LegendOptions = ['hidden','best','upper left','upper right','lower left',
'lower right','right','center left','center right','lower center','upper center','center']

export const setCommonCode = ({dataset,result,plotOptions,postSteps,prevSteps})=>{
    Object.assign(plotOptions,{
    })

    if(result.filter_col){
        result.filter_operator = result.filter_operator == '='?'==':result.filter_operator
        prevSteps.push(`df = df[df['${result.filter_col}']${result.filter_operator}${result.filter_value}]`)
    }

    if(result.sortColumnIndex>-1){
        prevSteps.push(`df.sort_values(by=["${dataset.cols[result.sortColumnIndex]}"],ascending=[${result.sortAscending?'True':'False'}], inplace = True, axis = 0)`)
    }

    if(result.legend=='hidden'){
        plotOptions.legend='False'
    }else if(result.legend){
        postSteps.push(`plt.legend(loc="${result.legend}")`)
    }

    if(result.figureSize){
        plotOptions.figsize  = `(${result.figureSize})`
    }

    if(result.xlabel){
        postSteps.push(`plt.xlabel("${result.xlabel}")`)
    }

    if(result.ylabel){
        postSteps.push(`plt.ylabel("${result.ylabel}")`)
    }
}

export const DEFAULT_RESULT = {
    xlabel:'',
    ylabel:'',
    showLegend:true,
    legend:'best'
}

export default function({dataset,result}){
    return (<>
        <Label text='Sort data:'><InlineTip info={`Here you can only sort by one column\nbut you can modify this behavior by modifying the code`}/></Label>
        <DropDown defaultText='Sort' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={['Do not sort'].concat(dataset.cols)} onSelect={(e,i)=>result.sortColumnIndex = i-1}/>
        <Label text='Sort direction'></Label>
        <DropDown defaultText='Select Sort direction' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={['Ascending','Descending']} onSelect={(e,i)=>result.sortAscending= 1-i}/>
        <Label text='Legend Position:'/>
        <DropDown defaultText='Select Legend Position' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={LegendOptions} onSelect={e=>result.legend = e}/>
        <Label text='Figure Size:'/>
        <Input attrs={{list:"common_options_figure_size_data"}} placeholder="Please input the figure size" onInput={e=>result.figureSize = e.target.value}/>
        <datalist id="common_options_figure_size_data"><option value="5,5"/><option value="10,10"/><option value="15,15"/><option value="20,20"/></datalist>
        <Label text='X label:'><InlineTip info={`The label on X Axis`}/></Label>
        <Input customStyle={'h-10 w-60'} placeholder='X label' onInput={e=>result.xlabel = e.target.value}/>
        <Label text='Y label:'><InlineTip info={`The label on Y Axis`}/></Label>
        <Input customStyle={'h-10 w-60'} placeholder='Y label' onInput={e=>result.ylabel = e.target.value}/>
        <Label text='Filter column'><InlineTip info={`Filter of some specific data, specified by a column name and a condition`}/></Label>
        <DropDown defaultText='Select X Axis' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={dataset.cols} onSelect={e=>result.filter_col = e} blankOption={'No column'}/>
        <Label text='Filter operator'></Label>
        <DropDown defaultText='Select operator' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={['=','<','>']} onSelect={e=>result.filter_operator = e}/>
        <Label text='Filter value'></Label>
        <Input customStyle='h-10' placeholder="Please input filter value" onInput={e=>result.filter_value = e.target.value}/>
    </>)
}