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
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics import confusion_matrix, roc_curve, mean_squared_error, r2_score, classification_report, plot_roc_curve, silhouette_score
from sklearn.decomposition import PCA
import scikitplot as skplt
from scipy import stats
from mlxtend.frequent_patterns import apriori, association_rules 
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from wordcloud import WordCloud
from nltk.stem import PorterStemmer
from nltk.stem import WordNetLemmatizer

# import cv2



# login imports
from database.db import initialize_db
from flask_restful import Api, Resource
from flask_bcrypt import Bcrypt
from resources.errors import InternalServerError, SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, \
    EmailDoesnotExistsError, BadTokenError, UnauthorizedRole, AlreadyRequested, UserDoesNotExistsError
from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError
from flask_jwt_extended import create_access_token, decode_token, get_jwt_identity, JWTManager, get_current_user, \
    jwt_required, create_refresh_token, get_jwt, get_jti
from database.models import User, TokenBlockList
import bson
from bson.binary import Binary
from bson.objectid import ObjectId
import collections
#  #

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
#forgot password imports
from threading import Thread
from flask_mail import Message, Mail
# import datetime
from datetime import datetime, timedelta, timezone
from jwt.exceptions import ExpiredSignatureError, DecodeError, \
    InvalidTokenError
from IPython.display import Image

#Login and signup
from dateutil import tz


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
# from resources.routes import initialize_routes

# initialize_routes(api)
initialize_db(app)


file_descs = {"SSR_TSRPT.pdf": "This is description 1",
              "A_Normalization_Process_to_Standardize_Handwriting_Data_Collected_from_Multiple_Resources_for_Recognition.pdf": "desc2",
              "7580-evidential-deep-learning-to-quantify-classification-uncertainty.pdf": "d3"}

mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["data_science_learning_platform_database"]
mongo_collection = mongo_db["files"]
user_collection = mongo_db["user"]
pending_requests_collection = mongo_db["pending_requests"]

missing_values = ['-', '?', 'na', 'n/a', 'NA', 'N/A', 'nan', 'NAN', 'NaN']
DEFAULT_FILES = ['Mall_Customers_clustering.csv', 'credit_card_default_classification.csv', 'house_price_prediction_regression.csv', 'amazon_alexa_text.csv']
# DEFAULT_FILES = []
cache = Cache(config={'CACHE_TYPE': 'simple'})
cache.init_app(app)
EditedPrefix = '__EDITED___'


env_var = os.environ.get("FLASK_ENV")
# if env_var == "development":
#     if user_collection.find({"username":"dummy_user"}):
#         user_collection.remove({"username":"dummy_user"})
#     user =  User(username="dummy_user",email="dummy_user@g.com", password="dummy@123")
#     user.hash_password()
#     user.save()
  


CORS(app)



def insert_default_files():
    path = 'backend/assets/files/'
    for filename in DEFAULT_FILES:
        file_details = mongo_collection.find_one({"file_name": filename})
        if not file_details:
            file = path+filename
            with open(file, "rb") as file_content:
                content = Binary(file_content.read())
                # bson_content = BSON::Binary.new(content)
            mongo_collection.insert_one({"user_id":ObjectId(b"awesomeadmin"),"file_name": filename, "desc": "Default desc", "logo_name": "default_logo.png",
                        "source_link": "default source link","content":content})
insert_default_files()

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
def email_does_not_exists(e):
    return {"status":e.status, "message":e.message}, 400

@app.errorhandler(UserDoesNotExistsError)
def user_does_not_exists(e):
    return {"status":e.status, "message":e.message}, 400

@app.errorhandler(UnauthorizedError)
def unauthorized_user(e):
    return {"status":e.status, "message":e.message}, 401

@app.errorhandler(UnauthorizedRole)
def unauthorized_role(e):
    return {"status":e.status, "message":e.message}, 401

@app.errorhandler(AlreadyRequested)
def already_requested(e):
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


def instructorRegister(user):
    user_db = pending_requests_collection.find_one({ '$or': [{"username": user['username']}, {"email": user['email']}]})
    if user_db:
        raise AlreadyRequested('Already requested with same username/email and role' )
    else:
        pending_requests_collection.insert_one(user.to_mongo())

# Block expired tokens
# Callback function to check if a JWT exists in the db blocklist
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    try:
        token = TokenBlockList.objects.get(jti=jti)
        return token is not None
    except:
        return False


#APIs
@app.route("/pending_requests", methods=["GET"])
@cross_origin(origin="*")
@jwt_required()
def pending_requests():
    user_id = get_jwt_identity()
    is_admin_username = user_collection.find_one({"_id":ObjectId(user_id)})['username']
    try:
        if not is_admin_username or is_admin_username != 'admin':
            raise UnauthorizedError('err')
        # reqs = pending_requests_collection.find({})
        data = []
        for count, req in enumerate(pending_requests_collection.find()):
            entry = {'id':count, 'fullname':req['fullname'], 'email':req['email']}
            data.append(entry)
        return jsonify(pending_requests=data), 200
    except UnauthorizedError:
        raise UnauthorizedError('Invalid role to access pending requests')
    except Exception as e:
        raise InternalServerError('Something went wrong')


@app.route("/api/auth/grant_intructor_access", methods=["POST"])
@cross_origin(origin="*")
@jwt_required()
def grant_intructor_access():
    url =  str(request.origin)+'/login'
    user_id = get_jwt_identity()
    is_admin_username = user_collection.find_one({"_id":ObjectId(user_id)})['username']
    try:
        if not is_admin_username or is_admin_username != 'admin':
            raise UnauthorizedError('err') 
        body = request.get_json()
        email = body['email']
        user_db = pending_requests_collection.find_one({"email": email})
        if not user_db:
            raise UserDoesNotExistsError("Couldn't find the user")
        else:
            try:
                user = User.objects.get(email=email)
                user['roles'].extend(['Instructor'])
            except (DoesNotExist):
                del user_db['_id']
                user = User(**user_db)
                user_avatar = open('backend/assets/images/avatar.png','rb')
                user.profile_image.put(user_avatar, filename='avatar.png')
            # try:

            # user_data = User(**user_db)
            # user = User.objects.get(username=body.get('username'))
            user.save()
            pending_requests_collection.remove({"email":email})
            send_email('[Awesome data mining] New Instructor Login request',
                        sender='awesomedatamining@gmail.com',
                        recipients=[email],
                        text_body=render_template('register/register.txt',
                                                        role=user['roles'][0], url=url),
                        html_body=render_template('register/register.html',
                                                        role=user['roles'][0], url=url))
        return jsonify(success=True), 200
    except UnauthorizedError:
        raise UnauthorizedError('Invalid role to grant instructor access')
    except UserDoesNotExistsError:
        raise UserDoesNotExistsError("Couldn't find the user")
    except Exception as e:
        raise InternalServerError('Something went wrong')


