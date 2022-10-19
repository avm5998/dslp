import placeholderImg from '../../assets/images/placeholder.jpg'
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, useCachedData, useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal } from '../../util/ui'
import { Button, MultiSelect, DropDown, Input, Label } from '../../util/ui_components'

import Table from '../common/table'
import { InlineTip } from '../common/tip';
import { result } from 'lodash';
import Sandbox from '../common/sandbox'

const getCodeFromResult = (result)=> function(){
let para = result.result
let k = -1
let variable_X = []
let target_Y = ""
let tech = -1
let plot_size = -1
let plot_type = -1
let specific_inputVal_lowVar = ""
let specific_inputVal_pca = ""
for(let key in para){
    let value = para[key]
    if(key == "k" && value)k = value
    if(key == "variablesx")variable_X = value
    if(key == "targety")target_Y = value
    if(key == "technique")tech = value
    if(key == "plotsize" && value)plot_size = value
    if(key == "plottype" && value)plot_type = value
    if(key == "specific_inputVal_lowVar" && value)specific_inputVal_lowVar = value
    if(key == "specific_inputVal_pca" && value)specific_inputVal_pca = value
}
if(k === -1){
    k = "len(X)"
}
if(specific_inputVal_lowVar === ""){
    specific_inputVal_lowVar = 0.3
}else{
    specific_inputVal_lowVar = float(specific_inputVal_lowVar)
}
if(plot_size === -1){
    plot_size = "5, 5"
}
if(plot_type != -1){
    let plotTypes = ['bar', 'scatter', 'line', 'heatmap']
    plot_type = plotTypes[plot_type]
}else{
    plot_type = 'bar'
}
if(specific_inputVal_pca === -1){
    specific_inputVal_pca = 2
}
if(tech != -1){
    if(tech === 0){
    let tech = "Variance Threshold: 1-True, 0-False"
    return `
from sklearn.feature_selection import VarianceThreshold
X = [${variable_X.map(e => `"${e}"`)}]
Y = "${target_Y}"
if Y:
    df = pd.concat([df[X], df[Y]], axis=1)
else:
    df = df[X]
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
X = df[X]
Y = df[Y]
plotSize = (${plot_size})
plotType = "${plot_type}"
thresh = float(${specific_inputVal_lowVar})
k = ${k}

fs = VarianceThreshold(threshold=thresh)
fs.fit(X)
featureResult = pd.DataFrame({"Features":X.columns ,"Boolean Result":fs.get_support()})
x_label, y_label, title = 'Features', 'Boolean Result', '${tech}'
featureResult['Boolean Result'] = featureResult['Boolean Result'].astype(int)
featureResult.plot(x=x_label, y=y_label, kind=plotType, color=(np.random.random_sample(), np.random.random_sample(), np.random.random_sample()), rot=0)
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()
        `
    }
    if(tech === 1){
    let tech = "Correlation Matrix"
    return`
import seaborn as sns

X = [${variable_X.map(e => `"${e}"`)}]
Y = "${target_Y}"
if Y:
    df = pd.concat([df[X], df[Y]], axis=1)
else:
    df = df[X]
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
X = df[X]
Y = df[Y]
plotSize = (${plot_size})
plotType = "${plot_type}"
thresh = float(${specific_inputVal_lowVar})

featureResult = df.corr(method ='pearson')  # get correlations of each features in dataset
featureResult = pd.DataFrame(data=featureResult)
title = "${tech}"
x_label, y_label = 'Features', 'Correlation'
plt.rcParams["figure.figsize"] = plotSize
if plotType == 'bar':
    featureResult.plot.bar()
elif plotType == 'scatter':
    sns.pairplot(featureResult) 
elif plotType == 'line':
    featureResult.plot.line()
elif plotType == 'heatmap':
    sns.heatmap(featureResult,annot=True,cmap="RdYlGn")
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()
`
    }
    if(tech === 2){
    let tech = "Regression1: Pearson’s Correlation Coefficient"
    return `
from sklearn.feature_selection import SelectKBest, f_regression

X = [${variable_X.map(e => `"${e}"`)}]
Y = "${target_Y}"
K = ${k}
if Y:
    df = pd.concat([df[X], df[Y]], axis=1)
else:
    df = df[X]
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
X = df[X]
Y = df[Y]
plotSize = (${plot_size})
plotType = "${plot_type}"
thresh = float(${specific_inputVal_lowVar})

fs = SelectKBest(score_func=f_regression, k=K)
fit = fs.fit(X, Y.values.ravel())
featureResult = pd.DataFrame({'Features': X.columns, 'Score': fit.scores_})
featureResult=featureResult.nlargest(K,'Score')  #print k best features
x_label, y_label, title = 'Features', 'Score', '${tech} Feature Score'
featureResult.plot(x=x_label, y=y_label, kind=plotType, color=(np.random.random_sample(), np.random.random_sample(), np.random.random_sample()), rot=0)
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()

`
    }
    if(tech === 3){
    let tech = "Classification1: ANOVA"
    return`

from sklearn.feature_selection import SelectKBest, f_classif

X = [${variable_X.map(e => `"${e}"`)}]
Y = "${target_Y}"
K = ${k}
if Y:
    df = pd.concat([df[X], df[Y]], axis=1)
else:
    df = df[X]
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
X = df[X]
Y = df[Y]
plotSize = (${plot_size})
plotType = "${plot_type}"
thresh = float(${specific_inputVal_lowVar})

fs = SelectKBest(score_func=f_classif, k=K)
fit = fs.fit(X, Y.values.ravel())
featureResult = pd.DataFrame({'Features': X.columns, 'Score': fit.scores_})
featureResult=featureResult.nlargest(K,'Score')  #print k best features
x_label, y_label, title = 'Features', 'Score', '${tech} Feature Score'
featureResult.plot(x=x_label, y=y_label, kind=plotType, color=(np.random.random_sample(), np.random.random_sample(), np.random.random_sample()), rot=0)
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()


`
    }
    if(tech === 4){
    let tech = "Classification2: Chi-Squared"
    return`
from sklearn.feature_selection import SelectKBest, chi2
    
X = [${variable_X.map(e => `"${e}"`)}]
Y = "${target_Y}"
K = ${k}
if Y:
    df = pd.concat([df[X], df[Y]], axis=1)
else:
    df = df[X]
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
X = df[X]
Y = df[Y]
plotSize = (${plot_size})
plotType = "${plot_type}"
thresh = float(${specific_inputVal_lowVar})

fs = SelectKBest(score_func=chi2, k=K)
fit = fs.fit(X, Y.values.ravel())
featureResult = pd.DataFrame({'Features': X.columns, 'Score': fit.scores_})
featureResult=featureResult.nlargest(K,'Score')  #print k best features
x_label, y_label, title = 'Features', 'Score', '${tech} Feature Score'
featureResult.plot(x=x_label, y=y_label, kind=plotType, color=(np.random.random_sample(), np.random.random_sample(), np.random.random_sample()), rot=0)
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()
`
    }
    if(tech === 5){
    let tech = "Classification3: Mutual Information"
    return`
from sklearn.feature_selection import SelectKBest, mutual_info_classif
    
X = [${variable_X.map(e => `"${e}"`)}]
Y = "${target_Y}"
K = ${k}
if Y:
    df = pd.concat([df[X], df[Y]], axis=1)
else:
    df = df[X]
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
X = df[X]
Y = df[Y]
plotSize = (${plot_size})
plotType = "${plot_type}"
thresh = float(${specific_inputVal_lowVar})

fs = SelectKBest(score_func=mutual_info_classif, k=K)
fit = fs.fit(X, Y.values.ravel())
featureResult = pd.DataFrame({'Features': X.columns, 'Score': fit.scores_})
featureResult=featureResult.nlargest(K,'Score')  #print k best features
x_label, y_label, title = 'Features', 'Score', '${tech} Feature Score'
featureResult.plot(x=x_label, y=y_label, kind=plotType, color=(np.random.random_sample(), np.random.random_sample(), np.random.random_sample()), rot=0)
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()
`
    }
    if(tech === 6){
        let tech = "Principal Component Analysis"
        return`
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
df = df.apply(pd.to_numeric,errors='ignore') # convert data type
plotType = "${plot_type}"
num_comp = int(${specific_inputVal_pca})
scaled_data = StandardScaler().fit_transform(df)
pca = PCA(n_components=num_comp)
pca_res = pca.fit_transform(scaled_data) 
col_pca= ["PC"+ str(i+1) for i in range(num_comp)]
pca_df = pd.DataFrame(data=pca_res, columns=col_pca)
featureResult = pd.concat([pca_df, Y], axis=1)
title = '${tech}'
x_label, y_label = 'Features', 'PC'
if plotType == 'bar':
    featureResult.plot.bar()
elif plotType == 'scatter':
    sns.pairplot(featureResult) 
elif plotType == 'line':
    featureResult.plot.line()
elif plotType == 'heatmap':
    sns.heatmap(featureResult,annot=True,cmap="RdYlGn")
plt.title(title)
plt.xlabel(x_label)
plt.ylabel(y_label)
plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
plt.rcParams["figure.figsize"] = plotSize
plt.show()
`
    }
}
return `
# Choose operation to see demo code
# Otherwise, fell free to play with Sandbox.
# Have a nice day!
`
}

