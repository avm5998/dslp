import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

function renderItem(params, api) {
    var xValue = api.value(0);
    var openPoint = api.coord([xValue, api.value(1)]);
    var closePoint = api.coord([xValue, api.value(2)]);
    var lowPoint = api.coord([xValue, api.value(3)]);
    var highPoint = api.coord([xValue, api.value(4)]);
    var halfWidth = api.size([1, 0])[0] * 0.35;
    var style = api.style({
        stroke: api.visual('color')
    });

    return {
        type: 'group',
        children: [{
            type: 'line',
            shape: {
                x1: lowPoint[0], y1: lowPoint[1],
                x2: highPoint[0], y2: highPoint[1]
            },
            style: style
        }, {
            type: 'line',
            shape: {
                x1: openPoint[0], y1: openPoint[1],
                x2: openPoint[0] - halfWidth, y2: openPoint[1]
            },
            style: style
        }, {
            type: 'line',
            shape: {
                x1: closePoint[0], y1: closePoint[1],
                x2: closePoint[0] + halfWidth, y2: closePoint[1]
            },
            style: style
        }]
    };
}

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
        <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
            <DropDown defaultText='Select Sorted X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.x = e} />
            <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e => result.y = e} />
            <Button onClick={e => {
                showOptions(0)
                confirmOption()
            }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
        </div>
    </>
}

export const config = {
    name: 'Candlestick Chart',
    function: ['Patterns', 'Data over time', 'Ranges'],
    getOperation: ({ aggregatedDataset, dataset, options }) => {

        let xdata = aggregatedDataset[options.x], ydata = aggregatedDataset[options.y]
        let data = []
        let xset = {}

        xdata.forEach((x, i) => {
            let y = ydata[i]
            if (x in xset) {
                xset[x].min = Math.min(xset[x].min, y)
                xset[x].max = Math.max(xset[x].max, y)
            } else {
                xset[x] = {
                    min:y,
                    max:y
                }
            }
        })

        for(let key in xset){
            data.push({
                x:key,
                y:[xset[key].min,xset[key].max]
            })
        }

        data.sort((a, b) => a.x < b.x ? -1 : 1)
        console.log(data);
        let res = {
            animation: false,
            legend: {
                bottom: 10,
                left: 'center',
                data: ['Data']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                position: function (pos, params, el, elRect, size) {
                    var obj = { top: 10 };
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                }
            },
            axisPointer: {
                link: { xAxisIndex: 'all' }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    bottom: 150
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: data.map(d=>Number(d.x)),
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    splitNumber: 20,
                    // min: 'dataMin',
                    // max: 'dataMax',
                    // axisPointer: {
                    //     z: 100
                    // }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    minValueSpan: 10
                },
                // {
                //     show: true,
                //     type: 'slider',
                //     bottom: 60,
                //     start: 98,
                //     end: 100,
                //     minValueSpan: 10
                // }
            ],
            series: [
                {
                    name: 'Data',
                    type: 'custom',
                    renderItem: renderItem,
                    dimensions: ['lowest', 'highest'],
                    encode: {
                        // x: 0,
                        y: [0, 1],
                        tooltip: [0,1]
                    },
                    data: data.map(d=>d.y)
                }
            ]
        }
        return res
    }
}


export default {
    config, view
}