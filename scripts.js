// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');
const dropdowns = document.querySelectorAll('.dropdown');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    mainMenu.classList.toggle('active');
});

// Mobile Dropdown Toggle
if (window.innerWidth < 992) {
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (e.target.parentElement.classList.contains('dropdown')) {
                e.preventDefault();
                this.classList.toggle('active');
            }
        });
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && mainMenu.classList.contains('active')) {
        mainMenu.classList.remove('active');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to current page in navigation
function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) || 
            (currentPath.endsWith('/') && href === 'index.html') ||
            (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
            
            // Si le lien actif est dans un dropdown, activer aussi le parent
            const parentDropdown = link.closest('.dropdown-content');
            if (parentDropdown) {
                const dropdownToggle = parentDropdown.previousElementSibling;
                if (dropdownToggle) {
                    dropdownToggle.classList.add('active');
                }
            }
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setActiveLink();
});

// Fonction mobile menu
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu mobile
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mainMenu = document.querySelector('.main-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (mobileMenuButton && mainMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', function(e) {
            if (!e.target.closest('nav') && 
                !e.target.closest('.mobile-menu-button') && 
                mainMenu.classList.contains('active')) {
                mainMenu.classList.remove('active');
                mobileMenuButton.classList.remove('active');
            }
        });
    }
    
    // Gestion des dropdowns sur mobile
    if (window.innerWidth < 992) {
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', function(e) {
                if (e.target.parentElement.classList.contains('dropdown')) {
                    e.preventDefault();
                    this.classList.toggle('active');
                }
            });
        });
    }
    
    // Hero Slider
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    
    if (heroSlides.length > 1) {
        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000);
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to current page in navigation
    setActiveLink();
    
    // Synchronisation des données entre admin et pages publiques
    syncAdminData();
    
    // Filtrage des équipes
    const filterBtns = document.querySelectorAll('.filter-btn');
    const teamCards = document.querySelectorAll('.team-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Supprimer la classe active de tous les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            // Afficher ou masquer les cartes en fonction du filtre
            teamCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// Fonction pour gérer les onglets des matchs
document.addEventListener('DOMContentLoaded', function() {
    const matchsTabs = document.querySelectorAll('.matchs-tab');
    
    if (matchsTabs.length > 0) {
        matchsTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Supprimer la classe active de tous les onglets
                matchsTabs.forEach(t => t.classList.remove('active'));
                
                // Ajouter la classe active à l'onglet cliqué
                this.classList.add('active');
                
                // Masquer tous les conteneurs de matchs
                document.getElementById('recent-matches').style.display = 'none';
                document.getElementById('upcoming-matches').style.display = 'none';
                
                // Afficher le conteneur correspondant à l'onglet cliqué
                const tabId = this.getAttribute('data-tab');
                if (tabId === 'recent') {
                    document.getElementById('recent-matches').style.display = 'block';
                } else if (tabId === 'upcoming') {
                    document.getElementById('upcoming-matches').style.display = 'block';
                }
            });
        });
    }
});

