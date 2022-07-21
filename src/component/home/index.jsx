import React, { useRef, useEffect, useCallback, useState } from 'react';
import { fetch, fetchByJSON, GetDataFrameInfo, useCachedData } from '../../util/util'
import { Modal } from '../../util/ui'
import { DropDown, Button } from '../../util/ui_components'

import './index.css'
import { push } from 'connected-react-router'
import { useSelector, useDispatch } from 'react-redux'
import { actions as DataSetActions } from '../../reducer/dataset'
import Tip, { InlineTip } from '../common/tip'
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import { data } from 'autoprefixer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SEARCH_SVG = (<svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
</svg>)

const LIST_SVG = (<svg fill="currentColor" x="0px" y="0px"
  className="w-8 h-8" viewBox="0 0 612 612">
  <path d="M59.226,88.839C26.513,88.839,0,115.352,0,148.064s26.513,59.226,59.226,59.226s59.226-26.514,59.226-59.226
     S91.938,88.839,59.226,88.839z M59.226,246.774C26.513,246.774,0,273.288,0,306c0,32.713,26.513,59.226,59.226,59.226
     s59.226-26.513,59.226-59.226C118.452,273.288,91.938,246.774,59.226,246.774z M59.226,404.71C26.513,404.71,0,431.223,0,463.936
     c0,32.712,26.513,59.226,59.226,59.226s59.226-26.514,59.226-59.226C118.452,431.223,91.938,404.71,59.226,404.71z
      M197.419,187.548h375.096c21.815,0,39.484-17.669,39.484-39.484s-17.669-39.484-39.484-39.484H197.419
     c-21.815,0-39.484,17.669-39.484,39.484S175.604,187.548,197.419,187.548z M572.516,266.516H197.419
     c-21.815,0-39.484,17.669-39.484,39.484c0,21.814,17.669,39.484,39.484,39.484h375.096c21.815,0,39.484-17.67,39.484-39.484
     C612,284.185,594.331,266.516,572.516,266.516z M572.516,424.451H197.419c-21.815,0-39.484,17.67-39.484,39.484
     s17.669,39.483,39.484,39.483h375.096c21.815,0,39.484-17.669,39.484-39.483S594.331,424.451,572.516,424.451z"/>
</svg>)

const filenames = [
  {
    id: 0,
    filename: "Mall_Customers_clustering.csv",
    type: "Clustering",
    description: "Clustering dataset",
    method: "Unsupervised"
  },
  {
    id: 1,
    filename: "credit_card_default_classification.csv",
    type: "Classification",
    description: "Classification dataset",
    method: "Supervised"
  },
  {
    id: 2,
    filename: "house_price_prediction_regression.csv",
    type: "Regression",
    description: "Regression dataset",
    method: "Supervised"
  },
  {
    id: 3,
    filename: "titanic.csv",
    type: "Clustering",
    description: "Clustering dataset",
    method: "Unsupervised"
  },
  {
    id: 4,
    filename: "BreadBasket_DMS.csv",
    type: "Association rule",
    description: "Association rule dataset",
    method: "Unsupervised"
  },
  {
    id: 5,
    filename: "titanic_clean.csv",
    type: "Classification",
    description: "Cleaned titanic dataset",
    method: "Supervised"
  },
  {
    id: 6,
    filename: "weather.csv",
    type: "Classification",
    description: "Classification dataset",
    method: "Supervised"
  },
  {
    id: 7,
    filename: "acs2015_county_data.csv",
    type: "Classification",
    description: "Classification dataset",
    method: "Supervised"
  },
  {
    id: 8,
    filename: "house_rent.csv",
    type: "Classification",
    description: "Classification dataset",
    method: "Supervised"
  },
  {
    id: 9,
    filename: "country_vaccinations_by_manufacturer.csv",
    type: "Classification",
    description: "Classification dataset",
    method: "Supervised"
  },
  {
    id: 10,
    filename: "iris_dataset.csv",
    type: "Classification",
    description: "Classification and clustering dataset",
    method: "All"
  },
  {
    id: 11,
    filename: "advertising.csv",
    type: "Regression",
    description: "Regression dataset",
    method: "Supervised"
  },
  {
    id: 12,
    filename: "Auto.csv",
    type: "Classification",
    description: "Classification and clustering dataset",
    method: "All"
  },
  {
    id: 13,
    filename: "Carseat.csv",
    type: "Classification",
    description: "Classification and clustering dataset",
    method: "All"
  },
  {
    id: 14,
    filename: "country_vaccinations.csv",
    type: "Classification",
    description: "Classification dataset",
    method: "Supervised"
  },
  {
    id: 15,
    filename: "Groceries_dataset.csv",
    type: "Association rule",
    description: "Association rule dataset",
    method: "Unsupervised"
  },
  {
    id: 16,
    filename: "Mall_Customers.csv",
    type: "Clustering",
    description: "Clustering dataset",
    method: "Unsupervised"
  },
  {
    id: 17,
    filename: "Smarket.csv",
    type: "Regression",
    description: "Regression dataset",
    method: "Supervised"
  }
  // {
  //   id: 10,
  //   filename: "country_vaccinations.csv",
  //   type: "Classification",
  //   description: "Classification dataset",
  //   method: "Supervised"
  // }
  // {
  //   id: 4,
  //   filename: "credit_card_default_classification.csv",
  //   type: "Classification",
  //   description: "Classification dataset",
  //   method: "Supervised"
  // },
  // {
  //   id: 5,
  //   filename: "house_price_prediction_regression.csv",
  //   type: "Regression",
  //   description: "Regression dataset",
  //   method: "Supervised"
  // }
]

