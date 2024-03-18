from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

import api.views

urlpatterns = [
    path("", api.views.APIRoot.as_view()),
    path("messages/", api.views.MessageList.as_view(), name="message_list"),
    path(
        "messages/create/",
        api.views.MessageViewSet.as_view({"post": "create"}),
        name="message-create",
    ),
    path(
        "messages/<int:pk>/",
        api.views.MessageViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="message-detail",
    ),
    path(
        "messages/<int:pk>/favorite/",
        api.views.MessageViewSet.as_view({"post": "favorite", "delete": "unfavorite"}),
        name="message-favorite-create-destroy",
    ),
    path("users/", api.views.UserViewSet.as_view({"get": "list"}), name="user_list"),
    path(
        "users/<int:pk>/",
        api.views.UserViewSet.as_view({"get": "retrieve"}),
        name="user-detail",
    ),
    path(
        "users/<int:pk>/follow/",
        api.views.UserViewSet.as_view({"post": "follow", "delete": "unfollow"}),
        name="user-follow-create-destroy",
    ),
    path("register/", api.views.RegistrationAPIView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
