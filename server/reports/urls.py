from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'reports'

urlpatterns = [
    # Report CRUD operations
    path('', views.ReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),

    # Report components
    path('<int:report_id>/metrics/', views.ReportMetricsView.as_view(), name='report-metrics'),

    # Completed inspections
    path('completed-inspections/', views.get_completed_inspections, name='completed-inspections'),

    # Statistics
    path('statistics/', views.report_statistics, name='report-statistics'),

    # Export endpoints
    path('export/pdf/<int:report_id>/', views.export_report_pdf, name='export-report-pdf'),
    path('export/inspections-pdf/', views.export_inspections_pdf, name='export-inspections-pdf'),
    
    # Save generated report endpoint
    path('save/', views.save_generated_report, name='save-generated-report'),
    
    # Centralized Report Dashboard endpoints
    path('access/', views.get_report_access, name='report-access'),
    path('generate/', views.generate_report, name='generate-report'),
    path('filter-options/', views.get_filter_options, name='filter-options'),
]
