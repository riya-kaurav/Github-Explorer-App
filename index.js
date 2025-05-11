console.log('Hello, world!');

const searchBtn = document.getElementById('searchBtn');
const usernameInput = document.getElementById('username');
const profileDiv = document.getElementById('profile');
const reposContainer = document.getElementById('repos');

searchBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();

  if (username === '') {
    profileDiv.innerHTML = '<p>Please enter a username.</p>';
    reposContainer.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
      throw new Error('User not found');
    }

    const data = await res.json();
    displayUser(data);

const repoRes = await fetch(data.repos_url);
const repos = await repoRes.json();
displayRepos(repos);



  } catch (err) {
    profileDiv.innerHTML = `<p>${err.message}</p>`;
    reposContainer.innerHTML = '';
  }
});

function displayUser(data) {
  const profileDiv = document.getElementById('profile');

  profileDiv.innerHTML = `<img src ="${data.avatar_url}" alt ="${data.login}" width="100" style ="border-radius: 50%;"/>
  <h2>${data.name || 'No name'}</h2>
  <p><strong>@${data.login}</strong></p>
  <p>${data.bio || 'No bio'}</p>
  

  <p><strong>Followers:</strong> ${data.followers}</p>`;
}

function displayRepos(repos){
  const reposContainer = document.getElementById('repos');
  reposContainer.innerHTML = repos.slice(0, 5).map(repo => 

`<div class ="repos">
  <a href ="${repo.html_url}" target ="_blank"></a>
  <span> ${repo.stargazers_count}</span>
</div> `).join('');



  
}



















