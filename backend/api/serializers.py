from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from api.models import Message, User, Follow


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token


class RegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_repeat = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_repeat"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_repeat"]:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class MessageSerializer(serializers.HyperlinkedModelSerializer):
    favorite_count = serializers.IntegerField(read_only=True)
    favorited = serializers.BooleanField(read_only=True)

    class Meta:
        model = Message
        fields = [
            "url",
            "id",
            "text",
            "time_created",
            "owner",
            "parent",
            "children",
            "favorite_count",
            "favorited",
        ]


class FollowSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Follow
        fields = ["url", "follower", "following"]


class UserSerializer(serializers.HyperlinkedModelSerializer):
    followers = serializers.HyperlinkedRelatedField(
        many=True, view_name="user-detail", read_only=True
    )
    followings = serializers.HyperlinkedRelatedField(
        many=True, view_name="user-detail", read_only=True
    )

    class Meta:
        model = User
        fields = ["url", "id", "username", "followers", "followings"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["messages"] = [
            MessageSerializer(instance=message, context=self.context).data["url"]
            for message in instance.messages.order_by("-time_created")
        ]
        representation["favorites"] = [
            MessageSerializer(instance=favorite, context=self.context).data["url"]
            for favorite in instance.favorites.order_by("-time_created")
        ]
        return representation
