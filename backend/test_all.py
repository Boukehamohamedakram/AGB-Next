import requests
import json
import base64
from PIL import Image
import io
import os
from datetime import datetime
import time

BASE_URL = "http://localhost:5000/api"
TEST_FILES_DIR = 'test_files'

# Create test files directory if it doesn't exist
if not os.path.exists(TEST_FILES_DIR):
    os.makedirs(TEST_FILES_DIR)

def safe_json(response):
    try:
        return response.json()
    except Exception:
        print("Raw response text:", response.text)
        return None

def print_response(response, title):
    print(f"\n=== {title} ===")
    print(f"Status Code: {response.status_code}")
    try:
        print("Response:", json.dumps(response.json(), indent=2))
    except:
        print("Response:", response.text)
    print("=" * 50)

class TestUser:
    def __init__(self, username, password, email, first_name, last_name, phone):
        self.username = username
        self.password = password
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.token = None
        self.account_id = None

def test_registration(user):
    register_data = {
        "username": user.username,
        "password": user.password,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print_response(response, f"Register {user.username}")
    return response.status_code == 201

def test_login(user):
    login_data = {
        "username": user.username,
        "password": user.password
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print_response(response, f"Login {user.username}")
    if response.status_code == 200:
        user.token = response.json().get("access_token")
        return True
    return False

def test_2fa_setup(user):
    headers = {"Authorization": f"Bearer {user.token}"}
    enable_2fa_data = {
        "method": "email"
    }
    response = requests.post(f"{BASE_URL}/auth/enable-2fa", json=enable_2fa_data, headers=headers)
    print_response(response, f"Enable 2FA for {user.username}")
    return response.status_code == 200

def test_2fa_request(user):
    login_data = {
        "username": user.username,
        "password": user.password
    }
    response = requests.post(f"{BASE_URL}/auth/request-2fa", json=login_data)
    print_response(response, f"Request 2FA code for {user.username}")
    return response.status_code == 200

def test_2fa():
    timestamp = int(time.time())
    username = f"testuser1_{timestamp}"
    phone = f"+1234567890_{timestamp}"
    # 1. Register a new user
    register_data = {
        "username": username,
        "password": "testpass123",
        "email": f"test1_{timestamp}@example.com",
        "first_name": "Test",
        "last_name": "User1",
        "phone": phone
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print("Register response:", response.status_code, safe_json(response))
    if response.status_code != 201:
        return
    # 2. Login to get JWT token
    login_data = {
        "username": username,
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print("Login response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return
    token = response.json()['access_token']
    # 3. Enable 2FA
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    response = requests.post(f"{BASE_URL}/auth/enable-2fa", headers=headers, json={"method": "email"})
    print("Enable 2FA response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return
    # 4. Request 2FA code
    response = requests.post(f"{BASE_URL}/auth/request-2fa", json=login_data)
    print("Request 2FA code response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return
    code = response.json().get('code')
    # 5. Verify 2FA
    verify_data = {
        "username": username,
        "password": "testpass123",
        "code": code
    }
    response = requests.post(f"{BASE_URL}/auth/verify-2fa", json=verify_data)
    print("Verify 2FA response:", response.status_code, safe_json(response))

def test_face_registration(user):
    headers = {"Authorization": f"Bearer {user.token}"}
    # Create a test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    files = {
        'photo': ('test.jpg', img_byte_arr, 'image/jpeg')
    }
    response = requests.post(f"{BASE_URL}/auth/register-face", files=files, headers=headers)
    print_response(response, f"Register face for {user.username}")
    return response.status_code == 200

def test_face_verification(user):
    # Create a test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    files = {
        'photo': ('test.jpg', img_byte_arr, 'image/jpeg')
    }
    response = requests.post(f"{BASE_URL}/auth/verify-face", files=files)
    print_response(response, f"Verify face for {user.username}")
    return response.status_code == 200

def test_account_creation(user):
    headers = {"Authorization": f"Bearer {user.token}"}
    account_data = {
        "type": "courant",
        "currency": "DZD"
    }
    response = requests.post(f"{BASE_URL}/accounts", headers=headers, json=account_data)
    print_response(response, f"Create account for {user.username}")
    if response.status_code == 201:
        user.account_id = response.json().get('id')
        return True
    return False

def test_transaction(user):
    headers = {"Authorization": f"Bearer {user.token}"}
    transaction_data = {
        "account_id": user.account_id,
        "amount": 1000,
        "transaction_type": "deposit",
        "description": "Test deposit"
    }
    response = requests.post(f"{BASE_URL}/transactions", headers=headers, json=transaction_data)
    print_response(response, f"Create transaction for {user.username}")
    return response.status_code == 201

def test_chatbot(user):
    headers = {"Authorization": f"Bearer {user.token}"}
    message = {"message": "How do I create an account?"}
    response = requests.post(f"{BASE_URL}/chatbot", headers=headers, json=message)
    print_response(response, f"Chatbot interaction for {user.username}")
    return response.status_code == 200

def test_face_id():
    timestamp = int(time.time())
    username = f"testuser2_{timestamp}"
    phone = f"+1234567891_{timestamp}"
    
    # 1. Register a new user
    register_data = {
        "username": username,
        "password": "testpass123",
        "email": f"test2_{timestamp}@example.com",
        "first_name": "Test",
        "last_name": "User2",
        "phone": phone
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print("Register response:", response.status_code, safe_json(response))
    if response.status_code != 201:
        return

    # 2. Login to get JWT token
    login_data = {
        "username": username,
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print("Login response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return
    token = response.json()['access_token']

    # 3. Register face
    headers = {'Authorization': f'Bearer {token}'}
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    files = {'photo': ('test.png', img_byte_arr, 'image/png')}
    response = requests.post(f"{BASE_URL}/auth/register-face", headers=headers, files=files)
    print("Register face response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return

    # 4. Verify face
    response = requests.post(f"{BASE_URL}/auth/verify-face", json=face_data)
    print("Verify face response:", response.status_code, safe_json(response))

def run_all_tests():
    print("Starting comprehensive API tests...")
    
    # Create test users
    user1 = TestUser(
        username="testuser1",
        password="testpass123",
        email="test1@example.com",
        first_name="Test",
        last_name="User1",
        phone="+1234567890"
    )
    
    user2 = TestUser(
        username="testuser2",
        password="testpass123",
        email="test2@example.com",
        first_name="Test",
        last_name="User2",
        phone="+1234567891"
    )
    
    # Test User 1 (2FA)
    print("\n=== Testing User 1 (2FA) ===")
    test_2fa()
    
    # Test User 2 (Face ID)
    print("\n=== Testing User 2 (Face ID) ===")
    test_face_id()
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    run_all_tests() 