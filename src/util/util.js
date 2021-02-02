import ifetch from 'isomorphic-fetch';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { config } from '../config/client'

export async function fetch(url, options) {
    return await ifetch(config.endpoint + url, options)
}

export async function fetchByJSON(url, obj) {

    return await ifetch(config.endpoint + url, {
        body: JSON.stringify(obj),
        headers: {
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
            if (cur) row[j] = cur
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

export function initialFormRadio(args){
    return initialFormCheckbox({...args,
        handleType:HandleType.Radio,
        maxSelection:1,
        minSelection:1,
    })
}

export function initialFormCheckbox({handleType = HandleType.Checkbox, type, subTypes, minSelection = 0, maxSelection = subTypes.length, defaultCheckedSubTypes = []}) {
    let res = {}

    subTypes.forEach(subType => Object.assign(res, {
        [`${type}_${subType}`]: {
            handleType: handleType,
            valueProperty: 'checked',
            onChangeProperty:'onClick',
            attrs: {
                name: type,
                checked:defaultCheckedSubTypes.indexOf(subType)!==-1,
                defaultChecked: defaultCheckedSubTypes.indexOf(subType)!==-1
            },
            getValue(e) {
                return e.target.checked
            },
            shouldPreventDefault(form,formRef,e){
                let element = formRef.current || document
                let selectedCount = [...element.querySelectorAll(`[name=${type}]`)].reduce((p,c)=>p+c.checked,0)

                if(e.target.checked){
                    return selectedCount > maxSelection
                }else{
                    return selectedCount < minSelection
                }
            }
        }
    }))
    return res
}

export function useForm({fields, checkForm = ()=>true, onSubmit, onSubmitSuccess = ()=>{}, onSubmitFail = ()=>{}, submitOnChange = false}) {
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
    const initialForm = useMemo(()=>getInitialForm(fields),[])
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
                if(field.shouldPreventDefault instanceof Function){
                    if (field.shouldPreventDefault(form,formRef,e)){
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
    useEffect(()=>{
        if (firstInit.current){
            firstInit.current = false
            return
        }

        if (submitOnChange && form.onSubmit) form.onSubmit()
    },[form])

    //update onSubmit on each render cause "checkForm" usually uses current state as variables
    form.onSubmit = (e)=>{
        if(!checkForm()) return
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
    
    return {form, formRef, setForm, submitingForm}
}


export function elementIsVisibleInViewport(el, partiallyVisible = true){
    if(el.offsetWidth + el.offsetHeight <= 0) return false
    const rect = el.getBoundingClientRect();
    const top = rect.top, left = rect.left, bottom = rect.bottom, right = rect.right
    const innerHeight = window.innerHeight, innerWidth = window.innerWidth
    return partiallyVisible ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) && ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth)) : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth; 
};

export function GetDataFrameInfo (info){
    return {
      rows:info.split(/\n/).filter(Boolean).slice(1)
    }
  }