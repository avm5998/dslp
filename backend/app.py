import math
import sys
import os
from flask import Flask, render_template, request, Response, redirect, url_for, abort, send_from_directory,jsonify, Markup, make_response
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
from sklearn.model_selection import train_test_split, cross_val_score, KFold, GridSearchCV
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn import tree
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.svm import SVR, SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans
from yellowbrick.cluster import KElbowVisualizer
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import confusion_matrix, roc_curve
from sklearn.decomposition import PCA
from scipy import stats



# login imports
from database.db import initialize_db
from flask_restful import Api, Resource
from flask_bcrypt import Bcrypt
from resources.errors import InternalServerError, SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, \
    EmailDoesnotExistsError, BadTokenError
from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist
from flask_jwt_extended import create_access_token, decode_token, get_jwt_identity, JWTManager, jwt_required
from database.models import User
from bson.objectid import ObjectId
import collections
#  

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
from database.models import User
#forgot password imports
from threading import Thread
from flask_mail import Message, Mail
import datetime
from jwt.exceptions import ExpiredSignatureError, DecodeError, \
    InvalidTokenError

matplotlib.use('Agg')

app = Flask(__name__,static_folder="../build")

CORS(app)
app.config.from_envvar('ENV_FILE_LOCATION')

app.config['CACHE_TIMEOUT'] = 60*60
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.pdf', '.csv', '.json']
app.config['UPLOAD_PATH'] = 'uploads'
app.config['LOGO_PATH'] = 'static/logo'


