import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Input, Label, Button, DropDown, MultiSelect, Modal, Checkbox } from '../../../../util/ui'
import { InlineTip } from '../../../common/tip'

const DataLists = {
    test_size_logr_list: [30, 20, 10],
    C_logr_list: [0.1, 0.2, 0.3],
    find_solver_logr_list: ['newton-cg,lbfgs,liblinear,sag,saga'],
    find_C_logr_list: ['100,10,1.0,0.1,0.01'],
}

export default function ({ dataset, result, submit }) {
    let [activeTab, setActiveTab] = useState(0)

    return (
        <div className='p-4'>
            <div className='flex justify-start text-gray-500'>
                <div className={`${activeTab == 0 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(0)}>Options</div>
                <div className={`ml-4 ${activeTab == 1 ? 'border-b-2 font-bold cursor-default' : 'cursor-pointer'}`} onClick={e => setActiveTab(1)}>Advanced Options</div>
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
                <Label text="Choose Test Size(%)" />
                <Input onInput={(e,v) => {
                    result.test_size_lr = v
                }} customStyle={`w-64`} attrs={{ list: 'test_size_lr_list' }} />

                <Label customStyle={``} text='Plot Types' ><InlineTip info=""/></Label>
                <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} onSelect={e => { }} />

                <Label text='Metrics of Model:' />
                <DropDown defaultText={'Select metric'} customStyle={`w-64`} customUlStyle={`w-64`} showOnHover={false} items={['Explained Variance', 'Mean Absolute Error', 'Mean Squared Error', 'R2 Score', 'Poisson Deviance', 'Gamma Deviance']}
                    onSelect={name => {
                        result.metric = name
                    }
                } />

                <Label customStyle={``} text='Set Parameters: fit_intercept' />
                <DropDown defaultText={'Select fit_intercept'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['True', 'False']}
                    onSelect={name => {
                        result.param_fit_intercept_lr = name  //opt_fit_intercept_lr
                    }} />
                <Label customStyle={``} text='Set Parameters: normalize' />
                <DropDown defaultText={'Select normalize'} showOnHover={false} customStyle={`w-64`} customUlStyle='w-64' items={['True', 'False']}
                    onSelect={name => {
                        result.param_normalize_lr = name  //opt_normalize_lr
                    }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '10vw 1fr 10vw 1fr'
            }}>
            </div>
            <div className='flex justify-end'>
                <Button onClick={e => {
                    submit()
                }} customStyle={`w-48 h-10 justify-self-end`} text={`Confirm`} />
            </div>
            <>
                {Object.keys(DataLists).map(key => <datalist key={key} id={key}>
                    {DataLists[key].map(value => <option key={key + value} value={value}></option>)}
                </datalist>)}
            </>
        </div>)
}