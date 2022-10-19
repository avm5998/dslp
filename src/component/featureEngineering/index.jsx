import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, useCachedData, useSimpleForm,toUnicode } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal } from '../../util/ui'
import { DropDown, MultiSelect, Button, Label } from '../../util/ui_components'
import authHeader from '../../services/auth-header';

import Table from '../common/table'
// import Tip from '../common/tip'
import { InlineTip } from '../common/tip'
import { keyBy } from 'lodash';

const Options = {
    'ConvertCases': 'Convert Cases',
    'ConvertCategoricalToNumerical': 'Convert Categorical to Numerical',
    'ConvertNumericalToCategorical': 'Convert Numerical to Categorical',
    'CreateFeaturesByArithmeticOperations': 'Create Features by Arithmetic Operations',
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

# print(df.head())
`},
    [Options.ConvertCategoricalToNumerical]: (subOption) => {
        // console.log(subOption)
        return `
# Demo of "Convert Categorical to Numerical"

# column(s) will be affected
column = [${Object.values(subOption).map(e => `"${e}"`).join(',')}]

label = LabelEncoder()
for col in column:
    df[col] = label.fit_transform(df[col].astype(str))
print(df)
# print(df.head())
`},
    [Options.ConvertNumericalToCategorical]: (subOption) => {
        let column = []
        let bins = []
        let labels = []
        for(let key of Object.keys(subOption)){
            if(subOption[key]['checked']){
                column.push(key)
                bins.push(subOption[key]['bins'].replace("[","").replace("]","").split(','))
                labels.push(subOption[key]['label'].replace("[","").replace("]","").split(',').map(e => `"${e}"`))
            }
        }
        return `
# Demo of "Convert Numerical to Categorical"

columns = [${column.map(e => `"${e}"`).join(',')}]  # change to the column to be tested from dataset

bins = [${bins.map(e=>`[${e}]`).join(',')}]  # bins of "column"
labels = [${labels.map(e=>`[${e}]`).join(',')}]  # labels to be assigned to bins 

for column, bin, label in zip(columns, bins, labels):
    df[column] = pd.cut(df[column].astype(float), bins=bin, labels=label)
# print(df.head()) 
`},
    [Options.CreateFeaturesByArithmeticOperations]: (subOption) => {
        let values = Object.values(subOption)
        return `
# Demo of "Create Features By Arithmetic Operations"
col1_arithmetic = '${values[0]}'
operation = '${values[1]}'
col2_arithmetic = '${values[2]}'
new_colname = '${values[3]}'
ndf = df
if operation == '+':
    ndf[new_colname] = ndf[col1_arithmetic] + ndf[col2_arithmetic]
elif operation == '-':
    ndf[new_colname] = ndf[col1_arithmetic] - ndf[col2_arithmetic]
elif operation == '*':
    ndf[new_colname] = ndf[col1_arithmetic] * ndf[col2_arithmetic]
elif operation == '/':
    ndf[new_colname] = ndf[col1_arithmetic] / ndf[col2_arithmetic]
`},
    [Options.StandardScaler]: (subOption) => {
        let values = Object.values(subOption)
        return `
# Demo of "Standard Scaler"
cols = [${values.map(e => `'${e}'`).join(",")}]
stand_scaler_col=[]
for col in cols:
    stand_scaler_col.append(col)
print('stand_scaler_col= ', stand_scaler_col)
scaler = StandardScaler()
ndf[stand_scaler_col] = scaler.fit_transform(ndf[stand_scaler_col])
# print(ndf.head())
`},
    [Options.MinmaxScaler]: (subOption) => {
        let values = Object.values(subOption)
        return `
# Demo of "Minmax Scaler"
cols = [${values.map(e => `'${e}'`).join(",")}]
stand_scaler_col=[]
for col in cols:
    stand_scaler_col.append(col)
print('stand_scaler_col= ', stand_scaler_col)
scaler = MinMaxScaler()
ndf[stand_scaler_col] = scaler.fit_transform(ndf[stand_scaler_col])
# print(ndf.head())
`},
    [Options.TextDataFeatureCheckBasicFeatures]: (subOption) => {
        let values = Object.values(subOption).map(e => `'${e}'`)
        return `
# Demo of "Text Data: Check Basic Features"
basic_col = ${values[0]}
basic_operation = ${values[1]}
if basic_operation == 'check most common words':
    all_words=[]
    for msg in df[basic_col]:
        words=word_tokenize(msg)
        for w in words:
            all_words.append(w)
    #Frequency of Most Common Words
    frequency_dist=nltk.FreqDist(all_words)
    #Frequency Plot for first 100 most frequently occuring words
    frequency_dist.plot(100,cumulative=False)
elif basic_operation == 'visualize: wordcloud':
    wc = WordCloud(width=1000, height=1000, background_color="black", max_words=2000, random_state=42, max_font_size=30)
    wc.generate(' '.join(df[basic_col]))
    plt.imshow(wc)
    plt.axis("off")
elif basic_operation == 'words count':
    new_basic_col = basic_col + '_words_count'
    ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len(str(x).split(" ")))
