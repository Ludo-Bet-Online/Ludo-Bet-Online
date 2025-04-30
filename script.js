// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');
    
    // Auth Elements
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const userProfile = document.getElementById('user-profile');
    const authButtons = document.getElementById('auth-buttons');
    const usernameDisplay = document.getElementById('username');
    const balanceDisplay = document.getElementById('balance');
    const availableBalanceDisplay = document.getElementById('available-balance');
    
    // Game Elements
    const playNowBtn = document.getElementById('play-now-btn');
    const betInput = document.getElementById('bet-input');
    const placeBetBtn = document.getElementById('place-bet-btn');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const diceValue = document.getElementById('dice-value');
    const gameMessage = document.getElementById('game-message');
    const diceFaces = document.querySelector('.dice-faces');
    const diceFaceElements = document.querySelectorAll('.dice-face');
    
    // Withdraw Elements
    const withdrawAmount = document.getElementById('withdraw-amount');
    const withdrawRequestAmount = document.getElementById('withdraw-request-amount');
    const withdrawFee = document.getElementById('withdraw-fee');
    const withdrawFinalAmount = document.getElementById('withdraw-final-amount');
    
    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const depositForm = document.getElementById('deposit-form');
    const withdrawForm = document.getElementById('withdraw-form');
    
    // History Elements
    const filterBtns = document.querySelectorAll('.filter-btn');
    const historyData = document.getElementById('history-data');
    
    // User Data (In a real app, this would come from a database)
    let currentUser = null;
    let userBalance = 0;
    let transactions = [];
    let gameInProgress = false;
    let currentBet = 0;
    
    // Local Storage Functions
    function saveUserData() {
        if (currentUser) {
            // Save current user info
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Save user-specific data
            const username = currentUser.username;
            localStorage.setItem(`balance_${username}`, userBalance);
            localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
        }
    }
    
    function loadUserData() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            const username = currentUser.username;
            
            // Load user-specific data
            userBalance = parseFloat(localStorage.getItem(`balance_${username}`) || 0);
            transactions = JSON.parse(localStorage.getItem(`transactions_${username}`) || '[]');
            updateUserInterface();
        }
    }
    
    // Initialize
    loadUserData();
    
    // Initialize navigation and balance visibility
    if (!currentUser) {
        // Hide deposit, withdraw, history options by default
        document.querySelector('nav a[data-page="deposit"]').parentElement.style.display = 'none';
        document.querySelector('nav a[data-page="withdraw"]').parentElement.style.display = 'none';
        document.querySelector('nav a[data-page="history"]').parentElement.style.display = 'none';
        
        // Hide balance display
        balanceDisplay.style.display = 'none';
    }
    
    // Navigation Functions
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                if (page.id === targetPage) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
            
            // Special case for history page
            if (targetPage === 'history') {
                renderTransactionHistory();
            }
        });
    });
    
    // Play Now button redirects to Ludo page
    if (playNowBtn) {
        playNowBtn.addEventListener('click', function() {
            // Find and click the Ludo nav link
            const ludoLink = document.querySelector('nav a[data-page="ludo"]');
            if (ludoLink) ludoLink.click();
        });
    }
    
    // Auth Functions
    function showModal(modal) {
        modal.style.display = 'block';
    }
    
    function hideModal(modal) {
        modal.style.display = 'none';
    }
    
    function updateUserInterface() {
        if (currentUser) {
            // Show user profile and hide auth buttons
            authButtons.style.display = 'none';
            userProfile.style.display = 'block';
            usernameDisplay.textContent = currentUser.username;
            
            // Show balance display
            balanceDisplay.style.display = 'block';
            balanceDisplay.textContent = `Balance: BDT ${userBalance.toFixed(2)}`;
            availableBalanceDisplay.textContent = `BDT ${userBalance.toFixed(2)}`;
            
            // Show deposit, withdraw, history options
            document.querySelector('nav a[data-page="deposit"]').parentElement.style.display = 'block';
            document.querySelector('nav a[data-page="withdraw"]').parentElement.style.display = 'block';
            document.querySelector('nav a[data-page="history"]').parentElement.style.display = 'block';
        } else {
            // Show auth buttons and hide user profile
            authButtons.style.display = 'block';
            userProfile.style.display = 'none';
            
            // Hide balance display
            balanceDisplay.style.display = 'none';
            balanceDisplay.textContent = 'Balance: BDT 0.00';
            availableBalanceDisplay.textContent = 'BDT 0.00';
            
            // Hide deposit, withdraw, history options
            document.querySelector('nav a[data-page="deposit"]').parentElement.style.display = 'none';
            document.querySelector('nav a[data-page="withdraw"]').parentElement.style.display = 'none';
            document.querySelector('nav a[data-page="history"]').parentElement.style.display = 'none';
        }
    }
    
    // Auth Event Listeners
    loginBtn.addEventListener('click', () => showModal(loginModal));
    signupBtn.addEventListener('click', () => showModal(signupModal));
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            hideModal(this.closest('.modal'));
        });
    });
    
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        hideModal(loginModal);
        showModal(signupModal);
    });
    
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        hideModal(signupModal);
        showModal(loginModal);
    });
    
    logoutBtn.addEventListener('click', function() {
        if (currentUser) {
            const username = currentUser.username;
            // We don't remove user-specific data to preserve it for next login
            // Just remove the current session data
            localStorage.removeItem('currentUser');
        }
        
        // Reset current session
        currentUser = null;
        userBalance = 0;
        transactions = [];
        updateUserInterface();
        
        // Redirect to home
        document.querySelector('nav a[data-page="home"]').click();
        alert('Logged out successfully!');
    });
    
    // Form Submissions
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // In a real app, this would validate against a database
        // For demo purposes, we'll just check local storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            // Get user-specific data or create new if not exists
            userBalance = parseFloat(localStorage.getItem(`balance_${username}`) || 0);
            transactions = JSON.parse(localStorage.getItem(`transactions_${username}`) || '[]');
            
            // Save user data to ensure it's properly stored
            localStorage.setItem(`balance_${username}`, userBalance);
            localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
            
            // Update general user data
            saveUserData();
            updateUserInterface();
            hideModal(loginModal);
            alert('Login successful!');
        } else {
            alert('Invalid username or password');
        }
    });
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // In a real app, this would save to a database
        // For demo purposes, we'll use local storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        
        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        currentUser = newUser;
        userBalance = 0;
        transactions = [];
        
        // Initialize user-specific data
        localStorage.setItem(`balance_${username}`, userBalance);
        localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
        
        // Save general user data
        saveUserData();
        updateUserInterface();
        
        hideModal(signupModal);
        alert('Account created successfully!');
    });
    
    depositForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login to make a deposit');
            return;
        }
        
        const amount = parseFloat(document.getElementById('deposit-amount').value);
        const transactionId = document.getElementById('transaction-id').value;
        const senderNumber = document.getElementById('sender-number').value;
        
        if (isNaN(amount) || amount < 500) {
            alert('Please enter a valid amount. Minimum deposit is 500 Taka.');
            return;
        }
        
        // In a real app, this would verify the transaction with the payment provider
        // For demo purposes, we'll just add it
        userBalance += amount;
        
        const transaction = {
            date: new Date().toISOString(),
            type: 'deposit',
            amount: amount,
            status: 'pending', // In a real app, this would start as pending
            details: `Transaction ID: ${transactionId}, Sender: ${senderNumber}`
        };
        
        transactions.push(transaction);
        saveUserData();
        updateUserInterface();
        
        // Clear form
        depositForm.reset();
        
        alert(`Deposit of BDT ${amount.toFixed(2)} has been submitted and is pending approval.`);
        
        // For demo purposes, let's approve it automatically after 3 seconds
        setTimeout(() => {
            transaction.status = 'completed';
            saveUserData();
            if (document.querySelector('.page.active').id === 'history') {
                renderTransactionHistory();
            }
        }, 3000);
    });
    
    withdrawForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login to make a withdrawal');
            return;
        }
        
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const bkashNumber = document.getElementById('bkash-number').value;
        
        if (isNaN(amount) || amount < 500) {
            alert('Please enter a valid amount. Minimum deposit is 500 Taka.');
            return;
        }
        
        if (amount > userBalance) {
            alert('Insufficient balance');
            return;
        }
        
        const fee = amount * 0.05; // 5% fee
        const finalAmount = amount - fee;
        
        // In a real app, this would initiate a withdrawal process
        // For demo purposes, we'll just deduct it
        userBalance -= amount;
        
        const transaction = {
            date: new Date().toISOString(),
            type: 'withdraw',
            amount: amount,
            status: 'pending',
            details: `Bkash: ${bkashNumber}, Fee: BDT ${fee.toFixed(2)}, Final: BDT ${finalAmount.toFixed(2)}`
        };
        
        transactions.push(transaction);
        saveUserData();
        updateUserInterface();
        
        // Clear form
        withdrawForm.reset();
        withdrawRequestAmount.textContent = 'BDT 0.00';
        withdrawFee.textContent = 'BDT 0.00';
        withdrawFinalAmount.textContent = 'BDT 0.00';
        
        alert(`Withdrawal of BDT ${amount.toFixed(2)} has been submitted and is pending approval.`);
        
        // For demo purposes, let's approve it automatically after 3 seconds
        setTimeout(() => {
            transaction.status = 'completed';
            saveUserData();
            if (document.querySelector('.page.active').id === 'history') {
                renderTransactionHistory();
            }
        }, 3000);
    });
    
    // Withdraw calculation
    if (withdrawAmount) {
        withdrawAmount.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            const fee = amount * 0.05; // 5% fee
            const finalAmount = amount - fee;
            
            withdrawRequestAmount.textContent = `BDT ${amount.toFixed(2)}`;
            withdrawFee.textContent = `BDT ${fee.toFixed(2)}`;
            withdrawFinalAmount.textContent = `BDT ${finalAmount.toFixed(2)}`;
        });
    }
    
    // Game Functions
    placeBetBtn.addEventListener('click', function() {
        if (!currentUser) {
            alert('Please login to play');
            return;
        }
        
        if (gameInProgress) {
            alert('Game already in progress');
            return;
        }
        
        const betAmount = parseFloat(betInput.value);
        
        if (isNaN(betAmount) || betAmount <= 0) {
            alert('Please enter a valid bet amount');
            return;
        }
        
        if (betAmount > userBalance) {
            alert('Insufficient balance');
            return;
        }
        
        // Start the game
        gameInProgress = true;
        currentBet = betAmount;
        rollDiceBtn.disabled = false;
        placeBetBtn.disabled = true;
        betInput.disabled = true;
        gameMessage.textContent = `Bet placed: BDT ${betAmount.toFixed(2)}. Roll the dice!`;
    });
    
    rollDiceBtn.addEventListener('click', function() {
        if (!gameInProgress) return;
        
        // Disable roll button during animation
        rollDiceBtn.disabled = true;
        
        // Hide numeric dice, show dice faces
        diceValue.parentElement.style.display = 'none';
        diceFaces.style.display = 'flex';
        
        // Show rolling animation
        let rollCount = 0;
        const maxRolls = 10; // Number of rolls in animation
        const rollInterval = setInterval(function() {
            // Generate random number for animation
            const animationRoll = Math.floor(Math.random() * 6) + 1;
            
            // Update dice face for animation
            updateDiceFace(animationRoll);
            
            rollCount++;
            
            if (rollCount >= maxRolls) {
                clearInterval(rollInterval);
                
                // Final roll result
                const roll = Math.floor(Math.random() * 6) + 1;
                
                // Update dice face for final result
                updateDiceFace(roll);
                
                // Highlight dice face
                const activeDiceFace = document.querySelector('.dice-face.active');
                activeDiceFace.classList.add('highlight');
                setTimeout(() => {
                    activeDiceFace.classList.remove('highlight');
                }, 1000);
                
                // Determine win/loss (4, 5, 6 win; 1, 2, 3 lose)
                const win = roll >= 4;
                
                if (win) {
                    // Win - double the bet
                    const winAmount = currentBet * 2;
                    userBalance += currentBet; // Add the winnings (already bet the original amount)
                    gameMessage.textContent = `You rolled ${roll}. You win BDT ${winAmount.toFixed(2)}!`;
                    gameMessage.style.color = '#2ecc71'; // Green color for win
                    
                    // Record transaction
                    transactions.push({
                        date: new Date().toISOString(),
                        type: 'bet',
                        amount: winAmount,
                        status: 'completed',
                        details: `Ludo game win. Rolled: ${roll}`
                    });
                } else {
                    // Lose - deduct the bet
                    userBalance -= currentBet;
                    gameMessage.textContent = `You rolled ${roll}. You lose BDT ${currentBet.toFixed(2)}.`;
                    gameMessage.style.color = '#e74c3c'; // Red color for loss
                    
                    // Record transaction
                    transactions.push({
                        date: new Date().toISOString(),
                        type: 'bet',
                        amount: -currentBet,
                        status: 'completed',
                        details: `Ludo game loss. Rolled: ${roll}`
                    });
                }
                
                // Update UI and save data
                saveUserData();
                updateUserInterface();
                
                // Reset game state after a short delay
                setTimeout(() => {
                    gameInProgress = false;
                    currentBet = 0;
                    placeBetBtn.disabled = false;
                    betInput.disabled = false;
                    rollDiceBtn.disabled = true;
                    gameMessage.style.color = '#555'; // Reset message color
                    
                    // Reset dice display after delay
                    setTimeout(() => {
                        diceFaces.style.display = 'none';
                        diceValue.parentElement.style.display = 'flex';
                        diceValue.textContent = '0';
                    }, 1000);
                }, 1500);
            }
        }, 100); // Speed of animation
        
        // Function to update the dice face display
        function updateDiceFace(value) {
            // Hide all dice faces
            diceFaceElements.forEach(face => {
                face.classList.remove('active');
            });
            
            // Show the correct dice face
            const activeFace = document.querySelector(`.dice-face[data-value="${value}"]`);
            if (activeFace) {
                activeFace.classList.add('active');
            }
        }
    });
    
    // History Functions
    function renderTransactionHistory(filter = 'all') {
        if (!historyData) return;
        
        // Clear existing data
        historyData.innerHTML = '';
        
        if (!currentUser || transactions.length === 0) {
            historyData.innerHTML = '<tr class="no-records"><td colspan="5">No transaction records found</td></tr>';
            return;
        }
        
        // Filter transactions
        let filteredTransactions = transactions;
        if (filter !== 'all') {
            filteredTransactions = transactions.filter(t => t.type === filter);
        }
        
        if (filteredTransactions.length === 0) {
            historyData.innerHTML = '<tr class="no-records"><td colspan="5">No matching records found</td></tr>';
            return;
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render transactions
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(transaction.date);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            // Format amount with color
            let amountClass = '';
            let amountPrefix = '';
            if (transaction.type === 'deposit' || (transaction.type === 'bet' && transaction.amount > 0)) {
                amountClass = 'text-success';
                amountPrefix = '+';
            } else if (transaction.type === 'withdraw' || (transaction.type === 'bet' && transaction.amount < 0)) {
                amountClass = 'text-danger';
            }
            
            // Format type
            let typeText = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
            
            // Format status
            let statusClass = '';
            if (transaction.status === 'completed') {
                statusClass = 'text-success';
            } else if (transaction.status === 'pending') {
                statusClass = 'text-warning';
            } else if (transaction.status === 'failed') {
                statusClass = 'text-danger';
            }
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${typeText}</td>
                <td class="${amountClass}">${amountPrefix}BDT ${Math.abs(transaction.amount).toFixed(2)}</td>
                <td class="${statusClass}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</td>
                <td>${transaction.details}</td>
            `;
            
            historyData.appendChild(row);
        });
    }
    
    // History filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Render filtered history
            renderTransactionHistory(filter);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });
});