const { getAllRepositories, getRepoInfo, getAllReposDetails } = require('./services/githubService');

const resolvers = {
  Query: {
    repositories: async () => {
      try {
        return await getAllRepositories();
      } catch (error) {
        console.error('Error fetching repositories:', error);
        throw new Error('Failed to fetch repositories');
      }
    },
    repository: async (_, { name }) => {
      try {
        const repo = await getRepoInfo(name);
        if (!repo) {
          throw new Error(`Repository ${name} not found`);
        }
        return repo;
      } catch (error) {
        console.error(`Error fetching repository ${name}:`, error);
        throw new Error(`Failed to fetch repository ${name}`);
      }
    },
    allRepositoriesDetails: async () => {
        try {
          return await getAllReposDetails();
        } catch (error) {
          console.error('Error fetching all repository details:', error);
          throw new Error('Failed to fetch all repositories details');
        }
      },
  },
};

module.exports = { resolvers };