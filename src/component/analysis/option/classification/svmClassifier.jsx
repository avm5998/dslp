import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_svc_list: [30, 20, 10],
    C_svc_list: [1,2,3,4,5],
    gamma_svc_list: [0.001, 0.01, 0.1],
    find_C_svc_list: ["1,2,3,5,6"],
    find_gamma_svc_list: ["0.0001,0.001"]
}

export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.classification['SVM Classifier'] || {}
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
                <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
                <MultiSelect defaultValue={option.finalVar} customHeight={'h-10'} customWidth={'w-64'} defaultText='select one/multi-column' wrapSelection={false} defaultOpen={false} selections={dataset.cols} onSelect={e=>result.finalVar = e}/>

                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>

                <Label text="Choose Test Size(%)" />
                <Input defaultValue={30} onInput={(e,v) => {
                    result.test_size = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_svc_list' }} />

                <Label text='Set parameters: C'><InlineTip info="Default: 1.0"/></Label>
                <Input defaultValue={1.0} onInput={(e,v) => {
                    result.param_C = v 
                }} customStyle={`w-64`} attrs={{ list: 'C_svc_list' }} />

                <Label text='Set parameters: gamma'><InlineTip info="Default: 0.01"/></Label>
                <Input defaultValue={0.01} onInput={(e,v) => {
                    result.param_gamma = v 
                }} customStyle={`w-64`} attrs={{ list: 'gamma_svc_list' }} />


                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info=""/></Label>
                <DropDown defaultText={'line'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:' />
                <DropDown defaultText={'Classification Report'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'ROC Curve']}
                    onSelect={name => {
                        result.metric = name
                    }} />

                <Label text='Find the Best Hyper-Parameters: C'><InlineTip info="Input the result in 'set parameter:C'"/></Label>
                <Input onInput={(e,v) => {
                    result.find_C = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_C_svc_list' }} />
                 <Label text='Find the Best Hyper-Parameters: gamma'><InlineTip info="Input the result in 'set parameter:gamma'"/></Label>
                <Input onInput={(e,v) => {
                    result.find_gamma = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_gamma_svc_list' }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                <Label customStyle={``} text='Set Parameters: kernel'><InlineTip info="Default: rbf"/></Label>
                <DropDown defaultText={'rbf'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['linear', 'poly', 'rbf', 'sigmoid', 'precomputed']}
                    onSelect={name => {
                        result.param_kernel = name  
                }} />
            </div>
            <div className={`grid grid-cols-4 gap-4 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
                    <Checkbox label={col} name='suboption_checked' item={col}/>
                        <Input onInput={(e,v) => {
                            result['SVM Classifier'+ col] = v 
                }}className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Input value'/> 
                {/* name={col+'_Bins'} */}
                </React.Fragment>)}
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