import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Modal, Checkbox } from '../../util/ui'
import { Input, Label, DropDown, MultiSelect, Button } from '../../util/ui_components'
import { InlineTip } from '../common/tip'

const LegendOptions = ['hidden', 'best', 'upper left', 'upper right', 'lower left',
    'lower right', 'right', 'center left', 'center right', 'lower center', 'upper center', 'center']

export const setCommonCode = ({ dataset, result, plotOptions, postSteps, prevSteps }) => {
    Object.assign(plotOptions, {
    })

    if (result.dropna_col) {
        prevSteps.splice(0, 0, `df.dropna(axis=1,inplace=True)`)
    }

    if (result.dropna_row) {
        prevSteps.splice(0, 0, `df.dropna(axis=0,inplace=True)`)
    }

    if (result.filter_col) {
        result.filter_operator = result.filter_operator == '=' ? '==' : result.filter_operator
        prevSteps.push(`df = df[df['${result.filter_col}']${result.filter_operator}${result.filter_value}]`)
    }

    // if(result.sortColumnIndex>-1){
    //     prevSteps.push(`df.sort_values(by=["${dataset.cols[result.sortColumnIndex]}"],ascending=[${result.sortAscending?'True':'False'}], inplace = True, axis = 0)`)
    // }

    if (result.trans_col && result.trans_fn) {
        // ['Logarithm','Square root','Exponential','Logit']
        let lambda = {
            'Logarithm': 'math.log(x,10)',
            'Square root': 'math.sqrt(x)',
            'Exponential': 'math.pow(math.e,x)',
            'Logit': 'math.log(x/(1-x),10)',
        }[result.trans_fn]
        prevSteps.push(`df['${result.trans_col}'] = df['${result.trans_col}'].apply(lambda x:${lambda})`)
    }

    if (result.engine == 'Pandas') {
        if (result.legend == 'hidden') {
            plotOptions.legend = 'False'
        } else if (result.legend) {
            postSteps.push(`plt.legend(loc="${result.legend}")`)
        }

        if (result.figureSize) {
            plotOptions.figsize = `(${result.figureSize})`
        }

        if (result.figureTitle) {
            plotOptions.title = `"${result.figureTitle}"`
        }

        if (result.xlabel) {
            postSteps.push(`plt.xlabel("${result.xlabel}")`)
        }

        if (result.ylabel) {
            postSteps.push(`plt.ylabel("${result.ylabel}")`)
        }
    }

    if (result.engine == 'Plotly') {

    }
}

export const DEFAULT_RESULT = {
    engine: 'Pandas',
    xlabel: '',
    ylabel: '',
    showLegend: true,
    legend: 'best'
}

const Visibility = {
    'Pandas': {

    },

    'Plotly': {
        xLabel: false,
        yLabel: false,
        legendPosition: false,
        figureSize: false,
    }
}

function getVisibilityStyle (engine){
    let visibility = Visibility[engine]
    let styleObj = {}

    for (let p in visibility) {
        if (visibility[p] === false) {
            styleObj[p] = { customStyle: { display: 'none' } }
        }
    }

    return styleObj
}

export default function ({ dataset, result, options = { engine:['Pandas', 'Plotly'] } }) {
    let [visibility, setVisibility] = useState(getVisibilityStyle(DEFAULT_RESULT.engine))

    return (<>
        <Label text='Plot Engine:'><InlineTip info={`Python library used in plotting`} /></Label>
        <DropDown defaultValue={DEFAULT_RESULT.engine} width='w-60' items={options.engine} onSelect={(e, i) => {
            setVisibility(getVisibilityStyle(e))
            result.engine = e
        }} />
        <Label text='Figure Title:' />
        <Input placeholder="Please input the figure title" onInput={(e,v) => result.figureTitle = v} />
        <Label text='Drop NA Rows:'><InlineTip info={`Drop row with empty data`} /></Label>
        <Checkbox label='Drop NA Rows' onChange={e => result.dropna_row = e.target.checked} />
        <Label text='Drop NA Columns:'><InlineTip info={`Drop column with empty data`} /></Label>
        <Checkbox label='Drop NA Columns' onChange={e => result.dropna_col = e.target.checked} />
        <Label text='Transformation column:'><InlineTip info={`Apply transformation function to a column, the code are straight forward and you can modify the code to transform more columns `} /></Label>
        <DropDown defaultText='Column' width='w-60' blankOption={'Do not transform'} items={dataset.num_cols} onSelect={(e, i) => result.trans_col = e} zIndex={3} />
        <Label text='Transformation function:'><InlineTip info={`Transformation type, Logarithm function is: f(x)=log10(x), Exponential function is: f(x)=e^x`} /></Label>
        <DropDown defaultText='Convert type' width='w-60' items={['Logarithm', 'Square root', 'Exponential', 'Logit']} onSelect={(e, i) => result.trans_fn = e} zIndex={3} />

        {/* <Label text='Sort data:'><InlineTip info={`Here you can only sort by one column\nbut you can modify this behavior by modifying the code`}/></Label>
        <DropDown defaultText='Sort' customStyle='w-60' showOnHover={false} blankOption={'Do not sort'} items={dataset.cols} onSelect={(e,i)=>result.sortColumnIndex = i-1}/> */}
        {/* <Label text='Sort direction'></Label>
        <DropDown defaultText='Select Sort direction' customStyle='w-60' showOnHover={false} items={['Ascending','Descending']} onSelect={(e,i)=>result.sortAscending= 1-i}/> */}
        <Label {...visibility.legendPosition} text='Legend Position:' />
        <DropDown {...visibility.legendPosition} defaultText='Select Legend Position' width='w-60' items={LegendOptions} onSelect={e => result.legend = e} zIndex={2}/>
        <Label {...visibility.figureSize} text='Figure Size:' />
        <Input {...visibility.figureSize} attrs={{ list: "common_options_figure_size_data" }} placeholder="Please input the figure size" onInput={(e,v) => result.figureSize = v} />
        <datalist id="common_options_figure_size_data"><option value="5,5" /><option value="10,10" /><option value="15,15" /><option value="20,20" /></datalist>
        <Label {...visibility.xLabel} text='X label:'><InlineTip info={`The label on X Axis`} /></Label>
        <Input {...visibility.xLabel} width={'w-60'} placeholder='X label' onInput={(e,v) => result.xlabel = v} />
        <Label {...visibility.yLabel} text='Y label:'><InlineTip info={`The label on Y Axis`} /></Label>
        <Input {...visibility.yLabel} width={'w-60'} placeholder='Y label' onInput={(e,v) => result.ylabel = v} />
        <Label text='Filter column'><InlineTip info={`Filter of some specific data, specified by a column name and a condition`} /></Label>
        <DropDown defaultText='Select X Axis' width='w-60' items={dataset.num_cols} onSelect={e => result.filter_col = e} blankOption={'No column'} zIndex={1}/>
        <Label text='Filter operator'></Label>
        <DropDown defaultText='Select operator' width='w-60' items={['=', '!=', '<', '>', '<=', '>=']} onSelect={e => result.filter_operator = e} zIndex={1}/>
        <Label text='Filter value'></Label>
        <Input placeholder="Please input filter value" onInput={(e,v) => result.filter_value = v} />
    </>)
}