from django.core.management.base import BaseCommand
from system_config.models import SystemConfiguration

class Command(BaseCommand):
    help = 'Initialize system configuration with default values'

    def handle(self, *args, **options):
        try:
            config, created = SystemConfiguration.objects.get_or_create(
                is_active=True,
                defaults={
                    'email_host': 'smtp.gmail.com',
                    'email_port': 587,
                    'email_use_tls': True,
                    'email_host_user': '',
                    'email_host_password': '',
                    'default_from_email': '',
                    'default_user_password': 'Temp1234',
                    'access_token_lifetime_minutes': 60,
                    'refresh_token_lifetime_days': 1,
                    'rotate_refresh_tokens': True,
                    'blacklist_after_rotation': True,
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS('Successfully created default system configuration')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('System configuration already exists')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error initializing system configuration: {e}')
            )
