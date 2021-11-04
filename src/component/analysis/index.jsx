import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, getProp, useCachedData, useSimpleForm, useToggleGroup, toUnicode } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { actions as OptionActions } from '../../reducer/option'
import { actions as PresetActions } from '../../reducer/preset'
import { Checkbox, Modal, MultiSelect, Label, Input } from '../../util/ui'
import { DropDown, Button, ButtonGroup } from '../../util/ui_components';
import Table from '../common/table'
import Tip from '../common/tip'
import { InlineTip } from '../common/tip';
import LinearRegressionOptions from './option/regression/linearRegression'
import DecisionTreeRegressionOptions from './option/regression/decisiontreeRegression'
import RandomForestsRegressionOptions from './option/regression/randomforestsRegression'
import SVMRegressionOptions from './option/regression/svmRegression'
import LogisticRegressionOptions from './option/classification/logisticRegression'
import DecisionTreeClassifierOptions from './option/classification/decisiontreeClassifier'
import RandomForestClassifierOptions from './option/classification/randomforestClassifier'
import SVMClassifierOptions from './option/classification/svmClassifier'
import NaiveBayesClassifierOptions from './option/classification/bayesClassifier'
import KNeighborsClassifier from './option/classification/kNeighborsClassifier';
import KMeansOptions from './option/clustering/kmeans'
import AgglomerativeOptions from './option/clustering/agglomerative'
import AprioriOptions from './option/associate_rule/apriori'
import SARIMAOptions from './option/time_series_analysis/sarima'
import { construct } from 'core-js/fn/reflect';
import authHeader from "../../services/auth-header";
//cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js
//cdn.datatables.net/1.10.24/css/jquery.dataTables.min.css
const OptionModels = {
    regression: { 'Linear Regression': LinearRegressionOptions, 'Decision Tree Regression': DecisionTreeRegressionOptions, 'Random Forests Regression': RandomForestsRegressionOptions, 'SVM Regression': SVMRegressionOptions }, //DecisionTreeOptions, RandomForestsOptions, SuportVectorMachineOptions
    classification: { 'Logistic Regression': LogisticRegressionOptions, 'Decision Tree Classifier': DecisionTreeClassifierOptions, 'Random Forests Classifier': RandomForestClassifierOptions, 'SVM Classifier': SVMClassifierOptions, 'Naive Bayes Classifier': NaiveBayesClassifierOptions, 'K Nearest Neighbors Classifier': KNeighborsClassifier },
    clustering: { 'K-means': KMeansOptions },//, 'Agglometrative': AgglomerativeOptions},
    associate_rule: { 'Apriori': AprioriOptions },
    time_series_analysis: { 'Seasonal ARIMA': SARIMAOptions }
}

// const initialCode = data=>`import pandas as pd
// from io import StringIO
// import matplotlib.pyplot as plt
// import numpy as np
// import math
// import matplotlib.pyplot as plt
// import plotly.express as px

// data_json = StringIO(r"""${toUnicode(data)}""")
// df = pd.read_json(data_json) 
// print(df.head(5))
// `

const MethodSampleFile = {
    'regression': 'house_price_prediction_regression.csv',
    'classification': 'credit_card_default_classification.csv',
    'clustering': 'Mall_Customers_clustering.csv'
}

async function getSampleCodeData(filename, existing) {


}
const GetDisplayCode = (method) => {
    return optionCode[method]``
}

const getCodeFromResult = (option, model, result) => {
    return DisplayCode[model](result)
}
const InitialCode = {
    regression: code => `
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`,

    classification: code => `
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`
    ,

    clustering: code => `
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`,

    associate_rule: code => `
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
def transform_transaction(val):
    if val <= 0:
        return 0
    if val >= 1:
        return 1
df['Quantity']= 1

`,

time_series_analysis: code => `
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`
}

