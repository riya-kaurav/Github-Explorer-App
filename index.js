console.log('Hello, world!');

const searchBtn = document.getElementById('searchBtn');
const usernameInput = document.getElementById('username');
const profileDiv = document.getElementById('profile');

searchBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();

  if (username === '') {
    profileDiv.innerHTML = '<p>Please enter a username.</p>';
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
      throw new Error('User not found');
    }

    const data = await res.json();
    console.log(data); // Check the data in console for now
    profileDiv.innerHTML = `
      <img src="${data.avatar_url}" width="100">
      <h2>${data.name || data.login}</h2>
      <p>${data.bio || 'No bio'}</p>
      <p><strong>Followers:</strong> ${data.followers}</p>
      <p><strong>Repos:</strong> ${data.public_repos}</p>
    `;
  } catch (err) {
    profileDiv.innerHTML = `<p>${err.message}</p>`;
  }
});





















