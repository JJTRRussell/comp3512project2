
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
        const clothingAPI = "./data-pretty.json";

        fetch(clothingAPI)
            .then(response => response.json())
            .then( data => {
                console.log(data);
                displayProducts(data);
            })
            .catch(error => console.error(error));

        function displayProducts(products) {
            const productsGrid = document.querySelector(".products-grid");
            const template = document.querySelector(".products-template");

            productsGrid.innerHTML = "";

            for (let p of products) {
                const clone = template.content.cloneNode(true);
                const name = clone.querySelector(".product-name");
                name.textContent = p.name;
                name.value = p.id;
                const description = clone.querySelector(".product-description");
                description.textContent = p.description;
                const price = clone.querySelector(".product-price");
                price.textContent = p.price;
                price.value = p.price;
                const btn = clone.querySelector(".add-to-cart-btn");
                btn.textContent = "Add to Cart";
                btn.dataset.id = p.id;
                btn.dataset.name = p.name;

                productsGrid.appendChild(clone);
            }
        }
    }

    function aboutPage() {
        mainContent.innerHTML = `
        <h2>About Us</h2>
        <p>This page is under construction...</p>
        `;
    }
});