import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select Category' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cate_cols} onSelect={e => result.category = e} />
            <Button onClick={e => {
                showOptions(0)
                confirmOption()
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Pie Chart',
    function: ['Comparisons', 'Proportions'],
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