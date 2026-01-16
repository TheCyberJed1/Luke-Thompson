const GITHUB_USER = 'TheCyberJed1';

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  initThemeToggle();
  loadProjects();
});

function initThemeToggle(){
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if(saved === 'light') document.body.classList.add('light');
  btn.addEventListener('click', ()=>{
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

async function loadProjects(){
  const el = document.getElementById('projects-list');
  try{
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);
    if(!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    if(!Array.isArray(repos) || repos.length===0){
      el.innerHTML = '<p>No public repositories found.</p>';
      return;
    }
    const filtered = repos.filter(r=>!r.fork).sort((a,b)=>b.stargazers_count - a.stargazers_count);
    el.innerHTML = '';
    filtered.forEach(r=>{
      const card = document.createElement('article');
      card.className = 'project';
      const name = document.createElement('h3');
      const link = document.createElement('a');
      link.href = r.html_url; link.textContent = r.name; link.target = '_blank'; link.rel='noreferrer noopener';
      name.appendChild(link);
      const desc = document.createElement('p');
      desc.textContent = r.description || 'No description provided.';
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${r.language || '—'} • ★ ${r.stargazers_count} · Updated ${new Date(r.updated_at).toLocaleDateString()}`;
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(meta);
      el.appendChild(card);
    });
  }catch(err){
    console.error(err);
    el.innerHTML = '<p>Unable to load projects from GitHub. Check your rate limit or try again later.</p>';
  }
}