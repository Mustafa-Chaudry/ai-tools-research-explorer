
// AI Tools & Research Explorer
// Live API integration

const form = document.getElementById("search-form");
const results = document.getElementById("search-results");
const statusMessage = document.getElementById("search-status");
const searchButton = form.querySelector('button[type="submit"]');


// Request JSON data from an API

async function getJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("HTTP " + response.status);
    }

    return await response.json();
}


// Create an HTML element containing plain text

function addText(parent, tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    parent.appendChild(element);
    return element;
}


// Create a separate area for each data provider

function createResultGroup(title) {
    const section = document.createElement("section");
    section.className = "result-group";

    addText(section, "h3", title);

    const message = addText(
        section, "p", "Loading results...", "result-status"
    );
    message.setAttribute("role", "status");

    const list = document.createElement("div");
    list.className = "result-list";

    section.appendChild(list);
    results.appendChild(section);

    return { message, list };
}


// Create a result card

function addResultCard(list, item) {
    const card = document.createElement("article");
    card.className = "result-card card shadow-sm h-100";

    addText(card, "h4", item.title);

    if (item.showDescription) {
        addText(card, "p", item.description);
    }

    addText(card, "p", item.metadata, "result-meta");

    const link = document.createElement("a");
    link.className = "btn btn-outline-primary btn-sm align-self-start mt-2";
    link.href = item.url;
    link.textContent = item.linkLabel;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    card.appendChild(link);

    // GitHub cards can request additional repository details
    if (item.apiUrl) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "details-button";
        button.textContent = "More details";

        button.addEventListener("click", async function() {
            button.disabled = true;
            button.textContent = "Loading...";

            try {
                const detail = await getJSON(item.apiUrl);

                const license =
                    detail.license?.spdx_id || "Not specified";

                const issues =
                    detail.open_issues_count ?? "Unknown";

                const updated =
                    detail.updated_at?.slice(0, 10) || "Unknown";

                addText(
                    card,
                    "p",
                    "License: " + license +
                    " | Open issues: " + issues +
                    " | Updated: " + updated
                );

                button.textContent = "Details loaded";

            } catch (error) {
                console.error(error);

                button.textContent = "Retry details";
                button.disabled = false;
            }
        });

        card.appendChild(button);
    }

    list.appendChild(card);
}

/*
 * API documentation: GitHub (n.d.), REST API endpoints for search.
 * Repository searches use q for the query and per_page for the result limit.
 * https://docs.github.com/en/rest/search/search#search-repositories
 * Accessed: 26 October 2026.
 */
// Search GitHub repositories

async function searchGitHub(topic, sortOrder, showDescription) {
    const group = createResultGroup("GitHub Repositories");

    try {
        const url = new URL(
            "https://api.github.com/search/repositories"
        );

        url.searchParams.set("q", topic);
        url.searchParams.set("per_page", "6");

        const data = await getJSON(url);
        const repositories = data.items || [];

        if (sortOrder === "title") {
            repositories.sort((a, b) =>
                a.full_name.localeCompare(b.full_name)
            );
        }

        group.message.textContent =
            repositories.length + " repositories displayed.";

        repositories.forEach(function(repo) {
            addResultCard(group.list, {
                title: repo.full_name,
                description: repo.description || "No description available.",
                metadata:
                    "Stars: " + (repo.stargazers_count ?? 0) +
                    " | Language: " + (repo.language || "Not specified"),
                url: repo.html_url,
                apiUrl: repo.url,
                linkLabel: "View repository",
                showDescription: showDescription
            });
        });

    } catch (error) {
        console.error("GitHub error:", error);

        group.message.textContent =
            error.message.includes("403") ||
            error.message.includes("429")
            ? "GitHub is rate-limiting requests. Please try again later."
            : "Unable to load GitHub results. Please try again.";
    }
}

/*
 * API documentation: Crossref (n.d.), REST API.
 * The /works endpoint supplies publication metadata;
 * query sets the search terms and rows limits the returned records.
 * https://www.crossref.org/documentation/retrieve-metadata/rest-api/
 * Accessed: 26 October 2026.
 */
// Search Crossref research metadata

async function searchCrossref(topic, sortOrder, showDescription) {
    const group = createResultGroup("Research Publications");

    try {
        const url = new URL("https://api.crossref.org/works");

        url.searchParams.set("query", topic);
        url.searchParams.set("rows", "6");

        const data = await getJSON(url);
        const papers = data.message?.items || [];

        if (sortOrder === "title") {
            papers.sort((a, b) =>
                (a.title?.[0] || "").localeCompare(b.title?.[0] || "")
            );
        }

        papers.forEach(function(paper) {
            const title =
                paper.title?.[0] || "Untitled publication";

            const firstAuthor = paper.author?.[0];

            const author =
                [firstAuthor?.given, firstAuthor?.family]
                    .filter(Boolean).join(" ") || "Author not listed";

            const year =
                paper.published?.["date-parts"]?.[0]?.[0] ||
                "Unknown year";

            const journal =
                paper["container-title"]?.[0] ||
                "Source not listed";

            const publicationURL = paper.DOI
                ? "https://doi.org/" + encodeURI(paper.DOI)
                : paper.URL;

            if (!publicationURL) return;

            addResultCard(group.list, {
                title: title,
                description: "First author: " + author,
                metadata: year + " | " + journal,
                url: publicationURL,
                linkLabel: "View publication",
                showDescription: showDescription
            });
        });

        group.message.textContent =
            group.list.childElementCount + " publications displayed.";

    } catch (error) {
        console.error("Crossref error:", error);

        group.message.textContent =
            "Unable to load Crossref results. Please try again.";
    }
}


// Handle the search form

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const topic = document.getElementById("search-topic")
        .value.trim();

    const source = document.getElementById("source").value;

    const sortOrder =
        document.getElementById("sort-order").value;

    const showDescription =
        document.getElementById("show-descriptions").checked;

    results.replaceChildren();

    if (topic.length < 2) {
        statusMessage.textContent =
            "Please enter at least two characters.";
        return;
    }

    statusMessage.textContent = "Searching live sources...";

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    const searches = [];

    try {
        if (source === "all" || source === "github") {
            searches.push(
                searchGitHub(topic, sortOrder, showDescription)
            );
        }

        if (source === "all" || source === "research") {
            searches.push(
                searchCrossref(topic, sortOrder, showDescription)
            );
        }

        // Run the selected searches concurrently
        await Promise.all(searches);

        statusMessage.textContent =
            "Search finished. Results are grouped by source.";

    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search Resources";
    }
});

/*
 * jQuery methods used by the suggested-topic shortcuts:
 * ready handler: https://api.jquery.com/ready/
 * click event binding: https://api.jquery.com/on/
 * attribute reading: https://api.jquery.com/attr/
 * input value setting: https://api.jquery.com/val/
 * Reference: jQuery (n.d.), jQuery API documentation.
 * Accessed: 26 October 2026.
 */
// jQuery suggested search shortcuts

$(function () {

    $(".topic-shortcut").on("click", function () {

        const selectedTopic = $(this).attr("data-topic");

        $("#search-topic").val(selectedTopic);

// Native requestSubmit() performs validation and triggers the submit event.
// Reference: MDN contributors (2025), HTMLFormElement: requestSubmit() method.
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit
// Accessed: 26 October 2026.
        document.getElementById("search-form").requestSubmit();

    });

});
