from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api import views

urlpatterns = [
    path('', views.APIRoot.as_view()),
    path('messages/', views.MessageList.as_view(), name='message-list'),
    path('messages/<int:pk>/', views.MessageDetail.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='message-detail'),
    path('messages/<int:pk>/favorite/', views.MessageDetail.as_view({'post': 'favorite', 'delete': 'unfavorite'}),
         name='message-favorite-create-destroy'),
    path('users/', views.UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='user-detail'),
    path('register/', views.RegistrationAPIView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
