import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    n_clusters_agglo_list: [1,2,3,4,5,6,7,8],
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
            
                <Label text='Set parameters: n_clusters'><InlineTip info="Default: 2"/></Label>
                <Input onInput={(e,v) => {
                    result.param_n_clusters_agglo= v 
                }} customStyle={`w-64`} attrs={{ list: 'n_clusters_agglo_list' }} />


                <Label customStyle={``} text='Clustering Plot' ><InlineTip info="Plot clusters in the dataset.  Default: All Pairs 2D"/></Label>
                <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['dendrogram']} 
                    onSelect={e => {
                        result.clustering_plot_agglo = e
                    } 
                }/>

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance.  Default: centroid"/></Label>
                <DropDown defaultText={'Select metric'} customStyle={`w-64`} customUlStyle={`w-64`} showOnHover={false} items={['inertia', 'centroid', 'number of iterations', 'silhouette']}
                    onSelect={name => {
                        result.metric_agglo = name
                    }
                }/>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>

                <Label customStyle={``} text='Set Parameters: affinity'><InlineTip info="Default: euclidean"/></Label>
                <DropDown defaultText={'Select affinity'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['euclidean','manhattan','cosine']}
                    onSelect={name => {
                        result.param_affinity = name  
                }} />
               
                <Label customStyle={``} text='Set Parameters: linkage'><InlineTip info="Default: ward"/></Label>
                <DropDown defaultText={'Select linkage'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['ward', 'complete', 'average', 'single']}
                    onSelect={name => {
                        result.param_linkage = name  
                }} />

                <Label customStyle={``} text='Set Parameters: algorithm'><InlineTip info="Default: auto"/></Label>
                <DropDown defaultText={'Select algorithm'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['auto','full','elkan']}
                    onSelect={name => {
                        result.param_algorithm = name  
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