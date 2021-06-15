import React, { useState, useRef, useEffect } from "react";
import { Button } from '../../util/ui'
import authHeader from '../../services/auth-header';
import axios from "axios";

import './pending-requests.styles.css'
import {config} from '../../config/client'





const DataItem = ({item:{ fullname, email}, grant_access}) => (
    <div className='data-item'>
        {/* <img src={imageUrl} alt='item'/> */}
        <div className='item-details'>
            <span className='filename'>{fullname}</span>
            <span className='description'>
                {email}
            </span>
        </div>
        <div className="use-file">
            <Button text='Accept' disabled={false} onClick={e =>
             { e.preventDefault();
                grant_access(email)
              }}
             customStyle='h-10' hasPadding={true}/>
        </div>
  
    </div>
  )


const PendingRequests = (props) => {
    const [requestsList, setRequestsList] = useState([]);
    const getRequests = async () => {
        const response = await axios(config.endpoint+'/pending_requests', {
        method: 'GET',
        headers: authHeader()
        });
        // let data = await response.json();
        if (response.data.pending_requests) {
            console.log("inside")
            setRequestsList([...response.data.pending_requests])
        }
        console.log(response.data.pending_requests)
    }
    useEffect(() => {

    }, [requestsList])
    useEffect(async () => {
        getRequests()
    }, []);

    const grant_access = async (email) => {
        const response = await axios(config.endpoint+'/api/auth/grant_intructor_access', {
        method: 'POST',
        data:{"email": email},
        headers: authHeader()
        });
        
        if (response.data.success) {
            console.log("respond ok")
            const arr = requestsList.filter(item => item.email !== email);
            setRequestsList([...arr])
        }
        console.log('grant done')
    }

    return (
        <div className="w-full h-full bg-gray-100">
            <div className="w-full container p-16 bg-gray-200">
            {
                requestsList.length?   
                requestsList.map(dataItem => <DataItem key={dataItem.id} item={dataItem} grant_access ={grant_access}/>)
                    :
                    <span className='empty-message'>No request pending</span>  
            }
            </div>

        </div>
    )
}
export default PendingRequests;