const Method = {
  "All": ['Classification',
    'Regression',
    'Clustering',
  'Association rule'],
  "Supervised": ['Classification',
    'Regression'],
  "Unsupervised": ['Clustering', 'Association rule']
}

const Filter = ({ dataItems, selectFileOption, showOptions }) => {
  const [dataList, setDataList] = useState(dataItems);
  const [dataListType, setDataListType] = useState(dataList);
  useEffect(() => {
    // console.log(dataList.map(item => console.log(item)))
  }, [dataList, dataListType])


  const [methodSelected, setMethodSelected] = useState('select method');
  const [typeSelected, setTypeSelected] = useState('select type');
  const filterByMethod = (method) => {
    if (method === 'All') {
      setDataList(dataItems);
      setDataListType(dataItems);
    }
    else {
      setDataList(dataItems.filter(dataItem => dataItem.method === method))
      setDataListType(dataItems.filter(dataItem => dataItem.method === method))
    }

  }
  const filterByType = (type) => {
    setDataListType(dataList.filter(dataItem => dataItem.type === type))
  }

  return (
    <div className='data-items p-4'>

      <div className="filters mb-4">
        <DropDown className="selectMethod" customStyle='w-72' height='h-10' text={methodSelected} items={Object.keys(Method).map(name => ({
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
        <DropDown className="selectType" customStyle='w-72' height='h-10' text={typeSelected} items={methodSelected === 'select method' ?
          Method['All'].map(name => ({
            name, onClick(e) {
              setTypeSelected(name);
              filterByType(name);
            }
          })) :
          Method[methodSelected].map(name => ({
            name, onClick(e) {
              setTypeSelected(name);
              filterByType(name);
            }
          }))} />
        <FontAwesomeIcon className="icon cursor-pointer" icon='times' onClick={() => { showOptions(0) }} />

      </div>


      {
        dataListType.length ?
          dataListType.map((dataItem,i) => <DataItem isLast={i===dataListType.length-1} key={dataItem.id} item={dataItem} selectFileOption={selectFileOption} />)
          :
          <span className='empty-message'>No files with the combination</span>
      }
    </div>
  )
}


const DataItem = ({ item: { filename, description, extraClass }, selectFileOption, isLast }) => (
  <div onClick={e => {
    e.preventDefault();
    selectFileOption(filename, true)
  }} className={`${extraClass} flex justify-between hover:bg-gray-300 cursor-pointer`} style={{ width: '50vw', borderBottom:isLast?'':'1px solid #ddd'}}>
    <div className='flex flex-row my-4 mx-8 items-end'>
      <div className='text-xl'>{filename}</div>
      <div className='ml-2 text-sm text-gray-500'>{description}</div>
    </div>


    <div className='flex items-center justify-center'>
      {/* For buttons, do not delete,
      Here we don't need a button to select the item, because "selection" is the only one operation
      if there are more than one operations, 
      for example, to show details of the dataset, here should be a button or some buttons */}
    </div>

    {/* <img src={imageUrl} alt='item'/> */}
    {/* <div className='item-details'>
      <span className='filename'>{filename}</span>
      <span className='description'>
        {description}
      </span>
    </div>
    <div className="use-file">
      <Button text='try this' disabled={false} onClick={e => {
        e.preventDefault();
        selectFileOption(filename, true)
      }}/>
    </div> */}

  </div>
)

const Home = ({location}) => {
  useCachedData()

  const { user: currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  const dataInput = useRef()
  const dispatch = useDispatch()
  const dataset = useSelector(state => state.dataset)
  const [files_list, setFileList] = useState([])
  let [selectFile, setFile] = useState('Your previously uploaded datasets')
  let [useRecommended, setUseRecommended] = useState(0)
  const [optionsVisible, showOptions] = useState(0)

  useEffect(async () => {
    await updateFilesDropdown();
    if(location.state?.guide){
      document.querySelector('#use_recommended').checked = true
      setUseRecommended(1)
      document.querySelector('#select_data_btn').classList.add('btn-blink')
      filenames[2].extraClass = 'btn-blink'
    }

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
    // setFile(filename)
  }

  async function selectFileOption(filename, existing) {
    if (optionsVisible) {
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
    let res = await fetch('/file/?filename=' + filename + '&default=' + existing, {
      method: 'GET',
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
    // setFile(filename)
  }
  return (<div className='flex'>
    <Modal fixedModalPosition={{
      left: '20vw',
      top: '10vh',
      width: 'fit-content'
    }} zIndex={11} isOpen={optionsVisible} setIsOpen={showOptions} onClose={() => {
      showOptions(0)
      // setCode(GraphConfigs[currentPlot].getCode(result), dataset)
    }}>
      {
        <Filter dataItems={filenames} selectFileOption={selectFileOption} showOptions={showOptions} />
      }
    </Modal>
    <div className="pl-32 flex flex-col w-1/3 h-screen items-start justify-center">
      <form action="" name="uploadFileForm" method="POST" className="flex flex-col">
        <label className="flex flex-row items-center mt-2 p-3 rounded bg-gray-100">
          <input id="use_recommended" type="checkbox" defaultChecked={false} className="form-checkbox h-5 w-5 rounded border-2 border-gray-300" name="useRecommended" onChange={e => {
            setUseRecommended(e.target.checked)
          }} /><span className={`ml-5 ${dataset.loading ? "text-gray-300" : "text-gray-600"}`}>Use recommended</span>
          <InlineTip infoPosition={'right'} info={'Use recommended dataset instead of your own'} customStyle={'ml-2'} />
        </label>
        <label className="flex flex-row items-center mt-2 p-3 rounded bg-gray-100">
          <input id="home_force_update" type="checkbox" defaultChecked={true} className="form-checkbox h-5 w-5 rounded border-2 border-gray-300" disabled={dataset.loading} name="forceUpdate" /><span className={`ml-5 ${dataset.loading ? "text-gray-300" : "text-gray-600"}`}>Force Update</span>
          <InlineTip infoPosition={'right'} info={'When this is checked, the file you updated with the same filename will be overwritten. Otherwise it will use the previous one you updated.'} customStyle={'ml-2'} />
        </label>

        <DropDown className="fileSelect" disabled={!files_list.length} width='w-72 mt-2 mb-4' height='h-10' defaultText={files_list.length ? selectFile : 'No dataset uploaded'} items={files_list.map(name => ({
          name,
          onClick(e) {
            selectFileOption(name, false);
          }
        }))} />

        <label id="select_data_btn" className="w-64 flex flex-col items-center px-4 py-6 rounded-lg shadow-md tracking-wide uppercase border border-blue cursor-pointer upload"
          onClick={e => {
            if (useRecommended) {
              showOptions(1)
              e.preventDefault();
            }
          }}>
          {useRecommended ? LIST_SVG : SEARCH_SVG}
          <span className="mt-2 text-base leading-normal">{useRecommended ? 'Select a dataset' : `Select a file`}</span>
          <input className="hidden" disabled={dataset.loading || useRecommended} id="file" onChange={uploadFile} type="file" name="file" />
        </label>

        <Button text='Revert data' width="w-64 mt-4" disabled={false} onClick={async () => {
          if (dataset.filename) {
            let res = await fetchByJSON('cleanEditedCache', {
              filename: dataset.filename
            })

            let json = await res.json()

            if (json.success) {
              alert('Revert data success!')
              dispatch(DataSetActions.emptyInfo())
              selectFileOption(dataset.filename, false)
            }
          }
        }} />

        {/* <label>
          <h2 className="text-gray-500"> OR </h2>
          <Button text='Use recommended' disabled={false} onClick={e => { e.preventDefault(); showOptions(1) }}
           customStyle='h-10 w-full my-4 recommended' hasPadding={false}/>
        </label> */}
      </form>

      {/* {console.log("dropdown"+files_list)} */}
      <div className='my-10 w-2/12'>
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