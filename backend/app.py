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
# from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import confusion_matrix, roc_curve, mean_squared_error, r2_score, classification_report, plot_roc_curve, silhouette_score
from sklearn.decomposition import PCA
from scipy import stats
from mlxtend.frequent_patterns import apriori, association_rules 

# import cv2



# login imports
from database.db import initialize_db
from flask_restful import Api, Resource
from flask_bcrypt import Bcrypt
from resources.errors import InternalServerError, SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, \
    EmailDoesnotExistsError, BadTokenError
from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist
from flask_jwt_extended import create_access_token, decode_token, get_jwt_identity, JWTManager, get_current_user, \
    jwt_required
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
from IPython.display import Image

matplotlib.use('Agg')

app = Flask(__name__,static_folder="../build")


app.config.from_envvar('ENV_FILE_LOCATION')

app.config['CACHE_TIMEOUT'] = 60*60
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.pdf', '.csv', '.json']
app.config['UPLOAD_PATH'] = 'uploads'
app.config['LOGO_PATH'] = 'static/logo'
app.config['IMAGE_EXTENSIONS'] = ['.png', '.jpg', '.jpeg']


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
  


CORS(app)


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

@app.route("/change_profile_pic", methods=["PATCH"])
@cross_origin(origin="*")
@jwt_required(optional=True)
def change_profile_pic():
    user_avatar = request.files['file']
    filename = request.form['filename']
    file_ext = os.path.splitext(filename)[-1]
    if file_ext not in app.config['IMAGE_EXTENSIONS']:
        return jsonify(message="Invalid image format"), 400
    user = User.objects(id=get_jwt_identity())[0]

    user.profile_image.replace(user_avatar, filename=filename)
    user.save()  
    imgStr = base64.b64encode(user.profile_image.read()).decode("utf-8").replace("\n", "")

    return jsonify(base64=imgStr), 200


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
@cross_origin()
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
    df = _getCache(user_id,filename,modified = False)
    df.info(buf=buf,verbose=True)
    data = df.iloc[:10,].to_json()
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(df)
    _setCache(user_id,filename,df,modified = False)
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

def _setCache(uid,name,df,modified = True):
    if modified:
        name = EditedPrefix + name
    key = str(uid)+'_'+name
    cache.set(key,df,timeout = app.config['CACHE_TIMEOUT'])
    return df

def _clearCache(uid,name,modified = True):
    if modified:
        name = EditedPrefix + name
    key = str(uid)+'_'+name
    cache.delete(key)

# get dataframe by content in cache, if it does not exist in the cache,
# get content from database and create dataframe, then put it into cache
#
# uid: user id
# name: dataframe name, two versions of one dataframe could be stored in the cache, original one and modified one
# modified: whether to get the modified version
#
# if no modified version is found, return a copy of the original one
# normally, **ALL** operations are performed on the **modified** version
def _getCache(uid,name,modified = True):
    key = str(uid)+'_'+name
    df = None
    copyModified = False

    if modified:
        df = cache.get(EditedPrefix + name)
        if df is None:
            copyModified = True

    if df is None:
        df = cache.get(name)
        if df is None:
            details = mongo_collection.find_one({"file_name": name,"user_id":uid})
            if not details:
                return None
            df = pd.read_csv(StringIO(details['content'].decode('utf8')))
            _setCache(uid,key,df,modified = False)

    if copyModified:
        df = df.copy(deep = True)
        _setCache(uid, name, df)
        
    return df

# def get_user_id():




@app.route('/visualization',methods=['POST'])
# @cross_origin(headers=['Content-Type', 'Authorization'])
# @cross_origin(headers=['Content-Type', 'application/json'])
# @cross_origin(headers=['Access-Control-Allow-Origin', '*'])
@cross_origin()
@jwt_required(optional=True)
def visualization():
    params = json.loads(request.data)
    vis_type = params['type']
    user_id = get_jwt_identity()
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
    return jsonify(base64=imgStr,format=ImgFormat,resData = resData, code=code)
@app.route('/query',methods=['POST'])
@cross_origin()
@jwt_required(optional=True)
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

    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

MISSING_VALUES = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']

