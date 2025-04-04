import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { set } from 'lodash'
import React, { forwardRef, useEffect, useState, useRef, useCallback } from 'react'
import './tip.css'

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
                try {//child could already been removed
                    document.body.removeChild(child)
                } catch (e) { }
            }

            childBinder.current.length = 0

            for (let selector in info) {
                let element = document.querySelector(selector)
                if (element) {
                    positionBinder.current[selector] = element.getBoundingClientRect()
                }
            }
            retu
        }

        for (let selector in info) {
            let element = document.querySelector(selector)
            if (element) {
                let rect = positionBinder.current[selector]
                if (!rect) {
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

        return () => {
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
        zIndex: 1000,
        background: selectTip ? 'rgba(0,0,0,.3)' : 'transparent'
    }}>
        <div className='absolute right-0 top-0 cursor-pointer bordered-light w-16 h-16 bg-green-300 flex justify-center items-center' onClick={() => {
            if (!selectTip) {
                setSelectTip(true)
            } else {
                if (showTipContent) {
                    setShowTipContent(false)
                }
                setSelectTip(false)
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

/**
 * phase:
 * 
 * start: fadein, show
 * end: fadeout, hidden
 * 
 * | fadein | show | fadeout | hidden
 */
export const InlineTip = forwardRef(({ zIndex = 1000, info = '', infoPosition = 'bottom', customStyle = '', minHoverInterval = 100 }, ref) => {
    let [showInfo, setShowInfo] = useState(false)
    let [phase, setPhase] = useState('start') //start or end
    let elements = useRef([])

    // used for delay execute anything
    // do not trigger any event if the time of mouse moving over the element is less than minHoverInterval
    let triggerShowTime = useRef(0)
    let triggerCloseTime = useRef(0)
    let showCallbackRef = useRef(0)
    let closeCallbackRef = useRef(0)
    let enterCounter = useRef(0)

    const closeTip = useCallback(e => {
        setPhase('end')
        setTimeout(() => {
            setShowInfo(false)
        }, 150)
        e.preventDefault()
    }, [])

    const showTip = useCallback(e => {
        setPhase('start')
        setShowInfo(true)
        e.preventDefault()
    }, [])

    const addRef = useCallback(ref=>{
        elements.current.push(ref)
    },[])

    const readyToLeave = useCallback((e)=>{
        enterCounter.current -= 1
        if (enterCounter.current) return

        let now = new Date().getTime()
        if (now - triggerShowTime.current < 150 && showCallbackRef.current){
            clearTimeout(showCallbackRef.current)
            showCallbackRef.current = 0
        }

        triggerCloseTime.current = now
        closeCallbackRef.current = setTimeout(()=>{
            closeTip(e)
            closeCallbackRef.current = 0
        },150)

    },[])

    const readyToEnter = useCallback((e)=>{
        if (enterCounter.current){
            enterCounter.current += 1
            return
        }else{
            enterCounter.current += 1
        }

        let now = new Date().getTime()
        if (now - triggerCloseTime.current < 150 && closeCallbackRef.current){
            clearTimeout(closeCallbackRef.current)
            closeCallbackRef.current = 0
        }

        triggerShowTime.current = new Date().getTime()
        showCallbackRef.current = setTimeout(()=>{
            showTip(e)
            showCallbackRef.current = 0
        },150)
    },[])

    return <div className='relative'>
        <div className='ml-2'>
        <FontAwesomeIcon className={`text-gray-300`} icon={['far', 'question-circle']} />
        </div>
        {/* hover layer */}
        <div ref={addRef} style={{zIndex:zIndex}} className='absolute ml-2' onMouseLeave={readyToLeave} onMouseEnter={readyToEnter} style={{width:'1.5rem',height:'1.5rem',top:0,right:0}}></div>
            {infoPosition == 'top' ?
                <svg ref={addRef} className={`${showInfo ? '' : 'hidden'} ${phase == 'start' ? 'animation-popin-' : 'animation-popout-'} ml-2 top-0 left-0 absolute text-white`} style={{ zIndex:zIndex+2, width:'1em',transform: 'translate(0,-1.1em)' }} x="0px" y="0px" viewBox="0 0 255 255">
                    <path stroke="black" strokeWidth="8" strokeOpacity="0.2" fill='white' d="M 0 0 L 127.5 127.5 L 255,0"/>
                </svg> :
                infoPosition == 'bottom' ?
                    <svg ref={addRef} className={`${showInfo ? '' : 'hidden'} ${phase == 'start' ? 'animation-fadein' : 'animation-fadeout'} ml-2 top-0 left-0 absolute text-white`} style={{ zIndex:zIndex+2, width:'1em',transform: 'translate(0,1.1em)' }}  x="0px" y="0px" viewBox="0 0 255 255">
                        <path stroke="black" strokeWidth="8" strokeOpacity="0.2" fill='white' d="M 0 127.5 L 127.5 0 L 255,127.5"/>
                    </svg> :
                    infoPosition == 'right' ?
                    <svg ref={addRef} className={`${showInfo ? '' : 'hidden'} ${phase == 'start' ? 'animation-fadein' : 'animation-fadeout'} ml-2 top-0 left-0 absolute text-white`} style={{ zIndex:zIndex+2, width:'1em',transform: 'translate(0.9em,0.3em)' }}  x="0px" y="0px" viewBox="0 0 255 255">
                        <path stroke="black" strokeWidth="8" strokeOpacity="0.2" fill='white' d="M 127.5 0 L 0 127.5 L 127.5 255"/>
                    </svg>:

                    //TODO LEFT
                    ''}

        <div ref={addRef} className={`
        ${showInfo ? '' : 'hidden'}
        ${infoPosition == 'bottom' ? 'origin-top' :
                infoPosition == 'top' ? 'origin-bottom' :
                    infoPosition == 'left' ? 'origin-right' :
                        infoPosition == 'right' ? 'origin-left' : ''
            }
         ${phase == 'start' ? 'animation-popin-' : 'animation-popout-'}${infoPosition} rounded-lg w-96 absolute border shadow-md bg-white text-gray-400 tracking-normal p-3 ${customStyle}`}

         onMouseEnter={readyToEnter}
         onMouseLeave={readyToLeave}

            style={{
                zIndex:zIndex-2,
                transform: infoPosition
            }}
        ><FontAwesomeIcon onClick={e => {
            closeTip(e)
        }} className={`cursor-pointer hover:text-gray-500 absolute top-2 right-2 text-gray-300`} icon={['fas', 'times']} /><p style={{ zIndex:zIndex-1, whiteSpace: 'break-spaces' }}>{info}</p></div>
    </div>
})

export default Tip