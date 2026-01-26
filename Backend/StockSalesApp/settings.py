from pathlib import Path
from os.path import join
import json


BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-xgcshgtd_v@x+-=8+v1ye!s%e!c*_l942k&(!k*527l0g^s_s3'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'Auth',
    'InventoryAPI',
    'SalesAPI',
    'rest_framework',
    'rest_framework.authtoken',
    'StatsAPI',
    'corsheaders',
    'ProvidersAPI',
    'AuthAPI',
    'BlameAPI',
    'CategoryAPI',
    'PaymentMethodAPI',
    'NotificationAPI',
    'EntryAPI',
    'Testing'
]

MIDDLEWARE = [
    "StockSalesApp.middleware.Error500PostMiddleware",
    'django.middleware.locale.LocaleMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'Auth.middleware.JWTAuthCookieMiddleware',
]

ROOT_URLCONF = 'StockSalesApp.urls'


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            join(BASE_DIR, 'StockSalesApp/templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'StockSalesApp.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },

]

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

TIME_ZONE = 'America/Argentina/Buenos_Aires'

USE_I18N = True

LANGUAGE_CODE = 'es'

LANGUAGES = [
    ('es', 'Español'),
    ('en', 'English'),
]

USE_I18N = True
USE_L10N = True

USE_TZ = True

STATIC_URL = 'static/'


# general use static files like bootstrap
STATICFILES_DIRS = [
    join(BASE_DIR, 'StockSalesApp/static/')
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'Auth.CustomUser'

LOGIN_URL = '/auth/'

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}


MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file_500": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": "errors_500.log",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django_500": {
            "handlers": ["file_500"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

ERROR_500_WEBHOOK_URL = "https://lautarodev.com.ar/api/errors/"

# get api key to send http500 errors to our backend
with open(BASE_DIR / "PERSONAL_IDENTIFIER.json") as f:
    PERSONAL_IDENTIFIER = json.load(f)

ERROR_500_API_KEY = PERSONAL_IDENTIFIER.get("key")