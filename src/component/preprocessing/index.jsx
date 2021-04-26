import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'

const Options = [
    {name:'Convert to',value:''},
    {name:'String',value:'String'},
    {name:'Integer',value:'Integer'},
    {name:'Float',value:'Float'},
    {name:'Bool',value:'Bool'},
    {name:'Category',value:'Category'},
]

const TextDataCheckFeatOptions = [
    {name:'Select Operation',value:''},
    {name:'Words Count',value:'Words Count'},
    {name:'Characture Count',value:'Characture Count'},
    {name:'Average Word Length',value:'Average Word Length'},
    {name:'Stopwords Count',value:'Stopwords Count'},
    {name:'Numerics Count',value:'Numerics Count'},
    {name:'Upper Count',value:'Upper Count'},
]
const TextDataPreprocessOptions =[
    {name:'Select Operation',value:''},
    {name:'Convert to Lower Case',value:'Convert to Lower Case'},
    {name:'Expand Contractions',value:'Expand Contractions'},
    {name:'Remove Punctuation',value:'Remove Punctuation'},
    {name:'Remove Stopwords',value:'Remove Stopwords'},
    {name:'Remove Digits',value:'Remove Digits'},
    {name:'Remove URL',value:'Remove URL'},
    {name:'Remove Specific Words',value:'Remove Specific Words'},//7
    {name:'Lemmatization',value:'Lemmatization'},
    {name:'Stemming',value:'Stemming'},
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

    // sophie add onConfirm
    useEffect(() => { 
        queryPreprocess()
    },  [dataset.dataPreprossing])

    const queryPreprocess = async() => {}
    const onConfirm = (e) => {
        if (option === -1) return
        let qString = getQString(option, cleaningCondition.current)
        // let prep = [...dataset.dataPreprossing]
        // let exist = filters.some(f => f.subOption === option && f.qString === qString)
        // if (exist) return
        cleaners.push({
            subOption: option,
            qString,
            desc: getDesc(option, qString)
        })

        dispatch(DataSetActions.setCleaners(cleaners))
    }


    let dispatch = useDispatch()
    let subOption = useRef(getDefaultSubOptions())

    let currentOption = subOption.current[option]
    let {select : select1,getData: getData1} = useSimpleForm()
    let {select : select2,getData: getData2} = useSimpleForm()
    let {select : select3,getData: getData5} = useSimpleForm()
    let {input : input3,getData: getData3} = useSimpleForm()
    let {input : input4,getData: getData4} = useSimpleForm()



    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showSubOptionModal} onClose={()=>{
            if (option === 1){
                setSubOption(option, subOption, getData1())
            }

            if (option === 3){
                setSubOption(option, subOption, getData3())
            }

            if (option === 4){
                setSubOption(option, subOption, getData4())
            }
            if (option === 5){
                setSubOption(option, subOption, getData2())
            }
            if (option === 6){
                setSubOption(option, subOption, getData5())
            }

        }} setIsOpen={setShowSubOptionModal} contentStyleText="mx-auto mt-20">
            <div className='p-5 flex flex-col'>
                {option === 1 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <div className='m-3 flex items-center'>{col}</div>
                        <select {...select1} className='text-gray-500 m-3 px-5 py-2 focus:outline-none rounded-full' name={col+'_Convert'}>
                            {Options.map(o=><option key={o.value} value={o.value}>{o.name}</option>)}
                        </select>
                    </React.Fragment>)}
                </div> : ''}

                {option === 2 ? <div className='grid grid-cols-2'>
                    <MultiSelect selections={dataset.cols} onSelect={(e) => {
                        setSubOption(option, subOption, e)
                    }} />
                </div> : ''}

                
                {option === 3 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input3} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Useless character' name={col+'_Useless'}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 4 ? <div className='grid grid-cols-2'>
                    {dataset.cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input4} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Specific value' name={col+'_Specific'}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 5 ? <div className='grid grid-cols-2'>
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
                </div> : ''}
                <div>
                <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={onConfirm}/>
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">
            <div className='mx-5 my-10 w-8/12 flex justify-start'>
                <div className='w-96'>
                    <DropDown text={optionText} customStyle='h-10 w-96' customUlStyle={'w-96'} items={
                        ['Convert All Data Types Automatically', 'Convert Data Type One by One Manually', 'Remove Columns', 'Remove Useless Characters from Columns', 'Remove Rows with Specific Values', 'Text Data: Check New Features', 'Text Data: Preprocessing'].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                                              1                            2                               3                                4                                  5                             6*/ }
                                setOption(i)
                                setOptionText(item)
                                if(i === 1 ||i === 2 ||i === 3 ||i === 4 || i===5 ||i===6){
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
        <Table PageSize={10}/>
    </div>)
}

export default Preprocessing