import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.x = e} />
            <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.y = e} />
            <DropDown defaultText='Select Z Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.z = e} />
            <Button onClick={e => {
                showOptions(0)
                confirmOption()
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: '3D Scatter Plot',
    function: ['Comparisons', 'Relationships', '3D'],
    getOperation: ({ aggregatedDataset, dataset, options }) => {
        let hasRes = true, res = {}
        if (options.x && options.y && options.z) {
            let { x, y, z } = options

            res = {
                grid3D: {},
                xAxis3D: {
                    // type:'category'
                    type: dataset.num_cols.indexOf(x) !== -1 ? 'value' : 'category'
                },
                yAxis3D: {
                    type: dataset.num_cols.indexOf(y) !== -1 ? 'value' : 'category'
                },
                zAxis3D: {
                    type: dataset.num_cols.indexOf(z) !== -1 ? 'value' : 'category'
                },
                dataset: {
                    id: 'raw',
                    source: aggregatedDataset
                },
                series: [
                    {
                        type: 'scatter3D',
                        symbolSize: 2.5,
                        encode: {
                            x, y, z,
                            tooltip: [0, 1, 2, 3, 4]
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