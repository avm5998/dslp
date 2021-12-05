# Data Science Learning Platform Modify Instruction

@Time: November 18, 2021 

@Author: Xinyu Zhang

@Email: xz1753@rit.edu

# Modify Question Mark

---

## Data Module

### Path: awesome-data-mining/src/component/home/index.jsx

![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled.png)

- Use recommended:
    - Line: 373 in info
        
        ```jsx
        <InlineTip infoPosition={'right'} info={'Use recommended dataset instead of your own'} customStyle={'ml-2'} />
        ```
        
- Force Update:
    - Line: 377 in info
        
        ```jsx
        <InlineTip infoPosition={'right'} info={'When this is checked, the file you updated with the same filename will be overwritten. Otherwise it will use the previous one you updated.'} customStyle={'ml-2'} />
        ```
        

---

## Data Preprocessing Module

### Path: awesome-data-mining/src/component/preprocessing/index.jsx

- Active Status:
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%201.png)
    
    - Line: 497 in info
    
    ```jsx
    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
    ```
    

---

## Data Visualization Module

### Path: awesome-data-mining/src/component/visualization_new/index.jsx

- Active Status:
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%202.png)
    
    - Line: 246 in info
    
    ```jsx
    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' >
    ```
    

1. Area Graph:
    
    Path: awesome-data-mining/src/component/visualization_new/areaGraph.jsx
    
    - Gropu By, X Axis, Y Axis:
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%203.png)
        
        - Line: 19 to 24 in info
        
        ```jsx
        <div className={`grid grid-cols-2 gap-4 p-8 w-auto ${activeTab == 0 ? '' : 'hidden'}`}>
        	<Label text='Group By:'><InlineTip info={`Group By`} /></Label>
          <DropDown defaultText='Select Group By' width='w-96' items={dataset.cate_cols} onSelect={e => result.group_by = e} />
          <Label text='X Axis:'><InlineTip info={`X Axis`} /></Label>
          <DropDown defaultText='Select X Axis' width='w-96' items={dataset.num_cols} onSelect={e => result.x = e} />
        	<Label text='Y Axis:'><InlineTip info={`Y Axis`} /></Label>
        	<DropDown defaultText='Select Y Axis' width='w-96' items={dataset.num_cols} onSelect={e => result.y = e} />
        </div>
        ```
        
2. Bar Chart
    
    Path: awesome-data-mining/src/component/visualization_new/barChart.jsx
    
    - X Axis, Y Axis:
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%204.png)
        
        - Line: 18 to 21 in info
        
        ```jsx
        <Label text='X Axis:'><InlineTip info={`*Required\nThe data on X Axis`} /></Label>
        <DropDown defaultText='Select X Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.x = e} />
        <Label text='Y Axis:'><InlineTip info={`*Required\nThe data on Y Axis`} /></Label>
        <DropDown defaultText='Select Y Axis' customStyle='w-96' customUlStyle='w-96' showOnHover={false} items={dataset.cols} onSelect={e => result.y = e} />
        ```
        
3. Box Plot
    
    Path: awesome-data-mining/src/component/visualization_new/barPlot.jsx
    
    - X Axis, Y Axis:
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%204.png)
        
        - Line: 19 to 22 in info
            
            ```jsx
            <Label text='*X Axis:'><InlineTip info={`X Axis`} /></Label>
            <MultiSelect zIndex={100} defaultText='Select X Axis' width='w-96' selections={dataset.num_cols} onSelect={e => result.x = e} />
            <Label text='*Y Axis:'><InlineTip info={`Y Axis`} /></Label>
            <DropDown zIndex={99} defaultText='Select Y Axis' width='w-96' items={dataset.num_cols} onSelect={e => result.y = e} />
            ```
            
4. Histogram
    
    Path: awesome-data-mining/src/component/visualization_new/histogram.jsx
    
    - Columns, Bins, Stacked
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%205.png)
        
        - Line 21 to 28 in info
            
            ```jsx
            <Label text='Columns:'><InlineTip info={`*Required\n Select numerical columns to see the distributions. \n If you select more than one numerical column, the columns you selected are better to have similar meanings and ranges`}/></Label>
            <MultiSelect width={'w-60'}  selections={dataset.num_cols} onSelect={(e) => {result.cols = e}} />
            <Label text='Stacked:'><InlineTip info={`If you select multiple columns, the results will overlap each other if stacked is false, otherwise, it will not.`}/></Label>
            <Checkbox label={``} defaultChecked={true} onChange={e=>result.stacked = e.target.checked}/>
            <Label text='Bins:'><InlineTip info={`How many chunks will the range of data be splited into`}/></Label>
            <Input attrs={{list:'histogram_bins_list'}} onInput={e=>result.bins = e.target.value} placeholder='Please input the number of bins' defaultValue={10}/>
            ```
            
    - Group by
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%206.png)
        
        - Line 34 in info
        
        ```jsx
        <Label text='Group by:'><InlineTip info={`If histogram data is aggregated, only the first option in "Columns" will take effect.`}/></Label>
        ```
        
