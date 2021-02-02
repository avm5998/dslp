import React, { useState, useEffect } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import Home from './component/home';
import Visualization from './component/visualization';
import Query from './component/query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'

//add all solid icon-fonts
library.add(fas)

const Menu = {
    'Main': [
        { text: 'Upload Data', icon: 'home', to: '/' },
        { text: 'Visualization', icon: 'chart-area', to: '/visualization' },
        { text: 'Query', icon: 'search', to: '/query' },
    ]
}

const Routes = () => {
    let dataset = useSelector(state => state.dataset)
    let [menuData, setMenuData] = useState(Menu)

    useEffect(() => {
        setMenuData(data => {
            data.Main[0].extraText = dataset.filename
            return {...data}
        })
    }, [dataset.filename])

    return (
        <div className='min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-80'>
            <div className='fixed flex flex-col top-0 left-0 w-2/12 bg-white h-full border-r'>

                <div className="flex items-center justify-center h-14 border-b">
                    <div>Awesome data mining</div>
                </div>

                <div className="overflow-y-auto overflow-x-hidden flex-grow">
                    <ul className="flex flex-col py-4 space-y-1">
                        {Object.keys(menuData).map(menu =>
                            <React.Fragment key={menu}>
                                <li className="px-5">
                                    <div className="flex flex-row items-center h-8">
                                        <div className="text-sm font-light tracking-wide text-gray-500">{menu}</div>
                                    </div>
                                </li>

                                {Menu[menu].map(item =>
                                    <li key={item.text}>
                                        <Link to={item.to} className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                            <span className="inline-flex justify-center items-center ml-4">
                                                <FontAwesomeIcon icon={item.icon} />
                                            </span>
                                            <span className="ml-2 text-sm tracking-wide truncate">{item.text}</span>
                                            <span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-indigo-500 bg-indigo-50 rounded-full">{item.extraText}</span>
                                        </Link>
                                    </li>
                                )}
                            </React.Fragment>
                        )}

                    </ul>
                </div>
            </div>

            <div className='w-10/12 absolute right-0'>
                <Switch>
                    <Route exact path='/' component={Home} />
                    <Route path='/visualization' component={Visualization} />
                    <Route path='/query' component={Query} />
                </Switch>
            </div>
        </div>
    )
}

export default Routes