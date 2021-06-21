import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, getProp, useCachedData, useSimpleForm, useToggleGroup, toUnicode} from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { actions as OptionActions } from '../../reducer/option'
import { actions as PresetActions } from '../../reducer/preset'
import { Checkbox, Modal, MultiSelect, Label, Input } from '../../util/ui'
import { DropDown, Button } from '../../util/ui_components';
import Table from '../common/table'
import Tip from '../common/tip'
import LinearRegressionOptions from './option/regression/linearRegression'
import DecisionTreeRegressionOptions from './option/regression/decisiontreeRegression'
import RandomForestsRegressionOptions from './option/regression/randomforestsRegression'
import SVMRegressionOptions from './option/regression/svmRegression'
import LogisticRegressionOptions from './option/classification/logisticRegression'
import DecisionTreeClassifierOptions from './option/classification/decisiontreeClassifier'
import RandomForestClassifierOptions from './option/classification/randomforestClassifier'
import SVMClassifierOptions from './option/classification/svmClassifier'
import NaiveBayesClassifierOptions from './option/classification/bayesClassifier'
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
    classification: { 'Logistic Regression': LogisticRegressionOptions, 'Decision Tree Classifier': DecisionTreeClassifierOptions, 'Random Forests Classifier': RandomForestClassifierOptions, 'SVM Classifier': SVMClassifierOptions, 'Naive Bayes Classifier': NaiveBayesClassifierOptions },
    clustering: { 'K-means': KMeansOptions },//, 'Agglometrative': AgglomerativeOptions},
    associate_rule: { 'Apriori': AprioriOptions },
    time_series_analysis: { 'SARIMA': SARIMAOptions },
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
    'regression':'house_price_prediction_regression.csv',
    'classification':'credit_card_default_classification.csv',
    'clustering':'Mall_Customers_clustering.csv'
}

async function getSampleCodeData(filename, existing) {


}
const GetDisplayCode = (method)=>{
    return optionCode[method]``
}

const InitialCode = {
    regression:code=>`
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`,

classification:code=>`
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`
,

clustering:code=>`
import pandas as pd
from io import StringIO
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`
}
const DisplayCode = {
    regression:code=>`
# example code for regression

# import libraries
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR

# read sample dataset 'house_price_prediction_regression.csv'
print(df.head(5))
#      date      price      bedrooms  bathrooms  sqft_living  sqft_lot  floors  ...
#0 2014-05-02   313000.0         3       1.50         1340      7912     1.5   
#1 2014-05-02  2384000.0         5       2.50         3650      9050     2.0   
#2 2014-05-02   342000.0         3       2.00         1930     11947     1.0   
#3 2014-05-02   420000.0         3       2.25         2000      8030     1.0   
#4 2014-05-02   550000.0         4       2.50         1940     10500     1.0   

# multiple independent variales
X = ['bedrooms','sqft_lot','yr_built']
# one dependent variable, our target variable
Y = 'price'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=False)
# build a model, users can modify parameters
# model 1: Linear Regression
model = LinearRegression(fit_intercept=True, normalize=False) 
# model 2: Decision Tree Regression, remove "#" to check
# model = DecisionTreeRegressor(criterion='mse', splitter='best', max_depth=3, max_features=None, max_leaf_nodes=None, random_state=None)
# model 3: Random Forests Regression, remove "#" to check
# model = RandomForestRegressor(n_estimators=100, criterion='mse, max_depth=3, max_features='auto', max_leaf_nodes=None, random_state=None)
# model 4: SVM Regression, remove "#" to check
# model = SVR(kernel='rbf', gamma=0.01, C=1.0)

# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
# print predicted results
print(Y_pred)
# run kfold to validate dataset
kfold = KFold(n_splits=10, random_state=7, shuffle=True)
# measure performance of model with metric
metric = "neg_mean_absolute_error" 
metric_res = cross_val_score(model, df[X], df[Y], cv=kfold, scoring=metric)
# print related statistics of metric
print("Metric:  " + metric + " mean=" + str(metric_res.mean()) + "; standard deviation=" + str(metric_res.std()))
`,

classification:code=>`

# example code for classification

# import libraries
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report

# read sample dataset 'credit_card_default_classification.csv'
print(df.head(5))
# multiple independent variales
X = ['X1']
# dependent variable, our target variable
Y = 'Y'
# split the dataset into two parts: training dataset and testing dataset
X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=False)
# build a model, users can modify parameters
# model 1: Logistic Regression
model = LogisticRegression(solver='lbfgs', C=1.0)
# model 2: Decision Tree Classifier, remove "#" to check
# model = DecisionTreeClassifier(criterion='gini', max_depth=3, max_leaf_nodes=None) 
# model 3: Random Forests Classifier, remove "#" to check
# model = RandomForestClassifier(max_depth=3, n_estimators=100, criterion='gini', max_leaf_nodes=None)
# model 4: SVM Classifier, remove "#" to check
# model = SVC(kernel='rbf', gamma=0.01, C=1.0)
# model 5: Naive Bayes Classifier, remove "#" to check
# model = GaussianNB()
# fit model to train, and predict testing dataset
Y_pred = model.fit(X_train, Y_train).predict(X_test) 
# print predicted results
print(Y_pred)
# measure performance of model with 'Classification Report'
report = classification_report(Y_test, Y_pred)
# print Classification Report
print(report)
`
,
clustering:code=>`
# example code for clustering

# import libraries
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans
import seaborn as sns

# read sample dataset "Mall_Customers.csv"
print(df.head(5))
#     CustomerID   Genre  Age  Annual Income (k$)  Spending Score (1-100)
# 0           1    Male   19                  15                      39
# 1           2    Male   21                  15                      81
# 2           3  Female   20                  16                       6
# 3           4  Female   23                  16                      77
# 4           5  Female   31                  17                      40

# independent variales
X = ['Genre', 'Age', 'Annual Income (k$)', 'Spending Score (1-100)']
# one hot code, use integer to represent categoriacl values
label = LabelEncoder()
df['Genre'] = label.fit_transform(df['Genre'])
# convert column 'Genre' to numeric data type
df['Genre'] = pd.to_numeric(df['Genre'], errors='coerce')
# check data type
# print(df.dtypes)
# normalize dataset
scaled_data = StandardScaler().fit_transform(df[X]) 
# print(scaled_data)
# build a model, users can modify parameters
model = KMeans(n_clusters=3, init='k-means++', algorithm='auto', random_state=None)
pred = model.fit(scaled_data)
df['Clusters'] = pd.DataFrame(pred.labels_)
count_val = df['Clusters'].value_counts()
print("Number of Points in Each Cluster:")
print(count_val)
labeledData = pd.concat((df[X], df['Clusters']), axis=1)
sns.pairplot(labeledData, hue='Clusters',palette='Paired_r')
`
}

