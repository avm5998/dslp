import {createSlice} from '@reduxjs/toolkit'
import {cacheOptionInfo} from '../util/util'

const DEFAULT_OPTION = {
    default:true,

    analysis:{
        regression:{},
        classification:{},
        clustering:{},
    }
}

const slice = createSlice({
    name:'option',
    initialState:DEFAULT_OPTION,
    reducers:{
        setOption(state,action){
            if (action.payload[0] && !(action.payload[0] instanceof Array)) action.payload = [action.payload]

            // action.payload.forEach(payload=>{
            //     let module, levels = [], option;
            //     for (let val of payload){
            //         if(!module) module = val
            //         else if(typeof val == 'string') levels.push(val)
            //         else option = val
            //     }

            //     let target = state[module]
            //     while (levels.length>1){
            //         target = target[levels.splice(0,1)] 
            //     }

            //     target[levels[0]] = {...target[levels[0]],...option}
            //     cacheOptionInfo(state)
            // })

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