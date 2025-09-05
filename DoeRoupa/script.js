// Simulação de banco de dados
let users = [];
let donations = [];
let currentUser = null;

// Dados de exemplo
const sampleDonations = [
    {
        id: 1,
        title: 'Camisa Social Azul',
        category: 'masculina',
        size: 'M',
        brand: 'Aramis',
        condition: 'seminovo',
        description: 'Camisa social azul claro, muito bem conservada, ideal para trabalho',
        location: 'São Paulo, SP',
        donor: 'João Silva',
        date: new Date()
    },
    {
        id: 2,
        title: 'Vestido Floral Infantil',
        category: 'infantil',
        size: 'P',
        brand: 'Lilica Ripilica',
        condition: 'usado',
        description: 'Vestido com estampa floral, muito fofo para meninas de 4-6 anos',
        location: 'Rio de Janeiro, RJ',
        donor: 'Maria Santos',
        date: new Date()
    },
    {
        id: 3,
        title: 'Blusa de Tricot Rosa',
        category: 'feminina',
        size: 'G',
        brand: 'Zara',
        condition: 'novo',
        description: 'Blusa de tricot rosa, nunca usada, ainda com etiqueta',
        location: 'Belo Horizonte, MG',
        donor: 'Ana Costa',
        date: new Date()
    }
];

donations = [...sampleDonations];

