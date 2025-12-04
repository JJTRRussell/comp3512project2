
document.addEventListener("DOMContentLoaded", () => {

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
                price.textContent = `$${p.price.toFixed(2)}`;
                price.value = p.price;
                const btn = clone.querySelector(".add-to-cart-btn");
                btn.textContent = "Add to Cart";
                btn.dataset.id = p.id;
                btn.dataset.name = p.name;
                btn.dataset.price = p.price;
                grid.appendChild(clone);
            }
            cartButtonEvent();
        }

        function cartItem(id, name, price, quantity){
            this.id = id;
            this.name = name;
            this.price = price;
            this.quantity = quantity;
        }

        function cartButtonEvent() {
            const buttons = document.querySelectorAll(".add-to-cart-btn");
            for (let btn of buttons){
                btn.addEventListener("click", clickHandler);
            }
        }

        function clickHandler(e) {
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

        function updateCart() {
            cartDiv.innerHTML = "";

            if (globalArray.length === 0) {
                cartDiv.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                cartItemCount.textContent = "0";
                cartValueAmount.textContent = "$0.00";
                document.querySelector("#checkoutBtn").disabled = true;
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
        }
    }

    function aboutPage() {
        content.innerHTML = `
            <h2>About Us</h2>
        `;
    }
});