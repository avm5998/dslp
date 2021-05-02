# from flask import request
# from database.models import User
# from flask_restful import Resource
# from flask import Response, request
# from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity , jwt_required, get_jwt, get_jti
# from datetime import datetime, timezone, timedelta
# import base64
# from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError
# from resources.errors import SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, \
# InternalServerError, EmailDoesnotExistsError
# import pandas as pd
# import seaborn as sns
# from io import BytesIO
# import matplotlib.pyplot as plt
# import base64
# from dateutil import tz
# from app import app
# import numpy as np
# # from resources.errors import errors


# class SignupApi(Resource):
#     def post(self):
#         try:
#             body = request.get_json()
#             user =  User(**body)
#             user_avatar = open('backend/assets/images/avatar.png','rb')
#             user.profile_image.put(user_avatar, filename='avatar.png')
#             user.hash_password()
#             user.save()
#             id = user.id
#             return {'id': str(id), "message":"Registered successfully"}, 200
#         except FieldDoesNotExist:
#             raise SchemaValidationError('Request is missing required fields')
#         except NotUniqueError:
#             raise EmailAlreadyExistsError('User with given email address already exists')
#         except Exception as e:
#             raise InternalServerError('Something went wrong')

# class LoginApi(Resource):
#     def post(self):
#         try:
#             body = request.get_json()
#             try:
#                 user = User.objects.get(username=body.get('username'))
#             except (DoesNotExist):
#                 user = User.objects.get(email=body.get('username'))
#             authorized = user.check_password(body.get('password'))
#             if not authorized:
#                 raise UnauthorizedError('um')
#             try:
#                 imgStr = base64.b64encode(user.profile_image.read()).decode("utf-8").replace("\n", "")
#             except:
#                 user_avatar = open('backend/assets/images/avatar.png','rb')
#                 # imgStr = base64.b64encode(open('backend/assets/images/avatar.png','rb')).decode("utf-8").replace("\n", "")
#                 user.profile_image.put(user_avatar, filename='avatar.png')
#                 imgStr = ""
#             if "user_activity" in user:
#                 progress = extract_report(user)
#             else:
#                 progress = ""
#             expires = timedelta(days=25)
#             expires_refresh = timedelta(days=30)
#             access_token = create_access_token(identity=str(user.id), expires_delta=expires)
#             refresh_token = create_refresh_token(identity=str(user.id), expires_delta=expires_refresh)
#             user.last_logged_in = datetime.now(timezone.utc)
#             if "user_bio" not in user:
#                 user.user_bio = ""
#             user.save()
#             to_zone = tz.tzlocal()
#             last_logged_in = user.last_logged_in.astimezone(to_zone)
#             return {'accessToken': access_token, 'refreshToken': refresh_token, 'id': str(user.id), 'username':str(user.username), 'name':str(user.fullname), 'email':str(user.email), 'avatar':imgStr, \
#                 'progress':progress, 'last_logged':str(last_logged_in), "user_bio":str(user.user_bio)}, 200
#         except UnauthorizedError:
#             raise UnauthorizedError('Invalid password')
#         except DoesNotExist:
#             raise EmailDoesnotExistsError('Invalid username or email')
#         except Exception as e:
#             raise InternalServerError('Something went wrong')


# def extract_report(user):
#     img = BytesIO()
#     sns.set_style("whitegrid", {'axes.grid' : False})
#     plt.figure(figsize=(12,12))
#     if user.user_activity == {}:
#         return ""
#     table = user.user_activity
#     df = pd.DataFrame(table.items(), columns=["date", "sec"])
#     df['date'] = df['date'].apply(lambda a: datetime.strptime(a, '%Y-%m-%d'))
#     df.sort_values(by=['date'], ignore_index=True, inplace=True)
#     all_days = pd.date_range(df['date'].min(), df['date'].max(), freq='D')
#     new = pd.DataFrame(all_days, columns=['date'])
#     avail = df['date'].values
#     for i in range(len(new)):
#         if new.loc[i,['date']][0] in avail:
#             new.loc[i, ['sec']] = df.loc[np.where(df['date'] == new.loc[i,['date']][0])[0][0], ['sec']][0]
#         else:
#             new.loc[i, ['sec']] = 0
#     z = np.array(new['date'].apply(lambda x: x.date().strftime('%Y-%m-%d')))
#     # line = sns.lineplot(data = df, x = 'date', y = 'sec')
#     # line.set_xticklabels(df.date, rotation=90)
#     line = sns.lineplot(data = new, x = 'date', y = 'sec')
#     line.set_xticklabels(z, rotation=90)
#     plt.suptitle('Your activity', fontsize='25')
#     plt.xlabel('Date', fontsize=20)
#     plt.ylabel('Seconds', fontsize=20)
#     plt.savefig(img, format='png') 
#     plotUrl = base64.b64encode(img.getvalue()).decode('utf-8')
#     img.close()
#     return plotUrl