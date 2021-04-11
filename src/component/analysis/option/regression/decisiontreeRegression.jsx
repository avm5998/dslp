import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_list: [30, 20, 10],
    max_depth_dtr_list: [5,6,7,8,9,10],
    find_max_depth_dtr_list: ["1,2,3,4,5,10,15,20,25,50"],
    max_leaf_nodes_dtr_list: [5,10,15,20,25],
    random_state_dtr_list: [0,1,2,3,4,5]


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
                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default: 30%"/></Label>
                <Input onInput={(e,v) => {
                    result.test_size = v 
                }} customStyle={`w-64`} attrs={{ list: 'test_size_list' }} />

                <Label text='Set parameters: max_depth'><InlineTip info="Default: None"/></Label>
                <Input onInput={(e,v) => {
                    result.param_max_depth = v 
                }} customStyle={`w-64`} attrs={{ list: 'max_depth_dtr_list' }} />

                <Label customStyle={``} text='Visualize Tree' ><InlineTip info="Plot decision tree"/></Label>
                <DropDown defaultText={'Select tree type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Text Graph', 'Flowchart', "No Plot"]} 
                    onSelect={e => {
                        result.visual_tree = e
                    } 
                }/>

                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset. Note: Set 'Visualize Tree=No Plot'; Default:line"/></Label>
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

                <Label text='Find the Best Hyper-Parameters: max_depth'><InlineTip info="Input the result in 'set parameter:max_depth'"/></Label>
                <Input onInput={(e,v) => {
                    result.find_max_depth = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_max_depth_dtr_list' }} />


            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>

                <Label customStyle={``} text='Set Parameters: criterion'><InlineTip info="Default: mse"/></Label>
                <DropDown defaultText={'Select criterion'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['mse','friedman_mse','mae', 'poisson']}
                    onSelect={name => {
                        result.param_criterion = name  
                }} />
                <Label customStyle={``} text='Set Parameters: splitter'><InlineTip info="Default: best"/></Label>
                <DropDown defaultText={'Select splitter'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['best','random']}
                    onSelect={name => {
                        result.param_splitter = name  
                }} />
                <Label customStyle={``} text='Set Parameters: max_features'><InlineTip info="Default: None"/></Label>
                <DropDown defaultText={'Select max_features'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['auto','sqrt', 'log2']}
                    onSelect={name => {
                        result.param_max_features = name 
                }} />
                <Label customStyle={``} text='Set Parameters: max_leaf_nodes'><InlineTip info="Default: None"/></Label>
                <Input onInput={(e,v) => {
                    result.param_max_leaf_nodes = v 
                }} customStyle={`w-64`} attrs={{ list: 'max_leaf_nodes_dtr_list' }} />
                <Label customStyle={``} text='Set Parameters: random_state'><InlineTip info="Default: None"/></Label>
                <Input onInput={(e,v) => {
                    result.param_random_state = v 
                }} customStyle={`w-64`} attrs={{ list: 'random_state_dtr_list' }} />


               


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