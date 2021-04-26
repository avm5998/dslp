import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, useCachedData } from '../../util/util'
import { DropDown, Modal } from '../../util/ui'
import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import { Button } from '../../util/ui'
import Tip, { InlineTip } from '../common/tip'
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import { data } from 'autoprefixer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



const filenames = [
  {
    id:0,
    filename: "Mall_Customers_clustering.csv",
    type: "Clustering",
    description: "Clustering dataset",
    method:"Unsupervised"
  },
  {id:1,
    filename: "credit_card_default_classification.csv",
    type: "Classification",
    description: "Classification dataset",
    method:"Supervised"
  },
  {
    id:2,
    filename: "house_price_prediction_regression.csv",
    type: "Regression",
    description: "Regression dataset",
    method:"Supervised"
  },
  {
    id:3,
    filename: "Mall_Customers_clustering.csv",
    type: "Clustering",
    description: "Clustering dataset",
    method:"Unsupervised"
  },
  {
    id:4,
    filename: "credit_card_default_classification.csv",
    type: "Classification",
    description: "Classification dataset",
    method:"Supervised"
  },
  {
    id:5,
    filename: "house_price_prediction_regression.csv",
    type: "Regression",
    description: "Regression dataset",
    method:"Supervised"
  }
]

const Method = {
  "All": [  'Classification',
  'Regression',
  'Clustering'],
  "Supervised":[  'Classification',
  'Regression'],
  "Unsupervised":['Clustering']
}


const Filter = ({dataItems, selectFileOption, showOptions}) => {
  const [dataList, setDataList] = useState(dataItems);
  const [dataListType, setDataListType] = useState(dataList);
  useEffect(() => {
    // console.log(dataList.map(item => console.log(item)))
  }, [dataList, dataListType])

  
  const [methodSelected, setMethodSelected] = useState('select method');
  const [typeSelected, setTypeSelected] = useState('select type');
  const filterByMethod = (method) => {
    if (method ==='All'){
      setDataList(dataItems);
      setDataListType(dataItems);
    }
    else{
      setDataList(dataItems.filter( dataItem => dataItem.method === method ))
      setDataListType(dataItems.filter( dataItem => dataItem.method === method ))
    }
    
  }
  const filterByType = (type) => {
    setDataListType(dataList.filter( dataItem => dataItem.type === type ))
  }

  return (
    <div className = 'data-items'>

      <div className="filters">
        <DropDown className="selectMethod"  customStyle='w-72' height='h-10' text={methodSelected} items={Object.keys(Method).map(name => ({
            name,
            onClick(e) {
              setMethodSelected(name);
              // console.log(Method[name])
              setTypeSelected('select type')
              filterByMethod(name);
              console.log(Method[name][0])
              // filterByType(Method[name][0]);
            }
          }))} />
        <DropDown className="selectType" customStyle='w-72' height='h-10' text={typeSelected} items={methodSelected==='select method'?
        Method['All'].map(name => ({name, onClick(e) {
              setTypeSelected(name);
              filterByType(name);
            }
          })) : 
          Method[methodSelected].map(name => ({name, onClick(e) {
              setTypeSelected(name);
              filterByType(name);
            }
          }))} />
        <FontAwesomeIcon className="icon" icon='times' onClick={() => {showOptions(0)}}/>
        
      </div>

    
    {
      dataListType.length?   
      dataListType.map(dataItem => <DataItem key={dataItem.id} item={dataItem} selectFileOption={selectFileOption}/>)
        :
        <span className='empty-message'>No files with the combination</span>  
    }
    </div>
  )
}


const DataItem = ({item:{ filename, description}, selectFileOption}) => (
  <div className='data-item'>
      {/* <img src={imageUrl} alt='item'/> */}
      <div className='item-details'>
          <span className='filename'>{filename}</span>
          <span className='description'>
              {description}
          </span>
      </div>
      <div className="use-file">
          <Button text='try this' disabled={false} onClick={e =>
           { e.preventDefault();
            selectFileOption(filename, true)
            }}
           customStyle='h-10' hasPadding={true}/>
      </div>

  </div>
)

