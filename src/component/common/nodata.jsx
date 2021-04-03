import { useDispatch } from "react-redux"
import { push } from 'connected-react-router'
import React from 'react'

export default function NoData (){
    let dispatch = useDispatch()

    return <div className="container box-border py-48">
    <div className="flex flex-col w-full mb-12 text-left lg:text-center">
        <h1 className="cursor-default mb-6 text-2xl font-semibold tracking-tighter text-gray-300 sm:text-3xl title-font">
            Please upload data file first.
</h1>
        <div className="flex justify-center mt-6">
            <a onClick={() => dispatch(push('/'))} className="cursor-pointer inline-flex items-center font-semibold text-gray-500 md:mb-2 lg:mb-0 hover:text-blue-400 ">
                Upload data
    <svg className="w-4 h-4 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                    fill="currentColor">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" /></svg>
            </a>
        </div>
    </div>
</div>
}