// Récupérer les données depuis localStorage (utilisé par l'admin)
function getAdminData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Afficher les équipes sur les pages publiques
function displayTeams() {
    const teamsContainer = document.querySelector('.teams-grid');
    if (!teamsContainer) return;
    
    const teams = getAdminData('tba_teams');
    if (teams.length === 0) return;
    
    // Conserver les équipes existantes
    const existingTeams = teamsContainer.innerHTML;
    
    // Ajouter les nouvelles équipes au début
    let newTeamsHTML = '';
    teams.forEach(team => {
        // Déterminer la catégorie correcte pour le filtre
        let filterCategory = 'seniors'; // par défaut
        const categoryLower = team.category.toLowerCase();
        
        if (categoryLower.includes('u7') || categoryLower.includes('u9') || categoryLower.includes('u11')) {
            filterCategory = 'minibasket';
        } else if (categoryLower.includes('u13') || categoryLower.includes('u15') || 
                   categoryLower.includes('u17') || categoryLower.includes('u18') || 
                   categoryLower.includes('u20')) {
            filterCategory = 'jeunes';
        } else if (categoryLower.includes('loisir')) {
            filterCategory = 'loisir';
        }
        
        newTeamsHTML += `
            <div class="team-card" data-category="${filterCategory}">
                <div class="team-image">
                    <img src="https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="${team.name}">
                    <div class="team-badge">${team.category}</div>
                </div>
                <div class="team-info">
                    <h3>${team.name}</h3>
                    <p class="team-category">${team.category} - ${team.gender}</p>
                    <div class="team-details">
                        <p><i class="fas fa-user-tie"></i> Coach: ${team.coach}</p>
                        <p><i class="fas fa-calendar-alt"></i> Entrainement: ${team.training}</p>
                        <p><i class="fas fa-map-marker-alt"></i> Lieu: Halle des Sports</p>
                    </div>
                    <a href="#" class="btn-small">Voir l'équipe</a>
                </div>
            </div>
        `;
    });
    
    teamsContainer.innerHTML = newTeamsHTML + existingTeams;
    
    // Réinitialiser les filtres après l'ajout de nouvelles équipes
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    if (activeFilterBtn) {
        const filter = activeFilterBtn.getAttribute('data-filter');
        const allTeamCards = document.querySelectorAll('.team-card');
        
        allTeamCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Afficher les joueurs sur les pages publiques
function displayPlayers() {
    const playersContainer = document.querySelector('.players-grid');
    if (!playersContainer) return;
    
    const players = getAdminData('tba_players');
    if (players.length === 0) return;
    
    playersContainer.innerHTML = '';
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        // Image par défaut si aucune photo
        const photoSrc = player.photo || 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
        
        playerCard.innerHTML = `
            <div class="player-image">
                <img src="${photoSrc}" alt="${player.name}">
                <div class="player-number">${player.number}</div>
            </div>
            <div class="player-info">
                <h3>${player.name}</h3>
                <p class="player-team">${player.team}</p>
                <div class="player-details">
                    <p><strong>Poste:</strong> ${player.position}</p>
                    <p><strong>Taille:</strong> ${player.height}m</p>
                    <p><strong>Stats:</strong> ${player.statistics.ppg} pts, ${player.statistics.rpg} rbs, ${player.statistics.apg} pds</p>
                </div>
            </div>
        `;
        playersContainer.appendChild(playerCard);
    });
}

// Afficher les événements sur les pages publiques
function displayEvents() {
    const eventsContainer = document.querySelector('.events-list');
    if (!eventsContainer) return;
    
    const events = getAdminData('tba_events');
    if (events.length === 0) return;
    
    // Trier par date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsContainer.innerHTML = '';
    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        // Formater la date
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        eventItem.innerHTML = `
            <div class="event-date">
                <span class="day">${eventDate.getDate()}</span>
                <span class="month">${eventDate.toLocaleDateString('fr-FR', {month: 'short'})}</span>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-meta">
                    <span class="event-type">${event.type}</span> | 
                    <span class="event-time">${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</span> | 
                    <span class="event-location">${event.location}</span>
                </p>
                <p class="event-description">${event.description}</p>
            </div>
        `;
        eventsContainer.appendChild(eventItem);
    });
}

