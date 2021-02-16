import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'

const setSubOption = (option, subOption, condition) => {
    console.log(condition);
    if (option === 0) {
        subOption.current[option][condition.key] = condition.value
    }

    if (option === 1) {
        subOption.current[option].cols = condition
    }
}

const ChangeOptions = ['No change', 'to lowercase', 'To UpperCase']

const FeatureEngineering = () => {

    let [optionText, setOptionText] = useState('Select operation')
    let [subOptionText, setSubOptionText] = useState('Options')
    // let [showSubOptionModal, setShowSubOptionModal] = useState(true)
    // let [option, setOption] = useState(2)
    let [option, setOption] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)

    const getDefaultSubOptions = useCallback(() => {
        const res = [...Array(5).keys()].map(e => ({}))
        res[1].cols = []
        return res
    }, [])

    let dispatch = useDispatch()
    let subOption = useRef(getDefaultSubOptions())

    let currentOption = subOption.current[option]
    let {checkbox : checkbox2,input : input2,getData: getData2} = useSimpleForm()

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showSubOptionModal} onClose={()=>{
            if (option === 2){
                setSubOption(option, subOption, getData2())
            }


        }} setIsOpen={setShowSubOptionModal} contentStyleText="mx-auto mt-20">
            <div className='p-5 flex flex-col'>

                {option === 0 ?
                    <div className="flex flex-col">
                        {dataset.cate_cols.map(name =>
                            <div className='flex flex-row w-full' key={name}>
                                <div className='px-10 w-1/3 label-left'>{name + ':'}</div>
                                <DropDown customStyle="w-60 mr-0" customUlStyle="w-60 mr-0" text={ChangeOptions[currentOption[name] || 0]} items={ChangeOptions.map((operation, i) => ({
                                    name: operation, onClick(e) {
                                        setSubOption(option, subOption, { key: name, value: operation })
                                    }
                                }))} />
                            </div>
                        )}
                    </div>
                    : ''}

                {option === 1 ? <div>
                    <MultiSelect selections={dataset.cate_cols} customHeight='h-32' onSelect={(e) => {
                        setSubOption(option, subOption, e)
                    }} />
                </div> : ''}

                {option === 2 ? <div className='grid grid-cols-3'>
                    {dataset.num_cols.map((col,i)=><React.Fragment key={i}>
                        <Checkbox {...checkbox2} label={col} name='suboption_checked' item={col}/>
                        <input {...input2} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Bins' name={col+'_Bins'}/>
                        <input {...input2} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Labels' name={col+'_Labels'}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 3 ? <div>
                    <MultiSelect selections={dataset.num_cols} onSelect={(e) => {
                        setSubOption(option, subOption, e)
                    }} />
                </div> : ''}

                
                {option === 4 ? <div>
                    <MultiSelect selections={dataset.num_cols} onSelect={(e) => {
                        setSubOption(option, subOption, e)
                    }} />
                </div> : ''}

                <div className="flex justify-end m-3 mt-10">
                    <Button text='Confirm' customStyle='border-light' />
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">
            <div className='mx-5 my-10 w-8/12 flex justify-start'>
                <div className='w-96'>
                    <DropDown text={optionText} customStyle='h-10 w-96' customUlStyle={'w-96'} items={
                        ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Standard Scaler', 'Minmax Scaler'].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                           1                            2                               3                 4    */ }
                                setOption(i)
                                setOptionText(item)
                                setShowSubOptionModal(true)
                            }
                        }))} />
                </div>
                <Button text={subOptionText} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                    if(option>-1){
                        setShowSubOptionModal(true)
                    }
                }}/>

                <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                }}/>
            </div>
            <div className='mx-5 my-10 w-3/12'>
                <MultiSelect selections={dataset.dataEngineering} passiveMode={true} />
            </div>
        </div>
        <Table PageSize={10}/>
    </div>)
}

export default FeatureEngineering