@app.route("/api/auth/signup", methods=["POST"])
def register():
    try:
        body = request.get_json()
        role = body['roles']
        try:
            user_db = User.objects.get(email=body.get('email'))
            if user_db['username'] != body['username']:
                raise NotUniqueError
            authorized = user_db.check_password(body.get('password'))
            if not authorized:
                raise UnauthorizedRole('um')
            
            if role[0] in user_db['roles'] or role[0] != 'Instructor':
                raise UnauthorizedRole('um')
            else:
                # user_db['roles'].extend(role)
                instructorRegister(user_db)
                send_email('[Awesome data mining] New Instructor Login request',
                    sender='awesomedatamining@gmail.com',
                    recipients=['datasciencelearningplatform1@gmail.com'],
                    text_body=render_template('instructor_Access/instructor.txt',
                                                    username=user_db['username'], email=user_db['email']),
                    html_body=render_template('instructor_Access/instructor.html',
                                                    username=user_db['username'], email=user_db['email']))
                # user_db.save()
                
                
                return {'id': str(user_db.id), "message":"Request sent to admin for Instructor verification. This can take upto two business days."}, 200
        except DoesNotExist:
            user =  User(**body)
            user_db = user_collection.find_one({ '$or': [{"username": user['username']}, {"email": user['email']}]})
            if user_db:
                raise NotUniqueError
            user.hash_password()   
            # user.save()
            id = user.id
            if role[0] == 'Instructor':
                instructorRegister(user)
                send_email('[Awesome data mining] New Instructor Login request',
                        sender='awesomedatamining@gmail.com',
                        recipients=['datasciencelearningplatform1@gmail.com'],
                        text_body=render_template('instructor_Access/instructor.txt',
                                                        username=user['username'], email=user['email']),
                        html_body=render_template('instructor_Access/instructor.html',
                                                        username=user['username'], email=user['email']))
                return {'id': str(user.id), "message":"Request sent to admin for Instructor verification. This can take upto two business days."}, 200
            else:          
                user_avatar = open('backend/assets/images/avatar.png','rb')
                user.profile_image.put(user_avatar, filename='avatar.png')
                user.save()
            return {'id': str(id), "message":"Registered successfully"}, 200
    except AlreadyRequested:
        raise AlreadyRequested('Already requested with same username, email and role' )
    except UnauthorizedRole:
        raise UnauthorizedRole('User with given role already exists. Note:If creating same account with new role make sure your password matches')
    except FieldDoesNotExist:
        raise SchemaValidationError('Request is missing required fields')
    except NotUniqueError:
        raise EmailAlreadyExistsError('Username or email is already taken')
    except Exception as e:
        raise InternalServerError('Something went wrong')

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        body = request.get_json()
        role = body.get('roles')
        try:
            user = User.objects.get(username=body.get('username'))
        except (DoesNotExist):
            user = User.objects.get(email=body.get('username'))
        authorized = user.check_password(body.get('password'))
        if not authorized:
            raise UnauthorizedError('um')
        try:
            imgStr = base64.b64encode(user.profile_image.read()).decode("utf-8").replace("\n", "")
        except:
            user_avatar = open('backend/assets/images/avatar.png','rb')
            # imgStr = base64.b64encode(open('backend/assets/images/avatar.png','rb')).decode("utf-8").replace("\n", "")
            user.profile_image.put(user_avatar, filename='avatar.png')
            imgStr = ""
        if "user_activity" in user:
            if user.user_activity != {}:
                progress = extract_report(user)
            else:
                progress = {}
        else:
            progress = {}
        if not user["roles"]:
            user.roles = [role]
        else:
            if body.get('roles') not in user['roles']:
                raise UnauthorizedRole('User with '+role+' does not exist')
        
        expires = timedelta(days=25)
        expires_refresh = timedelta(days=30)
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)
        refresh_token = create_refresh_token(identity=str(user.id), expires_delta=expires_refresh)
        user.last_logged_in = datetime.now(timezone.utc)
        if "user_bio" not in user:
            user.user_bio = ""
        if "report_to" not in user:
            user.report_to = ""
        user.save()
        to_zone = tz.tzlocal()
        last_logged_in = user.last_logged_in.astimezone(to_zone)
        if user.username == 'admin':
            role = "admin"
        return {'accessToken': access_token, 'refreshToken': refresh_token, 'id': str(user.id), 'username':str(user.username), 'name':str(user.fullname), 'email':str(user.email), 'avatar':imgStr, \
            'progress':progress, 'last_logged':str(last_logged_in), "user_bio":str(user.user_bio), "report_to":user.report_to, "role":role}, 200
    except UnauthorizedRole:
        raise UnauthorizedRole('User with '+role+' permission not allowed')
    except UnauthorizedError:
        raise UnauthorizedError('Invalid password')
    except DoesNotExist:
        raise EmailDoesnotExistsError('Invalid username or email')
    except Exception as e:
        raise InternalServerError('Something went wrong')


def extract_report(user):
    # img = BytesIO()
    # sns.set_style("whitegrid", {'axes.grid' : False})
    # plt.figure(figsize=(12,12))
    df = pd.DataFrame(user.user_activity.items(), columns=["date", "hrs"])
    df['date'] = df['date'].apply(lambda a: datetime.strptime(a, '%Y-%m-%d'))
    df.sort_values(by=['date'], ignore_index=True, inplace=True)
    all_days = pd.date_range(df['date'].min(), df['date'].max(), freq='D')
    new = pd.DataFrame(all_days, columns=['date'])
    avail = df['date'].values
    for i in range(len(new)):
        if new.loc[i,['date']][0] in avail:
            new.loc[i, ['hrs']] = df.loc[np.where(df['date'] == new.loc[i,['date']][0])[0][0], ['hrs']][0]
        else:
            new.loc[i, ['hrs']] = 0

    new['hrs'] = new['hrs'] / 3600
    new['hrs'] = new['hrs'].round(2)
    weeks = new.groupby(new.date.dt.strftime('%W')).hrs.sum()
    months = new.groupby(new.date.dt.strftime('%m')).hrs.sum()
    # # z = np.array(new['date'].apply(lambda x: x.date().strftime('%Y-%m-%d')))
    new['date'] = new['date'].apply(lambda x: x.date().strftime('%Y-%m-%d'))
    days = new.set_index('date')['hrs'].to_dict()
    weeks = weeks.to_dict()
    months = months.to_dict()

    progress = {"days":days, "weeks":weeks, "months":months}
    return progress
    # line = sns.lineplot(data = df, x = 'date', y = 'sec')
    # line.set_xticklabels(df.date, rotation=90)
    # line = sns.lineplot(data = new, x = 'date', y = 'sec')
    # line.set_xticklabels(z, rotation=90)
    # plt.suptitle('Your activity', fontsize='25')
    # plt.xlabel('Date', fontsize=20)
    # plt.ylabel('Seconds', fontsize=20)
    # plt.savefig(img, format='png') 
    # plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
    # img.close()
    # return plotUrl


