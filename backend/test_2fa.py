import requests
import json
import base64
from PIL import Image
import io

BASE_URL = "http://localhost:5000/api"

def safe_json(response):
    try:
        return response.json()
    except Exception:
        print("Raw response text:", response.text)
        return None

def test_2fa():
    # 1. Register a new user
    register_data = {
        "username": "testuser2",
        "password": "testpass123",
        "email": "test2@example.com",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print("Register response:", response.status_code, safe_json(response))
    if response.status_code != 201:
        return
    # 2. Login to get JWT token
    login_data = {
        "username": "testuser2",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print("Login response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return
    token = response.json().get("access_token")
    # 3. Enable 2FA
    headers = {"Authorization": f"Bearer {token}"}
    enable_2fa_data = {
        "method": "email"  # or "sms"
    }
    response = requests.post(f"{BASE_URL}/auth/enable-2fa", json=enable_2fa_data, headers=headers)
    print("Enable 2FA response:", response.status_code, safe_json(response))
    # 4. Request 2FA code
    response = requests.post(f"{BASE_URL}/auth/request-2fa", json=login_data)
    print("Request 2FA code response:", response.status_code, safe_json(response))
    # 5. Verify 2FA code (using the code from the response)
    verify_data = {
        "username": "testuser2",
        "password": "testpass123",
        "code": "123456"  # This should be the actual code received
    }
    response = requests.post(f"{BASE_URL}/auth/verify-2fa", json=verify_data)
    print("Verify 2FA response:", response.status_code, safe_json(response))

def test_face_id():
    # 1. Register a new user
    register_data = {
        "username": "testuser3",
        "password": "testpass123",
        "email": "test3@example.com",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print("Register response:", response.status_code, safe_json(response))
    if response.status_code != 201:
        return
    # 2. Login to get JWT token
    login_data = {
        "username": "testuser3",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print("Login response:", response.status_code, safe_json(response))
    if response.status_code != 200:
        return
    token = response.json().get("access_token")
    # 3. Register face
    headers = {"Authorization": f"Bearer {token}"}
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    files = {
        'photo': ('test.jpg', img_byte_arr, 'image/jpeg')
    }
    response = requests.post(f"{BASE_URL}/auth/register-face", files=files, headers=headers)
    print("Register face response:", response.status_code, safe_json(response))
    # 4. Verify face
    files = {
        'photo': ('test.jpg', img_byte_arr, 'image/jpeg')
    }
    response = requests.post(f"{BASE_URL}/auth/verify-face", files=files)
    print("Verify face response:", response.status_code, safe_json(response))

if __name__ == "__main__":
    print("Testing 2FA...")
    test_2fa()
    print("\nTesting Face ID...")
    test_face_id() 