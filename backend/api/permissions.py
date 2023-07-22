from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow owners of an object to modify it.
    """
    def has_object_permission(self, request, view, obj) -> bool:
        return request.method in permissions.SAFE_METHODS or obj.owner == request.user
