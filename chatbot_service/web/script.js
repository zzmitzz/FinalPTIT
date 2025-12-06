// Configuration
const API_URL = 'http://localhost:5000';
const SESSION_ID = 'web-session-' + Date.now();

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const statusIndicator = document.getElementById('statusIndicator');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
    checkAPIHealth();
});

// Check API health
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            updateStatus('Ready', 'success');
        } else {
            updateStatus('API Error', 'error');
        }
    } catch (error) {
        updateStatus('Disconnected', 'error');
        showError('Cannot connect to API. Make sure the server is running: python api.py');
    }
}

// Update status indicator
function updateStatus(text, type) {
    const statusText = statusIndicator.querySelector('.status-text');
    const statusDot = statusIndicator.querySelector('.status-dot');
    
    statusText.textContent = text;
    
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        processing: '#4299e1'
    };
    
    statusDot.style.background = colors[type] || colors.success;
}

// Send message
async function sendMessage(event) {
    event.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    messageInput.focus();
    
    // Remove welcome message if it exists
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Disable send button
    sendButton.disabled = true;
    updateStatus('Processing...', 'processing');
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: SESSION_ID
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response
        if (data.error) {
            addMessage(`Error: ${data.error}`, 'bot', true);
        } else {
            addMessage(data.response, 'bot');
        }
        
        updateStatus('Ready', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage(`Sorry, I encountered an error: ${error.message}`, 'bot', true);
        updateStatus('Error', 'error');
    } finally {
        sendButton.disabled = false;
    }
}

// Add message to chat
function addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const icon = sender === 'user' ? '👤' : '🤖';
    const label = sender === 'user' ? 'You' : 'Assistant';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span>${icon} ${label}</span>
            <span>${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="message-content ${isError ? 'error-message' : ''}">
            ${escapeHtml(text)}
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-header">🤖 Assistant</div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    chatContainer.appendChild(indicator);
    scrollToBottom();
    
    return indicator;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `⚠️ ${message}`;
    
    chatContainer.insertBefore(errorDiv, chatContainer.firstChild);
    
    setTimeout(() => {
        errorDiv.style.transition = 'opacity 0.3s';
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Send example query
function sendExample(query) {
    messageInput.value = query;
    chatForm.dispatchEvent(new Event('submit'));
}

// Clear chat
async function clearChat() {
    if (!confirm('Are you sure you want to clear the chat history?')) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/clear_session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: SESSION_ID
            })
        });
        
        chatContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">💡</div>
                <h2>Welcome to SQL Chatbot!</h2>
                <p>Ask me anything about the database. Try these examples:</p>
                <div class="example-queries">
                    <button class="example-query" onclick="sendExample('How many users are in the database?')">
                        📊 How many users are in the database?
                    </button>
                    <button class="example-query" onclick="sendExample('Show me all users with gmail email addresses')">
                        📧 Show me all users with gmail email addresses
                    </button>
                    <button class="example-query" onclick="sendExample('Get users between age 25 and 35')">
                        🎂 Get users between age 25 and 35
                    </button>
                    <button class="example-query" onclick="sendExample('Search for users named Alice')">
                        🔍 Search for users named Alice
                    </button>
                </div>
            </div>
        `;
        
        updateStatus('Ready', 'success');
    } catch (error) {
        showError('Failed to clear chat history');
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle Enter key (submit on Enter, new line on Shift+Enter)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});
