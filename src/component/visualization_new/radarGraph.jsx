import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select Category' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cate_cols} onSelect={e => result.category = e} />
            <DropDown defaultText='Select Value' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e => result.value = e} />
            <DropDown defaultText='Aggregated by' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={['Average']} onSelect={e => result.aggregate = e} />
            <Button onClick={e => {
                showOptions(0)
                confirmOption()
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Radar Graph',
    function: ['Patterns', 'Relationships', 'Comparisons'],
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