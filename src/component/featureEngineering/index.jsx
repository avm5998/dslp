import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, useCachedData, useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal } from '../../util/ui'
import { DropDown, MultiSelect, Button, Label } from '../../util/ui_components'

import Table from '../common/table'
// import Tip from '../common/tip'
import { InlineTip } from '../common/tip'
import { keyBy } from 'lodash';

const Options = {
    'ConvertCases': 'Convert Cases',
    'ConvertCategoricalToNumerical': 'Convert Categorical to Numerical',
    'ConvertNumericalToCategorical': 'Convert Numerical to Categorical',
    'CreateFeaturesByArithmeticOperations': 'reate Features by Arithmetic Operations',
    'StandardScaler': 'Standard Scaler',
    'MinmaxScaler': 'Minmax Scaler',
    'TextDataFeatureCheckBasicFeatures': 'Text Data: Check Basic Features',
    'TextDataFeatureLabelValuesInColumns': 'Text Data: Label Values in Columns',
    'TextDataFeatureFeatureEngineering': 'Text Data: Feature Engineering',
}

const getCanOperation = (dataset, operation) => {
    switch (operation) {
        case Options.ConvertCases:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case Options.ConvertCategoricalToNumerical:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case Options.ConvertNumericalToCategorical:
            return [!!dataset.num_cols.length, 'No numerical column to convert']
        case Options.CreateFeaturesByArithmeticOperations:
            return [!!dataset.num_cols.length, 'No numerical column to convert']
        case Options.StandardScaler:
            return [!!dataset.num_cols.length, 'No numerical column to convert']
        case Options.MinmaxScaler:
            return [!!dataset.num_cols.length, 'No numerical column to convert']
        case Options.TextDataFeatureCheckBasicFeatures:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case Options.TextDataFeatureLabelValuesInColumns:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case Options.TextDataFeatureFeatureEngineering:
            return [!!dataset.cate_cols.length, 'No category column to convert']
    }

    return [false, '']
}


const getDisplayCode = {
    [Options.ConvertCases]: (subOption) => {
        return `
# Demo of "Convert Categorical to Numerical"

# column(s) will be affected
column = [${Object.keys(subOption).map(e => `"${e}"`).join(',')}]

label = LabelEncoder()
df[column] = label.fit_transform(df[column].astype(str))

print(df.head())
`},
    [Options.ConvertCategoricalToNumerical]: (subOption) => {
        console.log(subOption)
        return `
# Demo of "Convert Categorical to Numerical"

# column(s) will be affected
column = []

label = LabelEncoder()
df[column] = label.fit_transform(df[column].astype(str))
print(df.head())
`},
    [Options.ConvertNumericalToCategorical]: (subOption) => {
        console.log(subOption);
        return `
# Demo of "Convert Numerical to Categorical"

column = []  # change to the column to be tested from dataset

bins = []  # bins of "column"
labels = []  # labels to be assigned to bins 
df[column] = pd.cut(df[column].astype(float), bins=bins, labels=labels)
print(df.head())    
`},
}

const getInitialCode = (option) => `
import pandas as pd
from io import StringIO
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

${option == Options.TextDataFeatureCheckBasicFeatures ? `
import nltk
from nltk.tokenize import word_tokenize
nltk.download('punkt')`: ``}

data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`

