import React from "react";
import { useSelector } from "react-redux";
import { fetchByJSON, useCachedData } from "../../util/util";
import { config } from '../../config/client'


const Download = ({user,dataset})=> {
    return (
        <>
            <iframe name="iframe" style={{display:'none'}}></iframe>
                <a href={`${config.endpoint}/currentDataDownload?token=${user.id}@${dataset.filename}`} target="iframe">
                    Download
                </a>
        </>
    )
}


export default Download;