const FeatureSelection = () => {
  useCachedData()

  let dataset = useSelector(state => state.dataset)
  let dispatch = useDispatch()
  let [showModal, setShowModal] = useState(true)
  let [showOptions_Input_lowVar, setShowOptions_Input_lowVar] = useState(false)
  let [showOptions_Input_pca, setShowOptions_Input_pca] = useState(false)
  let result = useRef({})
  let sandboxRef = useRef(null)

  return (<div className="flex flex-col min-h-screen bg-gray-100">
    <Modal setIsOpen={setShowModal} isOpen={showModal}>
      <div className="flex flex-col p-4 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className='flex items-center'>Variables X = <InlineTip info="Variables X can only be numerical" /></div>
          <MultiSelect zIndex={110} height="h-10" width="w-96" defaultText='Select Variable Columns' selections={dataset.num_cols} onSelect={e => result.current.variablesx = e} />
          <div className='flex items-center'>Target Y = <InlineTip info="Target Y can only be numerical" /></div>
          <DropDown zIndex={109} height="h-10" width="w-96" defaultText={'Select Target Column'} items={dataset.num_cols} onSelect={e => result.current.targety = e}></DropDown>
          <div className='flex items-center'>Select K=? Best Features <InlineTip info="Integer, must be smaller than the number of Variables X. Default: the number of Variables X" /> </div>
          <Input attrs={{ list: 'select_k_best', placeholder: 'K' }} onInput={(e, v) => result.current.k = v} />
          <datalist id="select_k_best_list"><option value="5"></option><option value="10"></option><option value="15"></option></datalist>
          <div className='flex items-center'>Feature selection technique</div>
          <DropDown zIndex={107} defaultText={'Select Technique'} height="h-10" width="w-96" items={
            // 0                                           1                               2                                           3                      4                                        5                                         6
            ['Removing Features with Low Variance', 'Correlation Matrix', 'Regression1: Pearson’s Correlation Coefficient', 'Classification1: ANOVA', 'Classification2: Chi-Squared', 'Classification3: Mutual Information', 'Principal Component Analysis']
              .map((name, i) => ({
                name,
                onClick(e) {
                  result.current.technique = i
                  if (i === 0 || i === 6) {
                    if (i === 0) {
                      setShowOptions_Input_pca(0)
                      setShowOptions_Input_lowVar(1)
                    }
                    if (i === 6) {
                      setShowOptions_Input_lowVar(0)
                      setShowOptions_Input_pca(1)
                    }
                  }
                  else {
                    setShowOptions_Input_lowVar(0)
                    setShowOptions_Input_pca(0)
                  }
                  return false
                }
              }))
          } />
          <Label customStyleText={`${showOptions_Input_lowVar ? '' : 'hidden'}`} text='Input Variance Threshold'><InlineTip info="Float. Default: 0.3" /></Label>
          <Input className={`${showOptions_Input_lowVar ? '' : 'hidden'}`}
            onInput={e => {
              result.current.specific_inputVal_lowVar = e.target.value
            }} />
          <Label customStyleText={`${showOptions_Input_pca ? '' : 'hidden'}`} text='Input Number of Components'><InlineTip info="Integer. Default: 2" /></Label>
          <Input className={`${showOptions_Input_pca ? '' : 'hidden'}`}
            onInput={e => {
              result.current.specific_inputVal_pca = e.target.value
            }} />
          <div className='flex items-center'>Plot size<InlineTip info="Adjust plot size (width, height). Default: 5,5" /></div>
          <Input attrs={{ list: 'plot_size', placeholder: 'Plot size' }} onInput={(e, v) => result.current.plotsize = v} />
          <div className='flex items-center'>Plot type<InlineTip info="Adjust plot type. Default: bar" /></div>
          <DropDown zIndex={105} defaultText={'Select plot type'} height="h-10" width="w-96" items={[
            'Bar', 'Scatter Plot', 'Line Graph', 'Heatmap'
          ]} onSelect={(e, i) => result.current.plottype = i} />
        </div>
        <div className="flex justify-end mt-10">
          <Button text='Confirm' width="w-64" onClick={async ()=>{
            setShowModal(false)

            console.log(result.current);
            let res = await fetchByJSON('feature_selection',{filename:dataset.filename,...result.current})
            let json = await res.json()
            let errorMsg = json['errorMsg']
            if(errorMsg && errorMsg != "''"){
                alert(errorMsg)
            }else{
              $('#display_results').html(json.para_result)
              document.getElementById("display_results_img").src = "data:image/png;charset=utf-8;base64,"+json.plot_url
            }
          }} />
        </div>
      </div>
    </Modal>
    <div className="button-style flex flex-row p-4 gap-4 items-center justify-start bg-gray-100 shadow-md">
      <Button text="Select operation" width="w-48" onClick={()=>{
        setShowModal(true)
      }}></Button>
      <Button disabled={true} text="Show code" width="w-48" onClick={()=>{
          sandboxRef.current.setCode(getCodeFromResult({ result: result.current }))
          sandboxRef.current.show()
      }}></Button>
    </div>

    <div className="flex flex-row mt-2 p-4 items-center justify-start bg-gray-100">
      <Sandbox ref={sandboxRef} dataset={dataset} additional={`import json`} />
    </div>

    <div className="flex flex-row p-4 items-center justify-start bg-gray-100">
      <div className="p-2">
        <img id="display_results_img" src="" />
      </div>
      <div className="p-2">
        <div id ="display_results" style={{ whiteSpace: 'pre-wrap' }} ></div>
      </div>
    </div>
  </div>)
}

export default FeatureSelection