// const DisplayCodeOld =  {
//     regression: code=>`${code}`
//     ,
//     classification:code=>
//     `
//     # read dataset "titanic.csv"
//     import pandas as pd
//     from io import StringIO
//     data_io = StringIO(r"""${code}""")
//     df = pd.read_json(data_io)

//     # example code for classification
//     # import libraries
//     from sklearn.model_selection import train_test_split, cross_val_score, KFold
//     from sklearn.linear_model import LogisticRegression
//     from sklearn.tree import DecisionTreeClassifier
//     from sklearn.ensemble import RandomForestClassifier
//     from sklearn.svm import SVC
//     from sklearn.metrics import classification_report


    
//     # independent variales
//     X = df[['Age']]
//     # dependent variable, our target variable
//     Y = df['Survived']
//     # split the dataset into two parts: training dataset and testing dataset
//     X_train, X_test, Y_train, Y_test = train_test_split(df[X], df[Y], test_size=0.3, random_state=0, shuffle=False)
//     # build a model, users can modify parameters
//     # model 1: Logistic Regression
//     model = LogisticRegression(solver='lbfgs', C=1.0)
//     # model 2: Decision Tree Classifier, remove "#" to check
//     # model = DecisionTreeClassifier(criterion='gini', max_depth=3, max_leaf_nodes=None) 
//     # model 3: Random Forests Classifier, remove "#" to check
//     # model = RandomForestClassifier(max_depth=3, n_estimators=100, criterion='gini', max_leaf_nodes=None)
//     # model 4: SVM Classifier, remove "#" to check
//     # model = SVC(kernel='rbf', gamma=0.01, C=1.0)
//     # model 5: Naive Bayes Classifier, remove "#" to check
//     # model = GaussianNB()
//     # fit model to train, and predict testing dataset
//     Y_pred = model.fit(X_train, Y_train).predict(X_test) 
//     # print predicted results
//     print(Y_pred)
//     # measure performance of model with 'Classification Report'
//     report = classification_report(Y_test, Y_pred)
//     # print Classification Report
//     print(report)