# Endpoint for revoking the current users access token. Save the JWTs unique
# identifier (jti) in redis. Also set a Time to Live (TTL)  when storing the JWT
# so that it will automatically be cleared out of redis after the token expires.
@app.route("/api/auth/logout", methods=["DELETE"])
@cross_origin(origin="*")
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    user_id = get_jwt_identity()
    now = datetime.now(timezone.utc)
    last_logged_in = user_collection.find_one({"_id":ObjectId(user_id)})['last_logged_in']
    last_logged_in = datetime.combine(last_logged_in.date(), last_logged_in.time(), timezone.utc)
    next_day_sec = 0
    if now.date() > last_logged_in.date():   
        my_date = last_logged_in.date()
        my_time = datetime.min.time()
        my_datetime = datetime.combine(my_date, my_time, timezone.utc)
        seconds = (my_datetime - last_logged_in).seconds
        next_day_sec = (now - my_datetime)
    else:
        seconds = (now - last_logged_in).seconds
    user = User.objects(id=user_id)[0]
    user_act = user['user_activity']
    if str(now.date()) in user_act:
        user_act[str(now.date())] += seconds
    else:
        user_act[str(now.date())] = seconds 
    user_collection.update_one({"_id":ObjectId(user_id)}, {"$set":{"user_activity":user_act}})       
    blocklist = TokenBlockList(jti=jti, created_at=now)
    blocklist.save()
    return jsonify(msg="Access token revoked"), 200



