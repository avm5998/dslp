import { Button } from "../../util/ui";
import React,{ useState, useEffect,useRef } from "react";
import { fetchByJSON, useCachedData } from '../../util/util'
import { useSelector } from 'react-redux'
import './index.css'

const InitialCode = (code) => `
import json
import pandas as pd
from io import StringIO
import numpy as np
MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']
data_io = StringIO(r"""${code}""")
df = pd.read_json(data_io)
`

//https://stackoverflow.com/questions/3903488/javascript-backslash-in-variables-is-causing-an-error
const stringEscape = (s)=>{
    return s ? s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/\t/g,'\\t').replace(/\v/g,'\\v').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/[\x00-\x1F\x80-\x9F]/g,hex) : s;
    function hex(c) { var v = '0'+c.charCodeAt(0).toString(16); return '\\x'+v.substr(v.length-2); }
}

const Page = ()=>{
    let [statusText, setStatusText] = useState('Loading...')
    let mutated = useRef(1)
    let dataset = useSelector(e=>e.dataset)
    let kernelRef = useRef(null)

    //load components on page loading
    useEffect(()=>{
        thebelab.bootstrap();
        thebelab.on("status", async function (evt, data) {
            if (data.status === 'ready') {
                setStatusText('Ready')
                document.querySelector('#rightPart').appendChild(document.querySelector('.jp-OutputArea'))
                kernelRef.current = data.kernel
                // new MutationObserver(function(mutationsList, observer) {
                //     for(const mutation of mutationsList) {
                //         if (mutation.type === 'childList' && mutated.current == 1) {
                //             mutated.current = 1
                //             debugger
                //             //copy the node to right
                //             document.querySelector('#rightPart').appendChild(mutation.addedNodes[0])
                //             console.log(mutation);
                //         }
                //     }
                // }).observe(document.querySelector('.thebelab-cell'), 
                // { attributes: false, childList: true, subtree: true });
            }
        })
    },[])

    return (<div className='flex flex-col h-full justify-between gap-2'>
        <div className="flex w-full justify-center items-center m-0 flex-grow-0 h-20">
            <div className="">{statusText}</div>
        </div>
        <div className="flex w-full h-full justify-between flex-grow-1 gap-2">
            <div className="code w-1/2 border-2 m-2 box-content flex flex-col">
                <div className="flex justify-start items-center bg-gray-400">
                    <div className='run' onClick={async ()=>{
                        mutated.current = 0
                        let res = await fetchByJSON('current_data_json', {
                            filename: dataset.filename
                        })
                        let json = await res.json();
                        let res2 = await kernelRef.current.requestExecute({ code: InitialCode(json.data) }).done
                        document.querySelector('.thebelab-run-button').click()
                    }}>Run</div>
                </div>
                <pre data-executable="true" data-language="python"></pre>
            </div>
            <div className="result w-1/2 border-2 m-2 box-content" id="rightPart">

            </div>
        </div>
    </div>)
}

export default Page;

// export default function(){
//     let dataset = useSelector(state => state.dataset)
//     let [dfJSON,setDfJSON] = useState('')

//     useEffect(()=>{
//         (async function(){
//             let res = await fetchByJSON('/current_data_json',{
//                 filename:dataset.filename
//             })
//             let g = await res.json()
//             thebelab.on("status", function (evt, data) {
//                 if(data.status === 'ready'){
//                     data.kernel.requestExecute({code: 
// `import pandas as pd
// from io import StringIO
// data_json = StringIO("""${g.data}""")
// df = pd.read_json(data_json)
// import matplotlib.pyplot as plt
// `})
//                 }
//                   console.log("Status changed:", data.status, data.message);
//               })
//             setDfJSON(g.data)
//         })()
//     },[])

//     return (<>
//     {dfJSON?
//     <pre data-executable="true" data-language="python">
// {`
// df.plot(x="rooms", y="area")
// `}
//     </pre>
//     :null}
//     <Button onClick={()=>{
//         thebelab.bootstrap();
//     }} text={`Activate Codesandbox`}/>
//     </>)
// }