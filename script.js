const input = document.getElementById('input');
const result = document.getElementById('result');
const numbers = document.getElementById('numbers');
const operation = document.getElementById('operation');
const clearBtn = document.getElementById('clear');
const deleteBtn = document.getElementById('Delete');
const equalsBtn = document.getElementById('equals');
const percentBtn = document.getElementById('percent');
const sqrtBtn = document.getElementById('sqrt');
const decimalBtn = document.getElementById('decimal');
const historyBtn = document.getElementById('history-btn');
const historyContainer = document.getElementById('history');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

// State
let currentInput = '';
let lastResult = '';
let lastOperator = '';
let justEvaluated = false;

// Helper functions
function updateInputDisplay() {
    input.value = currentInput || '0';
}

function updateResultDisplay(val) {
    result.textContent = val !== undefined ? val : '';
}

function appendToInput(val) {
    if (justEvaluated) {
        currentInput = '';
        justEvaluated = false;
    }
    // Prevent multiple decimals in a number
    if (val === '.' && /\.\d*$/.test(currentInput.split(/[\+\-\*\/]/).pop())) return;
    currentInput += val;
    updateInputDisplay();
}

function handleOperator(op) {
    if (currentInput === '' && lastResult !== '') {
        currentInput = lastResult;
    }
    if (/[+\-*/]$/.test(currentInput)) {
        currentInput = currentInput.slice(0, -1) + op;
    } else if (currentInput !== '') {
        currentInput += op;
    }
    justEvaluated = false;
    updateInputDisplay();
}

function calculate() {
    try {
        // Replace unicode division/multiplication if present
        let expression = currentInput.replace(/÷/g, '/').replace(/×/g, '*');
        // Evaluate safely
        let evalResult = Function('"use strict";return (' + expression + ')')();
        if (evalResult === undefined || isNaN(evalResult)) throw new Error();
        lastResult = evalResult.toString();
        updateResultDisplay(lastResult);
        justEvaluated = true;
    } catch {
        updateResultDisplay('0');
        justEvaluated = true;
    }
}

function clearAll() {
    currentInput = '';
    lastResult = '';
    updateInputDisplay();
    updateResultDisplay('');
    justEvaluated = false;
}

function deleteLast() {
    if (justEvaluated) {
        clearAll();
        return;
    }
    currentInput = currentInput.slice(0, -1);
    updateInputDisplay();
}

function handlePercent() {
    if (currentInput !== '') {
        try {
            let value = Function('"use strict";return (' + currentInput + ')')();
            value = value / 100;
            currentInput = value.toString();
            updateInputDisplay();
        } catch {
            updateResultDisplay('Error');
        }
    }
}

function handleSqrt() {
    if (currentInput !== '') {
        try {
            let value = Function('"use strict";return (' + currentInput + ')')();
            if (value < 0) throw new Error();
            value = Math.sqrt(value);
            currentInput = value.toString();
            updateInputDisplay();
        } catch {
            updateResultDisplay('Error');
        }
    }
}

// Event Listeners
numbers.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const val = e.target.textContent.trim();
        if (!isNaN(val)) {
            appendToInput(val);
        } else if (val === '.') {
            appendToInput(val);
        }
    }
});

operation.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'I') {
        let btn = e.target.tagName === 'BUTTON' ? e.target : e.target.parentElement;
        switch (btn.id) {
            case 'add':
                handleOperator('+');
                break;
            case 'subtract':
                handleOperator('-');
                break;
            case 'multiply':
                handleOperator('*');
                break;
            case 'divide':
                handleOperator('/');
                break;
            case 'Delete':
                deleteLast();
                break;
        }
    }
});

clearBtn.addEventListener('click', clearAll);
percentBtn.addEventListener('click', handlePercent);
sqrtBtn.addEventListener('click', handleSqrt);
decimalBtn.addEventListener('click', () => appendToInput('.'));

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendToInput(e.key);
    if (['+', '-', '*', '/'].includes(e.key)) handleOperator(e.key);
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearAll();
    if (e.key === '.') appendToInput('.');
    if (e.key === '%') handlePercent();
    if (e.key === 'r' || e.key === 'R') handleSqrt();
});

// History functionality
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('calc-history') || '[]');
    console.log('Loaded history:', history); // Debug line
    historyList.innerHTML = '';
    history.slice(-20).reverse().forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="hist-exp">${item.expression}</span> = <span class="hist-res">${item.result}</span>`;
        li.title = item.expression + ' = ' + item.result;
        li.tabIndex = 0;
        li.addEventListener('click', () => {
            currentInput = item.expression;
            updateInputDisplay();
            updateResultDisplay(item.result);
        });
        historyList.appendChild(li);
    });
}

function saveToHistory(expression, result) {
     console.log('Saving to history:', expression, result);
    if (!expression || result === undefined || result === 'Error') return;
    let history = JSON.parse(localStorage.getItem('calc-history') || '[]');
    history.push({ expression, result });
    if (history.length > 50) history = history.slice(-50);
    localStorage.setItem('calc-history', JSON.stringify(history));
    loadHistory();
}

// Show/hide history panel
historyBtn.addEventListener('click', () => {
    if (historyContainer.style.display === 'none' || historyContainer.style.display === '') {
        historyContainer.style.display = 'block';
        loadHistory();
    } else {
        historyContainer.style.display = 'none';
    }
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('calc-history');
    loadHistory();
});

// Save to history after calculation
const originalCalculate = calculate;
calculate = function() {
    try {
        let expression = currentInput.replace(/÷/g, '/').replace(/×/g, '*');
        let evalResult = Function('"use strict";return (' + expression + ')')();
        if (evalResult === undefined || isNaN(evalResult)) throw new Error();
        lastResult = evalResult.toString();
        updateResultDisplay(lastResult);
        saveToHistory(currentInput, lastResult);
        justEvaluated = true;
    } catch {
        updateResultDisplay('0');
        justEvaluated = true;
    }
};

equalsBtn.addEventListener('click', calculate);

// Load history on page load
window.addEventListener('DOMContentLoaded', loadHistory);


// Initialize
updateInputDisplay();
updateResultDisplay('');