@app.route("/api/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    expires = timedelta(days=7)
    access_token = create_access_token(identity=current_user, expires_delta=expires)
    return jsonify(accessToken=access_token), 200


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

        expires = timedelta(hours=24)
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
    try:
        user_files_list = user_collection.find_one({"_id":ObjectId(user_id)}, {"files":1})['files']
    except:
        user_files_list = []
    return {'files_list': user_files_list}


@app.route('/instructors',methods=['GET'])
@cross_origin(origin="*")
@jwt_required()
def get_instructors():
    user_id = get_jwt_identity()
    instructor_list = []
    # instructor_list = user_collection.find({"$and":[{"roles":"Instructor"}, {"username":{"$ne":"admin"}}]}))
    for instructor in user_collection.find({"$and":[{"roles":"Instructor"}, {"username":{"$ne":"admin"}}]}):
        instructor_list.append(instructor['email'])
    return {"instructor_list": instructor_list}


@app.route('/graph_details',methods=['POST'])
@cross_origin(origin="*")
@jwt_required()
def get_graph_details():
    user_id = get_jwt_identity()
    role = json.loads(request.data)['role']
    # is_admin_username = user_collection.find_one({"_id":ObjectId(user_id)})['username']
    
    if role == 'admin':
        instructors = user_collection.count_documents({"roles":{"$in":["Instructor"]}})
        students = user_collection.count_documents({"roles":{"$in":["Student"]}})
        return {"students":students, "instructors":instructors}
    elif role == 'Instructor':
        students = len(user_collection.find_one({"_id":ObjectId(user_id)})['students'])
        # students = user_collection.count_documents({"roles":{"$in":["Student"]}})
        return {"students":students}


@app.route('/set_instructor',methods=['PATCH'])
@cross_origin(origin="*")
@jwt_required()
def report_instructor():
    user_id = get_jwt_identity()
    ins_email = json.loads(request.data)['email']
    update_instructor(user_id, ins_email)
    return jsonify(success=True)


def update_instructor(user_id, new_instructor_email):
    old_instructor_email = None
    try:
        old_instructor_email = user_collection.find_one({"_id":ObjectId(user_id)}, {"report_to":1})['report_to']
    except KeyError:
        print('No report field')

    if old_instructor_email:
        old_instructor_students = user_collection.find_one({"email":old_instructor_email}, {"students":1})['students']
        if old_instructor_students:
            try:
                old_instructor_students.remove(ObjectId(user_id))
            except ValueError:
                print('Student not in old instructors list')
        else:
            old_instructor_students = []
        user_collection.update_one({"email":old_instructor_email}, {'$set':{'students':old_instructor_students}})
    new_instructor_students = []
    try:
        new_instructor_students = user_collection.find_one({"email":new_instructor_email}, {"students":1})['students'] 
    except KeyError:
        print('NO Students')  
    new_instructor_students.append(ObjectId(user_id))             
    user_collection.update_one({"email":new_instructor_email}, {'$set':{'students':new_instructor_students}})
    user_collection.update_one({"_id":ObjectId(user_id)}, {'$set':{'report_to':new_instructor_email}})


def convertNaN(value):
    return None if math.isnan(value) else value


@app.route('/file/',methods=['GET'])
@cross_origin(origin="*")
@jwt_required()
def get_file():
    filename = request.args.get('filename')
    default = request.args.get('default')
    user_id = get_jwt_identity()
    if default!='false':
        user_id_admin = ObjectId(b'awesomeadmin')
    buf = StringIO()
    data = ''
    if default=='true':
        df = _getCache(user_id_admin,filename, modified=False)
    else:
        df = _getCache(user_id,filename, modified=False)
    if default == 'false':
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
        'distinct':format('%.2f'%(100*len(df[num].unique())/(df[num].count()+0.0001)))+'%',
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
    df = None
    copyModified = False

    if modified:
        key = str(uid)+'_'+EditedPrefix + name
        df = cache.get(key)
        if df is None:
            copyModified = True

    if df is None:
        df = cache.get(str(uid)+'_'+name)
        if df is None:
            details = mongo_collection.find_one({"file_name": name,"user_id":uid})
            if not details:
                if name in DEFAULT_FILES:
                    details = mongo_collection.find_one({"file_name": name,"user_id":ObjectId(b"awesomeadmin")})
                    if not details:
                        return None
                else:
                    return None
            df = pd.read_csv(StringIO(details['content'].decode('utf8')))
            _setCache(uid,name,df,modified = False)

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
    # return jsonify(message='Token has expired'), 401
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
    dfJSON = df.to_json()
    return jsonify(modifiedJson = ndf.to_json() if ndf is not None else dfJSON,dataJson = dfJSON,
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
    print('params=', params)
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
        if option == 1:
            ndf = ndf.dropna(axis=1)
        if option == 2:
            condition = cleaner['condition']
            for col in condition['cols']:
                ndf[col].fillna(ndf[col].astype(float).mean(), inplace=True)
        if option == 3:
            condition = cleaner['condition']
            for col in condition['cols']:
                ndf[col].fillna(ndf[col].astype(float).median(), inplace=True)
        if option == 4:
            condition = cleaner['condition']
            for item in condition['items']:
                ndf[item['col']].fillna(item['val'], inplace=True)
        if option == 5:
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
    # df = _getCache(user_id,EditedPrefix+filename) or _getCache(user_id,filename)    # auto replace missing values
    df = _getCache(user_id,filename)
    ndf = df.replace(MISSING_VALUES, np.nan)
    para_result = ''
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    img = BytesIO()
    plt.figure(figsize=(20,20))
    option = params['activeOption']
    print("option=", option)

    if option == 0:
        cols = params['cols']
        print("cols=", cols)
        for col,ctype in cols:
            print('col,ctype=', col,ctype)
            if ctype == 'to lowercase':
                ndf[col] = ndf[col].astype(str).str.lower()
            elif ctype == 'to uppercase':
                ndf[col] = ndf[col].astype(str).str.upper()
        print(ndf.head())

    elif option == 1:
        cols = params['cols']
        print("cols1-=", cols)
        for index, col in cols:
            label = LabelEncoder()
            ndf[col] = label.fit_transform(ndf[col].astype(str))
    elif option == 2:
        suboption_checked = params['suboption_checked']
        print('suboption_checked 2= ', suboption_checked)
        for col in suboption_checked:
            col_bins = params[col+'_'+'Bins']
            col_labels = params[col+'_'+'Labels']
            ndf[col] = pd.cut(ndf[col].astype(float), bins=list(col_bins.split(",")), labels=list(col_labels.split(",")))
    elif option == 3:
        col1_arithmetic = params['col1_arithmetic']
        operation = params['operation']
        col2_arithmetic = params['col2_arithmetic']
        new_colname = params['new_colname']
        if operation == '+':
            ndf[new_colname] = ndf[col1_arithmetic] + ndf[col2_arithmetic]
        elif operation == '-':
            ndf[new_colname] = ndf[col1_arithmetic] - ndf[col2_arithmetic]
        elif operation == '*':
            ndf[new_colname] = ndf[col1_arithmetic] * ndf[col2_arithmetic]
        elif operation == '/':
            ndf[new_colname] = ndf[col1_arithmetic] / ndf[col2_arithmetic]
    elif option == 4:
        cols = params['cols']
        print("col3=", cols)
        print('df', ndf.head())
        stand_scaler_col=[]
        for index, col in cols:
            stand_scaler_col.append(col)
        print('stand_scaler_col= ', stand_scaler_col)
        scaler = StandardScaler()
        ndf[stand_scaler_col] = scaler.fit_transform(ndf[stand_scaler_col])
        print(ndf.head())
    elif option == 5:
        cols = params['cols']
        print("cols4=", cols)
        stand_scaler_col=[]
        for index, col in cols:
            stand_scaler_col.append(col)
        scaler = MinMaxScaler()
        ndf[stand_scaler_col] = scaler.fit_transform(ndf[stand_scaler_col])
    elif option == 6:
        basic_col = params['check_basic_col']
        basic_operation = params['basic_operation']
        if basic_operation == 'check most common words':
            all_words=[]
            for msg in df[basic_col]:
                words=word_tokenize(msg)
                for w in words:
                    all_words.append(w)
            #Frequency of Most Common Words
            frequency_dist=nltk.FreqDist(all_words)
            para_result += '\nMost Common Words(100): \n'+  "\n".join(['%s : %s' % (key, str(value)) for key, value in frequency_dist.most_common(100)])#'\n'.join(frequency_dist.most_common(100))
            #Frequency Plot for first 100 most frequently occuring words
            frequency_dist.plot(100,cumulative=False)
            plt.savefig(img, format='png') #, bbox_inches='tight', plt.close(fig)
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif basic_operation == 'visualize: wordcloud':
            wc = WordCloud(width=1000, height=1000, background_color="black", max_words=2000, random_state=42, max_font_size=30)
            wc.generate(' '.join(df[basic_col]))
            plt.imshow(wc)
            plt.axis("off")
            plt.savefig(img, format='png',facecolor='k', bbox_inches='tight') #, bbox_inches='tight', plt.close(fig)
            plt.clf()
            img.seek(0)
            plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
            img.close()
        elif basic_operation == 'words count':
            new_basic_col = basic_col + '_words_count'
            ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len(str(x).split(" ")))
        elif basic_operation == "charactures count":
            new_basic_col = basic_col + '_charactures_count'
            ndf[new_basic_col] = ndf[basic_col].apply(len)
        elif basic_operation == "average word length":
            def avg_word(sentence):
                words = sentence.split()
                return (sum(len(word) for word in words)/len(words)) if len(words)!=0 else 0
            new_basic_col = basic_col + '_average_word_length'
            ndf[new_basic_col] = ndf[basic_col].apply(lambda x: avg_word(x))
        elif basic_operation == "stopwords count":
            stop = stopwords.words('english')
            new_basic_col = basic_col + '_stopwords_count'
            ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len([x for x in x.split() if x in stop]))
        elif basic_operation == "numbers count":
            new_basic_col = basic_col + '_numbers_count'
            ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len([x for x in x.split() if x.isdigit()]))
        elif basic_operation == "uppercase count":
            new_basic_col = basic_col + '_uppercase_count'
            ndf[new_basic_col] = ndf[basic_col].apply(lambda x: len([x for x in x.split() if x.isupper()]))

    elif option == 7:
        suboption_checked_text = params['suboption_checked_text']
        for col in suboption_checked_text:
            col_currVal = params[col+'_CurrVal']
            new_colname = params[col+'_NewCol']
            col_newVal = params[col+'_NewVal']
            new_feat_assigns = {}
            col_currVal_list = col_currVal.split(',')
            col_newVal_list = col_newVal.split(',')
            for uniq_val, new_label in zip(col_currVal_list, col_newVal_list):
                new_feat_assigns[uniq_val] = new_label
            ndf[new_colname] = ndf[col].apply(lambda x: new_feat_assigns.get[x])
    elif option == 8:
        text_feateng_col = params['text_feateng_col']
        text_feateng_option = params['text_feateng_operation']
        if 'convert to lower case' in text_feateng_option:
            ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: " ".join(x.lower() for x in x.split()))
        if 'expand contraction' in text_feateng_option:
            print('contraction------')
            # Dictionary of English Contractions
            contractions_dict = { "ain't": "are not","'s":" is","aren't": "are not",
                        "can't": "cannot","can't've": "cannot have",
                        "'cause": "because","could've": "could have","couldn't": "could not",
                        "couldn't've": "could not have", "didn't": "did not","doesn't": "does not",
                        "don't": "do not","hadn't": "had not","hadn't've": "had not have",
                        "hasn't": "has not","haven't": "have not","he'd": "he would",
                        "he'd've": "he would have","he'll": "he will", "he'll've": "he will have",
                        "how'd": "how did","how'd'y": "how do you","how'll": "how will",
                        "I'd": "I would", "i'd": "i would","I'd've": "I would have", "i'd've": "i would have",
                        "I'll": "I will", "i'll": "i will", "i'll've": "i will have","i'm": "i am",
                        "I'll've": "I will have","I'm": "I am", "I've": "I have", "i've": "i have", "isn't": "is not",
                        "it'd": "it would","it'd've": "it would have","it'll": "it will", "it's": "it is",
                        "it'll've": "it will have", "let's": "let us","ma'am": "madam",
                        "mayn't": "may not","might've": "might have","mightn't": "might not", 
                        "mightn't've": "might not have","must've": "must have","mustn't": "must not",
                        "mustn't've": "must not have", "needn't": "need not",
                        "needn't've": "need not have","o'clock": "of the clock","oughtn't": "ought not",
                        "oughtn't've": "ought not have","shan't": "shall not","sha'n't": "shall not",
                        "shan't've": "shall not have","she'd": "she would","she'd've": "she would have",
                        "she'll": "she will", "she'll've": "she will have","should've": "should have",
                        "shouldn't": "should not", "shouldn't've": "should not have", "so've": "so have",
                        "that'd": "that would","that'd've": "that would have", "there'd": "there would",
                        "there'd've": "there would have", "they'd": "they would",
                        "they'd've": "they would have","they'll": "they will",
                        "they'll've": "they will have", "they're": "they are","they've": "they have",
                        "to've": "to have","wasn't": "was not","we'd": "we would",
                        "we'd've": "we would have","we'll": "we will","we'll've": "we will have",
                        "we're": "we are","we've": "we have", "weren't": "were not","what'll": "what will",
                        "what'll've": "what will have","what're": "what are", "what've": "what have",
                        "when've": "when have","where'd": "where did", "where've": "where have",
                        "who'll": "who will","who'll've": "who will have","who've": "who have",
                        "why've": "why have","will've": "will have","won't": "will not",
                        "won't've": "will not have", "would've": "would have","wouldn't": "would not",
                        "wouldn't've": "would not have","y'all": "you all", "y'all'd": "you all would",
                        "y'all'd've": "you all would have","y'all're": "you all are",
                        "y'all've": "you all have", "you'd": "you would","you'd've": "you would have",
                        "you'll": "you will","you'll've": "you will have", "you're": "you are",
                        "you've": "you have"}
            contractions_re = re.compile('(%s)' % '|'.join(contractions_dict.keys()))
            def expand_contractions(text,contractions_dict=contractions_dict):
                def replace(match):
                    return contractions_dict[match.group(0)]
                return contractions_re.sub(replace, text)
            ndf[text_feateng_col]=ndf[text_feateng_col].apply(lambda x:expand_contractions(x))
        if 'remove punctuation' in text_feateng_option:
            ndf[text_feateng_col] = ndf[text_feateng_col].str.replace('[^\w\s]','')
        if 'remove stopwords automatically' in text_feateng_option:
            stop = stopwords.words('english')
            ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: " ".join(x for x in x.split() if x not in stop))
        if 'remove digits' in text_feateng_option:
            ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: ''.join([i for i in x if not i.isdigit()]))
        if 'Word Normalization1: lemmatization' in text_feateng_option:
            lemma = WordNetLemmatizer()
            ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: ' '.join(lemma.lemmatize(term, pos="v") for term in x.split()))           
        if 'Word Normalization2: stemming' in text_feateng_option:
            ps=PorterStemmer()
            ndf[text_feateng_col] = ndf[text_feateng_col].apply(lambda x: ' '.join(ps.stem(term) for term in x.split()))           
        if 'Extract Model1: CountVectorizer' in text_feateng_option:
            tf_vectorizer = CountVectorizer()
            tf = tf_vectorizer.fit_transform(ndf[text_feateng_col]).toarray()
            tf_feat_names = tf_vectorizer.get_feature_names()
            para_result += "\nVocabulary: \n" + tf_feat_names 
            para_result += '\nCount Vectorizer After fit_transform: \n' + tf
        if 'Extract Model2: TfidfVectorizer' in text_feateng_option:
            tfidf_vectorizer = TfidfVectorizer()
            tfidf = tfidf_vectorizer.fit_transform(ndf[text_feateng_col]).toarray()
            tfidf_feat_names = tfidf_vectorizer.get_feature_names()
            para_result += "\nVocabulary: \n" + tfidf_feat_names
            para_result += "\nidf vector: \n" + tfidf_vectorizer.idf_
            para_result += '\nTF-IDF Vectorizer After fit_transform: \n' + tfidf
    _setCache(user_id,filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf) # update num_col and cate_col
    return jsonify(data=ndf.to_json(), cols = cols, num_cols = num_cols, cate_cols = cate_cols, para_result=para_result, plot_url=plotUrl)

    
