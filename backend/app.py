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
    url =  'localhost:9001/reset/'
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
    url =  'localhost:9001/reset/'
    try:
        body = request.get_json()
        reset_token = body.get('reset_token')
        print("toke: "+str(reset_token))
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


@app.route('/file/<filename>',methods=['GET'])
@cross_origin(origin="*")
@jwt_required()
def get_file(filename):
    user_id = get_jwt_identity()
    buf = StringIO()
    data = ''
    df = _getCache(filename)
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
@cross_origin(origin="*")
@jwt_required()
def uploadFile():
    
    file = request.files['file']
    #get user id
    
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
    

    #Updating users list of files to store upto three files
    # file_name = str(mongo_collection.find_one({"file_name": filename}, {"_id":1})['file_name'])
    user_id = get_jwt_identity()
    update_user_files_list(user_id, filename)

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

def update_user_files_list(user_id, filename):
    user_files_list = user_collection.find_one({"_id":ObjectId(user_id)}, {"files":1})['files']
    queue = collections.deque(user_files_list)
    if filename in queue:
        queue.remove(filename)
    if len(queue) >= 3:
        queue.pop()
    queue.appendleft(filename)   
    user_collection.update_one({'_id':ObjectId(user_id)}, {'$set':{'files':list(queue)}})

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
    app.run(host='0,0,0,0',debug=True)