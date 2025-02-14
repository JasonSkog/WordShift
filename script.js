const grid = document.getElementById('grid');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const lockInButton = document.getElementById('lock-in');
let timeLeft = 180; // 3 minutes in seconds
let score = 0;
let isDragging = false;
let dragRowIndex = null;
let dragStartX = null;

// Generate random letters for the grid
function generateRandomLetters() {
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
  const letters = [];
  for (let i = 0; i < 7; i++) {
    const row = [];
    for (let j = 0; j < 7; j++) {
      const pool = Math.random() < 0.3 ? vowels : consonants;
      row.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    letters.push(row);
  }
  return letters;
}

// Render the grid
function renderGrid(letters) {
  grid.innerHTML = '';
  letters.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    row.forEach((letter, colIndex) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.textContent = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      rowDiv.appendChild(cell);
    });
    grid.appendChild(rowDiv);
  });
}

// Handle row dragging
grid.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('cell')) {
    isDragging = true;
    dragRowIndex = e.target.dataset.row;
    dragStartX = e.clientX;
    e.target.classList.add('dragging');
  }
});

grid.addEventListener('mousemove', (e) => {
  if (isDragging && dragRowIndex !== null) {
    const row = grid.children[dragRowIndex];
    const deltaX = e.clientX - dragStartX;
    row.style.transform = `translateX(${deltaX}px)`;
  }
});

grid.addEventListener('mouseup', () => {
  if (isDragging && dragRowIndex !== null) {
    isDragging = false;
    const row = grid.children[dragRowIndex];
    row.style.transform = 'translateX(0)';
    const cells = row.querySelectorAll('.cell');
    const firstLetter = cells[0].textContent;
    cells.forEach((cell, index) => {
      if (index < cells.length - 1) {
        cell.textContent = cells[index + 1].textContent;
      } else {
        cell.textContent = firstLetter;
      }
    });
    dragRowIndex = null;
    dragStartX = null;
  }
});

// Validate words using Datamuse API
async function validateWord(word) {
  const response = await fetch(`https://api.datamuse.com/words?sp=${word}&max=1`);
  const data = await response.json();
  return data.length > 0 && data[0].word === word.toLowerCase();
}

// Check all vertical words
async function checkWords(letters) {
  let totalScore = 0;
  for (let col = 0; col < 7; col++) {
    let word = '';
    for (let row = 0; row < 7; row++) {
      word += letters[row][col];
    }
    if (word.length >= 3 && await validateWord(word)) {
      totalScore += word.length;
      highlightWord(col, true);
    } else {
      highlightWord(col, false);
    }
  }
  return totalScore;
}

// Highlight valid/invalid words
function highlightWord(col, isValid) {
  const cells = document.querySelectorAll(`.cell[data-col="${col}"]`);
  cells.forEach(cell => {
    cell.style.backgroundColor = isValid ? '#a5d6a7' : '#ef9a9a';
  });
}

// Timer
function startTimer() {
  const interval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(interval);
      lockInButton.disabled = true;
      alert('Time’s up!');
    }
  }, 1000);
}

// Lock in answers
lockInButton.addEventListener('click', async () => {
  const letters = Array.from(grid.querySelectorAll('.row')).map(row =>
    Array.from(row.querySelectorAll('.cell')).map(cell => cell.textContent)
  );
  const newScore = await checkWords(letters);
  score += newScore;
  scoreDisplay.textContent = score;
});

// Initialize game
const letters = generateRandomLetters();
renderGrid(letters);
startTimer();
