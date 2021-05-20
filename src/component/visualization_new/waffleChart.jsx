import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'
import { InlineTip } from '../common/tip'
import CommonOption, { setCommonCode, DEFAULT_RESULT } from './commonOption'
const defaultResult = { ...DEFAULT_RESULT, ...{legend:false} }

const AggFn = [
    'mean',
    'max',
    'min',
    'sum',
    'size',
]

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode }) => {
    let [activeTab, setActiveTab] = useState(0)

    return <>
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 hidden ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
                <div className={`ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Common Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                <Label text='Group By'><InlineTip info={`*Required\nThe column group by, you can add multiple columns in the code`} /></Label>
                <DropDown defaultText='Select Group By' customStyle='h-full w-full' showOnHover={false} items={dataset.cate_cols} onSelect={e => result.cate_col = e} />

                <Label text='Aggregate By'><InlineTip info={`*Required\nThe column aggregated by`} /></Label>
                <DropDown defaultText='Select Aggregate By' customStyle='w-full' showOnHover={false} items={dataset.num_cols} onSelect={e => result.num_col = e} />

                <Label text='Aggregation function'><InlineTip info={`*Required\nThe aggregation function`} /></Label>
                <DropDown defaultText='Aggregation Function' customStyle='w-full' showOnHover={false} items={AggFn} onSelect={e => result.agg = e} />

                <Label text='Aggregation function'><InlineTip info={`*Required\nThe rows of waffle`} /></Label>
                <Input customStyle={'w-auto'} attrs={{ list: "waffle_rows" }} placeholder="The rows of result waffle" onInput={e => result.rows = e.target.value} />
                <datalist id="waffle_rows"><option value="5" /><option value="10" /></datalist>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? 'hidden' : 'hidden'}`} style={{
                gridTemplateColumns: '7.5vw 1fr 7.5vw 1fr'
            }}>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                <CommonOption dataset={dataset} result={result} options={{
                    engine:['Pandas'],
                }}/>
            </div>
            <div className='flex justify-end'>
                <Button onClick={e => {
                    showOptions(0)
                    // confirmOption()
                    setCode(config.getCode({ ...defaultResult, ...result }, dataset))
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
            </div>
        </div>
    </>
}

export const config = {
    name: 'Waffle Chart',
    function: ['Comparisons', 'Proportions'],
    getCode: (result, dataset) => {
        let plotOptions = {
            'FigureClass': 'Waffle',
            'rows': result.rows,
            'values': `g['${result.num_col}']`,
            'labels': 'list(g.index)'
        }

        let prevSteps = [], postSteps = []
        prevSteps.push(`g = df.groupby('${result.cate_col}').agg(${result.num_col}=('${result.num_col}','${result.agg}'))`)
        setCommonCode({ dataset, result, plotOptions, postSteps, prevSteps })

        let dfplotArgs = []
        for (let k in plotOptions) {
            dfplotArgs.push(`${k}=${plotOptions[k]}`)
        }

        return `from pywaffle import Waffle
${prevSteps.length ? prevSteps.join('\n') : ''}
plt.figure(${dfplotArgs.join(',')})
${postSteps.length ? postSteps.join('\n') : ''}
`
    },

    getOperation: ({ aggregatedDataset, dataset, options }) => {
    }
}


export default {
    config, view
}