# Require last modified dataframe from server
# df is the original
@app.route('/handleCachedData', methods=['POST'])
@cross_origin('*')
@jwt_required()
def handleCachedData():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    df = _getCache(user_id,filename, modified=False)
    ndf = _getCache(user_id,filename)

    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf if ndf is not None else df)
    return jsonify(modifiedJson = ndf.to_json(),dataJson = df.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

@app.route('/cleanEditedCache', methods=['POST'])
@cross_origin(origin="*")
@jwt_required(optional=True)
def cleanEditedCache():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    _clearCache(user_id,filename)
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
@jwt_required(optional=True)
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
                
       
    _setCache(user_id,filename,ndf)
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

    df = _getCache(user_id,filename)
    return jsonify(data=df.to_json())


@app.route('/featureEngineering', methods=['POST'])
@cross_origin()
@jwt_required()
def cond_eng_json(): 
    params = request.json
    print('params=**', params)
    filename = params['filename']
    user_id = get_jwt_identity()
    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    # df = _getCache(user_id,filename)
   
    msg = ''
    success = True

    option = params['activeOption']
    print("option=", option)

    try:
        if option == 0:
            cols = params['cols']
            print("cols=", cols)
            for col,ctype in cols:
                if ctype == 'to lowercase':
                    df[col] = df[col].astype(str).str.lower()
                elif ctype == 'to uppercase':
                    df[col] = df[col].astype(str).str.upper()

        if option == 1:
            cols = params['cols']
            print("cols=", cols)
            for col in cols:
                label = LabelEncoder()
                df[col] = label.fit_transform(df[col].astype(str))

        if option == 2:
            for col in suboption_checked:
                params = {}
                for postAttr in ['Bins','Labels']:
                    attr = col + '_' + postAttr
                    params[postAttr] = params[attr]
                
                label = LabelEncoder()
                df[col] = pd.cut(df[col].astype(float), bins=list(params['Bins'].split(",")), 
                            labels=list(params['Labels'].split(",")))

        if option == 3:
            cols = params['cols']
            print("cols=", cols)
            for col in cols:
                scaler = StandardScaler()
                df[col] = scaler.fit_transform(df[col])

        if option == 4:
            cols = params['cols']
            print("cols=", cols)
            for col in cols:
                scaler = MinMaxScaler()
                df[col] = scaler.fit_transform(df[col])
    except:
        success = False

    _setCache(user_id,filename,df)
    return jsonify(success=success, msg = msg, dataJson = df.to_json())

    
@app.route('/feature_selection', methods=['POST'])
@cross_origin()
@jwt_required()
def cond_select_json(filename):
    params = request.json
    filename = params['filename']
    user_id = get_jwt_identity()
    df = _getCache(user_id,filename)
    print('params=====', params)
    msg = ''
    success = True

    DEFAULT_PLOT_SIZE = (5,5)
    DEFAULT_PLOT_TYPE = 'bar'
    Techniques = {i:e for i,e in enumerate(['Removing Features with Low Variance', 'Correlation Matrix','Regression1: Pearson’s Correlation Coefficient','Classification1: ANOVA','Classification2: Chi-Squared','Classification3: Mutual Information Classification','Principal Component Analysis'])}

    try:
        plotSize = tuple(map(int,params['plotsize'].split(','))) if params['plotsize'] else DEFAULT_PLOT_SIZE
        plotType = params['plottype'] or 'bar'
        selectKBest = int(params['selectkbest']) if params['selectkbest'] else 0
        target_Y = params['targety']
        technique = Techniques[int(params['techinique'])] if params['technique'] else ''
        variables_X = params['variablesx']
        df.replace(missing_values, np.nan) 


    except e:
        msg = str(e)
        success = False

    # if not finalVar:
    #     if new_colname:
    #         finalVar.append(new_colname) # or display new created columns in dropdown list


    # if final_button == 'off':
    #     finalVar = col  
        if Y:
            data = pd.concat([df[X], df[Y]], axis=1)
        else:
            data = df[X]

        for i in data.columns:
            if data[i].dtypes == object:
                label = LabelEncoder()
                data[i] = label.fit_transform(data[i].astype(str))
        X = data[X]
        Y = data[Y]
        
        if tech in ["Correlation Matrix", 'PCA']:
            if tech == "Correlation Matrix":
                featureResult = data.corr(method ='pearson')  # get correlations of each features in dataset
                featureResult = pd.DataFrame(data=featureResult)
            elif tech == "PCA":
                    scaled_data = StandardScaler().fit_transform(data)
                    pca = PCA(n_components=num_comp)
                    pca_res = pca.fit_transform(scaled_data) 
                    col_pca= ["PC"+ str(i+1) for i in range(num_comp)]
                    pca_df = pd.DataFrame(data=pca_res, columns=col_pca)
                    featureResult = pd.concat([pca_df, Y], axis=1)
            img = BytesIO()
            plt.rcParams["figure.figsize"] = (fig_len, fig_wid)

            if plotType == "bar":
                featureResult.plot.bar()
            elif plotType == "scatter":
                sns.pairplot(featureResult) # plt.scatter(pca_res[:,0], pca_res[:,1])
            elif plotType == "line":
                featureResult.plot.line()
            elif plotType == "heatmap":
                sns.heatmap(featureResult,annot=True,cmap="RdYlGn") # cmap='RdGy'
        else:
            if tech == "VarianceThreshold":
                fs = VarianceThreshold(threshold=thresh)
                fs.fit(data)
                featureResult = pd.DataFrame({"Features":data.columns ,"Boolean Result":fs.get_support()})
                x_label, y_label, title = 'Features', 'Boolean Result', 'Variance Threshold: 1-True, 0-False'
                featureResult['Boolean Result'] = featureResult['Boolean Result'].astype(int)
            else:
                if tech == "Pearson":
                    fs = SelectKBest(score_func=f_regression, k=K)
                elif tech == "ANOVA":
                    fs = SelectKBest(score_func=f_classif, k=K)
                elif tech == "Chi2":
                    fs = SelectKBest(score_func=chi2, k=K)
                elif tech == "Mutual_classification":
                    fs = SelectKBest(score_func=mutual_info_classif, k=K)
                fit = fs.fit(X, Y.values.ravel())
                featureResult = pd.DataFrame({'Features': X.columns, 'Score': fit.scores_})
                featureResult=featureResult.nlargest(K,'Score')  #print k best features
                x_label, y_label, title = 'Features', 'Score', 'Feature Score'
            img = BytesIO()
            plt.rcParams["figure.figsize"] = (fig_len, fig_wid)
            fig = featureResult.plot(x=x_label, y=y_label, kind=plotType, rot=0)
            plt.title(title)      
        # encode plot
        plt.savefig(img, format='png') #, bbox_inches='tight', plt.close(fig)
        plt.clf()
        img.seek(0)
        plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
        img.close()
    return jsonify(df_sorted=df.to_json(orient="values"), prep_col=list(df.columns), condition=cond, final_Var=finalVar, final_Y= finalY, plot_url=plotUrl) #feature_Result=featureResult.to_json(orient="values"),


@app.route('/preprocessing', methods=['POST'])
@cross_origin()
@jwt_required()
def cond_preprocess_json(filename):
    params = request.json
    filename = params['filename']
    user_id = get_jwt_identity()
    df = _getCache(user_id,filename)
    print('params=====', params)
    return jsonify(success=success, msg = msg, dataJson = df.to_json())


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


@app.route('/analysis/regression', methods=['POST']) # regression
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
    test_size = float(params['test_size'])/100 if 'test_size' in params and params['test_size'] else 0.3
    metric = params['metric'] if 'metric' in params else 'neg_mean_squared_error'
    plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
    finalVar = params['finalVar']#["rent amount", "area"] # test, delete later
    finalY = params['finalY']#"total" # test, delete later
    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    # print(df)
    ndf = df.replace(MISSING_VALUES, np.nan)
    kfold = KFold(n_splits=10, random_state=7, shuffle=True)
    X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) # with original order
    # print(X_train)
    cond += "\nFinal Independent Variables: " + str(finalVar) + "\nFinal Dependent Variable: "+ str(finalY)
    cond += "\nChoose Test Size(%): " + str(test_size*100)
    if analysis_model == "Linear Regression":
        param_fit_intercept_lr = params['param_fit_intercept_lr'] if 'param_fit_intercept_lr' in params else True
        param_normalize_lr = params['param_normalize_lr'] if 'param_normalize_lr' in params else False
        model = LinearRegression(fit_intercept=param_fit_intercept_lr, normalize=param_normalize_lr) 
        models[analysis_model] = model
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
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
        param_max_depth = int(params['param_max_depth']) if'param_max_depth' in params else 3
        param_max_features = params['param_max_features'] if 'param_max_features' in params else None
        param_max_leaf_nodes = int(params['param_max_leaf_nodes']) if 'param_max_leaf_nodes' in params else None
        param_random_state = int(params['param_random_state']) if 'param_random_state' in params else None
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        model = DecisionTreeRegressor(criterion=param_criterion, splitter=param_splitter, max_depth=param_max_depth, max_features=param_max_features, max_leaf_nodes=param_max_leaf_nodes, random_state=param_random_state)
        models[analysis_model] = model
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
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
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else 3
        find_n_estimators = [int(x) for x in params['find_n_estimators'].split(',') if params['find_n_estimators']] if 'find_n_estimators' in params else None
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'mse'
        param_max_features = params['param_max_features'] if 'param_max_features' in params else 'auto'
        param_max_leaf_nodes = int(params['param_max_leaf_nodes']) if 'param_max_leaf_nodes' in params else None
        param_random_state = int(params['param_random_state']) if 'param_random_state' in params else None
        model = RandomForestRegressor(n_estimators=param_n_estimators, criterion=param_criterion, max_depth=param_max_depth, max_features=param_max_features, max_leaf_nodes=param_max_leaf_nodes, random_state=param_random_state)
        models[analysis_model] = model
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
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
        param_gamma = float(params['param_gamma']) if 'param_gamma' in params else 0.01
        find_C = [int(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        find_gamma  = [float(x) for x in params['find_gamma'].split(',') if params['find_gamma']] if 'find_gamma' in params else None
        param_kernel = params['param_kernel'] if 'param_kernel' in params else "rbf"
        model = SVR(kernel=param_kernel, gamma=param_gamma, C=param_C)
        models[analysis_model] = model
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
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
    pred_var = analysis_model + finalVar[0] 
    if pred_var in params and params[pred_var]:  
        predic_var, input_val = [], []
        for i in df.columns:
            col_temp = analysis_model+i
            if col_temp in params and params[col_temp]:
                predic_var.append(i)
                input_val.append(params[col_temp])
        Class_input_val = [input_val]
        input_val = np.array(Class_input_val, dtype='float64')
        model = models[analysis_model] # pick the best model    
        result = model.predict(input_val)
        cond = "\n".join("{}: {}".format(x, y) for x, y in zip(predic_var, input_val.flatten()))
        para_result = "\n Model: " + analysis_model + "  \nPredicted Result:" + str(result)
        plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    return jsonify(data=ndf.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)



@app.route('/analysis/classification', methods=['POST']) # regression
@cross_origin()
@jwt_required()
def cond_Classification_json():
    cond, para_result, fig_len, fig_wid = '', '', 5,5
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    models = {} # to store tested models
    print(params)
    analysis_model = params['analysis_model']
    test_size = float(params['test_size'])/100 if 'test_size' in params and params['test_size'] else 0.3
    metric = params['metric'] if 'metric' in params else 'Classification Report'
    plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
    finalVar = params['finalVar']#["Sex", "Age", "Embarked"] # test, delete later
    finalY = params['finalY']#"Survived" # test, delete later
    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    ndf = df.replace(MISSING_VALUES, np.nan)
    kfold = KFold(n_splits=10, random_state=7, shuffle=True)
    X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 

    cond += "\nFinal Independent Variables: " + str(finalVar) + "\nFinal Dependent Variable: "+ str(finalY)
    # print('predic****=', params['Sex'])
    cond += "\nChoose Test Size(%): " + str(test_size*100)
    if analysis_model == "Logistic Regression":
        # test_size = float(params['test_size'])/100 if 'test_size' in params else 0.3
        # metric = params['metric'] if 'metric' in params else 'Classification Report'
        # plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
        find_solver = [x for x in params['find_solver'].split(',') if params['find_solver']] if 'find_solver' in params else None
        find_C = [float(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        param_solver = params['param_solver'] if 'param_solver' in params else 'lbfgs'
        param_C = float(params['param_C']) if 'param_C' in params else 1.0
        model = LogisticRegression(solver=param_solver, C=param_C)
        models[analysis_model] = model
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        # X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        if metric == "Classification Report":
            report = classification_report(Y_test, Y_pred)
            para_result += "\nClassification Report of " + analysis_model + ":\n" + report
        elif metric == 'ROC Curve':
            img = BytesIO()
            plot_roc_curve(model, X_test, Y_test)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif metric == 'Confusion Matrix':
            img = BytesIO()
            skplt.metrics.plot_confusion_matrix(Y_test, Y_pred, normalize=True) #figsize=(10,10)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        # cond += "\n\nChoose Test Size: " + str(test_size)
        cond += "\nModel: Logistic Regression \nSet Parameters:  solver=" + str(param_solver) + ", C=" + str(param_C)
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        if find_solver or find_C:
            if find_solver and find_C:
                tuned_para = [{'solver': find_solver, 'C': find_C}]
            elif find_solver:
                tuned_para = [{'solver': find_solver}]
            elif find_C:
                tuned_para = [{'C': find_C}]
            cond = "\nFind Parameter for Logisitic Regression: " + str(tuned_para)
            MSE = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE:
                model = GridSearchCV(LogisticRegression(), tuned_para, cv=4)
                model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, model.predict(X_test)
                para_result += 'The best hyper-parameters for Logisitic Regression are: ' + str(model.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    elif analysis_model == "Decision Tree Classifier":
        # test_size = float(params['test_size'])/100 if 'test_size' in params and params['test_size'] else 0.3
        # metric = params['metric'] if 'metric' in params else 'Classification Report'
        # plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        param_max_depth = int(params['param_max_depth']) if 'param_max_depth' in params else None
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'gini'
        param_max_leaf_nodes = int(params['param_max_leaf_nodes']) if 'param_max_leaf_nodes' in params else None

        model = DecisionTreeClassifier(criterion=param_criterion, max_depth=param_max_depth, max_leaf_nodes=param_max_leaf_nodes) 
        models[analysis_model] = model
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        # X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        if metric == "Classification Report":
            report = classification_report(Y_test, Y_pred)
            para_result += "\nClassification Report of " + analysis_model + ":\n" + report
        elif metric == 'ROC Curve':
            img = BytesIO()
            plot_roc_curve(model, X_test, Y_test)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif metric == 'Confusion Matrix':
            img = BytesIO()
            skplt.metrics.plot_confusion_matrix(Y_test, Y_pred, normalize=True) #figsize=(10,10)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        # cond += "\n\nChoose Test Size: " + str(test_size)
        cond += "\nModel: Decision Tree Classifier \nSet Parameters:  max_depth=" + str(param_max_depth) + ", criterion=" + str(param_criterion)  + ", max_leaf_nodes=" + str(param_max_leaf_nodes)
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        if find_max_depth:
            tuned_para = [{'max_depth': find_max_depth}]
            cond = "\nFind Parameter for Decision Tree Classifier: " + str(tuned_para)
            MSE = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE:
                model = GridSearchCV(DecisionTreeClassifier(), tuned_para, cv=4)
                model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, model.predict(X_test)
                para_result += 'The best hyper-parameters for Decision Tree Classifier are: ' + str(model.best_params_)
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

    elif analysis_model == 'Random Forests Classifier':
        # test_size = float(params['test_size'])/100 if 'test_size' in params else 0.3
        # metric = params['metric'] if 'metric' in params else 'Classification Report'
        # plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'

        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        find_n_estimators = [int(x) for x in params['find_n_estimators'].split(',') if params['find_n_estimators']] if 'find_n_estimators' in params else None
        param_max_depth = int(params['param_max_depth']) if 'param_max_depth' in params else None
        param_n_estimators = int(params['param_n_estimators']) if 'param_n_estimators' in params else 100
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'gini'
        param_max_leaf_nodes = int(params['param_max_leaf_nodes']) if 'param_max_leaf_nodes' in params else None
        model = RandomForestClassifier(max_depth=param_max_depth, n_estimators=param_n_estimators, criterion=param_criterion, max_leaf_nodes=param_max_leaf_nodes)
        models[analysis_model] = model
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        # X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        if metric == "Classification Report":
            report = classification_report(Y_test, Y_pred)
            para_result += "\nClassification Report of " + analysis_model + ":\n" + report
        elif metric == 'ROC Curve':
            img = BytesIO()
            plot_roc_curve(model, X_test, Y_test)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif metric == 'Confusion Matrix':
            img = BytesIO()
            skplt.metrics.plot_confusion_matrix(Y_test, Y_pred, normalize=True) #figsize=(10,10)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        # cond += "\n\nChoose Test Size: " + str(test_size)
        cond += "\nModel:" + analysis_model + "\nSet Parameters:  max_depth=" + str(param_max_depth) + ", n_estimators=" + str(param_n_estimators) + ", criterion=" + str(param_criterion) + ", max_leaf_nodes=" + str(param_max_leaf_nodes)
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        if find_max_depth or find_n_estimators:
            if find_max_depth and find_n_estimators:
                tuned_para = [{'max_depth': find_max_depth, 'n_estimators': find_n_estimators}]
            elif find_max_depth:
                tuned_para = [{'max_depth': find_max_depth}]
            elif find_n_estimators:
                tuned_para = [{'n_estimators': find_n_estimators}]
            cond = "\nFind Parameter for " + analysis_model + ": " + str(tuned_para)
            MSE = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE:
                model = GridSearchCV(RandomForestClassifier(), tuned_para, cv=4)
                model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, model.predict(X_test)
                para_result += "The best hyper-parameters for " + analysis_model + " are: " + str(model.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    elif analysis_model == 'SVM Classifier':
        # test_size = float(params['test_size'])/100 if 'test_size' in params else 0.3
        # metric = params['metric'] if 'metric' in params else 'Classification Report'
        # plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'

        find_C = [float(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        find_gamma = [float(x) for x in params['find_gamma'].split(',') if params['find_gamma']] if 'find_gamma' in params else None
        param_C = float(params['param_C']) if 'param_C' in params else 1.0
        param_gamma = float(params['param_gamma']) if 'param_gamma' in params else 'scale'
        param_kernel = params['param_kernel'] if 'param_kernel' in params else 'rbf'
        model = SVC(C=param_C, gamma=param_gamma, kernel=param_kernel)
        models[analysis_model] = model
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        # X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        if metric == "Classification Report":
            report = classification_report(Y_test, Y_pred)
            para_result += "\nClassification Report of " + analysis_model + ":\n" + report
        elif metric == 'ROC Curve':
            img = BytesIO()
            plot_roc_curve(model, X_test, Y_test)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif metric == 'Confusion Matrix':
            img = BytesIO()
            skplt.metrics.plot_confusion_matrix(Y_test, Y_pred, normalize=True) #figsize=(10,10)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        # cond += "\n\nChoose Test Size: " + str(test_size)
        cond += "\nModel:" + analysis_model + "\nSet Parameters:  gamma=" + str(param_gamma) + ", C=" + str(param_C) + ", kernel=" + str(param_kernel)
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        if find_C or find_gamma:
            if find_C and find_gamma:
                tuned_para = [{'C': find_C, 'gamma': find_gamma}]
            elif find_C:
                tuned_para = [{'C': find_C}]
            elif find_gamma:
                tuned_para = [{'gamma': find_gamma}]
            cond = "\nFind Parameter for " + analysis_model + ": " + str(tuned_para)
            MSE = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE:
                model = GridSearchCV(SVC(), tuned_para, cv=4)
                model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, model.predict(X_test)
                para_result += "The best hyper-parameters for " + analysis_model + " are: " + str(model.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    elif analysis_model == 'Naive Bayes Classifier':
        # test_size = float(params['test_size'])/100 if 'test_size' in params else 0.3
        # metric = params['metric'] if 'metric' in params else 'Classification Report'
        # plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
        model = GaussianNB()
        models[analysis_model] = model
        # kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        X = StandardScaler().fit_transform(df[finalVar[0]]).toarray()  # test ; change later
        Y = df[finalY].values
        X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
        plotUrl = get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType)
        if metric == "Classification Report":
            report = classification_report(Y_test, Y_pred)
            para_result += "\nClassification Report of " + analysis_model + ":\n" + report
        elif metric == 'ROC Curve':
            img = BytesIO()
            plot_roc_curve(model, X_test, Y_test)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif metric == 'Confusion Matrix':
            img = BytesIO()
            skplt.metrics.plot_confusion_matrix(Y_test, Y_pred, normalize=True) #figsize=(10,10)
            plt.savefig(img, format='png') 
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        # cond += "\n\nChoose Test Size: " + str(test_size)
        cond += "\nModel:" + analysis_model 
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
    pred_var = analysis_model + finalVar[0] # initial
    if pred_var in params and params[pred_var]:  
        predic_var, input_val = [], []
        for i in df.columns:
            col_temp = analysis_model+i
            if col_temp in params and params[col_temp]:
                predic_var.append(i)
                input_val.append(params[col_temp])
        Class_input_val = [input_val]
        input_val = np.array(Class_input_val, dtype='float64')
        model = models[analysis_model] # pick the best model    
        result = model.predict(input_val)
        cond = "\n".join("{}: {}".format(x, y) for x, y in zip(predic_var, input_val.flatten()))
        para_result = "\n Model: " + analysis_model + "  \nPredicted Result:" + str(result)
        plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    return jsonify(data=ndf.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)


@app.route('/analysis/clustering', methods=['POST']) 
@cross_origin()
@jwt_required()
def cond_Clustering_json():
    cond, para_result, fig_len, fig_wid, threeD_columns_kmeans = '', '', 5, 5,[]
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    user_id = get_jwt_identity()
    params = request.json
    print('params=', params)
    filename = params['filename']
    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    ndf = df.replace(MISSING_VALUES, np.nan)
    # finalVar = params['finalVar'] if 'finalVar' in params else ndf.Columns
    # finalVar = [x for x in df.columns if 'finalVar'+x in params]
    finalVar = params['variablesx']
    print('finalVar=', finalVar)
    analysis_model = params['analysis_model']
    param_n_clusters = int(params['param_n_clusters']) if 'param_n_clusters' in params and params['param_n_clusters'] else 8
    clustering_plot = params['clustering_plot'] if 'clustering_plot' in params else 'all attributes: 2D plot'
    metric = params['metric'] if 'metric' in params else None
    param_init = params['param_init'] if 'param_init' in params else 'k-means++'
    param_random_state = int(params['param_random_state']) if 'param_random_state' in params else None
    param_algorithm = params['param_algorithm'] if 'param_algorithm' in params else 'auto'
    find_n_clusters = params['find_n_clusters'] if 'find_n_clusters' in params else None
    find_n_clusters_pca = params['find_n_clusters_pca'] if 'find_n_clusters_pca' in params else None

    cond += "\nFinal Independent Variables: " + str(finalVar)
    X_train = ndf[finalVar]
    print('X_train------------',X_train.values)
    cond += '\n' + clustering_plot
    cond = "\nK-Means Set Parameters: \n  n_clusters=" + str(param_n_clusters) + ", init=" + str(param_init) + ", algorithm=" + str(param_algorithm)+ ", random_state=" + str(param_random_state)
    img = BytesIO()
    scaled_data = StandardScaler().fit_transform(X_train) 

    plt.figure(figsize=(fig_len,fig_wid), dpi=80)
    # plt.rcParams["figure.figsize"] = (fig_len, fig_wid) 
    if find_n_clusters == 'elbow method':
        cond = "\nFind the Optimal number of clusters for all selected attributes"
        model = KMeans()
        visualizer = KElbowVisualizer(model, k=(1,10))
        visualizer.fit(X_train.values)
        plt.title('The Elbow Method for KMeans Clustering')
        plt.xlabel('no. of clusters')
        plt.ylabel('Distortion Score')
        plt.legend()
        labeledData = ndf
    elif find_n_clusters_pca == 'elbow method':
        cond = "\nFind the Optimal number of clusters for PCA"
        inertias = []
        reduced_data = PCA(n_components=2).fit_transform(scaled_data)
        PCA_components = pd.DataFrame(reduced_data)
        for k in range(1, 10):
            model = KMeans(n_clusters=k)
            model.fit(PCA_components.iloc[:,:2])
            inertias.append(model.inertia_)
        plt.plot(range(1,10), inertias, '-p', color='gold')
        plt.title('The Elbow Method for PCA-KMeans Clustering')
        plt.xlabel('number of clusters, k')
        plt.ylabel('inertia')
        plt.legend()
        labeledData = ndf
    elif clustering_plot == 'PCA: 2D plot':
        reduced_data = PCA(n_components=2).fit_transform(scaled_data) 
        PCA_components = pd.DataFrame(reduced_data)
        pca_model = KMeans(n_clusters=param_n_clusters, init=param_init, algorithm=param_algorithm, random_state=param_random_state)
        pred = pca_model.fit(PCA_components.iloc[:,:2])
        labels = pca_model.predict(PCA_components.iloc[:,:2])
        ndf['Clusters'] = pd.DataFrame(pred.labels_)
        count_val = ndf['Clusters'].value_counts()
        para_result = "\nNumber of Points in Each Cluster:\n" + count_val.to_json(orient="columns")        
        labeledData = pd.concat((X_train, ndf['Clusters']), axis=1)
        fte_colors = {0: "red",1: "blue",2:'green',3:'yellow',4:'brown',5:'orange',6:'gray',7:'black',8:'pink',9:'purple',10:'violet'}
        km_colors = [fte_colors[label] for label in pca_model.labels_]
        plt.scatter(PCA_components[0], PCA_components[1], c=km_colors)
        plt.xlabel("PC1")
        plt.ylabel("PC2")
        plt.title(analysis_model + ' Clustering with 2 PCAs')
    elif clustering_plot == 'PCA: 3D plot':
        reduced_data = PCA(n_components=3).fit_transform(scaled_data) 
        PCA_components = pd.DataFrame(reduced_data)
        pca_model = KMeans(n_clusters=param_n_clusters, init=param_init, algorithm=param_algorithm, random_state=param_random_state)
        pred = pca_model.fit(PCA_components.iloc[:,:3])
        labels = pca_model.predict(PCA_components.iloc[:,:3])
        ndf['Clusters'] = pd.DataFrame(pred.labels_)
        count_val = ndf['Clusters'].value_counts()
        para_result = "\nNumber of Points in Each Cluster:\n" + count_val.to_json(orient="columns")        
        labeledData = pd.concat((X_train, ndf['Clusters']), axis=1)
        fte_colors = {0: "red",1: "blue",2:'green',3:'yellow',4:'brown',5:'orange',6:'gray',7:'black',8:'pink',9:'purple',10:'violet'}
        km_colors = [fte_colors[label] for label in pca_model.labels_]
        fig = plt.figure(1, figsize=(4, 3))
        ax = fig.add_subplot(111, projection='3d')
        ax.scatter(PCA_components[0],PCA_components[1],PCA_components[2],c=km_colors)
        ax.set_xlabel("PC1")
        ax.set_ylabel("PC2")
        ax.set_zlabel("PC3")
        plt.title(analysis_model + ' Clustering with 3 PCAs')
    elif clustering_plot == 'all attributes: 2D plot':
        model = KMeans(n_clusters=param_n_clusters, init=param_init, algorithm=param_algorithm, random_state=param_random_state)
        pred = model.fit(scaled_data)
        df['Clusters'] = pd.DataFrame(pred.labels_)
        count_val = df['Clusters'].value_counts()
        para_result = "\nNumber of Points in Each Cluster:\n" + count_val.to_json(orient="columns")
        labeledData = pd.concat((X_train, df['Clusters']), axis=1)
        sns.pairplot(labeledData, hue='Clusters',palette='Paired_r')
    elif clustering_plot == 'three attributes: 3D plot':
        model = KMeans(n_clusters=param_n_clusters, init=param_init, algorithm=param_algorithm, random_state=param_random_state)
        pred = model.fit(scaled_data)
        ndf['Clusters'] = pd.DataFrame(pred.labels_)
        count_val = ndf['Clusters'].value_counts()
        para_result = "\nNumber of Points in Each Cluster:\n" + count_val.to_json(orient="columns")        
        labeledData = pd.concat((X_train, ndf['Clusters']), axis=1)
        fte_colors = {0: "red",1: "blue",2:'green',3:'yellow',4:'brown',5:'orange',6:'gray',7:'black'}
        km_colors = [fte_colors[label] for label in model.labels_]
        fig = plt.figure(1, figsize=(4, 3))
        ax = fig.add_subplot(111, projection='3d')
        labels = model.labels_
        print('scaled_data= ',scaled_data)
        x=[row[0] for row in scaled_data]
        y=[row[1] for row in scaled_data]
        z=[row[2] for row in scaled_data]
        ax.scatter(x,y,z,c=km_colors)
        ax.set_xlabel(finalVar[0])
        ax.set_ylabel(finalVar[1])
        ax.set_zlabel(finalVar[2])

    if metric == 'inertia':
        para_result += '\nInertia -- The Lowest SSE value: \n' + str(model.inertia_)
    elif metric == 'centroid':
        para_result += '\nFind Locations of Centroid: \n' + str(model.cluster_centers_)
    elif metric == 'number of iterations':
        para_result += '\nThe Number of Iterations Required to Converge: ' + str(model.n_iter_)
    elif metric == 'silhouette':
        kmeans_silhouette = silhouette_score(scaled_data, model.labels_).round(2)
        para_result += 'nSilhouette: ' + str(kmeans_silhouette)

    plt.savefig(img, format='png') 
    plt.clf()
    img.seek(0)
    plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
    img.close()
    # para_result += labeledData.to_html(classes='table table-striped" id = "temp_table', index=False, border=0)

    return jsonify(data=labeledData.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)


@app.route('/analysis/associate_rule', methods=['POST']) # regression
@cross_origin()
@jwt_required()
def cond_associateRule_json():
    cond, para_result, fig_len, fig_wid = '', '', 5,5
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    print(params)
    df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    ndf = df.replace(MISSING_VALUES, np.nan)
    analysis_model = params['analysis_model']
    metric = params['metric'] if 'metric' in params else 'Classification Report'
    transid = params['trans_id']
    transitem = params['trans_item']
    params_min_support = float(params['params_min_support']) if ('params_min_support' in params) and (params['params_min_support']) else 0.5
    params_metric = params['params_metric'] if 'params_metric' in params else 'confidence'
    params_min_threshold = float(params['params_min_threshold']) if ('params_min_threshold' in params) and (params['params_min_threshold'])  else 0.8
    params_use_colnames = bool(params['params_use_colnames']) if 'params_use_colnames' in params else True
    params_max_len = int(params['params_max_len']) if 'params_max_len' in params else None
    param_specific_item = params['param_specific_item'] if 'param_specific_item' in params else None
    metrics_apriori = params['metrics_apriori'] if 'metrics_apriori' in params else '5.Association Rules: list all items'
    cond += "\nSupport Itemsets:\nSet Parameters: min_support=" + str(params_min_support) + ", use_colnames=" + str(params_use_colnames) + ", max_len=" + str(params_max_len)
    cond += "\n\nAssociation Rules:\nSet Parameters: metric=" + str(params_metric) + ", min_threshold=" + str(params_min_threshold)
    print('metrics_apriori====', metrics_apriori)
    ndf['Quantity']= 1
    print("ndf = ", ndf.head(10))
    basket_data = ndf.groupby([transid, transitem])['Quantity'].sum().unstack().fillna(0)
    def encode_units(x):
        if x <= 0:
            return 0
        if x >= 1:
            return 1
    basket_sets = basket_data.applymap(encode_units)
    print('basket_sets=', basket_sets)
    frequent_itemsets = apriori(basket_sets, min_support=params_min_support, use_colnames=params_use_colnames)
    print(frequent_itemsets)
    rules = association_rules(frequent_itemsets, metric=params_metric, min_threshold=params_min_threshold)
    print(rules.head())
    if param_specific_item:
        para_result = "\nAssociate Rule for Specific Item"
        frequent_itemsets = frequent_itemsets[frequent_itemsets['itemsets'].astype(str).str.contains(param_specific_item)]
        rules = rules[(rules['consequents'].astype(str).str.contains(param_specific_item)) | (rules['antecedents'].astype(str).str.contains(param_specific_item))]        

    if metrics_apriori == '1.Transaction Format Table':
        print("inside metrics_apriori")
        para_result = "\nConvert to Transaction Format:\n"
        para_result += basket_sets.to_html()
    elif metrics_apriori in ['2.Support Itemsets: list all items', '3.Support Itemsets: list specified items']:
        para_result = "\nSupport Itemsets:\n"
        para_result += frequent_itemsets.to_html()
    elif metrics_apriori == '4.Support Itemsets: list the most popular items':
        para_result = "\nThe Most Popular Items:\n"
        frequent_itemsets = frequent_itemsets.sort_values('support', ascending=False).head()
        para_result += frequent_itemsets.to_html()
    elif metrics_apriori in ['5.Association Rules: list all items', '6.Association Rules: list specified items']:
        para_result = "\nAssociation Rules:\n"
        para_result += rules.to_html()
   
    return jsonify(data=ndf.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)


if __name__ == '__main__':
    app.run(host='0,0,0,0',debug=True)