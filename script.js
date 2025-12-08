
document.addEventListener("DOMContentLoaded", () => {

    const filters = [
        { name: "Product Name (A-Z)", iso: "PNAZ" },
        { name: "Product Name (Z-A)", iso: "PNZA" },
        { name: "Price ($$$-$)", iso: "PGTL" },
        { name: "Price ($-$$$)", iso: "PLTG" },
        { name: "Category (A-Z)", iso: "CAAZ" },
        { name: "Category (Z-A)", iso: "CAZA" }
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
    let shoppingCart = [];
    const cartItemCount = document.querySelector(".cart-count");
    const cartValueAmount = document.querySelector(".total-amount");
    const cartDiv = document.querySelector(".cart-items");



    const webPages = {
        home: homePage,
        browse: browsePage,
        about: aboutPage,
        cart: cartPage
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
        toggleCartPanel();
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

        const contentWindow = document.querySelector(".products-grid");
        const filterSelect = document.querySelector("#filterName");
        filterOptions(filters);
        filterTypeSelectEvent();

        if (productsCache) {
            displayProducts(productsCache, contentWindow);
        } else {
            fetch(clothingAPI)
                .then(response => response.json())
                .then(data => {
                    productsCache = data;
                    displayProducts(data, contentWindow);
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
            for (let f of filterList) {
                const option = document.createElement('option');
                option.textContent = f.name;
                option.value = f.iso;
                list.appendChild(option);
            }
        }

        function cartItem(id, name, price, quantity) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.quantity = quantity;
        }

        function addItemToCartButtonEvent() {
            const buttons = document.querySelectorAll(".add-to-cart-btn");
            for (let btn of buttons) {
                btn.addEventListener("click", addToCart);
            }
        }

        function removeItemFromCartButtonEvent() {
            const buttons = document.querySelectorAll(".remove-from-cart-btn");
            for (let btn of buttons) {
                btn.addEventListener("click", removeFromCart);
            }
        }

        function clearCartButtonEvent() {
            const buttons = document.querySelectorAll(".clear-cart-btn");
            for (let btn of buttons) {
                btn.addEventListener("click", clearCart);
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
                displayProducts(sorted, contentWindow);
            });

        }

        function addToCart(e) {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = Number(btn.dataset.price);

            let exists = shoppingCart.find(item => item.id === id);

            if (exists) {
                exists.quantity++;
            } else {
                shoppingCart.push(new cartItem(id, name, price, 1));
            }
            updateCart();
        }

        function removeFromCart(e) {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = Number(btn.dataset.price);

            let exists = shoppingCart.find(item => item.id === id);

            if (exists) {
                exists.quantity--;
                if (exists.quantity <= 0) {
                    shoppingCart = shoppingCart.filter(i => i.id !== id);
                }
            }
            updateCart();
        }

        function clearCart() {
            shoppingCart.length = 0;
            updateCart();
        }

        function updateCart() {
            cartDiv.innerHTML = "";

            if (shoppingCart.length === 0) {
                cartDiv.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                cartItemCount.textContent = "0";
                document.querySelector(".total-cart-items").textContent = 0;
                cartValueAmount.textContent = "$0.00";
                document.querySelector("#checkoutBtn").disabled = true;
                document.querySelector("#clearcartBtn").disabled = true;
                return;
            }

            let totalPrice = 0;
            let totalCount = 0;

            for (let item of shoppingCart) {
                const div2 = document.createElement("div");
                div2.classList.add("cart-item");

                div2.innerHTML = `
                    <div class="item-info">
                        <p class="item-name"> ${item.name} x ${item.quantity})</p>
                        <p class='item-price">
                            $${item.price * item.quantity.toFixed(2)}
                        </p>
                    </div>`;

                cartDiv.appendChild(div2);

                totalPrice += item.price * item.quantity;
                totalCount += item.quantity;
            }

            cartItemCount.textContent = totalCount;
            document.querySelector(".total-cart-items").textContent = totalCount;
            cartValueAmount.textContent = `$${totalPrice.toFixed(2)} `;
            document.querySelector("#checkoutBtn").disabled = false;
            document.querySelector("#clearcartBtn").disabled = false;
        }

    }

    function aboutPage() {
        content.innerHTML = `<h2> About Us</h2> `;
    }

    function cartPage() {

        const contentWindow = document.querySelector("#mainContent");
        const cartPanel = document.querySelector(".cart-panel");

        // clear content window
        contentWindow.innerHTML = '';

        // Resize Cotent Window
        contentWindow.classList.replace("col-span-5", "col-span-4");

        // Generate new Cart Panel
        cartPanel.replaceChildren(generateCartPanel());

        // Generate new Cart List Panel
        contentWindow.replaceChildren(generateCartProductList());
    }

    function toggleCartPanel() {
        const cartPanelView = document.querySelector(".cart-panel");

        let hash = window.location.hash.slice(1)

        if (hash == "cart") {
            cartPanelView.classList.remove("hidden");
        } else {
            cartPanelView.classList.add("hidden");
        }
    }

    function generateCartPanel() {
        // Select Cart Panel
        const cartPanelView = document.querySelector(".cart-panel");
        cartPanelView.innerHTML = "";

        // Create Order Summary inpsired by Default Flowbite Shopping Cart
        // https://flowbite.com/blocks/e-commerce/shopping-cart/
        const template = document.querySelector(".order-summary-template");
        const newSummary = template.content.cloneNode(true);

        // Generate cart totals
        const totalPrice = calculateTotalCartPrice();

        // Alberta Tax
        // Should be replaced by better functionality later on
        const albertaTax = 0.05;

        let totalTax = totalPrice * albertaTax;

        newSummary.querySelector("#cart-total-amount").textContent = `$${totalPrice}`;

        newSummary.querySelector("#tax-amount").textContent = `$${totalTax.toFixed(2)}`;

        newSummary.querySelector("#cart-final-price").textContent =
            `$${(Number(totalPrice) + Number(totalTax)).toFixed(2)}`

        return newSummary;
    }

    function calculateTotalCartPrice() {
        let cartTotalPrice = 0;

        if (shoppingCart.length > 0) {
            for (let item of shoppingCart) {
                cartTotalPrice += item.price * item.quantity;
            }
        }

        return cartTotalPrice.toFixed(2);
    }
    function generateCartProductList() {

        const itemTemplate = document.querySelector(".cart-item-template");
        const newItem = itemTemplate.content.cloneNode(true);

        // Empty Cart Check
        if (shoppingCart.length == 0) {
            newItem.querySelector(".cart-item").innerHTML = `
                <div class="empty-cart-msg text-center">
                <p>Your Cart is Empty.</p>
                </div>`;
        }

        return newItem
    }
});