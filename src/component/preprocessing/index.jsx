import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useCachedData,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { MultiSelect, DropDown,Button } from '../../util/ui_components'
import { Checkbox, Label, Modal } from '../../util/ui'
import Table from '../common/table'
import { InlineTip } from '../common/tip';
import { func } from 'prop-types';
import { getType } from '@reduxjs/toolkit';


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
    // if (option === 6) {
    //     subOption.current[option] = condition
    // }

}

const InitialCode = (code,requestObj) => `
import json
import pandas as pd
from io import StringIO
import numpy as np
MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
ndf = df.replace(MISSING_VALUES, np.nan)
params = json.loads('${JSON.stringify(requestObj)}')
target_col = []
target_operation = []
option = int(params['option'])
for key, val in params.items():
    if val and key in ndf.columns:
        target_col.append(key)
        target_operation.append(val)
`

    const DisplayCode = {
    0: code => (`
# Demo of "Convert All Data Types Automatically"

ndf.convert_dtypes()  # Convert data types

print("After converting")
print(ndf.dtypes)
`),
    1: code => function(){
        let targetCol = []
        let targetOperation = []
        for(let key in code){
            let value = code[key]
            if(value && key!='filename' && key!='option'){
                targetCol.push(`"${key}"`)
                targetOperation.push(`"${value}"`)
            }
        }
return `
# Demo of "Convert Data Type One by One Manually"

# target column(s)
target_col = [${targetCol}] 

# new data type
target_operation = [${targetOperation}] 

for column, data_type in zip(target_col, target_operation):
    if column == 'datetime':
        ndf[column] = ndf[column].datetime.strftime('%Y-%m-%d')
    else:
        ndf[column] = ndf[column].astype(data_type)

print("After converting")
print(ndf.dtypes)
`},
    2: code => function(){
        let targetCol = []
        let value = []
        for(let key in code){
            if(key!='filename' && key!='option'){
                value = code[key]
            }
        }
        for(let k in value)targetCol.push(`"${value[k]}"`)
return `
# Demo of "Remove Columns"

# column(s) that will be dropped
columns = [${targetCol}]

# remove columns
df = df.drop(columns, axis=1) 

print("After Removing:" )
print(df.columns)
 `},
    3: code => function(){
        let targetCol = []
        let targetOperation = []
        for(let key in code){
            let value = code[key]
            if(value && key!='filename' && key!='option'){
                targetCol.push(`"${key}"`)
                targetOperation.push(`"${value}"`)
            }
        }
return `
# Demo of "Remove Useless Characters in Columns"

target_col = [${targetCol}]
target_operation = [${targetOperation}]

for index1, index2 in zip(target_col, target_operation):
    for k in index2:
        ndf[index1] = ndf[index1].str.replace(k, '')

print(ndf.head())  # check the dataset
    `},
    4: code => function(){
        let targetCol = []
        let targetOperation = []
        for(let key in code){
            let value = code[key]
            if(value && key!='filename' && key!='option'){
                targetCol.push(`"${key}"`)
                targetOperation.push(`"${value}"`)
            }
        }
        return `
# Demo of "Remove Rows Containing Specific Values"

target_col = [${targetCol}]
target_operation = [${targetOperation}]

for index1, index2 in zip(target_col, target_operation):
    temp = index2.split(',')
    ndf = ndf[~(df[index1].isin(temp))]

print(ndf.head())  # check the dataset

    `},
    5: code => function(){
        let targetCol = []
        let targetOperation = []
        for(let key in code){
            let value = code[key]
            if(value && key!='filename' && key!='option'){
                targetCol.push(`"${key}"`)
                targetOperation.push(`"${value}"`)
            }
        }
        return `
# Demo of "Remove Specific Words in One Column"

target_col = [${targetCol}]
target_operation = [${targetOperation}]

for index1, index2 in zip(target_col, target_operation):
    temp = index2.split(',') if ',' in index2 else index2
    if ',' in index2:
        for each_word in temp:
            ndf[index1] = ndf[index1].str.replace(each_word, '')   
    else:
        ndf[index1] = ndf[index1].str.replace(temp, '') 

print(ndf.head())  # check the dataset
 
    `},
    6: code => function(){
        let params = []
        for(let key in code){
            let value = code[key]
            if(value && key!='filename' && key!='option'){
                params.push(`"${key}" : "${value}"`)
            }
        }
        return`
# Demo of "Remove Outliers"

params = {${params.join(",")}}

for column in ndf.columns:
    if column+'_above' in params or column+'_below' in params:
        q_low = ndf[column].quantile(float(params[column+'_above'].strip('%') or 0)/100 if column+'_above' in params else 0)
        q_hi = ndf[column].quantile(float(params[column+'_below'].strip('%') or 100)/100 if column+'_below' in params else 100)
        ndf = ndf[(ndf[column] <= q_hi) & (ndf[column] >= q_low)] 

print(ndf.describe())  # check the dataset

    `},

    }

