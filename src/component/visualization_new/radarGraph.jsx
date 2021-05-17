import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import { InlineTip } from '../common/tip'
import CommonOption, { setCommonCode, DEFAULT_RESULT } from './commonOption'
const defaultResult = { ...DEFAULT_RESULT, ...{} }


export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)
    
    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Common Options</div>
            </div>

            <div className={`grid grid-cols-2 gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`}>
                <Label text='Category:'><InlineTip info={`*Required\nThe categories for angles in the radar graph.`} /></Label>
                <DropDown defaultText='Select Category' customStyle='w-60' showOnHover={false} items={dataset.cate_cols} onSelect={e => result.cate = e} />
                <Label text='Value:'><InlineTip info={`*Required\nThe values for angles in the radar graph.`} /></Label>
                <DropDown defaultText='Select Value' customStyle='w-60' showOnHover={false} items={dataset.num_cols} onSelect={e => result.val = e} />
                <Label text='Aggregation function:'><InlineTip info={`*Required\nThe aggregation function for values.`} /></Label>
                <DropDown defaultText='Select aggregation function' customStyle='w-60' showOnHover={false} items={['mean', 'sum']} onSelect={e => result.agg = e} />
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
                <Button onClick={e => {
                    showOptions(0)
                    setCode(config.getCode({ ...defaultResult, ...result }, dataset))
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
            </div>
        </div>


    </>
}

export const config = {
    name: 'Radar Graph',
    function: ['Patterns', 'Relationships', 'Comparisons'],
    getCode: (result, dataset) => {
        let plotOptions = {
        }
        let prevSteps = [], postSteps = []
        setCommonCode({ dataset, result, plotOptions, postSteps, prevSteps })

if(result.engine == 'Pandas'){
    return `${prevSteps.length ? prevSteps.join('\n') : ''}
cate = '${result.cate}'
val = '${result.val}'
ndf = df.groupby([cate]).agg(values=(val, '${result.agg}'))
categories = list(ndf.index)
values = list(ndf['values'])
size = len(categories)
angles = [i/float(size)*2*math.pi for i in range(size)]
values += [values[-1]]
angles += [angles[-1]]
plt.polar(angles,values)
plt.fill(angles,values,alpha=.3)
plt.xticks(angles[:-1],categories)
${postSteps.length ? postSteps.join('\n') : ''}
`
}else if(result.engine == 'Plotly'){
    return `
ndf = df.groupby(['${result.cate}']).agg(${result.val}=('${result.val}', '${result.agg}'))
ndf['${result.cate}'] = ndf.index
fig = px.line_polar(ndf, r='${result.val}', theta='${result.cate}', line_close=True)
fig.show()
`
}
    },

    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let res = {}, hasRes = true
        let someKey = ''
        let kinds = {}
        let { category, value, aggregate } = options
        for (let e in aggregatedDataset) someKey = e
        let size = someKey ? aggregatedDataset[someKey].length : 0

        for (let i = 0; i < size; i++) {
            let kind = aggregatedDataset[category][i], v = aggregatedDataset[value][i]
            if (kind in kinds) {
                kinds[kind].max = Math.max(kinds[kind].max, v)
                kinds[kind].values.push(v)
            } else {
                kinds[kind] = {
                    max: v,
                    name: kind,
                    values: [v]
                }
            }
        }

        let values = []
        for (let kind in kinds) {
            if (aggregate === 'Average') {
                let sum = 0
                kinds[kind].values.forEach(v => sum += Number(v) || 0)
                values.push([sum])
            }
        }


        res = {
            title: {
                text: ''
            },
            tooltip: {},
            legend: {
                data: ['Data']
            },
            radar: {
                // shape: 'circle',
                name: {
                    textStyle: {
                        color: '#fff',
                        backgroundColor: '#999',
                        borderRadius: 3,
                        padding: [3, 5]
                    }
                },
                indicator: Object.values(kinds)
            },
            series: [{
                name: 'Data',
                type: 'radar',
                // areaStyle: {normal: {}},
                data: [
                    {
                        value: values,
                        name: 'Data'
                    },
                    // {
                    //     value: [5000, 14000, 28000, 31000, 42000, 21000],
                    //     name: '实际开销（Actual Spending）'
                    // }
                ]
            }]
        };

        return { res, hasRes }
    }
}

export default {
    config, view
}