import {createSlice} from '@reduxjs/toolkit'
import {cacheData,cacheDataInfo, dataFrameJSONObjectToReactTableData} from '../util/util'

const DEFAULT_DATASET = {
    data:null,//data is persistent

    //other info and filters is persistent at local storage 
    loading:false,
    loaded:false,
    filename:'',
    dataCleaners:[],
    dataEngineering:[],
    dataPreprocessing:[],
    dataFeatureSelection:[],
    dataFilters:[],
    tableData:{
        columns:[],
        data:[]
    },
    cols:[],
    num_cols:[],
    cate_cols:[],
    col_lists:{},
    cate_lists:{},
    num_lists:{},
    info:{rows:[]},
    profile:{
        loaded:false,
        html:''
    }
}

if(process.env.dataEnv === 'default')
DEFAULT_DATASET.loaded = true

const LOADING_DATASET = {
    loading:true,
}

const commonLoaded = (state)=>{
    state.loading = false
}

const slice = createSlice({
    name:'dataset',
    initialState:DEFAULT_DATASET,
    reducers:{
        loading(state,action){
            Object.assign(state, LOADING_DATASET)
        },
        
        setTableData(state,action){
            commonLoaded(state)

            if (state.data){
                state.tableData = dataFrameJSONObjectToReactTableData(action.payload)
            }

            cacheDataInfo(state)
        },

        setData(state,action){
            commonLoaded(state)
            Object.assign(state, {loaded:true,...action.payload})

            if (state.data){
                state.tableData = dataFrameJSONObjectToReactTableData(state.data)
            }

            cacheDataInfo(state)

            //DO NOT DELETE, FOR FAST DEBUG
            // if(action) console.log(JSON.stringify({...DEFAULT_DATASET, loaded:true,tableData:state.tableData,...action.payload}))
        },

        emptyInfo(state,action){
            state.dataCleaners = [];
            state.dataEngineering = []
            state.dataPreprocessing = []
            state.dataFilters = []
            state.dataFeatureSelection = []
            cacheDataInfo(state)
        },

        setFilters(state,action){
            state.dataFilters = [...action.payload]
            cacheDataInfo(state)
        },
        
        setCleaners(state,action){
            state.dataCleaners = [...action.payload]
            cacheDataInfo(state)
        },

        setPreprocessing(state,action){
            state.dataPreprocessing = [...action.payload]
            cacheDataInfo(state)
        },

        setEngineering(state,action){
            state.dataEngineering = [...action.payload]
            cacheDataInfo(state)
        },
        
        setProfile(state,action){
            commonLoaded(state)
            Object.assign(state.profile,{loaded:true,...action.payload})
        }

    }
})

export const { reducer, actions } = slice