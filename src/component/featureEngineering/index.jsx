import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useCachedData,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Label, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'
// import Tip from '../common/tip'
import { InlineTip } from '../common/tip'


const Options = ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Standard Scaler', 'Minmax Scaler', 'Text Data: Feature Extraction Models']; //, 'Add New Features'
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

    let {result,checkbox : checkbox2, input : input2,getData,clearData} = useSimpleForm()
    // let {result,getData,clearData} = useSimpleForm()

    useEffect(()=>{
        clearData()
        result.activeOption = option
        result.cols = {}
        // if(option == 0){
        //     result.cols = {}
        // }
    },[option])

    console.log(result);

    let ts = new Date().getTime()

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showOptionModal} onClose={()=>{
        }} setIsOpen={setShowOptionModal} contentStyleText="mx-auto mt-20">
            <div className='p-5 flex flex-col'>
                {option === 0 ?
                    <div className="flex flex-col">
                        {dataset.cate_cols.map(name =>
                            <div className='flex flex-row w-full items-center' key={name+ts}>
                                <div className='px-10 py-2 w-1/3 label-left'>{name + ':'}</div>
                                <DropDown onSelect={e=>{
                                    result.cols[name] = e
                                }} defaultText={`Select convert type`} showOnHover={false} customStyle="w-60 mr-0" customUlStyle="w-60 mr-0" items={['no change', 'to lowercase', 'to uppercase']} />
                            </div>
                        )}
                    </div>
                    : ''}

                {option === 1 ? <div>
                    <MultiSelect defaultText={`Select columns to convert`} defaultOpen={false} selections={dataset.cate_cols}  customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" onSelect={e=>result.cols = e} />
                </div> : ''}

                {option ==  2 ? 
                <div className='grid grid-cols-3'>
                    {dataset.num_cols.map((col,i)=><React.Fragment key={i}>
                        <Checkbox {...checkbox2} label={col} name='suboption_checked' item={col}/>
                        <input {...input2} className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Bins: int list' name={col+'_Bins'}/>
                        <input {...input2} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Labels: string list' name={col+'_Labels'}/>
                    </React.Fragment>)}
                    <Label text=''></Label>
                    <Label customStyle={`w-100 mr-0`} customUlStyle="w-100 mr-0" text="eg. column 'Age', Bins=[0,2,17,65,99], Labels=[Toddler, Child, Adult, Elderly]"/>
                    <Label customStyle={`w-100 mr-0`} customUlStyle="w-100 mr-0" text="eg. column 'Survived', Bins=[0,1,2], Labels=[Yes, No]"/>

                </div> : ''}

                {option === 3 ? <div>
                    <MultiSelect customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e=>result.cols = e} />
                </div> : ''}

                
                {option === 4 ? <div>
                    <MultiSelect customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e=>result.cols = e} />
                </div> : ''}

                {option === 5 ?
                    <div className="flex flex-col">
                        <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['CountVectorizer', 'TfidfVectorizer']} 
                    onSelect={e => {
                        result.text_data_feat_model = e
                    } 
                }/>

                        {/* {dataset.cate_cols.map(name =>
                            <div className='flex flex-row w-full items-center' key={name}>
                                <div className='px-10 py-2 w-1/3 label-left'>{name + ':'}</div>
                                <DropDown onSelect={e=>{
                                    result.cols.push([name,e])
                                }} defaultText={`Select Model`} showOnHover={false} customStyle="w-60 mr-0" customUlStyle="w-60 mr-0" items={['No change', 'to lowercase', 'To UpperCase']} />
                            </div>
                        )} */}
                    </div>
                    : ''}

                <div className="flex justify-end m-3 mt-10">
                    <Button text='Confirm' customStyle='h-6 w-24 py-1' onClick={async ()=>{
                        // console.log(typeof setShowOptionModal)
                        setShowOptionModal(false)
                        if(!canOperation){
                            alert(errorMsg)
                        }else{
                            let data = getData()
                            let colarr = []
                            for(let k in data.cols){
                                colarr.push([k,data.cols[k]])
                            }
                            data.cols = colarr
                            console.log(data);
                            let res = await fetchByJSON('featureEngineering',{...data, filename:dataset.filename}) //send request
                            let json = await res.json()
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
                        result.cols = {}
                        setShowOptionModal(true)
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