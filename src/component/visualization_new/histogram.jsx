import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Modal, Checkbox } from '../../util/ui'
import { fetchByJSON } from '../../util/util'
import { MultiSelect,DropDown,Button } from '../../util/ui_components'
import { InlineTip } from '../common/tip'
import CommonOption,{setCommonCode,DEFAULT_RESULT} from './commonOption'
const defaultResult = {...DEFAULT_RESULT,...{bins:10,alpha:1,stacked:true}}

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption, setCode, setImage }) => {
    let [activeTab, setActiveTab] = useState(0)
    let defaultgroupby = ['--']

    const getImage = async (result, dataset) => {
        let res = await fetchByJSON('v_hist', {
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
            <div className={`grid gap-4 p-8 w-auto ${activeTab==0?'':'hidden'}`} style={{
                gridTemplateColumns:'10vw 1fr 10vw 1fr'
            }}>
                <Label text='X Axis:'><InlineTip info={`*Required. Must be int or float type\nSelect numerical columns to see the distributions. Selected columns will be represeted as x-axis.\nIf you select more than one numerical column, the columns you selected are better to have similar meanings and ranges`}/></Label>
                <MultiSelect width='w-60'  selections={dataset.num_cols} onSelect={(e) => {
                    result.cols = e
                }} />
                <Label text='Group by:'><InlineTip info={`*Optional. Must be string or object type\nData will be treated as different groups seperated by selected column.\nIf histogram data is aggregated, only the first option in "Columns" will take effect.`}/></Label>
                <DropDown width='w-60'  items={[...defaultgroupby, ...dataset.cate_cols]} defaultValue={'--'} onSelect={(e) => {
                    result.group_by = e=='--'?null:e
                }}/>
                <Label text='Bins:'><InlineTip info={`How many chunks will the range of data be splited into`}/></Label>
                <Input attrs={{list:'histogram_bins_list'}} onInput={e=>result.bins = e.target.value} placeholder='Please input the number of bins' defaultValue={10}/>
                <datalist id='histogram_bins_list'><option value='5'></option><option value='10'></option><option value='15'></option><option value='20'></option></datalist>
                <Label text='Stacked:'><InlineTip info={`If you select multiple columns, the results will overlap each other if stacked is false, otherwise, it will not.`}/></Label>
                <Checkbox label={``} defaultChecked={true} onChange={e=>result.stacked = e.target.checked}/>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab==1?'hidden':'hidden'}`} style={{
                gridTemplateColumns:'5vw 1fr 10vw 1fr'
            }}>
                {/* <Label text='Group by:'><InlineTip info={`If histogram data is aggregated, only the first option in "Columns" will take effect.`}/></Label>
                <DropDown width='w-60'  items={[...defaultgroupby, ...dataset.cate_cols]} defaultValue={'--'} onSelect={(e) => {
                    result.group_by = e=='--'?null:e
                }}/> */}
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
    name: 'Histogram',
    function: ['Comparisons', 'Data over Time','Distribution','Patterns','Range'],
    getCode: (result,dataset)=>{
        let plotOptions = {
            stacked:result.stacked?'True':'False'
        }
        let prevSteps=[],postSteps = []
        setCommonCode({dataset,result,plotOptions,postSteps,prevSteps})

        if(result.engine == 'Pandas'){
            if(result.bins){
                plotOptions.bins = Number(result.bins)
            }
    
            if(result.alpha){
                plotOptions.alpha = Number(result.alpha)
            }
    
            // if(result.cols.length){
            //     prevSteps.push(`df = df[[${result.cols.map(col=>`'${col}'`).join(',')}]]`)
            // }
    
            let dfplotArgs = []
            for (let k in plotOptions){
                dfplotArgs.push(`${k}=${plotOptions[k]}`)
            }
            if (result.group_by) {
                return `${prevSteps.length?prevSteps.join('\n'):''}
df2 = pd.DataFrame(np.nan, index=range(len(df)), columns=[k for k in df.groupby('${result.group_by}').groups.keys()])
for i in range(len(df)):
  df2.iloc[i][df.iloc[i]['${result.group_by}']] = df.iloc[i]['${result.cols[0]}']
df2.plot.hist(${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}`
//                 return `group_keys = df.groupby('${result.group_by}').groups.keys()
// for k in group_keys:
//   dfx = df[df['${result.group_by}']==k]
//   dfx = dfx[[${result.cols.map(col=>`'${col}'`).join(',')}]]
//   dfx.plot.hist(${dfplotArgs.join(',')})
//   plt.title(k)
//   ${postSteps.length?postSteps.join('\n'):''}
// `
            } else {
                return `${prevSteps.length?prevSteps.join('\n'):''}
df[[${result.cols.map(col=>`'${col}'`).join(',')}]].plot.hist(${dfplotArgs.join(',')})
${postSteps.length?postSteps.join('\n'):''}
`
            }
        }

        if(result.engine == 'Plotly'){

return `
fig = px.histogram(df,x='${result.cols[0]}',nbins=${result.bins},color='${result.group_by}')
fig.show()
`
        }
    },
    getOperation: ({aggregatedDataset,dataset,options}) => {
        let hasRes = true, res = {}
        if(options.x && (options.bins || options.customBins)){
            let bins = Number(options.customBins || options.bins), x = options.x
            let {max,min} = dataset.num_lists[x]
            let slots = [...Array(bins).keys()].map(i=>i*(max-min)/bins+min), data = [...Array(bins).keys()].fill(0)

            aggregatedDataset[x].forEach(value=>{
                for(let i=slots.length-1;i>=0;i--){
                    if(slots[i]<=value){
                        data[i]++;
                        break
                    }
                }
            })

            res = {
                title: {
                    left: 'center',
                    text: 'Data',
                },
                xAxis: {
                    type: 'category',
                    data:slots.map(slot=>`>=${slot}`)
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        name: '',
                        type: 'bar',
                        smooth: options.smoothed,
                        symbol: 'none',
                        areaStyle: {},
                        data: data
                    }
                ]
            }

        }else{
            hasRes = false
        }
        return {res,hasRes}
    }
}


export default {
    config,view
}