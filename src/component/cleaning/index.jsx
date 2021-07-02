import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, useCachedData } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Modal } from '../../util/ui'
import { Button, MultiSelect, DropDown } from '../../util/ui_components'
import Table from '../common/table'
import { data } from 'autoprefixer';
import Tip from '../common/tip'

const CleanTypes = ['Remove N/A Rows', 'Remove N/A Columns', 'Replace N/A By Mean', 'Replace N/A By Median', 'Replace N/A By Specific Value', 'Remove Outliers'];

const CleanTypesStyles = ['', '', '', '', '', '', '']
//                        0                    1                       2                     3                          4                             5                   
const Cleaning = ({ location }) => {
    useCachedData()
    let multiSelect23Ref = useRef()
    let [option, setOption] = useState(-1)
    let [optionText, setOptionText] = useState('Select cleaning type')
    let dataset = useSelector(state => state.dataset)
    const getDefaultSubOptions = useCallback(() => {
        let res = [...Array(6).keys()].map(e => ({ condition: {} }))
        res[4].refs = {}
        res[5].aboveRefs = {}
        res[5].belowRefs = {}
        return res
    }, [])
    let cleaningCondition = useRef(getDefaultSubOptions())
    let [subOptionText, setSubOptionText] = useState('Input values')
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dispatch = useDispatch()

    useEffect(() => {
        queryCleaner()
    }, [dataset.dataCleaners])

    const onConfirm = (e) => {
        if (option === -1) return

        let cleaners = [...dataset.dataCleaners]
        // let exist = filters.some(f => f.subOption === option && f.qString === qString)
        // if (exist) return
        cleaners.push({
            option: option,
            condition: cleaningCondition.current[option].condition,
            desc: CleanTypes[option]
        })

        if (guideStep == 2) {
            setGuideStep(3)
        }

        dispatch(DataSetActions.setCleaners(cleaners))
    }

    const [guideStep, setGuideStep] = useState(0)
    useEffect(() => {
        console.log(guideStep);
        switch (guideStep) {
            case 0:
                if (location.state?.guide) {
                    document.querySelector('#dropdownClean').classList.add('btn-blink')
                    setGuideStep(1)
                }
                break
            case 1:
                break
            case 2:
                document.querySelector('#dropdownClean').classList.remove('btn-blink')
                document.querySelector('#confirmBtn').classList.add('btn-blink')
                break
            case 3:
                document.querySelector('#confirmBtn').classList.remove('btn-blink')
                break
        }
    }, [guideStep])

    const onConfirmSubOption = () => {
        if (option === 4) {
            let items = []
            let refs = cleaningCondition.current[4].refs
            for (let p in refs) {
                let value = refs[p].value

                if (value)
                    items.push({
                        col: p,
                        val: refs[p].value
                    })
            }
            cleaningCondition.current[4].condition.items = items
            if (items.length) setSubOptionText('Edit values')
        } else if (option === 5) {
            let itemObj = {}
            let belowRefs = cleaningCondition.current[5].belowRefs
            let aboveRefs = cleaningCondition.current[5].aboveRefs

            for (let p in belowRefs) {
                let value = belowRefs[p].value

                if (value) {
                    itemObj[p] = itemObj[p] || {}
                    itemObj[p].below = value
                }
            }

            for (let p in aboveRefs) {
                let value = aboveRefs[p].value

                if (value) {
                    itemObj[p] = itemObj[p] || {}
                    itemObj[p].above = value
                }
            }

            if (Object.keys(itemObj).length) setSubOptionText('Edit values')

            let items = []
            for (let key in itemObj) {
                items.push({
                    col: key,
                    above: itemObj[key].above,
                    below: itemObj[key].below,
                })
            }

            cleaningCondition.current[5].condition.items = items
        }

        setShowSubOptionModal(false)
    }

    const queryCleaner = async () => {
        let res = await fetchByJSON('clean', {
            cleaners: JSON.stringify(dataset.dataCleaners),
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

    useEffect(() => {
        queryCleaner()
    }, [dataset.dataCleaners])

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        {/* <Tip info={{
            '#confirmBtn':'Just confirm your data',
            // '#dropdownClean':`What is data cleaning?
            // Data cleaning is the process of fixing or removing incorrect, corrupted, incorrectly formatted, duplicate, or incomplete data within a dataset.
            // When combining multiple data sources, there are many opportunities for data to be duplicated or mislabeled. If data is incorrect, outcomes and algorithms are unreliable, even though they may look correct. There is no one absolute way to prescribe the exact steps in the data cleaning process because the processes will vary from dataset to dataset. But it is crucial to establish a template for your data cleaning process so you know you are doing it the right way every time.`,
    }}/> */}
        <Modal isOpen={showSubOptionModal} setIsOpen={setShowSubOptionModal} onClose={onConfirmSubOption} contentStyleText="mx-auto mt-20" style={{ maxWidth: '35%' }}>
            <div className='p-5 flex flex-col'>
                <div className="flex flex-col">
                    <div className={`${option === 4 ? '' : 'hidden'}`}>
                        {dataset.cols.map(name => <div key={name} className="flex flex-row justify-between w-full">
                            <div className='py-3 px-10 label-left'>{name + ':'}</div>
                            <div className='py-3 label-right'>
                                <input ref={ref => cleaningCondition.current[4].refs[name] = ref} className='py-2 px-5 focus:outline-none rounded-full' placeholder="Specified Value" />
                            </div>
                        </div>)}
                    </div>
                    <div className={`${option === 5 ? '' : 'hidden'}`}>
                        {dataset.num_cols.map(name => <div key={name} className="inline-block w-full">
                            <div className='py-3 px-10 inline-block float-left'>{name + ':'}</div>
                            <div className='py-3 inline-block float-right'>
                                <select ref={ref => cleaningCondition.current[5].belowRefs[name] = ref} className='py-2 px-5 focus:outline-none rounded-full' placeholder="Remove Below">
                                    <option value="">-</option><option value="5%">5%</option><option value="10%">10%</option><option value="15%">15%</option>
                                </select>
                            </div>
                            <div className='py-3 inline-block float-right'>
                                <select ref={ref => cleaningCondition.current[5].aboveRefs[name] = ref} className='py-2 px-5 focus:outline-none rounded-full' placeholder="Remove Above">
                                    <option value="">-</option><option value="85%">85%</option><option value="90%">90%</option><option value="95%">95%</option>
                                </select>
                            </div>
                        </div>)}
                    </div>


                </div>
                <div className="flex justify-end m-3 mt-10">
                    <Button text='Confirm' customStyleText='bordered-light' onClick={onConfirmSubOption} />
                </div>
            </div>
        </Modal>

        <div className="flex flex-row h-20 w-full items-center justify-start bg-gray-100 shadow-md">

            <div className='mx-5 w-3/12'>
                <DropDown id="dropdownClean" text={optionText} width='w-72' items={
                    CleanTypes.map((item, i) => ({
                        name: item, onClick(e) {
                            {/*0                      1                2                       3                        4                            5 */ }
                            setOption(i)
                            setOptionText(item)
                            if (multiSelect23Ref.current) {
                                multiSelect23Ref.current.clear()
                            }
                            if (i === 4 || i === 5) {
                                setShowSubOptionModal(true)
                            }
                            if (guideStep == 1) {
                                setGuideStep(2)
                            }
                        }
                    }))} />
            </div>
            <div className='mx-5 w-3/12'>
                {/* Select a column and apply a cleaner */}
                {(option === 2 || option === 3) ? <MultiSelect ref={multiSelect23Ref} customHeight={`h-10`} selections={dataset.num_cols}
                    onSelect={(e) => {
                        cleaningCondition.current[option].condition.cols = e
                    }}
                /> : ''}


                {/* Replace N/A By Specific Value, open a modal which contains col names and inputs */}
                {/* Remove Outliers, open a modal which contains col names and inputs */}
                {(option === 4 || option === 5) ?
                    <>
                        <Button onClick={() => setShowSubOptionModal(s => !s)} text={subOptionText} customStyle={'h-10 w-60 ml-10'} />
                    </>
                    : ''}
            </div>

            <div className='mx-5 w-3/12'>
                <MultiSelect defaultText={`Applied cleaners`} allowDelete={false} passiveMode={true} selections={dataset.dataCleaners} getDesc={e => e.desc} />
            </div>

            <div className='mx-5 w-3/12'>
                <Button width="w-64" id='confirmBtn' text='Confirm' onClick={onConfirm} />
            </div>
        </div>
        <Table PageSize={10} />
    </div>)
}

export default Cleaning