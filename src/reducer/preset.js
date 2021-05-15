import {createSlice} from '@reduxjs/toolkit'
import {cachePresetInfo} from '../util/util'

const slice = createSlice({
    name:'preset',
    initialState:{},
    reducers:{
        loadPreset(state,action){
            Object.assign(state,action.payload || {})
        },

        addPreset(state,action){
            let {userId,filename,identifier,result} = action.payload
            state[userId] = state[userId] || {}
            state[userId][filename] = state[userId][filename] || {}
            state[userId][filename][identifier] = state[userId][filename][identifier] || {}
            let presetName = 'Preset ' + new Date().getTime()
            state[userId][filename][identifier][presetName] = {...result}
            cachePresetInfo(state)
        },

        updatePreset(state,action){
            let {userId,filename,identifier,presetName,result} = action.payload
            state[userId] = state[userId] || {}
            state[userId][filename] = state[userId][filename] || {}
            state[userId][filename][identifier] = state[userId][filename][identifier] || {}
            state[userId][filename][identifier][presetName] = {...result}
            cachePresetInfo(state)
        },

        clearPreset(state,action){
            let {userId,filename,identifier} = action.payload
            state[userId] = state[userId] || {}
            state[userId][filename] = state[userId][filename] || {}
            state[userId][filename][identifier] = {}
            cachePresetInfo(state)
        }
    }
})

export const { reducer, actions } = slice