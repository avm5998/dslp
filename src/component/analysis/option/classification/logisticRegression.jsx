import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_logr_list: [30, 20, 10],
    C_logr_list: [0.1, 0.2, 0.3],
    find_solver_logr_list: ['newton-cg,lbfgs,liblinear,sag,saga'],
    find_C_logr_list: ['100,10,1.0,0.1,0.01'],
}

export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.classification['Logistic Regression'] || {}
    let [isTsv, setIsTsv] = useState(0)

    useEffect(()=>{
        setActiveTab(visibleTabs[0])
        let extension = dataset.filename.substr(dataset.filename.lastIndexOf('.')+1)
        if(extension === 'tsv'){
            setIsTsv(1)
        }
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
                <Label customStyle={``} text='Select Extract Model:' ><InlineTip info="Select one extraction model for text data"/></Label>
                <DropDown zIndex={30} defaultValue={option.text_data_feat_model} defaultText={'Select model'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['--', 'CountVectorizer', 'TfidfVectorizer']} 
                        onSelect={e => {
                            result.text_data_feat_model = e
                        }}/>

                <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
                <MultiSelect zIndex={29} defaultValue={option.finalVar} customHeight={'h-10'} customWidth={'w-64'} defaultText='select one/multi-column' wrapSelection={false} defaultOpen={false} selections={dataset.cols} onSelect={e=>result.finalVar = e}/>


                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown zIndex={28} defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>
                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
                <Input defaultValue={option.test_size} placeholder='30' onInput={(e,v) => {
                    result.test_size = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_logr_list' }} />

                <Label customStyle={``} text='Set parameters: solver'><InlineTip info="Default: lbfgs. Algorithm to use in the optimization problem. ‘newton-cg’, ‘lbfgs’, ‘sag’ and ‘saga’ handle L2 or no penalty; ‘liblinear’ and ‘saga’ also handle L1 penalty; ‘saga’ also supports ‘elasticnet’ penalty; ‘liblinear’ does not support setting penalty='none'"/></Label>
                <DropDown zIndex={27} defaultValue={option.param_solver} defaultText={'lbfgs'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['newton-cg', 'lbfgs', 'liblinear', 'sag', 'saga']}
                    onSelect={name => {
                        result.param_solver = name
                    }} />

                <Label customStyle={``} text='Set parameters: C'><InlineTip info="Float. Default: 1.0. Inverse of regularization strength; must be a positive float. "/></Label>
                <Input defaultValue={option.param_C} placeholder='1.0' onInput={(e,v) => {
                    result.param_C = v
                }} customStyle={`w-64`} attrs={{ list: 'C_logr_list' }} />

                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Visualize prediction of testing dataset. Default: line"/></Label>
                <DropDown defaultValue={''} defaultText={'line'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance. Default: Classification Report"/></Label>
                <DropDown defaultValue={''} defaultText={'Classification Report'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'ROC Curve']}
                    onSelect={name => {
                        result.metric = name
                    }} />

                <Label text='Find the Best Hyper-Parameters: C'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter: C'"/></Label>
                <Input placeholder='Input a list of float numbers' onInput={(e,v) => {
                    result.find_C = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_C_logr_list' }} />
                 <Label text='Find the Best Hyper-Parameters: solver'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter: solver'"/></Label>
                <Input placeholder='Input a list of string' onInput={(e,v) => {
                    result.find_solver = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_solver_logr_list' }} />
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
                            result['Logistic Regression'+ col] = v 
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