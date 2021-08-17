import { actions as DataSetActions } from '../reducer/dataset'
import { actions as OptionActions } from '../reducer/option'
import { actions as PresetActions } from '../reducer/preset'
import { useDispatch, useSelector } from 'react-redux'
import ifetch from 'isomorphic-fetch';
import {Redirect} from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { config } from '../config/client'
import authHeader, {authHeaderRefresh} from '../services/auth-header';
import { logout } from '../actions/auth';
import { createBrowserHistory } from 'history';

export function getProp(object,...props){
    let cur = object
    for(let i = 0;i<props.length;i++){
        if(cur && cur.hasOwnProperty(props[i])){
            cur = cur[props[i]]
        }else{
            if(!cur) return cur
            return undefined
        }
    }
    return cur
}

export function toUnicode(str) {
	return str.split('').map(function (value, index, array) {
		var temp = value.charCodeAt(0).toString(16).toUpperCase();
		if (temp.length > 2) {
			return '\\u' + temp;
		}
		return value;
	}).join('');
}

// refresh

// const dispatch = useDispatch();

export const fetchWithRefresh = async (url, options) => {
    // url = url.replace(/$\/+/,'')

    try{
        const r = await ifetch(url, options)
        console.log(r)
        if(!r.ok){
            throw r
        }
        return Promise.resolve(r)
    }
    catch(error){
        console.log('inside error')
        if (
		// error.response?.status === 401 && // Use the status code your server returns when token has expired
            error.status === 401
            && error.statusText === 'UNAUTHORIZED'
	    ) {
            console.log('inside if')
            return new Promise((resolve, reject) => {
                refreshToken(url, options)
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    localStorage.removeItem('user');
                    reject(err);
                });
                console.log("refresh token code")
            });
        }
	    return Promise.reject(error);
    };
}
    

const refreshToken = (url, config) => {
  console.log('refresh token call')
	return new Promise((resolve, reject) => {
		getNewToken() // Endpoint to request new token
			.then((res) => {
                console.log('store new token')
                
				storeToken(res.accessToken); // Store new token locally (Local storage or cookies)
                console.log("successful")
                ifetch(url, {...config, headers:authHeader()})
                .then((result) => {
                    		return resolve(result);
                    	})
                    	.catch((err) => {
                    		console.log(err);
                    		return reject(err);
                    	});
			})
			.catch((err) => {
                localStorage.removeItem('user');
                createBrowserHistory().push('/login')
                window.location.reload()
				console.log(err);
                return reject(err);
			});
	});
};

const getNewToken = async () => {
  console.log('get new token')
//   console.log(authHeaderRefresh());
  try {
      const response = await ifetch(config.endpoint +'/api/auth/refresh', {
          method: 'POST',
          headers: authHeaderRefresh()
      });
      if(!response.ok){
          throw response
      }
      const r = await response.json()
      return Promise.resolve(r)
  } catch (error) {
      // Clear token and continue with the Promise catch chain
      // clearToken();
      return Promise.reject(error);
  }
}

const storeToken = token =>    {
  console.log('store token')
  let user = JSON.parse(localStorage.getItem('user'))
  user = {
    ...user,
    accessToken : token
  }
  console.log("saved token\n"+user);
  localStorage.setItem('user', JSON.stringify(user));
} 



/**
 * Assume
 * categoryType has 2 values A,B
 * valueType has 3 values 1,2,3
 * defaultValue is 0
 * aggregateCol is aggregated for categoryType and valueType
 * 
 * 
 * dataset is:
 * 
 * cType vType aggregateCol
 * A     1     5
 * A     2     1
 * A     3     3
 * B     1     10
 * B     2     -5
 *
 * reducer: p,c=>c
 * initialValue: undefined
 * 
 * results will be
 * 
 * {
 *  A:{
 *     '1':5,
 *     '2':1
 *     '3':3
 *  },
 *  B:{
 *     '1':5,
 *     '2':1
 *     '3':0
 *  },
 * }
 * 
 * @param {
 * } aggregatedData 
 * @param {*} categoryType
 * @param {*} valueType
 * @param {*} aggregateCol aggregateCol for categoryType and valueType
 * @param {*} defaultValue defalutValue if a category does not have corresponding value
 */
