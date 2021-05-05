import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_rfc_list: [30, 20, 10],
    max_depth_rfc_list: [5, 6, 7, 8, 9],
    n_estimators_rfc_list: [10, 15, 20],
    find_max_depth_rfc_list: ['5,10,15,20,50,70'],
    find_n_estimators_rfc_list: ['10,25,50,100,150,200'],
    max_leaf_nodes_rfc_list: [5,10,15,20]
}

export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.classification['Random Forests Classifier'] || {}

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
                <DropDown defaultText={'Select model'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['CountVectorizer', 'TfidfVectorizer']} 
                        onSelect={e => {
                            result.text_data_feat_model = e
                        }}/>

                <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
                <MultiSelect defaultValue={option.finalVar} customHeight={'h-10'} customWidth={'w-64'} defaultText='select one/multi-column' wrapSelection={false} defaultOpen={false} selections={dataset.cols} onSelect={e=>result.finalVar = e}/>

                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
                <DropDown defaultValue={option.finalY} defaultText={'select one column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>

                <Label text="Choose Test Size(%)" />
                <Input defaultValue={30} onInput={(e,v) => {
                    result.test_size = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_rfc_list' }} />

                <Label customStyle={``} text='Set parameters: max_depth' />
                <Input defaultValue={4} onInput={(e,v) => {
                    result.param_max_depth = v
                }} customStyle={`w-64 `} attrs={{ list: 'max_depth_rfc_list' }} />
                <Label customStyle={``} text='Set parameters: n_estimators' />
                <Input defaultValue={100} onInput={(e,v) => {
                    result.param_n_estimators = v
                }} customStyle={`w-64 `} attrs={{ list: 'n_estimators_rfc_list' }} />


                <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info=""/></Label>
                <DropDown defaultText={'line'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} 
                    onSelect={e => {
                        result.pre_obs_plotType = e
                    } 
                }/>

                <Label text='Metrics of Model:' />
                <DropDown defaultText={'Classification Report'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'ROC Curve']}
                    onSelect={name => {
                        result.metric = name
                    }} />

                <Label text='Find the Best Hyper-Parameters: max_depth'/>
                <Input onInput={(e,v) => {
                    result.find_max_depth = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_max_depth_rfc_list' }} />
                <Label text='Find the Best Hyper-Parameters: n_estimators'/>
                <Input onInput={(e,v) => {
                    result.find_n_estimators = v 
                }} customStyle={`w-64`} attrs={{ list: 'find_n_estimators_rfc_list' }} />
                
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                <Label customStyle={``} text='Set parameters: criterion' />
                <DropDown defaultText={'gini'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['gini', 'entropy']}
                    onSelect={name => {
                        result.param_criterion = name
                    }} />
                <Label customStyle={``} text='Set parameters: max_leaf_nodes' />
                <Input defaultValue={'None'}  onInput={(e,v) => {
                    result.param_max_leaf_nodes = v
                    }} customStyle={`w-64`} attrs={{ list: 'max_leaf_nodes_rfc_list' }} />
            </div>
            <div className={`grid grid-cols-4 gap-4 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '5vw 1fr 5vw 1fr'
                }}>
                {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
                    <Checkbox label={col} name='suboption_checked' item={col}/>
                        <Input onInput={(e,v) => {
                            result['Random Forests Classifier'+ col] = v 
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