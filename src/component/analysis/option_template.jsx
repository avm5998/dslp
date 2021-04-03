import React, { } from 'react'

const DataLists = {
    test_size_dtc_list: [30, 20, 10],
    max_depth_dtc_list: [5, 6, 7],
    find_max_depth_dtc_list: ['1,2,3,4,5,10,15,20,25,50,100'],
    max_leaf_nodes_dtc_list: [20, 25],
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
                gridTemplateColumns: '100px 1fr 100px 1fr'
            }}>
                <Label text="Choose Test Size(%)" />
                <Input onInput={(e, v) => {
                    result.test_size_dtr = v
                }} customStyle={`w-64`} attrs={{ list: 'test_size_dtc_list' }} />
                <Label customStyle={``} text='Set parameters: max_depth' />
                <Input onInput={e => {
                    result.param_max_depth = e.target.value
                }} customStyle={`w-64`} attrs={{ list: 'max_depth_dtc_list' }} />
                <Label customStyle={``} text='Plot Types' />
                <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e => { }} />

                <Label text='Metrics of Model:' />
                <DropDown defaultText={'Select metrics'} showOnHover={false} customUlStyle='w-64' items={['Classification Report', 'Confusion Matrix', 'ROC Curve']}
                    onSelect={name => {
                        result.metric = name
                    }} />

                <Checkbox label="Find the Best Hyper-Parameters: max_depth" defaultChecked={false} />

                <Input onInput={e => {
                    result.find_max_depth = e.target.value
                }} customStyle={`w-64`} attrs={{ list: 'find_max_depth_dtc_list' }} />
            </div>
            <div className={`grid gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`} style={{
                gridTemplateColumns: '100px 1fr 100px 1fr'
            }}>
                <Label customStyle={``} text='Set Parameters: criterion' />
                <DropDown defaultText={'Select criterion'} showOnHover={false}
                    customStyle={`w-64`} customUlStyle='w-64' items={['gini', 'entropy']}
                    onSelect={name => {
                        result.param_criterion = name
                    }} />
                <Label customStyle={``} text='Set Parameters: max_leaf_nodes' />
                <Input onInput={(e, v) => {
                    result.param_max_leaf_nodes = v
                }} customStyle={`w-64`} attrs={{ list: 'max_leaf_nodes_dtc_list' }} />

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