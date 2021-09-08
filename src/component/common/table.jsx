import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTable, usePagination, useSortBy } from 'react-table'
import NoData from './nodata'
import './jqueryDataTable.css'

const PaginationRange = 5

export default function ({PageSize, styleText = '', style = {
    width:'fit-content',
    height: 'fit-content',
    padding: '30px',
    boxSizing: 'border-box',
    marginLeft:'auto',
    marginRight:'auto',
}}) {
    let dataset = useSelector(state => state.dataset)

    const tableInstance = useTable({
        ...dataset.tableData, pageSize: PageSize,
        manualPagination: false, initialState: { pageIndex: 0 }
    }, useSortBy, usePagination)

    useEffect(() => {
        setPageSize(PageSize)
    }, [dataset.tableData])

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
    const pageRange = [...Array(PaginationRange).keys()].map(i => pageIndex + i - (PaginationRange >> 1)).filter(i => i > -1 && i < pageCount)

    return (<div className="flex flex-row " style={{minWidth:'100%'}}><div className={`flex flex-col w-full items-center justify-center h-full bg-gray-100 mt-2 ${styleText}`} style={style}>
        {dataset.data && page ?
            <div className='bg-white shadow-2xl rounded-lg p-10 tracking-wide'>
                <div className="inline-block float-left text-lg py-3 px-6 text-gray-600">
                    <label>Page size: <select name="example_length" className=" rounded mx-3 bg-gray-100 leading-3 p-2" onChange={e => setPageSize(Number(e.target.value))} >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select></label>
                    <label>Total data: </label><label className="bg-gray-100 rounded p-2">{dataset.tableData?.data?.length}</label>
                </div>
                {/* <div className="inline-block float-right text-lg py-3 px-6">
                    <label>Search:<input type="search" className="ml-5 outline-none bg-gray-100 border-gray-200 rounded leading-3 p-2 text-gray-600" placeholder="" />
                    </label>
                </div> */}

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
            : <NoData />
        }
    </div></div>
    )
}