export function groupBy({aggregatedData, categoryType, valueType, aggregateCol, reducer,initialValue, defaultValue = null}) {
    let res = {}
    // debugger
    let size = aggregatedData[categoryType].length
    let vals = new Set()
    let cates = new Set()

    for (let i = 0; i < size; i++) {
        let cate = aggregatedData[categoryType][i], val = aggregatedData[valueType][i],
         target = aggregatedData[aggregateCol][i]
        cates.add(cate)
        vals.add(val)
        res[cate] = res[cate] || {}
        if (val in res[cate]) {
            res[cate][val] = reducer(res[cate][val],target)
        } else {
            res[cate][val] = reducer(initialValue,target)
        }
    }

    let obj = {};

    [...cates].forEach(cate=>{
        [...vals].forEach(val=>{
            obj[cate] = obj[cate] || {}
            if (!(val in res[cate]))
                obj[cate][val] = defaultValue
                else
                obj[cate][val] = res[cate][val]
        })
    })

    return {
        categoryValues:[...cates],
        valueValues:[...vals],
        data:obj
    }
}

export function loadScript(url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {  // only required for IE <9
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}


export async function fetch(url, options) {
    return await ifetch(config.endpoint + url, options)
}

export async function fetchByJSON(url, obj) {
    url = url.replace(/$\/+/,'')
    return await ifetch(config.endpoint + url, {
        body: JSON.stringify(obj),
        headers: {
            ...authHeader(),
            'content-type': 'application/json'
        },
        method: 'POST',
    })
}

export function useThrottle(fn, interval) {
    let ts = useRef(-1)

    return (...args) => {
        let cur = new Date().getTime()
        if (cur - ts.current > interval) {
            fn(...args)
            ts.current = cur
        }
    }
}

export function dataFrameJSONObjectToReactTableData(jsonObject) {
    let keys = Object.keys(jsonObject)
    let indices = Object.keys(jsonObject[keys[0]])
    let size = indices.length
    const columns = keys.map((key, i) => ({
        Header: key,
        accessor: `${i}`
    }))

    const data = []

    for (let i = 0; i < size; i++) {
        let row = {}
        for (let j = 0; j < keys.length; j++) {
            let cur = jsonObject[keys[j]][indices[i]]
            if (cur!==undefined) row[j] = cur
        }
        data.push(row)
    }

    return { columns, data }
}

function toProperty(obj, configurations = { enumerable: true }) {
    return {
        value: obj, ...configurations
    }
}

const HandleType = {
    Input: 1,
    Checkbox: 2,
    Radio: 3,
}

function getInitialForm(fields) {
    let form = {}

    for (let key of Object.keys(fields)) {
        fields[key].handleType ||= HandleType.Input
        let valueProperty = fields[key].valueProperty || 'value';
        let attrObject = {}
        Object.assign(attrObject, fields[key].attrs || {});

        attrObject[valueProperty] = fields[key].attrs ? fields[key].attrs[valueProperty] : undefined
        Object.defineProperty(form, key, toProperty(attrObject))
    }

    //user can define custom properties in the form object
    form.getData = function () {
        let res = {}

        //handle special type
        for (let key of Object.keys(this)) {
            if (this[key] instanceof Function) continue

            let object = fields[key]
            if (object === undefined) {//user defined prop
                res[key] = this[key]
            } else if (object.handleType === HandleType.Checkbox) {
                let type = fields[key].attrs.name
                let subType = key.substr(type.length + 1)
                if (!(type in res)) res[type] = []

                if (this[key].checked) res[type].push(subType)
            }
        }

        for (let key of Object.keys(this)) {
            if (this[key] instanceof Function) continue

            let object = fields[key]

            if (object && object.handleType === HandleType.Input) {
                let valueProperty = object.valueProperty || 'value';
                Object.defineProperty(res, key, toProperty(this[key][valueProperty]))
            }
        }
        return res
    }

    return form
}

/**
 * use this function to get data from server when page rereshes
 */
export function useCachedData(){
    let info = null, optionInfo = null, presetInfo = null
    try{//Strange BUG!
        info = JSON.parse(localStorage.getItem('info'))
        optionInfo = JSON.parse(localStorage.getItem('optionInfo')) || []
        presetInfo = JSON.parse(localStorage.getItem('presetInfo')) || {}
    }catch(e){

    }

    let dispatch = useDispatch()
    let dataset = useSelector(state=>state.dataset)
    let option = useSelector(state=>state.option)
    let preset = useSelector(state=>state.preset)

    //initialize from local storage
    useEffect(()=>{
        if(option && option.default && optionInfo){
            dispatch(OptionActions.setOption(optionInfo))
        }

        if(preset && presetInfo){
            dispatch(PresetActions.loadPreset(presetInfo))
        }
    },[])

    //initialize data from server
    useEffect(()=>{
        if(dataset.data !== null || !info)
            return
            
        (async function(){
            let res = await fetchByJSON('handleCachedData',{
                filename:info.filename
            })
        
            let json = await res.json()

            if(json.modifiedJson){//use modified data
                dispatch(DataSetActions.setData({...info,
                    filename:info.filename,
                    data: JSON.parse(json.modifiedJson),
                }))
            }else{//use initial data
                dispatch(DataSetActions.setData({...info,
                    filename:info.filename,
                    data: JSON.parse(json.dataJson),
                    cols: json.cols,
                    num_cols: json.num_cols,
                    col_lists: json.col_lists,
                    cate_cols: json.cate_cols,
                    cate_lists: json.cate_lists,
                    num_lists: json.num_lists
                }))

                dispatch(DataSetActions.emptyInfo())
            }
        })()
    },[])
}

export function cachePresetInfo(data){
    localStorage.setItem('presetInfo',JSON.stringify(data))
}

export function cacheOptionInfo(data){
    let obj = JSON.parse(JSON.stringify({...data}))
    let res = []
    for(let module in obj)
        for(let method in obj[module])
            for (let model in obj[module][method])
                res.push([module,method,model,obj[module][method][model]])

    localStorage.setItem('optionInfo',JSON.stringify(res))
}

export function cacheDataInfo(data){
    localStorage.setItem('info',JSON.stringify({...data,
        data:null,
        tableData:{
            columns:[],
            data:[]
        },
    }))
}

export function initialFormRadio(args) {
    return initialFormCheckbox({
        ...args,
        handleType: HandleType.Radio,
        maxSelection: 1,
        minSelection: 1,
    })
}

export function initialFormCheckbox({ handleType = HandleType.Checkbox, type, subTypes, minSelection = 0, maxSelection = subTypes.length, defaultCheckedSubTypes = [] }) {
    let res = {}

    subTypes.forEach(subType => Object.assign(res, {
        [`${type}_${subType}`]: {
            handleType: handleType,
            valueProperty: 'checked',
            onChangeProperty: 'onClick',
            attrs: {
                name: type,
                checked: defaultCheckedSubTypes.indexOf(subType) !== -1,
                defaultChecked: defaultCheckedSubTypes.indexOf(subType) !== -1
            },
            getValue(e) {
                return e.target.checked
            },
            shouldPreventDefault(form, formRef, e) {
                let element = formRef.current || document
                let selectedCount = [...element.querySelectorAll(`[name=${type}]`)].reduce((p, c) => p + c.checked, 0)

                if (e.target.checked) {
                    return selectedCount > maxSelection
                } else {
                    return selectedCount < minSelection
                }
            }
        }
    }))
    return res
}

export function useForm({ fields, checkForm = () => true, onSubmit, onSubmitSuccess = () => { }, onSubmitFail = () => { }, submitOnChange = false }) {
    // let example = {
    //   name:{
    //     valueProperty:'value',
    //     onChangeProperty:'onChange',
    //     attrs:{
    //     },
    //     getValue(e){
    //       return e.value
    //     }
    //   }
    // }
    console.assert(!(fields && (fields.getData instanceof Object)))
    const initialForm = useMemo(() => getInitialForm(fields), [])
    let submitingForm = useRef(false)
    let [form, setForm] = useState(initialForm) // only use a single form instead form + form data
    let formRef = useRef()
    let firstInit = useRef(true)

    useEffect(() => {
        // part of initialization step for the form
        // can be somehow integrated into "getInitialForm" but
        // I just don't know how because it uses "setForm" method
        // due to the change of element value triggers the change of the form object
        for (let key of Object.keys(fields)) {
            let valueProperty = fields[key].valueProperty || 'value';
            let onChangeProperty = fields[key].onChangeProperty || 'onChange';
            let field = fields[key] || {}
            let attrObject = {}

            attrObject[onChangeProperty] = e => {
                if (field.shouldPreventDefault instanceof Function) {
                    if (field.shouldPreventDefault(form, formRef, e)) {
                        e.preventDefault()
                        return
                    }
                }
                form[key][valueProperty] = field.getValue ? field.getValue(e) : e.value
                setForm({ ...form })
            }

            Object.assign(form[key], attrObject)
        }

        setForm({ ...form })
    }, [])

    //using submitOnChange to determine whether to submit the form once it changed
    //cause it is triggered by form's change, its value is updated
    useEffect(() => {
        if (firstInit.current) {
            firstInit.current = false
            return
        }

        if (submitOnChange && form.onSubmit) form.onSubmit()
    }, [form])

    //update onSubmit on each render cause "checkForm" usually uses current state as variables
    form.onSubmit = (e) => {
        if (!checkForm()) return
        if (submitingForm.current) return
        submitingForm.current = true
        onSubmit(e).then((res) => {
            onSubmitSuccess(res)
            submitingForm.current = false
        }).catch(err => {
            onSubmitFail(err)
            submitingForm.current = false
        })
    }

    return { form, formRef, setForm, submitingForm }
}

//no real time effects
export function useSimpleForm(initialResult = {}) {
    let checkboxRefs = useRef([])
    let inputRefs = useRef([])
    let selectRefs = useRef([])
    let result = useRef(initialResult)

    const getData = useCallback(() => {
        let res = result.current
        for (let checkbox of checkboxRefs.current) {
            let { name, element, item } = checkbox
            res[name] = res[name] || []
            if (element.checked) {
                res[name].push(item)
            }
        }

        for (let input of inputRefs.current) {
            let { name, element } = input
            res[name] = element.value || ''
        }
        
        for (let select of selectRefs.current) {
            let { name, element } = select
            res[name] = element.value || ''
        }

        return res
    }, [])

    return {
        getData,
        clearData:()=>{
            for (let k in result.current){
                if (result.current.hasOwnProperty(k)){
                    delete result.current[k];
                }
            }

            Object.assign(result.current,initialResult)
        },
        result: result.current,
        checkbox: {
            ref: ref => {
                if (!ref) return

                let exist = false
                for (let checkbox of checkboxRefs.current) {
                    if (checkbox.item === ref.getAttribute('item') && checkbox.name === ref.getAttribute('name')) {
                        exist = true
                        break
                    }
                }

                if (!exist)
                    checkboxRefs.current.push({
                        element: ref,
                        item: ref.getAttribute('item'),
                        name: ref.getAttribute('name') || ('checkbox_' + checkboxRefs.current.length)
                    })
            }
        },
        input: {
            ref: ref => {
                if (!ref) return

                let exist = false
                for (let input of inputRefs.current) {
                    if (input.name === ref.getAttribute('name')) {
                        exist = true
                        break
                    }
                }

                if (!exist)
                    inputRefs.current.push({
                        element: ref,
                        name: ref.getAttribute('name') || ('input_' + inputRefs.current.length)
                    })
            }
        },
        select: {
            ref: ref => {
                if (!ref) return

                let exist = false
                for (let select of selectRefs.current) {
                    if (select.name === ref.getAttribute('name')) {
                        exist = true
                        break
                    }
                }

                if (!exist)
                    selectRefs.current.push({
                        element: ref,
                        name: ref.getAttribute('name') || ('select_' + inputRefs.current.length)
                    })
            }
        }
    }
}

export function useToggleGroup() {
    let components = useRef([])
    return {
        ref: (ref) => {
            if (ref) components.current.push(ref)
        },
        hide: () => {
            components.current.forEach(e => {
                if (e.hide instanceof Function)
                    e.hide()
            })
        }
    }
}

export function elementIsVisibleInViewport(el, partiallyVisible = true) {
    if (el.offsetWidth + el.offsetHeight <= 0) return false
    const rect = el.getBoundingClientRect();
    const top = rect.top, left = rect.left, bottom = rect.bottom, right = rect.right
    const innerHeight = window.innerHeight, innerWidth = window.innerWidth
    return partiallyVisible ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) && ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth)) : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

export function GetDataFrameInfo(info) {
    return {
        rows: info.split(/\n/).filter(Boolean).slice(1)
    }
}

