import sys
import os
from flask import Flask, render_template, request, redirect, url_for, abort, send_from_directory,jsonify, Markup, make_response
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import pymongo
import process_csv_file as pcf
import pandas as pd
import re
import ast
import json
import numpy as np
from numpy import unique, where
from dateutil.parser import parse
from sklearn.feature_selection import SelectKBest, chi2, f_classif, f_regression, RFE, mutual_info_classif, VarianceThreshold
from sklearn.preprocessing import MinMaxScaler, StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.svm import SVR
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans
from yellowbrick.cluster import KElbowVisualizer
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import confusion_matrix, roc_curve
from sklearn.decomposition import PCA
from scipy import stats

import matplotlib.pyplot as plt
import seaborn as sns

from io import BytesIO
from io import StringIO

if sys.version_info[0] < 3: 
    from StringIO import StringIO
else:
    from io import StringIO

import base64
import matplotlib.figure

from yellowbrick.datasets import load_credit
from yellowbrick.features import Rank1D
# from pandas_profiling import ProfileReport
from flask_caching import Cache

matplotlib.use('Agg')

app = Flask(__name__,static_folder="../build")
CORS(app)
app.config['CACHE_TIMEOUT'] = 60*60
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.pdf', '.csv', '.json']
app.config['UPLOAD_PATH'] = 'uploads'
app.config['LOGO_PATH'] = 'static/logo'
file_descs = {"SSR_TSRPT.pdf": "This is description 1",
              "A_Normalization_Process_to_Standardize_Handwriting_Data_Collected_from_Multiple_Resources_for_Recognition.pdf": "desc2",
              "7580-evidential-deep-learning-to-quantify-classification-uncertainty.pdf": "d3"}

mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["data_science_learning_platform_database"]
mongo_collection = mongo_db["files"]

missing_values = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']
cache = Cache(config={'CACHE_TYPE': 'simple'})
cache.init_app(app)
EditedPrefix = '__EDITED___'

@app.errorhandler(413)
def too_large(e):
    return "File is too large", 413


@app.route("/list_files_json",methods=['POST'])
def file_list():
    files = mongo_collection.find({}, {"_id": 0, "logo_name": 1, "desc": 1, "file_name": 1, "source_link": 1})
    return jsonify(files=files)

@app.route('/describe_file_json/<filename>')
def describe(filename):
    file_details = mongo_collection.find_one({"file_name": filename},
                                             {"_id": 0, "logo_name": 1, "desc": 1, "source_link": 1})
    if filename.endswith(".csv"):
        data_snapshot = pcf.get_snapshot(pcf.load_file(filename), snapshot_size=10)
    else:
        data_snapshot = pd.DataFrame([[1, 2, 3], [4, 5, 6], [7, 8, 9]], columns=['a', 'b', 'c'])
    for column in data_snapshot.columns:
        print(column)

    return jsonify(file_name=filename, file_details=file_details, data_snapshot=data_snapshot)


def getDataFrameDetails(df):
    cols = df.columns.to_list()
    num_cols = df._get_numeric_data().columns.to_list()
    cate_cols = list(set(cols) - set(num_cols))
    for cate in cate_cols:
        df[cate] = df[cate].astype('category')

    cate_lists = {cate:df[cate].cat.categories.to_list() for cate in cate_cols}

    num_lists = {num:{
        'max':float(df[num].max()),
        'min':float(df[num].min()),
        'distinct':format('%.2f'%(100*len(df[num].unique())/df[num].count()))+'%',
        'mean':float(df[num].mean()),
        'count':float(df[num].count()),
        'dtype':str(df[num].dtype)
    } for num in num_cols}

    col_lists = {col:{
        'name':col,
        'isnumeric':col in num_cols,
        'desc':str(df[col].describe())
    }

    for col in cols}
    return cols,col_lists,num_cols,num_lists,cate_cols,cate_lists

