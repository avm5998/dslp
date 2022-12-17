import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_bayes_list: [30, 20, 10]
}

export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.classification['K Nearest Neighbors Classifier'] || {}
    useEffect(()=>{
        setActiveTab(visibleTabs[0])
    },[visibleTabs])

    return (
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${visibleTabs.indexOf(0)==-1?'hidden':''} ${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`${visibleTabs.indexOf(1)==-1?'hidden':''} ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
                <div className={`${visibleTabs.indexOf(2)==-1?'hidden':''} ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Predict Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                   {/* how to make it hidden  */}
                <Label text="Choose Neighbors"><InlineTip info="Use by default for kneighbors queries. Default: 5"/></Label>
                <Input defaultValue={option.neighbors} placeholder='5' onInput={(e,v) => {
                    result.neighbors = v
                }} customStyle={`w-64 `}/>
                <Label customStyle={``} text='Select Weights:' ><InlineTip info="Select one weights used in prediction. Default: uniform"/></Label>
                <DropDown zIndex={30} defaultValue={option.weights} defaultText={'Select weights'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['uniform', 'distance']} 
                        onSelect={e => {
                            result.weights = e
                        }}/>

                <Label customStyle={``} text='Select Algorithm:' ><InlineTip info="Select one algorithm to compute the nearest neighbors. Default: auto"/></Label>
                <DropDown zIndex={30} defaultValue={option.algorithm} defaultText={'Select algorithm'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['auto', 'ball_tree', 'kd_tree', 'brute']} 
                        onSelect={e => {
                            result.algorithm = e
                        }}/>

                <Label text="Choose Leaf Size"><InlineTip info="Affect the speed of the construction and query. Default: 30"/></Label>
                <Input defaultValue={option.leaf_size} placeholder='30' onInput={(e,v) => {
                    result.leaf_size = v
                }} customStyle={`w-64 `}/>

                <Label text="Choose p"><InlineTip info="Power parameter for the Minkowski metric. Default: 2"/></Label>
                <Input defaultValue={option.p} placeholder='2' onInput={(e,v) => {
                    result.p = v
                }} customStyle={`w-64 `}/>

                <Label text="Choose Metric"><InlineTip info="Str or callable. Default: minkowski"/></Label>
                <Input defaultValue={option.d_metric} placeholder='minkowski' onInput={(e,v) => {
                    result.d_metric = v
                }} customStyle={`w-64 `}/>

                <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
                <MultiSelect zIndex={29} defaultValue={option.finalVar} customHeight={'h-10'} customWidth={'w-64'} defaultText='select one/multi-column' wrapSelection={false} defaultOpen={false} selections={dataset.tableData.columns.map(obj=>obj.Header)} onSelect={e=>result.finalVar = e}/>

                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown zIndex={28} defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.tableData.columns.map(obj=>obj.Header)} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>
                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
                <Input defaultValue={option.test_size} placeholder='30' onInput={(e,v) => {
                    result.test_size = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_bayes_list' }} />


                {/* <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in testing dataset.  Default: line"/></Label>
                <DropDown defaultText={'line'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/> */}

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance. Default: Classification Report"/></Label>
                <DropDown defaultText={'Classification Report'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix','Confusion Matrix (Without Normalization)', 'ROC Curve']}
                    onSelect={name => {
                        result.metric = name
                    }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
                     <Label>{col}</Label>
                        <Input onInput={(e,v) => {
                            result['K Nearest Neighbors Classifier'+ col] = v 
                }}className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Input value'/> 
                </React.Fragment>)}
                <Label text='Note:'/>
                <Label text="The Target Column: ">{result.finalY}</Label>
            </div>
            <div className='flex justify-end'>
                <Button onClick={e => {
                    submit()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
            </div>
            <>
                {Object.keys(DataLists).map(key => <datalist key={key} id={key}>
                    {DataLists[key].map(value => <option key={key + value} value={value}></option>)}
                </datalist>)}
            </>
        </div>)
}