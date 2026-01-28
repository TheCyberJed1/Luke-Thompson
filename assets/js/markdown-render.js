function escapeHtml(text){
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeHref(href){
  const trimmed = href.trim();
  if(trimmed.startsWith('//')) return '#';
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  if(hasScheme){
    const lower = trimmed.toLowerCase();
    if(!lower.startsWith('http://') && !lower.startsWith('https://') && !lower.startsWith('mailto:')) return '#';
  }
  return escapeHtml(trimmed);
}

function protectEscapes(text){
  const tokens = [];
  const escaped = text.replace(/\\([\\`*[\]()])/g, (_, char)=>{
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(char);
    return token;
  });
  return { escaped, tokens };
}

function restoreEscapes(text, tokens){
  return text.replace(/\u0000(\d+)\u0000/g, (_, index)=>tokens[Number(index)] ?? '');
}

function formatInline(text, tokens){
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  return restoreEscapes(escaped, tokens);
}

function parseInline(text){
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const { escaped, tokens } = protectEscapes(text);
  let output = '';
  let lastIndex = 0;
  for(const match of escaped.matchAll(linkPattern)){
    output += formatInline(escaped.slice(lastIndex, match.index), tokens);
    const label = formatInline(match[1], tokens);
    const href = sanitizeHref(restoreEscapes(match[2], tokens));
    output += `<a href="${href}">${label}</a>`;
    lastIndex = match.index + match[0].length;
  }
  output += formatInline(escaped.slice(lastIndex), tokens);
  return output;
}

function splitTableRow(row){
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell)=>cell.trim());
}

function renderMarkdown(text){
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inCode = false;
  let listType = null;

  const closeList = ()=>{
    if(listType){
      html += `</${listType}>`;
      listType = null;
    }
  };

  for(let i = 0; i < lines.length; i += 1){
    const line = lines[i];
    const trimmed = line.trim();

    if(inCode){
      if(trimmed.startsWith('```')){
        html += '</code></pre>';
        inCode = false;
      }else{
        html += `${escapeHtml(line)}\n`;
      }
      continue;
    }

    if(trimmed.startsWith('```')){
      closeList();
      html += '<pre><code>';
      inCode = true;
      continue;
    }

    if(trimmed === ''){
      closeList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if(headingMatch){
      closeList();
      const level = headingMatch[1].length;
      html += `<h${level}>${parseInline(headingMatch[2])}</h${level}>`;
      continue;
    }

    if(/^-{3,}$/.test(trimmed)){
      closeList();
      html += '<hr>';
      continue;
    }

    if(trimmed.startsWith('>')){
      closeList();
      const quoteLines = [];
      let j = i;
      while(j < lines.length && lines[j].trim().startsWith('>')){
        quoteLines.push(lines[j].replace(/^>\s?/, '').trim());
        j += 1;
      }
      i = j - 1;
      html += `<blockquote>${parseInline(quoteLines.join(' '))}</blockquote>`;
      continue;
    }

    const next = lines[i + 1];
    if(line.includes('|') && next && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(next)){
      closeList();
      const headers = splitTableRow(line);
      html += '<table><thead><tr>';
      headers.forEach((cell)=>{
        html += `<th>${parseInline(cell)}</th>`;
      });
      html += '</tr></thead><tbody>';
      let j = i + 2;
      while(j < lines.length){
        const rowLine = lines[j];
        if(!rowLine.includes('|') || rowLine.trim() === '') break;
        const cells = splitTableRow(rowLine);
        html += '<tr>';
        cells.forEach((cell)=>{
          html += `<td>${parseInline(cell)}</td>`;
        });
        html += '</tr>';
        j += 1;
      }
      html += '</tbody></table>';
      i = j - 1;
      continue;
    }

    const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if(olMatch || ulMatch){
      const type = olMatch ? 'ol' : 'ul';
      if(listType !== type){
        closeList();
        html += `<${type}>`;
        listType = type;
      }
      html += `<li>${parseInline((olMatch || ulMatch)[1])}</li>`;
      continue;
    }

    closeList();
    html += `<p>${parseInline(trimmed)}</p>`;
  }

  closeList();
  if(inCode) html += '</code></pre>';
  return html;
}

async function renderMarkdownPage(){
  const contentEl = document.getElementById('md-content');
  if(!contentEl) return;
  try{
    const params = new URLSearchParams(window.location.search);
    const src = params.get('doc') || contentEl.dataset.src;
    if(!src) throw new Error('Missing markdown source');
    const allowlist = new Set((contentEl.dataset.allowed || '').split(',').filter(Boolean));
    if(!/^[\w.-]+\.md$/.test(src) || (allowlist.size && !allowlist.has(src))){
      throw new Error('Invalid markdown source');
    }
    const res = await fetch(src);
    if(!res.ok){
      throw new Error(res.status === 404 ? 'Document not found' : 'Failed to load markdown');
    }
    const text = await res.text();
    contentEl.innerHTML = renderMarkdown(text);
  }catch(err){
    console.error(err);
    let message = 'Unable to load content. Please refresh or check back later.';
    if(err.message === 'Invalid markdown source') message = 'Invalid document name.';
    if(err.message === 'Missing markdown source') message = 'No document selected.';
    if(err.message === 'Document not found') message = 'Document not found.';
    contentEl.innerHTML = `<p class="muted">${message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', renderMarkdownPage);
