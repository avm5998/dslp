import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input,Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import { InlineTip } from '../common/tip'

const LegendOptions = ['hidden','best','upper left','upper right','lower left',
'lower right','right','center left','center right','lower center','upper center','center']

export const setCommonCode = ({dataset,result,plotOptions,postSteps,prevSteps})=>{
    Object.assign(plotOptions,{
    })

    if(result.dropna_col){
        prevSteps.splice(0,0,`df.dropna(axis=1,inplace=True)`)
    }

    if(result.dropna_row){
        prevSteps.splice(0,0,`df.dropna(axis=0,inplace=True)`)
    }

    if(result.filter_col){
        result.filter_operator = result.filter_operator == '='?'==':result.filter_operator
        prevSteps.push(`df = df[df['${result.filter_col}']${result.filter_operator}${result.filter_value}]`)
    }

    if(result.sortColumnIndex>-1){
        prevSteps.push(`df.sort_values(by=["${dataset.cols[result.sortColumnIndex]}"],ascending=[${result.sortAscending?'True':'False'}], inplace = True, axis = 0)`)
    }

    if(result.trans_col && result.trans_fn){
        // ['Logarithm','Square root','Exponential','Logit']
        let lambda = {
            'Logarithm':'math.log(x,10)',
            'Square root':'math.sqrt(x)',
            'Exponential':'math.pow(math.e,x)',
            'Logit':'math.log(x/(1-x),10)',
        }[result.trans_fn]
        prevSteps.push(`df['${result.trans_col}'] = df['${result.trans_col}'].apply(lambda x:${lambda})`)
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
        <Label text='Drop NA Rows:'><InlineTip info={`Drop row with empty data`}/></Label>
        <Checkbox label='Drop NA Rows' onChange={e=>result.dropna_row = e.target.checked}/>
        <Label text='Drop NA Columns:'><InlineTip info={`Drop column with empty data`}/></Label>
        <Checkbox label='Drop NA Columns' onChange={e=>result.dropna_col = e.target.checked}/>
        <Label text='Transformation column:'><InlineTip info={`Apply transformation function to a column, the code are straight forward and you can modify the code to transform more columns `}/></Label>
        <DropDown defaultText='Column' customStyle='w-60' showOnHover={false} blankOption={'Do not transform'} items={dataset.cols} onSelect={(e,i)=>result.trans_col = e}/>
        <Label text='Transformation function:'><InlineTip info={`Transformation type, Logarithm function is: f(x)=log10(x), Exponential function is: f(x)=e^x`}/></Label>
        <DropDown defaultText='Convert type' customStyle='w-60' showOnHover={false} items={['Logarithm','Square root','Exponential','Logit']} onSelect={(e,i)=>result.trans_fn = e}/>
        
        {/* <Label text='Sort data:'><InlineTip info={`Here you can only sort by one column\nbut you can modify this behavior by modifying the code`}/></Label>
        <DropDown defaultText='Sort' customStyle='w-60' showOnHover={false} blankOption={'Do not sort'} items={dataset.cols} onSelect={(e,i)=>result.sortColumnIndex = i-1}/> */}
        {/* <Label text='Sort direction'></Label>
        <DropDown defaultText='Select Sort direction' customStyle='w-60' showOnHover={false} items={['Ascending','Descending']} onSelect={(e,i)=>result.sortAscending= 1-i}/> */}
        <Label text='Legend Position:'/>
        <DropDown defaultText='Select Legend Position' customStyle='w-60' showOnHover={false} items={LegendOptions} onSelect={e=>result.legend = e}/>
        <Label text='Figure Size:'/>
        <Input attrs={{list:"common_options_figure_size_data"}} placeholder="Please input the figure size" onInput={e=>result.figureSize = e.target.value}/>
        <datalist id="common_options_figure_size_data"><option value="5,5"/><option value="10,10"/><option value="15,15"/><option value="20,20"/></datalist>
        <Label text='X label:'><InlineTip info={`The label on X Axis`}/></Label>
        <Input customStyle={'h-10 w-60'} placeholder='X label' onInput={e=>result.xlabel = e.target.value}/>
        <Label text='Y label:'><InlineTip info={`The label on Y Axis`}/></Label>
        <Input customStyle={'h-10 w-60'} placeholder='Y label' onInput={e=>result.ylabel = e.target.value}/>
        <Label text='Filter column'><InlineTip info={`Filter of some specific data, specified by a column name and a condition`}/></Label>
        <DropDown defaultText='Select X Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e=>result.filter_col = e} blankOption={'No column'}/>
        <Label text='Filter operator'></Label>
        <DropDown defaultText='Select operator' customStyle='w-60' showOnHover={false} items={['=','<','>']} onSelect={e=>result.filter_operator = e}/>
        <Label text='Filter value'></Label>
        <Input customStyle='h-10' placeholder="Please input filter value" onInput={e=>result.filter_value = e.target.value}/>
    </>)
}