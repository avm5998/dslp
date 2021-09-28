import React from "react";
import { Component } from "react";
import { fetchByJSON } from "../../util/util";
const Download = ()=> {

    return (
        // <form method="get" action="http(s)://下载文件的后台接口">
            <button type="submit" onClick={async ()=>{
                let res = await fetchByJSON("currentDataDownload",{
                    filename:"titanic"
                })

                let json = await res.json()
                console.log(json)
            }}>Download!</button>
        // </form>
    )
}


export default Download;