elif basic_operation == "charactures count":
    new_basic_col = basic_col + '_charactures_count'
    ndf[new_basic_col] = ndf[basic_col].apply(len)
elif basic_operation == "average word length":
    def avg_word(sentence):
        words = sentence.split()
        return (sum(len(word) for word in words)/len(words)) if len(words)!=0 else 0
    new_basic_col = basic_col + '_average_word_length'
    ndf[new_basic_col] = ndf[basic_col].apply(lambda x: avg_word(x))
elif basic_operation == "stopwords count":
    stop = stopwords.words('english')
    new_basic_col = basic_col + '_stopwords_count'
    ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len([x for x in x.split() if x in stop]))
elif basic_operation == "numbers count":
    new_basic_col = basic_col + '_numbers_count'
    ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len([x for x in x.split() if x.isdigit()]))
elif basic_operation == "uppercase count":
    new_basic_col = basic_col + '_uppercase_count'
    ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len([x for x in x.split() if x.isupper()]))
`},
[Options.TextDataFeatureLabelValuesInColumns]: (subOption) => {
        let columns = Object.keys(subOption)
        let currVal = []
        let colname = []
        let newVal = []
        for(let key of columns){
            currVal.push(subOption[key]['Currval'].replace("[","").replace("]","").split(',').map(e => `"${e}"`))
            colname.push(subOption[key]['NewCol'].replace("[","").replace("]","").split(',').map(e => `"${e}"`))
            newVal.push(subOption[key]['NewVal'].replace("[","").replace("]","").split(',').map(e => `"${e}"`))
        }
    return `
# Demo of "Text Data Feature Label Values in Columns"
columns = [${columns.map(e => `"${e}"`).join(",")}]
col_currVal =[${currVal.map(e=>`[${e}]`).join(',')}]
new_colname = [${colname.map(e=>`[${e}]`).join(',')}]
col_newVal = [${newVal.map(e=>`[${e}]`).join(',')}]
for col, currVal, colname, newVal in zip(columns, col_currVal, new_colname, col_newVal) :
    new_feat_assigns = {}
    col_currVal_list = currVal.split(',')
    col_newVal_list = newVal.split(',')
    for uniq_val, new_label in zip(col_currVal_list, col_newVal_list):
        new_feat_assigns[uniq_val] = new_label
    ndf[colname] = ndf[col].apply(lambda x: new_feat_assigns.get[x])
`},
[Options.TextDataFeatureFeatureEngineering]: (subOption) => {
    let col = subOption['text_feateng_col']
    let operation = subOption['text_feateng_operation']
    return `
# Demo of "Text Data: Feature Engineering"
text_feateng_col = '${col}'
text_feateng_option = [${operation.map(e => `'${e}'`)}] 
if 'convert to lower case' in text_feateng_option:
    ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: " ".join(x.lower() for x in x.split()))
