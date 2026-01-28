// Admin panel for managing dynamic content

// Storage keys
const STORAGE_KEYS = {
  labs: 'portfolio_labs',
  scripts: 'portfolio_scripts',
  incidents: 'portfolio_incidents'
};

// Initialize data from localStorage or defaults
let contentData = {
  labs: [],
  scripts: [],
  incidents: []
};

// Load existing data from data files
async function loadExistingData() {
  try {
    const [labsRes, scriptsRes, incidentsRes] = await Promise.all([
      fetch('data/labs.json'),
      fetch('data/scripts.json'),
      fetch('data/incidents.json')
    ]);
    
    if (labsRes.ok) {
      const labs = await labsRes.json();
      contentData.labs = labs;
      localStorage.setItem(STORAGE_KEYS.labs, JSON.stringify(labs));
    }
    
    if (scriptsRes.ok) {
      const scripts = await scriptsRes.json();
      contentData.scripts = scripts;
      localStorage.setItem(STORAGE_KEYS.scripts, JSON.stringify(scripts));
    }
    
    if (incidentsRes.ok) {
      const incidents = await incidentsRes.json();
      contentData.incidents = incidents;
      localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(incidents));
    }
  } catch (err) {
    console.warn('Could not load existing data files:', err);
  }
  
  // Load from localStorage if available
  Object.keys(STORAGE_KEYS).forEach(type => {
    const stored = localStorage.getItem(STORAGE_KEYS[type]);
    if (stored) {
      try {
        contentData[type] = JSON.parse(stored);
      } catch (e) {
        console.error(`Error parsing ${type} from localStorage:`, e);
      }
    }
  });
  
  renderLists();
}

// Save data to localStorage
function saveData(type) {
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(contentData[type]));
}

// Tab switching
function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Form handlers
function initForms() {
  // Labs form
  document.getElementById('lab-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      id: document.getElementById('lab-id').value,
      tag: document.getElementById('lab-tag').value,
      title: document.getElementById('lab-title').value,
      description: document.getElementById('lab-description').value,
      docFile: document.getElementById('lab-doc').value
    };
    addItem('labs', item);
    e.target.reset();
  });
  
  // Scripts form
  document.getElementById('script-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      id: document.getElementById('script-id').value,
      tag: document.getElementById('script-tag').value,
      title: document.getElementById('script-title').value,
      description: document.getElementById('script-description').value
    };
    const docFile = document.getElementById('script-doc').value;
    if (docFile) item.docFile = docFile;
    addItem('scripts', item);
    e.target.reset();
  });
  
  // Incidents form
  document.getElementById('incident-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      id: document.getElementById('incident-id').value,
      tag: document.getElementById('incident-tag').value,
      title: document.getElementById('incident-title').value,
      description: document.getElementById('incident-description').value,
      docFile: document.getElementById('incident-doc').value
    };
    const meta = document.getElementById('incident-meta').value;
    if (meta) item.meta = meta;
    addItem('incidents', item);
    e.target.reset();
  });
}

// Add item to list
function addItem(type, item) {
  // Check for duplicate ID
  if (contentData[type].some(i => i.id === item.id)) {
    alert('An item with this ID already exists. Please use a unique ID.');
    return;
  }
  
  contentData[type].push(item);
  saveData(type);
  renderList(type);
}

// Remove item from list
function removeItem(type, id) {
  if (!confirm('Are you sure you want to remove this item?')) return;
  
  contentData[type] = contentData[type].filter(item => item.id !== id);
  saveData(type);
  renderList(type);
}

// Render all lists
function renderLists() {
  renderList('labs');
  renderList('scripts');
  renderList('incidents');
}

// Render a specific list
function renderList(type) {
  const container = document.getElementById(`${type}-list`);
  if (!container) return;
  
  if (contentData[type].length === 0) {
    container.innerHTML = '<p class="muted">No items yet. Add one using the form above.</p>';
    return;
  }
  
  container.innerHTML = '';
  contentData[type].forEach(item => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    
    const header = document.createElement('div');
    header.className = 'admin-item-header';
    
    const title = document.createElement('strong');
    title.textContent = item.title;
    
    const actions = document.createElement('div');
    actions.className = 'admin-item-actions';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn ghost';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeItem(type, item.id);
    
    actions.appendChild(removeBtn);
    header.appendChild(title);
    header.appendChild(actions);
    
    const details = document.createElement('div');
    details.innerHTML = `
      <p class="muted"><strong>ID:</strong> ${item.id} | <strong>Tag:</strong> ${item.tag}</p>
      <p>${item.description}</p>
      ${item.meta ? `<p class="muted">${item.meta}</p>` : ''}
      ${item.docFile ? `<p class="muted"><strong>Doc:</strong> ${item.docFile}</p>` : ''}
    `;
    
    div.appendChild(header);
    div.appendChild(details);
    container.appendChild(div);
  });
}

// Download JSON file
function downloadJSON(type) {
  if (contentData[type].length === 0) {
    alert('No items to download. Add some items first.');
    return;
  }
  
  const dataStr = JSON.stringify(contentData[type], null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  alert(`Downloaded ${type}.json! Upload this file to the /data/ folder in your repository.`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initForms();
  loadExistingData();
});

// Make downloadJSON available globally
window.downloadJSON = downloadJSON;
