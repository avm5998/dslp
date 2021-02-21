import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
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
    let {getData,result,input} = useSimpleForm({
        min_threshold:1
    })

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
            <Tip info={{
                '#abc':'abc abc abc'
            }}/>

            <div className='p-5 flex flex-col'>
                {(option===0 && model === 0)?
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center'>Choose Transaction ID Column</div>
                    <DropDown defaultText={'Transaction ID Column'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={dataset.cols} onSelect={e=>result.transactionid = e}/>
                    <div className='flex items-center'>Min threshold</div>
                    <input id="abc" {...input} name="min_threshold" placeholder='min threshold' className='px-5 py-2 focus:outline-none rounded-full w-96'/>

                </div>
                :''}



            </div>
        </Modal>



        <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">
            <div className='mx-5 my-10 w-12/12 flex justify-start'>
                <div className='w-96'>
                    <DropDown text={optionText} customStyle='h-10 w-96' customUlStyle={'w-96'} items={
                        ['Associate Rule'].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                           1                            2                               3                 4    */ }
                                setOption(i)
                                setOptionText(item)
                            }
                        }))} />
                </div>
                <div className='w-96 px-5'>
                    <DropDown text={modelText} customStyle='h-10 w-96' customUlStyle={'w-96'} items={
                        ['Model1','Model2'].map((item, i) => ({
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