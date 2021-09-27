import React from "react";
import { Component } from "react";

class Download extends Component {
    render() {
        return (
            <form method="get" action="http(s)://下载文件的后台接口">
                <button type="submit">Download!</button>
            </form>
        )
    }
}

export default Download;