5. Line Garph
    
    Path: awesome-data-mining/src/component/visualization_new/lineGraph.jsx
    
    - X Axis, Y Axis, Transformation column, Transformation function
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%207.png)
        
        - Line 21 to 28 in info
        
        ```jsx
        <Label text='X Axis:'><InlineTip info={`*Required\nThe data on X Axis`}/></Label>
        <DropDown defaultText='Select X Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e=>result.x = e}/>
        <Label text='Y Axis:'><InlineTip info={`*Required\nThe data on Y Axis`}/></Label>
        <DropDown defaultText='Select Y Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e=>result.y = e}/>
        <Label text='Transformation column:'><InlineTip info={`Apply transformation function to a column, the code are straight forward and you can modify the code to transform more columns `}/></Label>
        <DropDown defaultText='Column' customStyle='w-60' showOnHover={false} blankOption={'Do not transform'} items={dataset.cols} onSelect={(e,i)=>result.trans_col = e}/>
        <Label text='Transformation function:'><InlineTip info={`Transformation type, Logarithm function is: f(x)=log10(x), Exponential function is: f(x)=e^x`}/></Label>
        <DropDown defaultText='Convert type' customStyle='w-60' showOnHover={false} items={['Logarithm','Square root','Exponential','Logit']} onSelect={(e,i)=>result.trans_fn = e}/>
        ```
        
6. Pie Chart
    
    Path: awesome-data-mining/src/component/visualization_new/pieChart.jsx
    
    - Category, Numerical
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%208.png)
        
        - Line 20 to 23 in info
        
        ```jsx
        <Label text='Category'><InlineTip info={`*Required\nThe categories of numerical data.`}/></Label>
        <DropDown defaultText='Select Category Column' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={dataset.cate_cols} onSelect={e=>result.cate_col = e}/>
        <Label text='Numerical:'><InlineTip info={`*Required\nThe numerical data of which the proportion will be represented in the chart.`}/></Label>
        <DropDown defaultText='Select Numerical Column' customStyle='h-10 w-60' customUlStyle='h-10 w-60' showOnHover={false} items={dataset.num_cols} onSelect={e=>result.num_col = e}/>
        ```
        
7. Heatmap
    
    Path: awesome-data-mining/src/component/visualization_new/heatmap.jsx
    
    - Categorical variable
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%209.png)
        
        - Line 19 to 22 in info
        
        ```jsx
        <Label text='Categorical variable:'><InlineTip info={`First categorical variable`} /></Label>
        <DropDown defaultText='Select variable' width='w-96' items={dataset.cate_cols} onSelect={e => result.x = e} />
        <Label text='Categorical variable:'><InlineTip info={`Second categorical variable`} /></Label>
        <DropDown defaultText='Select variable' width='w-96' items={dataset.cate_cols} onSelect={e => result.y = e} />
        ```
        
8. Scatter Plot
    
    Path: awesome-data-mining/src/component/visualization_new/scatterPlot.jsx
    
    - X Axis, Y Axis
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2010.png)
        
        - Line 20 to 29 in info
            
            ```jsx
            <Label text='X Axis:'><InlineTip info={`*Required\nThe data on X Axis`} /></Label>
            <DropDown defaultText='Select X Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e => {result.x = e
            if(guideStep == 4) setGuideStep(5)}} />
            <Label text='Y Axis:'><InlineTip info={`*Required\nThe data on Y Axis`} /></Label>
            <DropDown defaultText='Select Y Axis' customStyle='w-60' showOnHover={false} items={dataset.cols} onSelect={e => {result.y = e
            if(guideStep == 5) setGuideStep(6)}}/>
            ```
            
