// Firebase config & init
const firebaseConfig = {
  apiKey: "AIzaSyDy7t8a3LeE9DcQSr7Hl5asGXHla5a5f7k",
  authDomain: "kithab-ff1ad.firebaseapp.com",
  projectId: "kithab-ff1ad",
  storageBucket: "kithab-ff1ad.appspot.com",
  messagingSenderId: "956193450282",
  appId: "1:956193450282:web:0b6c5b9b279f7640801653",
  measurementId: "G-JBDJJV7YYG",
  databaseURL: "https://kithab-ff1ad-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("lifeRecords");

// DOM elements
const sectionAdd = document.getElementById('section-add');
const sectionView = document.getElementById('section-view');
const recordForm = document.getElementById('recordForm');
const recordsList = document.getElementById('recordsList');
const toast = document.getElementById('toast');
const popup = document.getElementById('popup');
const popupText = document.getElementById('popupText');
const bottomSheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('overlay');
const addBookBtn = document.getElementById('addBookBtn');
const addBookForm = document.getElementById('addBookForm');
const bookNameInput = document.getElementById('bookNameInput');
const submitBookBtn = document.getElementById('submitBookBtn');
const bookList = document.getElementById('bookList');
const bottomSheetTitle = document.getElementById('bottomSheetTitle');

let currentId = '';
let currentRecordId = '';
let currentBooks = [];

// Switch between Add and View
function showSection(section) {
  if (section === 'add') {
    sectionAdd.classList.remove('hidden');
    sectionView.classList.add('hidden');
  } else {
    sectionView.classList.remove('hidden');
    sectionAdd.classList.add('hidden');
    loadRecords();
  }
  lucide.createIcons();
}

// Toast message
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('fade');
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('fade');
  }, 3000);
}

// Add/Edit record submit
recordForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const birthYear = +document.getElementById('birthYear').value.trim();
  const endYear = +document.getElementById('endYear').value.trim();
  const recordId = document.getElementById('recordId').value;
  
  const data = { name, birthYear, endYear, books: currentBooks };
  if (recordId) {
    db.child(recordId).update(data);
    showToast('Record Updated Successfully!');
  } else {
    db.push(data);
    showToast('Record Added Successfully!');
  }
  
  recordForm.reset();
  document.getElementById('recordId').value = '';
  currentBooks = [];
  showSection('view');
});

// Load & render records with search/filter
function loadRecords() {
  const search = document.getElementById('searchName').value.trim().toLowerCase();
  const startYear = +document.getElementById('filterStartYear').value.trim() || null;
  const endYear = +document.getElementById('filterEndYear').value.trim() || null;
  
  db.orderByChild('birthYear').once('value', snap => {
    recordsList.innerHTML = '';
    snap.forEach(child => {
      const rec = child.val();
      const id = child.key;
      const age = rec.endYear - rec.birthYear;
      const okName = rec.name.toLowerCase().includes(search);
      const okYear = (!startYear || rec.birthYear >= startYear) &&
        (!endYear || rec.endYear <= endYear);
      if (okName && okYear) {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-700 transition cursor-pointer";
        tr.innerHTML = `
          <td class="p-3">${rec.name}</td>
          <td class="p-3">${rec.birthYear} - ${rec.endYear}</td>
          <td class="p-3 font-bold">${age}</td>
        `;
        tr.addEventListener('click', () =>
          openBottomSheet(rec.name, rec.books, id)
        );
        tr.addEventListener('contextmenu', e => {
          e.preventDefault();
          currentId = id;
          popupText.innerText = `Edit or Delete ${rec.name}?`;
          popup.classList.remove('hidden');
        });
        recordsList.appendChild(tr);
      }
    });
    lucide.createIcons();
  });
}

// Context-menu actions
document.getElementById('editBtn').addEventListener('click', () => {
  db.child(currentId).once('value', snap => {
    const d = snap.val();
    document.getElementById('name').value = d.name;
    document.getElementById('birthYear').value = d.birthYear;
    document.getElementById('endYear').value = d.endYear;
    document.getElementById('recordId').value = currentId;
    currentBooks = d.books || [];
    showSection('add');
    closePopup();
  });
});
document.getElementById('deleteBtn').addEventListener('click', () => {
  db.child(currentId).remove();
  showToast('Record Deleted!');
  loadRecords();
  closePopup();
});

function closePopup() {
  popup.classList.add('hidden');
}

// Search & filter triggers
document.getElementById('searchName')
  .addEventListener('input', loadRecords);
document.getElementById('filterButton')
  .addEventListener('click', loadRecords);

// Open bottom sheet
function openBottomSheet(name, books, id) {
  currentRecordId = id;
  currentBooks = books || [];
  bottomSheetTitle.textContent = name;
  bookList.innerHTML = '';
  currentBooks.forEach((b, i) => {
    const item = document.createElement('div');
    item.className = 'flex justify-between items-center bg-gray-800 p-2 rounded-lg mb-2';
    item.innerHTML = `<span>${b}</span>
                      <button class="text-red-500" onclick="deleteBook(${i})">
                        Delete
                      </button>`;
    bookList.appendChild(item);
  });
  
  showAddBookForm(false);
  bottomSheet.classList.replace('translate-y-full', 'translate-y-0');
  overlay.classList.remove('hidden');
  lucide.createIcons();
}

// Close bottom sheet
function closeBottomSheet() {
  bottomSheet.classList.replace('translate-y-0', 'translate-y-full');
  overlay.classList.add('hidden');
  showAddBookForm(false);
}

// Show/hide the inline book-input form
function showAddBookForm(show = true) {
  if (show) {
    addBookForm.classList.remove('hidden');
    addBookBtn.classList.add('hidden');
  } else {
    addBookForm.classList.add('hidden');
    addBookBtn.classList.remove('hidden');
  }
}

// Plus button → show form
addBookBtn.addEventListener('click', () => showAddBookForm(true));

// Submit book from form:
submitBookBtn.addEventListener('click', () => {
  const name = bookNameInput.value.trim();
  if (!name) return;
  currentBooks.push(name);
  bookNameInput.value = '';
  // update in Firebase, then re-open sheet & auto-close form
  db.child(currentRecordId).update({ books: currentBooks })
    .then(() => {
      openBottomSheet(bottomSheetTitle.textContent, currentBooks, currentRecordId);
      showAddBookForm(false);
      showToast('Book Added!');
    });
});

// Delete a book
function deleteBook(idx) {
  currentBooks.splice(idx, 1);
  db.child(currentRecordId).update({ books: currentBooks })
    .then(() => {
      openBottomSheet(bottomSheetTitle.textContent, currentBooks, currentRecordId);
      showToast('Book Deleted!');
    });
}

// Initialize to View
showSection('view');
