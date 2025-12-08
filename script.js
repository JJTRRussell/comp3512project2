// This is the DOMContentLoaded event listener, ensuring nothing is done until the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // This object groups the clothing categories so specific pictures will load for them
    const images = {
        "accessories": "./images/accessories.jpg",
        "bottoms": "./images/pants.jpg",
        "dresses": "./images/dresses.jpg",
        "intimates": "./images/underwear.jpg",
        "jumpsuits": "./images/jumpsuit.jpg",
        "loungewear": "./images/loungwear2.jpg",
        "outerwear": "./images/outerwear.jpg",
        "shoes": "./images/shoes.jpg",
        "sweaters": "./images/sweaters2.jpg",
        "swimwear": "./images/swimwear.jpg",
        "tops": "./images/shirts2.jpg"
    };

    // This array lists the different sorting types that will be used
    const sorting = [
        {name: "Product Name (A-Z)", iso: "PNAZ"},
        {name: "Product Name (Z-A)", iso: "PNZA"},
        {name: "Price ($$$-$)", iso: "PGTL"},
        {name: "Price ($-$$$)", iso: "PLTG"},
        {name: "Category (A-Z)", iso: "CAAZ"},
        {name: "Category (Z-A)", iso: "CAZA"}
    ];

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    // This object organizes and stores the different sorting functions that will be called on when selected
    const sorts = {
        PNAZ: (a, b) => a.name.localeCompare(b.name),
        PNZA: (a, b) => b.name.localeCompare(a.name),
        PGTL: (a, b) => b.price - a.price,
        PLTG: (a, b) => a.price - b.price,
        CAAZ: (a, b) => a.category.localeCompare(b.category),
        CAZA: (a, b) => b.category.localeCompare(a.category)
    };

    // The main variables which will be referenced globally
    const content = document.querySelector("#mainContent");
    const template = document.querySelector(".products-template");
    let productsCache = null;
    let shoppingCart = [];
    const cartItemCount = document.querySelector(".cart-count");
    const cartValueAmount = document.querySelector(".total-amount");
    const cartDiv = document.querySelector(".cart-items");

    // This object organizes and stores the different pages that the user can switch between
    const webPages = {
        home: homePage,
        browse: browsePage,
        about: aboutPage,
        cart: cartPage
    };

    // https://www.artofcode.org/javascript-tutorial/how-to-build-single-page-applications-with-vanilla-javascript/
    // This is the website router which switches between the different views based on which URL hash address is clicked
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
    // This event listener is what looks out for a change in the URL hash link
    window.addEventListener("hashchange", loadWebPage);
    loadWebPage();

    // The home page view
    function homePage() {
        content.innerHTML = `
            <h2>Home</h2>
        `;

        const aside = document.querySelector(".department-Panel");
        if (aside) {
            aside.style.display = 'none';
        }
    }

    // The browse page view
    function browsePage() {
        const clothingAPI = "./data-pretty.json";

        content.innerHTML = `
            <h2>Browse Products</h2>
            <h3>Sort Type</h3>
            <select id="sortType"></select>
            <div class="products-grid"></div>
        `;
        const aside = document.querySelector(".department-Panel");
        if (aside) {
            aside.style.display = 'block';
        }
        const productsGrid = document.querySelector(".products-grid");
        const sortingSelect = document.querySelector("#sortType");
        sortOptions(sorting);
        sortTypeSelectEvent();
        filterTypeSelectEvent();

        // This is the fetch call, it first looks for a saved cache, if none exists then it fetches the API data
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

        // This function is where each product will be rendered and displayed using a template
        function displayProducts(products, grid) {
            grid.innerHTML = "";

            for (let p of products) {
                
                const clone = template.content.cloneNode(true);
                const picture = clone.querySelector(".product-img");
                const img = document.createElement("img");
                const category = p.category.toLowerCase();
                img.src = images[category];
                img.alt = p.name;
                picture.appendChild(img);
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

        // This function creates a sort drop down list to sort the products in various ways
        function sortOptions(sortList) {
            const list = document.querySelector("#sortType");
            list.replaceChildren();
            const blank = document.createElement("option");
            blank.textContent = "Select a Sort Type";
            blank.value = "";
            list.appendChild(blank);
            for (let s of sortList){
                const option = document.createElement('option');
                option.textContent = s.name;
                option.value = s.iso;
                list.appendChild(option);
            }
        }

        // This function allows the creation of new items to go into the cart
        function cartItem(id, name, price, quantity){
            this.id = id;
            this.name = name;
            this.price = price;
            this.quantity = quantity;
        }

        // This event listener watches for an item to be added to the cart
        function addItemToCartButtonEvent() {
            const buttons = document.querySelectorAll(".add-to-cart-btn");
            for (let btn of buttons) {
                btn.addEventListener("click", addToCart);
            }
        }

        // This event listener watches for an item to be removed form the cart
        function removeItemFromCartButtonEvent() {
            const buttons = document.querySelectorAll(".remove-from-cart-btn");
            for (let btn of buttons) {
                btn.addEventListener("click", removeFromCart);
            }
        }

        // This event listener watches for all items to be cleared from the cart
        function clearCartButtonEvent() {
            const buttons = document.querySelectorAll(".clear-cart-btn");
            for (let btn of buttons) {
                btn.addEventListener("click", clearCart);
            }
        }

        // This function first watches for a sort to be selected, then checks if it exists in cache, then gets
        // the ISO sort code, then creates an expanded copy of the products array, then it sorts the array copy 
        // based on the sort that was selected, finally it renders and displays the new sorted products list
        function sortTypeSelectEvent() {
            sortingSelect.addEventListener('change', () => {

                if (!productsCache) return;

                const selected = sortingSelect.value;
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
                let sorted = [...productsCache];

                if (sorts[selected]) {
                    sorted.sort(sorts[selected]);
                }
                displayProducts(sorted, contentWindow);
            });

        }

        // This event listener watches for any filter type being selected and then re-renders the products list
        // and displays the new filtered list
        function filterTypeSelectEvent() {
            document.querySelectorAll(".filter-gender, .filter-category, .filter-size, .filter-colour").forEach(p => {
                p.addEventListener('change', () => {
                    const filters = selectedFilters();
                    const filtered = filteredProducts(productsCache, filters);
                    displayProducts(filtered, productsGrid);
                });
            });
        }

        // This function allows the user to add an item to the cart, it checks to see if it was already selected,
        // otherwise adds the new item to the cart
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

        // This function allows the user to remove an item from the cart, it checks to see if its already in the cart,
        // otherwise it removes the item from the cart
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

        // This function removes all items from the cart
        function clearCart() {
            shoppingCart.length = 0;
            updateCart();
        }

        // This function re-renders and displays the products cart if an item was added or removed,
        // it first checks if there is nothing, if there is something then re-displays the products
        // that were changed
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

        // This function first finds all checkboxes that are checked in a Nodelist, then converts it into an
        // array so the map function can be used to check the value of what checkbox was checked, then returns
        // an object containing what was checked so the filteredProducts function can use it
        function selectedFilters() {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
            // https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:checked
            const genders = Array.from(document.querySelectorAll(".filter-gender:checked")).map(p => p.value);
            const categories = Array.from(document.querySelectorAll(".filter-category:checked")).map(p => p.value);
            const sizes = Array.from(document.querySelectorAll(".filter-size:checked")).map(p => p.value);
            const colours = Array.from(document.querySelectorAll(".filter-colour:checked")).map(p => p.value);
            
            return {genders, categories, sizes, colours};
        }

        // This function takes the product list and applies the checkbox filters that were selected using filter() to return 
        // only those products which match the chosen filters, if nothing was chosen then that particular filter 
        // returns false and is skipped
        function filteredProducts(products, filters) {
            return products.filter(p => {
                const gender = p.gender.toLowerCase();
                const category = p.category.toLowerCase();
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
                if (filters.genders.length > 0 && !filters.genders.includes(gender))
                    return false;
                if (filters.categories.length > 0 && !filters.categories.includes(category))
                    return false;
                // Because sizes and colours have many different choices, the some() function is used to check if
                // the product list has any of the sizes or colours the user has chosen
                if (filters.sizes.length > 0) {
                    const tempSizes = p.sizes.map(s => s.toLowerCase());
                    if (!tempSizes.some(size => filters.sizes.includes(size)))
                        return false;
                }
                if (filters.colours.length > 0) {
                    const tempColours = p.color.map(c => c.name.toLowerCase());
                    if (!tempColours.some(colour => filters.colours.includes(colour)))
                        return false;
                }

                return true;
            });
        }
    }

    // The about page view
    function aboutPage() {
        content.innerHTML = `
            <h2>About Us</h2>
        `;
        
        const aside = document.querySelector(".department-Panel");
        if (aside) {
            aside.style.display = 'none';
        }
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