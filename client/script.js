const GRAPHQL_URL = 'http://localhost:4000/';

// Global cache variables
let cachedRepositories = null;
let cachedRepoDetails = null;

// Display the list of repositories
function displayRepositories(repositories) {
    const repoList = document.getElementById('repos');
    repoList.innerHTML = '';

    repositories.forEach(repo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Name: ${repo.name}</strong><br>
            Owner: ${repo.owner}<br>
            Size: ${repo.size} KB
        `;
        li.onclick = () => {
            fetchRepoDetails(repo.name);
        };
        repoList.appendChild(li);
    });
}

// Display the repository details for a single repository
function displayRepoDetails(repo) {
    const detailsDiv = document.getElementById('repoDetails');
    detailsDiv.style.display = 'block';
    detailsDiv.innerHTML = `
        <h2>${repo.name}</h2>
        <p>Owner: ${repo.owner}</p>
        <p>Size: ${repo.size} KB</p>
        <p>Private: ${repo.isPrivate ? 'Yes' : 'No'}</p>
        <p>File Count: ${repo.fileCount}</p>
        <h3>YAML Content:</h3>
        <pre>${repo.ymlContent && repo.ymlContent.length ? repo.ymlContent.join('\n') : 'No YAML file found.'}</pre>
        <h3>Active Webhooks:</h3>
        <ul>
            ${repo.activeWebhooks && repo.activeWebhooks.length ? repo.activeWebhooks.map(hook => `<li>${hook}</li>`).join('') : '<li>No webhooks found.</li>'}
        </ul>
    `;
}

// Display all repository details
function displayAllRepoDetails(repositories) {
    const detailsDiv = document.getElementById('repoDetails');
    detailsDiv.innerHTML = '';

    repositories.forEach(repo => {
        const repoDiv = document.createElement('div');
        repoDiv.classList.add('repo-details-block');
        repoDiv.innerHTML = `
            <h2>${repo.name}</h2>
            <p>Owner: ${repo.owner}</p>
            <p>Size: ${repo.size} KB</p>
            <p>Private: ${repo.isPrivate ? 'Yes' : 'No'}</p>
            <p>File Count: ${repo.fileCount}</p>
            <h3>YAML Content:</h3>
            <pre>${repo.ymlContent && repo.ymlContent.length ? repo.ymlContent.join('\n') : 'No YAML file found.'}</pre>
            <h3>Active Webhooks:</h3>
            <ul>
                ${repo.activeWebhooks && repo.activeWebhooks.length ? repo.activeWebhooks.map(hook => `<li>${hook}</li>`).join('') : '<li>No webhooks found.</li>'}
            </ul>
            <hr>
        `;
        detailsDiv.appendChild(repoDiv);
    });
}

// Show error messages to the user
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('fetchReposButton').disabled = false;
    document.getElementById('fetchAllReposDetailsButton').disabled = false;
}

// Fetch the list of repositories
async function fetchRepositories() {
    document.getElementById('error').textContent = '';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('fetchReposButton').disabled = true;
    document.getElementById('fetchAllReposDetailsButton').disabled = false;

    // Hide the repo details section when fetching repositories
    document.getElementById('repoDetails').style.display = 'none';
    document.getElementById('repoList').style.display = 'block';

    if (cachedRepositories) {
        displayRepositories(cachedRepositories);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fetchReposButton').disabled = false;
        return;
    }

    const query = `
        query {
            repositories {
                name
                size
                owner
            }
        }
    `;

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            showError('Error fetching repositories: ' + data.errors[0].message);
            return;
        }

        if (!data || !data.data || !data.data.repositories) {
            showError('Error: No repositories found');
            return;
        }

        cachedRepositories = data.data.repositories;

        document.getElementById('loading').style.display = 'none';
        document.getElementById('fetchReposButton').disabled = false;

        displayRepositories(cachedRepositories);
    } catch (error) {
        showError('Error fetching repositories. Please try again.');
        console.error('Error fetching repositories:', error);
    }
}

// Fetch and display all repository details
async function fetchAllRepoDetails() {
    document.getElementById('error').textContent = '';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('fetchAllReposDetailsButton').disabled = true;
    document.getElementById('fetchReposButton').disabled = false;

    // Hide the repo list when fetching all repository details
    document.getElementById('repoList').style.display = 'none';
    document.getElementById('repoDetails').style.display = 'block';

    if (cachedRepoDetails) {
        displayAllRepoDetails(cachedRepoDetails);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fetchAllReposDetailsButton').disabled = false;
        return;
    }

    const query = `
        query {
            allRepositoriesDetails {
                name
                size
                owner
                isPrivate
                fileCount
                ymlContent
                activeWebhooks
            }
        }
    `;

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            showError('Error fetching repository details: ' + data.errors[0].message);
            return;
        }

        if (!data || !data.data || !data.data.allRepositoriesDetails) {
            showError('Error: No repository details found');
            return;
        }

        cachedRepoDetails = data.data.allRepositoriesDetails;

        document.getElementById('loading').style.display = 'none';
        document.getElementById('fetchAllReposDetailsButton').disabled = false;

        displayAllRepoDetails(cachedRepoDetails);
    } catch (error) {
        showError('Error fetching all repository details. Please try again.');
        console.error('Error fetching all repository details:', error);
    }
}

// Fetch and display the repository details when a repo is clicked
async function fetchRepoDetails(repoName) {
    document.getElementById('error').textContent = '';

    const query = `
        query {
            repository(name: "${repoName}") {
                name
                size
                owner
                isPrivate
                fileCount
                ymlContent
                activeWebhooks
            }
        }
    `;

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            showError('Error fetching repository details: ' + data.errors[0].message);
            return;
        }

        if (!data || !data.data || !data.data.repository) {
            showError('Error: No repository details found');
            return;
        }

        displayRepoDetails(data.data.repository);
    } catch (error) {
        showError('Error fetching repository details. Please try again.');
        console.error('Error fetching repository details:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fetchReposButton').addEventListener('click', fetchRepositories);
    document.getElementById('fetchAllReposDetailsButton').addEventListener('click', fetchAllRepoDetails);
});