@app.route('/feature_selection', methods=['POST'])
@cross_origin()
@jwt_required()
def cond_select_json():
    params = request.json
    filename = params['filename']
    user_id = get_jwt_identity()    
    df = _getCache(user_id,filename)
    ndf = df.replace(MISSING_VALUES, np.nan)
    print('params***!!=====', params)

    DEFAULT_PLOT_SIZE = (5,5)
    Techniques = {i:e for i,e in enumerate(['Removing Features with Low Variance', 'Correlation Matrix','Regression1: Pearson’s Correlation Coefficient','Classification1: ANOVA','Classification2: Chi-Squared','Classification3: Mutual Information','Principal Component Analysis'])}
    PlotType_library = {i:e for i,e in enumerate(['bar', 'scatter', 'line', 'heatmap'])}
    plotSize = tuple(map(int,params['plotsize'].split(','))) if params['plotsize'] else DEFAULT_PLOT_SIZE
    plotType = PlotType_library[params['plottype']] if params['plottype'] else 'bar'
    Y = params['targety']
    tech = Techniques[int(params['technique'])] if 'technique' in params else 'Correlation Matrix'
    X = params['variablesx']
    K = int(params['selectkbest']) if params['selectkbest'] else len(X)
    if Y:
        ndf = pd.concat([ndf[X], ndf[Y]], axis=1)
    else:
        ndf = ndf[X]
    ndf = ndf.apply(pd.to_numeric,errors='ignore') # convert data type
    X = ndf[X]
    Y = ndf[Y]
    img = BytesIO()
    if tech in ["Correlation Matrix", 'Principal Component Analysis']:
        if tech == "Correlation Matrix":
            featureResult = ndf.corr(method ='pearson')  # get correlations of each features in dataset
            featureResult = pd.DataFrame(data=featureResult)
            title = tech
            x_label, y_label = 'Features', 'Correlation'
        elif tech == "Principal Component Analysis":
            num_comp = int(params['specific_inputVal_pca']) if 'specific_inputVal_pca' in params and params['specific_inputVal_pca'] else 2
            scaled_data = StandardScaler().fit_transform(ndf)
            pca = PCA(n_components=num_comp)
            pca_res = pca.fit_transform(scaled_data) 
            col_pca= ["PC"+ str(i+1) for i in range(num_comp)]
            pca_df = pd.DataFrame(data=pca_res, columns=col_pca)
            featureResult = pd.concat([pca_df, Y], axis=1)
            title = 'Principle Component Analysis'
            x_label, y_label = 'Features', 'PC'
        plt.rcParams["figure.figsize"] = plotSize
        if plotType == 'bar':
            featureResult.plot.bar()
        elif plotType == 'scatter':
            sns.pairplot(featureResult) 
        elif plotType == 'line':
            featureResult.plot.line()
        elif plotType == 'heatmap':
            sns.heatmap(featureResult,annot=True,cmap="RdYlGn")
    else:
        if tech == "Removing Features with Low Variance":
            thresh = float(params['specific_inputVal_lowVar']) if 'specific_inputVal_lowVar' in params and params['specific_inputVal_lowVar'] else 0.3
            fs = VarianceThreshold(threshold=thresh)
            fs.fit(X)
            featureResult = pd.DataFrame({"Features":X.columns ,"Boolean Result":fs.get_support()})
            x_label, y_label, title = 'Features', 'Boolean Result', 'Variance Threshold: 1-True, 0-False'
            featureResult['Boolean Result'] = featureResult['Boolean Result'].astype(int)
        else:
            if tech == "Regression1: Pearson’s Correlation Coefficient":
                fs = SelectKBest(score_func=f_regression, k=K)
            elif tech == "Classification1: ANOVA":
                fs = SelectKBest(score_func=f_classif, k=K)
            elif tech == "Classification2: Chi-Squared":
                fs = SelectKBest(score_func=chi2, k=K)
            elif tech == "Classification3: Mutual Information":
                fs = SelectKBest(score_func=mutual_info_classif, k=K)
            fit = fs.fit(X, Y.values.ravel())
            featureResult = pd.DataFrame({'Features': X.columns, 'Score': fit.scores_})
            featureResult=featureResult.nlargest(K,'Score')  #print k best features
            x_label, y_label, title = 'Features', 'Score', tech+'\nFeature Score'
        featureResult.plot(x=x_label, y=y_label, kind=plotType, color=(np.random.random_sample(), np.random.random_sample(), np.random.random_sample()), rot=0)
    plt.title(title)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.legend(bbox_to_anchor=(1, 0.5), loc='upper left')
    plt.rcParams["figure.figsize"] = plotSize
    plt.savefig(img, format='png', bbox_inches="tight") 
    plt.clf()
    img.seek(0)
    plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
    img.close()
    para_result = featureResult.to_html()
    return jsonify(plot_url=plotUrl, para_result=para_result)


