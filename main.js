const userSearch = document.getElementById("user-search-button");
const search = document.getElementById("user-search");
const main = document.getElementById("main");
const baseURL = "https://api.github.com/users/";

let currentPage = 1;
let repositoriesPerPage = 10;

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
        <div>
            <label for="repositories-per-page">Repositories Per Page:</label>
            <select id="repositories-per-page" onchange="changeRepositoriesPerPage()">
              <option value="10">10 Repositories/Page</option>
              <option value="20">20 Repositories/Page</option>
              <option value="50">50 Repositories/Page</option>
              <option value="100">100 Repositories/Page</option>
            </select>
        </div>
    </div>
  `;

  main.innerHTML = userCard;
};

userSearch.addEventListener("click", (e) => {
  e.preventDefault();
  const user = search.value;
  if (user) {
    getUser(user);
    search.value = "";
  }
});

const getUser = async (username) => {
  try {
    const rawData = await fetch(baseURL + username);
    const data = await rawData.json();
    displayUserDetails(data);
    getRepositories(username);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert("No Profile with this Username");
    } else {
      console.error("Error fetching user:", error);
    }
  }
};

const getRepositories = async (username) => {
  try {
    const rawData = await fetch(
      `${baseURL}${username}/repos?sort=created&page=${currentPage}&per_page=${repositoriesPerPage}`
    );
    const data = await rawData.json();
    displayUserRepositories(data);

    // Display pagination controls
    const linkHeader = rawData.headers.get("link");
    if (linkHeader) {
      const links = parseLinkHeader(linkHeader);
      createPaginationControls(links, username);
    }
  } catch (error) {
    console.error("Error fetching repositories:", error);
    alert("Problem fetching Repositories!");
  }
};

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

function changeRepositoriesPerPage() {
  repositoriesPerPage = parseInt(
    document.getElementById("repositories-per-page").value
  );
  currentPage = 1; // Reset current page when changing repositories per page
  const username = document.getElementById("user-search").value;
  getRepositories(username);
}

function displayUserRepositories(repositoriesData) {
  const repositoriesSection = document.getElementById("repositories-section");
  repositoriesSection.innerHTML = ""; // Clear previous content

  repositoriesData.forEach(async (repo) => {
    const repoBox = await createRepositoryBox(repo);
    repositoriesSection.appendChild(repoBox);
  });
}

async function createRepositoryBox(repo) {
  const repoBox = document.createElement("div");
  repoBox.classList.add("repository-box");

  const repoName = document.createElement("h3");
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

function createPaginationControls(links, username) {
  const paginationDiv = document.getElementById("pagination-section");
  paginationDiv.innerHTML = "";

  const createButton = (text, url) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = () => {
      if (text === "Previous") {
        currentPage--;
      } else if (text === "Next") {
        currentPage++;
      } else {
        currentPage = parseInt(text);
      }
      getRepositories(username);
    };
    return button;
  };

  if (links.prev) {
    paginationDiv.appendChild(createButton("Previous", links.prev));
  }

  for (let i = 1; i <= links.last; i++) {
    paginationDiv.appendChild(createButton(i.toString(), `page=${i}`));
  }

  if (links.next) {
    paginationDiv.appendChild(createButton("Next", links.next));
  }

  // Display current page and repositories per page controls
  const currentPageSpan = document.createElement("span");
  currentPageSpan.textContent = `Current Page: ${currentPage}`;
  paginationDiv.appendChild(currentPageSpan);

  const repositoriesPerPageSelect = document.getElementById(
    "repositories-per-page"
  );
  repositoriesPerPageSelect.value = repositoriesPerPage;
}

function parseLinkHeader(header) {
  const links = {};
  const parts = header.split(", ");
  for (const part of parts) {
    const section = part.split("; ");
    const url = section[0].slice(1, -1);
    const key = section[1].split("=")[1].slice(1, -1);
    links[key] = url;
  }
  return links;
}