// Afficher les tarifs sur les pages publiques
function displayPricing() {
    const pricingContainer = document.querySelector('.pricing-table tbody');
    if (!pricingContainer) return;
    
    const pricing = getAdminData('tba_pricing');
    if (pricing.length === 0) return;
    
    // Ne pas vider complètement la table pour garder les exemples si pas de données
    if (pricing.length > 0) {
        pricingContainer.innerHTML = '';
    }
    
    pricing.forEach(price => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${price.category}</td>
            <td>${price.age}</td>
            <td>${price.amount} €</td>
            <td>${price.discount || '—'}</td>
        `;
        pricingContainer.appendChild(row);
    });
}

// Synchronisation des données
function syncAdminData() {
    // Vérifier si on est sur une page admin ou publique
    const isAdminPage = window.location.href.includes('admin');
    
    if (!isAdminPage) {
        // Si on est sur une page publique, on affiche les données
        displayTeams();
        displayPlayers();
        displayEvents();
        displayPricing();
    }
}

// Fonction pour récupérer les matchs de NM3 depuis le site de la FFBB
async function fetchFFBBMatches() {
    try {
        // URL de l'API ou de la page des matchs NM3 de Toulouges
        const url = 'https://competitions.ffbb.com/ligues/occ/comites/1166/clubs/occ1166560';
        
        // Message de chargement
        const matchsContainers = document.querySelectorAll('.matchs-container');
        if (matchsContainers.length > 0) {
            matchsContainers.forEach(container => {
                container.innerHTML = '<div class="loading-message">Chargement des matchs depuis le site de la FFBB...</div>';
            });
        }
        
        // Redirection vers le site de la FFBB pour voir les matchs officiels
        const matchesViewAll = document.querySelector('.matches-view-all');
        if (matchesViewAll) {
            matchesViewAll.innerHTML = '<a href="https://competitions.ffbb.com/ligues/occ/comites/1166/clubs/occ1166560" target="_blank" class="btn primary">Voir tous les matchs officiels <i class="fas fa-external-link-alt"></i></a>';
        }
        
        console.log("Redirection vers le site officiel de la FFBB pour les matchs de NM3");
    } catch (error) {
        console.error("Erreur lors de la récupération des matchs FFBB:", error);
        // Afficher un message d'erreur
        const matchsContainers = document.querySelectorAll('.matchs-container');
        if (matchsContainers.length > 0) {
            matchsContainers.forEach(container => {
                container.innerHTML = '<div class="error-message">Impossible de récupérer les matchs. Veuillez consulter le <a href="https://competitions.ffbb.com/ligues/occ/comites/1166/clubs/occ1166560" target="_blank">site officiel de la FFBB</a>.</div>';
            });
        }
    }
}

// Initialisation avec vérification de la page
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes sur la page d'accueil ou la page calendrier
    const isMatchPage = document.querySelector('.matchs-section') || document.querySelector('.matchs-list');
    
    if (isMatchPage) {
        // Charger les matchs depuis la FFBB
        fetchFFBBMatches();
    }
    
    // Le reste du code d'initialisation existant
    // ... existing initialization ...
});

// Gestion des onglets de matchs sur la page calendrier
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des filtres sur la page calendrier
    const filterBtns = document.querySelectorAll('.filter-btn');
    const matchCards = document.querySelectorAll('.match-card');
    const teamSelect = document.getElementById('team-select');
    
    if (filterBtns.length > 0 && matchCards.length > 0) {
        // Fonction pour filtrer les matchs
        function filterMatches() {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            const selectedTeam = teamSelect ? teamSelect.value : 'all';
            
            matchCards.forEach(card => {
                const isUpcoming = card.classList.contains('upcoming');
                const isPlayed = card.classList.contains('played');
                const teamClass = card.classList.contains('nm3') ? 'nm3' : 
                                 card.classList.contains('u18') ? 'u18' : 
                                 card.classList.contains('u15') ? 'u15' : 
                                 card.classList.contains('u13') ? 'u13' : 'other';
                
                // Filtre par statut
                const matchesStatusFilter = 
                    (activeFilter === 'all') || 
                    (activeFilter === 'upcoming' && isUpcoming) || 
                    (activeFilter === 'played' && isPlayed);
                
                // Filtre par équipe
                const matchesTeamFilter = 
                    (selectedTeam === 'all') || 
                    (teamClass === selectedTeam);
                
                // Appliquer les deux filtres
                if (matchesStatusFilter && matchesTeamFilter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // Écouteurs d'événements pour les filtres
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterMatches();
            });
        });
        
        if (teamSelect) {
            teamSelect.addEventListener('change', filterMatches);
        }
        
        // Filtrer les matchs au chargement
        filterMatches();
    }
    
    // Gestion des onglets sur la page d'accueil (ancien format)
    const matchTabs = document.querySelectorAll('.matchs-tab');
    const matchContainers = document.querySelectorAll('.matchs-container');
    
    if (matchTabs.length > 0 && matchContainers.length > 0) {
        matchTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabType = this.dataset.tab;
                
                // Activer l'onglet
                matchTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Afficher le conteneur correspondant
                matchContainers.forEach(container => {
                    if (container.id === `${tabType}-matches`) {
                        container.style.display = 'grid';
                    } else {
                        container.style.display = 'none';
                    }
                });
            });
        });
    }
}); 