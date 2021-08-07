import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useCachedData,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Label, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'

const Options = [
    {name:'Convert to',value:''},
    {name:'String',value:'string'},
    {name:'Integer',value:'int64'},
    {name:'Float',value:'float64'},
    {name:'Datetime',value:'datetime'},
    {name:'Bool',value:'bool'},
    {name:'Category',value:'category'},
]

const NumericalOptions = [
    {name:'Convert to',value:''},
    {name:'Integer',value:'int64'},
    {name:'Float',value:'float64'},
    {name:'Datetime',value:'datetime'},
]

const CategoricalOptions = [
    {name:'Convert to',value:''},
    {name:'String',value:'string'},
    {name:'Category',value:'category'},
]

const setSubOption = (option, subOption, condition) => {
    console.log(condition);
    if (option === 1) {
        subOption.current[option] = condition
    }

    if (option === 2) {
        subOption.current[option] = condition
    }
}

const Preprocessing = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select operation')
    let [subOptionText, setSubOptionText] = useState('Options')
    let [option, setOption] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)

    const getDefaultSubOptions = useCallback(() => {
        const res = [...Array(5).keys()].map(e => ({}))
        res[1].cols = []
        return res
    }, [])

    const onConfirm = async (e) => {
        let requestData = {}
        if(option!==0)
            eval(`requestData = getData${option}()`)
        console.log(requestData)
        let res = await fetchByJSON('preprocessing', {...requestData,option, filename:dataset.filename})
        let json = await res.json()
        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
        $('#display_cond').text(json.cond)
        $('#display_para_result').html(json.para_result)
    }

    let dispatch = useDispatch()
    let subOption = useRef(getDefaultSubOptions())

    let currentOption = subOption.current[option]
    let {select : select1,getData: getData1} = useSimpleForm()
    let {select : select2,getData: getData2,result:result2} = useSimpleForm()
    // let {select : select3,getData: getData3} = useSimpleForm()
    let {input : input3,getData: getData3} = useSimpleForm()
    let {input : input4,getData: getData4} = useSimpleForm()
    let {input : input5,getData: getData5} = useSimpleForm()


    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showSubOptionModal} onClose={()=>{
            if (option === 1){
                setSubOption(option, subOption, getData1())
            }
            if (option === 2){
                setSubOption(option, subOption, getData2())
            }
            if (option === 3){
                setSubOption(option, subOption, getData3())
            }

            if (option === 4){
                setSubOption(option, subOption, getData4())
            }
            if (option === 5){
                setSubOption(option, subOption, getData5())
            }
            // if (option === 6){
            //     setSubOption(option, subOption, getData5())
            // }

        }} setIsOpen={setShowSubOptionModal} contentStyleText="mx-auto mt-20">
            <div className='p-5 flex flex-col'>
                {option === 1 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <div className='m-3 flex items-center'>{col}</div>
                        <select {...select1} className='text-gray-500 m-3 px-5 py-2 focus:outline-none rounded-full' name={col}>
                            {(dataset.cate_cols.indexOf(col)!=-1?CategoricalOptions:dataset.num_cols.indexOf(col)!=-1?NumericalOptions:Options).map(o=><option key={o.value} value={o.value}>{o.name}</option>)}
                        </select>
                    </React.Fragment>)}
                </div> : ''}

                {option === 2 ? <div className='grid grid-cols-1'>
                    <MultiSelect selections={dataset.cols} onSelect={(e) => {
                        result2.cols = e
                    }} />
                </div> : ''}

                
                {option === 3 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input3} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Useless character' name={col}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 4 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input4} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Specific value' name={col}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 5 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input5} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Specific words' name={col}/>
                    </React.Fragment>)}
                </div> : ''}

                {/* {option === 5 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <div className='m-3 flex items-center'>{col}</div>
                        <select {...select2} className='text-gray-500 m-3 px-5 py-2 focus:outline-none rounded-full' name={col+'_CheckNewFeat'}>
                            {TextDataCheckFeatOptions.map(o=><option key={o.value} value={o.value}>{o.name}</option>)}
                        </select>
                    </React.Fragment>)}
                </div> : ''}

                {option === 6 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <div className='m-3 flex items-center'>{col}</div>
                        <select {...select3} className='text-gray-500 m-3 px-5 py-2 focus:outline-none rounded-full' name={col+'_Preprocess'}>
                            {TextDataPreprocessOptions.map(o=><option key={o.value} value={o.value}>{o.name}</option>)}
                        </select>
                    </React.Fragment>)}
                </div> : ''} */}
                <div>
                <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={onConfirm}/>
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">
            <div className='mx-5 my-10 w-8/12 flex justify-start'>
                <div className='w-96'>
                    <DropDown text={optionText} customStyle='h-10 w-96' customUlStyle={'w-96'} items={
                        // , 'Text Data: Check New Features', 'Text Data: Preprocessing'
                        ['Convert All Data Types Automatically', 'Convert Data Type One by One Manually', 'Remove Columns', 'Remove Useless Characters in Columns', 'Remove Rows Containing Specific Values', 'Remove Specific Words in Columns'].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                                              1                            2                               3                                4                                       5*/ }
                                setOption(i)
                                setOptionText(item)
                                if(i===0 || i === 1 ||i === 2 ||i === 3 ||i === 4 || i===5 ||i===6){
                                    setShowSubOptionModal(true)
                                }
                            }
                        }))} />
                </div>
                <Button text={subOptionText} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                    if(option>-1){
                        setShowSubOptionModal(true)
                    }
                }}/>
                
                {/* <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                }}/> */}
            </div>
            {/* <div className='mx-5 my-10 w-3/12'>
                <MultiSelect selections={dataset.dataPreprocessing} passiveMode={true} />
            </div> */}
        </div>

        <div className="h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
            <div className='mx-5 w-12 w-full justify-start'>
                <Label text="Preprocessing Conditions:" className='w-300'>
                <div id = "display_cond" style={{ whiteSpace: 'pre-wrap' }} ></div>
                </Label>
            </div>
        </div>

        <div className="h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
            <div className='mx-5 w-12 w-full justify-start'>
            <Label text="Preprocessing Results:">
                <div id = "display_para_result" style={{ whiteSpace: 'pre-wrap' }} ></div>
            </Label>
            </div>
        </div>

        

        <Table PageSize={10}/>
    </div>)
}

export default Preprocessing