const DisplayCode = {
    'Linear Regression': code => (`
# Demo of Linear Regression
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.linear_model import LinearRegression

# multiple independent variales
X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = LinearRegression(fit_intercept=True, normalize=False) 

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
print("Measure performance of model with mean_absolute_error: ", mean_absolute_error(Y_test, Y_pred))
`),

    'Decision Tree Regression': code => `
# Demo of Decision Tree Regression
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.tree import DecisionTreeRegressor

# multiple independent variales
X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = DecisionTreeRegressor(criterion='mse', splitter='best', max_depth=3, max_features=None, max_leaf_nodes=None, random_state=None)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
print("Measure performance of model with mean_absolute_error: ", mean_absolute_error(Y_test, Y_pred))
`,

    'Random Forests Regression': code => `
# Demo of Random Forests Regression
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.ensemble import RandomForestRegressor

# multiple independent variales
X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = RandomForestRegressor(n_estimators=100, criterion='mse', max_depth=3, max_features='auto', max_leaf_nodes=None, random_state=None)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
print("Measure performance of model with mean_absolute_error: ", mean_absolute_error(Y_test, Y_pred))
`,

    'SVM Regression': code => `
# Demo of SVM Regression
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.svm import SVR

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = SVR(kernel='rbf', gamma=0.01, C=1.0)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
print("Measure performance of model with mean_absolute_error: ", mean_absolute_error(Y_test, Y_pred))
`,

    'Logistic Regression': code => `
# Demo of Logistic Regression
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split 
from sklearn.metrics import classification_report
from sklearn.linear_model import LogisticRegression

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = LogisticRegression(solver='lbfgs', C=1.0)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
report = classification_report(Y_test, Y_pred)
print("Measure performance of model with Classification Report: ", report)
`
    ,

    'Decision Tree Classifier': code => `
# Demo of Decision Tree Classifier
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split 
from sklearn.metrics import classification_report
from sklearn.tree import DecisionTreeClassifier

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = DecisionTreeClassifier(criterion='gini', max_depth=3, max_leaf_nodes=None) 

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
report = classification_report(Y_test, Y_pred)
print("Measure performance of model with Classification Report: ", report)
`
    ,
    'Random Forests Classifier': code => `
# Demo of Random Forests Classifier
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split 
from sklearn.metrics import classification_report
from sklearn.ensemble import RandomForestClassifier

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = RandomForestClassifier(max_depth=3, n_estimators=100, criterion='gini', max_leaf_nodes=None)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
report = classification_report(Y_test, Y_pred)
print("Measure performance of model with Classification Report: ", report)
`
    ,
    'SVM Classifier': code => `
# Demo of SVM Classifier
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split 
from sklearn.metrics import classification_report
from sklearn.svm import SVC

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = SVC(kernel='rbf', gamma=0.01, C=1.0)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
report = classification_report(Y_test, Y_pred)
print("Measure performance of model with Classification Report: ", report)
`
    ,
    'Naive Bayes Classifier': code => `
# Demo of Naive Bayes Classifier
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.model_selection import train_test_split 
from sklearn.metrics import classification_report
from sklearn.naive_bayes import GaussianNB

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)

# build a model, users can modify parameters
model = GaussianNB()

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)

# measure performance of model with metric
report = classification_report(Y_test, Y_pred)
print("Measure performance of model with Classification Report: ", report)
`
    ,
    'K Nearest Neighbors Classifier': function(code){
        let neighbors = 5;
        let weights = "uniform";
        let algorithm = "auto";
        let leaf_size = 30;
        let p = 2;
        let d_metric = "minkowski";
        if (code.neighbors !== ""){neighbors = code.neighbors}
        if (code.weights !== ""){weights = code.weights}
        if (code.algorithm !== ""){algorithm = code.algorithm}
        if (code.leaf_size !== ""){leaf_size = code.leaf_size}
        if (code.p !== ""){p = code.p}
        if (code.d_metric !== ""){d_metric = code.d_metric}
    return `
# Demo of K Nearest Neighbors Classifier
# Note: Only two variables "X" and "Y" are changed automatically based on user's option,
# other parameters are just example.
    
# import libraries
from sklearn.model_selection import train_test_split 
from sklearn.metrics import classification_report
from sklearn.neighbors import KNeighborsClassifier

X = [${code.finalVar.map(e => `'${e}'`).join(',')}]
# one dependent variable, our target variable
Y = '${code.finalY}'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=True)
    
# build a model, users can modify parameters
model = KNeighborsClassifier(n_neighbors=${neighbors},weights="${weights}", algorithm="${algorithm}", leaf_size=${leaf_size}, p=${p}, metric="${d_metric}")
    
# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
print("Print predicted results of testing dataset: ", Y_pred)
    
 # measure performance of model with metric
report = classification_report(Y_test, Y_pred)
print("Measure performance of model with Classification Report: ", report)
`
    }

    ,
    'K-means': code => `
# Demo of K-means
# Note: Only one variable "X" is changed automatically based on user's option,
# other parameters are just example.

# import libraries
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import seaborn as sns

# independent variales
X = [${code.variablesx.map(e => `'${e}'`).join(',')}]

# normalize dataset
scaled_data = StandardScaler().fit_transform(df[X]) 

# build a model, users can modify parameters
model = KMeans(n_clusters=3, init='k-means++', algorithm='auto', random_state=None)

# fit model to train
pred = model.fit(scaled_data)

# put predicted clusters into dataset
df['Clusters'] = pd.DataFrame(pred.labels_)
# concatenate clusters to original dataset
labeledData = pd.concat((df[X], df['Clusters']), axis=1)
# plot clusters
sns.pairplot(labeledData, hue='Clusters',palette='Paired_r')
`
    ,

    'Apriori': code => `
# Demo of Apriori
# Note: Only two variables "transid" and "transitem" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
from mlxtend.frequent_patterns import apriori, association_rules 

# one dependent variable, our target variable
transid = '${code.trans_id}'
transitem = '${code.trans_item}'
basket_data = df.groupby([transid, transitem])['Quantity'].sum().unstack().fillna(0)
df = basket_data.applymap(transform_transaction)

# call apriori to get frequent itemsets
frequent_itemsets = apriori(df, min_support=0.01, use_colnames=True)
print(frequent_itemsets)
# get association rules of frequent itemsets
rules = association_rules(frequent_itemsets, metric='support', min_threshold=0.01)
# filter rules based on conditions
rules = rules[((rules['confidence'] > 0.1) & (rules['lift'] > 1))]
print(rules)
`,

'Seasonal ARIMA': code => `
# Demo of Seasonal ARIMA
# Note: Only two variables "date_col" and "target_col" are changed automatically based on user's option,
# other parameters are just example.

# import libraries
import statsmodels.api as sm 

# get "date_col" variable, and our target variable "target_col"
date_col = '${code.finalX}'
target_col = '${code.finalY}'
time_series = df[target_col]
model = sm.tsa.statespace.SARIMAX(time_series, order=(0,1,0), seasonal_order=(1,1,1,12)).fit()
print(model.summary())
     
`
}


