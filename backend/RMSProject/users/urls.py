from django.urls import path
from .views import CreateAdminView, UserListView, UserDetailView, SignatoryListView, SignatoryDetailView

urlpatterns = [
    # create initial admin
    path('users/create-admin/', CreateAdminView.as_view()),
    
    # Signatories 
    path('users/signatories/',          SignatoryListView.as_view()),
    path('users/signatories/<int:pk>/', SignatoryDetailView.as_view()),

    # Warehouse Supervisors
    path('users/',          UserListView.as_view()),
    path('users/<int:pk>/', UserDetailView.as_view()),
]