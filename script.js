const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');

const formatStars = (stars) => new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
}).format(stars);

const renderRepositories = (repositories) => {
  repositoryCount.textContent = `${repositories.length} saved`;

  if (repositories.length === 0) {
    repositoryList.innerHTML = '<p class="status-message">No starred repositories yet.</p>';
    return;
  }

  repositoryList.innerHTML = repositories.map((repository) => `
    <article class="repository-card">
      <div>
        <p class="repository-owner">${repository.owner} /</p>
        <h3><a href="${repository.url}" target="_blank" rel="noreferrer">${repository.name}</a></h3>
        <p class="repository-description">${repository.description}</p>
      </div>
      <div class="repository-meta">
        <span class="language">${repository.language}</span>
        <span>${formatStars(repository.stars)} stars</span>
      </div>
    </article>
  `).join('');
};

const loadRepositories = async () => {
  try {
    const response = await fetch('events.json');

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    renderRepositories(await response.json());
  } catch (error) {
    repositoryList.innerHTML = '<p class="status-message">Could not load repositories. Please try again.</p>';
    repositoryCount.textContent = '';
    console.error(error);
  }
};

loadRepositories();