// Gerenciamento de modais
window.openModal = function(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Navegação entre páginas
window.showHome = function() {
    hideAllPages();
    document.getElementById('homePage').style.display = 'block';
}

window.showDonations = function() {
    hideAllPages();
    document.getElementById('donationsPage').style.display = 'block';
    displayDonations();
    updateLoginHint();
}

window.showAbout = function() {
    alert('Sobre nós: Somos uma plataforma dedicada a conectar doadores e pessoas em necessidade, promovendo a solidariedade através da doação de roupas.');
}

window.filterDonations = function(category) {
    // Se não estiver na página de doações, vai para ela
    if (document.getElementById('donationsPage').style.display === 'none') {
        showDonations();
    }
    
    // Aplica o filtro
    displayDonations(category);
    
    // Atualiza o select se necessário
    const filterSelect = document.getElementById('categoryFilter');
    if (filterSelect && category !== undefined) {
        filterSelect.value = category;
    }
}

window.showUserDashboard = function() {
    hideAllPages();
    document.getElementById('userDashboard').classList.add('active');
    document.getElementById('userDashboard').style.display = 'block';
    updateDashboardStats();
}

window.showDashboardTab = function(tabName) {
    // Oculta todas as abas
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove classe active dos botões
    const buttons = document.querySelectorAll('.dashboard-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mostra a aba selecionada
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Adiciona classe active ao botão clicado
    const clickedButton = Array.from(buttons).find(btn => btn.textContent.toLowerCase().includes(tabName.toLowerCase()) || 
        (tabName === 'stats' && btn.textContent === 'Estatísticas') ||
        (tabName === 'myDonations' && btn.textContent === 'Minhas Doações') ||
        (tabName === 'newDonation' && btn.textContent === 'Nova Doação'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    if (tabName === 'myDonations') {
        displayUserDonations();
    }
}

window.logout = function() {
    currentUser = null;
    document.querySelector('.auth-buttons').style.display = 'flex';
    
    // Remove botão do usuário
    const userButton = document.querySelector('nav .container > div:last-child');
    if (userButton && userButton.querySelector('button')) {
        userButton.remove();
    }

    // Atualiza a página de doações se estiver visível
    refreshDonationsView();

    showHome();
}

window.contactDonor = function(donationId) {
    // Verifica se o usuário está logado
    if (!currentUser) {
        if (confirm('Você precisa estar logado para solicitar uma roupa. Deseja fazer login agora?')) {
            openModal('loginModal');
        }
        return;
    }

    const donation = donations.find(d => d.id === donationId);
    if (donation) {
        alert(`Solicitação enviada! O doador ${donation.donor} receberá sua mensagem sobre "${donation.title}". Em breve você receberá o contato para combinar a retirada.`);
    }
}

window.removeDonation = function(donationId) {
    if (confirm('Tem certeza que deseja remover esta doação?')) {
        donations = donations.filter(d => d.id !== donationId);
        displayUserDonations();
        updateDashboardStats();
        alert('Doação removida com sucesso!');
    }
}

function hideAllPages() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
}

// Atualiza as doações quando o usuário faz login/logout para refletir mudanças no botão
function refreshDonationsView() {
    if (document.getElementById('donationsPage').style.display !== 'none') {
        const currentFilter = document.getElementById('categoryFilter').value;
        displayDonations(currentFilter);
        updateLoginHint();
    }
}

function updateLoginHint() {
    const loginHint = document.getElementById('loginHint');
    if (loginHint) {
        loginHint.style.display = currentUser ? 'none' : 'block';
    }
}

function login(user) {
    currentUser = user;
    document.getElementById('userName').textContent = user.name;
    
    // Oculta botões de auth e mostra dashboard
    document.querySelector('.auth-buttons').style.display = 'none';
    
    // Adiciona botão do usuário
    const userButton = document.createElement('div');
    userButton.innerHTML = `<button class="btn btn-primary" onclick="showUserDashboard()">${user.name}</button>`;
    document.querySelector('nav .container').appendChild(userButton);

    updateDashboardStats();
    
    // Atualiza a página de doações se estiver visível
    refreshDonationsView();
}

function updateDashboardStats() {
    if (!currentUser) return;

    const userDonations = donations.filter(d => d.donor === currentUser.name);
    document.getElementById('totalDonations').textContent = userDonations.length;
    document.getElementById('helpedPeople').textContent = userDonations.length * 2; // Estimativa
    document.getElementById('activeDonations').textContent = userDonations.length;
}

// Exibição de doações
function displayDonations(filter = '') {
    const grid = document.getElementById('donationsGrid');
    const filteredDonations = filter ? 
        donations.filter(d => d.category === filter) : 
        donations;

    if (filteredDonations.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem; color: #666;">Nenhuma doação encontrada nesta categoria no momento.</p>';
        return;
    }

    grid.innerHTML = filteredDonations.map(donation => `
        <div class="donation-card">
            <div class="donation-image">👕</div>
            <div class="donation-info">
                <h4>${donation.title}</h4>
                <div class="donation-details">
                    <span class="detail-tag">📏 ${donation.size}</span>
                    <span class="detail-tag">🏷️ ${donation.brand || 'Sem marca'}</span>
                    <span class="detail-tag">⭐ ${donation.condition}</span>
                    <span class="detail-tag">📅 ${donation.category}</span>
                </div>
                <p style="margin: 1rem 0;">${donation.description}</p>
                <p><strong>📍 ${donation.location}</strong></p>
                <p><small>Por: ${donation.donor}</small></p>
                <button class="btn btn-primary" onclick="contactDonor(${donation.id})" style="margin-top: 1rem;">
                    ${currentUser ? 'Solicitar Roupa' : 'Solicitar Roupa (Login necessário)'}
                </button>
            </div>
        </div>
    `).join('');
}

function displayUserDonations() {
    if (!currentUser) return;

    const grid = document.getElementById('userDonationsGrid');
    const userDonations = donations.filter(d => d.donor === currentUser.name);

    if (userDonations.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Você ainda não fez nenhuma doação. Que tal cadastrar uma nova?</p>';
        return;
    }

    grid.innerHTML = userDonations.map(donation => `
        <div class="donation-card">
            <div class="donation-image">👕</div>
            <div class="donation-info">
                <h4>${donation.title}</h4>
                <div class="donation-details">
                    <span class="detail-tag">📏 ${donation.size}</span>
                    <span class="detail-tag">🏷️ ${donation.brand || 'Sem marca'}</span>
                    <span class="detail-tag">⭐ ${donation.condition}</span>
                </div>
                <p>${donation.description}</p>
                <p><strong>📍 ${donation.location}</strong></p>
                <p><small>Cadastrada em: ${donation.date.toLocaleDateString()}</small></p>
                <button class="btn btn-secondary" onclick="removeDonation(${donation.id})">
                    Remover
                </button>
            </div>
        </div>
    `).join('');
}

// Event listeners e inicialização
document.addEventListener('DOMContentLoaded', function() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => closeModal(modal.id);
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        };
    });

    // Carrega doações iniciais
    displayDonations();

    // Event listeners para formulários
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        // Verifica se o e-mail já existe
        if (users.find(user => user.email === email)) {
            alert('Este e-mail já está cadastrado!');
            return;
        }

        const newUser = {
            id: users.length + 1,
            name,
            email,
            phone,
            password,
            donations: []
        };

        users.push(newUser);
        alert('Cadastro realizado com sucesso!');
        closeModal('registerModal');
        this.reset();
    });

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            login(user);
            closeModal('loginModal');
            this.reset();
        } else {
            alert('E-mail ou senha incorretos!');
        }
    });

    document.getElementById('donationForm').addEventListener('submit', function(e) {
        e.preventDefault();

        if (!currentUser) {
            alert('Você precisa estar logado para fazer uma doação!');
            return;
        }

        const newDonation = {
            id: donations.length + 1,
            title: document.getElementById('donationTitle').value,
            category: document.getElementById('donationCategory').value,
            size: document.getElementById('donationSize').value,
            brand: document.getElementById('donationBrand').value,
            condition: document.getElementById('donationCondition').value,
            description: document.getElementById('donationDescription').value,
            location: document.getElementById('donationLocation').value,
            donor: currentUser.name,
            date: new Date()
        };

        donations.push(newDonation);
        alert('Doação cadastrada com sucesso!');
        this.reset();
        updateDashboardStats();
        displayUserDonations();
    });
});