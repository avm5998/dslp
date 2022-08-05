import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, pythonEscape, useCachedData, toUnicode } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Modal } from '../../util/ui'
import { Button, MultiSelect, DropDown, ButtonGroup, Label } from '../../util/ui_components'
import { InlineTip } from '../common/tip';
import Table from '../common/table'
import { data } from 'autoprefixer';
import Tip from '../common/tip'
import Sandbox from '../common/sandbox'

const getInitialCode = (data) => `
import json
data_json = StringIO(r"""${toUnicode(data)}""")
df = pd.read_json(data_json)
`

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
# track all types of missing value
MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']

# store cleaning option(s)
cleaners = json.loads(${pythonEscape(JSON.stringify(conditions))})

# clean dataset based on selected option(s)
df.replace(MISSING_VALUES, np.nan, inplace = True)
${cleaners.join('\n')}

# display dataset after cleaning
# print(df)
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
    const [code, setCode] = useState('')
    let codeParent = useRef()
    let kernelRef = useRef()
    const dfJSON = useRef()
    const [activateStatus, setActivateStatus] = useState('Loading...')
    let cleaningCondition = useRef(getDefaultSubOptions())
    let [subOptionText, setSubOptionText] = useState('Input values')
    let [showSubOptionModal, setShowSubOptionModal] = useState(false)
    let dispatch = useDispatch()
    let sandboxRef = useRef(null)
    // let [previousCleaners, setPreviousCleaners] = useState([])
    // this "currentCleaner" hook only store the latest ONE applied cleaner filter
    let [currentCleaner, setCurrentCleaner] = useState([])

    // useEffect(() => {
    //     queryCleaner()
    // }, [dataset.dataCleaners])

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
                if(!dfJSON.current && g.data){
                    dfJSON.current = g.data
                }
                kernelRef.current = data.kernel
                // alert('X')
                data.kernel.requestExecute({ code:getInitialCode(dfJSON.current) })
                // setDfJSON(g.data)
                setActivateStatus('Ready')
            }
            // console.log("Status changed:", data.status, data.message);
        })

    }, [dataset.filename])

    const runCode = async (e) => {
        let res = await fetchByJSON('current_data_json', {
            filename: dataset.filename
        })

        let json = await res.json();
        // let res2 = await kernelRef.current.requestExecute({ code:getInitialCode(option,dfJSON.current) }).done

        document.querySelector('.thebelab-run-button').click()
    }

    const onConfirm = (e) => {
        if (option === -1) return

        // let cleaners = [...dataset.dataCleaners]
        // // let exist = filters.some(f => f.subOption === option && f.qString === qString)
        // // if (exist) return
        // cleaners.push({
        //     option: option,
        //     condition: cleaningCondition.current[option].condition,
        //     desc: CleanTypes[option]
        // })

        // if (guideStep == 2) {
        //     setGuideStep(3)
        // }
        // setCurrentCleaner(cleaners)

        dispatch(DataSetActions.setCleaners([...dataset.dataCleaners, ...currentCleaner]))
    }

    // const onRemove = async (e) => {
    //     let cleaners = []
    //     dispatch(DataSetActions.setCleaners(cleaners))
    //     setCurrentCleaner([])
    //     let res = await fetchByJSON('cleanEditedCache', {
    //         filename: dataset.filename
    //     })
    // }

    const onUndo = async (e) => {
        let res = await fetchByJSON('cleanEditedCache', {
            filename: dataset.filename
        })
        let json = await res.json()
        if (json.success) {
            let previous = dataset.dataCleaners.slice(0, -1)
            dispatch(DataSetActions.setCleaners(previous))
            setCurrentCleaner([])
            // dispatch(DataSetActions.setCleaners(previousCleaners))
            // setCurrentCleaner(previousCleaners)
            setCode(getCodeFromConditions({ conditions: previous }))
        }
    }

    const onRevert = async (e) => {
        if (dataset.filename) {
            let res = await fetchByJSON('cleanEditedCache', {
                filename: dataset.filename
            })

            let json = await res.json()

            if (json.success) {
                alert('Revert data success!')
                dispatch(DataSetActions.emptyInfo())
                // selectFileOption(dataset.filename, false)
            }
        }
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
        console.log(currentCleaner)
    }

    useEffect(() => {
        queryCleaner()
        setCode(getCodeFromConditions({ conditions: dataset.dataCleaners }))
    }, [dataset.dataCleaners])

    return (<div className='flex flex-col min-h-screen bg-gray-100'>
        {/* <Sandbox ref={sandboxRef} dataset={dataset} additional={`import json`} /> */}
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
                <DropDown id="dropdownClean" text={optionText} width='w-72' zIndex={100} items={
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

                            if (guideStep == 2) {
                                setGuideStep(3)
                            }
                            setCurrentCleaner([{option:i, condition: cleaningCondition.current[i].condition, desc: CleanTypes[i]}])
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

            <div className='w-auto flex justify-center items-center px-1'>
                <div className={``}>{activateStatus}</div>
                <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
            </div>

            <div className='mx-5 w-3/12'>
                <ButtonGroup
                    buttons={[{
                        text: 'Confirm',
                        onClick: onConfirm
                    }, 
                    // {
                    //     text: 'Run',
                    //     onClick: runCode
                    // },
                    // {
                    //     text: 'Show code',
                    //     onClick: () => {
                    //         sandboxRef.current.setCode(getCodeFromConditions({ conditions: dataset.dataCleaners }))
                    //         sandboxRef.current.show()
                    //     }
                    // }, 
                    // {
                    //     text: 'Remove',
                    //     onClick: onRemove
                    // }, 
                    {
                        text: 'Undo',
                        onClick: onUndo
                    },
                    {
                        text: 'Revert',
                        onClick: onRevert
                    }
                    ]}
                />
            </div>
        </div>

        {/* <div className='flex-grow-1 w-1/2' ref={codeParent}>
            {code ? code : <div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                Select a filter to see the corresponding code
            </div>}
        </div> */}

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
                    Select a filter to see the corresponding code
                </div>}
            </div>
        </div>

        <Table PageSize={10} />
    </div>)
}

export default Cleaning