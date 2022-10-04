import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { Modal, RangeSelector } from '../../util/ui'
import { Button, Input, DropDown, MultiSelect, ButtonGroup, Label } from '../../util/ui_components'
import { useDispatch, useSelector } from 'react-redux'
import { pythonEscape, fetchByJSON, GetDataFrameInfo, useCachedData, toUnicode } from '../../util/util'
import { actions as DataSetActions } from '../../reducer/dataset'
import { useTable, usePagination, useSortBy } from 'react-table'
import { InlineTip } from '../common/tip';
import Table from '../common/table'
import authHeader from '../../services/auth-header';
import './index.css'
import Help from '../common/help'
import Sandbox from '../common/sandbox'
const NumericComparators = ['<', '=', '>']
const CategoricalComparators = ['=']
const QueryType = {
    Numerical: 1,
    Categorical: 2
}

const getQString = (type, numQuery = { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }, cateQuery = [], searchColumn) => {
    if (type === QueryType.Numerical) {
        return JSON.stringify({
            min: numQuery.min, max: numQuery.max, column: numQuery.column
        })
    }

    if (type === QueryType.Categorical) {
        cateQuery.sort()

        return JSON.stringify({
            column: searchColumn,
            cates: cateQuery
        })
    }
}

const getCodeFromConditions = ({conditions})=>{
let queries = []
for(let condition of conditions){
    let { queryType,qString } = condition
    if ( queryType == 2 ){
        let { column, cates } = JSON.parse(qString);
        queries.push(`${column} in [${cates.map(cate=>`"${cate}"`).join(',')}]`)
    }else if( queryType == 1 ){
        let { min,max,column } = JSON.parse(qString);

        if (min!==undefined){
            queries.push(`${column} >= ${min}`)
        }
        
        if (max!==undefined){
            queries.push(`${column} <= ${max}`)
        }
    }
}

return `
# store query option(s)
filters = json.loads(${pythonEscape(JSON.stringify(conditions))})

# query dataset based on selected option(s)
${queries.map(q=>`df.query('''${q}''',inplace = True)`).join('\n')}

# display dataset after querying
# print(df)
`
}

const getInitialCode = (data) => `
import pandas as pd
import numpy as np
import json
from io import StringIO

data_json = StringIO(r"""${toUnicode(data)}""")
df = pd.read_json(data_json)
`

const supportCode = `
import pandas as pd
import numpy as np
import json

# replace <filename.csv> with the dataset you need
df = pd.read_csv('<filname.csv>')
`

