class InternalServerError(Exception):
    def __init__(self, message, status=500, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

class SchemaValidationError(Exception):
    def __init__(self, message, status=400, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

class EmailAlreadyExistsError(Exception):
    def __init__(self, message, status=400, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

class UnauthorizedError(Exception):
    def __init__(self, message, status=401, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

class UnauthorizedRole(Exception):
    def __init__(self, message, status=401, payload=None):
        self.message = message
        self.status = status
        self.payload = payload
class AlreadyRequested(Exception):
    def __init__(self, message, status=401, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

class EmailDoesnotExistsError(Exception):
    def __init__(self, message, status=400, payload=None):
        self.message = message
        self.status = status
        self.payload = payload
class UserDoesNotExistsError(Exception):
    def __init__(self, message, status=400, payload=None):
        self.message = message
        self.status = status
        self.payload = payload

class BadTokenError(Exception):
    def __init__(self, message, status=403, payload=None):
        self.message = message
        self.status = status
        self.payload = payload


# errors = {
#     "InternalServerError": {
#         "message": "Something went wrong",
#         "status": 500
#     },
#      "SchemaValidationError": {
#          "message": "Request is missing required fields",
#          "status": 400
#      },
#      "EmailAlreadyExistsError": {
#          "message": "User with given email address already exists",
#          "status": 400
#      },
#      "UnauthorizedError": {
#          "message": "Invalid username or password",
#          "status": 401
#      },
#      "EmailDoesnotExistsError": {
#          "message": "Couldn't find the user with given email address",
#          "status": 400
#      },
#      "BadTokenError": {
#          "message": "Invalid token",
#          "status": 403
#       }
# }