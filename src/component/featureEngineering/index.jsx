import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useCachedData,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'
import Tip from '../common/tip'

const Options = ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Standard Scaler', 'Minmax Scaler'];
const getCanOperation = (dataset, operationIndex)=>{
    switch(operationIndex){
        case 0:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case 1:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case 2:
            return [!!dataset.num_cols.length,'No numerical column to convert']
        case 3:
            return [!!dataset.num_cols.length,'No numerical column to convert']
        case 4:
            return [!!dataset.num_cols.length,'No numerical column to convert']
    }

    return [false,'']
}

const FeatureEngineering = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select operation')
    let [canOperation, setCanOperation] = useState(false)
    let [option, setOption] = useState(-1)
    let [errorMsg, setErrorMsg] = useState('')
    let [showOptionModal, setShowOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)
    let dispatch = useDispatch()

    let {result,checkbox : checkbox2,input : input2,getData,clearData} = useSimpleForm()
    // let {result,getData,clearData} = useSimpleForm()

    useEffect(()=>{
        clearData()
        result.activeOption = option
    },[option])

    console.log(result);
    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showOptionModal} onClose={()=>{
        }} setIsOpen={setShowOptionModal} contentStyleText="mx-auto mt-20">
            <div className='p-5 flex flex-col'>
                {option === 0 ?
                    <div className="flex flex-col">
                        {dataset.cate_cols.map(name =>
                            <div className='flex flex-row w-full items-center' key={name}>
                                <div className='px-10 py-2 w-1/3 label-left'>{name + ':'}</div>
                                <DropDown onSelect={e=>{
                                    result.type = e
                                }} defaultText={`Select convert type`} showOnHover={false} customStyle="w-60 mr-0" customUlStyle="w-60 mr-0" items={['No change', 'to lowercase', 'To UpperCase']} />
                            </div>
                        )}
                    </div>
                    : ''}

                {option === 1 ? <div>
                    <MultiSelect defaultText={`Select columns to convert`} defaultOpen={false} selections={dataset.cate_cols} customHeight='h-32' onSelect={e=>result.cols = e} />
                </div> : ''}

                {option ==  2 ? <div className='grid grid-cols-3'>
                    {dataset.num_cols.map((col,i)=><React.Fragment key={i}>
                        <Checkbox {...checkbox2} label={col} name='suboption_checked' item={col}/>
                        <input {...input2} className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Bins' name={col+'_Bins'}/>
                        <input {...input2} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Labels' name={col+'_Labels'}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 3 ? <div>
                    <MultiSelect defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e=>result.cols = e} />
                </div> : ''}

                
                {option === 4 ? <div>
                    <MultiSelect defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e=>result.cols = e} />
                </div> : ''}

                <div className="flex justify-end m-3 mt-10">
                    <Button text='Confirm' customStyle='h-6 w-24 py-1' onClick={()=>{
                        setShowOptionModal(false)
                    }}/>
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-20 w-full items-center justify-start bg-gray-100 shadow-md">
            <div className='mx-5 w-8/12 flex justify-start'>
                <div className='w-72'>
                    <DropDown text={optionText} customStyle={'h-8 py-1 w-72'} customUlStyle={'w-72'} items={
                        Options.map((item, i) => ({
                            name: item, onClick(e) {
                                let [canop,errorMsg] = getCanOperation(dataset, i)
                                setErrorMsg(errorMsg)
                                setCanOperation(canop)
                                setOption(i)
                                setOptionText(item)

                                if(canop)
                                    setShowOptionModal(true)
                            }
                        }))} />
                </div>
                <Button text={'Options'} disabled={!canOperation} customStyle={'h-6 w-48 ml-10 py-1'} onClick={()=>{
                    if(option>-1){
                        setShowOptionModal(true)
                    }
                }}/>

                <Button text={'Confirm'} customStyle={'h-6 w-48 ml-10 py-1'} onClick={()=>{
                    if(!canOperation){
                        alert(errorMsg)
                    }else{
                        let res = await fetchByJSON('feature_engineering',getData())
                        let json = await res.json()
                        
                    }
                }}/>
            </div>
            <div className='mx-5 w-3/12'>
                <MultiSelect defaultText={'Selected operations'} customHeight={'h-8'} selections={dataset.dataEngineering} passiveMode={true} />
            </div>
        </div>
        <Table PageSize={10}/>
    </div>)
}

export default FeatureEngineering