const Analysis = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select analytic method')
    let [modelText, setModelText] = useState('Select model')
    let [option, setOption] = useState(-1)
    let [model, setModel] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let [visibleModalTabs, setVisibleModalTabs] = useState([0, 1])
    let [optionButtonVisibility, setOptionButtonVisibility] = useState([1, 1, 1])
    let [currentPresetIndex, setCurrentPresetIndex] = useState(-1)
    let [dfJSON, setDfJSON] = useState('')//dataframe json
    let dataset = useSelector(state => state.dataset)
    let preset = useSelector(state => state.preset)
    let kernelRef = useRef()
    let [predictVisible, setPredictVisible] = useState(1)
    let dispatch = useDispatch()

    let { getData, result, input } = useSimpleForm({
        default_key: 'default_value'
    })


    let user = useSelector(state => state.auth).user
    let identifier = option + '#' + model
    let presets = getProp(preset, user.id, dataset.filename, identifier) || {}
    let presetsArr = Object.keys(presets)

    let codeParent = useRef()
    let { ref, hide: hideSelections } = useToggleGroup()
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

        // let res = await fetch('/file/?filename=' + MethodSampleFile[option] + '&default=' + 'true', {
        //     method: 'GET',
        //     headers: authHeader()
        // })

        let json = await res.json();

        let res2 = await kernelRef.current.requestExecute({ code: InitialCode[option](json.data) }).done

        document.querySelector('.thebelab-run-button').click()
    }

    useEffect(() => {
        result.analysis_option = option
        result.analysis_model = model

        //when option and model changes, set default preset
        // console.log(presetsArr.length ? presetsArr[presetsArr.length-1] : null);
        // setCurrentPreset(presetsArr.length ? presetsArr[presetsArr.length-1] : null)
    }, [option, model, preset])

    let submit = useCallback(async () => {
        dispatch(OptionActions.setOption(['analysis', option, model, { ...result }]))
        let res = await fetchByJSON(`analysis/${option}`, { ...result, filename: dataset.filename })   //send request
        let json = await res.json()     // receive request
        // console.log(json)
        // json.cond.replace(/&/g, ",  ")
        let errorMsg = json['errorMsg']
        if(errorMsg){
            alert(errorMsg)
        }else{
            setCode(getCodeFromResult(option, model, result))   // demo code
            $('#display_query').text(json.cond.trim())
            $('#display_results').html(json.para_result.trim())
            document.getElementById("img").src = "data:image/png;charset=utf-8;base64," + json.plot_url
            document.querySelector('#model_img_placeholder').classList.add('hidden')
            setShowSubOptionModal(false)
        }
        // console.log(json)   // print
    }, [result, option, model])

    let OptionView = OptionModels.hasOwnProperty(option) && OptionModels[option].hasOwnProperty(model) ? OptionModels[option][model] : e => <div></div>
    let currentPreset = currentPresetIndex > -1 && currentPresetIndex < presetsArr.length ? presetsArr[currentPresetIndex] : null;

    const selectPreset = (presetIndex, currentResult) => {
        setCurrentPresetIndex(presetIndex)
        dispatch(OptionActions.setOption(['analysis', option, model, { ...currentResult }]))
    }

    const updatePreset = () => dispatch(PresetActions.updatePreset({ userId: user.id, filename: dataset.filename, identifier, presetName: currentPreset, result }))

    const addPreset = () => {
        dispatch(PresetActions.addPreset({ userId: user.id, filename: dataset.filename, identifier, result }))
        setCurrentPresetIndex(presetsArr.length)
    }

    const clearPreset = () => {
        dispatch(PresetActions.clearPreset({ userId: user.id, filename: dataset.filename, identifier }))
        setCurrentPresetIndex(-1)
    }

    const deletePreset = (presetName) => {
        dispatch(PresetActions.deletePreset({ userId: user.id, filename: dataset.filename, identifier, presetName }))
        if (currentPresetIndex >= presetsArr.length) setCurrentPresetIndex(presetsArr.length - 1)
    }
    return (
        <div className='flex flex-col bg-gray-100' style={{ height: 'calc(100% - 4rem)' }}>
            <Modal fixedModalPosition={{
                left: '20vw',
                top: '10vh',
                width: '70vw'
            }} zIndex={11} isOpen={showSubOptionModal} onClose={() => {
                // let data = getData()
                // console.log(data)
            }} setIsOpen={setShowSubOptionModal}>
                <div style={{ zIndex: 1000 }} className="float-right flex justify-end items-center relative right-2 top-2 gap-4">
                    <div>
                        <DropDown zIndex={1000} items={presetsArr} defaultText={'No models'} defaultValue={currentPreset} onSelect={(e, i) => selectPreset(i, presets[e])} deletable={true} onDelete={(e) => {
                            deletePreset(e)
                        }} />
                    </div>
                    {optionButtonVisibility[0] ?
                        <div>
                            <Button width="w-40" text={'Clear models'} onClick={clearPreset} />
                        </div>
                        : null}
                    {optionButtonVisibility[1] ?
                        <div>
                            <Button width="w-40" text={'Update models'} onClick={updatePreset} />
                        </div>
                        : null}
                    {optionButtonVisibility[2] ?
                        <div>
                            <Button width="w-40" text={'Add model'} onClick={addPreset} />
                        </div>
                        : null}
                </div>
                <OptionView visibleTabs={visibleModalTabs} dataset={dataset} result={result} submit={submit} />
            </Modal>


            <div className="flex flex-row h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
                <div className='mx-5 w-12/12 w-full flex justify-between'>
                    <div className='flex flex-row'>
                        <div className='w-72'>
                            <DropDown ref={ref} text={optionText} width='w-72' items={
                                Object.keys(OptionModels).map((item, i) => ({
                                    name: item, onClick(e) {
                                        {/*   0                           1                            2                               3                 4    */ }
                                        setOption(item)
                                        setOptionText(item)
                                        setPredictVisible(item != 'clustering' && item != 'associate_rule')
                                        return false
                                    }
                                }))} />
                        </div>
                        <div className='w-72 mx-5'>
                            <DropDown ref={ref} zIndex={9} defaultText='Select model' width='w-72' items={
                                (OptionModels.hasOwnProperty(option) ? Object.keys(OptionModels[option]) : []).map((item, i) => ({
                                    name: item, onClick(e) {
                                        setModel(item)
                                        setModelText(item)
                                        setShowSubOptionModal(true)
                                        setVisibleModalTabs([0, 1])
                                        return false
                                    }
                                }))} />
                        </div>
                    </div>
                    
                    <div className='w-auto flex justify-center items-center px-1'>
                        <div className={``}>{activateStatus}</div>
                        <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
                    </div>

                    <div>
                        <ButtonGroup buttons={[
                            {
                                text: 'Training Model',
                                onClick: () => {
                                    if (model) {
                                        setOptionButtonVisibility([1, 1, 1])
                                        setShowSubOptionModal(true)
                                        setVisibleModalTabs([0, 1])
                                    }
                                }
                            },
                            {
                                text: 'Predict',
                                onClick: () => {
                                    if (model) {
                                        setOptionButtonVisibility([0, 0, 0])
                                        setShowSubOptionModal(true)
                                        setVisibleModalTabs([2]);
                                    }
                                },
                            },
                            {   
                                disabled:!code,
                                text: 'Run', 
                                onClick: runCode,
                            },
                        ]} />

                        {/* <Button onClick={() => {
                            runCode()
                        }} disabled={!code} width='w-32' text="SandBox Run" overrideClass={`ml-5  px-4 py-1 rounded font-semibold border focus:outline-none text-black cursor-pointer ${!code
                            ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} customStyle={{ backgroundColor: !!code ? '#4bd699' : 'inherit' }} onClick={runCode} hoverAnimation={false} /> */}
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-nowrap">
                <div className='w-1/2 text-gray-500 font-semibold'>
                    <div className='scroll'>
                        <Label customStyle="p-4 gap-8" itemPos="start" text="Model Conditions:" className='w-300'>
                            <div id="display_query" style={{ whiteSpace: 'pre-wrap' }} >Select a model to see the model conditions</div>
                        </Label>
                        <Label customStyle="p-4 gap-8" itemPos="start" text="Model Results:">
                            <div id="display_results" style={{ whiteSpace: 'pre-wrap' }} >Select a model to see the model results</div>
                        </Label>

                        <Label customStyle="p-4 gap-8" itemPos="start" text="Model Plot:">
                            <img id="img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
                            <div id="model_img_placeholder">Select a model to see the model plot</div>
                        </Label>
                    </div>
                </div>
                <div className='flex-grow-1 w-1/2' ref={codeParent}>
                    {code ? code : <div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                        Select a model to see the corresponding code
                    </div>}
                </div>
            </div>
        </div>


    )
}

export default Analysis

