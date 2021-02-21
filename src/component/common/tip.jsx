import React, { useEffect, useState, useRef } from 'react'

const Tip = ({ info, styleText = '' }) => {
    let [selectTip, setSelectTip] = useState(false)
    let [tipContent, setTipContent] = useState('')
    let [showTipContent, setShowTipContent] = useState(false)
    let childBinder = useRef([])
    let bgRef = useRef()
    let positionBinder = useRef({})

    useEffect(() => {
        if (!selectTip) {
            for (let child of childBinder.current) {
                document.body.removeChild(child)
            }

            childBinder.current.length = 0

            for (let selector in info) {
                let element = document.querySelector(selector)
                if (element) {
                    positionBinder.current[selector] = element.getBoundingClientRect()
                }
            }
            return
        }

        for (let selector in info) {
            let element = document.querySelector(selector)
            if (element) {
                let rect = positionBinder.current[selector]
                if(!rect){
                    rect = document.querySelector(selector).getBoundingClientRect()
                }
                let overlapped = document.createElement('div')
                overlapped.style.cursor = 'pointer'
                overlapped.style.position = 'absolute'
                overlapped.style.zIndex = 1001
                overlapped.style.width = rect.width + 'px'
                overlapped.style.height = rect.height + 'px'
                overlapped.style.top = rect.top + 'px'
                overlapped.style.left = rect.left + 'px'
                overlapped.style.border = '4px solid white'
                overlapped.style.background = 'rgba(255,255,255,.3)'
                overlapped.addEventListener('click', () => {
                    setTipContent(info[selector])
                    setShowTipContent(true)
                })
                document.body.appendChild(overlapped)
                childBinder.current.push(overlapped)
            }
        }

        return ()=>{
            for (let child of childBinder.current) {
                document.body.removeChild(child)
            }
        }
    }, [selectTip])

    return (<div className={`${styleText ? styleText : 'absolute right-0 top-0'} ${selectTip ? 'w-full h-full' : ''}`} onClick={e => {
        if (e.target === bgRef.current) {
            setShowTipContent(false)
        }
    }} style={{
        zIndex:1000,
        background: selectTip ? 'rgba(0,0,0,.3)' : 'transparent'
    }}>
        <div className='absolute right-0 top-0 cursor-pointer bordered-light w-16 h-16 bg-green-300 flex justify-center items-center' onClick={() => {
            if(!selectTip){
                setSelectTip(true)
            }else{
                setSelectTip(false)
                if (showTipContent) {
                    setShowTipContent(false)
                }
            }
        }} style={{
            zIndex: 1003
        }}>
            {selectTip ? 'Close' : 'ShowTip'}
        </div>

        <div ref={bgRef} className='absolute justify-center items-center left-0 right-0 top-0 bottom-0 m-auto  w-auto h-auto' style={{
            display: showTipContent ? 'flex' : 'none',
            zIndex: 1002
        }}>
            <div className='w-auto h-auto bg-white p-5 z-auto rounded-lg'>{tipContent}</div>
        </div>
    </div>)
}

export default Tip