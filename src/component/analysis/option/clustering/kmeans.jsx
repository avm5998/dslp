import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    n_clusters_kmeans_list: [1,2,3,4,5,6,7,8],
    // find_n_clusters_kmeans_list: [5,6,7,8,9,10],
    random_state_kmeans_list: [0,1,2,3,4,5]


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
            
                <Label text='Set parameters: n_clusters'><InlineTip info="Default: 8"/></Label>
                <Input onInput={(e,v) => {
                    result.param_n_clusters = v 
                }} customStyle={`w-64`} attrs={{ list: 'n_clusters_kmeans_list' }} />

                {/* <Label customStyle={``} text='Visualize Tree' ><InlineTip info="Plot decision tree"/></Label>
                <DropDown defaultText={'Select tree type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Text Graph', 'Flowchart', "No Plot"]} 
                    onSelect={e => {
                        result.visual_tree = e
                    } 
                }/> */}

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

                <Label customStyle={``} text='Set Parameters: init'><InlineTip info="Default: mse"/></Label>
                <DropDown defaultText={'Select init'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['k-means++','random','centroids']}
                    onSelect={name => {
                        result.param_init = name  
                }} />
               
                <Label customStyle={``} text='Set Parameters: random_state'><InlineTip info="Default: None"/></Label>
                <Input onInput={(e,v) => {
                    result.param_random_state = v 
                }} customStyle={`w-64`} attrs={{ list: 'random_state_kmeans_list' }} />


               


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