if 'expand contraction' in text_feateng_option:    
    ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: " ".join(contractions.fix(i) for i in x.split()))
if 'remove punctuation' in text_feateng_option:
    ndf[text_feateng_col] = ndf[text_feateng_col].str.replace('[^\w\s]','')
if 'remove stopwords automatically' in text_feateng_option:
    stop = stopwords.words('english')
    ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: " ".join(x for x in x.split() if x not in stop))
if 'remove digits' in text_feateng_option:
    ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: ''.join([i for i in x if not i.isdigit()]))
if 'Word Normalization1: lemmatization' in text_feateng_option:
    lemma = WordNetLemmatizer()
    ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: ' '.join(lemma.lemmatize(term, pos="v") for term in x.split()))           
if 'Word Normalization2: stemming' in text_feateng_option:
    ps=PorterStemmer()
    ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: ' '.join(ps.stem(term) for term in x.split()))           
if 'Extract Model1: CountVectorizer' in text_feateng_option:
    tf_vectorizer = CountVectorizer()
    tf = tf_vectorizer.fit_transform(ndf[text_feateng_col]).toarray()
    tf_feat_names = tf_vectorizer.get_feature_names()
if 'Extract Model2: TfidfVectorizer' in text_feateng_option:
    tfidf_vectorizer = TfidfVectorizer()
    tfidf = tfidf_vectorizer.fit_transform(ndf[text_feateng_col]).toarray()
    tfidf_feat_names = tfidf_vectorizer.get_feature_names()
`},
}

const getInitialCode = (option,dfJSON) => `
import numpy as np
import math
import matplotlib.pyplot as plt
import plotly.express as px

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

data_io = StringIO(r"""${toUnicode(dfJSON)}""")
df = pd.read_json(data_io)
`

const supportCode = `
import pandas as pd
import numpy as np
import math
import matplotlib.pyplot as plt
import plotly.express as px

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

import nltk
from nltk.tokenize import word_tokenize
nltk.download('punkt')