api = Api(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
mail = Mail(app)
app.config['MONGODB_SETTINGS'] = {
    'host': 'mongodb://localhost/data_science_learning_platform_database'
}
from resources.routes import initialize_routes

initialize_routes(api)
initialize_db(app)


file_descs = {"SSR_TSRPT.pdf": "This is description 1",
              "A_Normalization_Process_to_Standardize_Handwriting_Data_Collected_from_Multiple_Resources_for_Recognition.pdf": "desc2",
              "7580-evidential-deep-learning-to-quantify-classification-uncertainty.pdf": "d3"}

mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["data_science_learning_platform_database"]
mongo_collection = mongo_db["files"]
user_collection = mongo_db["user"]

missing_values = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']
cache = Cache(config={'CACHE_TYPE': 'simple'})
cache.init_app(app)
EditedPrefix = '__EDITED___'


env_var = os.environ.get("FLASK_ENV")
if env_var == "development":
    if user_collection.find({"username":"dummy_user"}):
        user_collection.remove({"username":"dummy_user"})
    user =  User(username="dummy_user",email="dummy_user@g.com", password="dummy@123")
    user.hash_password()
    user.save()
  





# Error handling


@app.errorhandler(413)
def too_large(e):
    return "File is too large", 413

@app.errorhandler(EmailAlreadyExistsError)
def email_already_exists(e):
    return {"status":e.status, "message":e.message}, 400

@app.errorhandler(SchemaValidationError)
def schema_validation_error(e):
    return {"status":e.status, "message":e.message}, 400

@app.errorhandler(EmailDoesnotExistsError)
def email_already_exists(e):
    return {"status":e.status, "message":e.message}, 400

@app.errorhandler(UnauthorizedError)
def unauthorized_user(e):
    return {"status":e.status, "message":e.message}, 401

@app.errorhandler(BadTokenError)
def bad_token(e):
    return {"status":e.status, "message":e.message}, 403

@app.errorhandler(InternalServerError)
def internal_server_error(e):
    return {"status":e.status, "message":e.message}, 500




#Send email to reset password
def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except ConnectionRefusedError:
            raise InternalServerError("[MAIL SERVER] not working")


def send_email(subject, sender, recipients, text_body, html_body):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    Thread(target=send_async_email, args=(app, msg)).start()



#APIs
@app.route("/api/auth/forgot", methods=["POST"])
@cross_origin(origin="*")
def forgot():
    
    url =  str(request.origin)+'/reset/'
    try:
        body = request.get_json()
        email = body.get('email')
        if not email:
            raise SchemaValidationError('Request is missing required fields')

        user = User.objects.get(email=email)
        # if not user:
        #     raise EmailDoesnotExistsError("Couldn't find the user with given email address")

        expires = datetime.timedelta(hours=24)
        reset_token = create_access_token(str(user.id), expires_delta=expires)
        print("token:"+str(reset_token))
        reset_token = reset_token.replace(".", "$")
        send_email('[Awesome data mining] Reset Your Password',
                            sender='awesomedatamining@gmail.com',
                            recipients=[user.email],
                            text_body=render_template('email/reset_password.txt',
                                                    url=url + reset_token),
                            html_body=render_template('email/reset_password.html',
                                                    url=url + reset_token))
        return {'id': str(user.id), "message":"Reset link has been sent to your email"}, 200
    except SchemaValidationError:
        raise SchemaValidationError('Request is missing required fields')
    except DoesNotExist:
        raise EmailDoesnotExistsError("Couldn't find the user with given email address")
    except Exception as e:
        raise InternalServerError('Something went wrong')


@app.route("/api/auth/reset", methods=["POST"])
@cross_origin(origin="*")
def reset_link():
    url =  str(request.origin)+'/reset/'
    try:
        body = request.get_json()
        reset_token = body.get('reset_token')
        # print("toke: "+str(reset_token))
        print(request.url)
        password = body.get('new_password')

        if not reset_token or not password:
            raise SchemaValidationError('Request is missing required fields')
        # print(decode_token(reset_token))
        user_id = decode_token(reset_token)['sub']

        user = User.objects.get(id=user_id)

        user.modify(password=password)
        user.hash_password()
        user.save()

        send_email('[Awesome data mining] Password reset successful',
                        sender='awesomedatamining@gmail.com',
                        recipients=[user.email],
                        text_body='Password reset was successful',
                        html_body='<p>Password reset was successful</p>')
        return {'id': str(user_id), "message":"Password reset successful"}, 200

    except SchemaValidationError:
        raise SchemaValidationError('Request is missing required fields')
    except ExpiredSignatureError:
        raise BadTokenError("Token expired")
    except (DecodeError, InvalidTokenError):
        raise BadTokenError("Invalid token")
    except Exception as e:
        raise InternalServerError('Something went wrong')



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

@app.route('/user_files',methods=['GET'])
@cross_origin(origin="*")
@jwt_required()
def get_user_files():
    user_id = get_jwt_identity()
    user_files_list = user_collection.find_one({"_id":ObjectId(user_id)}, {"files":1})['files']
    return {'files_list': user_files_list}

def convertNaN(value):
    return None if math.isnan(value) else value

@app.route('/file/<filename>',methods=['GET'])
@cross_origin(origin="*")
@jwt_required()
def get_file(filename):
    user_id = get_jwt_identity()
    buf = StringIO()
    data = ''
    df = _getCache(user_id,filename)
    update_user_files_list(user_id, filename)
    if df is not None:
        df.info(buf=buf,verbose=True)
        data = df.to_json()
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(df)

    return jsonify(success=True, info = buf.getvalue(), data = data, 
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

def getDataFrameDetails(df):
    cols = df.columns.to_list()
    num_cols = df._get_numeric_data().columns.to_list()
    cate_cols = list(set(cols) - set(num_cols))
    for cate in cate_cols:
        df[cate] = df[cate].astype('category')

    cate_lists = {cate:df[cate].cat.categories.to_list() for cate in cate_cols}

    num_lists = {num:{
        'max':convertNaN(float(df[num].max())),
        'min':convertNaN(float(df[num].min())),
        'distinct':format('%.2f'%(100*len(df[num].unique())/df[num].count()))+'%',
        'mean':convertNaN(float(df[num].mean())),
        'count':convertNaN(float(df[num].count())),
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
@cross_origin(origin="*")
@jwt_required()
def uploadFile():
    file = request.files['file']
    #get user id
    user_id = get_jwt_identity()
    forceUpdate = True if 'forceUpdate' in request.form else False
    autoCache = True if 'autoCache' in request.form else False
    
    filename = secure_filename(file.filename)
    file_details = mongo_collection.find_one({"file_name": filename,"user_id":user_id})
    if forceUpdate or not file_details:
        if filename:
            file_ext = os.path.splitext(filename)[-1]
            if file_ext not in app.config['UPLOAD_EXTENSIONS']:
                return "Invalid file", 400
        content = file.read()

        if file_details:
            if forceUpdate:
                cache.delete(filename)
                mongo_collection.update_one({"file_name": filename,"user_id":user_id},{"$set":{"content":content}}, upsert=True)
            else:
                return "file already uploaded", 400
        else:
            cache.delete(filename)
            mongo_collection.insert_one({"user_id":user_id,"file_name": filename, "desc": "Default desc", "logo_name": "default_logo.png",
                                    "source_link": "default source link","content":content})
    

    #Updating users list of files to store upto three files
    # file_name = str(mongo_collection.find_one({"file_name": filename}, {"_id":1})['file_name'])

    update_user_files_list(user_id, filename)

    buf = StringIO()
    data = ''
    df = _getCache(user_id,filename)
    df.info(buf=buf,verbose=True)
    data = df.iloc[:10,].to_json()
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(df)
    _setCache(user_id,filename,df)
    return jsonify(success=True, info = buf.getvalue(), data = data, 
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

def update_user_files_list(user_id, filename):
    user_files_list = user_collection.find_one({"_id":ObjectId(user_id)}, {"files":1})['files']
    queue = collections.deque(user_files_list)
    if filename in queue:
        queue.remove(filename)
    if len(queue) >= 3:
        queue.pop()
    queue.appendleft(filename)   
    user_collection.update_one({'_id':ObjectId(user_id)}, {'$set':{'files':list(queue)}})

def _setCache(uid,name,df):
    key = str(uid)+'_'+name
    cache.set(key,df,timeout = app.config['CACHE_TIMEOUT'])
    return df

def _clearCache(uid,name):
    key = str(uid)+'_'+name
    cache.delete(key)

# get dataframe by content in cache or database, then put that datafrome into cache
def _getCache(uid,name):
    key = str(uid)+'_'+name
    df = cache.get(key)
    if df is None:
        details = mongo_collection.find_one({"file_name": name,"user_id":uid})
        if not details:
            return None
        df = pd.read_csv(StringIO(details['content'].decode('utf8')))
        _setCache(uid,key,df)
    return df

@app.route('/visualization',methods=['POST'])
@cross_origin()
@jwt_required()
def visualization():
    user_id = get_jwt_identity()
    params = request.json
    vis_type = params['type']
    df = _getCache(user_id, params['filename'])
    code=''

    ImgFormat = 'png'
    bytesIO = BytesIO()
    resData = {}

    fig, ax = plt.subplots()
    if vis_type == 'interactions':
        col1, col2 = params['col1'], params['col2']
        ax.scatter(df[col1], df[col2])
        code = f"plt.scatter(df['{col1}'], df['{col2}'])"

    
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
        code= "import seaborn as sns\n"
        code += f"data = np.random.randn(50, 20)"+"\n"
        code += f"sns.heatmap(data, cmap = 'cool', linewidth=0.3,xticklabels ={cols}, yticklabels = {cols})"

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
                print(f"df['{col}'].plot.hist(bins=df['{col}'].shape[0], alpha={.7},density = True,  xlim = {col_range}, logx = {logx}, logy = {logy})")
                code = f"df['{col}'].plot.hist(bins=df['{col}'].shape[0], alpha={.7},density = True,  xlim = {col_range}, logx = {logx}, logy = {logy})\n"
            if 'KDE' in plot:
                df[col].plot.kde( ax = ax,  xlim = col_range, logx = logx, logy = logy)
                code += f"df['{col}'].plot.kde(xlim = {col_range}, logx = {logx}, logy = {logy})" 
        else:
            if 'Histogram' in plot:
                df[col].value_counts().plot(kind='bar')
                code = f"df['{col}'].value_counts().plot(kind='bar')"

    fig.savefig(bytesIO, format = ImgFormat, bbox_inches = 'tight')
    plt.close()
    imgStr = base64.b64encode(bytesIO.getvalue()).decode("utf-8").replace("\n", "")

@app.route('/query',methods=['POST'])
@cross_origin()
@jwt_required()
def query():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    filters = json.loads(params['filters'])
    df = _getCache(user_id,filename)
    ndf = df
    for filter in filters:
        queryType = filter['queryType']
        if queryType == 2: # categorical
            qObject = json.loads(filter['qString'])
            ndf = ndf[ndf.apply(lambda x:x[qObject['column']] in qObject['cates'], axis = 1)]
        
        elif queryType == 1:# numerical
            qObject = json.loads(filter['qString'])
            ndf = ndf[ndf.apply(lambda x:qObject['min'] <= x[qObject['column']] <= qObject['max'], axis = 1)]

    _setCache(user_id,EditedPrefix+filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']

# Require last modified dataframe from server
# First, the original dataframe is identified by user id and filename and assuming the file exists

# if the original dataframe is in the mem cache
#   do nothing
# else
#   get original dataframe by user id and filename, set the dataframe to mem cache

# if the modified dataframe is in the mem cache
#   get the modified dataframe json
# else
#   do nothing since we don't know how to get the modified data even with the filters
#   and at the same time, since there is no modified data, all filters/cols will be invalid and being rest

# TODO is it better to store the current version of modified data each time the data's been modified?
@app.route('/handleCachedData', methods=['POST'])
@cross_origin()
@jwt_required()
def handleCachedData():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    df = _getCache(user_id,filename)
    modifiedJson = ''

    if df is not None:
        ndf = _getCache(user_id,EditedPrefix + filename)

        if ndf is not None: # must be in the mem cache since database does not store modified data
            modifiedJson = ndf.to_json()

    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf if ndf is not None else df)
    return jsonify(modifiedJson = modifiedJson,dataJson = df.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

@app.route('/cleanEditedCache', methods=['POST'])
@cross_origin()
@jwt_required()
def cleanEditedCache():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    _clearCache(user_id,EditedPrefix+filename)
    return jsonify(success=True)

# cleaner data structure
# {
#     option,
#     condition:{
#         items or cols
#     }
# }
@app.route('/clean', methods=['POST'])
@cross_origin()
@jwt_required()
def cond_clean_json():
    user_id = get_jwt_identity()
    web = []
    params = request.json
    filename = params['filename']
    cleaners = json.loads(params['cleaners'])
    df = _getCache(user_id, filename)
    # auto replace missing values
    ndf = df.replace(MISSING_VALUES, np.nan)
    print(cleaners)
    for cleaner in cleaners:
        option = cleaner['option']
        # 0 Remove N/A Rows
        # 1 Remove N/A Columns
        # 2 Replace N/A By Mean 
        # 3 Replace N/A By Median 
        # 4 Replace N/A By Specific Value 
        # 5 Remove Outliers 
        if option == 0:
            ndf = ndf.dropna(axis=0)
        elif option == 1:
            ndf = ndf.dropna(axis=1)
        elif option == 2:
            condition = cleaner['condition']
            for col in condition['cols']:
                ndf[col].fillna(ndf[col].astype(float).mean(), inplace=True)
        elif option == 3:
            condition = cleaner['condition']
            for col in condition['cols']:
                ndf[col].fillna(ndf[col].astype(float).median(), inplace=True)
        elif option == 4:
            condition = cleaner['condition']
            for item in condition['items']:
                ndf[item['col']].fillna(item['val'], inplace=True)
        elif option == 5:
            condition = cleaner['condition']
            for item in condition['items']:
                ndf[item['col']] =  ndf[item['col']].astype(float)
                q_low = ndf[item['col']].quantile(float(item['below'].strip('%'))/100) if 'below' in item else 0
                q_hi = ndf[item['col']].quantile(float(item['above'].strip('%'))/100) if 'above' in item else 1
                ndf = ndf[(ndf[item['col']] < q_hi) & (ndf[item['col']] > q_low)]
                
       
    _setCache(user_id,EditedPrefix+filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

@app.route('/current_data_json', methods=['POST']) #/query
@cross_origin('*')
@jwt_required()
def current_data_json():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']

    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)
    return jsonify(data=df.to_json())


@app.route('/feature_engineering', methods=['POST'])
@cross_origin()
def cond_eng_json(): 
    params = request.json
    queries = params['queries']
    for query in queries:
        feature_eng = query['feature_eng']

    df = pd.DataFrame(data=table_DATA, columns=col).reset_index(drop=True)
    df = df.replace(missing_values, np.nan) 
    if feature_eng == 'Convert Cases':
        case_col = params['case_col']
        case_type = params['case_type']

        for index1, index2 in zip(case_col, case_type):
            if index2=="lower":
                df[index1] = df[index1].astype(str).str.lower()
            else:
                df[index1] = df[index1].astype(str).str.upper()
    elif feature_eng == 'Convert Categorical to Numerical':
        for i in categorical_col:
            label = LabelEncoder()
            df[i] = label.fit_transform(df[i].astype(str))
    elif feature_eng == 'Convert Numerical to Categorical':
        for index1, index2, index3 in zip(numerical_col, bins, labels):
            label = LabelEncoder()
            df[index1] = pd.cut(df[index1].astype(float), bins=list(index2.split(",")), labels=list(index3.split(",")))
    elif feature_eng == "Standard Scaler": 
        scaler = StandardScaler()
        df[stand_scaler_col] = scaler.fit_transform(df[stand_scaler_col])
    elif feature_eng == "Minmax Scaler": 
        scaler = MinMaxScaler()
        df[minmax_scaler_col] = scaler.fit_transform(df[minmax_scaler_col])
    elif feature_eng == 'Text Data: Feature Extraction Models':
        if feat_extract_model_text_data == 'CountVectorizer':
            scaler = CountVectorizer()
        elif feat_extract_model_text_data == 'TfidfVectorizer':
            scaler = TfidfVectorizer()
    elif feature_eng == 'Add New Features and Labels':
        print("********Inside********")
        print('add_feat_col=',add_feat_col)
        new_feat_assigns = {}
        index=0
        for new_feat_name, orig_feat_name in zip(add_feat_name_in, add_feat_col):
            print('*****new_feat_name, orig_feat_name== ', new_feat_name, orig_feat_name)
            unique_values = add_feat_uniq_val_in[index].split(',')
            new_labels = add_feat_new_label[index].split(',')
            print('unique_values, new_labels=====> ', unique_values, new_labels)
            for uniq_val, new_label in zip(unique_values, new_labels):
                # cond += '\nOriginal Column: ' + orig_feat_name +  '--->'+ 'New Feature:' + new_feat_name + ';  Unique Value: '+ uniq_val + "---> New Label: " + new_label
                print('********** uniq_val, new_label= ', uniq_val, new_label)
                new_feat_assigns[uniq_val] = new_label
            print('new_feat_assigns===============', new_feat_assigns)
            df[new_feat_name] = df[orig_feat_name].apply(lambda x: new_feat_assigns[x])
            index+=1

    return jsonify(df_sorted=df.to_json(orient="values"), prep_f=cond, prep_col=list(df.columns))

# Sophie merged--> need modify 
def get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType):
    Y_test.reset_index(drop=True, inplace=True)
    comp_df = pd.concat([Y_test, pd.DataFrame(Y_pred)], axis=1)
    comp_df.columns = ["Actual(Y_test)", "Prediction(Y_pred)"]
    comp_df=comp_df.apply(pd.to_numeric, errors='ignore') 
    print("comp_df", comp_df, comp_df.dtypes)
    img = BytesIO()
    plt.rcParams["figure.figsize"] = (fig_len, fig_wid)
    plt.title("Actual vs. Prediction Result")
    if plotType in ['bar', 'line']:
        comp_df.plot(kind=plotType)
    elif plotType == 'scatter':
        comp_df.plot.scatter(x='Actual(Y_test)', y="Prediction(Y_pred)")
    elif plotType == 'heatmap':
        sns.heatmap(comp_df,annot=True,cmap="RdYlGn")
    plt.savefig(img, format='png') 
    plt.clf()
    img.seek(0)
    plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
    img.close()
    return plotUrl


@app.route('/analysis', methods=['POST']) # regression
@cross_origin()
@jwt_required()
def cond_Regression_json():
    cond, para_result, fig_len, fig_wid = '', '', 5,5
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    models = {} # to store tested models
    print(params)
    analysis_model = params['analysis_model']
    print(analysis_model)
    test_size = float(params['test_size'])/100 if 'test_size' in params else 0.3
    metric = params['metric'] if 'metric' in params else 'neg_mean_squared_error'
    plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
    finalVar = ["rent amount", "area"] # test, delete later
    finalY = "total" # test, delete later
    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    # print(df)
    ndf = df.replace(MISSING_VALUES, np.nan)
    X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) # with original order
    # print(X_train)
    cond += "\n\nChoose Test Size: " + str(test_size)
    if analysis_model == "Linear Regression":
        param_fit_intercept_lr = params['param_fit_intercept_lr'] if 'param_fit_intercept_lr' in params else True
        param_normalize_lr = params['param_normalize_lr'] if 'param_normalize_lr' in params else False
        model = LinearRegression(fit_intercept=param_fit_intercept_lr, normalize=param_normalize_lr) 
        models[analysis_model] = model
        kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        metric_res = cross_val_score(model, df[finalVar], df[finalY], cv=kfold, scoring=metric)
        cond += "\nModel: Linear Regression \nSet Parameters:  fit_intercept=" + str(param_fit_intercept_lr) + ", normalize=" + str(param_normalize_lr)
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        para_result += "\nMetric:  " + metric + "\nmean=" + str(metric_res.mean()) + "; \nstandard deviation=" + str(metric_res.std())

    elif analysis_model == "Decision Tree Regression":
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'mse'
        param_splitter = params['param_splitter'] if 'param_splitter' in params else 'best'
        param_max_depth = int(params['param_max_depth']) if'param_max_depth' in params else None
        param_max_features = params['param_max_features'] if 'param_max_features' in params else None
        param_max_leaf_nodes = int(params['param_max_leaf_nodes']) if 'param_max_leaf_nodes' in params else None
        param_random_state = int(params['param_random_state']) if 'param_random_state' in params else None
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        model = DecisionTreeRegressor(criterion=param_criterion, splitter=param_splitter, max_depth=param_max_depth, max_features=param_max_features, max_leaf_nodes=param_max_leaf_nodes, random_state=param_random_state)
        models[analysis_model] = model
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        metric_res = cross_val_score(model, df[finalVar], df[finalY], cv=kfold, scoring=metric)
        cond += "\nModel: Decision Tree Regression \nSet Parameters: criterion=" + str(param_criterion) + ", splitter=" + str(param_splitter) + ", max_depth=" + str(param_max_depth) + ", max_features=" + str(param_max_features) + ", max_leaf_nodes="+ str(param_max_leaf_nodes)+ ", random_state=" + str(param_random_state) 
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        para_result += "\nMetric:  " + metric + ": \nmean=" + str(metric_res.mean()) + "; \nstandard deviation=" + str(metric_res.std())
        if find_max_depth:
            tuned_para = [{'max_depth': find_max_depth}]
            cond = "\nFind Parameter for Decision Tree Regression" + str(tuned_para)
            MSE_dtr = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE_dtr:
                reg_dtr = GridSearchCV(DecisionTreeRegressor(), tuned_para, cv=4)
                reg_dtr.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, reg_dtr.predict(X_test)
                para_result = '\nThe best hyper-parameter for Decision Tree is: ' + str(reg_dtr.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
        if 'visual_tree' in params:
            visual_type = params['visual_tree']
            cond += "\nVisualize Tree:" + visual_type
            if  visual_type == 'Text Graph':
                para_result = '\n' + tree.export_text(model) + '\n'
                plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
            elif visual_type == 'Flowchart':
                img = BytesIO()
                plt.figure(figsize=(fig_len,fig_wid), dpi=200) #(fig_len,fig_wid))
                tree.plot_tree(model, feature_names=finalVar, class_names=list(finalY), filled=True)
                plt.savefig(img, format='png') 
                plt.clf()
                img.seek(0)
                plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
                img.close()
            else:
                plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)

    elif analysis_model == 'Random Forests Regression':
        param_max_depth = int(params['param_max_depth']) if 'param_max_depth' in params else None
        param_n_estimators = int(params['param_n_estimators']) if 'param_n_estimators' in params else 100
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        find_n_estimators = [int(x) for x in params['find_n_estimators'].split(',') if params['find_n_estimators']] if 'find_n_estimators' in params else None
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'mse'
        param_max_features = params['param_max_features'] if 'param_max_features' in params else 'auto'
        param_max_leaf_nodes = int(params['param_max_leaf_nodes']) if 'param_max_leaf_nodes' in params else None
        param_random_state = int(params['param_random_state']) if 'param_random_state' in params else None
        model = RandomForestRegressor(n_estimators=param_n_estimators, criterion=param_criterion, max_depth=param_max_depth, max_features=param_max_features, max_leaf_nodes=param_max_leaf_nodes, random_state=param_random_state)
        models[analysis_model] = model
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        metric_res = cross_val_score(model, df[finalVar], df[finalY], cv=kfold, scoring=metric)
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        cond += "\nModel: Random Forests Regressor \nSet Parameters:    n_estimators=" + str(param_n_estimators) + ", criterion=" + str(param_criterion) + ", max_depth=" + str(param_max_depth) + ", max_features=" + str(param_max_features) + ", max_leaf_nodes=" + str(param_max_leaf_nodes) + ", random_state=" + str(param_random_state)
        cond += "\nPlot Predicted vs. Observed Target Variable:  Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        para_result += "\nMetric:  " + metric + ": \nmean=" + str(metric_res.mean()) + "; \nstandard deviation=" + str(metric_res.std())
        if find_max_depth or find_n_estimators:
            if find_max_depth and find_n_estimators:
                tuned_para = [{'max_depth': find_max_depth, 'n_estimators': find_n_estimators}]
            elif find_max_depth:
                tuned_para = [{'max_depth': find_max_depth}]
            elif find_n_estimators:
                tuned_para = [{'n_estimators': find_n_estimators}]
            cond = "\nFind Parameter for Random Forests Regressor: " + str(tuned_para)
            MSE_rfr = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE_rfr:
                reg_rfr = GridSearchCV(RandomForestRegressor(), tuned_para, cv=4)
                reg_rfr.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, reg_rfr.predict(X_test)
                para_result = 'The best hyper-parameters for Random Forests are: ' + str(reg_rfr.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    elif analysis_model == 'SVM Regression':
        param_C = int(params['param_C']) if 'param_C' in params else 1.0
        param_gamma = float(params['param_gamma']) if 'param_gamma' in params else 'scale'
        find_C = [int(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        find_gamma  = [float(x) for x in params['find_gamma'].split(',') if params['find_gamma']] if 'find_gamma' in params else None
        param_kernel = params['param_kernel'] if 'param_kernel' in params else "rbf"
        model = SVR(kernel=param_kernel, gamma=param_gamma, C=param_C)
        models[analysis_model] = model
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        metric_res = cross_val_score(model, df[finalVar], df[finalY], cv=kfold, scoring=metric)
        cond += "\nModel: SVM Regressor \nSet Parameters:   kernel=" + str(param_kernel) + ", gamma=" + str(param_gamma) + ", C=" + str(param_C)
        cond += "\nPlot Predicted vs. Observed Target Variable:    Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        para_result += "\nMetric:  " + metric + ": \nmean=" + str(metric_res.mean()) + "; \nstandard deviation=" + str(metric_res.std())
            
        if find_C or find_gamma:
            if find_C and find_gamma:
                tuned_para = [{'C': find_C, 'gamma': find_gamma}]
            elif find_C:
                tuned_para = [{'C': find_C}]
            elif find_gamma:
                tuned_para = [{'gamma': find_gamma}]
            cond = "\nFind Parameter for Support Vector Machine (SVM) Regressor" + str(tuned_para)        
            MSE_svm = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE_svm:
                reg_svm = GridSearchCV(SVR(), tuned_para, cv=4)
                reg_svm.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, reg_svm.predict(X_test)
                para_result = 'The best hyper-parameters for SVR are: ' + str(reg_svm.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    return jsonify(data=ndf.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)
        
    # return jsonify(success=True,info="test string",float_num=15.123)
 
    # return jsonify(data=ndf.to_json(),
    # cols = cols,col_lists = col_lists, num_cols = num_cols, 
    # cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)


# @app.route('/analysis', methods=['POST']) #/query
def cond_Kmeans_json(filename):
    cond, para_result, fig_len, fig_wid = '', '', 5,5
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
   
    web_data = json.loads(request.form.get('ana_data'))
    print("web_data.keys()", web_data.keys())
    for key,val in web_data.items():
        if key == "test_size":
            test_size = float(val)/100 if val != '' else 0.3
            print("test_size==", test_size)
        elif key == "Techniques":
            tech = val
            print("tech=", tech)
        elif key == "Metrics":
            scoring = val
            print("scoring=", scoring)
        elif "plotSize" in key:
            if val != '':
                fig_len, fig_wid = int(val.split(',')[0]), int(val.split(',')[1]) 
                print("fig_len, fig_wid ===============",fig_len, fig_wid)
        elif "plotType" in key:
            plotType = val 
        elif key == "table_COLUMN":
            col = val
        elif key == "table_DATA":
            table_DATA = val
        elif 'find_parameter' in key:
            find_parameter = val
            print('find_parameter=',find_parameter)
        elif 'opt_k_kmeans_set' in key:
            opt_k_kmeans_set = int(val) if val else 8
            print('opt_k_kmeans_set=', opt_k_kmeans_set)
        elif 'opt_init_kmeans' in key:
            opt_init_kmeans = val if val else 'k-means++'
            print('opt_init_kmeans=', opt_init_kmeans)
        elif 'opt_algo_kmeans' in key:
            opt_algo_kmeans = val if val else 'auto'
        elif 'random_state_kmeans_set' in key:
            random_state_kmeans_set = int(val) if val else None
        elif 'scatterX_kmeans' in key:
            scatterX_kmeans = val
        elif 'scatterY_kmeans' in key:
            scatterY_kmeans = val
     
    df = pd.DataFrame(data=table_DATA, columns=col).reset_index(drop=True)
    df = df.replace(missing_values, np.nan) 
    # if finalY:
    #     X_train, X_test, Y_train, Y_test = train_test_split(df[finalVar], df[finalY], test_size=test_size, random_state=0, shuffle=False) 
    # else:
    X_train = X_test = df[finalVar]
    print('X_train------------',X_train.values)
    if find_parameter == 'on':
        cond = "\nFind the Optimal K clusters"
        model = KMeans()
        visualizer = KElbowVisualizer(model, k=(1,20))
        img = BytesIO()
        visualizer.fit(X_train.values)
        plt.title('The Elbow Method for KMeans Clustering')
        plt.xlabel('no. of clusters')
        plt.ylabel('Distortion Score')
        plt.legend()
        plt.savefig(img, format='png') 
        plt.clf()
        img.seek(0)
        plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
        img.close()
        labeledData = df
    else:
        cond = "\nK-Means Set Parameters: \n  n_clusters=" + str(opt_k_kmeans_set) + ", init=" + str(opt_init_kmeans) + ", algorithm=" + str(opt_algo_kmeans)+ ", random_state=" + str(random_state_kmeans_set)
        model = KMeans(n_clusters=opt_k_kmeans_set, init=opt_init_kmeans, algorithm=opt_algo_kmeans, random_state=random_state_kmeans_set)
        models[tech] = model
        img = BytesIO()
        pred = model.fit(X_train)
        df['Clusters'] = pd.DataFrame(pred.labels_)
        print("Clusters====",df['Clusters'])
        print(df['Clusters'].value_counts())
        count_val = df['Clusters'].value_counts()
        para_result = "\nNumber of Points in Each Cluster:\n" + count_val.to_json(orient="columns")
        labeledData = pd.concat((X_train, df['Clusters']), axis=1)
        print('labeledData=', labeledData)

        plt.figure(figsize=(fig_len,fig_wid), dpi=200) 
        if scoring == 'pca':
            X = pca_df    # question here: should DO PCA on feature engneering???
            print("X1=", X)
            X['Clusters'] = model.fit_predict(X)
            print("X2=", X)
            sns.scatterplot(x="PC1", y="PC2", hue=X['Clusters'], data=pca_df)
            plt.title(tech + 'Clustering with 2 dimensions')
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif scoring == 'pair':
            sns.pairplot(labeledData, hue='Clusters')
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif scoring == 'scatter':
            sns.scatterplot(x=scatterX_kmeans, y=scatterY_kmeans, hue='Clusters', data=labeledData)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif scoring == 'inertia':
            para_result += '\nInertia -- The Lowest SSE value: \n' + str(model.inertia_)
        elif scoring == 'centroid':
            para_result += '\nFind Locations of Centroid: \n' + str(model.cluster_centers_)
        elif scoring == 'number of iterations':
            para_result += '\nThe Number of Iterations Required to Converge: ' + str(model.n_iter_)
        elif scoring == 'silhouette':
            print(list(df.columns).index(scatterX_kmeans))
            print(list(df.columns))
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(df[finalVar])
            kmeans_silhouette = silhouette_score(scaled_features, model.labels_).round(2)
            # Plot the data and cluster silhouette comparison
            fig, ax1 = plt.subplots(1, 1, figsize=(8, 6), sharex=True, sharey=True)
            fig.suptitle(f"Clustering Algorithm: Crescents", fontsize=16)
            fte_colors = {0: "red",1: "blue",2:'green',3:'yellow',4:'brown',5:'orange'}
             # The k-means plot
            km_colors = [fte_colors[label] for label in model.labels_]
            ax1.scatter(scaled_features[:, list(df.columns).index(scatterX_kmeans)-1], scaled_features[:, list(df.columns).index(scatterY_kmeans)-1], c=km_colors)
            ax1.set_title(f"k-means\nSilhouette: {kmeans_silhouette}", fontdict={"fontsize": 12})
            ax1.set_xlabel(scatterX_kmeans)
            ax1.set_ylabel(scatterY_kmeans)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()


    print("models=", models)
    return jsonify(df_sorted=labeledData.to_json(orient="values"), prep_f=cond, result=para_result, prep_col=list(labeledData.columns), plot_url=plotUrl) #final_Var=finalVar,


if __name__ == '__main__':
    app.run(host='0,0,0,0',debug=True)