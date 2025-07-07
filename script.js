// DOM Elements
const numberInput = document.getElementById('numberInput');
const descriptionInput = document.getElementById('descriptionInput');
const categoryInput = document.getElementById('categoryInput');
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const sortSelect = document.getElementById('sortSelect');
const numbersList = document.getElementById('numbersList');
const totalCount = document.getElementById('totalCount');
const highestValue = document.getElementById('highestValue');
const lowestValue = document.getElementById('lowestValue');
const averageValue = document.getElementById('averageValue');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const editModal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close-btn');
const editNumberInput = document.getElementById('editNumberInput');
const editDescriptionInput = document.getElementById('editDescriptionInput');
const editCategoryInput = document.getElementById('editCategoryInput');
const saveEditBtn = document.getElementById('saveEditBtn');

// State
let numbers = JSON.parse(localStorage.getItem('trackedNumbers')) || [];
let currentEditIndex = null;

// Initialize
updateStats();
renderNumbers();

// Event Listeners
addBtn.addEventListener('click', addNumber);
clearSearchBtn.addEventListener('click', clearSearch);
searchInput.addEventListener('input', filterNumbers);
sortSelect.addEventListener('change', sortNumbers);
exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', importData);
clearAllBtn.addEventListener('click', clearAll);
closeBtn.addEventListener('click', closeModal);
saveEditBtn.addEventListener('click', saveEdit);

// Functions
function addNumber() {
    const number = numberInput.value.trim();
    const description = descriptionInput.value.trim();
    const category = categoryInput.value;

    if (!number) {
        alert('Please enter a number');
        return;
    }

    const newNumber = {
        value: parseFloat(number),
        description: description || null,
        category: category,
        date: new Date().toISOString()
    };

    numbers.push(newNumber);
    saveNumbers();
    renderNumbers();
    updateStats();

    // Clear inputs
    numberInput.value = '';
    descriptionInput.value = '';
    numberInput.focus();
}

function renderNumbers(numbersToRender = numbers) {
    numbersList.innerHTML = '';

    if (numbersToRender.length === 0) {
        numbersList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No numbers found</td>
            </tr>
        `;
        return;
    }

    numbersToRender.forEach((number, index) => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(number.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Determine category class
        let categoryClass = '';
        switch(number.category) {
            case 'financial':
                categoryClass = 'category-financial';
                break;
            case 'measurement':
                categoryClass = 'category-measurement';
                break;
            case 'personal':
                categoryClass = 'category-personal';
                break;
            default:
                categoryClass = 'category-general';
        }

        row.innerHTML = `
            <td>${number.value}</td>
            <td>${number.description || '-'}</td>
            <td><span class="category-badge ${categoryClass}">${number.category}</span></td>
            <td>${formattedDate}</td>
            <td class="action-btns">
                <button class="btn btn-edit" onclick="openEditModal(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-delete" onclick="deleteNumber(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        numbersList.appendChild(row);
    });
}

function deleteNumber(index) {
    if (confirm('Are you sure you want to delete this number?')) {
        numbers.splice(index, 1);
        saveNumbers();
        renderNumbers();
        updateStats();
    }
}

function filterNumbers() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        renderNumbers();
        return;
    }
    
    const filtered = numbers.filter(number => 
        number.value.toString().includes(searchTerm) || 
        (number.description && number.description.toLowerCase().includes(searchTerm)) ||
        number.category.toLowerCase().includes(searchTerm)
    );
    
    renderNumbers(filtered);
}

function clearSearch() {
    searchInput.value = '';
    renderNumbers();
}

function sortNumbers() {
    const sortBy = sortSelect.value;
    
    let sortedNumbers = [...numbers];
    
    switch(sortBy) {
        case 'newest':
            sortedNumbers.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            sortedNumbers.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'highest':
            sortedNumbers.sort((a, b) => b.value - a.value);
            break;
        case 'lowest':
            sortedNumbers.sort((a, b) => a.value - b.value);
            break;
    }
    
    renderNumbers(sortedNumbers);
}

function updateStats() {
    totalCount.textContent = numbers.length;
    
    if (numbers.length > 0) {
        const values = numbers.map(num => num.value);
        highestValue.textContent = Math.max(...values);
        lowestValue.textContent = Math.min(...values);
        averageValue.textContent = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    } else {
        highestValue.textContent = '-';
        lowestValue.textContent = '-';
        averageValue.textContent = '-';
    }
}

function saveNumbers() {
    localStorage.setItem('trackedNumbers', JSON.stringify(numbers));
}

function exportData() {
    const dataStr = JSON.stringify(numbers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'number-tracker-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (confirm('Importing data will replace your current numbers. Continue?')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (Array.isArray(importedData)) {
                    numbers = importedData;
                    saveNumbers();
                    renderNumbers();
                    updateStats();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid data format');
                }
            } catch (error) {
                alert('Error parsing the file');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    }
    
    // Reset file input
    event.target.value = '';
}

function clearAll() {
    if (confirm('Are you sure you want to delete ALL numbers? This cannot be undone.')) {
        numbers = [];
        saveNumbers();
        renderNumbers();
        updateStats();
    }
}

function openEditModal(index) {
    currentEditIndex = index;
    const number = numbers[index];
    
    editNumberInput.value = number.value;
    editDescriptionInput.value = number.description || '';
    editCategoryInput.value = number.category;
    
    editModal.style.display = 'block';
}

function closeModal() {
    editModal.style.display = 'none';
    currentEditIndex = null;
}

function saveEdit() {
    if (currentEditIndex === null) return;
    
    const number = editNumberInput.value.trim();
    const description = editDescriptionInput.value.trim();
    const category = editCategoryInput.value;
    
    if (!number) {
        alert('Please enter a number');
        return;
    }
    
    numbers[currentEditIndex] = {
        value: parseFloat(number),
        description: description || null,
        category: category,
        date: numbers[currentEditIndex].date // Keep original date
    };
    
    saveNumbers();
    renderNumbers();
    updateStats();
    closeModal();
}

// Close modal when clicking outsid
