
document.addEventListener("DOMContentLoaded", () => {

    const filters = [
        {name: "Product Name (A-Z)", iso: "PNAZ"},
        {name: "Product Name (Z-A)", iso: "PNZA"},
        {name: "Price ($$$-$)", iso: "PGTL"},
        {name: "Price ($-$$$)", iso: "PLTG"},
        {name: "Category (A-Z)", iso: "CAAZ"},
        {name: "Category (Z-A)", iso: "CAZA"}
    ];
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    const sorts = {
        PNAZ: (a, b) => a.name.localeCompare(b.name),
        PNZA: (a, b) => b.name.localeCompare(a.name),
        PGTL: (a, b) => b.price - a.price,
        PLTG: (a, b) => a.price - b.price,
        CAAZ: (a, b) => a.category.localeCompare(b.category),
        CAZA: (a, b) => b.category.localeCompare(a.category)
    };
    const content = document.querySelector("#mainContent");
    const template = document.querySelector(".products-template");
    let productsCache = null;
    let globalArray = [];
    const cartItemCount = document.querySelector(".cart-count");
    const cartValueAmount = document.querySelector(".total-amount");
    const cartDiv = document.querySelector(".cart-items");

    const webPages = {
        home: homePage,
        browse: browsePage,
        about: aboutPage
    };

    // https://www.artofcode.org/javascript-tutorial/how-to-build-single-page-applications-with-vanilla-javascript/
    function loadWebPage() {
        let page = window.location.hash.substring(1);

        if (!page) page = "home";

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
            <h3>Filter Type</h3>
            <select id="filterName"></select>
            <div class="products-grid"></div>
        `;

        const productsGrid = document.querySelector(".products-grid");
        const filterSelect = document.querySelector("#filterName");
        filterOptions(filters);
        filterTypeSelectEvent();

        if (productsCache) {
            displayProducts(productsCache, productsGrid);
        } else {
            fetch(clothingAPI)
                .then(response => response.json())
                .then( data => {
                    productsCache = data;
                    displayProducts(data, productsGrid);
                })
                .catch(error => console.error(error));
        }

        function displayProducts(products, grid) {
            grid.innerHTML = "";

            for (let p of products) {

                const clone = template.content.cloneNode(true);
                const name = clone.querySelector(".product-name");
                name.textContent = p.name;
                name.value = p.id;
                const description = clone.querySelector(".product-description");
                description.textContent = p.description;
                const price = clone.querySelector(".product-price");
                price.textContent = `$${p.price.toFixed(2)}`;
                price.value = p.price;
                const btn = clone.querySelector(".add-to-cart-btn");
                const btn2 = clone.querySelector(".remove-from-cart-btn");
                btn.textContent = "Add to Cart";
                btn2.textContent = "Remove from Cart";
                btn.dataset.id = p.id;
                btn2.dataset.id = p.id;
                btn.dataset.name = p.name;
                btn2.dataset.name = p.name;
                btn.dataset.price = p.price;
                btn2.dataset.price = p.price;
                grid.appendChild(clone);
            }
            addItemToCartButtonEvent();
            removeItemFromCartButtonEvent();
            clearCartButtonEvent();
        }

        function filterOptions(filterList) {
            const list = document.querySelector("#filterName");
            list.replaceChildren();
            const blank = document.createElement("option");
            blank.textContent = "Select a Filter";
            blank.value = "";
            list.appendChild(blank);
            for (let f of filterList){
                const option = document.createElement('option');
                option.textContent = f.name;
                option.value = f.iso;
                list.appendChild(option);
            }
        }

        function cartItem(id, name, price, quantity){
            this.id = id;
            this.name = name;
            this.price = price;
            this.quantity = quantity;
        }

        function addItemToCartButtonEvent() {
            const buttons = document.querySelectorAll(".add-to-cart-btn");
            for (let btn of buttons){
                btn.addEventListener("click", cartClickHandler);
            }
        }

        function removeItemFromCartButtonEvent() {
            const buttons = document.querySelectorAll(".remove-from-cart-btn");
            for (let btn of buttons){
                btn.addEventListener("click", cartClickHandler2);
            }
        }

        function clearCartButtonEvent() {
            const buttons = document.querySelectorAll(".clear-cart-btn");
            for (let btn of buttons){
                btn.addEventListener("click", cartClickHandler3);
            }
        }

        function filterTypeSelectEvent() {
            filterSelect.addEventListener('change', () => {

                if (!productsCache) return;

                const selected = filterSelect.value;
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
                let sorted = [...productsCache];

                if (sorts[selected]) {
                    sorted.sort(sorts[selected]);
                }
                displayProducts(sorted, productsGrid);
            });

        }

        function cartClickHandler(e) {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = Number(btn.dataset.price);

            let exists = globalArray.find(item => item.id === id);

            if (exists) {
                exists.quantity++;
            }else {
                globalArray.push(new cartItem(id, name, price, 1));
            }
            updateCart();
        }

        function cartClickHandler2(e) {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = Number(btn.dataset.price);

            let exists = globalArray.find(item => item.id === id);

            if (exists) {
                exists.quantity--;
                if (exists.quantity <= 0) {
                    globalArray = globalArray.filter(i => i.id !== id);
                }
            }
            updateCart();
        }

        function cartClickHandler3() {
            globalArray.length = 0;
            updateCart();
        }

        function updateCart() {
            cartDiv.innerHTML = "";

            if (globalArray.length === 0) {
                cartDiv.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                cartItemCount.textContent = "0";
                cartValueAmount.textContent = "$0.00";
                document.querySelector("#checkoutBtn").disabled = true;
                document.querySelector("#clearcartBtn").disabled = true;
                return;
            }

            let totalPrice = 0;
            let totalCount = 0;

            for (let glo of globalArray) {
                const div2 = document.createElement("div");
                div2.classList.add("cart-item");

                div2.innerHTML = `
                    <div class="item-info">
                        <p class="item-name">${glo.name} x ${glo.quantity}</p>
                        <p class='item-price">$${(glo.price * glo.quantity).toFixed(2)}</p>
                    </div>
                `;

                cartDiv.appendChild(div2);

                totalPrice += glo.price * glo.quantity;
                totalCount += glo.quantity;
            }

            cartItemCount.textContent = totalCount;
            cartValueAmount.textContent = `$${totalPrice.toFixed(2)}`;
            document.querySelector("#checkoutBtn").disabled = false;
            document.querySelector("#clearcartBtn").disabled = false;
        }
    }

    function aboutPage() {
        content.innerHTML = `
            <h2>About Us</h2>
        `;
    }
});