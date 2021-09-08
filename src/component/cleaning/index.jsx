import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, pythonEscape, useCachedData } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Modal } from '../../util/ui'
import { Button, MultiSelect, DropDown, ButtonGroup } from '../../util/ui_components'
import Table from '../common/table'
import { data } from 'autoprefixer';
import Tip from '../common/tip'
import Sandbox from '../common/sandbox'

const getCodeFromConditions = ({ conditions }) => {
    let cleaners = []
for(let val of conditions){
    let { option,condition } =  val
    if (option == 0){
        cleaners.push(`df.dropna(axis = 0,inplace = True)`)
    }

    if (option == 1){
        cleaners.push(`df.dropna(axis = 1,inplace = True)`)
    }

    if (option == 2){
        let { cols,items } = condition
        for(let col of cols){
            cleaners.push(`df['${col}'].fillna(df['${col}'].astype(float).mean(), inplace=True)`)
        }
    }

    if (option == 3){
        let { cols,items } = condition
        for(let col of cols){
            cleaners.push(`df['${col}'].fillna(df['${col}'].astype(float).median(), inplace=True)`)
        }
    }

    if (option == 4){
        let { cols,items } = condition
        for(let item of items){
            cleaners.push(`df['${item.col}'].fillna(${Number.isNaN(Number(item.val))?`'${item.val}'`:item.val}, inplace=True)`)
        }
    }
}

return `
MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']
cleaners = json.loads(${pythonEscape(JSON.stringify(conditions))})
df.replace(MISSING_VALUES, np.nan, inplace = True)
${cleaners.join('\n')}
df
`
}

const CleanTypes = ['Remove N/A Rows', 'Remove N/A Columns', 'Replace N/A By Mean', 'Replace N/A By Median', 'Replace N/A By Specific Value'];

const CleanTypesStyles = ['', '', '', '', '', '', '']
//                        0                    1                       2                     3                          4                             5                   
const Cleaning = ({ location }) => {
    useCachedData()
    let multiSelect23Ref = useRef()
    let [option, setOption] = useState(-1)
    let [optionText, setOptionText] = useState('Select cleaning type')
    let dataset = useSelector(state => state.dataset)
    const getDefaultSubOptions = useCallback(() => {
        let res = [...Array(5).keys()].map(e => ({ condition: {} }))
        res[4].refs = {}
        return res
    }, [])
    let cleaningCondition = useRef(getDefaultSubOptions())
    let [subOptionText, setSubOptionText] = useState('Input values')
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dispatch = useDispatch()
    let sandboxRef = useRef(null)

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
        <Sandbox ref={sandboxRef} dataset={dataset} additional={`import json`} />
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
                        {dataset?.cols?.map(name => <div key={name} className="flex flex-row justify-between w-full">
                            <div className='py-3 px-10 label-left'>{name + ':'}</div>
                            <div className='py-3 label-right'>
                                <input ref={ref => cleaningCondition.current[4].refs[name] = ref} className='py-2 px-5 focus:outline-none rounded-full' placeholder="Specified Value" />
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
                            if (i === 4) {
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
                {(option === 4) ?
                    <>
                        <Button onClick={() => setShowSubOptionModal(s => !s)} text={subOptionText} width='w-64' />
                    </>
                    : ''}
            </div>

            <div className='mx-5 w-3/12'>
                <MultiSelect defaultText={`Applied cleaners`} allowDelete={false} passiveMode={true} selections={dataset.dataCleaners} getDesc={e => e.desc} />
            </div>

            <div className='mx-5 w-3/12'>
                <ButtonGroup
                    buttons={[{
                        text: 'Confirm',
                        onClick: onConfirm
                    }, {
                        text: 'Show code',
                        onClick: () => {
                            sandboxRef.current.setCode(getCodeFromConditions({ conditions: dataset.dataCleaners }))
                            sandboxRef.current.show()
                        }
                    }
                    ]}
                />
            </div>
        </div>
        <Table PageSize={10} />
    </div>)
}

export default Cleaning