
document.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector("#mainContent");

    const webPages = {
        home: homePage,
        browse: browsePage,
        about: aboutPage
    };

    // https://www.artofcode.org/javascript-tutorial/how-to-build-single-page-applications-with-vanilla-javascript/
    function loadWebPage() {
        const page = window.location.hash.substring(1) || "home";

        if (webPages[page]) {
            webPages[page]();
        } else {
            homePage();
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event
    window.addEventListener("hashchange", loadWebPage);

    loadWebPage();



    function homePage() {
        mainContent.innerHTML = `
        <h2>Home</h2>
        <h3>Robinson-Russell & Swan Outfitters</h3>
        <p>This page is under construction...</p>;
        `;
    }

    function browsePage() {
        mainContent.innerHTML = `
        <h2>Browse Products</h2>
        <p>This page is under construction...</p>
        `;

        const clothingAPI = "./data-pretty.json";

        fetch(clothingAPI)
            .then(response => response.json())
            .then( data => {
                console.log(data);
            })
            .catch(error => console.error(error));
    }

    function aboutPage() {
        mainContent.innerHTML = `
        <h2>About Us</h2>
        <p>This page is under construction...</p>
        `;
    }
});