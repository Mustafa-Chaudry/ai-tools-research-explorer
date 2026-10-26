
// Example resources for testing search form.


const resources = [
    {
        title: "Agentic AI repositories",
        source: "github",
        description: "GitHub projects related to autonomous AI agents.",
        url: "https://github.com/search?q=agentic+AI&type=repositories"
    },
    {
        title: "Agentic AI research",
        source: "research",
        description: "Academic publications about agentic AI.",
        url: "https://search.crossref.org/search/works?q=agentic%20AI&from_ui=yes"
    },
    {
        title: "Digital Transformation projects",
        source: "github",
        description: "Open-source projects related to digital transformation.",
        url: "https://github.com/search?q=digital+transformation&type=repositories"
    },
    {
        title: "Digital Transformation research",
        source: "research",
        description: "Academic publications about digital transformation.",
        url: "https://search.crossref.org/search/works?q=digital%20transformation&from_ui=yes"
    },
    {
        title: "Large Language Models",
        source: "github",
        description: "Open-source projects involving large language models.",
        url: "https://github.com/search?q=large+language+models&type=repositories"
    },
    {
        title: "Large Language Models research",
        source: "research",
        description: "Academic publications about large language models.",
        url: "https://search.crossref.org/search/works?q=large%20language%20models&from_ui=yes"
    },
    {
        title: "AI Governance projects",
        source: "github",
        description: "Open-source projects related to AI governance.",
        url: "https://github.com/search?q=AI+governance&type=repositories"
    },
    {
        title: "AI Governance research",
        source: "research",
        description: "Academic publications about AI governance.",
        url: "https://search.crossref.org/search/works?q=AI%20governance&from_ui=yes"
    },
    {
        title: "Healthcare AI projects",
        source: "github",
        description: "Open-source projects related to healthcare AI.",
        url: "https://github.com/search?q=healthcare+AI&type=repositories"
    },
    {
        title: "Healthcare AI research",
        source: "research",
        description: "Academic publications about healthcare AI.",
        url: "https://search.crossref.org/search/works?q=healthcare%20AI&from_ui=yes"
    }
];


// Get references to HTML elements

const form = document.getElementById("search-form");
const results = document.getElementById("search-results");
const statusMessage = document.getElementById("search-status");


// Run this function when the form is submitted

function searchResources(event) {

    // Prevent the browser from reloading the page
    event.preventDefault();

    // Read the user's inputs
    const topic = document.getElementById("search-topic")
        .value.trim().toLowerCase();

    const source = document.getElementById("source").value;

    const sortOrder = document.getElementById("sort-order").value;

    const showDescriptions =
        document.getElementById("show-descriptions").checked;

    // Clear the previous results
    results.replaceChildren();

    // Check the search term
    if (topic.length < 2) {
        statusMessage.textContent =
            "Please enter at least two characters.";
        return;
    }

    // Find resources matching the topic and source
    const matches = resources.filter(function(resource) {

        const text =
            (resource.title + " " + resource.description)
            .toLowerCase();

        const topicMatches = text.includes(topic);

        const sourceMatches =
            source === "all" || resource.source === source;

        return topicMatches && sourceMatches;
    });

    // Optional alphabetical sorting
    if (sortOrder === "title") {
        matches.sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });
    }

    // Update the status
    statusMessage.textContent =
        matches.length + " sample resources found.";

    // Display each matching resource
    matches.forEach(function(resource) {

        const card = document.createElement("article");
        card.className = "result-card";

        const heading = document.createElement("h3");
        heading.textContent = resource.title;

        card.appendChild(heading);

        if (showDescriptions) {
            const paragraph = document.createElement("p");
            paragraph.textContent = resource.description;
            card.appendChild(paragraph);
        }

        const link = document.createElement("a");
        link.href = resource.url;
        link.textContent = "Open resource";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.appendChild(link);
        results.appendChild(card);
    });
}


// Listen for the submit event

form.addEventListener("submit", searchResources);