9. Common Options
    
    Path: awesome-data-mining/src/component/visualization_new/commonOption.jsx
    
    - Plot Engine, Drop NA Rows, Transformation function
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2011.png)
        
        - Line 108 to 122 in info
            
            ```jsx
            <Label text='Plot Engine:'><InlineTip info={`Python library used in plotting`} /></Label>
            <DropDown defaultValue={DEFAULT_RESULT.engine} width='w-60' items={options.engine} onSelect={(e, i) => {setVisibility(getVisibilityStyle(e))result.engine = e}} />
            <Label text='Figure Title:' />
            <Input placeholder="Please input the figure title" onInput={(e,v) => result.figureTitle = v} />
            <Label text='Drop NA Rows:'><InlineTip info={`Drop row with empty data`} /></Label>
            <Checkbox label='Drop NA Rows' onChange={e => result.dropna_row = e.target.checked} />
            <Label text='Drop NA Columns:'><InlineTip info={`Drop column with empty data`} /></Label>
            <Checkbox label='Drop NA Columns' onChange={e => result.dropna_col = e.target.checked} />
            <Label text='Transformation column:'><InlineTip info={`Apply transformation function to a column, the code are straight forward and you can modify the code to transform more columns `} /></Label>
            <DropDown defaultText='Column' width='w-60' blankOption={'Do not transform'} items={dataset.cols} onSelect={(e, i) => result.trans_col = e} />
            <Label text='Transformation function:'><InlineTip info={`Transformation type, Logarithm function is: f(x)=log10(x), Exponential function is: f(x)=e^x`} /></Label>
            <DropDown defaultText='Convert type' width='w-60' items={['Logarithm', 'Square root', 'Exponential', 'Logit']} onSelect={(e, i) => result.trans_fn = e} />
            ```
            
    - X label, Y label, Filter column
        - Line 133 to 137 in info
        
        ```jsx
        <Label {...visibility.xLabel} text='X label:'><InlineTip info={`The label on X Axis`} /></Label>
         <Input {...visibility.xLabel} width={'w-60'} placeholder='X label' onInput={(e,v) => result.xlabel = v} />
         <Label {...visibility.yLabel} text='Y label:'><InlineTip info={`The label on Y Axis`} /></Label>
         <Input {...visibility.yLabel} width={'w-60'} placeholder='Y label' onInput={(e,v) => result.ylabel = v} />
         <Label text='Filter column'><InlineTip info={`Filter of some specific data, specified by a column name and a condition`} /></Label>
         <DropDown defaultText='Select X Axis' width='w-60' items={dataset.cols} onSelect={e => result.filter_col = e} blankOption={'No column'} />
        ```
        

---

## Feature Engineering Module

### Path: awesome-data-mining/src/component/featureEngineering/index.jsx

- Active Status:
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2012.png)
    
    - Line: 474 in info
    
    ```jsx
    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
    ```
    

---

## Feature Selection Module

### Path: awesome-data-mining/src/component/featureSelection/index.jsx

![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2013.png)

- Variables X:
    
    Line 320
    
    ```jsx
    <div className='flex items-center'>Variables X = <InlineTip info="Variables X can only be numerical" /></div>
    ```
    
- Target Y:
    
    Line 322
    
    ```jsx
    <div className='flex items-center'>Target Y = <InlineTip info="Target Y can only be numerical" /></div>
    ```
    
- Select K=? Best Features:
    
    Line 324
    
    ```jsx
    <div className='flex items-center'>Select K=? Best Features <InlineTip info="Integer, must be smaller than the number of Variables X. Default: the number of Variables X" /> </div>
    ```
    
- Plot size:
    
    Line 363
    
    ```jsx
    <div className='flex items-center'>Plot size<InlineTip info="Adjust plot size (width, height). Default: 5,5" /></div>
    ```
    
- Plot type:
    
    Line 365
    
    ```jsx
    <div className='flex items-center'>Plot type<InlineTip info="Adjust plot type. Default: bar" /></div>
    ```
    

---

## Analysis Module

### Path: awesome-data-mining/src/component/analysis/index.jsx

- Activate Status:
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2014.png)
    
    Line 706
    
    ```jsx
    <InlineTip zIndex={10} info='The loading status of a remote environment, python code will be executed in that environment as soon as it is ready.' />
    ```
    
