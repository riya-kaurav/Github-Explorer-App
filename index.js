// console.log('Hello, world!');


function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
const usernameInput = document.getElementById('username');
const searchBtn   = document.getElementById('searchBtn');
const profileDiv   = document.getElementById('profile');
const reposDiv   = document.getElementById('repos');
const suggestionsDiv  = document.getElementById('suggestions');
const filterLang  = document.getElementById('filterLang');
const sortStarsBtn   = document.getElementById('sortStars');
const tabButtons  = document.querySelectorAll('.tabs button');
const tabPanels  = document.querySelectorAll('.tab-panel');


let allRepos    = [];
let suggestions = JSON.parse(localStorage.getItem('history') || '[]');

const debouncedSearch = debounce(searchUser, 300);

searchBtn.addEventListener('click', debouncedSearch);

usernameInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    debouncedSearch();
  } else {
    showSuggestions();
  }
});

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabPanels.forEach(panel => panel.classList.toggle('hidden', panel.id !== target));
    tabButtons.forEach(b => b.classList.toggle('active', b === btn));
  });
});

filterLang.addEventListener('change', () => displayRepos(filterRepos()));
sortStarsBtn.addEventListener('click', () => displayRepos(sortRepos()));


async function searchUser() {
  const username = usernameInput.value.trim();
  clearMessage();
  clearSuggestions();

  if (!username) {
    renderMessage('Please enter a username.');
    return;
  }

  showSkeletons();

  try {
    
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (userRes.status === 403) throw new Error('Rate limit exceeded. Try again later.');
    if (!userRes.ok)   throw new Error('User not found.');
    const userData = await userRes.json();
    displayUser(userData);

    
    const repoRes = await fetch(userData.repos_url);
    const repos   = await repoRes.json();
    allRepos = repos;
    populateFilterOptions(repos);
    displayRepos(repos);

    addToHistory(username);
  } catch (err) {
    renderMessage(err.message);
    reposDiv.innerHTML = '';
  } finally {
    clearSkeletons();
  }
}

function displayUser(data) {
  profileDiv.innerHTML = `
    <div class="card">
      <img src="${data.avatar_url}" alt="${data.login}" width="100" class="avatar"/>
      <h2>${data.name || data.login}</h2>
      <p>${data.bio || 'No bio available.'}</p>
      <p>👥 Followers: ${data.followers} |  Public repos: ${data.public_repos}</p>
    </div>
  `;
}

function displayRepos(repos) {
  reposDiv.innerHTML = repos.slice(0, 20).map(repo => `
    <div class="card repo">
      <a href="${repo.html_url}" target="_blank">${repo.name}</a>
      <p>${repo.description || 'No description.'}</p>
      <div class="meta">
        <span>⭐ ${repo.stargazers_count}</span>
        <span> ${repo.language || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

function renderMessage(msg) {
  profileDiv.innerHTML = `<p class="message">${msg}</p>`;
}

function clearMessage() {
  if (profileDiv.innerText.includes('Please') || profileDiv.innerText.includes('not found')) {
    profileDiv.innerHTML = '';
  }
}

function showSkeletons() {
  profileDiv.innerHTML = `
    <div class="skeleton avatar"></div>
    <div class="skeleton text short"></div>
    <div class="skeleton text long"></div>
  `;
  reposDiv.innerHTML = Array(5)
    .fill('<div class="skeleton repo-skel"></div>')
    .join('');
}

function clearSkeletons() {
  
}


function showSuggestions() {
  const input = usernameInput.value.toLowerCase();
  const matches = suggestions
    .filter(u => u.toLowerCase().startsWith(input))
    .slice(-5)
    .reverse();

  if (!matches.length) {
    suggestionsDiv.innerHTML = '';
    return;
  }

  suggestionsDiv.innerHTML = matches
    .map(u => `<li class="suggestion-item">${u}</li>`)
    .join('');

  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      usernameInput.value = item.textContent;
      clearSuggestions();
      searchUser();
    });
  });
}

function clearSuggestions() {
  suggestionsDiv.innerHTML = '';
}


function addToHistory(user) {
  const idx = suggestions.indexOf(user);
  if (idx > -1) suggestions.splice(idx, 1);
  suggestions.push(user);
  if (suggestions.length > 5) suggestions.shift();
  localStorage.setItem('history', JSON.stringify(suggestions));
}

function populateFilterOptions(repos) {
  const langs = Array.from(new Set(repos.map(r => r.language).filter(Boolean)));
  filterLang.innerHTML = `<option value="">All languages</option>` +
    langs.map(l => `<option value="${l}">${l}</option>`).join('');
}

function filterRepos() {
  const lang = filterLang.value;
  return allRepos.filter(r => !lang || r.language === lang);
}

function sortRepos() {
  return [...allRepos].sort((a, b) => b.stargazers_count - a.stargazers_count);
}



















