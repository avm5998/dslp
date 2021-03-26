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
    data = df.to_json()
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
    key = str(uid)+'_'++name
    cache.set(key,df,timeout = app.config['CACHE_TIMEOUT'])
    return df

# get dataframe by content in cache or database, then put that datafrome into cache
def _getCache(uid,name):
    key = str(uid)+'_'++name
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

    # {
    #     option,
    #     condition:{
    #         items or cols
    #     }
    # }

    # auto replace missing values
    ndf = ndf.replace(MISSING_VALUES, np.nan)
    print(cleaners)
    return None
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
            for col in range(condition.cols):
                df[col].fillna(df[col].astype(float).mean(), inplace=True)
        elif option == 3:
            condition = cleaner['condition']
            for col in range(condition.cols):
                df[col].fillna(df[col].astype(float).median(), inplace=True)
        elif option == 4:
            condition = cleaner['condition']
            for item in range(condition.items):
                df[item.col].fillna(item.val, inplace=True)
        elif option == 5:
            for item in range(condition.items):
                df[item.col] =  df[item.col].astype(float)
                q_low = df[item.col].quantile(float(item.below.strip('%'))/100) if below in item else float('-inf')
                q_hi = df[item.col].quantile(float(item.above.strip('%'))/100) if above in item else float('inf')
                df = df[(df[each_col] < q_hi) & (df[each_col] > q_low)]
                
       
    _setCache(user_id,EditedPrefix+filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists)

@app.route('/current_data_json', methods=['POST']) #/query
@cross_origin()
@jwt_required()
def current_data_json():
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']

    df = _getCache(EditedPrefix+filename) or _getCache(filename)
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

if __name__ == '__main__':
    app.run(host='0,0,0,0',debug=True)