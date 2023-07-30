from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow owners of an object to modify it.
    """

    def has_object_permission(self, request, view, obj) -> bool:
        return request.method in permissions.SAFE_METHODS or obj.owner == request.user


class MessagePermission(permissions.BasePermission):
    """
    Permissions for different actions on the message.
    """

    def has_permission(self, request, view) -> bool:
        if view.action in ['retrieve', 'list']:
            return True
        elif view.action in ['create', 'update', 'partial_update', 'destroy', 'favorite', 'unfavorite']:
            return request.user.is_authenticated
        return False

    def has_object_permission(self, request, view, obj) -> bool:
        if view.action in ['retrieve', 'list']:
            return True
        elif view.action in ['create', 'favorite', 'unfavorite']:
            return request.user.is_authenticated
        elif view.action in ['update', 'partial_update', 'destroy']:
            return request.user.is_authenticated and obj.owner == request.user
        return False