@app.route('/uploadFile',methods=['POST'])
@cross_origin()
def uploadFile():
    file = request.files['file']
    forceUpdate = True if 'forceUpdate' in request.form else False
    autoCache = True if 'autoCache' in request.form else False
    
    filename = secure_filename(file.filename)
    file_details = mongo_collection.find_one({"file_name": filename})

    if forceUpdate or not file_details:
        if filename:
            file_ext = os.path.splitext(filename)[-1]
            if file_ext not in app.config['UPLOAD_EXTENSIONS']:
                return "Invalid file", 400
        content = file.read()

        if file_details:
            if forceUpdate:
                cache.delete(filename)
                mongo_collection.update_one({"file_name": filename},{"content":content})
            else:
                return "file already uploaded", 400
        else:
            cache.delete(filename)
            mongo_collection.insert_one({"file_name": filename, "desc": "Default desc", "logo_name": "default_logo.png",
                                    "source_link": "default source link","content":content})
    
    buf = StringIO()
    data = ''

    if autoCache:
        df = _getCache(filename)
    else:
        df = None
    if df is not None:
        df.info(buf=buf,verbose=True)
        data = df.to_json()
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(df)
    _setCache(filename,df)
    return jsonify(success=True, info = buf.getvalue(), data = data, 
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

def _setCache(name,df):
    cache.set(name,df,timeout = app.config['CACHE_TIMEOUT'])
    return df

def _getCache(name):
    df = cache.get(name)
    if df is None:
        details = mongo_collection.find_one({"file_name": name})
        if not details:
            return 'no data found', 400
        df = pd.read_csv(StringIO(details['content'].decode('utf8')))
        _setCache(name,df)
    return df

@app.route('/cacheDataFrame',methods=['POST'])
@cross_origin()
def cacheDataFrame():
    params = request.json()
    df = _getCache(params.filename)
    return jsonify(df=df.to_json())

@app.route('/visualization',methods=['POST'])
@cross_origin()
def visualization():
    params = request.json
    print(params)
    vis_type = params['type']
    df = _getCache(params['filename'])

    ImgFormat = 'png'
    bytesIO = BytesIO()
    resData = {}

    fig, ax = plt.subplots()
    if vis_type == 'interactions':
        col1, col2 = params['col1'], params['col2']
        ax.scatter(df[col1], df[col2])
    
    if vis_type == 'correlations':
        cols = df.columns.to_list()
        num_cols = df._get_numeric_data().columns.to_list()
        cate_cols = list(set(cols) - set(num_cols))
        cmap = params['cmap']
        def chi_test(df,col1,col2):
            contigency= pd.crosstab(df[col1], df[col2], normalize='all')
            stat, p, dof, expected = stats.chi2_contingency(contigency)
            return p

        ncols = [[col,(col in num_cols)] for col in cols]

        def getValue(df,col1,col2):
            numeric = col1[1] and col2[1]
            categorical = not col1[1] and not col2[1]
            if numeric:
                return stats.pearsonr(df[col1[0]], df[col2[0]])[0]

            if categorical:
                return chi_test(df,col1[0],col2[0])

            return float('nan')

        data = [[getValue(df,col1,col2) for col2 in ncols] for col1 in ncols]
        ax = sns.heatmap(data, cmap = 'cool', linewidth=0.3,xticklabels =cols, yticklabels = cols)

    if vis_type == 'chi_square':
        col1, col2 = params['col1'], params['col2']
        contigency= pd.crosstab(df[col1], df[col2], normalize='all')
        stat, p, dof, expected = stats.chi2_contingency(contigency)
        resData['p'] = p
    
    if vis_type == 'variables':
        col = params['col']
        isnumeric = params['isnumeric']
        plot = params['plotType']
        col_range = (float(params['dataRange']['min']),float(params['dataRange']['max'])) if 'dataRange' in params else None
        log = params['log']
        logx = 'x' in log
        logy = 'y' in log

        if isnumeric:
            if 'Histogram' in plot:
                df[col].plot.hist(bins=df[col].shape[0], alpha=.7,density = True, ax = ax,  xlim = col_range, logx = logx, logy = logy)
            if 'KDE' in plot:
                df[col].plot.kde( ax = ax,  xlim = col_range, logx = logx, logy = logy)
        else:
            if 'Histogram' in plot:
                df[col].value_counts().plot(kind='bar')

        # ax.grid(axis='y', alpha=0.75)
        # ax.set_xlabel(col)
        # ax.set_ylabel('Frequency')
        # Set a clean upper y-axis limit.
        # ax.set_ylim(ymax=np.ceil(maxfreq / 10) * 10 if maxfreq % 10 else maxfreq + 10)

    fig.savefig(bytesIO, format = ImgFormat, bbox_inches = 'tight')
    plt.close()
    imgStr = base64.b64encode(bytesIO.getvalue()).decode("utf-8").replace("\n", "")
    return jsonify(base64=imgStr,format=ImgFormat,resData = resData)
    
    # bytesIO = BytesIO()
    # t = np.arange(0.0, 2.0, 0.01)
    # s = 1 + np.sin(2 * np.pi * t)

    # fig, ax = plt.subplots()
    # ax.plot(t, s)

    # ax.set(xlabel='time (s)', ylabel='voltage (mV)',
    #     title='About as simple as it gets, folks')
    # ax.grid()

    # fig.savefig(bytesIO, format = ImgFormat, bbox_inches = 'tight')
    # plt.close()
    # imgStr = base64.b64encode(bytesIO.getvalue()).decode("utf-8").replace("\n", "")
    # return jsonify(base64=imgStr,format=ImgFormat)

# @app.route('/getProfile', methods=['POST'])
# @cross_origin()
# def getProfile():
#     params = request.json
#     df = _getCache(params['filename'])
    
#     # profile = df.profile_report(
#     #     title="Data visualization",
#     #     samples=None,
#     #     duplicates=None,
#     #     missing_diagrams=None
#     # )
#     # profile = ProfileReport(_getCache(params['filename']), title='Pandas Profiling Report', explorative=True)
#     # return jsonify(html=profile.to_html())

#     return jsonify(visual = {
#         'interactions':interactions,
#         'correlations':correlations,
#         'variables':variables
#     }}

@app.route('/query',methods=['POST'])
@cross_origin()
def query():
    # print("_______________________________________")
    params = request.json
    cacheResult = params['cacheResult']
    filename = params['filename']
    filters = json.loads(params['filters'])
    print(filters)
    df = _getCache(filename)
    ndf = df
    for filter in filters:
        queryType = filter['queryType']
        if queryType == 2: # categorical
            qObject = json.loads(filter['qString'])
            ndf = ndf[ndf.apply(lambda x:x[qObject['column']] in qObject['cates'], axis = 1)]
        
        elif queryType == 1:# numerical
            qObject = json.loads(filter['qString'])
            ndf = ndf[ndf.apply(lambda x:qObject['min'] <= x[qObject['column']] <= qObject['max'], axis = 1)]

    if cacheResult:
        _setCache(EditedPrefix+filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']

@app.route('/clean', methods=['POST']) #/query
@cross_origin()
def cond_clean_json(filename):
    web = []
    params = request.json
    cacheResult = params['cacheResult']
    autoReplace = params['autoReplace']
    filename = params['filename']
    cleaners = json.loads(params['cleaners'])
    df = _getCache(filename)
    print(cleaners)

    if autoReplace:
        ndf = ndf.replace(MISSING_VALUES, np.nan)
        
    for filter in filters:
        subOption = filter['subOption']
        # 0 Remove N/A Rows
        # 1 Remove N/A Columns
        # 2 Replace N/A By Mean 
        # 3 Replace N/A By Median 
        # 4 Replace N/A By Specific Value 
        # 5 Remove Outliers 
        if subOption == 2:
            condition = filter['condition']
            for col in range(condition.cols):
                df[col].fillna(df[col].astype(float).mean(), inplace=True)
        elif subOption == 3:
            condition = filter['condition']
            for col in range(condition.cols):
                df[col].fillna(df[col].astype(float).median(), inplace=True)
        elif subOption == 4:
            condition = filter['condition']
            for items in range(condition.items):
                df[item.col].fillna(item.val, inplace=True)
                
    for filter in filters:
        subOption = filter['subOption']
        if subOption == 0:
            ndf = ndf.dropna(axis=0)
        elif subOption == 1:
            ndf = ndf.dropna(axis=1)
       
    if cacheResult:
        _setCache(EditedPrefix+filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)


if __name__ == '__main__':
    app.run(debug=True)