@app.route('/preprocessing', methods=['POST'])
@cross_origin()
@jwt_required()
def cond_preprocess_json():
    cond, para_result = '', ''
    params = request.json
    filename = params['filename']
    user_id = get_jwt_identity()
    df = _getCache(user_id,filename)
    ndf = df.replace(MISSING_VALUES, np.nan)
    print('params= ', params)
    target_col, target_operation = [], []
    option = int(params['option'])
    for key, val in params.items():
        if val and key in ndf.columns:
            target_col.append(key)
            target_operation.append(val)
    print('target_col, target_operation', target_col, target_operation)
    if option == 0:
        ndf = ndf.apply(pd.to_numeric, errors='ignore')
        for i,k in zip(list(ndf.columns), ndf.dtypes):
            para_result += "\n" + i + ": " + str(k)
    elif option == 1:
        for index1, index2 in zip(target_col, target_operation):
            cond += "\n" + str(index1) + ":  " + str(index2)
            print("index2==", index2)
            print("index1=", index1)
            if index2 in ['int64', 'float64']:
                ndf[index1] = pd.to_numeric(ndf[index1], errors='coerce')
            elif index2 == 'datetime':
                # ndf[index1] = pd.to_datetime(ndf[index1]) # json problem: turn into a sequence of num
                ndf[index1] = ndf[index1].datetime.strftime('%Y-%m-%d')
            elif index2 == ['int64', 'float64', 'string', 'bool', 'category']:
                ndf[index1] = ndf[index1].astype(index2)
        for i,k in zip(list(ndf.columns), ndf.dtypes):
            para_result +=  "\n" + i + ": " + str(k)
    elif option == 2:
        remove_cols = params['cols']
        cond += "\n" + str(remove_cols)
        ndf = ndf.drop(remove_cols, axis=1)
    elif option == 3:
        for index1, index2 in zip(target_col, target_operation):
            cond += "\n" + str(index1) + ":  " + str(index2)
            for k in index2:
                ndf[index1] = ndf[index1].str.replace(k, '')
    elif option == 4:
        for index1, index2 in zip(target_col, target_operation):
            cond += "\n" + str(index1) + ":  " + str(index2)
            temp = index2.split(',')
            ndf = ndf[~(df[index1].isin(temp))]
    elif option == 5:
        for index1, index2 in zip(target_col, target_operation):
            cond += "\n" + str(index1) + ":  " + str(index2)
            temp = index2.split(',') if ',' in index2 else index2
            if ',' in index2:
                for each_word in temp:
                    ndf[index1] = ndf[index1].str.replace(each_word, '')   
            else:
                ndf[index1] = ndf[index1].str.replace(temp, '')    
        
    print(ndf.head(20))
    print("cond = ", cond)
    print("para_result=", para_result)
    _setCache(user_id,filename,ndf)
    cols,col_lists,num_cols,num_lists,cate_cols,cate_lists = getDataFrameDetails(ndf)
    return jsonify(data=ndf.to_json(),
    cols = cols,col_lists = col_lists, num_cols = num_cols, 
    cate_cols = cate_cols, cate_lists = cate_lists, num_lists = num_lists, cond=cond, para_result=para_result)


