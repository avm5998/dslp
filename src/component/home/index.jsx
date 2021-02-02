import React, { useRef, useEffect, useCallback } from 'react';
import { fetch, fetchByJSON,GetDataFrameInfo } from '../../util/util'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Button } from '../../util/ui'



const Home = (props) => {
  const dataInput = useRef()
  const dispatch = useDispatch()
  const dataset = useSelector(state => state.dataset)

  const uploadFile = async e => {
    const form = document.forms.namedItem("uploadFileForm");
    const data = new FormData(form)
    const filename = document.querySelector('#file').files.item(0).name
    let res = await fetch('/uploadFile', {
      method: 'POST',
      body: data
    })

    let json = await res.json()

    if (json.success) {
      dispatch(DataSetActions.setData({ 
        filename, 
        info:GetDataFrameInfo(json.info), 
        data:JSON.parse(json.data),
        cols:json.cols,
        num_cols:json.num_cols,
        col_lists:json.col_lists,
        cate_cols:json.cate_cols,
        cate_lists:json.cate_lists,
        num_lists:json.num_lists
      }))
    }
  }

  const loadProfile = async () => {
    if (!dataset.loaded) return

    dispatch(DataSetActions.loading())
    let res = await fetchByJSON('/getProfile', {
      filename: dataset.filename
    })

    let json = await res.json()
    console.log(json);
    dispatch(DataSetActions.setProfile({ html: json.html }))
    dispatch(push('/visualization'))
  }

  return (<div className='flex'>
    <div className="pl-32 flex flex-col w-1/3 h-screen items-start justify-center bg-gray-100">
      <form action="" name="uploadFileForm" method="POST" className="flex flex-col">
        <label className="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-500 hover:text-white">
          <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
          </svg>
          <span className="mt-2 text-base leading-normal">Select a file</span>
          <input className="hidden" disabled={dataset.loading} id="file" onChange={uploadFile} type="file" name="file" />
        </label>
        <label className="inline-flex items-center mt-10 p-3 rounded bg-gray-100 border-b-2 border-light-blue-500 border-solid">
          <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600 rounded" disabled={dataset.loading} name="forceUpdate" /><span className={`ml-5 ${dataset.loading ? "text-gray-300" : "text-gray-600"}`}>Force Update</span>
        </label>
        <label className="inline-flex items-center mt-10 p-3 rounded bg-gray-100 border-b-2 border-light-blue-500 border-solid">
          <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600 rounded" disabled={dataset.loading} name="autoCache" defaultChecked={true} /><span className={`ml-5 ${dataset.loading ? "text-gray-300" : "text-gray-600"}`}>Auto cache</span>
        </label>
      </form>
      <div className="mt-10">
        <Button text="Load Profile" disabled={dataset.loading || !dataset.loaded} disabledText={dataset.loaded ? 'Loading Profile...' : 'Select a datafile(.csv) to see the profile'} onClick={loadProfile} />
      </div>
    </div>
    <div className={`pr-20 flex flex-col h-screen items-start justify-center w-2/3 bg-gray-100`}>
      <div className={`mx-auto bg-white shadow-lg rounded-lg my-32 px-4 py-4 w-auto ${dataset.loaded?'':'hidden'}`}>
        <div className='mb-1 tracking-wide px-4 py-4'>
          <h2 className="text-gray-800 font-semibold mt-1 mb-3">{dataset.filename}</h2>

          {dataset.info.rows.map((row,i)=>
              <div key={i} className="border-b -mx-8 px-8 pb-3">
              <div className="flex items-center mt-1">
                {/* <div className=" w-1/5 text-indigo-500 tracking-tighter">
                  <span>5 star</span>
                </div>
                <div className="w-3/5">
                  <div className="bg-gray-300 w-full rounded-lg h-2">
                    <div className=" w-7/12 bg-indigo-600 rounded-lg h-2"></div>
                  </div>
                </div> */}
                {/* <div className="w-1/5 text-gray-700 pl-3">
                  <span className="text-sm">51%</span>
                </div> */}
                <div className="font-mono whitespace-pre w-full text-gray-700 pl-3">
                  <span className="text-sm">{row}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </div>)
}

export default Home;