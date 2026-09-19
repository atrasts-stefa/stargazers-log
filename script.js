const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');
const requestTimeout = 10000;

const formatStars = (stars) => new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
}).format(stars);

const isNonEmptyString = (value) => (
  typeof value === 'string' && value.trim().length > 0
);

const isSafeInteger = (value) => (
  Number.isSafeInteger(value) && value >= 0
);

const isRepository = (repository) => (
  repository
  && isNonEmptyString(repository.name)
  && isNonEmptyString(repository.owner)
  && isNonEmptyString(repository.description)
  && isNonEmptyString(repository.language)
  && isSafeInteger(repository.stars)
  && isNonEmptyString(repository.url)
  && /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(repository.url)
);

const getRepositories = (data) => {
  if (!Array.isArray(data) || !data.every(isRepository)) {
    throw new Error('Repository data has an invalid shape');
  }

  return data;
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
};

const renderRepositories = (repositories) => {
  repositoryCount.textContent = `${repositories.length} saved`;

  if (repositories.length === 0) {
    repositoryList.replaceChildren(
      createTextElement('p', 'status-message', 'No starred repositories yet.'),
    );
    return;
  }

  const cards = repositories.map((repository) => {
    const content = document.createElement('div');
    content.append(
      createTextElement('p', 'repository-owner', `${repository.owner} /`),
    );

    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = repository.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = repository.name;
    heading.append(link);
    content.append(heading);
    content.append(
      createTextElement(
        'p',
        'repository-description',
        repository.description,
      ),
    );

    const metadata = document.createElement('div');
    metadata.className = 'repository-meta';
    metadata.append(
      createTextElement('span', 'language', repository.language),
      createTextElement('span', '', `${formatStars(repository.stars)} stars`),
    );

    const card = document.createElement('article');
    card.className = 'repository-card';
    card.append(content, metadata);
    return card;
  });

  repositoryList.replaceChildren(...cards);
};

const loadRepositories = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    repositoryList.replaceChildren(
      createTextElement('p', 'status-message', 'Loading repositories...'),
    );
    repositoryCount.textContent = '';

    const response = await fetch('events.json', { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    renderRepositories(getRepositories(await response.json()));
  } catch (error) {
    const message = error.message === 'Repository data has an invalid shape'
      ? 'Repository data is invalid.'
      : 'Could not load repositories.';
    const errorMessage = createTextElement(
      'p',
      'status-message',
      message,
    );
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.textContent = 'Try again';
    retryButton.addEventListener('click', loadRepositories);
    errorMessage.append(' ', retryButton);
    repositoryList.replaceChildren(errorMessage);
    repositoryCount.textContent = '';
    console.error(error);
  } finally {
    clearTimeout(timeoutId);
  }
};

loadRepositories();