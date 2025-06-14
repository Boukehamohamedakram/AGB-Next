import time
from tasks.reminder_task import send_reminders
from app import app

def run_reminder_task():
    """Run the reminder task every hour."""
    with app.app_context():
        while True:
            try:
                send_reminders()
            except Exception as e:
                app.logger.error(f"Error in reminder task: {str(e)}")
            time.sleep(3600)  # Sleep for 1 hour

if __name__ == '__main__':
    run_reminder_task() 