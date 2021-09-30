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
                <a className='hover:border-transparent border-blue-500 border-1 button-style cursor-pointer 
                font-semibold px-4 rounded focus:outline-none h-20' 
                href={`${config.endpoint}/currentDataDownload?token=${user.id}@${dataset.filename}`} target="iframe">
                    Download
                </a>
        </>
    )
}


export default Download;