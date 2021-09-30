import React from "react";
import { useSelector } from "react-redux";
import { fetchByJSON, useCachedData } from "../../util/util";

const Download = ()=> {
    useCachedData()
    let dataset = useSelector(state => state.dataset)
    return (
            <button type="submit" onClick={async ()=>{
                let res = await fetchByJSON("currentDataDownload",{
                    filename: dataset.filename
                })

                let json = await res.json()
                console.log(json)
            }}>Download!</button>
    )
}


export default Download;