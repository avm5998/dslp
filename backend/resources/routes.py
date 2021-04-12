
from .auth import SignupApi, LoginApi
# from .reset_password import ForgotPassword, ResetPassword   

def initialize_routes(api):
    api.add_resource(SignupApi, '/api/auth/signup')
    api.add_resource(LoginApi, '/api/auth/login')