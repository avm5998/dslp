import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_lr_list: [30, 20, 10],
    C_logr_list: [0.1, 0.2, 0.3],
}

export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.regression['Linear Regression'] || {}
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
                <MultiSelect zIndex={30} defaultValue={option.finalVar} width='w-64' defaultText='select one/multi-column' selections={dataset.cols} 
                    onSelect={e=>result.finalVar = e}/>

                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown zIndex={29} defaultValue={option.finalY} defaultText={'select one column'}  width='w-64' items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>

                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
                <Input defaultValue={option.test_size}  placeholder='30' onInput={(e,v) => {
                    result.test_size = v 
                }} width={`w-64`} attrs={{ list: 'test_size_lr_list' }} />

                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset."/></Label>
                <DropDown defaultValue={option.pre_obs_plotType} defaultText={'line'}  width='w-64' items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
                <DropDown defaultValue={option.metric} defaultText={'neg_mean_squared_error'} width='w-64'  items={['explained_variance', 'neg_mean_absolute_error', 'neg_mean_squared_error', 'r2', 'neg_mean_poisson_deviance', 'neg_mean_gamma_deviance']}
                    onSelect={name => {
                        result.metric = name
                    }
                } />

            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                <Label customStyle={``} text='Set Parameters: fit_intercept'><InlineTip info="Default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations. Details see https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"/></Label>
                <DropDown zIndex={28} defaultValue={option.param_fit_intercept_lr} defaultText={'True'}  width='w-64' items={['True', 'False']}
                    onSelect={name => {
                        result.param_fit_intercept_lr = name
                }} />
                <Label customStyle={``} text='Set Parameters: normalize'><InlineTip info="Default=False. If True, the regressors X will be normalized before regression. Details see https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"/></Label>
                <DropDown zIndex={27} defaultValue={option.param_normalize_lr} defaultText={'False'}  width='w-64' items={['True', 'False']}
                    onSelect={name => {
                        result.param_normalize_lr = name  
                }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
                    <Label>{col}</Label>
                        <Input onInput={(e,v) => {
                            result['Linear Regression'+ col] = v 
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