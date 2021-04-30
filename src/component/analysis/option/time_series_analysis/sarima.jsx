import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    // min_support_apriori_list:[0.1, 0.2, 0.3, 0.4, 0.5],
    // min_threshold_metric_apriori_list: [1, 1.1, 1.2, 1.3, 1.4, 1.5],
    // max_len_apriori_list: [10, 15, 20, 25, 30]
}

export default function ({ dataset, result, submit }) {
    let [activeTab, setActiveTab] = useState(0)
    // let option = useSelector(state=>state.option).analysis.time_series_analysis['SARIMA'] || {}
    let [showOptions_Apriori, setShowOptions_Apriori] = useState(false)
    // let [metrics_apriori, setMetrics_apriori] = useState(-1)
    // let {result,checkbox : checkbox2, input : input2,getData,clearData} = useSimpleForm()

    
    return (
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                
                <Label customStyle={``} text='Select Time Column' ><InlineTip info="Select the column containing time"/></Label>
                <DropDown  defaultText={'Select column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.time_col = e
                    } 
                }/>
          
                <Label text="Set parameters: p"><InlineTip info="Support Itemsets: set threshold for support. Default:0.5"/></Label>
                <Input onInput={(e,v) => {
                    result.params_p = v 
                }} customStyle={`w-64`} attrs={{ list: 'min_support_apriori_list' }} />

                <Label customStyle={``} text='Set parameters: d' ><InlineTip info="Association Rule: set metric for association rules.  Default: confidence"/></Label>
                <DropDown  defaultText={'Select metric'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['lift', 'confidence', 'support']} 
                    onSelect={e => {
                        result.params_d = e
                    } 
                }/>
                 <Label text="Set parameters: q"><InlineTip info="Association Rules: set threshold for related metrics. Default:0.8"/></Label>
                <Input onInput={(e,v) => {
                    result.params_q = v 
                }} customStyle={`w-64`} attrs={{ list: 'min_threshold_metric_apriori_list' }} />

                <Label text="Set parameters: P"><InlineTip info="Support Itemsets: set threshold for support. Default:0.5"/></Label>
                <Input onInput={(e,v) => {
                    result.params_P = v 
                }} customStyle={`w-64`} attrs={{ list: 'min_support_apriori_list' }} />

                <Label customStyle={``} text='Set parameters: D' ><InlineTip info="Association Rule: set metric for association rules.  Default: confidence"/></Label>
                <DropDown  defaultText={'Select metric'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['lift', 'confidence', 'support']} 
                    onSelect={e => {
                        result.params_D = e
                    } 
                }/>
                 <Label text="Set parameters: Q"><InlineTip info="Association Rules: set threshold for related metrics. Default:0.8"/></Label>
                <Input onInput={(e,v) => {
                    result.params_Q = v 
                }} customStyle={`w-64`} attrs={{ list: 'min_threshold_metric_apriori_list' }} />

                {/* <Label text='Metrics of Model:'> <InlineTip info="Default: 5.Association Rules: list all items"/></Label>
                <DropDown defaultText={'Select metric'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false}  items={['1.Transaction Format Table', '2.Support Itemsets: list all items', '3.Support Itemsets: list specified items', '4.Support Itemsets: list the most popular items', '5.Association Rules: list all items', '6.Association Rules: list specified items'].map((item,i)=>{
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
                }}/> */}
               

            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                <Checkbox  label='Rolling Statistics' name='suboption_checked' item={['12','24','36']}/> <InlineTip info='Mean and Standard Deviation Rolling Months'/>
                <Checkbox  label='Decompose Period(month)' name='suboption_checked' item={['12','24','36']}/> <InlineTip info=''/>
                <Checkbox  label='Test Stationarity' name='suboption_checked' item={['First Difference','Second Difference','Seasonal First Difference','Seasonal Second Difference']}/> <InlineTip info='ADF Test Test Difference Metric'/>
                <Checkbox  label='Check ACF, PACF, Autocorrelation ' name='suboption_checked' item={['ACF','PACF','Autocorrelation']}/> <InlineTip info='ADF Test Test Difference Metric'/>

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