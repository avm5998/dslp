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
console.log(result)
let variable_X = []
let k = 0
debugger
for(let key of result){
    console.log(key)
    if(key == "variablesx"){
        variable_X.push[result[key]]
    }
}
return `
if tech in ["Correlation Matrix", 'Principal Component Analysis']:
if tech == "Correlation Matrix":
    featureResult = ndf.corr(method ='pearson')  # get correlations of each features in dataset
    featureResult = pd.DataFrame(data=featureResult)
    title = tech
    x_label, y_label = 'Features', 'Correlation'
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
          <Button buttonType="normal_r" text='Confirm' width="w-64" onClick={async ()=>{
            setShowModal(false)

            console.log(result.current);
            let res = await fetchByJSON('feature_selection',{filename:dataset.filename,...result.current})
            let json = await res.json()
            $('#display_results').html(json.para_result)
            document.getElementById("display_results_img").src = "data:image/png;charset=utf-8;base64,"+json.plot_url
          }} />
        </div>
      </div>
    </Modal>
    <div className="flex flex-row p-4 gap-4 items-center justify-start bg-gray-100 shadow-md">
      <Button buttonType="normal_r" text="Select operation" width="w-48" onClick={()=>{
        setShowModal(true)
      }}></Button>
      <Button buttonType="normal_r" disabled={true} text="Show code" width="w-48" onClick={()=>{
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