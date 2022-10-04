import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input,Label, Modal, Checkbox } from '../../util/ui'
import { fetchByJSON } from '../../util/util'
import { MultiSelect, DropDown, Button } from '../../util/ui_components' 
import { InlineTip } from '../common/tip'
import CommonOption,{setCommonCode,DEFAULT_RESULT} from './commonOption'
const defaultResult = {...DEFAULT_RESULT,...{}}

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode, setImage }) => {
    let [activeTab, setActiveTab] = useState(0)

    const getImage = async (result, dataset) => {
        let res = await fetchByJSON('v_pie', {
            cond: JSON.stringify(result),
            filename: dataset.filename
        })
        let json = await res.json()
        setImage("data:image/png;charset=utf-8;base64," + json.plot)
    }

    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab==0?'border-b-2 font-bold cursor-default':'cursor-pointer'}`} onClick={e=>setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab==1?'border-b-2 font-bold cursor-default':'cursor-pointer'}`} onClick={e=>setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab==2?'border-b-2 font-bold cursor-default':'cursor-pointer'}`} onClick={e=>setActiveTab(2)}>Common Options</div>
            </div>
            <div className={`grid grid-cols-2 gap-4 p-8 w-auto ${activeTab==0?'':'hidden'}`} style={{
                gridTemplateColumns:'10vw 1fr 10vw 1fr'
            }}>
                <Label text='Category'><InlineTip info={`*Required. Must be string or object type\nThe categories of numerical data. Each object/value in selected column will consist of a part of the chart.`}/></Label>
                <DropDown defaultText='Select Category Column' width='w-60' showOnHover={false} items={dataset.cate_cols} onSelect={e=>result.cate_col = e} zIndex={100}/>
                {/* <Label text='Numerical:'><InlineTip info={`*Optional. Any type\nThe numerical data of which the proportion will be represented in the chart.`}/></Label>
                <DropDown defaultText='Select Numerical Column' width='w-60' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.num_col = e} zIndex={99}/> */}
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
                    getImage(result, dataset)
                }} width={`w-48 justify-self-end`} text={`Confirm`}/>
            </div>
        </div>
    </>
}

export const config = {
    name: 'Pie Chart',
    function: ['Comparisons', 'Proportions'],
    getCode: (result,dataset)=>{
        let plotOptions = {
            // y:`"${result.num_col}"`,
        }
        let prevSteps=[],postSteps = []
        setCommonCode({dataset,result,plotOptions,postSteps,prevSteps})
        
        let dfplotArgs = []
        for (let k in plotOptions){
            dfplotArgs.push(`${k}=${plotOptions[k]}`)
        }

        // prevSteps.push(`df = df.groupby('${result.cate_col}').agg(${result.num_col}=('${result.num_col}','sum'))`)

        if(result.engine == 'Pandas'){
            return `${prevSteps.length?prevSteps.join('\n'):''}
df = df.groupby('${result.cate_col}').count()
df.iloc[:, 0].plot.pie(${dfplotArgs.join(',')})
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