const FeatureEngineering = () => {
    useCachedData()
    let [option, setOption] = useState('')
    let subOption = useRef({})
    let [errorMsg, setErrorMsg] = useState('')
    let [showOptionModal, setShowOptionModal] = useState(false)
    let dataset = useSelector(state => state.dataset)
    let dispatch = useDispatch()
    let kernelRef = useRef()
    let codeParent = useRef()
    const [code, setCode] = useState('')
    const [activateStatus, setActivateStatus] = useState('Loading...')

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
            }
        })
    }, [code])

    useEffect(() => {
        if (!dataset.filename) {
            setActivateStatus('No data')
            return
        }

        thebelab.bootstrap();

        //excute code in advance on thebelab to import libraries and set dataframe variable
        thebelab.on("status", async function (evt, data) {
            if (data.status === 'ready' && dataset.filename) {
                let res = await fetchByJSON('current_data_json', {
                    filename: dataset.filename
                })

                let g = await res.json()
                kernelRef.current = data.kernel
                data.kernel.requestExecute({ code: getInitialCode[option] })
                setActivateStatus('Ready')
            }
        })

    }, [dataset.filename])

    const runCode = async (e) => {
        let res = await fetchByJSON('current_data_json', {
            filename: dataset.filename
        })

        let json = await res.json();

        let res2 = await kernelRef.current.requestExecute({ code: InitialCode[option](json.data) }).done

        document.querySelector('.thebelab-run-button').click()
    }

    const assignSubOption = useCallback((prop, entry) => {
        subOption.current[prop] ||= {};
        Object.assign(subOption.current[prop], entry)
    }, [subOption])

    let ts = new Date().getTime()
    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showOptionModal} onClose={() => {
        }} setIsOpen={setShowOptionModal} contentStyleText="mx-auto mt-20">
            <div className='p-7 flex flex-col'>
                {option === Options.ConvertCases ?
                    <div className="flex flex-col gap-2">
                        {dataset.cate_cols.map((name,i) =>
                            <div className='flex flex-row w-full items-center' key={name + ts}>
                                <div className='px-10 py-2 w-1/3 label-left'>{name + ':'}</div>
                                <DropDown zIndex={100-i} onSelect={e => {
                                    subOption.current[name] = e
                                }} defaultText={`Select convert type`} showOnHover={false} width="w-60 mr-0" defaultValue='' defaultText="Select option" blankOption='no change' items={['to lowercase', 'to uppercase']} />
                            </div>
                        )}
                    </div> : ''}

                {option === Options.ConvertCategoricalToNumerical ? <div>
                    <MultiSelect defaultText={`Select columns to convert`} defaultOpen={false} selections={dataset.cate_cols} width="w-72" onSelect={e => subOption.current = e} />
                </div> : ''}

                {option === Options.ConvertNumericalToCategorical ?
                    <div className='grid grid-cols-3 gap-2'>
                        {dataset.num_cols.map((col, i) => <React.Fragment key={i}>
                            <Checkbox label={col} onChange={(e, checked) => assignSubOption(col, { checked })} name='suboption_checked' item={col} />
                            <input className='Bins mx-3 px-1 focus:outline-none rounded-full' placeholder='Bins: int list' onChange={e => assignSubOption(col, { bins: e.target.value })} />
                            <input className='mx-3 px-1 focus:outline-none rounded-full' placeholder='Labels: string list' onChange={e => assignSubOption(col, { label: e.target.value })} />
                        </React.Fragment>)}
                        <Label customStyleText={`w-100 mr-0`} text="eg. column 'Age', Bins=[0,2,17,65,99], Labels=[Toddler, Child, Adult, Elderly]" />
                        <Label customStyleText={`w-100 mr-0`} text="eg. column 'Survived', Bins=[0,1,2], Labels=[Yes, No]" />

                    </div> : ''}

                {option === Options.CreateFeaturesByArithmeticOperations ?
                    <div className="flex flex-col3">
                        <DropDown defaultText={'Select column 1'} showOnHover={false} width={`w-64`} items={dataset.num_cols}
                            onSelect={e => {
                                subOption.current.col1_arithmetic = e
                            }} ></DropDown>
                        <DropDown defaultText={'Select operation'} showOnHover={false} width={`w-64`} items={['+', '-', '*', '/']}
                            onSelect={e => {
                                subOption.current.operation = e
                            }} ></DropDown>
                        <DropDown defaultText={'Select column 2'} showOnHover={false} width={`w-64`} items={dataset.num_cols}
                            onSelect={e => {
                                subOption.current.col2_arithmetic = e
                            }} ></DropDown>
                        <input className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Column Name' name='new_colname' />
                    </div> : ''}

                {option === Options.StandardScaler ? <div>
                    <MultiSelect width="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e => subOption.current = e} />
                </div> : ''}


                {option === Options.MinmaxScaler ? <div>
                    <MultiSelect width="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e => subOption.current = e} />
                </div> : ''}

                {option === Options.TextDataFeatureCheckBasicFeatures ?
                    <div className="flex flex-col3">
                        <DropDown defaultText={'Select column'} showOnHover={false} width={`w-64`} items={dataset.cols}
                            onSelect={e => {
                                subOption.current.check_basic_col = e
                            }} />
                        <DropDown defaultText={'Select operation'} showOnHover={false} width={`w-64`} items={['check most common words', 'visualize: wordcloud', 'words count', 'charactures count', 'average word length', 'stopwords count', 'numbers count', 'uppercase count']}
                            onSelect={e => {
                                subOption.current.basic_operation = e
                            }} />

                    </div> : ''}

                {option === Options.TextDataFeatureLabelValuesInColumns ?
                    <div className='grid grid-cols-4'>
                        {dataset.cate_cols.map((col, i) => <React.Fragment key={i}>
                            <Checkbox label={col} name='suboption_checked_text' item={col} />
                            <input className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Current Values: string list' name={col + '_CurrVal'} />
                            <input className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Column Name: string' name={col + '_NewCol'} />
                            <input className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Values: string list' name={col + '_NewVal'} />
                        </React.Fragment>)}
                        <Label text=''></Label>
                        <Label customStyleText={`w-100 mr-0`} text="eg. current column 'publication', Current Values = [ Atlantic, National Review, Breitbart, New York Times],  New Column Name='politic lean', New Values=[ left, right, right, left]" />
                    </div> : ''}

                {option === Options.TextDataFeatureFeatureEngineering ?
                    <div className="flex flex-col">
                        <DropDown defaultText={'Select column'} showOnHover={false} width={`w-64`} items={dataset.cols}
                            onSelect={e => {
                                subOption.current.text_feateng_col = e
                            }} />
                        <MultiSelect defaultText={`Select one/multi-operation`} defaultOpen={false} selections={['convert to lower case', 'expand contraction', 'remove punctuation', 'remove stopwords automatically', 'remove digits', 'Word Normalization1: lemmatization', 'Word Normalization2: stemming', 'Extract Model1: CountVectorizer', 'Extract Model2: TfidfVectorizer']} width="w-72 mr-0"
                            onSelect={e => subOption.current.text_feateng_operation = e} />
                    </div> : ''}

                <div className="flex justify-end mt-10">
                    <Button text='Confirm' width='w-24' customStyle={{padding:'auto'}} onClick={async () => {
                        setShowOptionModal(false)
                        let res = await fetchByJSON('featureEngineering', { subOption:{...subOption.current},...{
                            activeOption:option,
                        }, filename: dataset.filename }) //send request
                        let json = await res.json()
                        setCode(getDisplayCode[option](subOption.current)) // demo code

                        $('#display_results').html(json.para_result)
                        document.getElementById("img").src = "data:image/png;charset=utf-8;base64," + json.plot_url

                        dispatch(DataSetActions.setData({
                            cols: json.cols,
                            num_cols: json.num_cols,
                            cate_cols: json.cate_cols,
                        }))
                        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
                    }} />
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-20 w-full items-center justify-start bg-gray-100 shadow-md">
            <div className='mx-5 gap-2 w-8/12 flex justify-start'>
                <div className='w-72'>
                    {/* ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Standard Scaler', 'Minmax Scaler', 'Text Data: Feature Extraction Models']; */}
                    {/* enabledOptionIndex={isTsv?[6]:[0,1,2,3,4,5]} */}
                    <DropDown width={'w-72'} height={'h-8'}
                        onSelect={option => {
                            {
                                setOption(option)
                                subOption.current = {}
                                setShowOptionModal(true)
                            }
                        }}
                        items={Object.values(Options)}
                        defaultText='Select option'
                        enabledOptionIndex={Object.keys(Options).map((key, i) => getCanOperation(dataset, key) ? i : -1).filter(i => i > -1)}
                    />
                </div>
                <div className='w-auto flex justify-center items-center px-1'>
                    <div className={``}>{activateStatus}</div>
                    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
                </div>

                <Button text={'Options'} width={'w-48'} onClick={() => {
                    if (option) {
                        setShowOptionModal(true)
                    }
                }} />
            </div>


            {/* demo code */}
            <Button onClick={() => {
                runCode()
            }} disabled={!code} width='w-32' text="Run" overrideClass={`ml-5  px-4 py-1 rounded font-semibold border focus:outline-none text-black cursor-pointer ${!code
                ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} customStyle={{ backgroundColor: !!code ? '#4bd699' : 'inherit' }} onClick={runCode} hoverAnimation={false} />

        </div>

        <div className="w-full flex flex-nowrap">
            <div className='w-1/2 text-gray-500 font-semibold'>
                <div className='scroll'>

                    <Label text="Results:">
                        <div id="display_results" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see preprocessed results</div>
                    </Label>
                    <Label text="Plot:">
                        <img id="img" src="" />
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



        <Table PageSize={10} />
    </div>)
}

export default FeatureEngineering