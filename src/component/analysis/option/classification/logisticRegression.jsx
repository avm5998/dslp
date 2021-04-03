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
                    result.test_size_dtr = v
                }} customStyle={`w-64 `} attrs={{ list: 'test_size_logr_list' }} />

                <Label customStyle={``} text='Set parameters: solver' />
                <DropDown defaultText={'Select solver'} showOnHover={false} customUlStyle='w-64' items={['newton-cg', 'lbfgs', 'liblinear', 'sag', 'saga']}
                    onSelect={name => {
                        result.para_solver = name
                    }} />


                <Label customStyle={``} text='Set parameters: C' />
                <Input onInput={(e,v) => {
                    result.param_C = v
                }} customStyle={`w-64`} attrs={{ list: 'C_logr_list' }} />

                <Label customStyle={``} text='Plot Types' ><InlineTip info=""/></Label>
                <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e => { }} />

                <Label text='Metrics of Model:' />
                <DropDown defaultText={'Select metrics'} showOnHover={false} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'ROC Curve']}
                    onSelect={name => {
                        result.metric = name
                    }} />


                <Checkbox label="Find the Best Hyper-Parameters:" defaultChecked={false} />
                <Label text='' />
                <Label text='solver' />
                <Input onInput={e => {
                    result.find_solver = e.target.value
                }} customStyle={`w-64`} attrs={{ list: 'find_solver_logr_list' }} />
                <Label text='C' />
                <Input onInput={e => {
                    result.find_C = e.target.value
                }} customStyle={`w-64`} attrs={{ list: 'find_C_logr_list' }} />
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