- Regression
    - Linear Regression
        
        Path: awesome-data-mining/src/component/analysis/option/regression/linearRegression.jsx
        
        **Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2015.png)
        
        - Select Variable Columns:
            
            Line 33
            
            ```jsx
            <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
            ```
            
        - Select Target Column:
            
            Line 44
            
            ```jsx
            <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
            ```
            
        - Choose Test Size(%):
            
            Line 51
            
            ```jsx
            <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
            ```
            
        - Predicted vs. Observed:
            
            Line 56
            
            ```jsx
            <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset."/></Label>
            ```
            
        - Metrics of Model:
            
            Line 63
            
            ```jsx
            <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
            ```
            
        
        **Advanced Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2016.png)
        
        - Set Parameters: fit_intercept
            
            Line 74
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: fit_intercept'><InlineTip info="Default=True. Whether to calculate the intercept for this model. If set to False, no intercept will be used in calculations. Details see https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"/></Label>
            ```
            
        - Set Parameters: normalize
            
            Line 79
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: normalize'><InlineTip info="Default=False. If True, the regressors X will be normalized before regression. Details see https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"/></Label>
            ```
            
    - Decision Tree Regression
        
        Path: awesome-data-mining/src/component/analysis/option/regression/decisiontreeRegression.jsx
        
        **Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2017.png)
        
        - Select Variable Columns:
            
            Line 40
            
            ```jsx
            <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
            ```
            
        - Select Target Column:
            
            Line 51
            
            ```jsx
            <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
            ```
            
        - Choose Test Size(%):
            
            Line 58
            
            ```jsx
            <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
            ```
            
        - Set parameters: max_depth
            
            Line 63
            
            ```jsx
            <Label text='Set parameters: max_depth'><InlineTip info="Integer or None. Default: None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."/></Label>
            ```
            
        - Predicted vs. Observed
            
            Line 69
            
            ```jsx
            <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset. Note: Set 'Visualize Tree=No Plot'; Default:line"/></Label>
            ```
            
        - Metrics of Model:
            
            Line 76
            
            ```jsx
            <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
            ```
            
        - Find the Best Hyper-Parameters: max_depth
            
            Line 83
            
            ```jsx
            <Label text='Find the Best Hyper-Parameters: max_depth'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter:max_depth'"/></Label>
            ```
            
        
        **Advanced Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2018.png)
        
        - Set Parameters: criterion
            
            Line 94
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: criterion'><InlineTip info="Default: mse. The function to measure the quality of a split. “mse” applies the mean squared error, “friedman_mse” uses mean squared error with Friedman’s improvement score for potential splits, “mae” relates to the mean absolute error, “poisson” uses reduction in Poisson deviance to find splits. "/></Label>
            ```
            
        - Set Parameters: splitter
            
            Line 99
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: splitter'><InlineTip info="Default: best. The strategy used to choose the split at each node. Supported strategies are “best” to choose the best split and “random” to choose the best random split."/></Label>
            ```
            
        - Set Parameters: max_features
            
            Line 104
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: max_features'><InlineTip info="Default: None. The number of features to consider when looking for the best split. If “auto”, then max_features=n_features; If “sqrt”, then max_features=sqrt(n_features); If “log2”, then max_features=log2(n_features); If None, then max_features=n_features."/></Label>
            ```
            
        - Set Parameters: max_leaf_nodes
            
            Line 109
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: max_leaf_nodes'><InlineTip info="Integer or None. Default: None. Grow a tree with max_leaf_nodes in best-first fashion.  If None then unlimited number of leaf nodes."/></Label>
            ```
            
        - Set Parameters: random_state
            
            Line 113
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: random_state'><InlineTip info="Integer or None. Default: None. Controls the randomness of the estimator. The features are always randomly permuted at each split."/></Label>
            ```
            
    - Random Forest Regression
        
        Path:awesome-data-mining/src/component/analysis/option/regression/randomforestsRegression.jsx
        
        **Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2019.png)
        
        - Select Variable Columns:
            
            Line 43
            
            ```jsx
            <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
            ```
            
        - Select Target Column:
            
            Line 53
            
            ```jsx
            <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
            ```
            
        - Choose Test Size(%):
            
            Line 60
            
            ```jsx
            <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
            ```
            
        - Set parameters: max_depth
            
            Line 65
            
            ```jsx
            <Label text='Set parameters: max_depth'><InlineTip info="Integer or None. Default: None. The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples."/></Label>
            ```
            
        - Set parameters: n_estimators
            
            Line 70
            
            ```jsx
            <Label text='Set parameters: n_estimators'><InlineTip info="Integer. Default: 100. The number of trees in the forest."/></Label>
            ```
            
        - Predicted vs. Observed
            
            Line 69
            
            ```jsx
            <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset. Note: Set 'Visualize Tree=No Plot'; Default:line"/></Label>
            ```
            
        - Metrics of Model:
            
            Line 83
            
            ```jsx
            <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
            ```
            
        - Find the Best Hyper-Parameters: max_depth
            
            Line 90
            
            ```jsx
            <Label text='Find the Best Hyper-Parameters: max_depth'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter:max_depth'"/></Label>
            ```
            
        - Find the Best Hyper-Parameters: n_estimators
            
            Line 94
            
            ```jsx
            <Label text='Find the Best Hyper-Parameters: n_estimators'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter: n_estimators'"/></Label>
            ```
            
        
        **Advanced Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2020.png)
        
        - Set Parameters: criterion
            
            Line 103
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: criterion'><InlineTip info="Default: mse. The function to measure the quality of a split. “mse” applies the mean squared error, “friedman_mse” uses mean squared error with Friedman’s improvement score for potential splits, “mae” relates to the mean absolute error, “poisson” uses reduction in Poisson deviance to find splits. "/></Label>
            ```
            
        - Set Parameters: max_features
            
            Line 108
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: max_features'><InlineTip info="Default: None. The number of features to consider when looking for the best split. If “auto”, then max_features=n_features; If “sqrt”, then max_features=sqrt(n_features); If “log2”, then max_features=log2(n_features); If None, then max_features=n_features."/></Label>
            ```
            
        - Set Parameters: max_leaf_nodes
            
            Line 113
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: max_leaf_nodes'><InlineTip info="Integer or None. Default: None. Grow a tree with max_leaf_nodes in best-first fashion.  If None then unlimited number of leaf nodes."/></Label>
            ```
            
        - Set Parameters: random_state
            
            Line 117
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: random_state'><InlineTip info="Integer or None. Default: None. Controls the randomness of the sampling of the features."/></Label>
            ```
            
    - SVM Regression
        
        Path:awesome-data-mining/src/component/analysis/option/regression/svmRegression.jsx
        
        **Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2021.png)
        
        - Select Variable Columns:
            
            Line 38
            
            ```jsx
            <Label customStyle={``} text='Select Variable Columns:' ><InlineTip info="Select the independent columns"/></Label>
            ```
            
        - Select Target Column:
            
            Line 48
            
            ```jsx
            <Label customStyle={``} text='Select Target Column:' ><InlineTip info="Select the dependent column"/></Label>
            ```
            
        - Choose Test Size(%):
            
            Line 55
            
            ```jsx
            <Label text="Choose Test Size(%)"><InlineTip info="Use part of dataset to train the model. Default(%): 30"/></Label>
            ```
            
        - Set parameters: C
            
            Line 60
            
            ```jsx
            <Label text='Set parameters: C'><InlineTip info="Float. Default: 1.0. Regularization parameter. The strength of the regularization is inversely proportional to C. Must be strictly positive. "/></Label>
            ```
            
        - Set parameters: gamma
            
            Line 65
            
            ```jsx
            <Label text='Set parameters: gamma'><InlineTip info="Float. Default: 0.01. Kernel coefficient."/></Label>
            ```
            
        - Predicted vs. Observed
            
            Line 71
            
            ```jsx
            <Label customStyle={``} text='Predicted vs. Observed' ><InlineTip info="Plot prediction in Test Dataset. Note: Set 'Visualize Tree=No Plot'; Default:line"/></Label>
            ```
            
        - Metrics of Model:
            
            Line 78
            
            ```jsx
            <Label text='Metrics of Model:'><InlineTip info="Assess model performance. 'explained variance' is used to measure the discrepancy between a model and actual data. 'neg_mean_absolute_error' measures the mean absolute error. 'neg_mean_squared_error' measures the mean squared error. 'r2' means proportion of the information in the data explained by the model. 'neg_mean_poisson_deviance' is equivalent to the Tweedie deviance with the power parameter power=1. 'neg_mean_gamma_deviance' is equivalent to the Tweedie deviance with the power parameter power=2."/></Label>
            ```
            
        - Find the Best Hyper-Parameters: C
            
            Line 85
            
            ```jsx
            <Label text='Find the Best Hyper-Parameters: C'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter:C'"/></Label>
            ```
            
        - Find the Best Hyper-Parameters: gamma
            
            Line 89
            
            ```jsx
            <Label text='Find the Best Hyper-Parameters: gamma'><InlineTip info="Clear 'Predict Options'. Input the result in 'set parameter:gamma'"/></Label>
            ```
            
        
        **Advaced Options**
        
        ![Untitled](Data%20Science%20Learning%20Platform%20Modify%20Instruction%20f1ad48d1c1614cd6a78ea571aa02f9ac/Untitled%2022.png)
        
        - Set Parameters: kernel
            
            Line 98
            
            ```jsx
            <Label customStyle={``} text='Set Parameters: kernel'><InlineTip info="Default: rbf. Specifies the kernel type to be used in the algorithm. "/></Label>
            ```
            
- Classification