import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_list: [30, 20, 10],
    max_depth_rfr_list: [5,6,7,8,9,10],
    n_estimators_rfr_list: [5,10,20,30,40,50],
    
    find_max_depth_rfr_list: ["5,10,15,20"],
    find_n_estimators_rfr_list: ["10,25,50,100"],
    max_leaf_nodes_rfr_list: [5,10,15,20,25],
    random_state_rfr_list: [0,1,2,3,4,5]


}
const s1 = ['bar', 'scatter', 'line', 'heatmap', 'regressionplot']
const s2 = ['bar', 'scatter', 'line', 'heatmap']

export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.regression['Random Forests Regression'] || {}

    useEffect(()=>{
        setActiveTab(visibleTabs[0])
    },[visibleTabs])
    let [dropselections,setdropselections] = useState(s2)


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
                    onSelect={e=>{
                        result.finalVar = e
                        if(e.length>1){
                            setdropselections(s2)
                        }else{
                            setdropselections(s1)
                        }
                    }}/>
                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown zIndex={29} defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>

                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
                <Input defaultValue={option.test_size} placeholder='30' onInput={(e,v) => {
                    result.test_size = v 
                }} customStyle={`w-64`} attrs={{ list: 'test_size_list' }} />

                <Label text='Set parameters: max_depth'><InlineTip info="Integer or None. Default: None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."/></Label>
                <Input defaultValue={option.param_max_depth} placeholder='None' onInput={(e,v) => {
                    result.param_max_depth = v 
                }} customStyle={`w-64`} attrs={{ list: 'max_depth_rfr_list' }} />

                <Label text='Set parameters: n_estimators'><InlineTip info="Integer. Default: 100. The number of trees in the forest."/></Label>
                <Input defaultValue={option.param_n_estimators} placeholder='100' onInput={(e,v) => {
                    result.param_n_estimators = v 
                }} customStyle={`w-64`} attrs={{ list: 'n_estimators_rfr_list' }} />


                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset."/></Label>
                <DropDown defaultText={'line'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dropselections} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
                <DropDown defaultText={'neg_mean_squared_error'} customStyle={`w-64`} customUlStyle={`w-64`} showOnHover={false} items={['explained_variance', 'neg_mean_absolute_error', 'neg_mean_squared_error', 'r2', 'neg_mean_poisson_deviance', 'neg_mean_gamma_deviance']}
                    onSelect={name => {
                        result.metric = name
                    }
                } />

                <Label text='Find the Best Hyper-Parameters: max_depth'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter: max_depth'"/></Label>
                <Input placeholder='Input a list of integers' onInput={(e,v) => {
                    result.find_max_depth = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_max_depth_rfr_list' }} />
                 <Label text='Find the Best Hyper-Parameters: n_estimators'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter: n_estimators'"/></Label>
                <Input placeholder='Input a list of integers' onInput={(e,v) => {
                    result.find_n_estimators = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_n_estimators_rfr_list' }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>

                <Label customStyle={``} text='Set Parameters: criterion'><InlineTip info="Default: mse. The function to measure the quality of a split. “mse” is for the mean squared error,  “mae” is for the mean absolute error."/></Label>
                <DropDown zIndex={28} defaultValue={option.param_criterion} defaultText={'mse'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['mse', 'mae']}
                    onSelect={name => {
                        result.param_criterion = name  
                }} />
                <Label customStyle={``} text='Set Parameters: max_features'><InlineTip info="Default: auto. The number of features to consider when looking for the best split: If “auto”, then max_features=n_features. If “sqrt”, then max_features=sqrt(n_features). If “log2”, then max_features=log2(n_features). If None, then max_features=n_features."/></Label>
                <DropDown zIndex={27} defaultValue={option.param_max_features} defaultText={'auto'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['auto','sqrt', 'log2']}
                    onSelect={name => {
                        result.param_max_features = name  
                }} />
                <Label customStyle={``} text='Set Parameters: max_leaf_nodes'><InlineTip info="Integer or None. Default: None. Grow trees with max_leaf_nodes in best-first fashion. If None then unlimited number of leaf nodes."/></Label>
                <Input defaultValue={option.param_max_leaf_nodes} placeholder='None' onInput={(e,v) => {
                    result.param_max_leaf_nodes = v 
                }} customStyle={`w-64`} attrs={{ list: 'max_leaf_nodes_rfr_list' }} />
                <Label customStyle={``} text='Set Parameters: random_state'><InlineTip info="Integer or None. Default: None. Controls the randomness of the sampling of the features."/></Label>
                <Input defaultValue={option.param_random_state} placeholder='None' onInput={(e,v) => {
                    result.param_random_state = v 
                }} customStyle={`w-64`} attrs={{ list: 'random_state_rfr_list' }} />


            </div>
            
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
                    <Label>{col}</Label>
                        <Input onInput={(e,v) => {
                            result['Random Forests Regression'+ col] = v 
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