//     `
//     ,
//     clustering:
//     `
//     # example code for clustering
//     # import libraries
//     import pandas as pd
//     from sklearn.preprocessing import StandardScaler
//     from sklearn.cluster import KMeans
//     import seaborn as sns

//     # read dataset "Mall_Customers.csv"
//     df = pd.read('')
//     # independent variales
//     X = df[['Gender', 'Age', 'Annual Income (k$)', 'Spending Score (1-100)']]
//     scaled_data = StandardScaler().fit_transform(X) 
//     # build a model, users can modify parameters
//     model = KMeans(n_clusters=3, init='k-means++', algorithm='auto', random_state=None)
//     pred = model.fit(scaled_data)
//     df['Clusters'] = pd.DataFrame(pred.labels_)
//     count_val = df['Clusters'].value_counts()
//     print("Number of Points in Each Cluster: " + count_val)
//     labeledData = pd.concat((X_train, df['Clusters']), axis=1)
//     sns.pairplot(labeledData, hue='Clusters',palette='Paired_r')

//     `
//     ,
//     associate_rule:
//     `
//     # example code for associate_rule
//     # import libraries
//     import pandas as pd
//     from mlxtend.frequent_patterns import apriori, association_rules 

//     # read dataset "BreadBasket_DMS.csv"
//     df = pd.read('')
//     df['Quantity']= 1
//     basket_data = df.groupby(['Transaction','Item'])['Quantity'].sum().unstack().fillna(0)

//     def transform_transaction(val):
//         if val <= 0:
//             return 0
//         if val >= 1:
//             return 1
//     basket_sets = basket_data.applymap(transform_transaction)
//     print('basket_sets=', basket_sets)
//     frequent_itemsets = apriori(basket_sets, min_support=0.01, use_colnames=True)
//     print(frequent_itemsets)
//     rules = association_rules(frequent_itemsets, metric='support', min_threshold=0.01)
//     rules = rules[ ((rules['confidence'] > 0.1) & (rules['lift'] > 1) ]
//     print(rules)
//     `
    
// }

