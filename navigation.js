function navigateTo(route) {
    history.pushState({}, route, route);
    loadContent(route);
}

function loadContent(route) {
    fetch(route)
        .then(response => response.text())
        .then(html => {
            document.body.innerHTML = html;
        })
        .catch(error => console.error('Error loading page: ', error));
}

document.getElementById('btnNewTest').addEventListener('click', function(event) {
    event.preventDefault();
    navigateTo('./p/test');
});

document.getElementById('btnGoToTests').addEventListener('click', function(event) {
    event.preventDefault();
    navigateTo('./p/materia');
});

document.getElementById('btnAccount').addEventListener('click', function(event) {
    event.preventDefault();
    navigateTo('./p/conta');
});

window.onload = function () {
    const path = window.location.pathname;
    loadContent(path);
    window.onpopstate = function () {
        loadContent(window.location.href);
    };
};