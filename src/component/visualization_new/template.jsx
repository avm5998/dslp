import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../util/ui'

export const view = ({ aggregatedDataset, dataset, result, showOptions, confirmOption }) => {
    return <>
            <div className='grid grid-cols-1 gap-4 p-8 w-auto'>
                <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.x = e}/>
                <Button onClick={e=>{
                    showOptions(0)
                    confirmOption()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`}/>
            </div>
    </>
}

export const config = {
    name: 'XXX XXX',
    function: ['XXX', 'XXX'],
    getOperation: ({aggregatedDataset,dataset,options}) => {
        let hasRes = true, res = {}
        if(options){
        }else{
            hasRes = false
        }
        return {res,hasRes}
    }
}


export default {
    config,view
}