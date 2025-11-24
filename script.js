const content = document.getElementById('mainContent');

mainContent.innerHTML = "";

const webPages = {
    home: `<h2>This page is currently under construction...</h2>`,
    browse: `<h2>Browse</h2>
                <h3>This page is currently under construction...</h3>`,
    about: `<h2>About us</h2>
            <h3>This page is currently under construction...</h3>`
};

function loadWebPage(webPage) {
    mainContent.innerHTML = webPages[webPage] || webPages.home;
}

window.addEventListener('hashchange', () => {
    const page = window.location.hash.substring(1);
    loadWebPage(page);
});

if (window.location.has === '') {
    loadWebPage('home');
} else {
    const page = window.location.hash.substring(1);
    loadWebPage(page);
}