import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Label, Button, Modal, Checkbox } from '../../../../util/ui'
import { Input, DropDown, MultiSelect } from '../../../../util/ui_components'
import { InlineTip } from '../../../common/tip'
import { fetch, fetchByJSON, useCachedData, useSimpleForm } from '../../../../util/util'

const Options = ['      --', 'Plot Moving Average (Mean, Standard Deviation)', 'Decompose Dataset', 'Remove Seasonality and Test Stationarity','Check Correlation']; 

const DataLists = {
    order_p_list: [0,1,2],
    order_d_list: [0,1,2],
    order_q_list: [0,1,2],
    seasonal_order_P_list: [0,1,2],
    seasonal_order_D_list: [0,1,2],
    seasonal_order_Q_list: [0,1,2],
    seasonal_order_m_list: [0,1,2],
    predict_period_list: [12,24,36],
    corr_lags_list: [10,20,30,40,50]
}


export default function ({ dataset, result, submit, visibleTabs }) {
    let [activeTab, setActiveTab] = useState(0)
    let option = useSelector(state=>state.option).analysis.time_series_analysis['Seasonal ARIMA'] || {}
    useEffect(()=>{
        setActiveTab(visibleTabs[0])
    },[visibleTabs])

    let [optionText, setOptionText] = useState('Select operation')
    // let [canOperation, setCanOperation] = useState(false)
    let [subOption, setSubOption] = useState(-1)
    let [showOptionModal, setShowOptionModal] = useState(false)
    // let [errorMsg, setErrorMsg] = useState('')
    let {input:input2, getData} = useSimpleForm()

    useEffect(()=>{
        result.activeOption = subOption
    },[subOption])


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
                
                <Label customStyle={``} text='Select Date Column:' ><InlineTip info="Select the column containing date"/></Label>
                <DropDown zIndex={30} defaultValue={option.finalX} defaultText={'select one column'}  width='w-64' items={dataset.cols} 
                    onSelect={e => {
                        result.finalX = e
                    } 
                }/>

                <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the column to be analyzed"/></Label>
                <DropDown zIndex={29} defaultValue={option.finalY} defaultText={'select one column'}  width='w-64' items={dataset.cols} 
                    onSelect={e => {
                        result.finalY = e
                    } 
                }/>


                <Label text="Set parameters: p"><InlineTip info="Trend autoregression order. Default: 1"/></Label>
                <Input onInput={(e,v) => {
                    result.params_order_p = v 
                }} customStyle={`w-64`} attrs={{ list: 'order_p_list' }} />

                <Label customStyle={``} text='Set parameters: d' ><InlineTip info="Trend difference order.  Default: 0"/></Label>
                <Input onInput={(e,v) => {
                    result.params_order_d = v 
                }} customStyle={`w-64`} attrs={{ list: 'order_d_list' }} />

                 <Label text="Set parameters: q"><InlineTip info="Trend moving average order. Default:0"/></Label>
                <Input onInput={(e,v) => {
                    result.params_order_q = v 
                }} customStyle={`w-64`} attrs={{ list: 'order_q_list' }} />

                <Label text="Set parameters: P"><InlineTip info="Seasonal autoregressive order. Default:0"/></Label>
                <Input onInput={(e,v) => {
                    result.params_seasonal_order_P = v 
                }} customStyle={`w-64`} attrs={{ list: 'seasonal_order_P_list' }} />

                <Label customStyle={``} text='Set parameters: D' ><InlineTip info="Seasonal difference order. Default: 0"/></Label>
                <Input onInput={(e,v) => {
                    result.params_seasonal_order_D = v 
                }} customStyle={`w-64`} attrs={{ list: 'seasonal_order_D_list' }} />

                <Label text="Set parameters: Q"><InlineTip info="Seasonal moving average order. Default: 0"/></Label>
                <Input onInput={(e,v) => {
                    result.params_seasonal_order_Q = v 
                }} customStyle={`w-64`} attrs={{ list: 'seasonal_order_Q_list' }} />

                <Label text="Set parameters: m"><InlineTip info="The number of time steps for a single seasonal period. Default: 0"/></Label>
                <Input onInput={(e,v) => {
                    result.params_seasonal_order_m = v 
                }} customStyle={`w-64`} attrs={{ list: 'seasonal_order_m_list' }} />

                <Label text='Metrics of Model:'><InlineTip info="Assess model performance: suggesting the errors are Gaussian, the close to 0, the better."/></Label>
                <DropDown zIndex={28} defaultValue={option.metric} defaultText={'select metric'}  width='w-64' items={['check residual']} 
                    onSelect={e => {
                        result.metric = e
                    } 
                }/>

            </div>

            <div className={`grid gap-4 p-8 w-auto ${activeTab == 1 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                
                <Modal isOpen={showOptionModal} onClose={()=>{
                    }} setIsOpen={setShowOptionModal} contentStyleText="mx-auto mt-20">
                    <div className='p-8 flex flex-col'>
                        {subOption === 0 ?
                            <div className="flex flex-col" >
                                <br></br>
                            <Label customStyle={``} text="Set this option to '--' to check model in the 'Options' page"></Label>
                            
                        </div>: ''}
                            
                        {subOption === 1 ?
                            <div className="flex flex-col">
                                 <br></br>
                            <Label customStyle={``} text='Mean and Standard Deviation (months):'><InlineTip info=""/></Label>
                            <DropDown defaultText={'Select time period'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['12', '24', '36', '48']} 
                            onSelect={e => {
                                result.moving_avg_period = e
                            }} />
                        </div>: ''}

                        {subOption === 2 ?
                            <div className="flex flex-col">  <br></br>
                            <Label customStyle={``} text='Decompose Dataset (months):'><InlineTip info="Default: 12"/></Label>
                            <DropDown defaultText={'Select time period'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['12', '24', '36', '48']} 
                            onSelect={e => {
                                result.decompose_period = e
                            }} />
                        </div>: ''}

                        {subOption === 3 ?
                            <div className="flex flex-col"><br></br>
                            <Label customStyle={``} text='Remove Seasonality and Test Stationarity:'><InlineTip info="We can make the dataset stationary by using difference, and apply ADF to test statinarity. Default: Original Data with No Difference"/></Label>
                            <DropDown defaultText={'Select option'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Original Data', 'First Difference', 'Second Difference', 'Seasonal First Difference']}  //, 'Seasonal Second Difference'
                            onSelect={e => {
                                result.test_stationarity_option = e
                            }} />
                        </div>: ''}

                        {subOption === 4 ?
                            <div className="flex flex-col"><br></br>
                            <Label customStyle={``} text='Check Correlation:'><InlineTip info="Select one option to check its correlation."/></Label>
                            <Input defaultValue={option.corr_lags}  placeholder='Number of Lags. Default:50' onInput={(e,v) => {
                                result.corr_lags = v 
                            }} width={`w-64`} attrs={{ list: 'corr_lags_list' }} />
                            <DropDown defaultText={'Select option'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Original Dataset', 'First Difference', 'Second Difference', 'Seasonal First Difference']} 
                            onSelect={e => {
                                result.check_correlation_option = e
                            }} />
                            <DropDown defaultText={'Select operation'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['acf', 'pacf', 'auto']} 
                            onSelect={e => {
                                result.corr_operation = e
                            }} ></DropDown>
                        </div>: ''}

                        

                        <div className="flex justify-end m-3 mt-10">
                            <Button text='Confirm' customStyle='h-6 w-24 py-1' onClick={async ()=>{
                                setShowOptionModal(false)
                                    let data = getData()
                                    let colarr = []
                                    for(let k in data.cols){
                                        colarr.push([k,data.cols[k]])
                                    data.cols = colarr
                                    console.log(data);
                                    let res = await fetchByJSON('analysis/time_series_analysis',{...data, filename:dataset.filename}) //send request
                                    let json = await res.json()
                                    $('#display_results').html(json.para_result)
                                    document.getElementById("img").src = "data:image/png;charset=utf-8;base64,"+json.plot_url
                
                                    dispatch(DataSetActions.setData({
                                        cols: json.cols,
                                        num_cols: json.num_cols,
                                        cate_cols: json.cate_cols,
                                    }))
                                    dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
                                }
                            }}/>
                        </div>
                    
                    </div>
                </Modal>

                
                <div className='mx-5 w-72 flex justify-start'>
                    <div className='w-72'>
                        <DropDown  text={optionText} customStyle={'h-8 py-1 w-72'} customUlStyle={'w-72'} items={
                            Options.map((item, i) => ({
                                name: item, onClick(e) {
                                    // setCanOperation(true)
                                    setSubOption(i)
                                    setOptionText(item)
                                    setShowOptionModal(true)
                                }
                            }))} />
                    </div>
                </div>
       
            </div>

            <div className={`grid gap-4 p-8 w-auto ${activeTab == 2 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
                }}>
                 <Label text="Future Time Period(months)"><InlineTip info="Input the time period to be predicted. Set this option to 0 to check model in the 'Options' page."/></Label>
                <Input placeholder='12' onInput={(e,v) => {
                    result.predict_period = v 
                }} customStyle={`w-64`} attrs={{ list: 'predict_period_list' }} />
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





