from django.db.models import Count, Exists, OuterRef
from rest_framework import views, viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.reverse import reverse

from .models import Message, User, Favorite
from .permissions import IsOwnerOrReadOnly
from .serializers import MessageSerializer, UserSerializer, RegistrationSerializer


class APIRoot(views.APIView):
    @staticmethod
    def get(request) -> Response:
        return Response({
            'users': reverse('user-list', request=request),
            'messages': reverse('message-list', request=request),
            'register': reverse('register', request=request),
            'obtain_token': reverse('token_obtain_pair', request=request),
            'refresh_token': reverse('token_refresh', request=request),
        })


class RegistrationAPIView(views.APIView):
    serializer_class = RegistrationSerializer

    @staticmethod
    def post(request) -> Response:
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserList(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserDetail(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()


class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Message.objects.all().order_by('-created')
        queryset = queryset.annotate(favorite_count=Count('favorited_by')).annotate(favorited=Exists(
            Favorite.objects.filter(user=self.request.user.id, message=OuterRef('pk'))
        ))
        username = self.request.query_params.get('user')
        parent = self.request.query_params.get('parent')
        posts = self.request.query_params.get('posts')
        if username is not None:
            queryset = queryset.filter(owner__username=username)
        if parent is not None:
            queryset = queryset.filter(parent__id=parent)
        if posts is not None:
            posts = posts.lower()
            if posts == 'true':
                queryset = queryset.filter(parent=None)
            elif posts == 'false':
                queryset = queryset.exclude(parent=None)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class MessageDetail(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Message.objects.all().order_by('-created')
        queryset = queryset.annotate(favorite_count=Count('favorited_by')).annotate(favorited=Exists(
            Favorite.objects.filter(user=self.request.user.id, message=OuterRef('pk'))
        ))
        return queryset

    @action(detail=True, methods=['post'], name='favorite')
    def favorite(self, request, *args, **kwargs) -> Response:
        Favorite.objects.get_or_create(user=request.user, message=self.get_object())
        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], name='unfavorite')
    def unfavorite(self, request, *args, **kwargs) -> Response:
        Favorite.objects.filter(user=request.user, message=self.get_object()).delete()
        return Response(status=status.HTTP_200_OK)
