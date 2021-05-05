import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { RangeSelector } from '../../util/ui'
import { Button, DropDown, MultiSelect } from '../../util/ui_components'
import { useDispatch, useSelector } from 'react-redux'
import { fetchByJSON, GetDataFrameInfo, useCachedData } from '../../util/util'
import { actions as DataSetActions } from '../../reducer/dataset'
import { useTable, usePagination, useSortBy } from 'react-table'
import Table from '../common/table'
import './index.css'
import Help from '../common/help'

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


const Page = () => {
    useCachedData()

    let dataset = useSelector(state => state.dataset)

    let [searchColumn, setSearchColumn] = useState('Select a Column')

    let [queryType, setQueryType] = useState(0)

    let numericalRangeRef = useRef({})
    let categoricalRef = useRef([])
    let dispatch = useDispatch()

    useEffect(() => {
        queryFilter()
    }, [dataset.dataFilters])

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
        let filters = [...dataset.dataFilters]
        let exist = filters.some(f => f.queryType === queryType && f.qString === qString)
        if (exist) return

        filters.push({
            queryType,
            qString,
            desc: queryType === QueryType.Numerical ? `Range of ${searchColumn}` :
                queryType === QueryType.Categorical ? `Categories of ${searchColumn}` : ''
        })

        dispatch(DataSetActions.setFilters(filters))
    }

    const queryFilter = async () => {
        let res = await fetchByJSON('query', {
            filters: JSON.stringify(dataset.dataFilters),
            filename: dataset.filename
        })

        let json = await res.json()

        dispatch(DataSetActions.setTableData(JSON.parse(json.data)))
    }

    return (<>
        <div className='flex flex-col bg-gray-100' style={{height:'calc(100% - 0rem)'}}>
            <div className="flex flex-row h-auto w-full items-end justify-start shadow-sm bg-gray-100">

                <div className='mx-5 my-4 w-2/12'>
                    <DropDown defaultText={searchColumn} items={dataset.data ? Object.keys(dataset.data).map(name => ({
                        name,
                        onClick(e) {
                            setSearchColumn(name)
                            setComparators(name)
                            return false
                        }
                    })) : []} />
                </div>

                <div className='mx-5 mb-4 w-3/12 text-center'>
                    {queryType === QueryType.Numerical && dataset.num_lists[searchColumn].max && dataset.num_lists[searchColumn].min ?
                        <RangeSelector max={dataset.num_lists[searchColumn].max} min={dataset.num_lists[searchColumn].min} onEnd={(leftValue, rightValue) => {
                            Object.assign(numericalRangeRef.current, { min: leftValue, max: rightValue })
                        }} />
                        : queryType === QueryType.Categorical ?
                            <MultiSelect width={'w-72'} selections={dataset.cate_lists[searchColumn] ? dataset.cate_lists[searchColumn] : []} onSelect={(e) => {
                                categoricalRef.current = e
                            }} />
                            : ''}
                </div>

                <div className='mb-4 w-64'>
                    <Button text="Add filter" onClick={addFilter}/>
                </div>

                <div className='mx-5 mb-4 w-5/12'>
                    <MultiSelect allowDelete={true} passiveMode={true} selections={dataset.dataFilters} getDesc={e => e.desc} onSelect={filters => {
                        dispatch(DataSetActions.setFilters(filters))
                    }} />
                </div>

            </div>
            <Table PageSize={10} />
            {/* <Help url={"menu/data_querying"}/> */}
        </div>
    </>)
}

export default Page