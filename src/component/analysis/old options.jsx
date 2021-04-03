function a(){
    return (<>
            {/* Regression: linear regression */}
            <div className='p-5 flex flex-col'>
                {(option===0 && model === 0)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_lr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_LinearRegression?'':''}`} attrs={{list:'test_size_lr_list'}} />

                    <Label text='Regression Result:'/>
                    <DropDown defaultText={'Select plot'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_LinearRegression} items={['Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_LinearRegression(item)
                            setShowOptions_LinearRegression(1)
                        }
                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${showOptions_LinearRegression?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_LinearRegression?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['bar', 'scatter', 'line', 'heatmap']} onSelect={e=>{}} />

                    
             
                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metric'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_LinearRegression} items={['Explained Variance','Mean Absolute Error', 'Mean Squared Error','R2 Score', 'Poisson Deviance', 'Gamma Deviance']}
                        onSelect={name=>{
                            result.metric = name
                        }
                    }/>

                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_LinearRegression(e.target.checked)
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_LinearRegression?'':'hidden'}`} text='Set Parameters: fit_intercept'/>
                    <DropDown defaultText={'Select fit_intercept'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_LinearRegression?'':'hidden'}`}  customUlStyle='w-64' items={['True','False']}
                    onSelect={name=>{
                        result.param_fit_intercept_lr = name  //opt_fit_intercept_lr
                    }} />
                    <Label customStyle={`${showAdvancedOptions_LinearRegression?'':'hidden'}`} text='Set Parameters: normalize'/>
                    <DropDown defaultText={'Select normalize'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_LinearRegression?'':'hidden'}`}  customUlStyle='w-64' items={['True','False']}
                    onSelect={name=>{
                        result.param_normalize_lr = name  //opt_normalize_lr
                    }} />

                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_lr_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                </div>
                :''}
            </div>



            {/* regression: decision tree */}
            <div className='p-5 flex flex-col'>
                {(option===0 && model === 1)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_dtr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':''}`} attrs={{list:'test_size_dtr_list'}} />

                    <Label customStyle={`${showAdvancedOptions_DecisionTreeRegression?'':''}`} text='Set parameters: max_depth'/>
                    <Input onInput={e=>{
                        result.param_max_depth = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':''}`} attrs={{list:'max_depth_dtr_list'}} />


                    <Label text='Regression Result:'/>
                    <DropDown defaultText={'Select plot'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_DecisionTreeRegression} items={['Visualize Tree: Text Graph', 'Visualize Tree: Flowchart', 'Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_DecisionTreeRegression(item)
                            setShowOptions_DecisionTreeRegression(1)
                        }

                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${showOptions_DecisionTreeRegression?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_DecisionTreeRegression?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e=>{}} />

                   
                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['Explained Variance','Mean Absolute Error', 'Mean Squared Error','R2 Score', 'Poisson Deviance', 'Gamma Deviance']}
                    onSelect={name=>{
                        result.metric = name
                    }} />


                    <Checkbox label="Find the Best Hyper-Parameters: max_depth" defaultChecked={false}/>
                    <Input onInput={e=>{
                        result.find_n_estimators = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':''}`} attrs={{list:'find_max_depth_dtr_list'}} />


                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_DecisionTreeRegression(e.target.checked)
                    }}/>
                 
                    <Label customStyle={`${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`} text='Set Parameters: criterion'/>
                    <DropDown defaultText={'Select criterion'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`}  customUlStyle='w-64' items={['mse','friedman_mse','mae', 'poisson']}
                    onSelect={name=>{
                        result.param_criterion = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`} text='Set Parameters: splitter'/>
                    <DropDown defaultText={'Select splitter'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`}  customUlStyle='w-64' items={['best','random']}
                    onSelect={name=>{
                        result.param_splitter = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`} text='Set Parameters: max_features'/>
                    <DropDown defaultText={'Select max_features'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`}  customUlStyle='w-64' items={['auto','sqrt', 'log2']}
                    onSelect={name=>{
                        result.param_max_features = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`} text='Set Parameters: max_leaf_nodes'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`}  attrs={{list:'max_leaf_nodes_dtr_list'}} 
                    onInput={e=>{
                        result.param_max_leaf_nodes = e.target.value
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`} text='Set Parameters: random_state'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_DecisionTreeRegression?'':'hidden'}`}  attrs={{list:'random_state_dtr_list'}} 
                    onInput={e=>{
                        result.param_random_state = e.target.value
                    }}/>


                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: random_state'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  attrs={{list:'opt_kmeans_random_state'}} 
                    onInput={e=>{
                        result.param_random_state = e.target.value
                    }}/>

                  
                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_dtr_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                    <datalist id="max_depth_dtr_list"><option value="5"></option><option value="6"></option><option value="7"></option></datalist>
                    <datalist id="max_leaf_nodes_dtr_list"><option value="1"></option><option value="2"></option><option value="3"></option></datalist>
                    <datalist id="random_state_dtr_list"><option value="0"></option><option value="1"></option><option value="2"></option></datalist>
                    <datalist id="find_max_depth_dtr_list"><option value="1,2,3,4,5,10,15,20,25,50"></option></datalist>

                </div>
                :''}
            </div>


            {/* regression: random forest */}
            <div className='p-5 flex flex-col'>
                {(option===0 && model === 2)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_dtr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':''}`} attrs={{list:'test_size_rfr_list'}} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestRegression?'':''}`} text='Set parameters: max_depth'/>
                    <Input onInput={e=>{
                        result.param_max_depth = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':''}`} attrs={{list:'max_depth_rfr_list'}} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestRegression?'':''}`} text='Set parameters: n_estimators'/>
                    <Input onInput={e=>{
                        result.param_n_estimators = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':''}`} attrs={{list:'n_estimators_rfr_list'}} />


                    <Label text='Regression Result:'/>
                    <DropDown defaultText={'Select'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_RandomForestRegression} items={['Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_RandomForestRegression(item)
                            setShowOptions_RandomForestRegression(1)
                        }

                        return {
                            name:item,onClick
                        }
                    })}/>
                   
                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['Explained Variance','Mean Absolute Error', 'Mean Squared Error','R2 Score', 'Poisson Deviance', 'Gamma Deviance']}
                    onSelect={name=>{
                        result.metric = name
                    }} />


                    <Checkbox label="Find the Best Hyper-Parameters:" defaultChecked={false}/>
                    <Label text=''/>
                    <Label text='max_depth'/>
                    <Input onInput={e=>{
                        result.find_max_depth = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':''}`} attrs={{list:'find_max_depth_rfr_list'}} />
                     <Label text='n_estimators'/>
                    <Input onInput={e=>{
                        result.find_n_estimators = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':''}`} attrs={{list:'find_n_estimators_rfr_list'}} />



                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_RandomForestRegression(e.target.checked)
                    }}/>
                    <Label customStyle={`${showOptions_RandomForestRegression?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_RandomForestRegression?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e=>{}} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestRegression?'':'hidden'}`} text='Set Parameters: criterion'/>
                    <DropDown defaultText={'Select criterion'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':'hidden'}`}  customUlStyle='w-64' items={['mse', 'mae']}
                    onSelect={name=>{
                        result.param_criterion = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestRegression?'':'hidden'}`} text='Set Parameters: max_features'/>
                    <DropDown defaultText={'Select max_features'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':'hidden'}`}  customUlStyle='w-64' items={['auto','sqrt', 'log2']}
                    onSelect={name=>{
                        result.param_max_features = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestRegression?'':'hidden'}`} text='Set Parameters: max_leaf_nodes'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':'hidden'}`}  attrs={{list:'max_leaf_nodes_rfr_list'}} 
                    onInput={e=>{
                        result.param_max_leaf_nodes = e.target.value
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_RandomForestRegression?'':'hidden'}`} text='Set Parameters: random_state'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_RandomForestRegression?'':'hidden'}`}  attrs={{list:'random_state_rfr_list'}} 
                    onInput={e=>{
                        result.param_random_state = e.target.value
                    }}/>

                  
                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_rfr_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                    <datalist id="max_depth_rfr_list"><option value="5"></option><option value="6"></option><option value="7"></option></datalist>
                    <datalist id="n_estimators_rfr_list"><option value="1"></option><option value="2"></option><option value="3"></option></datalist>
                    <datalist id="find_max_depth_rfr_list"><option value="5,10,15,20"></option></datalist>
                    <datalist id="find_n_estimators_rfr_list"><option value="10,25,50,100"></option></datalist>
                    <datalist id="max_leaf_nodes_rfr_list"><option value="10"></option><option value="20"></option><option value="30"></option></datalist>
                    <datalist id="random_state_rfr_list"><option value="0"></option><option value="1"></option><option value="2"></option></datalist>
                </div>
                :''}
            </div>

            
               {/* regression: Support Vector Machine */}
               <div className='p-5 flex flex-col'>
                {(option===0 && model === 3)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_dtr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':''}`} attrs={{list:'test_size_svm_list'}} />

                    <Label customStyle={`${showAdvancedOptions_SVMRegression?'':''}`} text='Set parameters: C'/>
                    <Input onInput={e=>{
                        result.param_C = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':''}`} attrs={{list:'C_svm_list'}} />

                    <Label customStyle={`${showAdvancedOptions_SVMRegression?'':''}`} text='Set parameters: gamma'/>
                    <Input onInput={e=>{
                        result.param_gamma = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':''}`} attrs={{list:'gamma_svm_list'}} />


                    <Label text='Regression Result:'/>
                    <DropDown defaultText={'Select'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_SVMRegression} items={['Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_SVMRegression(item)
                            setShowOptions_SVMRegression(1)
                        }
                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${showOptions_SVMRegression?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_SVMRegression?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e=>{}} />

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['Explained Variance','Mean Absolute Error', 'Mean Squared Error','R2 Score', 'Poisson Deviance', 'Gamma Deviance']}
                    onSelect={name=>{
                        result.metric = name
                    }} />


                    <Checkbox label="Find the Best Hyper-Parameters:" defaultChecked={false}/>
                    <Label text=''/>
                    <Label text='C'/>
                    <Input onInput={e=>{
                        result.find_C = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':''}`} attrs={{list:'find_C_svm_list'}} />
                     <Label text='gamma'/>
                    <Input onInput={e=>{
                        result.find_gamma = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':''}`} attrs={{list:'find_gamma_svm_list'}} />



                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_SVMRegression(e.target.checked)
                    }}/>
                    <Label text=''/>
                    <Label customStyle={`${showAdvancedOptions_SVMRegression?'':'hidden'}`} text='Set Parameters: kernel'/>
                    <DropDown defaultText={'Select kernel'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':'hidden'}`}  customUlStyle='w-64' items={['linear', 'poly', 'rbf', 'sigmoid', 'precomputed']}
                    onSelect={name=>{
                        result.param_kernel = name
                    }} />

                  
                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_svm_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                    <datalist id="C_svm_list"><option value="1"></option><option value="2"></option><option value="3"></option></datalist>
                    <datalist id="gamma_svm_list"><option value="0.001"></option><option value="0.01"></option><option value="0.1"></option></datalist>
                    <datalist id="find_C_svm_list"><option value="1,2,3,5,6"></option></datalist>
                    <datalist id="find_gamma_svm_list"><option value="0.0001,0.001"></option></datalist>
                </div>
                :''}
            </div>

                
               {/* classification: logistic regression */}
               <div className='p-5 flex flex-col'>
                {(option===1 && model === 0)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_dtr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_LogisiticRegression?'':''}`} attrs={{list:'test_size_logr_list'}} />

                    <Label customStyle={`${showAdvancedOptions_LogisiticRegression?'':''}`} text='Set parameters: solver'/>
                    <DropDown defaultText={'Select solver'} showOnHover={false}  customUlStyle='w-64' items={['newton-cg','lbfgs', 'liblinear','sag', 'saga']}
                    onSelect={name=>{
                        result.para_solver = name
                    }} />
                    

                    <Label customStyle={`${showAdvancedOptions_LogisiticRegression?'':''}`} text='Set parameters: C'/>
                    <Input onInput={e=>{
                        result.param_C = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_LogisiticRegression?'':''}`} attrs={{list:'C_logr_list'}} />


                    <Label text='Classification Result:'/>
                    <DropDown defaultText={'Select'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_LogisiticRegression} items={['Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_LogisiticRegression(item)
                            setShowOptions_LogisiticRegression(1)
                        }
                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${showOptions_LogisiticRegression?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_LogisiticRegression?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e=>{}} />

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['Classification Report','Confusion Matrix', 'ROC Curve']}
                    onSelect={name=>{
                        result.metric = name
                    }} />


                    <Checkbox label="Find the Best Hyper-Parameters:" defaultChecked={false}/>
                    <Label text=''/>
                    <Label text='solver'/>
                    <Input onInput={e=>{
                        result.find_solver = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_LogisiticRegression?'':''}`} attrs={{list:'find_solver_logr_list'}} />
                     <Label text='C'/>
                    <Input onInput={e=>{
                        result.find_C = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_LogisiticRegression?'':''}`} attrs={{list:'find_C_logr_list'}} />



                    {/* <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_LogisiticRegression(e.target.checked)
                    }}/>
                    <Label text=''/>
                    <Label customStyle={`${showAdvancedOptions_LogisiticRegression?'':'hidden'}`} text='Set Parameters: kernel'/>
                    <DropDown defaultText={'Select kernel'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_SVMRegression?'':'hidden'}`}  customUlStyle='w-64' items={['linear', 'poly', 'rbf', 'sigmoid', 'precomputed']}
                    onSelect={name=>{
                        result.param_kernel = name
                    }} /> */}

                  
                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_logr_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                    <datalist id="C_logr_list"><option value="0.1"></option><option value="0.2"></option><option value="0.3"></option></datalist>
                    <datalist id="find_solver_logr_list"><option value="newton-cg,lbfgs,liblinear,sag,saga"></option></datalist>
                    <datalist id="find_C_logr_list"><option value="100,10,1.0,0.1,0.01"></option></datalist>
                </div>
                :''}
            </div>


            {/* classification: decision tree  DecisionTreeClassifier */} 
            <div className='p-5 flex flex-col'>
                {/* {(option===1 && model === 1)?

                :''} */}
            </div>

            {/* classification: RandomForestClassifier */} 
            <div className='p-5 flex flex-col'>
                {(option===1 && model === 2)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_dtr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':''}`} attrs={{list:'test_size_rfc_list'}} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestClassifier?'':''}`} text='Set parameters: max_depth'/>
                    <Input onInput={e=>{
                        result.param_max_depth = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':''}`} attrs={{list:'max_depth_rfc_list'}} />

                    <Label customStyle={`${showAdvancedOptions_RandomForestClassifier?'':''}`} text='Set parameters: n_estimators'/>
                    <Input onInput={e=>{
                        result.param_n_estimators = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':''}`} attrs={{list:'n_estimators_rfc_list'}} />


                    <Label text='Classification Result:'/>
                    <DropDown defaultText={'Select'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_RandomForestClassifier} items={['Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_RandomForestClassifier(item)
                            setShowOptions_RandomForestClassifier(1)
                        }
                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${showOptions_RandomForestClassifier?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_RandomForestClassifier?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e=>{}} />

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['Classification Report','Confusion Matrix', 'ROC Curve']}
                    onSelect={name=>{
                        result.metric = name
                    }} />


                    <Checkbox label="Find the Best Hyper-Parameters:" defaultChecked={false}/>
                    <Label text='max_depth'/>
                    <Input onInput={e=>{
                        result.find_max_depth = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':''}`} attrs={{list:'find_max_depth_rfc_list'}} />
                    <Label text='n_estimators'/>
                    <Input onInput={e=>{
                        result.find_n_estimators = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':''}`} attrs={{list:'find_n_estimators_rfc_list'}} />
           

                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_RandomForestClassifier(e.target.checked)
                    }}/>
                    <Label text=''/>
                    <Label customStyle={`${showAdvancedOptions_RandomForestClassifier?'':'hidden'}`} text='Set Parameters: criterion'/>
                    <DropDown defaultText={'Select criterion'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':'hidden'}`}  customUlStyle='w-64' items={['gini', 'entropy']}
                    onSelect={name=>{
                        result.param_criterion = name
                    }} />
                     <Label customStyle={`${showAdvancedOptions_RandomForestClassifier?'':'hidden'}`} text='Set Parameters: max_leaf_nodes'/>
                     <Input onInput={e=>{
                        result.param_max_leaf_nodes = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_RandomForestClassifier?'':''}`} attrs={{list:'max_leaf_nodes_rfc_list'}} />
        

                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_rfc_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                    <datalist id="max_depth_rfc_list"><option value="5"></option><option value="6"></option><option value="7"></option></datalist>
                    <datalist id="n_estimators_rfc_list"><option value="10"></option><option value="15"></option><option value="20"></option></datalist>
                    <datalist id="find_max_depth_rfc_list"><option value="5,10,15,20,50,70"></option></datalist>
                    <datalist id="find_n_estimators_rfc_list"><option value="10,25,50,100,150,200"></option></datalist>
                    <datalist id="max_leaf_nodes_rfc_list"><option value="20"></option><option value="30"></option></datalist>

                </div>
                :''}
            </div>


            {/* classification: NaiveBayesClassifier */} 
            <div className='p-5 flex flex-col'>
                {(option===1 && model === 3)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label text="Choose Test Size(%)"/>
                    <Input onInput={e=>{
                        result.test_size_dtr = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_NaiveBayesClassifier?'':''}`} attrs={{list:'test_size_nbc_list'}} />

                    <Label text="Choose Data Type"/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`w-64`} customUlStyle={`w-64`} items={['Numerical Data', 'Text Data']} onSelect={e=>{}} />



                    <Label text='Classification Result:'/>
                    <DropDown defaultText={'Select'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_NaiveBayesClassifier} items={['Predicted VS. Observed'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_NaiveBayesClassifier(item)
                            setShowOptions_NaiveBayesClassifier(1)
                        }
                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${showOptions_NaiveBayesClassifier?'':'hidden'}`} text='Plot Types'/>
                    <DropDown defaultText={'Select type'} showOnHover={false} customStyle={`${showOptions_NaiveBayesClassifier?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['Scatter', 'Bar', 'Line', 'Heatmap']} onSelect={e=>{}} />

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['Classification Report','Confusion Matrix', 'ROC Curve']}
                    onSelect={name=>{
                        result.metric = name
                    }} />


                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="test_size_nbc_list"><option value="30"></option><option value="20"></option><option value="10"></option></datalist>
                
                </div>
                :''}
            </div>

            
            
            {/* cluster:k-means */}
            <div className='p-5 flex flex-col'>
                {(option===2 && model === 0)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':''}`} text='Set parameters: n_clusters'/>
                    <Input onInput={e=>{
                        result.param_n_clusters = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':''}`} attrs={{list:'opt_k_kmeans_set_list'}} />


                    <Label text='Clustering Result:'/>
                    <DropDown defaultText={'Select plot'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_kmeans} items={['PCA Plot (* Do PCA first)', '2D All Pairs Clusters (* Do scale first)', '2D One Pair Clusters', '3D Clusters'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_Kmeans(item)
                            if(i===2){
                                setShowOptions_Kmeans(1)
                            }
                            // if(i==0){
                            //     setShowOptions_Kmeans(2) # how to set click and displacy PCA
                            // }
                            else{
                                setShowOptions_Kmeans(0)
                            }
                        }

                        return {
                            name:item,onClick
                        }
                    })}/>

                    <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Plot X'/>
                    <DropDown defaultText={'Select X-axis'} showOnHover={false} customStyle={`${showOptions_Kmeans?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />
                    <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Plot Y'/>
                    <DropDown defaultText={'Select Y-axis'} showOnHover={false} customStyle={`${showOptions_Kmeans?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />

                    {/* <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Find components'/> */}

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['inertia','centroid', 'silhouette','number of iterations']}
                    onSelect={name=>{
                        result.param_init = name
                    }} />


                    <Checkbox label="Find the Best Hyper-Parameters: n_clusters" defaultChecked={false}/>

                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_Kmeans(e.target.checked)
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: init'/>
                    <DropDown defaultText={'Select init'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  customUlStyle='w-64' items={['k-means++','random','centroids']}

                    onSelect={name=>{
                        result.param_init = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: max_iter'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  attrs={{list:'opt_kmeans_max_iter'}} 
                    onInput={e=>{
                        result.param_max_iter = e.target.value
                    }}/>
                    {/* <DropDown defaultText={'Select algorithm'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  items={['auto','full','elkan']}
                    onSelect={name=>{
                        result.algorithm = name
                    }}/> */}

                    <Label customStyle={`${showAdvancedOptions_Kmeans?'':'hidden'}`} text='Set Parameters: random_state'/>
                    <Input customStyle={`w-64 ${showAdvancedOptions_Kmeans?'':'hidden'}`}  attrs={{list:'opt_kmeans_random_state'}} 
                    onInput={e=>{
                        result.param_random_state = e.target.value
                    }}/>

                    

                   

                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="opt_k_kmeans_set_list"><option value="8"></option><option value="7"></option><option value="6"></option></datalist>
                    <datalist id="opt_kmeans_random_state"><option value="1"></option><option value="2"></option><option value="3"></option></datalist>
                    <datalist id="opt_kmeans_max_iter"><option value="100"></option><option value="200"></option><option value="300"></option></datalist>

                    {/* <Label text='Metrics of Model:'/> */}

                </div>
                :''}
            </div>


            {/* cluster:agglomerative */}
            <div className='p-5 flex flex-col'>
                {(option===2 && model === 1)?
                <div className='grid grid-cols-2 gap-4'>
                    <Label customStyle={`${showAdvancedOptions_agglomerative?'':''}`} text='Set parameters: n_clusters'/>
                    <Input onInput={e=>{
                        result.param_n_clusters = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_agglomerative?'':''}`} attrs={{list:'opt_n_clusters_agglo_list'}} />


                    <Label text='Clustering Result:'/>
                    <DropDown defaultText={'Select plot'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_agglomerative} items={['PCA Plot (* Do PCA first)', '2D All Pairs Clusters (* Do scale first)', '2D One Pair Clusters', '3D Clusters'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_agglomerative(item)
                            if(i===2){
                                setShowOptions_agglomerative(1)
                            }
                            // if(i==0){
                            //     setShowOptions_Kmeans(2) # how to set click and displacy PCA
                            // }
                            else{
                                setShowOptions_agglomerative(0)
                            }
                        }

                        return {
                            name:item,onClick
                        }
                    })}/>

                    <Label customStyle={`${showOptions_agglomerative?'':'hidden'}`} text='Plot X'/>
                    <DropDown defaultText={'Select X-axis'} showOnHover={false} customStyle={`${showOptions_agglomerative?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />
                    <Label customStyle={`${showOptions_agglomerative?'':'hidden'}`} text='Plot Y'/>
                    <DropDown defaultText={'Select Y-axis'} showOnHover={false} customStyle={`${showOptions_agglomerative?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />

                    {/* <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Find components'/> */}

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'} showOnHover={false}  customUlStyle='w-64' items={['inertia','centroid', 'silhouette','number of iterations']}
                    onSelect={name=>{
                        result.param_init = name
                    }} />


                    {/* <Checkbox label="Find the Best Hyper-Parameters: n_clusters" defaultChecked={false}/> */}

                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_agglomerative(e.target.checked)
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_agglomerative?'':'hidden'}`} text='Set Parameters: affinity'/>
                    <DropDown defaultText={'Select affinity'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_agglomerative?'':'hidden'}`}  customUlStyle='w-64' items={['euclidean','manhattan','cosine', 'precomputed']}

                    onSelect={name=>{
                        result.param_affinity = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_agglomerative?'':'hidden'}`} text='Set Parameters: linkage'/>
                    <DropDown defaultText={'Select linkage'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_agglomerative?'':'hidden'}`}  customUlStyle='w-64' items={['ward', 'complete', 'average', 'single']}

                    onSelect={name=>{
                        result.param_linkage = name
                    }} />

                    <Label customStyle={`${showAdvancedOptions_agglomerative?'':'hidden'}`} text='Set Parameters: compute_distances'/>
                    <DropDown defaultText={'Select compute_distances'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_agglomerative?'':'hidden'}`}  customUlStyle='w-64' items={['True', 'False']}

                    onSelect={name=>{
                        result.param_compute_distances = name
                    }} />
                   

                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    <datalist id="opt_n_clusters_agglo_list"><option value="8"></option><option value="7"></option><option value="6"></option></datalist>
                 

                </div>
                :''}
            </div>
			
			
			            {/* associate rule: apriori */}
            <div className='p-5 flex flex-col'>
                {(option===3 && model === 0)?
                <div className='grid grid-cols-2 gap-4'>

                    <Label text='Choose Transaction ID Column'/>
                    <DropDown defaultText={'Select column'} showOnHover={false} customStyle={`${showOptions_apriori?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />
                    <Label text='Choose Transaction Items Column'/>
                    <DropDown defaultText={'Select column'} showOnHover={false} customStyle={`${showOptions_apriori?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />

                    <Label customStyle={`${showAdvancedOptions_apriori?'':''}`} text='Set parameters: min_support'/>
                    <Input onInput={e=>{
                        result.param_min_support = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_apriori?'':''}`} attrs={{list:'opt_min_support_apriori_list'}} />
                    
                    <Label customStyle={`${showAdvancedOptions_apriori?'':''}`} text='Set parameters: metric'/>
                    <DropDown defaultText={'Select metric'} showOnHover={false} customStyle={`${showOptions_apriori?'':'hidden'} w-64`} customUlStyle={`w-64`} items={['lift', 'support', 'confidence']} onSelect={e=>{}} />

                    <Label customStyle={`${showAdvancedOptions_apriori?'':''}`} text='Set parameters: min_threshold'/>
                    <Input onInput={e=>{
                        result.param_min_threshold = e.target.value
                    }} customStyle={`w-64 ${showAdvancedOptions_apriori?'':''}`} attrs={{list:'opt_min_threshold_apriori_list'}} />
                    

                    <Label customStyle={`${showOptions_apriori?'':'hidden'}`} text='Plot X'/>
                    <DropDown defaultText={'Select X-axis'} showOnHover={false} customStyle={`${showOptions_apriori?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />
                    <Label customStyle={`${showOptions_apriori?'':'hidden'}`} text='Plot Y'/>
                    <DropDown defaultText={'Select Y-axis'} showOnHover={false} customStyle={`${showOptions_apriori?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} />

                    {/* <Label customStyle={`${showOptions_Kmeans?'':'hidden'}`} text='Find components'/> */}

                    <Label text='Metrics of Model:'/>
                    <DropDown defaultText={'Select metrics'}  customStyle={`w-64`}  customUlStyle={`w-64`} showOnHover={false} text={metrics_apriori} items={['Convert to Transaction Format','Support Itemsets for All Items', 'Association Rules for All Items', 'Support Itemsets for Specific Item', 'Association Rules for Specific Item', 'The Most Popular Items', 'Visualize Model'].map((item,i)=>{
                        let onClick = ()=>{
                            setMetrics_apriori(item)
                            if(i===3 || i===4){
                                setShowOptions_apriori(1)
                            }
                            // if(i==6){
                            //     // setShowOptions_apriori(2)
                            // }
                            else{
                                setShowOptions_apriori(0)
                            }
                        }

                        return {
                            name:item,onClick
                        }
                    })}/>
                    <Label customStyle={`${ShowOptions_apriori?'':'hidden'}`} text='Input Specific Item Name'/>
                    <Input onInput={e=>{
                        result.param_specific_item = e.target.value
                    }}/>
                    {/* <DropDown defaultText={'Select X-axis'} showOnHover={false} customStyle={`${ShowOptions_metric_apriori?'':'hidden'} w-64`} customUlStyle={`w-64`} items={dataset.num_cols} onSelect={e=>{}} /> */}
                   
                

                    <Checkbox label="Show Advanced Options" defaultChecked={false} onClick={e=>{
                        setShowAdvancedOptions_apriori(e.target.checked)
                    }}/>

                    <Label customStyle={`${showAdvancedOptions_apriori?'':'hidden'}`} text='Set Parameters: use_colnames'/>
                    <DropDown defaultText={'Select use_colnames'} showOnHover={false} customStyle={`w-64 ${showAdvancedOptions_apriori?'':'hidden'}`}  customUlStyle='w-64' items={['True','False']}

                    onSelect={name=>{
                        result.param_use_colnames = name
                    }} />

            
            
                    <Button text='Confirm' onClick={()=>{
                        let data = getData()
                        console.log(data);
                    }}/>

                    {/* <datalist id="opt_k_kmeans_set_list"><option value="8"></option><option value="7"></option><option value="6"></option></datalist>
                    <datalist id="opt_kmeans_random_state"><option value="1"></option><option value="2"></option><option value="3"></option></datalist>
                    <datalist id="opt_kmeans_max_iter"><option value="100"></option><option value="200"></option><option value="300"></option></datalist> */}

                    {/* <Label text='Metrics of Model:'/> */}

                </div>
                :''}
            </div>
    </>)
}