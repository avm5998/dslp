import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { Button, DropDown, MultiSelect, RangeSelector } from '../../util/ui'
import { useDispatch, useSelector } from 'react-redux'
import { fetchByJSON,GetDataFrameInfo } from '../../util/util'
import { actions as DataSetActions } from '../../reducer/dataset'
import { useTable, usePagination, useSortBy } from 'react-table'
import NoData from '../common/nodata'
import './index.css'

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

const PageSize = 10
const PaginationRange = 5

const Page = () => {
    let dataset = useSelector(state => state.dataset)

    let [searchColumn, setSearchColumn] = useState('Select a Column')

    let [queryType, setQueryType] = useState(0)

    let numericalRangeRef = useRef({})
    let categoricalRef = useRef([])
    let dispatch = useDispatch()

    const tableInstance = useTable({
        ...dataset.tableData, pageSize: PageSize,
        manualPagination: false, initialState: { pageIndex: 0 }
    }, useSortBy, usePagination)


    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = tableInstance

    useEffect(() => {
        setPageSize(PageSize)
    }, [dataset.tableData])

    useEffect(()=>{
        queryFilter()
    },[dataset.dataFilters])

    const pageRange = [...Array(PaginationRange).keys()].map(i => pageIndex + i - (PaginationRange >> 1)).filter(i => i > -1 && i < pageCount)

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
        let res = await fetchByJSON('/query', {
            filters: JSON.stringify(dataset.dataFilters),
            cacheResult: true,
            filename: dataset.filename
        })

        let json = await res.json()
        dispatch(DataSetActions.setData({ 
            data:JSON.parse(json.data),
            cols:json.cols,
            num_cols:json.num_cols,
            col_lists:json.col_lists,
            cate_cols:json.cate_cols,
            cate_lists:json.cate_lists,
            num_lists:json.num_lists
        }))
    }

    return (<>
        <div className='flex flex-col min-h-screen bg-gray-100'>
            <div className="flex flex-row h-40 w-full items-start justify-start bg-gray-100 shadow-lg">

                <div className='mx-5 my-10 w-2/12'>
                    <DropDown customStyle='h-10 w-72' customUlStyle={'w-72'} text={searchColumn} items={dataset.data ? Object.keys(dataset.data).map(name => ({
                        name,
                        onClick(e) {
                            setSearchColumn(name)
                            setComparators(name)
                            return false
                        }
                    })) : []} />
                </div>

                <div className='mx-5 my-10 w-3/12 text-center'>
                    {queryType === QueryType.Numerical && dataset.num_lists[searchColumn].max && dataset.num_lists[searchColumn].min ?
                        <RangeSelector max={dataset.num_lists[searchColumn].max} min={dataset.num_lists[searchColumn].min} onEnd={(leftValue, rightValue) => {
                            Object.assign(numericalRangeRef.current, { min: leftValue, max: rightValue })
                        }} />
                        : queryType === QueryType.Categorical ?
                            <MultiSelect selections={dataset.cate_lists[searchColumn] ? dataset.cate_lists[searchColumn] : []} onSelect={(e) => {
                                categoricalRef.current = e
                            }} />
                            : ''}
                </div>

                <div className='my-10 w-auto'>
                    <Button text="Add filter" customStyle='h-10 w-auto' onClick={addFilter} hoverAnimation={false} />
                </div>

                <div className='mx-5 my-10 w-5/12'>
                    <MultiSelect passiveMode={true} selections={dataset.dataFilters} getDesc={e => e.desc} onSelect={filters => {
                        dispatch(DataSetActions.setFilters(filters))
                    }} />
                </div>



            </div>
            <div className={`flex flex-col w-full items-center justify-center min-h-full bg-gray-100 mt-8`}>
                {dataset.data && page ?
                    <div className='bg-white shadow-2xl rounded-lg p-10 tracking-wide'>
                        <div className="inline-block float-left text-lg py-3 px-6 text-gray-600">
                            <label>Page size: <select name="example_length" className=" rounded mx-3 bg-gray-100 leading-3 p-2" onChange={e => setPageSize(Number(e.target.value))} >
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select></label>
                        </div>
                        <div className="inline-block float-right text-lg py-3 px-6">
                            <label>Search:<input type="search" className="ml-5 outline-none bg-gray-100 border-gray-200 rounded leading-3 p-2 text-gray-600" placeholder="" />
                            </label>
                        </div>

                        <table className="stripe hover dataTable no-footer dtr-inline" role="grid" aria-describedby="example_info" style={{ borderBottomColor: '#ddd' }}>
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()} role="row">
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} className={`${column.isSorted ?
                                                column.isSortedDesc ? 'sorting_desc' : 'sorting_asc'
                                                : 'sorting'}`}>
                                                {column.render('Header')}
                                            </th>
                                        ))}
                                    </tr>
                                ))}

                            </thead>
                            <tbody>
                                {page.map((row, j) => {
                                    prepareRow(row)
                                    return (
                                        <tr role="row"{...row.getRowProps()} className={`hover:bg-yellow-100 ${j & 1 ? 'odd' : 'even'}`}>
                                            {row.cells.map(cell => {
                                                return (
                                                    <td {...cell.getCellProps()}>
                                                        {cell.render('Cell')}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        <div className="mb-10 w-full text-center sm:text-left">
                            {/* <div className="float-left mx-5 h-16 flex justify-center items-center" role="status" aria-live="polite">Showing {PageSize} of ~{pageCount * pageSize}{' '} entries</div> */}
                            <div className="float-right mx-5 my-3 h-16 flex justify-center items-center">
                                <a className={`${canPreviousPage ? 'cursor-pointer hover:bg-blue-400 hover:text-white' : 'cursor-default text-gray-400'} font-bold rounded p-3`} data-dt-idx="0" onClick={() => previousPage()} disabled={!canPreviousPage}>Previous</a>
                                <span>
                                    {pageRange.map(index =>
                                        <a key={index} className={`${index == pageIndex ? 'text-white bg-blue-400 hover:text-gray-800' : 'bg-transparent text-gray-800 hover:bg-blue-400 hover:text-white'} cursor-pointer border-transparent p-3 rounded text-xl`} data-dt-idx="1" onClick={() => { gotoPage(Number(index)) }}>{index + 1}</a>
                                    )}
                                </span>
                                <a className={`${canNextPage ? 'cursor-pointer hover:bg-blue-400 hover:text-white' : 'cursor-default text-gray-400'} font-bold rounded p-3`} onClick={() => nextPage()} disabled={!canNextPage}>Next</a>
                            </div>
                        </div>
                    </div>
                    :<NoData/>
                    }
            </div>
        </div>
    </>)
}

export default Page