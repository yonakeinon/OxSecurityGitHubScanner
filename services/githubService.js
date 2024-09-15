const axios = require('axios');
require('dotenv').config();

const REPOS = ['repoA', 'repoB', 'repoC'];
const MAX_PARALLEL_SCANS = 2;
const USERNAME = 'yonakeinon';
const token = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE_URL = 'https://api.github.com';

async function processInParallel(items, processFn) {
    const results = [];
  
    for (let i = 0; i < items.length; i += MAX_PARALLEL_SCANS) {
      const batch = items.slice(i, i + MAX_PARALLEL_SCANS);
      const batchResults = await Promise.all(batch.map(processFn));
      results.push(...batchResults.filter(Boolean));
    }
  
    return results;
  }

async function getAllRepositories() {
    try {
        return await processInParallel(REPOS, getBasicRepoInfo);
      } catch (error) {
        console.error('Error fetching all repositories:', error);
        throw new Error('Failed to fetch all repositories');
      }
}

async function getBasicRepoInfo(repoName) {
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${USERNAME}/${repoName}`, { headers });
    const repo = repoResponse.data;

    return {
      name: repo.name,
      size: repo.size,
      owner: repo.owner.login,
    };
  } catch (error) {
    console.error(`Error fetching basic info for repository ${repoName}:`, error);
    return null;
  }
}

async function getRepoInfo(repoName) {
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${USERNAME}/${repoName}`, { headers });
    const repo = repoResponse.data;

    const [ymlContent, activeWebhooks, fileCount] = await Promise.all([
      fetchYmlFile(token, repoName),
      fetchWebhooks(token, repoName),
      countFilesInRepo(token, repoName)
    ]);

    return {
      name: repo.name,
      size: repo.size,
      owner: repo.owner.login,
      isPrivate: repo.private,
      fileCount,
      ymlContent: ymlContent.length ? ymlContent : [], 
      activeWebhooks: activeWebhooks.length ? activeWebhooks : ["No webhooks found"],
    };
  } catch (error) {
    console.error(`Error fetching detailed info for repository ${repoName}:`, error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.error(`Repository ${repoName} not found`);
      return null;
    }
    throw new Error(`Failed to fetch info for repository ${repoName}`);
  }
}

async function getAllReposDetails() {
    try {
        return await processInParallel(REPOS, getRepoInfo);
      } catch (error) {
        console.error('Error fetching all repo details:', error);
        throw new Error('Failed to fetch all repo details');
      }
  }

async function fetchYmlFile(token, repoName, path = '') {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${USERNAME}/${repoName}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });


    for (const item of response.data) {
      if (item.type === 'dir') {
        // Recursively check subdirectories
        const ymlFile = await fetchYmlFile(token, repoName, item.path);
        if (ymlFile.length > 0) return ymlFile;
      } else if (item.name.endsWith('.yml') || item.name.endsWith('.yaml')) {
        const contentResponse = await axios.get(item.download_url);
        console.log(`YAML files found in ${repoName}`);
        return contentResponse.data.split('\n');
      }
    }

    return []; 
  } catch (error) {
    console.error(`Error fetching YAML file for ${repoName}:`, error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.error(`Repository ${repoName} not found or no contents accessible`);
      return [];
    }
    throw new Error(`Failed to fetch YAML file for repository: ${repoName}`);
  }
}


async function fetchWebhooks(token, repoName) {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${USERNAME}/${repoName}/hooks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.length === 0) {
      console.log(`No webhooks found for ${repoName}`);
      return [];
    }

    return response.data.map(hook => hook.config.url);
  } catch (error) {
    console.error(`Error fetching webhooks for ${repoName}:`, error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.error(`Repository ${repoName} not found or no webhooks configured`);
      return [];
    }
    throw new Error(`Failed to fetch webhooks for repository: ${repoName}`);
  }
}

async function countFilesInRepo(token, repoName) {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${USERNAME}/${repoName}/git/trees/master?recursive=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.tree.length;
  } catch (error) {
    console.error(`Error counting files in ${repoName}:`, error);
    throw new Error(`Failed to count files for repository: ${repoName}`);
  }
}

module.exports = { getAllRepositories, getRepoInfo, getAllReposDetails };
