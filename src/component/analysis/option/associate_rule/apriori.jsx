import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'

const DataLists = {
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
                <DropDown zIndex={30} defaultValue={option.trans_id} defaultText={'Select id column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.trans_id = e
                    } 
                }/>

                <Label customStyle={``} text='Transacion Items' ><InlineTip info="Select the column containing the items about transations"/></Label>
                <DropDown zIndex={29} defaultValue={option.trans_item} defaultText={'select item column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.trans_item = e
                    } 
                }/>
           
                <Label text="support min_threshold"><InlineTip info="Set parameters: threshold for 'support'. Default:0.1. 'support' is used to measure the abundance or frequency of an itemset in a database."/></Label>
                <Input defaultValue={option.params_support_min_thresh} placeholder='0.1' onInput={(e,v) => {
                    result.params_support_min_thresh = v 
                }} customStyle={`w-64`} attrs={{ list: 'support_min_threshold_list' }} />
   
                 <Label text="confidence min_threshold"><InlineTip info="Set parameters: threshold for 'confidence'. Default:0.5. The confidence of a rule A->C is the probability of seeing the consequent in a transaction given that it also contains the antecedent. Note that the metric is not symmetric or directed; for instance, the confidence for A->C is different than the confidence for C->A. The confidence is 1 (maximal) for a rule A->C if the consequent and antecedent always occur together."/></Label>
                <Input defaultValue={option.params_confidence_min_thresh} placeholder='0.5' onInput={(e,v) => {
                    result.params_confidence_min_thresh = v 
                }} customStyle={`w-64`} attrs={{ list: 'confidence_min_threshold_list' }} />

                <Label text="lift min_threshold"><InlineTip info="Set parameters: threshold for 'lift'. Default:1.0. The lift metric is commonly used to measure how much more often the antecedent and consequent of a rule A->C occur together than we would expect if they were statistically independent. If A and C are independent, the Lift score will be exactly 1."/></Label>
                <Input defaultValue={option.params_lift_min_thresh} placeholder='1.0' onInput={(e,v) => {
                    result.params_lift_min_thresh = v 
                }} customStyle={`w-64`} attrs={{ list: 'lift_min_threshold_list' }} />
                
               
                <Label text="antecedent length"><InlineTip info="Set parameters: threshold for 'antecedent_length'. Default:1"/></Label>
                <Input defaultValue={option.params_antecedent_len} placeholder='1' onInput={(e,v) => {
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
                <DropDown zIndex={28} defaultValue={option.params_use_colnames} defaultText={'Select use_colnames'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['True', 'False']}
                    onSelect={name => {
                        result.params_use_colnames = name  
                }} />
                <Label customStyle={``} text='Set Parameters: max_len'><InlineTip info="Support Itemsets: Default:None"/></Label>
                <Input defaultValue={option.params_max_len} placeholder='None' onInput={(e,v) => {
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