const Analysis = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select analytic method')
    let [modelText, setModelText] = useState('Select model')
    let [option, setOption] = useState(-1)
    let [model, setModel] = useState(-1)
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let [visibleModalTabs, setVisibleModalTabs] = useState([0, 1])
    let [currentPresetIndex, setCurrentPresetIndex] = useState(-1)
    let [dfJSON,setDfJSON] = useState('')//dataframe json
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
    const [code,setCode] = useState('')

    useEffect(()=>{
        if(!code) return
        codeParent.current.innerHTML = ''
        let pre = document.createElement('pre')
        pre.setAttribute('data-executable','true')
        pre.setAttribute('data-language','python')
        codeParent.current.appendChild(pre)
        pre.innerHTML = code
        thebelab.bootstrap();

        thebelab.on("status", async function (evt, data) {
            if(data.status === 'ready'){
                kernelRef.current = data.kernel
                // alert('Ready')
                // setActivateStatus('Ready')
            }
        })
    },[code])

    const runCode = async (e)=>{
        let res = await fetch('/file/?filename=' + MethodSampleFile[option]+'&default='+'true', {
            method: 'GET',
            headers: authHeader()
        })

        let json = await res.json();

        let res2 = await kernelRef.current.requestExecute({code:InitialCode[option](json.data)}).done

        document.querySelector('.thebelab-run-button').click()
    }

    useEffect(() => {
        result.analysis_option = option
        result.analysis_model = model

        //when option and model changes, set default preset
        // console.log(presetsArr.length ? presetsArr[presetsArr.length-1] : null);
        // setCurrentPreset(presetsArr.length ? presetsArr[presetsArr.length-1] : null)
    }, [option, model,preset])

    let submit = useCallback(async () => {
        dispatch(OptionActions.setOption(['analysis', option, model, { ...result }]))
        let res = await fetchByJSON(`analysis/${option}`, { ...result, filename: dataset.filename })   //send request
        let json = await res.json()     // receive request

        // json.cond.replace(/&/g, ",  ")
        $('#display_query').text(json.cond)
        $('#display_results').html(json.para_result)
        document.getElementById("img").src = "data:image/png;charset=utf-8;base64," + json.plot_url
        setShowSubOptionModal(false)
        // console.log(json)   // print
    }, [result, option, model])

    let OptionView = OptionModels.hasOwnProperty(option) && OptionModels[option].hasOwnProperty(model) ? OptionModels[option][model] : e => <div></div>
    let currentPreset = currentPresetIndex>-1 && currentPresetIndex<presetsArr.length?presetsArr[currentPresetIndex]:null;

    const selectPreset = (presetIndex,currentResult) => {
        setCurrentPresetIndex(presetIndex)
        dispatch(OptionActions.setOption(['analysis', option, model, { ...currentResult }]))
    }

    const updatePreset = () => dispatch(PresetActions.updatePreset({ userId: user.id, filename: dataset.filename, identifier, presetName:currentPreset,result }))

    const addPreset = () => {
        dispatch(PresetActions.addPreset({ userId: user.id, filename: dataset.filename, identifier, result }))
        setCurrentPresetIndex(presetsArr.length)
    }

    const clearPreset = () => {
        dispatch(PresetActions.clearPreset({ userId: user.id, filename: dataset.filename, identifier }))
        setCurrentPresetIndex(-1)
    }

    const deletePreset = (presetName)=>{
        dispatch(PresetActions.deletePreset({ userId: user.id, filename: dataset.filename, identifier, presetName }))
        if(currentPresetIndex >= presetsArr.length) setCurrentPresetIndex(presetsArr.length - 1)
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
                <div style={{zIndex:1000}} className="float-right flex justify-end items-center relative right-2 top-2 gap-4">
                    <div>
                        <DropDown zIndex={1000} items={presetsArr} defaultText={'No models'} defaultValue={currentPreset} onSelect={(e,i) => selectPreset(i,presets[e])} deletable={true} onDelete={(e)=>{
                            deletePreset(e)
                        }} />
                    </div>
                    <div>
                        <Button width="w-40" text={'Clear models'} onClick={clearPreset} />
                    </div>
                    <div>
                        <Button width="w-40" text={'Update model'} onClick={updatePreset} />
                    </div>
                    <div>
                        <Button width="w-40" text={'Add model'} onClick={addPreset} />
                    </div>
                </div>
                <OptionView visibleTabs={visibleModalTabs} dataset={dataset} result={result} submit={submit} />
            </Modal>


            <div className="flex flex-row h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
                <div className='mx-5 w-12/12 w-full flex justify-start'>
                    <div className='w-72'>
                        <DropDown ref={ref} text={optionText} width='w-72' items={
                            Object.keys(OptionModels).map((item, i) => ({
                                name: item, onClick(e) {
                                    {/*   0                           1                            2                               3                 4    */ }
                                    setOption(item)
                                    setOptionText(item)
                                    setPredictVisible(item != 'clustering' && item != 'associate_rule' && item != 'time_series_analysis')
                                    return false
                                }
                            }))} />
                    </div>
                    <div className='w-72 mx-5'>
                        <DropDown ref={ref} defaultText='Select model' width='w-72' items={
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
                    <Button text={'Training Model'} width='w-65' onClick={() => {

                        if (model) {
                            setShowSubOptionModal(true)
                            setVisibleModalTabs([0, 1])
                        }
                    }} />

                    <Button text={'Predict'} width='w-60' customStyleText={`ml-5 ${predictVisible ? '' : 'hidden'}`} onClick={() => {
                        if (model) {

                            setShowSubOptionModal(true)
                            setVisibleModalTabs([2]);
                        }
                    }} />

                    <Button text={'Display Sandbox Code'} width='w-65' onClick={async () =>  {
                        setCode(DisplayCode[option](''))
                    }} />

                    <Button onClick={()=>{
                        runCode()
                    }} hasPadding={false} disabled={!code} text="SandBox Run" overrideClass={`w-40 rounded font-semibold border focus:outline-none h-10 text-black cursor-pointer ${!code
                        ? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`} onClick={runCode} hoverAnimation={false} />

                </div>
            </div>
            
          

            <div className='flex-grow-1 w-full' ref={codeParent}>
                {code?code:<div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                    Select a model to see the corresponding code
                </div>}
            </div>


            <div className=" w-full">
                <div className='mx-5 w-12 w-full justify-start'>
                    <Label text="Model Conditions:" className='w-300'>
                        <div id="display_query" style={{ whiteSpace: 'pre-wrap' }} ></div>
                    </Label>
                </div>
            </div>

            <div className="h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
                <div className='mx-5 w-12 w-full justify-start'>
                    <Label text="Model Results:">
                        <div id="display_results" style={{ whiteSpace: 'pre-wrap' }} ></div>
                    </Label>
                </div>
            </div>

            <div className="h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
                <div className='mx-5 w-12 w-full justify-start'>
                    <Label text="Model Plot:">
                        <img id="img" src="" />
                    </Label>
                </div>
            </div>

        </div>
      

    )
}

export default Analysis

