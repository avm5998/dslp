import React,{useRef,useEffect, useCallback, useState} from 'react';
import './index.css'
import {action as DataSetActions} from '../../reducer/dataset'
import { useSelector, useDispatch } from 'react-redux'

const Help = {
  'Overview':'Overview of the dataset',
  'Variables':'The variables shows details about each variable, such as the unique values, mean, min, max, and the number of zeros. The histogram for number values shows the distribution of data and it will be easy to find out the most common values and their scopes. Also, it is useful to detect the value outliers.',
  'Interactions':'The interactions are scatter plots for each pair of different features.  Scatter plots are very useful to discover the correlations or trends in the data. For example, if the scattered points line up from the origin to top right, there might be a strong postive correlation between the chosen pair of features.',
  'Correlations':'The visualized correlations show the linear correlation between variables. There are four different correlation coefficients matrices. '
}

const initialHelp = {}

for(let key in Help){
  initialHelp[key] = {
    visible:false,
    top:0,
    left:0
  }
}

const Question = ({title = '', content = '', top = 0, left = 0, visible = false})=>{
  return (<div className="question" style={{
    display:visible?'flex':'none',
    top,left
  }}>
    <div className='question-title'>{title}</div>
    <div className='question-content'>{content}</div>
  </div>)
}

const Visualization = (props) => {
  const dataImg = useRef()
  const dispatch = useDispatch()
  const dataset = useSelector(state => state.dataset)
  const [help, setHelp] = useState(initialHelp)

  const onLoad = e=>{
    let doc = e.target.contentDocument
    let win = e.target.contentWindow
    let style = doc.createElement('style')
    style.innerHTML = `
      .question-mark{
        display: inline-flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin-left: 15px;
        font-size: 20px;
        border-radius: 100%;
        border: 2px solid #999;
        height: 30px;
        color: #666;
        width: 30px;
        text-align: center;
        transform: translateY(-10px);
      }
    `
    doc.body.appendChild(style)

    let headers = doc.querySelectorAll('h1')
    
    win.addEventListener('scroll',(e)=>{
      setHelp(state=>{
        for(let key in state)
          state[key].visible = false
        return {...state}
      })
    })

    //add question mark beside headers
    for(let header of headers){
      let content = header.innerHTML
      for(let key in Help){
        if(key === content){
          const questionMarkEl = doc.createElement('div')
          questionMarkEl.innerHTML = '?'
          questionMarkEl.classList.add('question-mark')
          questionMarkEl.addEventListener('click',()=>{
            setHelp(state=>{
              state[content].visible = true
              const dom = questionMarkEl.getBoundingClientRect()
              Object.assign(state[content], {top:dom.top, left:dom.left})
              return {...state}
            })
          })

          header.appendChild(questionMarkEl, header.nextSibling)
          break
        }
      }
    }
  }

  return (<div>
    {dataset.mainImg.loaded?'':<div>No visualized data</div>}
    <img ref={dataImg} src={`data:image/png;base64,${dataset.mainImg.base64}`} alt="please load first"/>
    <div>
      <div>{dataset.profile.loaded?'Profile Loaded.':'Profile not loaded yet.'}</div>
      <iframe id='data_iframe' onLoad={onLoad} style={{position:dataset.profile.loaded?'absolute':'none',display:dataset.profile.loaded?'inherit':'none',left:0,top:0,border:'none',width:'100vw',height:'100vh'}} srcDoc={dataset.profile.html}/>
      {Object.keys(help).map((key,i)=>
        <Question key={i} title={key} content={Help[key]} {...help[key]} />
      )}
    </div>

    <div className='documents'>
      <a href="http://localhost:9999" target="_blank">Documents</a>
    </div>
  </div>)
}

export default Visualization;