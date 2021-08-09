// import React, { useCallback, useEffect, useState, useRef } from 'react'
// import { useSelector } from 'react-redux'
// import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
// import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
// import { InlineTip } from '../../../common/tip'
// const DataLists = {
//     // min_support_apriori_list:[0.1, 0.2, 0.3, 0.4, 0.5],
//     // min_threshold_metric_apriori_list: [1, 1.1, 1.2, 1.3, 1.4, 1.5],
//     // max_len_apriori_list: [10, 15, 20, 25, 30]
// }

// export default function ({ dataset, result, submit, visibleTabs }) {
//     let [activeTab, setActiveTab] = useState(0)
//     let option = useSelector(state=>state.option).analysis.time_series_analysis['SARIMA'] || {}
//     useEffect(()=>{
//         setActiveTab(visibleTabs[0])
//     },[visibleTabs])

//     return (
//         <div className='p-4'>
//             <div className='flex justify-start text-gray-500'>
//                 <div className={`${visibleTabs.indexOf(0)==-1?'hidden':''} ${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
//                 <div className={`${visibleTabs.indexOf(1)==-1?'hidden':''} ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
//                 <div className={`${visibleTabs.indexOf(2)==-1?'hidden':''} ml-4 ${activeTab == 2 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(2)}>Predict Options</div>
//             </div>
//             <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
//                 gridTemplateColumns: '10vw 1fr 10vw 1fr'
//                 }}>
                
//                 <Label customStyle={``} text='Select Date Column:' ><InlineTip info="Select the column containing date"/></Label>
//                 <DropDown zIndex={29} defaultValue={option.finalX} defaultText={'select one column'}  width='w-64' items={dataset.cols} 
//                     onSelect={e => {
//                         result.finalX = e
//                     } 
//                 }/>

//                 <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the column to be analyzed"/></Label>
//                 <DropDown zIndex={29} defaultValue={option.finalY} defaultText={'select one column'}  width='w-64' items={dataset.cols} 
//                     onSelect={e => {
//                         result.finalY = e
//                     } 
//                 }/>


//                 <Label text="Set parameters: p"><InlineTip info="Support Itemsets: set threshold for support. Default:0.5"/></Label>
//                 <Input onInput={(e,v) => {
//                     result.params_p = v 
//                 }} customStyle={`w-64`} attrs={{ list: 'min_support_apriori_list' }} />

//                 <Label customStyle={``} text='Set parameters: d' ><InlineTip info="Association Rule: set metric for association rules.  Default: confidence"/></Label>
//                 <DropDown  defaultText={'Select metric'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['lift', 'confidence', 'support']} 
//                     onSelect={e => {
//                         result.params_d = e
//                     } 
//                 }/>
//                  <Label text="Set parameters: q"><InlineTip info="Association Rules: set threshold for related metrics. Default:0.8"/></Label>
//                 <Input onInput={(e,v) => {
//                     result.params_q = v 
//                 }} customStyle={`w-64`} attrs={{ list: 'min_threshold_metric_apriori_list' }} />

//                 <Label text="Set parameters: P"><InlineTip info="Support Itemsets: set threshold for support. Default:0.5"/></Label>
//                 <Input onInput={(e,v) => {
//                     result.params_P = v 
//                 }} customStyle={`w-64`} attrs={{ list: 'min_support_apriori_list' }} />

//                 <Label customStyle={``} text='Set parameters: D' ><InlineTip info="Association Rule: set metric for association rules.  Default: confidence"/></Label>
//                 <DropDown  defaultText={'Select metric'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['lift', 'confidence', 'support']} 
//                     onSelect={e => {
//                         result.params_D = e
//                     } 
//                 }/>

//                 <Label text="Set parameters: Q"><InlineTip info="Association Rules: set threshold for related metrics. Default:0.8"/></Label>
//                 <Input onInput={(e,v) => {
//                     result.params_Q = v 
//                 }} customStyle={`w-64`} attrs={{ list: 'min_threshold_metric_apriori_list' }} />



//                 {/* <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
//                 <Input defaultValue={option.test_size}  placeholder='30' onInput={(e,v) => {
//                     result.test_size = v 
//                 }} width={`w-64`} attrs={{ list: 'test_size_lr_list' }} />

//                 <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset."/></Label>
//                 <DropDown defaultValue={option.pre_obs_plotType} defaultText={'line'}  width='w-64' items={['bar', 'scatter', 'line', 'heatmap']} 
//                     onSelect={e => {
//                         result.pre_obs_plotType = e
//                     } 
//                 }/>

//                 <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
//                 <DropDown defaultValue={option.metric} defaultText={'neg_mean_squared_error'} width='w-64'  items={['explained_variance', 'neg_mean_absolute_error', 'neg_mean_squared_error', 'r2', 'neg_mean_poisson_deviance', 'neg_mean_gamma_deviance']}
//                     onSelect={name => {
//                         result.metric = name
//                     }
//                 } /> */}

//             </div>
//             <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
//                 gridTemplateColumns: '10vw 1fr 10vw 1fr'
//                 }}>
//                 <Label customStyle={``} text='Set Parameters: fit_intercept'><InlineTip info="Default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations. Details see https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"/></Label>
//                 <DropDown zIndex={28} defaultValue={option.param_fit_intercept_lr} defaultText={'True'}  width='w-64' items={['True', 'False']}
//                     onSelect={name => {
//                         result.param_fit_intercept_lr = name
//                 }} />
//                 <Label customStyle={``} text='Set Parameters: normalize'><InlineTip info="Default=False. If True, the regressors X will be normalized before regression. Details see https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"/></Label>
//                 <DropDown zIndex={27} defaultValue={option.param_normalize_lr} defaultText={'False'}  width='w-64' items={['True', 'False']}
//                     onSelect={name => {
//                         result.param_normalize_lr = name  
//                 }} />
//             </div>
//             <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
//                 gridTemplateColumns: '10vw 1fr 10vw 1fr'
//                 }}>
//                 {(result.finalVar || []).map((col,i)=><React.Fragment key={i}>
//                     <Label>{col}</Label>
//                         <Input onInput={(e,v) => {
//                             result['Linear Regression'+ col] = v 
//                 }}className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Input value'/> 
//                 </React.Fragment>)}
//                 <Label text='Note:'/>
//                 <Label text="The Target Column: ">{result.finalY}</Label>
//             </div>
//             <div className='flex justify-end'>
//                 <Button onClick={e => {
//                     submit()
//                 }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
//             </div>
//             <>
//                 {Object.keys(DataLists).map(key => <datalist key={key} id={key}>
//                     {DataLists[key].map(value => <option key={key + value} value={value}></option>)}
//                 </datalist>)}
//             </>
//         </div>)
// }





