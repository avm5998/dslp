import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Help = ({url})=>{
    return (<div className="absolute right-3 top-3 p-1 hover:text-gray-700 hover:bg-gray-400 border-gray-400 border-2 flex justify-center items-center text-center text-gray-400" style={{width:'35px',height:'35px',borderRadius:'50%'}}>
      <div>
        <a href={'http://localhost:9999/'+url} target="_blank">
          <FontAwesomeIcon icon={'question'} onClick={()=>{}} />
        </a>
      </div>
    </div>)
  }

  export default Help