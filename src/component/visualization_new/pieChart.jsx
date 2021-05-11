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
                gridTemplateColumns:'5vw 1fr 5vw 1fr'
            }}>
                <Label text='Category'><InlineTip info={`*Required\nThe categories of numerical data.`}/></Label>
                <DropDown defaultText='Select Category Column' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={dataset.cate_cols} onSelect={e=>result.cate_col = e}/>
                <Label text='Numerical:'><InlineTip info={`*Required\nThe numerical data of which the proportion will be represented in the chart.`}/></Label>
                <DropDown defaultText='Select Numerical Column' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.num_col = e}/>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab==1?'hidden':'hidden'}`} style={{
                gridTemplateColumns:'7.5vw 1fr 7.5vw 1fr'
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
                    // confirmOption()
                    setCode(config.getCode({...defaultResult,...result}, dataset))
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
        </div>
    </>
}

export const config = {
    name: 'Pie Chart',
    function: ['Comparisons', 'Proportions'],
    getCode: (result,dataset)=>{
        let plotOptions = {
            y:`"${result.num_col}"`,
        }
        let prevSteps=[],postSteps = []
        setCommonCode({dataset,result,plotOptions,postSteps,prevSteps})
        
        let dfplotArgs = []
        for (let k in plotOptions){
            dfplotArgs.push(`${k}=${plotOptions[k]}`)
        }

        prevSteps.push(`df = df.groupby('${result.cate_col}').agg(${result.num_col}=('${result.num_col}','sum'))`)

        if(result.engine == 'Pandas'){
            return `${prevSteps.length?prevSteps.join('\n'):''}
df.plot.pie(${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}
`
        }
        
        if(result.engine == 'Plotly'){
            prevSteps.push(`df.reset_index(inplace = True)`)
            prevSteps.push(`df.rename({'index':'${result.cate_col}'})`)
            return `${prevSteps.length?prevSteps.join('\n'):''}
fig = px.pie(df, values='${result.num_col}', names='${result.cate_col}', title='Pie chart')
fig.show()
${postSteps.length?postSteps.join('\n'):''}
`
        }

    },
    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let hasRes = true, res = {}
        if (options.category) {
            let { category } = options
            let counter = {}, data = []
            aggregatedDataset[category].forEach(e => {
                counter[e] = (counter[e] || 0) + 1
            })

            for (let key in counter) {
                data.push({
                    value: counter[key],
                    name: key
                })
            }

            res = {
                title: {
                    text: '',
                    subtext: '',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                },
                series: [
                    {
                        name: 'data',
                        type: 'pie',
                        radius: '50%',
                        data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
        } else {
            hasRes = false
        }
        return { res, hasRes }
    }
}


export default {
    config, view
}