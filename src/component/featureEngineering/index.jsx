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
import { keyBy } from 'lodash';

const Options = ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Create Features by Arithmetic Operations','Standard Scaler', 'Minmax Scaler',  'Text Data: Check Basic Features', 'Text Data: Label Values in Columns', 'Text Data: Feature Engineering']; //, 'Add New Features', 'Text Data: Feature Extraction Models',
//                       0                    1                                     2                                          3                              4                 5                         6                                           7                           8
// const Options = ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Standard Scaler', 'Minmax Scaler', 'Text Data: Feature Extraction Models']; //, 'Add New Features'
//                        0                       1                                      2                            3              4                            5
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
        case 5:
            return [!!dataset.num_cols.length,'No numerical column to convert']
        case 6:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case 7:
            return [!!dataset.cate_cols.length, 'No category column to convert']
        case 8:
            return [!!dataset.cate_cols.length, 'No category column to convert']
    

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

    let {result, checkbox:checkbox2, input:input2, getData,clearData} = useSimpleForm()
    // let {result,getData,clearData} = useSimpleForm()
    let [isTsv, setIsTsv] = useState(0)


    // Demo Code Begin
    let [dfJSON, setDfJSON] = useState('')//dataframe json
    let kernelRef = useRef()
    let codeParent = useRef()
    const [code, setCode] = useState('')
    const [activateStatus, setActivateStatus] = useState('Loading...')
    const getCodeFromResult = (option, result) => {
        return DisplayCode[option](result)
    }
    const InitialCode = {
    0: code => `
    import pandas as pd
    from io import StringIO
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    1: code => `
    import pandas as pd
    from io import StringIO
    from sklearn.preprocessing import LabelEncoder
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    2: code => `
    import pandas as pd
    from io import StringIO
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    3: code => `
    import pandas as pd
    from io import StringIO
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    4: code => `
    import pandas as pd
    from io import StringIO
    from sklearn.preprocessing import StandardScaler
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    5: code => `
    import pandas as pd
    from io import StringIO
    from sklearn.preprocessing import MinMaxScaler

    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    6: code => `
    import pandas as pd
    from io import StringIO
    import nltk
    from nltk.tokenize import word_tokenize
    nltk.download('punkt')
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    7: code => `
    import pandas as pd
    from io import StringIO
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    8: code => `
    import pandas as pd
    from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
    from io import StringIO
    data_io = StringIO(r"""${code}""")
    df = pd.read_json(data_io)
    `,
    }

    const DisplayCode = {
0: code => function(){
    let operation = []
    let column = []
    for(let value of code['cols']){
        if(value[1] != "no change"){
            column.push(`"${value[0]}"`)
            operation.push(`"${value[1]}"`)
        }
    }
    return `
# Demo of "Convert Cases"

# column(s) that will be affected
column = [${column}] 
# operation of that column(s)
operation = [${operation}]

if operation == 'to lowercase':
    df[column] = df[column].astype(str).str.lower()
elif operation == 'to uppercase':
    df[column] = df[column].astype(str).str.upper()

print(df.head())
`},
    1: code => function(){
        let column = []
        for(let value of code['cols']){
            column.push(`"${value[1]}"`)
        }
        return `
# Demo of "Convert Categorical to Numerical"

# column(s) will be affected
column = [${column}]

label = LabelEncoder()
df[column] = label.fit_transform(df[column].astype(str))

print(df.head())

`},
    2: code => function(){
        let column = []
        let bins = []
        let labels = []
        for(let value of code['cols']){
            console.log(value)
            column.push(`"${value[1]}"`)
        }
        return `
# Demo of "Convert Numerical to Categorical"

column = [${column}]  # change to the column to be tested from dataset

bins = [0,1,2]  # bins of "column"
labels = ['female', 'male']  # labels to be assigned to bins 
df[column] = pd.cut(df[column].astype(float), bins=bins, labels=labels)
    
print(df.head())
    `},
    3: code => (`
# Demo of "Create Features by Arithmetic Operations"

column1 = "Quantity"
operation = '*'
column2 = "Unit Price"
new_colname = "Total Price"

if operation == '+':
    df[new_colname] = df[column1] + ndf[column2]
elif operation == '-':
    df[new_colname] = df[column1] - df[column2]
elif operation == '*':
    df[new_colname] = df[column1] * df[column2]
elif operation == '/':
    df[new_colname] = df[column1] / df[column2]

print(df.head())

    `),

    4: code => (`
# Demo of "Standard Scaler"
# Assigned values are based on the dataset: titanic.csv

columns = ["Age", "Sex"]    # change to columns to be tested from dataset

scaler = StandardScaler()
df[columns] = scaler.fit_transform(df[columns])

print(df.head())
    `),

    5: code => (`
# Demo of "Minmax Scaler"
# Assigned values are based on the dataset: titanic.csv

columns = ["Age", "Sex"]    # change to columns to be tested from dataset

scaler = MinMaxScaler()
df[columns] = scaler.fit_transform(df[columns])

print(df.head())
    `),

    6: code => (`
# Demo of "Text Data: Check Basic Features"

column = 'Name'
operation = 'check most common words'
all_words=[]
for msg in df[column]:
    words=word_tokenize(msg)
    for w in words:
        all_words.append(w)
#Frequency of Most Common Words
frequency_dist=nltk.FreqDist(all_words)
print(frequency_dist)
#Frequency Plot for first 20 most frequently occuring words
frequency_dist.plot(20,cumulative=False)

    `),
    7: code => (`
# No Demo for "Text Data: Label Values in Columns"

    `),
    8: code => (`
# Demo of "Text Data: Feature Engineering"

text_feateng_option = 'Extract Model1: CountVectorizer'
column = 'Name'

if text_feateng_option == 'Extract Model1: CountVectorizer':
    tf_vectorizer = CountVectorizer()
    tf = tf_vectorizer.fit_transform(df[column]).toarray()
    tf_feat_names = tf_vectorizer.get_feature_names()
    print("Vocabulary: \\n", str(tf_feat_names))
    print("Count Vectorizer After fit_transform: \\n", str(tf))
elif text_feateng_option == 'Extract Model2: TfidfVectorizer':
    tfidf_vectorizer = TfidfVectorizer()
    tfidf = tfidf_vectorizer.fit_transform(df[column]).toarray()
    tfidf_feat_names = tfidf_vectorizer.get_feature_names()
    print("Vocabulary: \\n" + str(tfidf_feat_names))
    print("idf vector: \\n" + str(tfidf_vectorizer.idf_))
    print("TF-IDF Vectorizer After fit_transform: \\n" + str(tfidf))

    `),

    }


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
                // alert('X')
                data.kernel.requestExecute({ code: InitialCode[option] })
                setDfJSON(g.data)
                setActivateStatus('Ready')
            }
            // console.log("Status changed:", data.status, data.message);
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

    //Demo Code End


    useEffect(()=>{
        let extension = dataset.filename.substr(dataset.filename.lastIndexOf('.')+1)
        if(extension === 'tsv'){
            setIsTsv(1)
        }
    },[])

    //clear current result
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
            <div className='p-7 flex flex-col'>
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
                    </div>: ''}
 
                {option === 1 ? <div>
                    <MultiSelect defaultText={`Select columns to convert`} defaultOpen={false} selections={dataset.cate_cols}  customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" onSelect={e=>result.cols = e} />
                </div> : ''}

                {option ===  2 ? 
                    <div className='grid grid-cols-3 gap-2'>
                        {dataset.num_cols.map((col,i)=><React.Fragment key={i}>
                            <Checkbox {...checkbox2} label={col} name='suboption_checked' item={col}/>
                            <input {...input2} className='Bins mx-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Bins: int list' name={col+'_Bins'}/>
                            <input {...input2} className='mx-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Labels: string list' name={col+'_Labels'}/>
                        </React.Fragment>)}
                        <Label text=''></Label>
                        <Label customStyle={`w-100 mr-0`} customUlStyle="w-100 mr-0" text="eg. column 'Age', Bins=[0,2,17,65,99], Labels=[Toddler, Child, Adult, Elderly]"/>
                        <Label customStyle={`w-100 mr-0`} customUlStyle="w-100 mr-0" text="eg. column 'Survived', Bins=[0,1,2], Labels=[Yes, No]"/>

                </div> : ''}

                {option === 3 ?
                    <div className="flex flex-col3">
                    <DropDown defaultText={'Select column 1'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.num_cols} 
                    onSelect={e => {
                        result.col1_arithmetic = e
                    }} ></DropDown>
                    <DropDown defaultText={'Select operation'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['+', '-', '*', '/']} 
                    onSelect={e => {
                        result.operation = e
                    }} ></DropDown>
                    <DropDown defaultText={'Select column 2'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.num_cols} 
                    onSelect={e => {
                        result.col2_arithmetic = e
                    }} ></DropDown>
                     <input {...input2} className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Column Name' name='new_colname'/>
                </div>:''}

                {option === 4 ? <div>
                    <MultiSelect customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e=>result.cols = e} />
                </div> : ''}

                
                {option === 5 ? <div>
                    <MultiSelect customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e=>result.cols = e} />
                </div> : ''}

                {option === 6 ?
                    <div className="flex flex-col3">
                    <DropDown defaultText={'Select column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.check_basic_col = e
                    }} />
                    <DropDown defaultText={'Select operation'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['check most common words', 'visualize: wordcloud', 'words count', 'charactures count', 'average word length', 'stopwords count', 'numbers count', 'uppercase count']} 
                    onSelect={e => {
                        result.basic_operation = e
                    }} />
                   
                </div>:''}

                {option ===  7 ? 
                    <div className='grid grid-cols-4'>
                        {dataset.cate_cols.map((col,i)=><React.Fragment key={i}>
                            <Checkbox {...checkbox2} label={col} name='suboption_checked_text' item={col}/>
                            <input {...input2} className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='Current Values: string list' name={col+'_CurrVal'}/>
                            <input {...input2} className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Column Name: string' name={col+'_NewCol'}/>
                            <input {...input2} className='m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Values: string list' name={col+'_NewVal'}/>
                        </React.Fragment>)}
                        <Label text=''></Label>
                        <Label customStyle={`w-100 mr-0`} customUlStyle="w-100 mr-0" text="eg. current column 'publication', Current Values = [ Atlantic, National Review, Breitbart, New York Times],  New Column Name='politic lean', New Values=[ left, right, right, left]"/>
                    </div> : ''}

                {option === 8 ?
                    <div className="flex flex-col">
                    <DropDown defaultText={'Select column'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={dataset.cols} 
                    onSelect={e => {
                        result.text_feateng_col = e
                    }} />
                    <MultiSelect defaultText={`Select one/multi-operation`} defaultOpen={false} selections={['convert to lower case', 'expand contraction', 'remove punctuation', 'remove stopwords automatically', 'remove digits', 'Word Normalization1: lemmatization', 'Word Normalization2: stemming', 'Extract Model1: CountVectorizer', 'Extract Model2: TfidfVectorizer']}  customStyle="w-72 mr-0" customUlStyle="w-72 mr-0" 
                        onSelect={e=>result.text_feateng_operation = e} />

                    {/* <DropDown defaultText={'Select operation'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={[
                        'convert to lower case', 'expand contraction', 'remove punctuation', 'remove stopwords automatically', 'remove digits', 'lemmatization', 'stemming']}  
                        // 0                            1                        2                    3                                     4  
                    onSelect={e => {
                        result.text_feateng_option = e
                    }} /> */}
                    </div>:''}

                <div className="flex justify-end m-3 mt-10">
                    <Button text='Confirm' customStyle='h-6 w-24 py-1' onClick={async ()=>{
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
                            setCode(getCodeFromResult(option, result)) // demo code

                            $('#display_results').html(json.para_result)
                            document.getElementById("img").src = "data:image/png;charset=utf-8;base64,"+json.plot_url
       
                            dispatch(DataSetActions.setData({
                                cols: json.cols,
                                num_cols: json.num_cols,
                                cate_cols: json.cate_cols,
                            }))
                            dispatch(DataSetActions.setTableData(JSON.parse(json.data)))

                            clearData()
                            result.activeOption = option
                            result.cols = {}
                        }
                    }}/>
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-20 w-full items-center justify-start bg-gray-100 shadow-md">
            <div className='mx-5 w-8/12 flex justify-start'>
                <div className='w-72'>
                {/* ['Convert Cases', 'Convert Categorical to Numerical', 'Convert Numerical to Categorical', 'Standard Scaler', 'Minmax Scaler', 'Text Data: Feature Extraction Models']; */}
                {/* enabledOptionIndex={isTsv?[6]:[0,1,2,3,4,5]} */}
                    <DropDown  text={optionText} customStyle={'h-8 py-1 w-72'} customUlStyle={'w-72'} items={
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
                <div className='w-auto flex justify-center items-center px-1'>
                    <div className={``}>{activateStatus}</div>
                    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
                </div>

                <Button text={'Options'} disabled={!canOperation} customStyle={'h-6 w-48 ml-10 py-1'} onClick={()=>{
                    if(option>-1){
                        result.cols = {}
                        setShowOptionModal(true)
                    }
                }}/>
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
                        <div id = "display_results" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see preprocessed results</div>
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



        <Table PageSize={10}/>
    </div>)
}

export default FeatureEngineering