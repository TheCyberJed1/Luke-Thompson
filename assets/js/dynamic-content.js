// Dynamic content loader for labs, scripts, and incidents

async function loadDynamicContent(dataFile, containerId, baseUrl = '.') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await fetch(`${baseUrl}/data/${dataFile}`);
    if (!res.ok) throw new Error('Failed to load data');
    
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p class="muted">No items found.</p>';
      return;
    }

    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';
      
      const tag = document.createElement('p');
      tag.className = 'tag';
      tag.textContent = item.tag;
      
      const title = document.createElement('h3');
      title.textContent = item.title;
      
      const desc = document.createElement('p');
      desc.textContent = item.description;
      
      card.appendChild(tag);
      card.appendChild(title);
      card.appendChild(desc);
      
      if (item.meta) {
        const meta = document.createElement('p');
        meta.className = 'meta';
        meta.textContent = item.meta;
        card.appendChild(meta);
      }
      
      if (item.docFile) {
        const link = document.createElement('a');
        link.className = 'inline-link';
        link.href = `?doc=${item.docFile}`;
        link.textContent = 'View details →';
        card.appendChild(link);
      }
      
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading dynamic content:', err);
    container.innerHTML = '<p class="muted">Unable to load content. Please refresh or try again later.</p>';
  }
}

// Initialize dynamic content loading based on page
document.addEventListener('DOMContentLoaded', () => {
  const scriptsContainer = document.getElementById('scripts-container');
  const labsContainer = document.getElementById('labs-dynamic-container');
  const incidentsContainer = document.getElementById('incidents-dynamic-container');
  
  if (scriptsContainer) {
    loadDynamicContent('scripts.json', 'scripts-container', '..');
  }
  
  if (labsContainer) {
    loadDynamicContent('labs.json', 'labs-dynamic-container', '..');
  }
  
  if (incidentsContainer) {
    loadDynamicContent('incidents.json', 'incidents-dynamic-container', '..');
  }
});
