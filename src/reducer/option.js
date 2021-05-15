import {createSlice} from '@reduxjs/toolkit'
import {cacheOptionInfo} from '../util/util'

const DEFAULT_OPTION = {
    default:true,

    analysis:{
        regression:{},
        classification:{},
        clustering:{},
        associate_rule:{},
    }
}

const slice = createSlice({
    name:'option',
    initialState:DEFAULT_OPTION,
    reducers:{
        setOption(state,action){
            if (action.payload[0] && !(action.payload[0] instanceof Array)) action.payload = [action.payload]

            action.payload.forEach(payload=>{
                let [module,method,model,option] = payload

                if (!state[module][method][model]) state[module][method][model] = {}

                Object.assign(state[module][method][model],option)
            })

            Object.assign(state,{default:false})
            cacheOptionInfo(state)
        },
    }
})

export const { reducer, actions } = slice