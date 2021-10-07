import placeholderImg from '../../assets/images/placeholder.jpg'
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useCachedData,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Input, Label, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'
import { InlineTip } from '../common/tip';



const FS = () => {
    useCachedData()

    let [curImg, setCurImg] = useState(placeholderImg)
    let [optionText, setOptionText] = useState('Select operation')
    // let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let [showOptions_Input_lowVar, setShowOptions_Input_lowVar] = useState(false)
    let [showOptions_Input_pca, setShowOptions_Input_pca] = useState(false)

    let [showSubOptionModal, setShowSubOptionModal] = useState(true)
    let dataset = useSelector(state => state.dataset)
    let dispatch = useDispatch()
    let {result,getData,input} = useSimpleForm({plottype:''})
    let [techinique,setTechnique] = useState(-1)

    const submit =  async (e) => {
            let result = await fetchByJSON('feature_selection',{filename:dataset.filename,...getData()})
            let json = await result.json()
            $('#display_results').html(json.para_result)
            document.getElementById("img").src = "data:image/png;charset=utf-8;base64,"+json.plot_url

            // setCurImg('data:image/png;charset=utf-8;base64,' + json.plot_url)
    }

    // const submit = useCallback(()=>{
    //     (async function(){
    //         let result = await fetchByJSON('feature_selection',{filename:dataset.filename,...getData()})
    //         let json = await result.json()
    //         setCurImg('data:image/png;base64,' + json.base64)
    //     })()
    // },[])

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal fixedModalPosition={{
            left:'20vw',
            top:'10vh',
            width:'60vw'
        }} isOpen={showSubOptionModal} onClose={()=>{
        }} setIsOpen={setShowSubOptionModal}>
            <div className='p-4'>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center'>Variables X = <InlineTip info="Variables X can only be numerical"/></div>
                    <MultiSelect customHeight={'h-10'} customWidth={'w-96'} defaultText='Select Variable Columns' wrapSelection={false} defaultOpen={false} selections={dataset.num_cols} onSelect={e=>result.variablesx = e}/>
                    <div className='flex items-center'>Target Y = <InlineTip info="Target Y can only be numerical"/></div>
                    <DropDown defaultText={'Select Target Column'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={dataset.num_cols} onSelect={e=>result.targety = e}/>
                    <div className='flex items-center'>Select K=? Best Features <InlineTip info="Integer, must be smaller than the number of Variables X. Default: the number of Variables X"/> </div>
                    <input {...input} name="selectkbest" list="select_k_best_list" placeholder='K' className='px-5 py-2 focus:outline-none rounded-full w-82'/>
                    <datalist id="select_k_best_list"><option value="5"></option><option value="10"></option><option value="15"></option></datalist>
                    <div className='flex items-center'>Feature selection technique</div>

                   
                    <DropDown defaultText={'Select Technique'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={
                            // 0                                           1                               2                                           3                      4                                        5                                         6
                        ['Removing Features with Low Variance', 'Correlation Matrix','Regression1: Pearson’s Correlation Coefficient','Classification1: ANOVA','Classification2: Chi-Squared','Classification3: Mutual Information','Principal Component Analysis']
                        .map((name,i)=>({
                            name,
                            onClick(e){
                                setTechnique(i)
                                result.technique = i
                                if(i===0 || i===6){
                                    if(i===0){
                                        setShowOptions_Input_pca(0)
                                        setShowOptions_Input_lowVar(1)
                                    }
                                    if(i===6){
                                        setShowOptions_Input_lowVar(0)
                                        setShowOptions_Input_pca(1)
                                    }
                                }
                                else{
                                    setShowOptions_Input_lowVar(0)
                                    setShowOptions_Input_pca(0)
                                }
                                return false
                            }
                        }))
                    }/>
                    <Label customStyle={`${showOptions_Input_lowVar?'':'hidden'}`} text='Input Variance Threshold'><InlineTip info="Float. Default: 0.3"/></Label>
                    <Input className='px-5 py-2 focus:outline-none rounded-full w-82' customStyle={`${showOptions_Input_lowVar?'':'hidden'}`}  
                    onInput={e=>{
                        result.specific_inputVal_lowVar = e.target.value
                    }}/>
                    <Label customStyle={`${showOptions_Input_pca?'':'hidden'}`} text='Input Number of Components'><InlineTip info="Integer. Default: 2"/></Label>
                    <Input className='px-5 py-2 focus:outline-none rounded-full w-82' customStyle={`${showOptions_Input_pca?'':'hidden'}`}  
                    onInput={e=>{
                        result.specific_inputVal_pca = e.target.value
                    }}/>

                    <div className='flex items-center'>Plot size<InlineTip info="Adjust plot size (width, height). Default: 5,5"/></div>
                    <input {...input} list="plot_size" name="plotsize" placeholder='Plot size' className='px-5 py-2 focus:outline-none rounded-full w-82'/>
                    <datalist id="plot_size"><option value="8,6"></option><option value="10,8"></option><option value="5,5"></option></datalist>
                    <div className='flex items-center'>Plot type<InlineTip info="Adjust plot type. Default: bar"/></div>
                    <DropDown defaultText={'Select plot type'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={[
                        'Bar','Scatter Plot','Line Graph','Heatmap'
                    ]} onSelect={(e,i)=>result.plottype = i}/>
                </div>
                <div className="flex justify-end mt-10">
                    <Button text='Confirm' customStyle='w-48 h-10 justify-self-end' onClick={()=>{
                        submit()
                    }}/>
                </div>
            </div>
        </Modal>
        <div className="flex flex-row h-20 w-full items-center justify-start bg-gray-100 shadow-md">
            <div className='mx-5 w-8/12 flex justify-start'>
                <Button text={optionText} customStyle={'h-10 w-48 ml-10 py-0'} onClick={()=>{
                    setShowSubOptionModal(s=>!s)
                }}/>
                {/* <Button disabled={!dataset.dataFeatureSelection.length} text={'Cancel operation'} customStyle={'h-10 w-48 ml-10 py-0'} onClick={()=>{
                }}/> */}
            </div>

            <div className='mx-5 w-3/12'>
                {/* <MultiSelect defaultText={'Selected operation'} customHeight={`h-10`} selections={dataset.dataFeatureSelection} passiveMode={true} /> */}
            </div>
        </div>
        {/* <div className={`w-full h-full justify-center items-center flex p-10 `}>
            <img className={`h-auto w-auto`} src={curImg} alt="" />
          </div> */}
       
        <div className="h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
            <div className='mx-5 w-12 w-full justify-start'>
                <img id="img" src="" />
            </div>
        </div>
        <div className="h-auto w-full items-start justify-start bg-gray-100 shadow-md py-4 px-4 box-border">
            <div className='mx-5 w-12 w-full justify-start'>
                <div id = "display_results" style={{ whiteSpace: 'pre-wrap' }} ></div>
            </div>
        </div>
    </div>)
}

export default FS