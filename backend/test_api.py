import requests
import json
import os
from datetime import datetime
import base64

BASE_URL = 'http://localhost:5000/api'
test_files_dir = 'test_files'

# Create test files directory if it doesn't exist
if not os.path.exists(test_files_dir):
    os.makedirs(test_files_dir)

def print_response(response, title):
    print(f"\n=== {title} ===")
    print(f"Status Code: {response.status_code}")
    try:
        print("Response:", json.dumps(response.json(), indent=2))
    except:
        print("Response:", response.text)
    print("=" * 50)

def test_registration():
    # Test admin registration
    admin_data = {
        "username": "admin",
        "email": "admin@bank.com",
        "password": "admin123",
        "first_name": "Admin",
        "last_name": "User",
        "phone": "+213123456789",
        "role": "admin",
        "agency": "HQ",
        "wilaya": "Alger"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    print_response(response, "Admin Registration")

    # Test regular user registration
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+213987654321",
        "revenue": 50000,
        "wilaya": "Oran",
        "birth_date": "1990-01-01",
        "birth_place": "Oran",
        "juridic_state": "individual"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print_response(response, "User Registration")
    return response.json().get('access_token')

def test_login():
    # Test regular login
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print_response(response, "Regular Login")
    return response.json().get('access_token')

def test_2fa_setup(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(f"{BASE_URL}/auth/2fa/setup", headers=headers)
    print_response(response, "2FA Setup")
    return response.json().get('secret')

def test_2fa_verify(token, code):
    headers = {'Authorization': f'Bearer {token}'}
    data = {"code": code}
    response = requests.post(f"{BASE_URL}/auth/2fa/verify", headers=headers, json=data)
    print_response(response, "2FA Verification")

def test_biometric_setup(token):
    headers = {'Authorization': f'Bearer {token}'}
    # Simulate biometric data
    biometric_data = {
        "type": "fingerprint",
        "data": base64.b64encode(b"simulated_biometric_data").decode()
    }
    response = requests.post(f"{BASE_URL}/auth/biometric/setup", headers=headers, json=biometric_data)
    print_response(response, "Biometric Setup")

def test_document_upload(token):
    headers = {'Authorization': f'Bearer {token}'}
    
    # Create test document files
    documents = {
        'id_card': 'test_id_card.jpg',
        'residency': 'test_residency.pdf',
        'birth_certificate': 'test_birth_certificate.pdf'
    }
    
    for doc_type, filename in documents.items():
        # Create a test file
        with open(os.path.join(test_files_dir, filename), 'w') as f:
            f.write("Test document content")
        
        # Upload document
        files = {'file': (filename, open(os.path.join(test_files_dir, filename), 'rb'))}
        data = {'document_type': doc_type}
        response = requests.post(f"{BASE_URL}/verification/upload-document", 
                               headers=headers, 
                               files=files, 
                               data=data)
        print_response(response, f"Document Upload - {doc_type}")

def test_application_progress(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/verification/application-progress", headers=headers)
    print_response(response, "Application Progress")

def test_account_creation(token):
    headers = {'Authorization': f'Bearer {token}'}
    account_data = {
        "type": "courant",
        "currency": "DZD"
    }
    response = requests.post(f"{BASE_URL}/accounts", headers=headers, json=account_data)
    print_response(response, "Account Creation")
    return response.json().get('id')

def test_transaction(token, account_id):
    headers = {'Authorization': f'Bearer {token}'}
    transaction_data = {
        "account_id": account_id,
        "amount": 1000,
        "transaction_type": "deposit",
        "description": "Test deposit"
    }
    response = requests.post(f"{BASE_URL}/transactions", headers=headers, json=transaction_data)
    print_response(response, "Transaction Creation")

def test_recommendations(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f"{BASE_URL}/recommendations/offers", headers=headers)
    print_response(response, "Get Recommendations")

def test_chatbot(token):
    headers = {'Authorization': f'Bearer {token}'}
    message = {"message": "How do I create an account?"}
    response = requests.post(f"{BASE_URL}/recommendations/chatbot", headers=headers, json=message)
    print_response(response, "Chatbot Interaction")

def test_admin_dashboard(admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}
    response = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers)
    print_response(response, "Admin Dashboard")

def test_admin_reports(admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}
    params = {
        "type": "performance",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31"
    }
    response = requests.get(f"{BASE_URL}/admin/reports", headers=headers, params=params)
    print_response(response, "Admin Reports")

def main():
    print("Starting API Tests...")
    
    # Test registration and get tokens
    user_token = test_registration()
    admin_token = test_login()  # This will be the admin token
    
    # Test 2FA
    secret = test_2fa_setup(user_token)
    test_2fa_verify(user_token, "123456")  # Using a test code
    
    # Test biometric setup
    test_biometric_setup(user_token)
    
    # Test document upload and verification
    test_document_upload(user_token)
    test_application_progress(user_token)
    
    # Test account and transaction
    account_id = test_account_creation(user_token)
    test_transaction(user_token, account_id)
    
    # Test recommendations and chatbot
    test_recommendations(user_token)
    test_chatbot(user_token)
    
    # Test admin features
    test_admin_dashboard(admin_token)
    test_admin_reports(admin_token)
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    main() 