const Page = () => {
    useCachedData()

    let dataset = useSelector(state => state.dataset)
    // this "currentFilter" hook only store the latest ONE applied filter
    let [currentFilter, setCurrentFilter] = useState([])
    let loadRef = useRef(true)
    let [searchColumn, setSearchColumn] = useState('Select a Column')
    let [inputOption, setInputOption] = useState('')
    let [selectedOptions, setSelectedOptions] = useState([])

    const [code, setCode] = useState('')
    const [activateStatus, setActivateStatus] = useState('Loading...')
    let codeParent = useRef()
    let kernelRef = useRef()
    let [dfJSON, setDfJSON] = useState('')//dataframe json

    let [queryType, setQueryType] = useState(0)

    let numericalRangeRef = useRef({})
    let categoricalRef = useRef([])
    let dispatch = useDispatch()
    let sandboxRef = useRef(null)


    useEffect(async () => {
        let res = await fetchByJSON('query', {
            filters: JSON.stringify(dataset.dataFilters),
            filename: dataset.filename,
            setSource:loadRef.current
        })
        
        loadRef.current = false

        let json = await res.json()
        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
        // dispatch(DataSetActions.setData({
        //     data: JSON.parse(json.data),
        //     cols: json.cols,
        //     num_cols: json.num_cols,
        //     col_lists: json.col_lists,
        //     cate_cols: json.cate_cols,
        //     cate_lists: json.cate_lists,
        //     num_lists: json.num_lists
        // }))
        setCode(getCodeFromConditions({conditions:dataset.dataFilters}))
        console.log(currentFilter)
    }, [dataset.dataFilters])

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
                let res2 = await data.kernel.requestExecute({ code:getInitialCode(g.data) }).done
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
        let json = await res.json();
        let res2 = await kernelRef.current.requestExecute({ code:getInitialCode(json.data) }).done
        // console.log(res2);
        document.querySelector('.thebelab-run-button').click()
    }

    // useEffect(() => {
    // }, [currentFilter])

    const setComparators = useCallback((name) => {
        if (dataset.num_cols.indexOf(name) !== -1) {
            setQueryType(QueryType.Numerical)
            numericalRangeRef.current.min = dataset.num_lists[name].min
            numericalRangeRef.current.max = dataset.num_lists[name].max
            numericalRangeRef.current.column = name
        } else if (dataset.cate_cols.indexOf(name) !== -1) {
            setQueryType(QueryType.Categorical)
        }

    }, [dataset])

    const addFilter = () => {
        if (queryType === 0) return
        // let qString = getQString(queryType, numericalRangeRef.current, categoricalRef.current, searchColumn)
        // setCurrentFilter([...currentFilter, {
        //     queryType,
        //     qString,
        //     desc: queryType === QueryType.Numerical ? `Range of ${searchColumn}` :
        //         queryType === QueryType.Categorical ? `Categories of ${searchColumn}` : ''
        // }])
        dispatch(DataSetActions.setFilters([...dataset.dataFilters, ...currentFilter]))
    }

    const onUndo = async (e) => {
        let res = await fetchByJSON('cleanEditedCache', {
            filename: dataset.filename
        })
        let json = await res.json()
        if (json.success) {
            let previous = dataset.dataFilters.slice(0, -1)
            dispatch(DataSetActions.setFilters(previous))
            setCurrentFilter([])
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
                // replace the above function with the first part of selectFileOption() in /home/index.jsx
                let res2 = await fetch('/file/?filename=' + dataset.filename + '&default=' + false, {
                    method: 'GET',
                    headers: authHeader()
                })
                let json2 = await res2.json()
              
                if (json2.success) {
                    dispatch(DataSetActions.setData({
                        filname: dataset.filename,
                        info: GetDataFrameInfo(json2.info),
                        data: JSON.parse(json2.data),
                        cols: json2.cols,
                        num_cols: json2.num_cols,
                        col_lists: json2.col_lists,
                        cate_cols: json2.cate_cols,
                        cate_lists: json2.cate_lists,
                        num_lists: json2.num_lists
                    }))
                }
            }
        }
    }

    const onDownload = () => {
        const element = document.createElement('a')
        const file = new Blob([supportCode, code], {type: "text/plain"})
        element.href = URL.createObjectURL(file)
        element.download = "download_test.py" // or .txt
        document.body.appendChild(element)
        element.click()
    }

    function hashCode(string) {
        var hash = 0, i, chr;
        if (string.length === 0) return hash;
        for (i = 0; i < string.length; i++) {
          chr   = string.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      }

    return (<>
        {/* <Sandbox ref={sandboxRef} dataset={dataset} additional={`import json`}/> */}
        <div className='flex flex-col bg-gray-100' >
            <div className="flex flex-row h-20 w-full items-center justify-between bg-gray-100 shadow-md">

                <div className='mx-5'>
                    <DropDown width={'w-48'} defaultText={searchColumn} zIndex={100} items={dataset.data ? Object.keys(dataset.data).map(name => ({
                        name,
                        onClick(e) {
                            setSearchColumn(name)
                            setComparators(name)
                            return false
                        }
                    })) : []} />
                </div>

                <div className='text-center'>
                    {queryType === QueryType.Numerical && dataset.num_lists[searchColumn].max!==undefined && dataset.num_lists[searchColumn].min!==undefined ?
                        <div className='w-auto gap-8 flex justify-center items-center px-1'>
                            <RangeSelector max={dataset.num_lists[searchColumn].max} min={dataset.num_lists[searchColumn].min} onEnd={(leftValue, rightValue) => {
                                Object.assign(numericalRangeRef.current, { min: leftValue, max: rightValue })
                                let qString = getQString(queryType, numericalRangeRef.current, categoricalRef.current, searchColumn)
                                setCurrentFilter([{
                                    queryType,
                                    qString,
                                    desc: `Range of ${searchColumn}`
                                }])
                            }} />
                            <InlineTip info='Drag the sliding bars to change query window or double click them to manually input query value.' />
                        </div>
                        : queryType === QueryType.Categorical ?
                            <div className='w-auto flex justify-start items-center gap-1'>
                                <div className='w-1/3'>
                                    <MultiSelect id="multi_select" passiveMode={true} selections={selectedOptions} onSelect={(e) => {
                                        categoricalRef.current = selectedOptions
                                    }} />
                                    {/* original multiselect query for string type: */}
                                    {/* <MultiSelect id="multi_select" width={'w-72'} selections={dataset.cate_lists[searchColumn] ? dataset.cate_lists[searchColumn] : []} onSelect={(e) => {
                                        categoricalRef.current = e
                                    }} /> */}
                                </div>
                                <div className='w-1/3'>
                                    <Input id="input_option" attrs={{list:"search_column_options"}} placeholder="Query item(s)" onInput={(e, v) => {setInputOption(v)}} />
                                    <datalist id="search_column_options">{dataset.cate_lists[searchColumn].map((item) => <option key={hashCode(item)} value={item}/>)}</datalist>
                                </div>
                                <Button hasPadding={false} disabled={dataset.cate_lists[searchColumn].indexOf(inputOption)===-1} text="Add" overrideClass={
                                    `mx-1 px-1 rounded border focus:outline-none h-10 ${dataset.cate_lists[searchColumn].indexOf(inputOption)===-1 ? 'text-gray-300 cursor-default' : ''}`} onClick={(e)=>{
                                    setSelectedOptions([...selectedOptions, inputOption])
                                    categoricalRef.current.push(inputOption)
                                    let qString = getQString(queryType, numericalRangeRef.current, categoricalRef.current, searchColumn)
                                    setCurrentFilter([{
                                        queryType,
                                        qString,
                                        desc: `Categories of ${searchColumn}`
                                    }])
                                }} />
                                <Button hasPadding={false} text="Clear" overrideClass={`mx-1 px-1 rounded border focus:outline-none h-10`} onClick={(e)=>{
                                    setSelectedOptions([])
                                    categoricalRef.current = []
                                }}/>
                                <InlineTip info='Type or select value from dropdown options.' />
                            </div>
                            : ''}
                </div>

                <div className='mx-5 w-3/12'>
                    <MultiSelect width="w-72" defaultText={`Applied filters`} allowDelete={false} passiveMode={true} selections={dataset.dataFilters} getDesc={e => e.desc} />
                </div>

                <div className='w-auto flex justify-center items-center px-1'>
                    <div className={``}>{activateStatus}</div>
                    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
                </div>
            </div>

            <div className="flex flex-row h-20 w-full items-center justify-between bg-gray-100 shadow-md">
                <div className='w-auto flex flex-row items-center gap-8 mx-5'>
                    <ButtonGroup buttons={[{
                        text: 'Confirm',
                        onClick: addFilter,
                    },
                    // {
                    //     text:' Show code',
                    //     onClick: ()=>{
                    //         sandboxRef.current.setCode(getCodeFromConditions({conditions:dataset.dataFilters}))
                    //         sandboxRef.current.show()
                    //     }
                    // },
                    {
                        text: 'Run',
                        onClick: runCode,
                        overrideClass: `ml-5 w-32 px-4 py-1 rounded font-semibold border focus:outline-none text-black ${!code? 'text-gray-400 cursor-default' : 'text-black cursor-pointer'}`,
                        customStyle: { backgroundColor: !!code ? '#4bd699' : 'inherit' }
                    },
                    {
                        text: 'Undo',
                        onClick: onUndo,
                    },
                    {
                        text: 'Revert',
                        onClick: onRevert
                    },
                    {
                        text: 'Download',
                        onClick: onDownload
                    }
                    ]} />
                </div>

            </div>
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
                <div className='flex-grow-1 w-1/2' ref={codeParent}>
                    {code ? code : <div className='w-full flex-grow-0 h-48 flex justify-center items-center text-gray-500 font-semibold'>
                        Select a filter to see the corresponding code
                    </div>}
                </div>
            </div>
            <Table PageSize={10} />
            {/* <Help url={"menu/data_querying"}/> */}
        </div>
    </>)
}

export default Page