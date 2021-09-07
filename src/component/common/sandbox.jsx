import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react'
import { Modal } from '../../util/ui'
import { fetchByJSON,toUnicode } from '../../util/util'

const getInitialCode = (data, additional) => `import pandas as pd
from io import StringIO
import numpy as np
import math
import matplotlib.pyplot as plt
import plotly.express as px
${additional}
data_json = StringIO(r"""${toUnicode(data)}""")
df = pd.read_json(data_json)
`

export default forwardRef(({ dataset, additional }, ref) => {
  let [statusText, setStatusText] = useState('Loading...')
  let [code, setCode] = useState('')
  let [codeVisible, setCodeVisible] = useState(false)
  let codeParent = useRef(null)
  let kernelRef = useRef()
  let dataFrameRaw = useRef('')

  useEffect(() => {
    if (!code) return
    codeParent.current.innerHTML = ''
    let pre = document.createElement('pre')
    pre.setAttribute('data-executable', 'true')
    pre.setAttribute('data-language', 'python')
    codeParent.current.appendChild(pre)
    pre.innerHTML = code
    thebelab.bootstrap();
  }, [code])

  useImperativeHandle(ref, () => ({
    setCode(code) {
      setCode(code)
    },
    show() {
      setCodeVisible(true)
    },
    hide() {
      setCodeVisible(false)
    },
  }))

  useEffect(() => {
    if (!dataset.filename) {
      setStatusText('No data')
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
        data.kernel.requestExecute({ code: getInitialCode(g.data, additional) })
        dataFrameRaw.current = g.data
        setStatusText('Ready')
      }
    })

  }, [dataset.filename])

  const runCode = async (e) => {
    let res = await kernelRef.current.requestExecute({ code: getInitialCode(dataFrameRaw.current,additional) }).done
    document.querySelector('.thebelab-run-button').click()
  }

  useEffect(() => {
    thebelab.bootstrap();
    thebelab.on("status", async function (evt, data) {
      if (data.status === 'ready') {
        setStatusText('Ready')
        document.querySelector('#codesandbox_rightPart').appendChild(document.querySelector('.jp-OutputArea'))
      }
    })
  }, [])

  return (<Modal
    fixedModalPosition={{ minWidth: '80vw', height: 'auto', minHeight:'80vh',margin: 'auto' }}
    zIndex={50}
    isOpen={codeVisible}
    setIsOpen={setCodeVisible}
    onClose={() => {
      setCodeVisible(false)
    }}
  >
    <div>
      <div className='flex flex-col w-full h-full justify-between gap-2 my-4'>
        <div className="flex w-full justify-center items-center m-0 flex-grow-0 h-20">
          <div className="cursor-default">Sandbox status: {statusText}</div>
        </div>
        <div className="flex w-full h-full justify-between flex-grow-1 gap-2">
          <div className="code w-1/2 border-2 m-2 box-content flex flex-col">
            <div className="flex justify-start items-center bg-gray-400">
              <div className='run' onClick={runCode}>Run</div>
            </div>
            <div ref={codeParent}>
            </div>
          </div>
          <div className="result w-1/2 border-2 m-2 box-content" id="codesandbox_rightPart">
          </div>
        </div>
      </div>
    </div>
  </Modal>)
})