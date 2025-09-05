// Simulação de banco de dados
let users = [];
let donations = [];
let requests = []; // Novas solicitações
let currentUser = null;

// Dados de exemplo com tipos de usuário
const sampleUsers = [
    {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        password: '123456',
        userType: 'doador'
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(21) 88888-8888',
        password: '123456',
        userType: 'receptor'
    },
    {
        id: 3,
        name: 'Ana Costa',
        email: 'ana@email.com',
        phone: '(31) 77777-7777',
        password: '123456',
        userType: 'ambos'
    }
];

users = [...sampleUsers];

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
        donorId: 1,
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
        donorId: 2,
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
        donorId: 3,
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
    createDashboardNavigation();
    updateDashboardStats();
    showDashboardTab('stats');
}

window.toggleUserMenu = function() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

window.showProfile = function() {
    hideAllPages();
    document.getElementById('userDashboard').classList.add('active');
    document.getElementById('userDashboard').style.display = 'block';
    createDashboardNavigation();
    showDashboardTab('profile');
    loadProfileData();
}

window.showDashboardTab = function(tabName) {
    // Oculta todas as abas
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove classe active dos botões
    const buttons = document.querySelectorAll('.dashboard-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mostra a aba selecionada
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    // Adiciona classe active ao botão clicado
    const clickedButton = Array.from(buttons).find(btn => 
        btn.onclick && btn.onclick.toString().includes(tabName)
    );
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Carrega conteúdo específico da aba
    switch(tabName) {
        case 'myDonations':
            displayUserDonations();
            break;
        case 'stats':
            updateDashboardStats();
            break;
        case 'requests':
            displayReceivedRequests();
            break;
        case 'myRequests':
            displayMyRequests();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

window.logout = function() {
    currentUser = null;
    document.querySelector('.auth-buttons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    
    // Fecha dropdown se estiver aberto
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.remove('active');

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

    // Verifica se é um receptor ou ambos
    if (currentUser.userType === 'doador') {
        alert('Apenas receptores podem solicitar roupas. Altere seu tipo de conta no perfil para "Receptor" ou "Ambos".');
        return;
    }

    const donation = donations.find(d => d.id === donationId);
    if (donation) {
        // Cria uma solicitação
        const newRequest = {
            id: requests.length + 1,
            donationId: donationId,
            requesterId: currentUser.id,
            requesterName: currentUser.name,
            requesterPhone: currentUser.phone,
            donorName: donation.donor,
            donationTitle: donation.title,
            status: 'pendente',
            date: new Date()
        };
        
        requests.push(newRequest);
        alert(`Solicitação enviada! O doador ${donation.donor} receberá sua mensagem sobre "${donation.title}". Aguarde o contato para combinar a retirada.`);
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

// Função para carregar dados do perfil
function loadProfileData() {
    if (!currentUser) return;
    
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone;
    document.getElementById('profileUserType').value = currentUser.userType;
}

// Função para criar navegação dinâmica baseada no tipo de usuário
function createDashboardNavigation() {
    if (!currentUser) return;

    const navContainer = document.getElementById('dashboardNav');
    const userType = currentUser.userType;
    
    let navButtons = ['<button class="active" onclick="showDashboardTab(\'stats\')">📊 Estatísticas</button>'];
    
    // Adiciona abas específicas baseadas no tipo de usuário
    if (userType === 'doador' || userType === 'ambos') {
        navButtons.push('<button onclick="showDashboardTab(\'myDonations\')">🎁 Minhas Doações</button>');
        navButtons.push('<button onclick="showDashboardTab(\'newDonation\')">➕ Nova Doação</button>');
        navButtons.push('<button onclick="showDashboardTab(\'requests\')">📋 Solicitações</button>');
    }
    
    if (userType === 'receptor' || userType === 'ambos') {
        navButtons.push('<button onclick="showDashboardTab(\'myRequests\')">🤝 Minhas Solicitações</button>');
    }
    
    navButtons.push('<button onclick="showDashboardTab(\'profile\')">👤 Perfil</button>');
    
    navContainer.innerHTML = navButtons.join('');
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
    
    // Atualiza interface
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userNameBtn').textContent = user.name;
    
    // Mostra badge do tipo de usuário
    const userTypeBadge = document.getElementById('userTypeDisplay');
    const typeLabels = {
        'doador': '🎁 Doador',
        'receptor': '🤝 Receptor',
        'ambos': '❤️ Ambos'
    };
    userTypeBadge.textContent = typeLabels[user.userType];
    
    // Atualiza descrição do dashboard
    const descriptions = {
        'doador': 'Gerencie suas doações e ajude pessoas em necessidade',
        'receptor': 'Encontre roupas que você precisa na nossa comunidade',
        'ambos': 'Doe, receba e faça parte da nossa rede de solidariedade'
    };
    document.getElementById('dashboardDescription').textContent = descriptions[user.userType];
    
    // Oculta botões de auth e mostra menu do usuário
    document.querySelector('.auth-buttons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'block';

    updateDashboardStats();
    
    // Atualiza a página de doações se estiver visível
    refreshDonationsView();
}

function updateDashboardStats() {
    if (!currentUser) return;

    const statsGrid = document.getElementById('statsGrid');
    const userType = currentUser.userType;
    const userDonations = donations.filter(d => d.donor === currentUser.name);
    const userRequests = requests.filter(r => r.requesterId === currentUser.id);
    
    let statsCards = [];
    
    // Estatísticas para doadores
    if (userType === 'doador' || userType === 'ambos') {
        statsCards.push(`
            <div class="stat-card">
                <div class="stat-number">${userDonations.length}</div>
                <div>Doações Feitas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${userDonations.length * 2}</div>
                <div>Pessoas Ajudadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${requests.filter(r => userDonations.find(d => d.id === r.donationId)).length}</div>
                <div>Solicitações Recebidas</div>
            </div>
        `);
    }
    
    // Estatísticas para receptores
    if (userType === 'receptor' || userType === 'ambos') {
        statsCards.push(`
            <div class="stat-card">
                <div class="stat-number">${userRequests.length}</div>
                <div>Solicitações Feitas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${userRequests.filter(r => r.status === 'aprovado').length}</div>
                <div>Roupas Recebidas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${donations.length}</div>
                <div>Doações Disponíveis</div>
            </div>
        `);
    }
    
    statsGrid.innerHTML = statsCards.join('');
}

// Função para exibir solicitações recebidas (para doadores)
function displayReceivedRequests() {
    if (!currentUser) return;
    
    const userDonations = donations.filter(d => d.donor === currentUser.name);
    const receivedRequests = requests.filter(r => 
        userDonations.find(d => d.id === r.donationId)
    );
    
    const requestsList = document.getElementById('requestsList');
    
    if (receivedRequests.length === 0) {
        requestsList.innerHTML = '<p style="text-align: center; color: #666;">Ainda não há solicitações para suas doações.</p>';
        return;
    }
    
    requestsList.innerHTML = receivedRequests.map(request => `
        <div class="donation-card">
            <h4>${request.donationTitle}</h4>
            <p><strong>Solicitante:</strong> ${request.requesterName}</p>
            <p><strong>Telefone:</strong> ${request.requesterPhone}</p>
            <p><strong>Status:</strong> ${request.status}</p>
            <p><strong>Data:</strong> ${request.date.toLocaleDateString()}</p>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="approveRequest(${request.id})" style="margin-right: 0.5rem;">
                    Aprovar
                </button>
                <button class="btn btn-secondary" onclick="rejectRequest(${request.id})">
                    Recusar
                </button>
            </div>
        </div>
    `).join('');
}

// Função para exibir minhas solicitações (para receptores)
function displayMyRequests() {
    if (!currentUser) return;
    
    const myRequests = requests.filter(r => r.requesterId === currentUser.id);
    const requestsList = document.getElementById('myRequestsList');
    
    if (myRequests.length === 0) {
        requestsList.innerHTML = '<p style="text-align: center; color: #666;">Você ainda não fez nenhuma solicitação.</p>';
        return;
    }
    
    requestsList.innerHTML = myRequests.map(request => `
        <div class="donation-card">
            <h4>${request.donationTitle}</h4>
            <p><strong>Doador:</strong> ${request.donorName}</p>
            <p><strong>Status:</strong> 
                <span style="padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem; 
                    ${request.status === 'aprovado' ? 'background: #d4edda; color: #155724;' : 
                      request.status === 'recusado' ? 'background: #f8d7da; color: #721c24;' : 
                      'background: #fff3cd; color: #856404;'}">
                    ${request.status === 'pendente' ? 'Aguardando' : 
                      request.status === 'aprovado' ? 'Aprovado' : 'Recusado'}
                </span>
            </p>
            <p><strong>Solicitada em:</strong> ${request.date.toLocaleDateString()}</p>
        </div>
    `).join('');
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

// Funções para aprovar/recusar solicitações
window.approveRequest = function(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (request) {
        request.status = 'aprovado';
        alert(`Solicitação aprovada! O contato de ${request.requesterName} é ${request.requesterPhone}.`);
        displayReceivedRequests();
    }
}

window.rejectRequest = function(requestId) {
    const request = requests.find(r => r.id === requestId);
    if (request) {
        request.status = 'recusado';
        alert('Solicitação recusada.');
        displayReceivedRequests();
    }
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
        const userType = document.getElementById('registerUserType').value;
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
            userType,
            password
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

        // Verifica se é um doador ou ambos
        if (currentUser.userType === 'receptor') {
            alert('Apenas doadores podem cadastrar doações. Altere seu tipo de conta no perfil para "Doador" ou "Ambos".');
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
            donorId: currentUser.id,
            date: new Date()
        };

        donations.push(newDonation);
        alert('Doação cadastrada com sucesso!');
        this.reset();
        updateDashboardStats();
        displayUserDonations();
    });

    // Event listener para atualização de perfil
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) return;
        
        // Atualiza dados do usuário atual
        currentUser.phone = document.getElementById('profilePhone').value;
        currentUser.userType = document.getElementById('profileUserType').value;
        
        // Atualiza no array de usuários
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...currentUser };
        }
        
        // Atualiza interface
        login(currentUser);
        
        alert('Perfil atualizado com sucesso!');
    });

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        const userMenu = document.getElementById('userMenu');
        const dropdown = document.getElementById('userDropdown');
        
        if (userMenu && !userMenu.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});