const Home = (props) => {
  useCachedData()

  const { user: currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  const dataInput = useRef()
  const dispatch = useDispatch()
  const dataset = useSelector(state => state.dataset)
  const [files_list, setFileList] = useState([])
  let [selectFile, setFile] = useState('Your previously uploaded')
  const [optionsVisible, showOptions] = useState(0)

  useEffect(async () => {
    await updateFilesDropdown();
    // console.log(data.files_list);

  }, []);

  async function updateFilesDropdown() {
    const response = await fetch('/user_files', {
      method: 'GET',
      headers: authHeader()
    });

    let data = await response.json();
    if (data.files_list) {
      setFileList([...data.files_list])
    }
  }


  const uploadFile = async e => {
    const form = document.forms.namedItem("uploadFileForm");
    const data = new FormData(form)
    data.append("user", currentUser.username);
    const filename = document.querySelector('#file').files.item(0).name

    let res = await fetch('/uploadFile', {
      method: 'POST',
      body: data,
      headers: authHeader()
    })
    
    let json = await res.json()

    if (json.success) {
      dispatch(DataSetActions.setData({
        filename,
        info: GetDataFrameInfo(json.info),
        data: JSON.parse(json.data),
        cols: json.cols,
        num_cols: json.num_cols,
        col_lists: json.col_lists,
        cate_cols: json.cate_cols,
        cate_lists: json.cate_lists,
        num_lists: json.num_lists
      }))
    }
    await updateFilesDropdown();
    setFile(filename)
  }

  async function selectFileOption(filename, existing) {
    if(optionsVisible){
      showOptions(0);
    }

    // if(existing){
    //   console.log('existing')
    //   let res = await fetch('/file/' + filename, {
    //     method: 'GET',
    //     headers: authHeader()
    //   })
    // }
    // else{
    //   console.log('not existing')
    //   let res = await fetch('/file/?filename=' + filename+'&default='+existing, {
    //     method: 'GET',
    //     headers: authHeader()
    //   })
    // }
    let res = await fetch('/file/?filename=' + filename+'&default='+existing, {
      method: 'GET',
      headers: authHeader()
    })
    let json = await res.json()

    if (json.success) {
      console.log('inside success')
      dispatch(DataSetActions.setData({
        filename,
        info: GetDataFrameInfo(json.info),
        data: JSON.parse(json.data),
        cols: json.cols,
        num_cols: json.num_cols,
        col_lists: json.col_lists,
        cate_cols: json.cate_cols,
        cate_lists: json.cate_lists,
        num_lists: json.num_lists
      }))
    }
    await updateFilesDropdown();
    setFile(filename)
  }
  return (<div className='flex'>
        <Modal fixedModalPosition={{
            left:'20vw',
            top:'10vh',
            width:'60vw'
        }} zIndex={11} isOpen={optionsVisible} setIsOpen={showOptions} onClose={() => {
            showOptions(0)
            // setCode(GraphConfigs[currentPlot].getCode(result), dataset)
        }}>
        {
          <Filter dataItems={filenames} selectFileOption={selectFileOption} showOptions={showOptions}/>
        }
      </Modal>
    <div className="pl-32 flex flex-col w-1/3 h-screen items-start justify-center">

      <form action="" name="uploadFileForm" method="POST" className="flex flex-col">
        <label className="w-64 flex flex-col items-center px-4 py-6 rounded-lg shadow-md tracking-wide uppercase border border-blue cursor-pointer upload">
          <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
          </svg>
          <span className="mt-2 text-base leading-normal">Select a file</span>
          <input className="hidden" disabled={dataset.loading} id="file" onChange={uploadFile} type="file" name="file" />
        </label>
        <label>
          <h2 className="text-gray-500"> OR </h2>
          <Button text='Use recommended' disabled={false} onClick={e => { e.preventDefault(); showOptions(1) }}
           customStyle='h-10 w-full my-4 recommended' hasPadding={false}/>
        </label>
        <label className="flex flex-row items-center mt-2 p-3 rounded bg-gray-100">
          <input id="home_force_update" type="checkbox" defaultChecked={true} className="form-checkbox h-5 w-5 rounded" disabled={dataset.loading} name="forceUpdate" /><span className={`ml-5 ${dataset.loading ? "text-gray-300" : "text-gray-600"}`}>Force Update</span>
          <InlineTip infoPosition={'right'} info={'When this is checked, the file you updated with the same filename will be overwritten. Otherwise it will use the previous one you updated.'} customStyle={'ml-2'} />
        </label>
      </form>

      {/* {console.log("dropdown"+files_list)} */}
      <div className='my-10 w-2/12'>
        <DropDown className="fileSelect" disabled={!!files_list.length} customStyle='w-72' height='h-10' text={selectFile} items={files_list.map(name => ({
          name,
          onClick(e) {
            setFile(name);
            selectFileOption(name, false);
          }
        }))} />
        <Button text='Revert data' disabled={false} onClick={()=>{
          if(dataset.filename){
            fetchByJSON('cleanEditedCache',{
              filename:dataset.filename
            })

            dispatch(DataSetActions.emptyInfo())
            selectFileOption(dataset.filename, false)
          }
        }} customStyle='h-10 w-72 my-4 revert' hasPadding={false}/>

      </div>
      {/* <div className="mt-10">
        <Button text="Load Profile" disabled={dataset.loading || !dataset.loaded} disabledText={dataset.loaded ? 'Loading Profile...' : 'Select a datafile(.csv) to see the profile'} onClick={loadProfile} />
      </div> */}
    </div>
    <div className={`pr-20 flex flex-col h-screen items-start justify-center w-2/3`}>
      <div className={`mx-auto data-style shadow-md rounded-lg my-32 px-4 py-4 w-auto ${dataset.loaded ? 'data-style' : 'hidden'}`}>
        <div className='mb-1 tracking-wide px-4 py-4'>
          <h2 className="font-semibold mt-1 mb-3">{dataset.filename}</h2>

          {dataset.info.rows.map((row, i) =>
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
                  <span className="text-sm data-style">{row}</span>
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