import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox, Input } from '../../util/ui'
import { groupBy } from '../../util/util'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select Category' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.cate = e} />
            <DropDown defaultText='Select Value' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.value = e} />
            <DropDown defaultText='Select Aggregated Value' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e => result.agg = e} />
            <DropDown defaultText='Select Aggregate Method' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={['Summation', 'Unique', 'Average']} onSelect={e => result.method = e} />
            <Input placeholder="Default Value" onInput={e => result.defaultValue = e.target.value} defaultValue={'0'} />
            <Button onClick={e => {
                showOptions(0)
                confirmOption()
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Nightingale Rose Chart',
    function: ['Comparisons', 'Data over time', 'Proportions'],
    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let hasRes = true, res = {}
        let { cate, value, agg, method, defaultValue } = options
        // cate = 'rooms'
        // value = 'bathroom'
        // agg = 'area'
        // method = 'Average'
        if (cate && value && agg && method) {
            let reducer = (p, c) => c, initialValue = undefined

            if (method === 'Unique') {
                reducer = (p, c) => p + c
                initialValue = undefined
            }

            if (method === 'Summation') {
                reducer = (p, c) => p + c
                initialValue = 0
            }

            if (method === 'Average') {
                reducer = (p, c) => ({
                    total: p.total + c,
                    count: p.count++
                })

                initialValue = {
                    total: 0,
                    count: 0
                }
            }

            let { categoryValues, valueValues, data } = groupBy({
                aggregatedData:aggregatedDataset, categoryType: cate, valueType: value,
                aggregateCol: agg, reducer, initialValue, defaultValue: options.defaultValue || 0
            })

            let getSeriesData = cate => valueValues.map(value => data[cate][value])

            //special
            if (method === 'Average') {
                getSeriesData = cate => valueValues.map(value => {
                    let obj = data[cate][value];
                    if (obj.count > 0) {
                        return obj.total / obj.count
                    }
                    return defaultValue
                })
            }

            res = {
                angleAxis: {
                    type: 'category',
                    data: categoryValues
                },
                radiusAxis: {
                },
                polar: {
                },
                series: categoryValues.map(cate => ({
                    type: 'bar',
                    data: getSeriesData(cate),
                    coordinateSystem: 'polar',
                    name: cate,
                    stack: 'a',
                    emphasis: {
                        focus: 'series'
                    }
                })),
                legend: {
                    show: true,
                    data: categoryValues
                }
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