# replace <filename.csv> with the dataset you need
df = pd.read_csv('<filname.csv>')
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
    const dfJSON = useRef()
    const [activateStatus, setActivateStatus] = useState('Loading...')
    let [previousCondition, setPreviousCondition] = useState({})
    let [currentCondition, setCurrentCondition] = useState({})

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
      console.log('XXX',dfJSON.current)
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
                if(!dfJSON.current && g.data){
                  dfJSON.current = g.data
                }
                kernelRef.current = data.kernel
                let res2 = await data.kernel.requestExecute({ code:getInitialCode(option,dfJSON.current) }).done
                setActivateStatus('Ready')
            }
        })

    }, [dataset.filename])

    // useEffect(async () => {
    //     for (const cond of dataset.dataEngineering) {
    //         let res = await fetchByJSON('featureEngineering', cond) //send request
    //         let json = await res.json()
    //         setCode(getDisplayCode[cond.activeOption](cond.subOption))
    //         $('#display_results').html(json.para_result)
    //         document.getElementById("img").src = "data:image/png;charset=utf-8;base64," + json.plot_url
    //         dispatch(DataSetActions.setData({
    //             cols: json.cols,
    //             num_cols: json.num_cols,
    //             cate_cols: json.cate_cols,
    //             num_lists: json.num_lists,
    //             cate_lists: json.cate_lists,
    //             col_lists: json.col_lists,
    //         }))
    //         // dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
    //     }

    //     // for situation that the only preprocessing condition being deleted
    //     // if (dataset.dataEngineering.length === 0) {
    //     //     let res = await fetchByJSON('cleanEditedCache', {
    //     //         filename: dataset.filename
    //     //     })
    //     //     let json = await res.json()
    //     //     dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
    //     // }
    // }, [dataset.dataEngineering])

    const runCode = async (e) => {
        let res = await fetchByJSON('current_data_json', {
            filename: dataset.filename
        })

        let json = await res.json();
        let res2 = await kernelRef.current.requestExecute({ code:getInitialCode(option,dfJSON.current) }).done

        document.querySelector('.thebelab-run-button').click()
    }

    const onDownload = () => {
        const element = document.createElement('a')
        const file = new Blob([supportCode, code], {type: "text/plain"})
        element.href = URL.createObjectURL(file)
        element.download = "download_test.py" // or .txt
        document.body.appendChild(element)
        element.click()
    }

    const assignSubOption = useCallback((prop, entry) => {
        subOption.current[prop] ||= {};
        Object.assign(subOption.current[prop], entry)
    }, [subOption])

    let ts = new Date().getTime()
    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal isOpen={showOptionModal} onClose={() => {
        }} setIsOpen={setShowOptionModal} contentStyleText="mx-auto">
            <div className='p-2 flex flex-col' style={{maxWidth:'80vw'}}>
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
                            <input className='Bins mx-3 px-1 focus:outline-none rounded-full' placeholder='Bins: int or float list' onChange={e => assignSubOption(col, { bins: e.target.value })} />
                            <input className='mx-3 px-1 focus:outline-none rounded-full' placeholder='Labels: string list' onChange={e => assignSubOption(col, { label: e.target.value })} />
                        </React.Fragment>)}
                        <Label customStyleText={`w-100 mr-0`} text="eg. column 'Age', Bins=[0,2,17,65,99], Labels=[Toddler,Child,Adult,Elderly]" />
                        <Label customStyleText={`w-100 mr-0`} text="eg. column 'Survived', Bins=[0,1,2], Labels=[No,Yes] *Here 0~1 stands for No and 1~2 stands for Yes." />
                        <Label customStyleText={`w-100 mr-0`} text="*hint: Bins should always be greater by one than Labels in order to create lower bound and upper bound for the data." />
                    </div> : ''}

                {option === Options.CreateFeaturesByArithmeticOperations ?
                    <div className="flex gap-2">
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
                        <input className='Bins m-3 px-5 py-2 focus:outline-none rounded-full' placeholder='New Column Name' name='new_colname' onChange={e => subOption.current.new_colname = e.target.value} />
                    </div> : ''}

                {option === Options.StandardScaler ? <div>
                    <MultiSelect width="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e => subOption.current = e} />
                </div> : ''}


                {option === Options.MinmaxScaler ? <div>
                    <MultiSelect width="w-72 mr-0" defaultText={`Select columns to convert`} selections={dataset.num_cols} onSelect={e => subOption.current = e} />
                </div> : ''}

                {option === Options.TextDataFeatureCheckBasicFeatures ?
                    <div className="flex gap-2">
                        <DropDown defaultText={'Select column'} showOnHover={false} width={`w-64`} items={dataset.cate_cols}
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
                            <Checkbox label={col} name='suboption_checked_text' item={col} onChange={(e, checked) => assignSubOption(col, { checked })} />
                            <input className='Bins m-2 px-2 focus:outline-none rounded-full' placeholder='Current Values: string list' name={col + '_CurrVal'} onChange={e => assignSubOption(col, { Currval : e.target.value })} />
                            <input className='Bins m-2 px-2 focus:outline-none rounded-full' placeholder='New Column Name: string' name={col + '_NewCol'} onChange={e => assignSubOption(col, { NewCol : e.target.value })} />
                            <input className='m-2 px-2 focus:outline-none rounded-full' placeholder='New Values: string list' name={col + '_NewVal'} onChange={e => assignSubOption(col, { NewVal : e.target.value })} />
                        </React.Fragment>)}
                        <Label text=''></Label>
                        <Label customStyleText={`w-100 mr-0`} text="eg. current column 'publication', Current Values = [ Atlantic, National Review, Breitbart, New York Times],  New Column Name='politic lean', New Values=[ left, right, right, left]" />
                    </div> : ''}

                {option === Options.TextDataFeatureFeatureEngineering ?
                    <div className="flex flex-col gap-2">
                        <DropDown zIndex={100} width="w-30" defaultText={'Select column'} showOnHover={false} items={dataset.cate_cols}
                            onSelect={e => {
                                subOption.current.text_feateng_col = e
                            }} />
                        <MultiSelect zIndex={99} width="w-fill" defaultText={'Select one/multi-operation'} defaultOpen={false} selections={['convert to lower case', 'expand contraction', 'remove punctuation', 'remove stopwords automatically', 'remove digits', 'Word Normalization1: lemmatization', 'Word Normalization2: stemming', 'Extract Model1: CountVectorizer', 'Extract Model2: TfidfVectorizer']}
                            onSelect={e => subOption.current.text_feateng_operation = e} />
                    </div> : ''}

                <div className="flex justify-end mt-10">
                    <Button text='Confirm' width='w-24' customStyle={{padding:'auto'}} onClick={async () => {
                        if (JSON.stringify(previousCondition)==="{}") {
                            let prevres = await fetchByJSON('current_data_json', {filename: dataset.filename})
                            let prevjson = await prevres.json()
                            setPreviousCondition(JSON.parse(prevjson.data))
                        } else {
                            setPreviousCondition(currentCondition)
                        }

                        setShowOptionModal(false)
                        // let currentParam = {
                        //     subOption: {...subOption.current},
                        //     activeOption: option,
                        //     filename: dataset.filename
                        // }
                        // dispatch(DataSetActions.setEngineering([...dataset.dataEngineering, currentParam]))
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
                            num_lists: json.num_lists,
                            cate_lists: json.cate_lists,
                            col_lists: json.col_lists,
                        }))
                        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))

                        setCurrentCondition(JSON.parse(json.data))
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
            <Button text="Undo" width={'w-24 ml-3'} onClick={async () => {
                // kernelRef.current.requestExecute({ code:getInitialCode(option,dfJSON.current) })
                dispatch(DataSetActions.setTableData(previousCondition))
                setCurrentCondition(previousCondition)
                // let res = await fetchByJSON('cleanEditedCache', {
                //     filename: dataset.filename
                // })
                // let json = await res.json()
                // if (json.success) {
                //     let previous = dataset.dataEngineering.slice(0, -1)
                //     dispatch(DataSetActions.setEngineering(previous))
                // }
            }}/>
            <Button text='Revert' width='w-24 mx-3' onClick={
                async (e) => {
                    setCode('')
                    if (dataset.filename) {
                        let res = await fetchByJSON('cleanEditedCache', {
                            filename: dataset.filename
                        })
            
                        let json = await res.json()
            
                        if (json.success) {
                            alert('Revert data success!')
                            dispatch(DataSetActions.emptyInfo())

                            // selectFileOption(dataset.filename, false)
                            // replace the above function with the first part of selectFileOption() in /home/index.jsx
                            let res2 = await fetch('/file/?filename=' + dataset.filename + '&default=' + false, {
                                method: 'GET',
                                headers: authHeader()
                            })
                            let json2 = await res2.json()
                          
                            if (json2.success) {
                                dispatch(DataSetActions.setData({
                                    filname: dataset.filename,
                                    info: GetDataFrameInfo(json2.info),
                                    data: JSON.parse(json2.data),
                                    cols: json2.cols,
                                    num_cols: json2.num_cols,
                                    col_lists: json2.col_lists,
                                    cate_cols: json2.cate_cols,
                                    cate_lists: json2.cate_lists,
                                    num_lists: json2.num_lists
                                }))
                            }
                            
                            dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
                        }
                        // setCurrentCondition({})
                    }
                }
            } />
            <Button text='Download' width='w-30 mx-3' onClick={onDownload} />

        </div>

        <div className="w-full flex flex-nowrap">
            <div className='w-1/2 text-gray-500 font-semibold'>
                <div className='scroll w-full flex justify-center items-center' style={{height:'100%'}}>

                    <Label text="Results:">
                        <div id="display_results" style={{ whiteSpace: 'pre-wrap' }} >Select an operation to see preprocessed results</div>
                    </Label>
                    <Label text="">
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