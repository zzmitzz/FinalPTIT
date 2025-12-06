"""
Test script for the chatbot functions.
Run this to verify all functions work correctly.
"""
from app.config import config
from app.db import init_db, seed_sample_data
from app.functions.sql_ops import (
    execute_sql_query,
    count_users,
    get_users_by_email_domain,
    get_users_by_age_range
)
from app.functions.user_ops import (
    get_user_info,
    get_all_users,
    search_users_by_name
)


def test_function(name: str, func, *args, **kwargs):
    """Test a function and print results"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    try:
        result = func(*args, **kwargs)
        print(f"✅ Success!")
        print(f"Result: {result}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def run_tests():
    """Run all function tests"""
    print("\n🧪 Starting Function Tests...")
    print("\n🔧 Setting up test database...")
    init_db()
    seed_sample_data()
    
    results = []
    
    # Test count_users
    results.append(test_function(
        "count_users()",
        count_users
    ))
    
    # Test get_all_users
    results.append(test_function(
        "get_all_users()",
        get_all_users
    ))
    
    # Test get_user_info
    results.append(test_function(
        "get_user_info(user_id=1)",
        get_user_info,
        user_id=1
    ))
    
    # Test search_users_by_name
    results.append(test_function(
        "search_users_by_name(name='Alice')",
        search_users_by_name,
        name="Alice"
    ))
    
    # Test get_users_by_email_domain
    results.append(test_function(
        "get_users_by_email_domain(domain='gmail.com')",
        get_users_by_email_domain,
        domain="gmail.com"
    ))
    
    # Test get_users_by_age_range
    results.append(test_function(
        "get_users_by_age_range(min_age=25, max_age=35)",
        get_users_by_age_range,
        min_age=25,
        max_age=35
    ))
    
    # Test execute_sql_query
    results.append(test_function(
        "execute_sql_query(query='SELECT * FROM users')",
        execute_sql_query,
        query="SELECT * FROM users"
    ))
    
    results.append(test_function(
        "execute_sql_query(query='SELECT name, email FROM users WHERE age > 30')",
        execute_sql_query,
        query="SELECT name, email FROM users WHERE age > 30"
    ))
    
    # Test SQL safety
    results.append(test_function(
        "execute_sql_query(query='DELETE FROM users') - Should fail safely",
        execute_sql_query,
        query="DELETE FROM users"
    ))
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 Test Summary")
    print(f"{'='*60}")
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print()


if __name__ == "__main__":
    try:
        config.validate()
        run_tests()
    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("\nNote: You need to set GEMINI_API_KEY in .env to run the full chatbot,")
        print("but these function tests don't require it.\n")
