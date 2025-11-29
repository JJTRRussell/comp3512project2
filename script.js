
document.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector("#mainContent");
    let productsCache = null;

    const webPages = {
        home: homePage,
        browse: browsePage,
        about: aboutPage
    };

    // https://www.artofcode.org/javascript-tutorial/how-to-build-single-page-applications-with-vanilla-javascript/
    function loadWebPage() {
        const page = window.location.hash.substring(1) || "homePage";

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
        content.innerHTML = `
            <h2>Home</h2>
        `;
    }

    function browsePage() {
        const clothingAPI = "./data-pretty.json";

        content.innerHTML = `
            <h2>Browse Products</h2>
            <div class="products-grid"></div>
        `;

        const productsGrid = document.querySelector(".products-grid");

        if (productsCache) {
            displayProducts(productsCache, productsGrid);
            //console.log(productsCache);
        } else {
            fetch(clothingAPI)
                .then(response => response.json())
                .then( data => {
                    productsCache = data;
                    //console.log(data);
                    displayProducts(data, productsGrid);
                })
                .catch(error => console.error(error));
        }

        function displayProducts(products, grid) {
            grid.innerHTML = "";
            const template = document.querySelector(".products-template");

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

                grid.appendChild(clone);
            }
        }
    }

    function aboutPage() {
        content.innerHTML = `
            <h2>Home</h2>
        `;
    }
});