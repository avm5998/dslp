import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown, Label, Input} from '../../util/ui'
import Table from '../common/table'
import Tip from '../common/tip'
import LinearRegressionOptions from './option/regression/linearRegession'
import LogisticRegressionOptions from './option/classification/logisticRegression'

const OptionModels = {
    Regression:{'Linear Regression':LinearRegressionOptions, }, //DecisionTreeOptions, RandomForestsOptions, SuportVectorMachineOptions
    Classification:{'Logistic Regression':LogisticRegressionOptions}
}

// const Models = {
//     'Select analytic method':[],
//     'Regression':['Linear Regression', 'Decision Tree Regression', 'Random Forests Regression', 'Support Vector Machine Regressor'], //0
//     'Classification': ['Logistic Regression', 'Decision Tree Classifier', 'Random Forests Classifier', 'Naive Bayes Classifier'],//1
//     'Clustering':['K-Means', 'Agglometrative'],//2
//     'Associate Rule': ['Apriori']//3
// }
const Analysis = () => {
    let [optionText, setOptionText] = useState('Select analytic method')
    let [modelText, setModelText] = useState('Select model')
    let [option, setOption] = useState(-1)
    let [model, setModel] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)
    let dispatch = useDispatch()

    let {getData,result,input} = useSimpleForm({
        default_key:'default_value'
    })

    useEffect(()=>{
        result.analysis_option = option
        result.analysis_model = model
    },[option,model])

    let submit = useCallback(async ()=>{
        let res = await fetchByJSON("analysis",result)
        let json = await res.json()
        console.log(json)
    },[result])

    let OptionView = OptionModels.hasOwnProperty(option) && OptionModels[option].hasOwnProperty(model)?OptionModels[option][model]:e=><div></div>

    return (<div className='flex flex-col bg-gray-100' style={{ height: 'calc(100% - 4rem)' }}>
        <Modal fixedModalPosition={{
            left:'20vw',
            top:'10vh',
            width:'60vw'
        }} zIndex={11} isOpen={showSubOptionModal} onClose={()=>{
            // let data = getData()
            // console.log(data)
            }} setIsOpen={setShowSubOptionModal}>
            <OptionView dataset={dataset} result={result} submit={submit}/>
        </Modal>


        <div className="flex flex-row h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
            <div className='mx-5 w-12/12 w-full flex justify-start'>
                <div className='w-72'>
                    <DropDown text={optionText} customStyle='h-10 w-72' customUlStyle={'w-72 h-10'} items={
                        Object.keys(OptionModels).map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                           1                            2                               3                 4    */ }
                                setOption(item)
                                setOptionText(item)
                            }
                        }))} />
                </div>
                <div className='w-72 mx-5'>
                    <DropDown defaultText='Select analytic method' customStyle='h-10 w-72' customUlStyle={'w-72 h-10'} items={
                        (OptionModels.hasOwnProperty(option)?Object.keys(OptionModels[option]):[]).map((item, i) => ({
                            name: item, onClick(e) {
                                setModel(item)
                                setModelText(item)
                                setShowSubOptionModal(true)
                            }
                        }))} />
                </div>
                <Button text={'Option'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                    if(model){
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

