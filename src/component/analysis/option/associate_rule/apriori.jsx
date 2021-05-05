import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    // min_support_apriori_list:[0.1, 0.2, 0.3, 0.4, 0.5],
    // min_threshold_metric_apriori_list: [1, 1.1, 1.2, 1.3, 1.4, 1.5],
    support_min_threshold_list: [0.1, 0.2, 0.3, 0.4, 0.5],
    lift_min_threshold_list: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    confidence_min_threshold_list: [0.5, 0.6, 0.7, 0.8, 0.9],
    antecedent_length_list: [1, 2, 3],
    max_len_apriori_list: [10, 15, 20, 25, 30]
}

export default function ({ dataset, result, submit }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.associate_rule['Apriori'] || {}
    let [showOptions_Apriori, setShowOptions_Apriori] = useState(false)
    // let [metrics_apriori, setMetrics_apriori] = useState(-1)
    
    return (
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                
                <Label customStyle={``} text='Transaction ID' ><InlineTip info="Select the column containing the id of all transations"/></Label>
                <DropDown defaultValue={option.trans_id} defaultText={'Select id column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.trans_id = e
                    } 
                }/>

                <Label customStyle={``} text='Transacion Items' ><InlineTip info="Select the column containing the items about transations"/></Label>
                <DropDown defaultValue={option.trans_item} defaultText={'select item column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.trans_item = e
                    } 
                }/>
                {/* <Label text="Set parameters: min_support"><InlineTip info="Support Itemsets: set threshold for support. Default:0.5"/></Label>
                <Input onInput={(e,v) => {
                    result.params_min_support = v 
                }} customStyle={`w-64`} attrs={{ list: 'min_support_apriori_list' }} /> */}

                {/* <Label customStyle={``} text='Set parameters: metric' ><InlineTip info="Association Rule: set metric for association rules.  Default: confidence"/></Label>
                <DropDown  defaultText={'Select metric'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['lift', 'confidence', 'support']} 
                    onSelect={e => {
                        result.params_metric = e
                    } 
                }/>
                 <Label text="Set parameters: min_threshold"><InlineTip info="Association Rules: set threshold for related metrics. Default:0.8"/></Label>
                <Input onInput={(e,v) => {
                    result.params_min_threshold = v 
                }} customStyle={`w-64`} attrs={{ list: 'min_threshold_metric_apriori_list' }} /> */}
               
                <Label text="support_min_threshold"><InlineTip info="Set parameters: threshold for 'support'. Default:0.1"/></Label>
                <Input defaultValue={0.1} onInput={(e,v) => {
                    result.params_support_min_thresh = v 
                }} customStyle={`w-64`} attrs={{ list: 'support_min_threshold_list' }} />
   
                <Label text="lift_min_threshold"><InlineTip info="Set parameters: threshold for 'lift'. Default:1.0"/></Label>
                <Input defaultValue={1.0} onInput={(e,v) => {
                    result.params_lift_min_thresh = v 
                }} customStyle={`w-64`} attrs={{ list: 'lift_min_threshold_list' }} />
                
                <Label text="confidence_min_threshold"><InlineTip info="Set parameters: threshold for 'confidence'. Default:0.5"/></Label>
                <Input defaultValue={0.5} onInput={(e,v) => {
                    result.params_confidence_min_thresh = v 
                }} customStyle={`w-64`} attrs={{ list: 'confidence_min_threshold_list' }} />

                <Label text="antecedent_length"><InlineTip info="Set parameters: threshold for 'antecedent_length'. Default:1"/></Label>
                <Input defaultValue={1} onInput={(e,v) => {
                    result.params_antecedent_len = v 
                }} customStyle={`w-64`} attrs={{ list: 'antecedent_length_list' }} />




                <Label text='Metrics of Model:'> <InlineTip info="Default: 5.Association Rules: list all items"/></Label>
                <DropDown defaultText={'5.Association Rules: list all items'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false}  items={['1.Transaction Format Table', '2.Support Itemsets: list all items', '3.Support Itemsets: list specified items', '4.Support Itemsets: list the most popular items', '5.Association Rules: list all items', '6.Association Rules: list specified items'].map((item,i)=>{
                    let onClick = ()=>{
                        result.metrics_apriori = item
                        if(i===2 || i===5){
                            setShowOptions_Apriori(1)
                        }
                        else{
                            setShowOptions_Apriori(0)
                        }
                    }
                    return {
                        name:item,onClick
                    }
                })}/>
                <Label customStyle={`${showOptions_Apriori?'':'hidden'}`} text='Input Specific Item'/>
                <Input customStyle={`w-64 ${showOptions_Apriori?'':'hidden'}`}  
                onInput={e=>{
                    result.param_specific_item = e.target.value
                }}/>
               

            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                <Label customStyle={``} text='Set Parameters: use_colnames'><InlineTip info="Support Itemsets: Default:True"/></Label>
                <DropDown defaultValue={option.params_use_colnames} defaultText={'Select use_colnames'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['True', 'False']}
                    onSelect={name => {
                        result.params_use_colnames = name  
                }} />
                <Label customStyle={``} text='Set Parameters: max_len'><InlineTip info="Support Itemsets: Default:None"/></Label>
                <Input onInput={(e,v) => {
                    result.params_max_len = v 
                }} customStyle={`w-64`} attrs={{ list: 'max_len_apriori_list' }} />
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