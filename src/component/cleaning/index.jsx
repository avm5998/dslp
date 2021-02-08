import React, { useRef, useEffect, useCallback,useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Button, MultiSelect, DropDown } from '../../util/ui'
import Table from '../common/table'

const getQString = (subOption, condition)=>{
    return ''
}

const getDesc = (subOption,qString)=>{

}

const Cleaning = () => {
    let cleaningCondition = useRef({})
    let [subOption,setSubOption] = useState(-1)
    let [subOptionText, setSubOptionText] = useState('Select cleaning type')
    let dataset = useSelector(state => state.dataset)

    useEffect(()=>{
        queryCleaner()
    },[dataset.dataCleaners])

    const onConfirm = (e) => {
        if(subOption === -1) return
        let qString = getQString(subOption, cleaningCondition.current)
        let cleaners = [...dataset.dataCleaners]
        let exist = filters.some(f => f.subOption === subOption && f.qString === qString)
        if(exist) return
        cleaners.push({
            subOption,
            qString,
            desc:getDesc(subOption,qString)
        })

        dispatch(DataSetActions.setCleaners(cleaners))

    }

    const queryCleaner = async ()=>{
        let res = await fetchByJSON('/clean', {
            cleaners: JSON.stringify(dataset.cleaners),
            cacheResult: true,
            filename: dataset.filename
        })
        
        let json = await res.json()
        dispatch(DataSetActions.setData({
            data: JSON.parse(json.data),
            cols: json.cols,
            num_cols: json.num_cols,
            col_lists: json.col_lists,
            cate_cols: json.cate_cols,
            cate_lists: json.cate_lists,
            num_lists: json.num_lists
        }))
    }

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">

            <div className='mx-5 my-10 w-5/12'>
                <DropDown text={subOptionText} customStyle='h-10 w-72' customUlStyle={'w-72'} items={
                ['Remove N/A Rows','Remove N/A Columns','Replace N/A By Mean' ,'Replace N/A By Median','Replace N/A By Specific Value','Remove Outliers'].map((item,i)=>({name:item,onClick(e){
                {/*0                      1                2                       3                        4                            5 */}
                setSubOption(i)
                setSubOptionText(item)
            }}))} />
            </div>

            <div className='mx-5 my-10 w-5/12'>
                {(subOption === 2 || subOption === 3)?<MultiSelect selections={dataset.num_cols}
                onSelect={(e)=>{
                    cleaningCondition.current = e
                }}
                />:''}
                {/* {subOption === 4 ?
                <>
                <DropDown items={dataset.num_cols.map(e=>({
                    name:e,
                    onClick(){

                    }
                }))}/>
                <input/>
                </>
                :''} */}
            </div>

            <div className='mx-5 my-10 w-5/12'>
                <Button text='Confirm' onClick={onConfirm}/>
            </div>
        </div>
        <Table PageSize={10}/>
    </div>)
}

export default Cleaning