const Preprocessing = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select operation')
    let [subOptionText, setSubOptionText] = useState('Options')
    let [option, setOption] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)
    let requestObjectRef = useRef(null) //demo

    // Demo Code Begin
    let kernelRef = useRef()
    let codeParent = useRef()
    const [code, setCode] = useState('')
    const [activateStatus, setActivateStatus] = useState('Loading...')
    let [dfJSON, setDfJSON] = useState('')//dataframe json
    let { getData, result, input } = useSimpleForm({
        default_key: 'default_value'
    })
    let [previousCondition, setPreviousCondition] = useState({})
    let [currentCondition, setCurrentCondition] = useState({})
    // const [currentFilter, setCurrentFilter] = useState([])

    useEffect(() => {
        if (!code) return

        codeParent.current.innerHTML = ''
        let pre = document.createElement('pre')
        pre.setAttribute('data-executable', 'true')
        pre.setAttribute('data-language', 'python')
        codeParent.current.appendChild(pre)
        pre.innerHTML = code
        thebelab.bootstrap();

        thebelab.on("status", async function (evt, data) {
            if (data.status === 'ready') {
                kernelRef.current = data.kernel
                console.log('kernel ready');
                // alert('Ready')
                // setActivateStatus('Ready')
            }
        })
    }, [code])

    //start thebelab automatically
    //load current dataframe
    // useEffect(() => {
    //     if (!dataset.filename) {
    //         setActivateStatus('No data')
    //         return
    //     }

    //     thebelab.bootstrap();

    //     //excute code in advance on thebelab to import libraries and set dataframe variable
    //     thebelab.on("status", async function (evt, data) {
    //         if (data.status === 'ready' && dataset.filename) {
    //             let res = await fetchByJSON('current_data_json', {
    //                 filename: dataset.filename
    //             })

    //             let g = await res.json()
    //             kernelRef.current = data.kernel
    //             // alert('X')
    //             data.kernel.requestExecute({ code: InitialCode(g.data) })
    //             setDfJSON(g.data)
    //             setActivateStatus('Ready')
    //         }
    //         // console.log("Status changed:", data.status, data.message);
    //     })

    // }, [dataset.filename])

    const runCode = async (e) => {
        let res = await fetchByJSON('current_data_json', {
            filename: dataset.filename
        })
        let json = await res.json();
        let res2 = await kernelRef.current.requestExecute({ code: InitialCode(json.data,requestObjectRef.current) }).done
        console.log(res2);
        document.querySelector('.thebelab-run-button').click()
    }

    const getCodeFromResult = (option, requestObject) => {
        return DisplayCode[option](requestObject)
    }

    const getDefaultSubOptions = useCallback(() => {
        const res = [...Array(7).keys()].map(e => ({}))
        res[1].cols = []
        res[6].aboveRefs = {}
        res[6].belowRefs = {}
        return res
    }, [])

    const onConfirmSubOption = () => {
        if (option === 6) {
            let itemObj = {}
            let belowRefs = subOption.current[6].belowRefs
            let aboveRefs = subOption.current[6].aboveRefs

            for (let p in belowRefs) {
                let value = belowRefs[p].value

                if (value) {
                    itemObj[p] = itemObj[p] || {}
                    itemObj[p].below = value
                }
            }

            for (let p in aboveRefs) {
                let value = aboveRefs[p].value

                if (value) {
                    itemObj[p] = itemObj[p] || {}
                    itemObj[p].above = value
                }
            }

            if (Object.keys(itemObj).length) setSubOptionText('Edit values')

            let items = []
            for (let key in itemObj) {
                items.push({
                    col: key,
                    above: itemObj[key].above,
                    below: itemObj[key].below,
                })
            }

            subOption.current[6].condition.items = items
        }

        setShowSubOptionModal(false)
    }

    // useEffect(async ()=>{
    //     for (const cond of dataset.dataPreprocessing) {
    //         let res = await fetchByJSON('preprocessing', cond)
    //         let json = await res.json()
    //         dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
    //         $('#display_cond').text(json.cond)
    //         $('#display_para_result').html(json.para_result)
    //     }
    //     setCode(getCodeFromResult(dataset.dataPreprocessing[dataset.dataPreprocessing.length-1].option, dataset.dataPreprocessing[dataset.dataPreprocessing.length-1]))
    // }, [dataset.dataPreprocessing])


    const onConfirm = async (e) => {
        if (JSON.stringify(previousCondition)==="{}") {
            let prevres = await fetchByJSON('current_data_json', {filename: dataset.filename})
            let prevjson = await prevres.json()
            setPreviousCondition(JSON.parse(prevjson.data))
        } else {
            setPreviousCondition(currentCondition)
        }

        let requestData = {}
        if(option!==0)
            eval(`requestData = getData${option}()`)
        let requestObject = {...requestData,option, filename:dataset.filename}
        dispatch(DataSetActions.setPreprocessing([...dataset.dataPreprocessing, requestObject]))

        let res = await fetchByJSON('preprocessing', requestObject)
        let json = await res.json()
        setCode(getCodeFromResult(option,requestObject)) // Demo code
        requestObjectRef.current = requestObject //demo code
        console.log(requestObject)
        // dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
        dispatch(DataSetActions.setData({
            data: JSON.parse(json.data),
            cols: json.cols,
            num_cols: json.num_cols,
            col_lists: json.col_lists,
            cate_cols: json.cate_cols,
            cate_lists: json.cate_lists,
            num_lists: json.num_lists
        }))
        $('#display_cond').text(json.cond)
        $('#display_para_result').html(json.para_result)
        setShowSubOptionModal(false)

        setCurrentCondition(JSON.parse(json.data))
    }

    const onUndo = async (e) => {
        // let res = await fetchByJSON('cleanEditedCache', {
        //     filename: dataset.filename
        // })
        // let json = await res.json()
        // if (json.success) {
        //     let previous = dataset.dataPreprocessing.slice(0, -1)
        //     dispatch(DataSetActions.setPreprocessing(previous))
        //     setCurrentFilter([])
        //     setCode(getCodeFromResult(previous[previous.length-1].option, previous[previous.length-1]))
        // }

        if (currentCondition == previousCondition) {
            return
        } else {
            let previous = dataset.dataPreprocessing.slice(0, -1)
            dispatch(DataSetActions.setPreprocessing(previous))
            if (previous.length > 0) {
                setCode(getCodeFromResult(previous[previous.length-1].option, previous[previous.length-1]))
            } else {
                setCode('')
            }
            dispatch(DataSetActions.setTableData(previousCondition))
            setCurrentCondition(previousCondition)
        }
    }

    let dispatch = useDispatch()
    let subOption = useRef(getDefaultSubOptions())

    let currentOption = subOption.current[option]
    let {select : select1,getData: getData1} = useSimpleForm()
    let {select : select2,getData: getData2,result:result2} = useSimpleForm()
    let {input : input3,getData: getData3} = useSimpleForm()
    let {input : input4,getData: getData4} = useSimpleForm()
    let {input : input5,getData: getData5} = useSimpleForm()
    let {select : input6,getData: getData6} = useSimpleForm()




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
            setShowSubOptionModal(false)

        }} setIsOpen={setShowSubOptionModal} contentStyleText="">
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
                    <MultiSelect defaultOpen={false} selections={dataset.cols} onSelect={(e) => {
                        result2.cols = e
                    }} />
                </div> : ''}

                
                {option === 3 ? <div className='grid grid-cols-2'>
                    {dataset.cate_cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input3} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Useless character' name={col}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 4 ? <div className='grid grid-cols-2'>
                    {dataset.cate_cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input4} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Specific value' name={col}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 5 ? <div className='grid grid-cols-2'>
                    {dataset.cate_cols.map((col,i)=><React.Fragment key={i}>
                        <label className='m-3'>{col}</label>
                        <input {...input5} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Specific words' name={col}/>
                    </React.Fragment>)}
                </div> : ''}

                {option === 6 ? <div className='grid grid-cols-2'>
                {dataset.num_cols.map(name => <div key={name} className="inline-block w-full">
                            <div className='py-3 px-10 inline-block float-left'>{name + ':'}</div>
                            <div className='py-3 inline-block float-right'>
                                <select {...input6} name={name+'_below'} className='py-2 px-5 focus:outline-none rounded-full' placeholder="Remove Above">
                                    <option value="">-</option>
                                    <option value="55%">55%</option><option value="60%">60%</option><option value="65%">65%</option>
                                    <option value="70%">70%</option><option value="75%">75%</option><option value="80%">80%</option>
                                    <option value="85%">85%</option><option value="90%">90%</option><option value="95%">95%</option>
                                </select>
                            </div>
                            <div className='py-3 inline-block float-right'>
                                <select {...input6} name={name+'_above'} className='py-2 px-5 focus:outline-none rounded-full' placeholder="Remove Below">
                                    <option value="">-</option><option value="5%">5%</option><option value="10%">10%</option><option value="15%">15%</option>
                                    <option value="20%">20%</option><option value="25%">25%</option><option value="30%">30%</option>
                                    <option value="35%">35%</option><option value="40%">40%</option><option value="45%">45%</option>
                                    <option value="50%">50%</option>
                                </select>
                            </div>
                        </div>)}
                </div> : ''}

               
                <div>
                <Button text={'Confirm'} onClick={onConfirm}/>
                </div>
            </div>
        </Modal>

        <div className="flex flex-row h-20 w-full items-center justify-start bg-gray-100 shadow-md">
              <div className='mx-5 w-3/12 flex justify-start items-center'>
                <DropDown text={optionText} width='w-72' height='h-10' items={['Convert All Data Types Automatically', 'Convert Data Type One by One Manually', 'Remove Columns', 'Remove Useless Characters in Columns', 'Remove Rows Containing Specific Values', 'Remove Specific Words in One Column', 'Remove Outliers']}
                onSelect={(item,i)=>{
                    setOption(i)
                    setOptionText(item)
                    if(i===0 || i === 1 ||i === 2 ||i === 3 ||i === 4 || i===5 ||i===6)
                        setShowSubOptionModal(true)
                }}/>
              </div>
              <div className='mx-5 w-3/12 flex justify-start items-center'>
                <div className='w-auto flex justify-center items-center px-1'>
                    <div className={``}>{activateStatus}</div>
                    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
                </div>
              </div>
              <div className='mx-5 w-6/12 flex justify-end items-center'>
                <Button text={subOptionText} width='w-32' onClick={()=>{
                    if(option>-1){
                        setShowSubOptionModal(true)
                    }
                }}/>
                {/* <Button onClick={() => {
                    runCode()
                }} disabled={!code} width='w-32' text="Run" overrideClass={`ml-5 w-32 px-4 py-1 rounded font-semibold border focus:outline-none text-black ${!code
                    ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} customStyle={{ backgroundColor: !!code ? '#4bd699' : 'inherit' }} onClick={runCode} hoverAnimation={false} /> */}
                <Button text="Undo" width='w-24 mx-3' onClick={onUndo} disabled={currentCondition == previousCondition}/>   
                <Button text='Revert' width='w-24 mx-3' onClick={
                    async (e) => {
                        setCode('')
                        if (dataset.filename) {
                            let res = await fetchByJSON('cleanEditedCache', {
                                filename: dataset.filename
                            })
                
                            let json = await res.json()
                
                            if (json.success) {
                                // alert('Revert data success!')
                                dispatch(DataSetActions.emptyInfo())
                                dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
                                // selectFileOption(dataset.filename, false)
                            }
                            // setCurrentCondition({})
                        }
                    }
                } />
                
              </div>
                {/* <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                }}/> */}
            {/* <div className='mx-5 my-10 w-3/12'>
                <MultiSelect selections={dataset.dataPreprocessing} passiveMode={true} />
            </div> */}
            
        </div>

            <div className="w-full flex flex-nowrap">
                <div className='w-1/2 text-gray-500 font-semibold'>
                    <div className='scroll w-full flex justify-center items-center' style={{height:'100%'}}>
                        <div className="flex gap-10">
                          <div className=" flex items-start flex-col justify-center">
                            <div>
                            Preprocessing Conditions:
                            </div>
                            <div id = "display_cond" style={{ whiteSpace: 'pre-wrap' }}>
                              Select an operation to see conditions
                            </div>
                          </div>
                          <div className=" flex items-start flex-col justify-center">
                            <div>
                            Preprocessing Results:
                            </div>
                            <div id = "display_para_result" style={{ whiteSpace: 'pre-wrap' }}>
                              Select an operation to see preprocessed results
                            </div>
                          </div>
                        </div>
                        {/* <Label text="Preprocessing Conditions:" className='w-300'>
                            <div id = "display_cond" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see conditions</div>
                        </Label> */}
                        {/* <Label text="Preprocessing Results:">
                            <div id = "display_para_result" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see preprocessed results</div>
                        </Label> */}
                    </div>
                </div>
                {/* Demo code */}
                <div className='flex-grow-1 w-1/2' ref={codeParent}>  
                    {code ? code : <div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                        Select an operation to see the corresponding code
                    </div>}
                </div>
            </div>


        <Table PageSize={10}/>
    </div>)
}

export default Preprocessing