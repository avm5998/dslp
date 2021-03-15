import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown, Label, Input} from '../../util/ui'
import Table from '../common/table'
import Tip from '../common/tip'

const setSubOption = (option, model, subOption, condition) => {
    // console.log(condition);
    // if (option === 0) {
    //     subOption.current[option][condition.key] = condition.value
    // }

    // if (option === 1) {
    //     subOption.current[option].cols = condition
    // }
}

const ChangeOptions = ['No change', 'to lowercase', 'To UpperCase']

const Models = {
    'Select analytic method':[],
                    //0
    'Clustering':['K-Means']
}

const Analysis = () => {

    let [optionText, setOptionText] = useState('Select analytic method')
    let [modelText, setModelText] = useState('Select model')
    // let [showSubOptionModal, setShowSubOptionModal] = useState(true)
    // let [option, setOption] = useState(2)
    let [option, setOption] = useState(-1)
    let [model, setModel] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)
    let dispatch = useDispatch()
    let subOption = useRef({})

    //useSimpleForm(defaultValue)
    let {getData,result,input} = useSimpleForm({
        min_threshold:1
    })

    let [metrics_kmeans,setMetrics_Kmeans] = useState('Select metrics')
    let [showOptions_Kmeans, setShowOptions_Kmeans] = useState(false)
    let [showAdvancedOptions_Kmeans, setShowAdvancedOptions_Kmeans] = useState(false)

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showSubOptionModal} onClose={async ()=>{
            let data = getData()
            console.log(data)

            // let res = await fetchByJSON('/query', {
            //     data,
            //     cacheResult: true,
            //     filename: dataset.filename
            // })
    
            // let json = await res.json()
            // dispatch(DataSetActions.setData({
            //     data: JSON.parse(json.data),
            //     cols: json.cols,
            //     num_cols: json.num_cols,
            //     col_lists: json.col_lists,
            //     cate_cols: json.cate_cols,
            //     cate_lists: json.cate_lists,
            //     num_lists: json.num_lists
            // }))
            // console.log(getData())


            // setSubOption(option, model, subOption.current,data)
        }} setIsOpen={setShowSubOptionModal} contentStyleText="mx-auto mt-20">
            {/* <Tip info={{
                '#abc':'abc abc abc'
            }}/> */}

            <div className='p-5 flex flex-col'>
                {(option===0 && model === 0)?
                <div className='grid grid-cols-2 gap-4'>
                    <Checkbox label="Find the Best Hyper-Parameters: n_clusters" defaultChecked={false}/>
                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_Kmeans(e.target.checked)
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':''}`} text='Set parameters: n_clusters'/>
                    <Input onInput={e=>{
                        result.param_n_clusters = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':''}`} attrs={{list:'opt_k_kmeans_set_list'}} />

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: init'/>
                    <DropDown defaultText={'Select init'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  customUlStyle='w-64' items={['k-means++','random','centroids']}

                    onSelect={name=>{
                        result.param_init = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: algorithm'/>
                    <DropDown defaultText={'Select algorithm'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  items={['auto','full','elkan']}
                    onSelect={name=>{
                        result.algorithm = name
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: random_state'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  attrs={{list:'opt_k_random_state'}} 
                    onInput={e=>{
                        result.param_random_state = e.target.value
                    }}/>

                    <Label text='Metrics of Model'/>
                    <DropDown defaultText={'Select metrics of model'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_kmeans} items={['PCA Plot (* Do PCA first)','Pair Plot  (* Do scale first)','Scatter Plot','Inertia'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_Kmeans(item)
                            if(i===2){
                                setShowOptions_Kmeans(1)
                            }else{
                                setShowOptions_Kmeans(0)
                            }
                        }

                        return {
                            name:item,onClick
                        }
                    })}/>

                    <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Plot X'/>
                    <DropDown defaultText={'Select Plot X'} showOnHover={false} customStyle={`${showOptions_Kmeans?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />
                    <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Plot Y'/>
                    <DropDown defaultText={'Select Plot Y'} showOnHover={false} customStyle={`${showOptions_Kmeans?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />

                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="opt_k_kmeans_set_list"><option value="8"></option><option value="7"></option><option value="6"></option></datalist>
                    <datalist id="opt_k_random_state"><option value="1"></option><option value="2"></option><option value="3"></option></datalist>
                </div>
                :''}
            </div>
        </Modal>



        <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">
            <div className='mx-5 my-10 w-12/12 w-full flex justify-start'>
                <div className='w-72'>
                    <DropDown text={optionText} customStyle='h-10 w-72' customUlStyle={'w-72'} items={
                        ['Clustering'].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                           1                            2                               3                 4    */ }
                                setOption(i)
                                setOptionText(item)
                            }
                        }))} />
                </div>
                <div className='w-72 mx-5'>
                    <DropDown text={modelText} customStyle='h-10 w-72' customUlStyle={'w-72'} items={
                        Models[optionText].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                           1                            2                               3                 4    */ }
                                setModel(i)
                                setModelText(item)
                                setShowSubOptionModal(true)
                            }
                        }))} />
                </div>
                <Button text={'Option'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                    if(model>-1){
                        setShowSubOptionModal(true)
                    }
                }}/>

                <Button text={'Predict'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                }}/>
            </div>
        </div>
        <Table PageSize={10}/>
    </div>)
}

export default Analysis