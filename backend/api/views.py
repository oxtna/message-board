from rest_framework import views, status, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.reverse import reverse

from .models import Message, User
from .permissions import IsOwnerOrReadOnly
from .serializers import MessageSerializer, UserSerializer, RegistrationSerializer


class APIRoot(views.APIView):
    @staticmethod
    def get(request):
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
        queryset = Message.objects.all()
        username = self.request.query_params.get('user')
        if username is not None:
            queryset = queryset.filter(owner__username=username)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
