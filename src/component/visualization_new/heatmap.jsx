import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Modal, Checkbox } from '../../util/ui'
import { DropDown, MultiSelect, Button } from  '../../util/ui_components'
import CommonOption, { setCommonCode, DEFAULT_RESULT } from './commonOption'
import { InlineTip } from '../common/tip'
const defaultResult = { ...DEFAULT_RESULT, ...{engine:'Plotly'} }

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)

    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Common Options</div>
            </div>
            <div className={`grid grid-cols-2 gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns:'10vw 1fr 10vw 1fr'
            }}>
                <Label text='X Axis:'><InlineTip info={`*Required. Must be int or float type\nCategorical variables that displayed as x-axis.\nIf you select more than one numerical column, the columns you selected are better to have similar meanings and ranges`} /></Label>
                <MultiSelect defaultText='Select variable' width='w-60' selections={dataset.num_cols} onSelect={e => result.x = e} />
                {/* <DropDown defaultText='Select variable' width='w-60' items={dataset.cate_cols} onSelect={e => result.x = e} zIndex={100} /> */}
                <Label text='Y Axis:'><InlineTip info={`*Required. Must be string or object type\nThis categorical variable will be displayed as y-axis.`} /></Label>
                <DropDown defaultText='Select variable' width='w-60' items={dataset.cate_cols} onSelect={e => result.y = e} zIndex={99} />
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
    name: 'Heatmap',
    function: ['Comparisons', 'Data over time','Patterns','Relationships'],
    getCode: (result, dataset) => {
        let plotOptions = {}
        let prevSteps = [], postSteps = []
        setCommonCode({ dataset, result, plotOptions, postSteps, prevSteps })
        if(result.engine == 'Pandas'){
            return `import seaborn as sns
${prevSteps.length?prevSteps.join('\n'):''}
sns.heatmap(df.groupby('${result.y}').sum().loc[:,(${result.x.map(item=>`'${item}'`).join(',')})]${result.x.length===1?'.to_frame()':''})
${postSteps.length?postSteps.join('\n'):''}`
        }else if(result.engine == 'Plotly'){
            return `ndf = df[['${result.x}', '${result.y}']].value_counts().reset_index()
fig = px.density_heatmap(ndf,x='${result.x}',y='${result.y}',z=0)
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