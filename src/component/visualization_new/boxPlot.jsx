import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Modal, Checkbox } from '../../util/ui'
import { fetchByJSON } from '../../util/util'
import { MultiSelect, DropDown, Button } from '../../util/ui_components' 
import CommonOption, { setCommonCode, DEFAULT_RESULT } from './commonOption'
import { InlineTip } from '../common/tip'
const defaultResult = { ...DEFAULT_RESULT, ...{} }

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode, setImage }) => {
    let [activeTab, setActiveTab] = useState(0)

    const getImage = async (result, dataset) => {
        let res = await fetchByJSON('v_box', {
            cond: JSON.stringify(result),
            filename: dataset.filename
        })
        let json = await res.json()
        setImage("data:image/png;charset=utf-8;base64," + json.plot)
    }

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
                <Label text='X Axis:'><InlineTip info={`*Required. Must be string or object type\nData will be grouped by the selected column. Each object/value in the selected column will have a distinct box of distribution.`} /></Label>
                <DropDown zIndex={100} defaultText='Select X Axis' width='w-60' items={dataset.num_cols} onSelect={e => result.x = e} />
                <Label text='Y Axis:'><InlineTip info={`*Required. Must be int or float type\nThe distribution result of the selected columns.\nIf you select more than one numerical column, the columns you selected are better to have similar meanings and ranges`} /></Label>
                <MultiSelect zIndex={99} defaultText='Select Y Axis' width='w-60' selections={dataset.num_cols} onSelect={e => result.y = e} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? 'hidden' : 'hidden'}`} style={{
                gridTemplateColumns: '5vw 1fr 10vw 1fr'
            }}>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                <CommonOption dataset={dataset} result={result} />
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
    name: 'Box Plot',
    function: ['Distribution', 'Range'],
    getCode: (result, dataset) => {
        let plotOptions = {
        }
        let prevSteps = [], postSteps = []
        setCommonCode({ dataset, result, plotOptions, postSteps, prevSteps })

        let mid = ''
        if(result.engine == 'Plotly'){
            if(!result.x && result.y){
                mid = `fig = px.box(df, y="${result.y}")`
            }else if(result.x && result.y){
                mid = `fig = px.box(df, x="${result.x}", y="${result.y}")`
            }
            postSteps.push(`fig.show()`)
        }else if(result.engine == 'Pandas'){
            let dfplotArgs = []
            for (let k in plotOptions){
                dfplotArgs.push(`${k}=${plotOptions[k]}`)
            }
            let arr = result.y.map(e => `"${e}"`)
            mid = `df.boxplot(column=[${arr}], by='${result.x}', ${dfplotArgs.join(',')})`
            postSteps.push(`plt.show()`)
        }

        return `${prevSteps.length ? prevSteps.join('\n') : ''}
${mid}
${postSteps.length ? postSteps.join('\n') : ''}
`
    },
    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let hasRes = true, res = {}

        if (options.category && options.target) {
            let { category, target } = options

            res = {
                dataset: [{
                    id: 'raw',
                    source: aggregatedDataset
                }, {
                    id: 'aggregated_data',
                    fromDatasetId: 'raw',
                    transform: [{
                        type: 'ecSimpleTransform:aggregate',
                        config: {
                            resultDimensions: [
                                { name: 'min', from: target, method: 'min' },
                                { name: 'Q1', from: target, method: 'Q1' },
                                { name: 'median', from: target, method: 'median' },
                                { name: 'Q3', from: target, method: 'Q3' },
                                { name: 'max', from: target, method: 'max' },
                                { name: category, from: category }
                            ],
                            groupBy: category
                        }
                    }, {
                        type: 'sort',
                        config: {
                            dimension: 'Q3',
                            order: 'asc'
                        }
                    }]
                }],
                title: {
                    text: ''
                },
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    confine: true
                },
                xAxis: {
                    name: target,
                    nameLocation: 'middle',
                    nameGap: 30,
                    scale: true,
                },
                yAxis: {
                    type: 'category'
                },
                grid: {
                    bottom: 100
                },
                legend: {
                    selected: { detail: false }
                },
                dataZoom: [{
                    type: 'inside'
                }, {
                    type: 'slider',
                    height: 20,
                }],
                series: [{
                    name: 'boxplot',
                    type: 'boxplot',
                    datasetId: 'aggregated_data',
                    itemStyle: {
                        color: '#b8c5f2'
                    },
                    encode: {
                        x: ['min', 'Q1', 'median', 'Q3', 'max'],
                        y: category,
                        itemName: [category],
                        tooltip: ['min', 'Q1', 'median', 'Q3', 'max']
                    }
                }]
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