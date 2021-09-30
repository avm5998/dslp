import React from "react";
import { useSelector } from "react-redux";
import { fetchByJSON, useCachedData } from "../../util/util";
import { config } from '../../config/client'
const Download = ()=> {
    useCachedData()
    let { user } = useSelector(state => state.auth)
    let dataset = useSelector(state => state.dataset)
    return (
        <>
            <iframe name="iframe" style={{display:'none'}}></iframe>
            <a href={`${config.endpoint}/currentDataDownload?token=${user.id}@${dataset.filename}`} target="iframe">Download</a>
        </>
    )
}
        //abbr type="submit" onClick={async ()=>{
            //     let res = await fetch("currentDataDownload",{
            //         body:JSON.stringify(filename: dataset.filename),
                    
            //     })

            //     let json = await res.json()
            //     console.log(json)
            // }}>Download!</button>

export default Download;