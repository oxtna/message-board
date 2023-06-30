from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Message, User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token


class RegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_repeat = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_repeat']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_repeat']:
            raise serializers.ValidationError({'password': "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(username=validated_data['username'],
                                        email=validated_data['email'],
                                        password=validated_data['password'])


class UserSerializer(serializers.ModelSerializer):
    messages = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name='message-detail')

    class Meta:
        model = User
        fields = ['id', 'username', 'messages']


class MessageSerializer(serializers.ModelSerializer):
    children = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name='message-detail')
    parent = serializers.HyperlinkedRelatedField(queryset=Message.objects.all(), view_name='message-detail')
    owner = serializers.HyperlinkedRelatedField(read_only=True, view_name='user-detail')

    class Meta:
        model = Message
        fields = ['id', 'text', 'created', 'owner', 'parent', 'children']