# Sophie merged--> need modify 
def get_pre_vs_ob(model, Y_pred, Y_test, fig_len, fig_wid, plotType):
    # if isinstance(Y_test, pd.DataFrame):
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
    # else:
        # plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
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
    print(params)
    analysis_model = params['analysis_model']
    test_size = 0.3 if params['test_size']=='None' or (not params['test_size'].strip()) else float(params['test_size'])/100
    metric = params['metric'] if 'metric' in params else 'neg_mean_squared_error'
    plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
    finalVar = params['finalVar']  
    finalY = params['finalY'] 
    df = _getCache(user_id, filename)   
    ndf = df.replace(MISSING_VALUES, np.nan)
    kfold = KFold(n_splits=10, random_state=7, shuffle=True)
    X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) # with original order
    cond += "\nFinal Independent Variables: " + str(finalVar) + "\nFinal Dependent Variable: "+ str(finalY)
    cond += "\nChoose Test Size(%): " + str(test_size*100)
    if analysis_model == "Linear Regression":
        param_fit_intercept_lr = params['param_fit_intercept_lr'] if 'param_fit_intercept_lr' in params else True
        param_normalize_lr = params['param_normalize_lr'] if 'param_normalize_lr' in params else False
        model = LinearRegression(fit_intercept=param_fit_intercept_lr, normalize=param_normalize_lr) 
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
        # param_max_depth = int(params['param_max_depth']) if 'param_max_depth' in params else 3
        param_max_depth = None if params['param_max_depth']=='None' or (not params['param_max_depth'].strip()) else int(params['param_max_depth'])
        param_max_features = params['param_max_features'] if 'param_max_features' in params else None
        param_max_leaf_nodes = None if params['param_max_leaf_nodes']=='None' or (not params['param_max_leaf_nodes'].strip()) else int(params['param_max_leaf_nodes'])
        param_random_state = None if params['param_random_state']=='None' or (not params['param_random_state'].strip()) else  int(params['param_random_state'])
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        model = DecisionTreeRegressor(criterion=param_criterion, splitter=param_splitter, max_depth=param_max_depth, max_features=param_max_features, max_leaf_nodes=param_max_leaf_nodes, random_state=param_random_state)
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
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
        param_max_depth = None if params['param_max_depth']=='None' or (not params['param_max_depth'].strip()) else int(params['param_max_depth'])
        param_n_estimators = 100 if (not params['param_n_estimators'].strip())  else int(params['param_n_estimators'])
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else 3
        find_n_estimators = [int(x) for x in params['find_n_estimators'].split(',') if params['find_n_estimators']] if 'find_n_estimators' in params else None
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'mse'
        param_max_features = params['param_max_features'] if 'param_max_features' in params else 'auto'
        param_max_leaf_nodes = None if params['param_max_leaf_nodes']=='None' or (not params['param_max_leaf_nodes'].strip()) else int(params['param_max_leaf_nodes'])
        param_random_state = None if params['param_random_state']=='None' or (not params['param_random_state'].strip()) else  int(params['param_random_state'])
        model = RandomForestRegressor(n_estimators=param_n_estimators, criterion=param_criterion, max_depth=param_max_depth, max_features=param_max_features, max_leaf_nodes=param_max_leaf_nodes, random_state=param_random_state)
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
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
        param_C = 1.0 if params['param_C']=='None' or (not params['param_C'].strip()) else float(params['param_C'])
        param_gamma = 0.01 if params['param_gamma']=='None' or (not params['param_gamma'].strip()) else float(params['param_gamma'])
        find_C = [float(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        find_gamma  = [float(x) for x in params['find_gamma'].split(',') if params['find_gamma']] if 'find_gamma' in params else None
        param_kernel = params['param_kernel'] if 'param_kernel' in params else "rbf"
        model = SVR(kernel=param_kernel, gamma=param_gamma, C=param_C)
        Y_pred = model.fit(X_train, Y_train).predict(X_test) 
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
            col_temp = analysis_model + i
            if col_temp in params and params[col_temp]:
                predic_var.append(i)
                input_val.append(params[col_temp])
        Class_input_val = [input_val]
        input_val = np.array(Class_input_val, dtype='float64')
        result = model.predict(input_val)
        cond = "\n".join("{}: {}".format(x, y) for x, y in zip(predic_var, input_val.flatten()))
        para_result = "\n Model: " + analysis_model + "  \nPredicted Result:" + str(result)
        plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    return jsonify(data=ndf.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)



@app.route('/analysis/classification', methods=['POST']) # regression
@cross_origin()
@jwt_required()
def cond_Classification_json():
    cond, para_result, fig_len, fig_wid, isTsv = '', '', 5, 5, False
    plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image
    user_id = get_jwt_identity()
    params = request.json
    filename = params['filename']
    print(params)
    analysis_model = params['analysis_model']
    test_size = 0.3 if params['test_size']=='None' or (not params['test_size'].strip()) else float(params['test_size'])/100
    metric = params['metric'] if 'metric' in params else 'Classification Report'
    plotType = params['pre_obs_plotType'] if 'pre_obs_plotType' in params else 'line'
    finalVar = params['finalVar']
    finalY = params['finalY']
    df = _getCache(user_id, filename)
    ndf = df.replace(MISSING_VALUES, np.nan)
    print("****&&&&&&test******")
    # isTsv = True if filename.split('.')[-1]=='tsv' else False
    isTsv = True if 'amazon' in filename else False
    print('isTsv=', isTsv)
    if isTsv:
        text_data_feat_model = params['text_data_feat_model']
        if text_data_feat_model == 'CountVectorizer':
            scaler = CountVectorizer()
        elif text_data_feat_model == 'TfidfVectorizer':
            scaler = TfidfVectorizer()
        X = scaler.fit_transform(ndf[finalVar[0]]).toarray()
        Y = ndf[finalY].values
        # print("X=",X)
        # print('Y=',Y)
        X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size = test_size, random_state = 0)
    else:
        kfold = KFold(n_splits=10, random_state=7, shuffle=True)
        X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 

    cond += "\nFinal Independent Variables: " + str(finalVar) + "\nFinal Dependent Variable: "+ str(finalY)
    cond += "\nChoose Test Size(%): " + str(test_size*100)
    if analysis_model == "Logistic Regression":
        find_solver = [x for x in params['find_solver'].split(',') if params['find_solver']] if 'find_solver' in params else None
        find_C = [float(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        param_solver = params['param_solver'] if 'param_solver' in params else 'lbfgs'
        param_C = 1.0 if params['param_C']=='None' or (not params['param_C'].strip()) else float(params['param_C'])
        model = LogisticRegression(solver=param_solver, C=param_C)
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
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        param_max_depth = None if params['param_max_depth']=='None' or (not params['param_max_depth'].strip()) else int(params['param_max_depth'])
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'gini'
        param_max_leaf_nodes = None if params['param_max_leaf_nodes']=='None' or (not params['param_max_leaf_nodes'].strip()) else int(params['param_max_leaf_nodes'])
        model = DecisionTreeClassifier(criterion=param_criterion, max_depth=param_max_depth, max_leaf_nodes=param_max_leaf_nodes) 
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
        cond += "\nModel: Decision Tree Classifier \nSet Parameters:  max_depth=" + str(param_max_depth) + ", criterion=" + str(param_criterion)  + ", max_leaf_nodes=" + str(param_max_leaf_nodes)
        cond += "\nPlot Predicted vs. Observed Target Variable: Plot Type: " + plotType
        cond += '\nMetric: ' + metric
        if find_max_depth:
            tuned_para = [{'max_depth': find_max_depth}]
            cond = "\nFind Parameter for Decision Tree Classifier: " + str(tuned_para)
            MSE = ['mean_squared_error(Y_test, Y_pred']
            for value in MSE:
                grid_model = GridSearchCV(DecisionTreeClassifier(), tuned_para, cv=4)
                grid_model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, grid_model.predict(X_test)
                para_result = 'The best hyper-parameters for Decision Tree Classifier are: ' + str(grid_model.best_params_)
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
        find_max_depth = [int(x) for x in params['find_max_depth'].split(',') if params['find_max_depth']] if 'find_max_depth' in params else None
        find_n_estimators = [int(x) for x in params['find_n_estimators'].split(',') if params['find_n_estimators']] if 'find_n_estimators' in params else None
        param_max_depth = None if params['param_max_depth']=='None' or (not params['param_max_depth'].strip()) else int(params['param_max_depth'])
        param_n_estimators = 100 if (not params['param_n_estimators'].strip())  else int(params['param_n_estimators'])
        param_criterion = params['param_criterion'] if 'param_criterion' in params else 'gini'
        param_max_leaf_nodes = None if params['param_max_leaf_nodes']=='None' or (not params['param_max_leaf_nodes'].strip()) else int(params['param_max_leaf_nodes'])
        model = RandomForestClassifier(max_depth=param_max_depth, n_estimators=param_n_estimators, criterion=param_criterion, max_leaf_nodes=param_max_leaf_nodes)
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
                grid_model = GridSearchCV(RandomForestClassifier(), tuned_para, cv=4)
                grid_model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, grid_model.predict(X_test)
                para_result = "The best hyper-parameters for " + analysis_model + " are: " + str(grid_model.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    elif analysis_model == 'SVM Classifier':
        find_C = [float(x) for x in params['find_C'].split(',') if params['find_C']] if 'find_C' in params else None
        find_gamma = [float(x) for x in params['find_gamma'].split(',') if params['find_gamma']] if 'find_gamma' in params else None
        param_C = 1.0 if params['param_C']=='None' or (not params['param_C'].strip()) else float(params['param_C'])
        param_gamma = 0.01 if params['param_gamma']=='None' or (not params['param_gamma'].strip()) else float(params['param_gamma'])
        param_kernel = params['param_kernel'] if 'param_kernel' in params else 'rbf'
        model = SVC(C=param_C, gamma=param_gamma, kernel=param_kernel)
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
                grid_model = GridSearchCV(SVC(), tuned_para, cv=4)
                grid_model.fit(X_train, Y_train)
                Y_true, Y_pred = Y_test, grid_model.predict(X_test)
                para_result = "The best hyper-parameters for " + analysis_model + " are: " + str(grid_model.best_params_)
            plotUrl = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' # blank image

    elif analysis_model == 'Naive Bayes Classifier':
        model = GaussianNB()
        if isTsv:
            X = StandardScaler().fit_transform(df[finalVar[0]]).toarray()  # test ; change later
            Y = df[finalY].values
            X_train, X_test, Y_train, Y_test = train_test_split(ndf[finalVar], ndf[finalY], test_size=test_size, random_state=0, shuffle=False) 
        else:
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
        if isTsv:
            input_val = scaler.transform(input_val).toarray()
        else:
            input_val = np.array([input_val], dtype='float64')
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
    df = _getCache(user_id, filename)
    ndf = df.replace(MISSING_VALUES, np.nan)
    # finalVar = params['finalVar'] if 'finalVar' in params else ndf.Columns
    # finalVar = [x for x in df.columns if 'finalVar'+x in params]
    finalVar = params['variablesx']
    print('finalVar=', finalVar)
    analysis_model = params['analysis_model']
    param_n_clusters = 3 if params['param_n_clusters']=='None' or (not params['param_n_clusters'].strip()) else  int(params['param_n_clusters'])
    clustering_plot = params['clustering_plot'] if 'clustering_plot' in params else 'all attributes: 2D plot'
    metric = params['metric'] if 'metric' in params else None
    param_init = params['param_init'] if 'param_init' in params else 'k-means++'
    param_random_state = None if params['param_random_state']=='None' or (not params['param_random_state'].strip()) else int(params['param_random_state'])
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
    para_result += labeledData.to_html()

    return jsonify(data=ndf.to_json(), cond=cond, para_result=para_result, plot_url=plotUrl)


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
    df = _getCache(user_id, filename)
    ndf = df.replace(MISSING_VALUES, np.nan)
    analysis_model = params['analysis_model']
    metric = params['metric'] if 'metric' in params else 'Classification Report'
    transid = params['trans_id']
    transitem = params['trans_item']
    params_support_min_thresh = 0.1 if params['params_support_min_thresh']=='None' or (not params['params_support_min_thresh'].strip()) else float(params['params_support_min_thresh'])
    params_lift_min_thresh = 1.0 if params['params_lift_min_thresh']=='None' or (not params['params_lift_min_thresh'].strip()) else float(params['params_lift_min_thresh'])
    params_confidence_min_thresh = 0.5 if params['params_confidence_min_thresh']=='None' or (not params['params_confidence_min_thresh'].strip()) else float(params['params_confidence_min_thresh'])
    params_antecedent_len = 1 if params['params_antecedent_len']=='None' or (not params['params_antecedent_len'].strip()) else int(params['params_antecedent_len'])
    params_use_colnames = bool(params['params_use_colnames']) if 'params_use_colnames' in params else True
    params_max_len = None if params['params_max_len']=='None' or (not params['params_max_len'].strip()) else int(params['params_max_len'])
    param_specific_item = params['param_specific_item'] if 'param_specific_item' in params else None
    metrics_apriori = params['metrics_apriori'] if 'metrics_apriori' in params else '5.Association Rules: list all items'
    cond += "\n\nAssociation Rules:\nSet Parameters: support_min_threshold=" + str(params_support_min_thresh) + ", lift_min_threshold=" + str(params_lift_min_thresh) + ", confidence_min_threshold=" + str(params_confidence_min_thresh)
    ndf['Quantity']= 1
    basket_data = ndf.groupby([transid, transitem])['Quantity'].sum().unstack().fillna(0)

    def transform_transaction(val):
        if val <= 0:
            return 0
        if val >= 1:
            return 1
    basket_sets = basket_data.applymap(transform_transaction)
    print('basket_sets=', basket_sets)
    frequent_itemsets = apriori(basket_sets, min_support=params_support_min_thresh, use_colnames=params_use_colnames)
    print(frequent_itemsets)
    rules = association_rules(frequent_itemsets, metric='support', min_threshold=params_support_min_thresh)
    rules["antecedent_length"] = rules["antecedents"].apply(lambda x: len(x))
    rules = rules[ (rules['antecedent_length'] >= params_antecedent_len) & (rules['confidence'] > params_confidence_min_thresh) & (rules['lift'] > params_lift_min_thresh) ]
    print(rules)
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