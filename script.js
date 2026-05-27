document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZAÇÃO DA BIBLIOTECA DE ANIMAÇÃO (AOS) ---
    AOS.init({
        duration: 800,
        once: true,
    });


    // --- LÓGICA DO MENU HAMBÚRGUER (MOBILE) ---
    const menuHamburguer = document.getElementById('menu-hamburguer');
    const menuLista = document.getElementById('menu-lista');
    const menuLinks = document.querySelectorAll('.menu-link');

    const toggleMenu = () => {
        menuLista.classList.toggle('aberto');
        menuHamburguer.classList.toggle('aberto');
    };

    if (menuHamburguer) {
        menuHamburguer.addEventListener('click', toggleMenu);
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuLista.classList.contains('aberto')) {
                toggleMenu();
            }
        });
    });


    // --- LÓGICA DO FORMULÁRIO DE CONTATO ---
    const formulario = document.getElementById('formulario');

    const enviarWPP = (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const mensagem = document.getElementById('mensagem').value.trim();
        const telefone = '5567993379089';

        if (nome === "" || mensagem === "") {
            alert("Por favor, preencha todos os campos antes de enviar.");
            return;
        }

        const texto = `Olá, meu nome é *${nome}* e gostaria de dizer o seguinte: ${mensagem}`;
        const msgFormatada = encodeURIComponent(texto);

        const url = `https://wa.me/${telefone}?text=${msgFormatada}`;

        window.open(url, '_blank');

        formulario.reset();
    };

    if (formulario) {
        formulario.addEventListener('submit', enviarWPP);
    }



});
