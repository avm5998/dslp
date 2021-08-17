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
    // if (option === 6) {
    //     subOption.current[option] = condition
    // }

}

const Preprocessing = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select operation')
    let [subOptionText, setSubOptionText] = useState('Options')
    let [option, setOption] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)


    // Demo Code Begin
    let kernelRef = useRef()
    let codeParent = useRef()
    const [code, setCode] = useState('')
    let { getData, result, input } = useSimpleForm({
        default_key: 'default_value'
    })

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

    const runCode = async (e) => {
        let res = await fetchByJSON('current_data_json', {
            filename: dataset.filename
        })
        let json = await res.json();
        let res2 = await kernelRef.current.requestExecute({ code: InitialCode[option](json.data) }).done
        document.querySelector('.thebelab-run-button').click()
    }
    const getCodeFromResult = (option, result) => {
        return DisplayCode[option](result)
    }
    const InitialCode = {
    0: code => `
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`,}

    const DisplayCode = {
    0: code => (`
# Demo of "Convert All Data Types Automatically"

print("Before converting")
print(df.dtypes)

df.convert_dtypes()  # Convert

print("After converting")
print(df.dtypes)
`),
    1: code => (`
# Demo of "Convert Data Type One by One Manually"

df = df.astype('dictioary')   # method 1: get dictionary....
print(df.dtypes)

#columns = [code....]   # method 2
#target_data_types = [code...]
#for column, data_type in zip(columns, target_data_types):
    #df[column] = df[column].astype(data_type)
`),
    2: code => (`
# Demo of "Remove Columns"

print("Before Removing" )
print(df.columns)

columns = [code....]
df = df.drop(columns, axis=1) # Remove Columns
print("After Removing" )
print(df.columns)
 
    `),
    3: code => (`
# Demo of "Remove Useless Characters in Columns"

columns = [code....]
characters = [code...]

for column, char in zip(columns, characters):
    for ch in char:
        df[column] = df[column].str.replace(ch, '')

print(df.head(20))
    `),
    4: code => (`
# Demo of "Remove Rows Containing Specific Values"

columns = [code....]
values = [code...]

for column, value in zip(columns, values):
    temp = value.split(',')
    df = df[~(df[column].isin(temp))]

print(df.head(20))

    `),
    5: code => (`
# Demo of "Remove Specific Words in Columns"

columns = [code....]
words = [code...]

for column, word in zip(columns, words):
    temp = word.split(',') if ',' in word else word
    if ',' in index2:
        for each_word in temp:
            df[column] = df[column].str.replace(each_word, '')   
    else:
        df[column] = df[column].str.replace(temp, '') 

    `),
    6: code => (`
# Demo of "Remove Outliers"

columns = [code...]
above_list = []
below_list = []
for column in columns:
    q_low = df[column].quantile(float(params[column+'_above'].strip('%') or 0)/100 if column+'_above' in params else 0)
    q_hi = df[column].quantile(float(params[column+'_below'].strip('%') or 100)/100 if column+'_below' in params else 100)
    df = df[(df[column] <= q_hi) & (df[column] >= q_low)] 

    `),

    }

    // Demo Code End


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

    const onConfirm = async (e) => {
        let requestData = {}
        if(option!==0)
            eval(`requestData = getData${option}()`)
        console.log(requestData)
        let res = await fetchByJSON('preprocessing', {...requestData,option, filename:dataset.filename})
        let json = await res.json()
        setCode(getCodeFromResult(option, result)) // Demo code
        // console.log(json.data)
        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
        $('#display_cond').text(json.cond)
        $('#display_para_result').html(json.para_result)
        setShowSubOptionModal(false)
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
                <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={onConfirm}/>
                </div>
            </div>
        </Modal>

        <div className="flex flex-row h-auto w-full items-start justify-start bg-gray-100 shadow-lg">
            <div className='mx-5 my-5 w-8/12 flex justify-start'>
                <div className='w-96'>
                    <DropDown text={optionText} customStyle='h-10 w-96' customUlStyle={'w-96'} items={
                        // , 'Text Data: Check New Features', 'Text Data: Preprocessing'
                        ['Convert All Data Types Automatically', 'Convert Data Type One by One Manually', 'Remove Columns', 'Remove Useless Characters in Columns', 'Remove Rows Containing Specific Values', 'Remove Specific Words in Columns', 'Remove Outliers'].map((item, i) => ({
                            name: item, onClick(e) {
                                {/*   0                                              1                            2                               3                                4                                       5                            6*/ }
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
                <Button onClick={() => {
                    runCode()
                }} disabled={!code} width='w-32' text="Run" overrideClass={`ml-5  px-4 py-1 rounded font-semibold border focus:outline-none text-black cursor-pointer ${!code
                    ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} customStyle={{ backgroundColor: !!code ? '#4bd699' : 'inherit' }} onClick={runCode} hoverAnimation={false} />
                    
                
                
                {/* <Button text={'Confirm'} customStyle={'h-10 w-60 ml-10'} onClick={()=>{
                }}/> */}
            </div>
            {/* <div className='mx-5 my-10 w-3/12'>
                <MultiSelect selections={dataset.dataPreprocessing} passiveMode={true} />
            </div> */}
            
        </div>

            <div className="w-full flex flex-nowrap">
                <div className='w-1/2 text-gray-500 font-semibold'>
                    <div className='scroll'>
                        <Label text="Preprocessing Conditions:" className='w-300'>
                            <div id = "display_cond" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see conditions</div>
                        </Label>
                        <Label text="Preprocessing Results:">
                            <div id = "display_para_result" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see preprocessed results</div>
                        </Label>
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