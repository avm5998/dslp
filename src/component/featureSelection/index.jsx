import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo,useCachedData,useSimpleForm } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Checkbox, Modal, Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'
import { InlineTip } from '../common/tip';



const FS = () => {
    useCachedData()

    let [optionText, setOptionText] = useState('Select operation')
    // let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let [showSubOptionModal, setShowSubOptionModal] = useState(true)
    let dataset = useSelector(state => state.dataset)
    let dispatch = useDispatch()
    let {result,getData,input} = useSimpleForm({plottype:''})
    let [techinique,setTechnique] = useState(-1)

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <Modal fixedModalPosition={{
            left:'20vw',
            top:'10vh',
            width:'60vw'
        }} isOpen={showSubOptionModal} onClose={()=>{
        }} setIsOpen={setShowSubOptionModal}>
            <div className='p-5 flex flex-col'>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center'>Variables X = <InlineTip info="Variables X can only be numerical"/></div>
                    <MultiSelect customHeight={'h-10'} customWidth={'w-96'} defaultText='Select Variables X' wrapSelection={false} defaultOpen={false} selections={dataset.num_cols} onSelect={e=>result.variablesx = e}/>
                    <div className='flex items-center'>Target Y = <InlineTip info="Target Y can only be numerical"/></div>
                    <DropDown defaultText={'Select Target Y'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={dataset.num_cols} onSelect={e=>result.targety = e}/>
                    <div className='flex items-center'>Select K=? Best Features </div>
                    <input {...input} name="selectkbest" list="select_k_best_list" placeholder='K' className='px-5 py-2 focus:outline-none rounded-full w-96'/>
                    <datalist id="select_k_best_list"><option value="5"></option><option value="10"></option><option value="15"></option></datalist>
                    <div className='flex items-center'>Feature selection technique</div>
                    <DropDown defaultText={'Select Target Y'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={
                        ['Removing Features with Low Variance', 'Correlation Matrix','Regression1: Pearson’s Correlation Coefficient','Classification1: ANOVA','Classification2: Chi-Squared','Classification3: Mutual Information Classification','Principal Component Analysis']
                        .map((name,i)=>({
                            name,
                            onClick(e){
                                setTechnique(i)
                                result.technique = i
                                return false
                            }
                        }))
                    }/>
                    <div className='flex items-center'>Plot size</div>
                    <input {...input} list="plot_size" name="plotsize" placeholder='Plot size' className='px-5 py-2 focus:outline-none rounded-full w-96'/>
                    <datalist id="plot_size"><option value="8,6"></option><option value="10,8"></option><option value="5,5"></option></datalist>
                    <div className='flex items-center'>Plot type</div>
                    <DropDown defaultText={'Select Target Y'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={[
                        'Bar','Scatter Plot','Line Graph','Heatmap'
                    ]} onSelect={(e,i)=>result.plottype = i}/>
                    {/* <div className='flex items-center'>Finalize Variables X</div>
                    <DropDown defaultText={'Finalize Variables X'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={['No Finalized X',...dataset.cols]} onSelect={e=>result.finalizex = e}/>
                    <div className='flex items-center'>Finalize Variables Y</div>
                    <DropDown defaultText={'Finalize Variables Y'} showOnHover={false} customStyle={'h-10 w-96'} customUlStyle={'h-10 w-96'} items={['No Finalized Y',...dataset.cols]} onSelect={e=>result.finalizey = e}/> */}
                </div>
                <div className="flex justify-end mt-10">
                    <Button text='Confirm' customStyle='w-48 h-10 justify-self-end' onClick={()=>{
                        console.log(getData())
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
        <Table PageSize={10}/>
    </div>)
}

export default FS