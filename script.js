const userSearch = document.getElementById("user-search-button");
const search = document.getElementById("user-search");
const main = document.getElementById("main");
const baseURL = "https://api.github.com/users/";

// funciton for displaying user details
const displayUserDetails = (user) => {
  if (user.twitter_username === null) {
    user.twitter_username = "";
  }
  const userCard = `
    <div class="user-card">
        <div class="user-info-section">
            <div class="user-avatar-section">
                <div class="avatar-container">
                    <img src="${user.avatar_url}" alt="User Avatar">
                </div>
            </div>
            <div class="user-details-section">
                <h2>${user.name}</h2>
                <p>${user.bio}</p>
                <p>Location: ${user.location}</p>
                <span>Twitter :</span><a href="https://twitter.com/${user.twitter_username}" target="_blank">https://twitter.com/${user.twitter_username}</a>
                <span>GitHub :</span><a href="https://github.com/${user.login}" target="_blank">https://github.com/${user.login}</a>
            </div>
        </div>
        <div class="repositories-section" id="repositories-section">

        </div>
        <div class="pagination-section" id="pagination-section">

        </div>
    </div>
  `;

  main.innerHTML = userCard;
};

// loader functionality
const loader = document.getElementById("loader");

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

// add click event at the saerch button
userSearch.addEventListener("click", (e) => {
  e.preventDefault();
  const user = search.value;
  if (user) {
    getUser(user);
    search.value = "";
  }
});

// function for fetch user
const getUser = async (username) => {
  try {
    showLoader();
    const rawData = await fetch(baseURL + username);
    const data = await rawData.json();
    getRepositories(username);
    displayUserDetails(data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert("No Profile with this Username");
    } else {
      console.error("Error fetching user:", error);
    }
  } finally {
    hideLoader();
  }
};

// function for fetch user's repositories
const getRepositories = async (username) => {
  try {
    showLoader();
    const rawData = await fetch(baseURL + username + "/repos?sort=created");
    const data = await rawData.json();
    displayUserRepositories(data);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    alert("Problem fetching Repositories!");
  } finally {
    hideLoader();
  }
};

// function for display repositories
function displayUserRepositories(repositoriesData) {
  const repositoriesSection = document.getElementById("repositories-section");
  repositoriesSection.innerHTML = ""; // Clear previous content

  repositoriesData.forEach(async (repo) => {
    const repoBox = await createRepositoryBox(repo);
    repositoriesSection.appendChild(repoBox);
  });
}

// function for create repository box
async function createRepositoryBox(repo) {
  const repoBox = document.createElement("div");
  repoBox.classList.add("repository-box");

  const repoName = document.createElement("p");
  repoName.classList.add("repo-name");
  repoName.textContent = repo.name;
  repoBox.appendChild(repoName);

  const repoBio = document.createElement("p");
  repoBio.textContent = repo.description || "No description available.";
  repoBox.appendChild(repoBio);

  const languages = await getLanguages(repo.languages_url);
  const languagesBox = createLanguagesBox(languages);
  repoBox.appendChild(languagesBox);

  return repoBox;
}

// function for fetch languages used in repositories
const getLanguages = async (lang_url) => {
  try {
    const rawData = await fetch(lang_url);
    const data = await rawData.json();
    return data;
  } catch (error) {
    console.error("Error fetching languages:", error);
    alert("Problem fetching Languages!");
  }
};

// function for create a language box inside repository box
function createLanguagesBox(languages) {
  const languagesBox = document.createElement("div");
  languagesBox.classList.add("languages-box");

  const languagesTitle = document.createElement("p");
  languagesTitle.textContent = "Languages:";
  languagesBox.appendChild(languagesTitle);

  const languagesList = document.createElement("ul");
  for (const language in languages) {
    const languageItem = document.createElement("li");
    languageItem.textContent = `${language}`;
    languagesList.appendChild(languageItem);
  }
  languagesBox.appendChild(languagesList);

  return languagesBox;
}
