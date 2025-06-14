import requests
import json
from datetime import datetime

# Test configuration
BASE_URL = 'http://localhost:5000'
TEST_USER = {
    'user_id': 'test_user_001',
    'preferences': {
        'language': 'fr',
        'notifications': True
    }
}

def get_auth_token():
    """Register test user and get auth token"""
    try:
        response = requests.post(f'{BASE_URL}/auth/register', json={
            'username': TEST_USER['user_id'],
            'password': 'test_password',
            'email': 'test@example.com'
        })
        if response.status_code == 200:
            return response.json().get('token')
        return None
    except Exception as e:
        print(f"Error getting auth token: {str(e)}")
        return None

def test_chatbot():
    """Run comprehensive tests for the chatbot"""
    auth_token = get_auth_token()
    if not auth_token:
        print("Failed to get auth token. Exiting tests.")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    test_cases = [
        # French tests
        {
            'message': 'bonjour',
            'expected_keywords': ['assistant', 'virtuel', 'AGB'],
            'language': 'fr',
            'category': 'greeting'
        },
        {
            'message': 'Je veux ouvrir un compte',
            'expected_keywords': ['formulaire', 'en ligne', 'documents'],
            'language': 'fr',
            'category': 'account_opening'
        },
        {
            'message': 'Quels documents sont nécessaires?',
            'expected_keywords': ['carte', 'identité', 'domicile'],
            'language': 'fr',
            'category': 'documents'
        },
        {
            'message': 'Je suis salarié',
            'expected_keywords': ['secteur', 'activité', 'salaire'],
            'language': 'fr',
            'category': 'professional_info'
        },
        {
            'message': 'Comment fonctionnent les champs conditionnels?',
            'expected_keywords': ['masqué', 'visible', 'obligatoire'],
            'language': 'fr',
            'category': 'conditional_fields'
        },
        
        # Sentiment tests
        {
            'message': 'Je suis très satisfait du service',
            'expected_sentiment': 'positive',
            'language': 'fr'
        },
        {
            'message': 'Le service est terrible',
            'expected_sentiment': 'negative',
            'language': 'fr'
        },
        {
            'message': 'Je voudrais des informations',
            'expected_sentiment': 'neutral',
            'language': 'fr'
        },
        
        # Edge cases
        {
            'message': '',
            'expected_error': True
        },
        {
            'message': '!@#$%^&*()',
            'expected_category': 'fallback'
        },
        {
            'message': 'a' * 1000,  # Very long message
            'expected_category': 'fallback'
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nRunning test case {i}: {test_case['message']}")
        
        try:
            response = requests.post(
                f'{BASE_URL}/chatbot/chat',
                json={
                    'user_id': TEST_USER['user_id'],
                    'message': test_case['message']
                },
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Verify response
                test_result = {
                    'test_case': i,
                    'message': test_case['message'],
                    'status': 'passed',
                    'response': result
                }
                
                # Check expected keywords
                if 'expected_keywords' in test_case:
                    for keyword in test_case['expected_keywords']:
                        if keyword.lower() not in result['response'].lower():
                            test_result['status'] = 'failed'
                            test_result['error'] = f"Missing keyword: {keyword}"
                
                # Check sentiment
                if 'expected_sentiment' in test_case:
                    if result['sentiment']['mood'] != test_case['expected_sentiment']:
                        test_result['status'] = 'failed'
                        test_result['error'] = f"Expected sentiment {test_case['expected_sentiment']}, got {result['sentiment']['mood']}"
                
                # Check category
                if 'expected_category' in test_case:
                    if result['category'] != test_case['expected_category']:
                        test_result['status'] = 'failed'
                        test_result['error'] = f"Expected category {test_case['expected_category']}, got {result['category']}"
                
                # Check error
                if test_case.get('expected_error', False):
                    if response.status_code != 400:
                        test_result['status'] = 'failed'
                        test_result['error'] = "Expected error response"
                
            else:
                test_result = {
                    'test_case': i,
                    'message': test_case['message'],
                    'status': 'failed',
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
            
        except Exception as e:
            test_result = {
                'test_case': i,
                'message': test_case['message'],
                'status': 'failed',
                'error': str(e)
            }
        
        results.append(test_result)
        print(f"Test {i} {test_result['status']}")
        if test_result['status'] == 'failed':
            print(f"Error: {test_result.get('error', 'Unknown error')}")
    
    # Save test results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    with open(f'test_results_{timestamp}.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # Print summary
    total = len(results)
    passed = sum(1 for r in results if r['status'] == 'passed')
    failed = total - passed
    
    print(f"\nTest Summary:")
    print(f"Total tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Results saved to test_results_{timestamp}.json")

if __name__ == '__main__':
    test_chatbot() 