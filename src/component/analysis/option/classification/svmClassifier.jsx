import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_svc_list: [30, 20, 10],
    C_svc_list: [1,2,3,4,5],
    gamma_svc_list: [0.001, 0.01, 0.1],
    find_C_svc_list: ["1,2,3,5,6"],
    find_gamma_svc_list: ["0.0001,0.001"]
}

export default function ({ dataset, result, submit }) {
    let [activeTab, setActiveTab] = useState(0)

    return (
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                <Label text="Choose Test Size(%)" />
                <Input onInput={(e,v) => {
                    result.test_size = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_svc_list' }} />

                <Label text='Set parameters: C'><InlineTip info="Default: 1.0"/></Label>
                <Input onInput={(e,v) => {
                    result.param_C = v 
                }} customStyle={`w-64`} attrs={{ list: 'C_svc_list' }} />

                <Label text='Set parameters: gamma'><InlineTip info="Default: scale"/></Label>
                <Input onInput={(e,v) => {
                    result.param_gamma = v 
                }} customStyle={`w-64`} attrs={{ list: 'gamma_svc_list' }} />


                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info=""/></Label>
                <DropDown defaultText={'Select plot type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:' />
                <DropDown defaultText={'Select metrics'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'ROC Curve']}
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
                <DropDown defaultText={'Select kernel'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['linear', 'poly', 'rbf', 'sigmoid', 'precomputed']}
                    onSelect={name => {
                        result.param_kernel = name  
                }} />
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