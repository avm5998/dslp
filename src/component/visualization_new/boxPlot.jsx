import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select Category' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cate_cols} onSelect={e => result.category = e} />
            <DropDown defaultText='Select Aggregation Target' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e => result.target = e} />
            <Button onClick={e => {
                showOptions(0)
                confirmOption()
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Box Plot',
    function: ['Distribution', 'Range'],
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