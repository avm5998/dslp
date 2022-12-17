import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_dtc_list: [30, 20, 10],
    max_depth_dtc_list: [5, 6, 7, 8, 9],
    find_max_depth_dtc_list: ['1,2,3,4,5,10,15,20,25,50,100'],
    max_leaf_nodes_dtc_list: [5,10,15,20]
}

export default function ({ dataset, result, submit, visibleTabs}) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.classification['Decision Tree Classifier'] || {}
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
                   {/* how to make it hidden  */}
                <Label customStyle={``} text='Select Extract Model:' ><InlineTip info="Select one extraction model for text data"/></Label>
                <DropDown zIndex={30} defaultValue={option.text_data_feat_model} defaultText={'Select model'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['--', 'CountVectorizer', 'TfidfVectorizer']} 
                        onSelect={e => {
                            result.text_data_feat_model = e
                        }}/>

                <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
                <MultiSelect zIndex={29} defaultValue={option.finalVar} customHeight={'h-10'} customWidth={'w-64'} defaultText='select one/multi-column' wrapSelection={false} defaultOpen={false} selections={dataset.tableData.columns.map(obj=>obj.Header)} onSelect={e=>result.finalVar = e}/>


                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown zIndex={28} defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.tableData.columns.map(obj=>obj.Header)} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>

                <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
                <Input defaultValue={option.test_size} placeholder='30' onInput={(e,v) => {
                    result.test_size = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_dtc_list' }} />

                <Label customStyle={``} text='Set parameters: max_depth'><InlineTip info="Default: None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."/></Label>
                <Input defaultValue={option.param_max_depth} placeholder='None' onInput={(e,v) => {
                    result.param_max_depth = v
                }} customStyle={`w-64 `} attrs={{ list: 'max_depth_dtc_list' }} />


                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Visualize prediction of testing dataset. Default: line"/></Label>
                <DropDown defaultValue={''} defaultText={'line'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance. Default: Classification Report"/></Label>
                <DropDown defaultValue={''} defaultText={'Classification Report'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'Confusion Matrix (Without Normalization)','ROC Curve', 'Visualize Tree: Text Graph', 'Visualize Tree: Flowchart']}
                    onSelect={name => {
                        result.metric = name
                    }} />

                <Label text='Find the Best Hyper-Parameters: max_depth'><InlineTip info="Clear 'Predict Options'. Set 'Visualize Tree'='No plot'. Input the result in 'set parameter: max_depth'. Clear it after used."/></Label>
                <Input placeholder='Input a list of integers' onInput={(e,v) => {
                    result.find_max_depth = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_max_depth_dtc_list' }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                <Label customStyle={``} text='Set parameters: criterion'><InlineTip info="Default: gini. The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “entropy” for the information gain."/></Label>
                <DropDown zIndex={27} defaultValue={option.param_criterion}  defaultText={'gini'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['gini', 'entropy']}
                    onSelect={name => {
                        result.param_criterion = name
                    }} />
                <Label customStyle={``} text='Set parameters: max_leaf_nodes'><InlineTip info="Default: None. Grow a tree with max_leaf_nodes in best-first fashion.  If None then unlimited number of leaf nodes."/></Label>
                <Input defaultValue={option.param_max_leaf_nodes} placeholder='None' onInput={(e,v) => {
                    result.param_max_leaf_nodes = v
                    }} customStyle={`w-64`} attrs={{ list: 'max_leaf_nodes_dtc_list' }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
                    <Label>{col}</Label>
                        <Input onInput={(e,v) => {
                            result['Decision Tree Classifier' + col] = v 
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