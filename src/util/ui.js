import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react'
import { useThrottle } from './util'
import './ui.css'

export function Label({pos = 'left',text=''}){
    return (<div className={`flex items-center${pos==='mid'?'justify-center':pos==='right'?'justify-end':''}`}>{text}</div>)
}

export function Button({
    id, text, onClick = () => { }, disabled = false, disabledText = text, hoverAnimation = true, customStyle = '', overrideClass = ''
}) {
    return <button id={id} onClick={onClick} disabled={disabled} className={
        overrideClass ? overrideClass : `
    bg-transparent ${disabled ? 'cursor-default text-gray-400 border-gray-300' :
                `${hoverAnimation ? 'hover:bg-blue-400 hover:text-white hover:border-transparent text-blue-400 border-blue-500' : 'bg-blue-400 text-white border-transparent'} cursor-pointer `} 
    rounded font-semibold py-2 px-4 border focus:outline-none ${customStyle}`}>
        {disabled ? disabledText : text}
    </button>
}

export function MultiSelect({ defaultText = '', wrapSelection = true, selections, onSelect, passiveMode = false, getDesc = e => e, defaultOpen = true, customHeight = '', customWidth = '' }) {
    let [selected, setSelected] = useState([])
    let buttonRef = useRef()
    let menuRef = useRef()

    useEffect(() => {
        if (passiveMode) {
            menuRef.current.classList.add('invisible')
            setSelected([...selections])
        }

        if (!defaultOpen)
            toggleMenu()
    }, [selections])

    const toggleMenu = () => {
        buttonRef.current.classList.toggle('rotate180')
        menuRef.current.classList.toggle('invisible')
    }

    return (<div className={`${customHeight ? customHeight : 'h-64'} multiselect ${customWidth ? customWidth : 'w-full'} flex flex-col items-center mx-auto`}>
        <div className="w-full">
            <div className="flex flex-col items-center relative">
                <div className="w-full">
                    <div className="p-1 flex border border-gray-200 bg-white rounded">
                        <div className={`flex flex-auto ${wrapSelection ? 'flex-wrap' : 'flex-nowrap overflow-hidden'}`} onClick={() => {
                            if (!selected.length) toggleMenu()
                        }}>
                            {selected.map(e =>
                                <div key={e} className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-blue-700 bg-blue-100 border border-blue-300 ">
                                    <div className="text-xs font-normal leading-none max-w-full flex-initial">{getDesc(e)}</div>
                                    <div className="flex flex-auto flex-row-reverse">
                                        <div onClick={() => setSelected(all => {
                                            all.splice(all.indexOf(e), 1)
                                            onSelect(all)
                                            return [...all]
                                        })}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x cursor-pointer hover:text-blue-400 rounded-full w-4 h-4 ml-2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex-1" >
                                <input placeholder={selected.length > 0 ? '' : defaultText} disabled className={`${!selected.length ? 'cursor-pointer' : ''} text-center bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-gray-800`} />
                            </div>
                        </div>
                        <div className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200" onClick={toggleMenu}>
                            <button ref={buttonRef} className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none transition duration-150 ease-in-out">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-up w-4 h-4">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* transition duration-150 ease-in-out */}
                <div ref={menuRef} tabIndex={0} onBlur={() => menuRef.current.classList.toggle('invisible')} className="outline-none absolute shadow top-100 bg-white z-40 w-full lef-0 rounded max-h-select overflow-y-auto origin-top" style={{ transition: 'all .15s ease-in-out 0s' }}>
                    <div className="flex flex-col w-full">
                        {selections.map((selection, i) =>
                            <div key={selection + i} className={`cursor-pointer w-full border-gray-100 border-b hover:bg-blue-600 ${selected.indexOf(selection) !== -1 ? 'bg-blue-100' : ''}`}>
                                <div className={`flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative`} onClick={() => setSelected(all => {
                                    if (all.indexOf(selection) === -1)
                                        all.push(selection)
                                    else
                                        all.splice(all.indexOf(selection), 1)
                                    onSelect(all)
                                    return [...all]
                                })}>
                                    <div className="w-full items-center flex">
                                        <div className="mx-2 leading-6  ">{getDesc(selection)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export function DropDown({
    id,
    text,
    defaultText = undefined,
    items = [],
    onSelect,
    customStyle,
    customUlStyle,
    hideArrow,
    showOnHover = true,
    disabledRef = {}
}) {
    let ulRef = useRef(null)
    let buttonRef = useRef(null)
    let [ulOpen, setOpenUl] = useState(0)
    let [currentText, setCurrentText] = useState(defaultText)

    if (onSelect) {//items must be string array
        items = items.map((name, i) => ({
            name,
            onClick() {
                onSelect(name, i)
                return false
            }
        }))
    }

    let hasControl = defaultText !== undefined //give control to component itself
    return (<div className="w-full dropdown group inline-block">
        <button id={id} onClick={() => {
            if (!showOnHover) {
                setOpenUl(s => !s)
            }
        }} ref={buttonRef} className={`outline-none focus:outline-none border px-3 py-1 bg-white rounded-sm flex items-center min-w-32 ${customStyle}`}>
            <span className="pr-1 text-gray-400 flex-1">{hasControl ? currentText : text}</span>
            <span className={`${hideArrow ? 'hidden' : ''}`} >
                <svg
                    className={`fill-current h-4 w-4 transform 0 ${showOnHover ? 'group-hover:-rotate-180' : (ulOpen ? '-rotate-180' : '')} transition duration-150 ease-in-out`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path
                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                    />
                </svg>
            </span>
        </button>

        <ul ref={ulRef} className={`${customUlStyle} bg-white border rounded-sm transform ${showOnHover ? 'scale-0 group-hover:scale-100' : (ulOpen ? 'scale-100' : 'scale-0')} absolute transition duration-150 ease-in-out origin-top min-w-32 z-10`}>
            {items.map(item => {

                return item.items ?
                    <li key={item.name} className="rounded-sm relative px-3 py-1 hover:bg-gray-100">
                        <button className="w-full text-left flex items-center outline-none focus:outline-none">
                            <span className="pr-1 flex-1">{item.name}</span>
                            <span className={`mr-auto`}>
                                <svg className="fill-current h-4 w-4 transition duration-150 ease-in-out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path
                                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                                    />
                                </svg>
                            </span>
                        </button>
                        <ul className="bg-white border rounded absolute top-0 right-0 transition duration-150 ease-in-out origin-top-left min-w-32">
                            {item.items.map(subItem =>
                                <li key={subItem.name} className="bg-white text-gray-800 p-3 cursor-pointer px-3 py-1 hover:bg-gray-100" onClick={subItem.onClick}>{subItem.name}</li>
                            )}
                        </ul>
                    </li>
                    : <li key={item.name} className={`bg-white cursor-pointer rounded text-gray-800 p-3 hover:bg-gray-100 z-auto ${customUlStyle}`} onClick={e => {
                        if (disabledRef.current) {
                            e.preventDefault()
                            return
                        }

                        let res = item.onClick(e)

                        if (hasControl) {
                            setCurrentText(item.name)
                        }

                        if (res === false) {//hide dropdown
                            if (!showOnHover) {
                                setOpenUl(s => !s)
                            } else {
                                ulRef.current.style.display = 'none'
                                setTimeout(() => {
                                    ulRef.current.style.display = ''
                                }, 0)
                            }
                        }
                    }}>{item.name}</li>
            }
            )}
        </ul>
    </div>)
}

export function RangeSelector({ disabledRef = {}, min, max, onEnd, getText = (number) => {
    return `${number.toFixed(2)}`
} }) {
    let [left, setLeft] = useState(0)
    let [right, setRight] = useState(100)
    let [leftText, setLeftText] = useState(`${min}`)
    let [rightText, setRightText] = useState(`${max}`)
    let [leftX, setLeftX] = useState(-1)
    let [rightX, setRightX] = useState(-1)
    let [showMaxInput, setShowMaxInput] = useState(false)
    let [showMinInput, setShowMinInput] = useState(false)

    useEffect(() => {
        setLeftText(getText(min))
        setRightText(getText(max))
    }, [min, max])

    const dragLeft = useThrottle(e => {
        if (disabledRef.current) return

        if (e.clientX === 0 && e.clientY === 0) return
        let nleft = ((e.clientX - leftX) / (rightX - leftX)) * 100
        nleft = Math.max(0, Math.min(right, nleft))
        setLeft(nleft)
        setLeftText(getText(Number(min + (max - min) * nleft / 100)))
    }, 30)

    const dragRight = useThrottle(e => {
        if (disabledRef.current) return

        if (e.clientX === 0 && e.clientY === 0) return
        let nright = ((e.clientX - leftX) / (rightX - leftX)) * 100
        nright = Math.min(100, Math.max(left, nright))
        setRight(nright)
        setRightText(getText(Number(min + (max - min) * nright / 100)))
    }, 30)

    const confirmMinInput = (e) => {
        if (disabledRef.current) return

        setShowMinInput(false)
        let v = (e.target.value || '').trim()
        if (!v) return
        else v = Number(v)

        let leftValue = v, rightValue = min + right / 100 * (max - min)
        leftValue = Math.min(Math.max(min, leftValue), rightValue)
        let nleft = (leftValue - min) / (max - min) * 100
        setLeftText(getText(Number(min + (max - min) * nleft / 100)))
        setLeft(nleft)
    }

    const confirmMaxInput = (e) => {
        if (disabledRef.current) return

        setShowMaxInput(false)
        let v = (e.target.value || '').trim()
        if (!v) return
        else v = Number(v)

        let rightValue = v, leftValue = min + left / 100 * (max - min)
        rightValue = Math.min(Math.max(rightValue, leftValue), 100)
        let nright = (rightValue - min) / (max - min) * 100
        setRight(nright)
        setRightText(getText(Number(min + (max - min) * nright / 100)))
    }

    const dragComplete = () => {
        if (disabledRef.current) return

        let leftValue = min + (max - min) * left / 100
        let rightValue = min + (max - min) * right / 100
        onEnd(leftValue, rightValue)
    }

    const dragStart = e => {
        if (disabledRef.current) {
            e.preventDefault()
            return
        }

        e.dataTransfer.setDragImage(new Image(), 0, 0);
    }

    return (<div className="inline-block w-64">
        <div className="py-1 relative min-w-full">
            <div className="h-2 bg-gray-200 rounded-full">
                {/* middle */}
                <div className="absolute h-2 rounded-full bg-blue-400 w-0" style={{ width: `${right - left}%`, left: `${left}%` }}></div>

                {/* left */}
                <div ref={ref => { if (ref && leftX == -1) setLeftX(ref.getBoundingClientRect().x) }} draggable={true} onDragStart={dragStart} onDragEnd={dragComplete} onDrag={dragLeft} className="absolute h-4 flex items-center justify-center w-4 rounded-full bg-white shadow border border-gray-300 -ml-2 top-0 cursor-pointer" style={{ left: `${left}%` }}>
                    <div className="relative -mt-2 w-1">
                        <div className="absolute z-40 opacity-100 bottom-100 mb-2 left-0 min-w-full" style={{ marginLeft: '-25px' }}>
                            <div className="relative shadow-md" data-text onDoubleClick={() => setShowMinInput(true)}>
                                {showMinInput ? <input ref={ref => ref ? ref.focus() : ''} className="-ml-3 left-0 w-16 absolute truncate rounded bg-black text-white text-xs py-1 px-4" onBlur={confirmMinInput} onKeyDown={e => e.keyCode === 13 ? confirmMinInput(e) : ''} /> : ''}
                                <div className="bg-black -mt-8 -ml-3 text-white truncate text-xs rounded py-1 px-3 w-16 text-center">{leftText}</div>
                                <svg className="absolute text-black w-full h-2 left-0 top-100" x="0px" y="0px" viewBox="0 0 255 255">
                                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"></polygon>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* right */}
                <div ref={ref => { if (ref && rightX == -1) setRightX(ref.getBoundingClientRect().x) }} draggable={true} onDragStart={dragStart} onDragEnd={dragComplete} onDrag={dragRight} className="absolute h-4 flex items-center justify-center w-4 rounded-full bg-white shadow border border-gray-300 -ml-2 top-0 cursor-pointer" style={{ left: `${right}%` }}>
                    <div className="relative -mt-2 w-1">
                        <div className="absolute z-40 opacity-100 bottom-100 mb-2 left-0 min-w-full" style={{ marginLeft: '-25px' }}>
                            <div className="relative shadow-md" data-text onDoubleClick={() => setShowMaxInput(true)}>
                                {showMaxInput ? <input ref={ref => ref ? ref.focus() : ''} className="-ml-2 left-0 w-16 absolute truncate rounded bg-black text-white text-xs py-1 px-4" onBlur={confirmMaxInput} onKeyDown={e => e.keyCode === 13 ? confirmMaxInput(e) : ''} /> : ''}
                                <div className="bg-black mt-4 -ml-2 text-white truncate text-xs rounded py-1 px-3 w-16 text-center">{rightText}</div>
                                <svg className="absolute text-black w-full h-2 left-0" x="0px" y="0px" viewBox="0 0 255 255" style={{ top: '-0.25rem' }}>
                                    <polygon className="fill-current" points="0,127.5 127.5,0, 255,127.5"></polygon>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute text-gray-800 -ml-1 bottom-0 left-0 -mb-6">{min}</div>
                <div className="absolute text-gray-800 -mr-1 bottom-0 right-0 mb-6">{max}</div>
            </div>
        </div>
    </div>
    )
}


export function Modal({ isOpen, setIsOpen, duration = 300, children, onClose = () => { }, contentStyleText = '', style = {} }) {
    let modalBg = useRef()
    let [hidden, setHidden] = useState(true)
    let [realOpen, setIsRealOpen] = useState(false)//if hidden and opacity changed simontaneously, animation fails

    useEffect(() => {
        if (!isOpen && !hidden) {
            setTimeout(() => {
                setHidden(true)
            }, duration)
        } else if (isOpen && hidden) {
            setHidden(false)
        }
        setTimeout(() => setIsRealOpen(isOpen))
    }, [isOpen])

    return (<div ref={modalBg} onClick={e => {
        if (e.target === modalBg.current) {
            onClose()
            setIsOpen(false)
        }
    }
    } className={`modal-bg transition-opacity duration-${duration} pt-16 fixed w-full h-full left-0 top-0 m-auto overflow-auto flex justify-center items-center ${hidden ? 'hidden' : ''} ${realOpen ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: 'rgba(0,0,0,.3)', zIndex: 1 }}>
        <div className={`modal-content relative m-auto bg-gray-100 w-auto ${contentStyleText} shadow-lg`} style={style}>
            {children}
        </div>
    </div>)
}

export function Radio({ label, name, customStyle = '', defaultChecked = false, onChange = () => { } }) {
    return (
        <label className={`inline-flex items-center ${customStyle}`}>
            <input name={name} onChange={e => onChange(e)} type="radio" className="form-radio h-5 w-5 bg-gray-100 border-2 border-blue-300" defaultChecked={defaultChecked} /><span className="ml-2 text-gray-700">{label}</span>
        </label>)
}

export const Checkbox = forwardRef(({ item = '', forwardedRef, disabledRef = {}, label, name, customStyle = '', defaultChecked = false, onClick = () => { }, onChange = () => { } }, ref) => {
    return (
        <label className={`inline-flex items-center ${customStyle}`} onClick={e => {
            if (disabledRef.current) {
                e.preventDefault()
                return
            }

            onClick(e)
        }}>
            <input ref={ref} name={name} onChange={e => {
                if (disabledRef.current) {
                    e.preventDefault()
                    return
                }

                onChange(e)
            }} type="checkbox" item={item} className="form-checkbox h-5 w-5 bg-gray-100 border-2 border-blue-300" defaultChecked={defaultChecked} /><span className="ml-2 text-gray-700">{label}</span>
        </label>)
})
