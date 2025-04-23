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

const sectionAdd = document.getElementById('section-add');
const sectionView = document.getElementById('section-view');
const recordForm = document.getElementById('recordForm');
const recordsList = document.getElementById('recordsList');
const toast = document.getElementById('toast');
const popup = document.getElementById('popup');
const popupText = document.getElementById('popupText');
let currentId = '';

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

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('fade');
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('fade');
  }, 3000);
}

recordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const birthYear = parseInt(document.getElementById('birthYear').value.trim());
  const endYear = parseInt(document.getElementById('endYear').value.trim());
  const recordId = document.getElementById('recordId').value;

  const data = { name, birthYear, endYear };

  if (recordId) {
    db.child(recordId).update(data);
    showToast('Record Updated Successfully!');
  } else {
    db.push(data);
    showToast('Record Added Successfully!');
  }
  
  recordForm.reset();
  document.getElementById('recordId').value = '';
  showSection('view');
});

function loadRecords() {
  db.orderByChild('birthYear').once('value', (snapshot) => {
    recordsList.innerHTML = '';
    snapshot.forEach((child) => {
      const record = child.val();
      const id = child.key;
      const age = record.endYear - record.birthYear;

      const tr = document.createElement('tr');
      tr.className = "hover:bg-gray-700 transition cursor-pointer";
      tr.innerHTML = `
        <td class="p-3">${record.name}</td>
        <td class="p-3">${record.birthYear} - ${record.endYear}</td>
        <td class="p-3 font-bold">${age}</td>
      `;

      tr.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        currentId = id;
        popupText.innerText = `Edit or Delete ${record.name}?`;
        popup.classList.remove('hidden');
      });

      recordsList.appendChild(tr);
    });
    lucide.createIcons();
  });
}

document.getElementById('editBtn').addEventListener('click', () => {
  db.child(currentId).once('value', (snapshot) => {
    const data = snapshot.val();
    document.getElementById('name').value = data.name;
    document.getElementById('birthYear').value = data.birthYear;
    document.getElementById('endYear').value = data.endYear;
    document.getElementById('recordId').value = currentId;
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

// Filter and search
document.getElementById('filterButton').addEventListener('click', loadRecords);
document.getElementById('searchName').addEventListener('input', loadRecords);
