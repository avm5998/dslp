import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_svr_list: [30, 20, 10],
    C_svm_list: [1,2,3,4,5],
    gamma_svm_list: [0.001, 0.01, 0.1],
    find_C_svm_list: ["1,2,3,5,6"],
    find_gamma_svm_list: ["0.0001,0.001"]
}

export default function ({ dataset, result, submit,visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.regression['SVM Regression'] || {}
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

                <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the column containing the id of all transations"/></Label>
                <MultiSelect defaultValue={option.finalVar} customHeight={'h-10'} customWidth={'w-64'} defaultText='select one/multi-column' wrapSelection={false} defaultOpen={false} selections={dataset.cols} onSelect={e=>result.finalVar = e}/>


                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the column containing the items about transations"/></Label>
                <DropDown defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>
                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model."/></Label>
                <Input defaultValue={30} onInput={(e,v) => {
                    result.test_size = v 
                }} customStyle={`w-64`} attrs={{ list: 'test_size_svr_list' }} />

                <Label text='Set parameters: C'><InlineTip info=" "/></Label>
                <Input defaultValue={1.0} onInput={(e,v) => {
                    result.param_C = v 
                }} customStyle={`w-64`} attrs={{ list: 'C_svm_list' }} />

                <Label text='Set parameters: gamma'><InlineTip info="Default: scale"/></Label>
                <Input defaultValue={0.01} onInput={(e,v) => {
                    result.param_gamma = v 
                }} customStyle={`w-64`} attrs={{ list: 'gamma_svm_list' }} />


                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset.  Default: line"/></Label>
                <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance.  Default: neg_mean_squared_error"/></Label>
                <DropDown defaultText={'Select metric'} customStyle={`w-64`} customUlStyle={`w-64`} showOnHover={false} items={['explained_variance', 'neg_mean_absolute_error', 'neg_mean_squared_error', 'r2', 'neg_mean_poisson_deviance', 'neg_mean_gamma_deviance']}
                    onSelect={name => {
                        result.metric = name
                    }
                } />

                <Label text='Find the Best Hyper-Parameters: C'><InlineTip info="Input the result in 'set parameter:C'"/></Label>
                <Input onInput={(e,v) => {
                    result.find_C = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_C_svm_list' }} />
                 <Label text='Find the Best Hyper-Parameters: gamma'><InlineTip info="Input the result in 'set parameter:gamma'"/></Label>
                <Input onInput={(e,v) => {
                    result.find_gamma = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_gamma_svm_list' }} />
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
            <div className={`grid grid-cols-4 gap-4 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                {dataset.cols.map((col,i)=><React.Fragment key={i}>
                    <Checkbox label={col} name='suboption_checked' item={col}/>
                        <Input onInput={(e,v) => {
                            result['SVM Regression'+ col] = v 
                }}className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Input value'/> 
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