# GitHub Repository Scanner

## Overview

This project is a GitHub repository scanner that uses an Apollo GraphQL server to fetch and display repository information, such as basic repository details, YAML file content, and active webhooks.



## Setup Instructions

### 1. Clone the Repository

```sh
git clone <your-repository-url>
cd <your-repository-directory>

  ```

### 2. Install Node.js Dependencies
```sh
npm install
```
### 3. Generate a GitHub Token(very important!!)
To use the GitHub API, you need to generate a **Personal Access Token:**

 - Log into GitHub and go to **Settings**.
 - In the sidebar, click **Developer settings.**
 - Click **Personal access tokens**, then **Tokens (classic).**
 - Click **Generate new token.**
 - Click **Generate token** and **copy the token.** (You won’t be able to see it again!)



### 4. Create a .env File
 The project uses an environment variable to store your GitHub token securely. You need to create a `.env` file in the root of your project directory. This `.env` file will contain your GitHub token, which is necessary for authenticating API requests.

```sh
touch .env
```
Add the following line to the `.env` file:

```sh
GITHUB_TOKEN=<your-github-token-here>

```

### 5. Run the Server
#### Command:

```sh
node server.js
```

## GraphQL Queries
### 1. List Repositories

```sh
query {
  repositories {
    name
    size
    owner
  }
}

```

### 2. Get Repository Details

```sh
query {
  repository(name: "repoA") {
    name
    size
    owner
    isPrivate
    fileCount
    ymlContent
    activeWebhooks
  }
}

```

### 3. Get All Repository Details

```sh
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
```

## Running the Client-Side (HTML) Interface

To interact with the project visually and view the queries in action, follow these steps to run both the Node.js backend server and the client-side HTML interface.

### 1. Start the GraphQL Server:

  First, ensure the backend server is running, as it powers the GraphQL queries:
   ```bash
   node server.js
   ```
   The server will start on `http://localhost:4000`

  ### 2. Serve the Client-Side HTML:
  To view the HTML interface where you can interact with the repositories:
  
  - Install `http-server` globally if you haven't:
    
     `npm install -g http-server`

  - Navigate to the `client/` directory and run `http-server`:
```
  cd client
  http-server
```

  ### 3. Open the Application in a Browser:
  Visit the URL displayed in the terminal (usually `http://localhost:8080`), and you will be able to:

  - Fetch the list of repositories.
  - View detailed information about the repositories, including file count, YAML content, and active webhooks.


  Make sure both the **GraphQL** server and the **HTTP server** are running to fully utilize the project.

