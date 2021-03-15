from flask import request
from database.models import User
from flask_restful import Resource
from flask import Response, request
from flask_jwt_extended import create_access_token
import datetime
from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist
from resources.errors import SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, \
InternalServerError
# from resources.errors import errors

class SignupApi(Resource):
    def post(self):
        try:
            body = request.get_json()
            user =  User(**body)
            user.hash_password()
            user.save()
            id = user.id
            return {'id': str(id), "message":"Registered successfully"}, 200
        except FieldDoesNotExist:
            raise SchemaValidationError('Request is missing required fields')
        except NotUniqueError:
            raise EmailAlreadyExistsError('User with given email address already exists')
        except Exception as e:
            raise InternalServerError('Something went wrong')

class LoginApi(Resource):
    def post(self):
        try:
            body = request.get_json()
            try:
                user = User.objects.get(username=body.get('username'))
            except (DoesNotExist):
                user = User.objects.get(email=body.get('username'))
            authorized = user.check_password(body.get('password'))
            if not authorized:
                raise UnauthorizedError
 
            expires = datetime.timedelta(days=7)
            access_token = create_access_token(identity=str(user.id), expires_delta=expires)
            return {'accessToken': access_token, 'id': str(user.id), 'username':str(user.username)}, 200
        except (UnauthorizedError, DoesNotExist):
            raise UnauthorizedError('Invalid username or password')
        except Exception as e:
            raise InternalServerError('Something went wrong')