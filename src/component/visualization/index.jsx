import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import './index.css'
import { action as DataSetActions } from '../../reducer/dataset'
import { useSelector, useDispatch } from 'react-redux'
import { RangeSelector, Modal, Radio, Checkbox } from '../../util/ui'
import { useForm, initialFormCheckbox } from '../../util/util'
import { elementIsVisibleInViewport, fetchByJSON } from '../../util/util';
import NoData from '../common/nodata'
import placeholderImg from '../../assets/images/placeholder.jpg'

const PageModal = ({ isOpen, setIsOpen }) => {
  return (<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
    <div className="p-4 bg-gray-700 text-white">
      <span className="closeBtn float-right text-lg font-bold hover:text-gray-500 no-underline cursor-pointer">&times;</span>
      <h2>Modal Header</h2>
    </div>
    <div className="p-4">
      <p>Some text in the Modal Body</p>
      <p>Some other text...</p>
    </div>
    <div className="p-4 text-white bg-gray-500">
      <h3>Modal Footer</h3>
    </div>
  </Modal>)
}

const Variables = ({ tabpanelIndex, tabpanel }) => {
  let [modalOpened, setModalOpened] = useState(false)
  const dataset = useSelector(state => state.dataset)
  let [curCol, setCurCol] = useState('')
  let [curImg, setCurImg] = useState(placeholderImg)
  const plotForm = useRef()
  const parentRef = useRef()

  const {form, formRef, setForm, submitingForm:formDisabledRef} = useForm({
    fields: {
      ...initialFormCheckbox({ type: 'plotType', subTypes: ['Histogram', 'KDE'], minSelection: 1, defaultCheckedSubTypes: ['Histogram'] }),
      ...initialFormCheckbox({ type: 'log', subTypes: ['x', 'y'] }),
    },
    checkForm: () => {
      console.log(form.getData());
      return curCol
    },
    onSubmit: async (e) => {
      let formData = form.getData()
      // console.log(formData);
      // if(!curCol) return
      Object.assign(formData, {
        isnumeric: dataset.num_cols.indexOf(curCol) !== -1,
        filename: dataset.filename,
        col: curCol,
        type: 'variables'
      })

      // console.log(formData);

      let res = await fetchByJSON('/visualization', formData)
      return await res.json()
      // console.log(await res.json());
      // return res
    }, onSubmitSuccess: (json) => {
      setCurImg('data:image/png;base64,' + json.base64)
    },
    submitOnChange: true
  })

  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return

    if (dataset.loaded) {
      setCurCol(dataset.num_cols[0])
    }
  }, [tabpanel])

  useEffect(() => {
  }, [form])

  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return

    form.onSubmit()
  },[curCol, tabpanel])

  // console.log(dataset.num_lists, curCol);
  // console.log(form.getData());

  return (<div className={`container mx-auto ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>

    <PageModal isOpen={modalOpened} setIsOpen={setModalOpened} />
    <div className="container mx-auto">
      <div className="flex flex-col text-center w-full">
        {/* <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Our Team</h1>
      <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical gentrify, subway tile poke farm-to-table. Franzen you probably haven't heard of them.</p> */}
        <div className={`${curImg ? '' : 'hiddenn'} flex justify-around items-center py-5`}>
          <div className={`w-1/2 flex px-10`}>
            <img className={`w-full h-96`} src={curImg} alt="" />
          </div>
          <div ref={formRef} className={`w-1/2 h-96 p-10 flex flex-col justify-start bordered-light shadow-sm bg-white`}>
            <form ref={plotForm}>
              {dataset.num_lists[curCol] ?
                <div className={`flex flex-row `}>
                  <div className={`flex-grow-0 text-gray-600 py-5 flex items-center w-24`}>Data range:</div>

                  <div className={`flex-grow py-5 text-left pl-10`}><RangeSelector disabledRef={formDisabledRef} onEnd={(leftValue, rightValue) => {
                    form.dataRange ||= {};
                    form.dataRange.min = leftValue;
                    form.dataRange.max = rightValue;
                    setForm({ ...form })
                  }} min={curCol ? dataset.num_lists[curCol].min : 0} max={curCol ? dataset.num_lists[curCol].max : 0} /></div>
                </div>
                : ''}
              <div className={`flex flex-row `}>
                <div className={`flex-grow-0 text-gray-600 py-5 flex items-center w-24`}>Plot type:</div>
                <div className={`flex-grow py-5 text-left pl-10 flex items-center`}>
                  <Checkbox disabledRef={formDisabledRef} {...form.plotType_Histogram} label={"Histogram"} />

                  {dataset.num_lists[curCol] ?
                    <Checkbox disabledRef={formDisabledRef} {...form.plotType_KDE} label={"KDE"} customStyle={'pl-5'} />
                    : ''}
                </div>
              </div>

              {dataset.num_lists[curCol] ?
                <div className={`flex flex-row `}>
                  <div className={`flex-grow-0 text-gray-600 py-5 flex items-center w-24`}>Log:</div>
                  <div className={`flex-grow py-5 text-left pl-10 flex items-center`}>
                    <Checkbox disabledRef={formDisabledRef} {...form.log_x} label={"x"} />
                    <Checkbox disabledRef={formDisabledRef} {...form.log_y} label={"y"} customStyle={'pl-5'} />
                  </div>
                </div>
                : ''}
            </form>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -m-2 my-5">

        {Object.keys(dataset.col_lists).map(col => {
          let cur = dataset.col_lists[col]

          return (<div key={cur.name} className="p-2 lg:w-1/3 md:w-1/2 w-full">
            <div className={`${curCol === cur.name ? 'bg-white shadow-lg ' : ''} h-full flex items-start border-gray-200 border p-4 cursor-pointer hover:bg-white hover:shadow-lg rounded-lg`} onClick={() => {
              if (formDisabledRef.current) return
              setCurCol(cur.name)
            }}>
              {/* <img alt="team" className="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4" src="https://dummyimage.com/80x80"/> */}
              <div className="flex-grow">
                <div className='inline-block float-left'><h2 className="text-gray-900 title-font font-medium">{cur.name}</h2></div>
                <div className='inline-block float-right text-gray-500 text-sm'>{cur.isnumeric ? 'Numeric Value' : 'Categorical Value'}</div>
                <div className='block clear-both pt-3'><code className="text-gray-500 whitespace-pre">{cur.desc}</code></div>
              </div>
            </div>
          </div>)
        })}
      </div>
    </div>
  </div>)
}

const Interactions = ({ tabpanelIndex, tabpanel }) => {
  let [col1, setCol1] = useState(0)
  let [col2, setCol2] = useState(1)
  let [curImg, setCurImg] = useState(placeholderImg)
  let disabledRef = useRef(false)
  let parentRef = useRef()

  const dataset = useSelector(state => state.dataset)

  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return

    if (col1 !== col2) {
      (async () => {
        disabledRef.current = true
        let res = await fetchByJSON('/visualization', {
          type: 'interactions',
          filename: dataset.filename,
          col1: dataset.num_cols[col1],
          col2: dataset.num_cols[col2],
        })

        let json = await res.json()
        setCurImg('data:image/png;base64,' + json.base64)
      })()
    } else {
      setCurImg(placeholderImg)
    }
  }, [col1, col2, tabpanel])

  return (<div className={`container mx-auto ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
    <div className='bordered-light m-10 flex flex-col justify-start items-center bg-white'>
      <nav className="flex flex-col sm:flex-row pt-5">
        {dataset.num_cols.map((col, i) =>
          <button key={col} onClick={() => setCol1(i)} className={`py-4 px-6 block hover:text-blue-500 focus:outline-none ${i === col1 ? 'border-b-2 text-blue-500' : 'text-gray-600'} font-medium border-blue-500`}>
            {col}
          </button>
        )}
      </nav>
      <nav className="flex flex-col sm:flex-row">
        {dataset.num_cols.map((col, i) =>
          <button key={col} onClick={() => setCol2(i)} className={`py-4 px-6 block hover:text-blue-500 focus:outline-none ${i === col2 ? 'border-b-2 text-blue-500' : 'text-gray-600'} font-medium border-blue-500`}>
            {col}
          </button>
        )}
      </nav>
      <div className='p-10'>
        <img src={curImg} className='w-full h-auto' />
      </div>
    </div>
  </div>)
}
const Correlations = ({ tabpanelIndex, tabpanel }) => {
  let [curImg, setCurImg] = useState(placeholderImg)
  const dataset = useSelector(state => state.dataset)
  let parentRef = useRef()

  useEffect(() => {
    if (!elementIsVisibleInViewport(parentRef.current)) return

    (async () => {
      let res = await fetchByJSON('/visualization', {
        type: 'correlations',
        filename: dataset.filename,
        cmap: 'cool'
      })

      let json = await res.json()
      console.log(json);
      setCurImg('data:image/png;base64,' + json.base64)
    })()
  }, [tabpanel])

  return (<div className={`container mx-auto h-full ${tabpanelIndex === tabpanel ? '' : 'hidden'}`} ref={parentRef}>
    <div className='flex h-full justify-center items-center'>
      <img src={curImg} alt="" />
    </div>
  </div>)
}

const TabPanels = [
  { name: 'Variables' },
  { name: 'Interactions' },
  { name: 'Correlations' }
]

const Visualization = () => {
  let [tabpanel, setTabpanel] = useState(0)
  let dataset = useSelector(state => state.dataset)

  return (

    <div className="bg-gray-100 h-screen">
      <div className="">
        <nav className="flex flex-col sm:flex-row">
          {TabPanels.map((panel, i) =>
            <button key={panel.name} onClick={() => setTabpanel(i)} className={`py-4 px-6 block hover:text-blue-500 focus:outline-none ${i === tabpanel ? 'border-b-2 text-blue-500' : 'text-gray-600'} font-medium border-blue-500`}>
              {panel.name}
            </button>
          )}
        </nav>
      </div>
      {dataset.loaded ?
        <>
          <Variables tabpanelIndex={0} tabpanel={tabpanel} />
          <Interactions tabpanelIndex={1} tabpanel={tabpanel} />
          <Correlations tabpanelIndex={2} tabpanel={tabpanel} />
        </> : <NoData />}
    </div>)
}

export default Visualization;