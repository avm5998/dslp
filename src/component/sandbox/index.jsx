import { Button } from "../../util/ui";
import React,{ useState, useEffect } from "react";
import { fetchByJSON } from '../../util/util'
import { useSelector } from 'react-redux'

//https://stackoverflow.com/questions/3903488/javascript-backslash-in-variables-is-causing-an-error
const stringEscape = (s)=>{
    return s ? s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/\t/g,'\\t').replace(/\v/g,'\\v').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/[\x00-\x1F\x80-\x9F]/g,hex) : s;
    function hex(c) { var v = '0'+c.charCodeAt(0).toString(16); return '\\x'+v.substr(v.length-2); }
}

export default function(){
    let dataset = useSelector(state => state.dataset)
    let [dfJSON,setDfJSON] = useState('')

    useEffect(()=>{
        (async function(){
            let res = await fetchByJSON('/current_data_json',{
                filename:dataset.filename
            })
            let g = await res.json()
            thebelab.on("status", function (evt, data) {
                if(data.status === 'ready'){
                    data.kernel.requestExecute({code: 
`import pandas as pd
from io import StringIO
data_json = StringIO("""${g.data}""")
df = pd.read_json(data_json)
import matplotlib.pyplot as plt
`})
                }
                  console.log("Status changed:", data.status, data.message);
              })
            setDfJSON(g.data)
        })()
    },[])

    return (<>
    {dfJSON?
    <pre data-executable="true" data-language="python">
{`
df.plot(x="rooms", y="area")
`}
    </pre>
    :null}
    <Button onClick={()=>{
        thebelab.bootstrap();
    }} text={`Activate Codesandbox`}/>
    </>)
}