import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { Modal, RangeSelector } from '../../util/ui'
import { Button, Input, DropDown, MultiSelect, ButtonGroup } from '../../util/ui_components'
import { useDispatch, useSelector } from 'react-redux'
import { pythonEscape, fetchByJSON, GetDataFrameInfo, useCachedData } from '../../util/util'
import { actions as DataSetActions } from '../../reducer/dataset'
import { useTable, usePagination, useSortBy } from 'react-table'
import { InlineTip } from '../common/tip';
import Table from '../common/table'
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
filters = json.loads(${pythonEscape(JSON.stringify(conditions))})
${queries.map(q=>`df.query('''${q}''',inplace = True)`).join('\n')}
df
`
}

const Page = () => {
    useCachedData()

    let dataset = useSelector(state => state.dataset)
    let [filters, setFilters] = useState([])
    let loadRef = useRef(true)
    let [searchColumn, setSearchColumn] = useState('Select a Column')
    let [inputOption, setInputOption] = useState('')
    let [selectedOptions, setSelectedOptions] = useState([])

    let [queryType, setQueryType] = useState(0)

    let numericalRangeRef = useRef({})
    let categoricalRef = useRef([])
    let dispatch = useDispatch()
    let sandboxRef = useRef(null)


    useEffect(async () => {
        let res = await fetchByJSON('query', {
            filters: JSON.stringify(filters),
            filename: dataset.filename,
            setSource:loadRef.current
        })
        
        loadRef.current = false

        let json = await res.json()
        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
    }, [filters])

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
        let qString = getQString(queryType, numericalRangeRef.current, categoricalRef.current, searchColumn)
        setFilters([...filters, {
            queryType,
            qString,
            desc: queryType === QueryType.Numerical ? `Range of ${searchColumn}` :
                queryType === QueryType.Categorical ? `Categories of ${searchColumn}` : ''
        }])
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
        <Sandbox ref={sandboxRef} dataset={dataset} additional={`import json`}/>
        <div className='flex flex-col bg-gray-100' >
            <div className="flex flex-row h-20 w-full items-center justify-between bg-gray-100 shadow-md">

                <div className='mx-5'>
                    <DropDown width={'w-48'} defaultText={searchColumn} items={dataset.data ? Object.keys(dataset.data).map(name => ({
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
                                }} />
                                <Button hasPadding={false} text="Clear" overrideClass={`mx-1 px-1 rounded border focus:outline-none h-10`} onClick={(e)=>{
                                    setSelectedOptions([])
                                    categoricalRef.current = []
                                }}/>
                                <InlineTip info='Type or select value from dropdown options.' />
                            </div>
                            : ''}
                </div>

                <div className='w-auto flex flex-row items-center gap-8 mx-5'>
                    <MultiSelect width="w-24" allowDelete={true} passiveMode={true} selections={filters} getDesc={e => e.desc} onSelect={filters => {
                        setFilters([...filters])
                    }} />
                    <ButtonGroup buttons={[{
                        text: 'Add filter',
                        onClick: addFilter
                    },{
                        text:' Show code',
                        onClick: ()=>{
                            sandboxRef.current.setCode(getCodeFromConditions({conditions:filters}))
                            sandboxRef.current.show()
                        }
                    }]} />
                </div>

            </div>
            <Table PageSize={10} />
            {/* <Help url={"menu/data_querying"}/> */}
        </div>
    </>)
}

export default Page