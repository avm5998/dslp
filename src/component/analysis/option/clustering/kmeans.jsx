import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    n_clusters_kmeans_list: [1,2,3,4,5,6,7,8],
    random_state_kmeans_list: [0,1,2,3,4,5]
}

export default function ({ dataset, result, submit }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.clustering['K-means'] || {}


    return (
        <div className='p-4'>

            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                <Label customStyle={``} text='Select Variable Columns' ><InlineTip info="Select the columns to cluster, and each column should be numerical."/></Label>
                <MultiSelect zIndex={30} defaultValue={option.variablesx} customHeight={'h-10'} customWidth={'w-64'} defaultText='Select One/Multi Columns' wrapSelection={false} defaultOpen={false} selections={dataset.cols} onSelect={e=>result.variablesx = e}/>

            
                <Label text='Set parameters: n_clusters'><InlineTip info="Integer. Default: 3. The number of clusters to form as well as the number of centroids to generate."/></Label>
                <Input defaultValue={option.param_n_clusters} placeholder='3' onInput={(e,v) => {
                    result.param_n_clusters = v 
                }} customStyle={`w-64`} attrs={{ list: 'n_clusters_kmeans_list' }} />


                <Label customStyle={``} text='Clustering Plot' ><InlineTip info="Plot clusters in dataset. If do PCA plot, go to 'Advanced Option' do PCA first.  Default: all attributes: 2D plot"/></Label>
                <DropDown zIndex={3} defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={["check clusters in dataset", 'all attributes: 2D plot', 'three attributes: 3D plot', 'PCA: 2D plot', "PCA: 3D plot"]} 
                    onSelect={e => {
                        result.clustering_plot = e
                    } 
                }/>
                

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance.  Default: centroid. , 'inertia': calculates the sum of distances of all the points within a cluster from the centroid of that cluster. 'centroid' is a data point at the center of a cluster. 'silhouette' is a measure of how similar an object is to its own cluster (cohesion) compared to other clusters (separation)."/></Label>
                <DropDown zIndex={3} defaultText={'Select metric'} customStyle={`w-64`} customUlStyle={`w-64`} showOnHover={false} items={['inertia', 'centroid', 'number of iterations', 'silhouette']}
                    onSelect={name => {
                        result.metric = name
                    }
                }/>                

                <Label text='Find the Best Hyper-Parameters for selected attributes: n_clusters'><InlineTip info="Input the result in 'set parameter: n_clusters'"/></Label>
                <DropDown defaultText={'Select method'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['elbow method', 'None']}
                    onSelect={name => {
                        result.find_n_clusters = name  
                }} />

                <Label text='Find the Best Hyper-Parameters for PCA: n_clusters'><InlineTip info="Input the result in 'set parameter: n_clusters'"/></Label>
                <DropDown defaultText={'Select method'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['elbow method', 'None']}
                    onSelect={name => {
                        result.find_n_clusters_pca = name  
                }} />

            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>

                <Label customStyle={``} text='Set Parameters: init'><InlineTip info="Default: k-means++. Method for initialization:‘k-means++’ : selects initial cluster centers for k-mean clustering in a smart way to speed up convergence. ‘random’: choose n_clusters observations (rows) at random from data for the initial centroids."/></Label>
                <DropDown zIndex={29} defaultValue={option.param_init} defaultText={'Select init'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['k-means++','random','centroids']}
                    onSelect={name => {
                        result.param_init = name  
                }} />
               
                <Label customStyle={``} text='Set Parameters: random_state'><InlineTip info="Integer or None. Default: None. Determines random number generation for centroid initialization."/></Label>
                <Input defaultValue={option.param_random_state} placeholder='None' onInput={(e,v) => {
                    result.param_random_state = v 
                }} customStyle={`w-64`} attrs={{ list: 'random_state_kmeans_list' }} />

                <Label customStyle={``} text='Set Parameters: algorithm'><InlineTip info="Default: auto. K-means algorithm to use. The classical EM-style algorithm is “full”. The “elkan” variation is more efficient on data with well-defined clusters, by using the triangle inequality."/></Label>
                <DropDown zIndex={28} defaultValue={option.param_algorithm} defaultText={'Select algorithm'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['auto','full','elkan']}
                    onSelect={name => {
                        result.param_algorithm = name  
                }} />


                {/* <Label customStyle={``} text='Do PCA: Principal Component Analysis'><InlineTip info="Default: 2 components"/></Label>
                <DropDown defaultText={'Select number of component'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['2 components','3 components']}
                    onSelect={name => {
                        result.param_number_pca = name  
                }} /> */}
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