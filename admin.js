// Authentication check
(function() {
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = 'admin-login.html';
    }
})();

// Variables globales pour stocker les données temporaires
window.playerPhotoDataURL = null;

// Modification pour que les données ajoutées depuis l'admin soient disponibles sur les pages publiques
function saveToLocalStorage(key, data) {
    // Récupérer les données existantes
    const existingData = localStorage.getItem(key);
    let dataArray = existingData ? JSON.parse(existingData) : [];
    
    // Ajouter les nouvelles données
    dataArray.push(data);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(key, JSON.stringify(dataArray));
    
    return dataArray;
}

// Supprimer un élément du localStorage
function deleteFromLocalStorage(key, id) {
    const existingData = localStorage.getItem(key);
    if (!existingData) return false;
    
    let dataArray = JSON.parse(existingData);
    const initialLength = dataArray.length;
    
    // Filtrer pour garder tous les éléments sauf celui avec l'ID spécifié
    dataArray = dataArray.filter(item => item.id !== id);
    
    // Si la longueur a changé, on a supprimé un élément
    if (dataArray.length < initialLength) {
        localStorage.setItem(key, JSON.stringify(dataArray));
        console.log(`Élément avec ID ${id} supprimé de ${key}`);
        return true;
    }
    
    console.log(`Aucun élément trouvé avec ID ${id} dans ${key}`);
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all tab buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Modal Functions
    const modalOpeners = {
        'add-team-btn': 'team-modal',
        'add-player-btn': 'player-modal',
        'upload-media-btn': 'media-modal',
        'add-event-btn': 'event-modal',
        'add-season-btn': 'season-modal',
        'add-pricing-btn': 'pricing-modal'
    };
    
    // Open Modals
    Object.keys(modalOpeners).forEach(openerId => {
        const opener = document.getElementById(openerId);
        if (opener) {
            opener.addEventListener('click', () => {
                const modalId = modalOpeners[openerId];
                document.getElementById(modalId).classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            });
        }
    });
    
    // Close Modals
    const closeButtons = document.querySelectorAll('.close-modal, #cancel-team, #cancel-player, #cancel-media, #cancel-event, #cancel-season, #cancel-pricing');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.admin-modal');
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    });
    
    // Close modal when clicking outside of content
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Teams Form Handling
    const teamForm = document.getElementById('team-form');
    if (teamForm) {
        teamForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const teamData = {
                id: Date.now(),
                name: document.getElementById('team-name').value,
                season: document.getElementById('team-season').value,
                category: document.getElementById('team-category').value,
                gender: document.getElementById('team-gender').value,
                coach: document.getElementById('team-coach').value,
                training: document.getElementById('team-training').value,
                description: document.getElementById('team-description').value,
            };
            
            console.log('Team Data:', teamData);
            
            // Sauvegarder dans localStorage pour les pages publiques
            saveToLocalStorage('tba_teams', teamData);
            
            // Create new team card
            const teamsList = document.querySelector('.teams-list');
            const newTeamCard = createTeamCard(teamData);
            teamsList.prepend(newTeamCard);
            
            // Add event listeners to the buttons in the new card
            addCardButtonListeners(newTeamCard);
            
            // Close modal and reset form
            document.getElementById('team-modal').classList.remove('active');
            document.body.style.overflow = '';
            teamForm.reset();
            
            // Show success message
            alert('Équipe ajoutée avec succès!');
        });
    }
    
    // Create a team card element
    function createTeamCard(teamData) {
        const card = document.createElement('div');
        card.className = 'admin-card';
        
        card.innerHTML = `
            <div class="admin-card-header">
                <h3>${teamData.name}</h3>
                <span class="badge">${teamData.season}</span>
            </div>
            <div class="admin-card-body">
                <p><strong>Coach:</strong> ${teamData.coach}</p>
                <p><strong>Jour d'entrainement:</strong> ${teamData.training}</p>
                <p><strong>Catégorie:</strong> ${teamData.category} - ${teamData.gender}</p>
            </div>
            <div class="admin-card-actions">
                <button class="btn-small edit-btn" data-id="${teamData.id}"><i class="fas fa-edit"></i> Modifier</button>
                <button class="btn-small view-btn" data-id="${teamData.id}"><i class="fas fa-eye"></i> Voir</button>
                <button class="btn-small delete-btn" data-id="${teamData.id}"><i class="fas fa-trash"></i> Supprimer</button>
            </div>
        `;
        
        return card;
    }
    
    // Players Form Handling
    const playerForm = document.getElementById('player-form');
    const playerDropzone = document.getElementById('player-dropzone');
    const playerPhotoInput = document.getElementById('player-photo');
    
    if (playerDropzone && playerPhotoInput) {
        // Show selected files in the dropzone
        playerPhotoInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                const file = this.files[0];
                
                // Check if file is an image
                if (!file.type.match('image.*')) {
                    alert('Veuillez sélectionner une image');
                    return;
                }
                
                // Create preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    window.playerPhotoDataURL = e.target.result;
                    playerDropzone.innerHTML = `
                        <img src="${window.playerPhotoDataURL}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px;">
                        <p>${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                resetPlayerDropzone();
            }
        });
        
        // Make dropzone clickable
        playerDropzone.addEventListener('click', () => {
            playerPhotoInput.click();
        });
        
        // Handle drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            playerDropzone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            playerDropzone.addEventListener(eventName, () => {
                playerDropzone.classList.add('highlight');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            playerDropzone.addEventListener(eventName, () => {
                playerDropzone.classList.remove('highlight');
            }, false);
        });
        
        playerDropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const file = files[0];
                
                // Check if file is an image
                if (!file.type.match('image.*')) {
                    alert('Veuillez sélectionner une image');
                    return;
                }
                
                playerPhotoInput.files = files;
                
                // Trigger change event
                const event = new Event('change');
                playerPhotoInput.dispatchEvent(event);
            }
        }, false);
    }
    
    function resetPlayerDropzone() {
        window.playerPhotoDataURL = null;
        if (playerDropzone) {
            playerDropzone.innerHTML = `
                <i class="fas fa-user-plus"></i>
                <p>Glissez et déposez une photo ici<br>ou cliquez pour sélectionner</p>
            `;
        }
    }
    
    if (playerForm) {
        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const playerData = {
                id: Date.now(),
                name: document.getElementById('player-name').value,
                season: document.getElementById('player-season').value,
                team: document.getElementById('player-team').value,
                number: document.getElementById('player-number').value,
                position: document.getElementById('player-position').value,
                height: document.getElementById('player-height').value,
                birthdate: document.getElementById('player-birthdate').value,
                nationality: document.getElementById('player-nationality').value,
                statistics: {
                    ppg: document.getElementById('player-ppg').value || '0',
                    rpg: document.getElementById('player-rpg').value || '0',
                    apg: document.getElementById('player-apg').value || '0'
                },
                bio: document.getElementById('player-bio').value,
                photo: window.playerPhotoDataURL
            };
            
            console.log('Player Data:', playerData);
            
            // Sauvegarder dans localStorage pour les pages publiques
            saveToLocalStorage('tba_players', playerData);
            
            // Create new player card
            const playersList = document.querySelector('.players-list');
            const newPlayerCard = createPlayerCard(playerData);
            playersList.prepend(newPlayerCard);
            
            // Add event listeners to the buttons in the new card
            addCardButtonListeners(newPlayerCard);
            
            // Close modal and reset form
            document.getElementById('player-modal').classList.remove('active');
            document.body.style.overflow = '';
            playerForm.reset();
            resetPlayerDropzone();
            
            // Show success message
            alert('Joueur ajouté avec succès!');
        });
    }
    
    // Create a player card element
    function createPlayerCard(playerData) {
        const card = document.createElement('div');
        card.className = 'admin-card';
        
        // Use default image if no photo provided
        const photoSrc = playerData.photo || 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
        
        card.innerHTML = `
            <div class="admin-card-header">
                <h3>${playerData.name}</h3>
                <span class="badge">${playerData.team}</span>
            </div>
            <div class="admin-card-body">
                <div class="player-preview">
                    <img src="${photoSrc}" alt="${playerData.name}">
                    <div class="player-info">
                        <p><strong>Numéro:</strong> ${playerData.number}</p>
                        <p><strong>Poste:</strong> ${playerData.position}</p>
                        <p><strong>Taille:</strong> ${playerData.height}m</p>
                    </div>
                </div>
            </div>
            <div class="admin-card-actions">
                <button class="btn-small edit-btn" data-id="${playerData.id}"><i class="fas fa-edit"></i> Modifier</button>
                <button class="btn-small delete-btn" data-id="${playerData.id}"><i class="fas fa-trash"></i> Supprimer</button>
            </div>
        `;
        
        return card;
    }
    
    // Events Form Handling
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const eventData = {
                id: Date.now(),
                title: document.getElementById('event-title').value,
                type: document.getElementById('event-type').value,
                date: document.getElementById('event-date').value,
                startTime: document.getElementById('event-start-time').value,
                endTime: document.getElementById('event-end-time').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value
            };
            
            console.log('Event Data:', eventData);
            
            // Sauvegarder dans localStorage pour les pages publiques
            saveToLocalStorage('tba_events', eventData);
            
            // Format date for display
            const formattedDate = formatDate(eventData.date);
            
            // Create new event card
            const eventsList = document.querySelector('.events-list');
            const newEventCard = document.createElement('div');
            newEventCard.className = 'admin-card';
            
            newEventCard.innerHTML = `
                <div class="admin-card-header">
                    <h3>${eventData.title}</h3>
                    <span class="badge">${eventData.type}</span>
                </div>
                <div class="admin-card-body">
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Heure:</strong> ${eventData.startTime}${eventData.endTime ? ' - ' + eventData.endTime : ''}</p>
                    <p><strong>Lieu:</strong> ${eventData.location}</p>
                </div>
                <div class="admin-card-actions">
                    <button class="btn-small edit-btn"><i class="fas fa-edit"></i> Modifier</button>
                    <button class="btn-small delete-btn"><i class="fas fa-trash"></i> Supprimer</button>
                </div>
            `;
            
            eventsList.prepend(newEventCard);
            
            // Add event listeners to the buttons in the new card
            addCardButtonListeners(newEventCard);
            
            // Close modal and reset form
            document.getElementById('event-modal').classList.remove('active');
            document.body.style.overflow = '';
            eventForm.reset();
            
            // Show success message
            alert('Événement ajouté avec succès!');
        });
    }
    
    // Format date helper function
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Season Form Handling
    const seasonForm = document.getElementById('season-form');
    if (seasonForm) {
        seasonForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const seasonData = {
                id: Date.now(),
                name: document.getElementById('season-name').value,
                startDate: document.getElementById('season-start').value,
                endDate: document.getElementById('season-end').value,
                status: document.getElementById('season-status').value,
                description: document.getElementById('season-description').value
            };
            
            console.log('Season Data:', seasonData);
            
            // Sauvegarder dans localStorage pour les pages publiques
            saveToLocalStorage('tba_seasons', seasonData);
            
            // Format dates for display
            const formattedStartDate = formatDate(seasonData.startDate);
            const formattedEndDate = formatDate(seasonData.endDate);
            
            // Create new season card
            const seasonsList = document.querySelector('.seasons-list');
            const newSeasonCard = document.createElement('div');
            newSeasonCard.className = 'admin-card';
            
            newSeasonCard.innerHTML = `
                <div class="admin-card-header">
                    <h3>${seasonData.name}</h3>
                    <span class="badge ${seasonData.status === 'active' ? 'success' : ''}">${capitalize(seasonData.status)}</span>
                </div>
                <div class="admin-card-body">
                    <p><strong>Date de début:</strong> ${formattedStartDate}</p>
                    <p><strong>Date de fin:</strong> ${formattedEndDate}</p>
                    <p><strong>Équipes:</strong> 0</p>
                </div>
                <div class="admin-card-actions">
                    <button class="btn-small edit-btn"><i class="fas fa-edit"></i> Modifier</button>
                    <button class="btn-small view-btn"><i class="fas fa-eye"></i> Voir</button>
                </div>
            `;
            
            seasonsList.prepend(newSeasonCard);
            
            // Add event listeners to the buttons in the new card
            addCardButtonListeners(newSeasonCard);
            
            // Close modal and reset form
            document.getElementById('season-modal').classList.remove('active');
            document.body.style.overflow = '';
            seasonForm.reset();
            
            // Show success message
            alert('Saison ajoutée avec succès!');
            
            // Add the new season to all season filter dropdowns
            addSeasonToFilters(seasonData.name);
        });
    }
    
    // Add new season to all filter dropdowns
    function addSeasonToFilters(seasonName) {
        const seasonFilters = [
            document.getElementById('season-filter'),
            document.getElementById('pricing-season-filter'),
            document.getElementById('player-season'),
            document.getElementById('team-season'),
            document.getElementById('pricing-season')
        ];
        
        seasonFilters.forEach(filter => {
            if (filter) {
                const option = document.createElement('option');
                option.value = seasonName.replace(/[^0-9-]/g, '');
                option.textContent = seasonName;
                filter.prepend(option);
                filter.value = option.value;
            }
        });
    }
    
    // Vérifier et formater une valeur numérique
    function formatNumericValue(value) {
        if (!value) return '';
        
        // Nettoyer la valeur en supprimant les espaces et en remplaçant les virgules par des points
        const cleanValue = value.toString().replace(/\s+/g, '').replace(',', '.');
        
        // Essayer de convertir en nombre
        const numValue = parseFloat(cleanValue);
        
        // Vérifier si la conversion a fonctionné
        if (isNaN(numValue)) {
            console.warn(`Valeur non numérique détectée: ${value}`);
            return value; // Retourner la valeur d'origine si pas un nombre
        }
        
        // Formater avec 2 décimales max et sans zéros inutiles à la fin
        return numValue.toString();
    }
    
    // Pricing Form Handling
    const pricingForm = document.getElementById('pricing-form');
    if (pricingForm) {
        pricingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const pricingData = {
                id: Date.now(),
                category: document.getElementById('pricing-category').value,
                age: document.getElementById('pricing-age').value,
                amount: formatNumericValue(document.getElementById('pricing-amount').value),
                season: document.getElementById('pricing-season').value,
                discount: document.getElementById('pricing-discount').value,
                description: document.getElementById('pricing-description').value
            };
            
            console.log('Pricing Data:', pricingData);
            
            // Sauvegarder dans localStorage pour les pages publiques
            saveToLocalStorage('tba_pricing', pricingData);
            
            // Check if we're editing an existing row
            const pricingTable = document.querySelector('.pricing-table tbody');
            const modalTitle = document.querySelector('#pricing-modal .modal-header h3').textContent;
            const isEditing = modalTitle.includes('Modifier');
            
            if (isEditing) {
                // Find the row being edited
                const rows = pricingTable.querySelectorAll('tr');
                let foundRow = null;
                
                rows.forEach(row => {
                    if (row.cells[0].textContent === document.getElementById('pricing-category-original').value) {
                        foundRow = row;
                    }
                });
                
                if (foundRow) {
                    foundRow.cells[0].textContent = pricingData.category;
                    foundRow.cells[1].textContent = pricingData.age;
                    foundRow.cells[2].textContent = pricingData.amount + ' €';
                    foundRow.cells[3].textContent = pricingData.discount || '—';
                    
                    // Update data attribute
                    foundRow.setAttribute('data-season', pricingData.season);
                    foundRow.setAttribute('data-id', pricingData.id);
                }
            } else {
                // Create new row
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-season', pricingData.season);
                newRow.setAttribute('data-id', pricingData.id);
                
                newRow.innerHTML = `
                    <td>${pricingData.category}</td>
                    <td>${pricingData.age}</td>
                    <td>${pricingData.amount} €</td>
                    <td>${pricingData.discount || '—'}</td>
                    <td>
                        <button class="btn-icon edit-pricing-btn" title="Modifier" data-id="${pricingData.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-pricing-btn" title="Supprimer" data-id="${pricingData.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                
                pricingTable.prepend(newRow);
                
                // Add event listeners to the buttons in the new row
                newRow.querySelector('.edit-pricing-btn').addEventListener('click', handlePricingEdit);
                newRow.querySelector('.delete-pricing-btn').addEventListener('click', handlePricingDelete);
            }
            
            // Close modal and reset form
            document.getElementById('pricing-modal').classList.remove('active');
            document.body.style.overflow = '';
            pricingForm.reset();
            
            // Remove the original category field if it exists
            const originalField = document.getElementById('pricing-category-original');
            if (originalField) originalField.remove();
            
            // Reset modal title
            document.querySelector('#pricing-modal .modal-header h3').textContent = 'Ajouter un tarif';
            
            // Show success message
            alert(isEditing ? 'Tarif modifié avec succès!' : 'Tarif ajouté avec succès!');
        });
    }
    
    // Pricing Edit Buttons
    function handlePricingEdit() {
        const row = this.closest('tr');
        const category = row.cells[0].textContent;
        const age = row.cells[1].textContent;
        const amount = row.cells[2].textContent.replace('€', '').trim();
        const discount = row.cells[3].textContent === '—' ? '' : row.cells[3].textContent;
        const season = row.getAttribute('data-season') || document.getElementById('pricing-season-filter').value;
        
        // Add hidden field for original category to identify the row later
        let originalField = document.getElementById('pricing-category-original');
        if (!originalField) {
            originalField = document.createElement('input');
            originalField.type = 'hidden';
            originalField.id = 'pricing-category-original';
            pricingForm.appendChild(originalField);
        }
        originalField.value = category;
        
        // Open modal and fill form
        document.getElementById('pricing-category').value = category;
        document.getElementById('pricing-age').value = age;
        document.getElementById('pricing-amount').value = amount;
        document.getElementById('pricing-discount').value = discount;
        
        try {
            // Set the season if the option exists
            const seasonSelect = document.getElementById('pricing-season');
            const options = Array.from(seasonSelect.options).map(opt => opt.value);
            if (options.includes(season)) {
                seasonSelect.value = season;
            }
        } catch (e) {
            console.error('Error setting season value:', e);
        }
        
        // Update modal title
        document.querySelector('#pricing-modal .modal-header h3').textContent = 'Modifier un tarif';
        
        // Show modal
        document.getElementById('pricing-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Pricing Delete Buttons
    function handlePricingDelete() {
        const row = this.closest('tr');
        const category = row.cells[0].textContent;
        const id = parseInt(this.getAttribute('data-id'), 10);
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer le tarif pour "${category}" ?`)) {
            if (id) {
                const success = deleteFromLocalStorage('tba_pricing', id);
                if (success) {
                    row.remove();
                    alert(`Le tarif pour "${category}" a été supprimé avec succès.`);
                } else {
                    alert(`Erreur: Impossible de supprimer le tarif pour "${category}".`);
                }
            } else {
                // Si pas d'ID, on supprime simplement visuellement
                row.remove();
            }
        }
    }
    
    // Add event listeners to pricing edit and delete buttons
    document.querySelectorAll('.edit-pricing-btn').forEach(button => {
        button.addEventListener('click', handlePricingEdit);
    });
    
    document.querySelectorAll('.delete-pricing-btn').forEach(button => {
        button.addEventListener('click', handlePricingDelete);
    });
    
    // Filter Pricing
    const filterPricingBtn = document.getElementById('filter-pricing-btn');
    if (filterPricingBtn) {
        filterPricingBtn.addEventListener('click', () => {
            const season = document.getElementById('pricing-season-filter').value;
            
            if (season) {
                // Show only rows for the selected season
                document.querySelectorAll('.pricing-table tbody tr').forEach(row => {
                    const rowSeason = row.getAttribute('data-season');
                    if (rowSeason && rowSeason !== season) {
                        row.style.display = 'none';
                    } else {
                        row.style.display = '';
                    }
                });
            } else {
                // Show all rows
                document.querySelectorAll('.pricing-table tbody tr').forEach(row => {
                    row.style.display = '';
                });
            }
        });
    }
    
    // Add event listeners to all card buttons
    function addCardButtonListeners(card) {
        // Edit button
        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const headerText = card.querySelector('.admin-card-header h3').textContent;
                alert(`Édition de "${headerText}"\nDans une vraie application, les champs du formulaire seraient préremplis avec les données existantes.`);
            });
        }
        
        // View button
        const viewBtn = card.querySelector('.view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const headerText = card.querySelector('.admin-card-header h3').textContent;
                alert(`Affichage de "${headerText}"\nDans une vraie application, vous seriez redirigé vers la page publique.`);
            });
        }
        
        // Delete button
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const headerText = card.querySelector('.admin-card-header h3').textContent;
                const id = parseInt(this.getAttribute('data-id'), 10);
                
                if (confirm(`Êtes-vous sûr de vouloir supprimer "${headerText}" ?`)) {
                    // Déterminer le type de contenu à supprimer
                    let storageKey = null;
                    
                    if (card.closest('#teams-tab')) {
                        storageKey = 'tba_teams';
                    } else if (card.closest('#players-tab')) {
                        storageKey = 'tba_players';
                    } else if (card.closest('#events-tab')) {
                        storageKey = 'tba_events';
                    } else if (card.closest('#seasons-tab')) {
                        storageKey = 'tba_seasons';
                    }
                    
                    if (storageKey && id) {
                        const success = deleteFromLocalStorage(storageKey, id);
                        if (success) {
                            card.remove();
                            alert(`"${headerText}" a été supprimé avec succès.`);
                        } else {
                            alert(`Erreur: Impossible de supprimer "${headerText}".`);
                        }
                    } else {
                        // Si pas d'ID ou impossibilité de déterminer le type, on supprime simplement visuellement
                        card.remove();
                    }
                }
            });
        }
    }
    
    // Add event listeners to all existing cards
    document.querySelectorAll('.admin-card').forEach(card => {
        addCardButtonListeners(card);
    });
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Log out button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('admin_authenticated');
            window.location.href = 'admin-login.html';
        });
    }
    
    // Initialiser les listes à partir du localStorage au chargement
    function initializeFromLocalStorage() {
        console.log("Initialisation des données depuis localStorage");
        
        // Initialiser les teams
        const teams = getAdminDataFromStorage('tba_teams');
        const teamsList = document.querySelector('.teams-list');
        if (teamsList && teams.length > 0) {
            teamsList.innerHTML = ''; // Clear existing content
            teams.forEach(team => {
                // S'assurer que l'équipe a un ID
                if (!team.id) {
                    team.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                const newTeamCard = createTeamCard(team);
                teamsList.appendChild(newTeamCard);
                addCardButtonListeners(newTeamCard);
            });
        }
        
        // Initialiser les players
        const players = getAdminDataFromStorage('tba_players');
        const playersList = document.querySelector('.players-list');
        if (playersList && players.length > 0) {
            playersList.innerHTML = ''; // Clear existing content
            players.forEach(player => {
                // S'assurer que le joueur a un ID
                if (!player.id) {
                    player.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                const newPlayerCard = createPlayerCard(player);
                playersList.appendChild(newPlayerCard);
                addCardButtonListeners(newPlayerCard);
            });
        }
        
        // Initialiser les events
        const events = getAdminDataFromStorage('tba_events');
        const eventsList = document.querySelector('.events-list');
        if (eventsList && events.length > 0) {
            eventsList.innerHTML = ''; // Clear existing content
            events.forEach(event => {
                // S'assurer que l'événement a un ID
                if (!event.id) {
                    event.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                const formattedDate = formatDate(event.date);
                const newEventCard = document.createElement('div');
                newEventCard.className = 'admin-card';
                
                newEventCard.innerHTML = `
                    <div class="admin-card-header">
                        <h3>${event.title}</h3>
                        <span class="badge">${event.type}</span>
                    </div>
                    <div class="admin-card-body">
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Heure:</strong> ${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</p>
                        <p><strong>Lieu:</strong> ${event.location}</p>
                    </div>
                    <div class="admin-card-actions">
                        <button class="btn-small edit-btn" data-id="${event.id}"><i class="fas fa-edit"></i> Modifier</button>
                        <button class="btn-small delete-btn" data-id="${event.id}"><i class="fas fa-trash"></i> Supprimer</button>
                    </div>
                `;
                
                eventsList.appendChild(newEventCard);
                addCardButtonListeners(newEventCard);
            });
        }
        
        // Initialiser les pricing
        const pricing = getAdminDataFromStorage('tba_pricing');
        const pricingTable = document.querySelector('.pricing-table tbody');
        if (pricingTable && pricing.length > 0) {
            pricingTable.innerHTML = ''; // Clear existing content
            pricing.forEach(price => {
                // S'assurer que le tarif a un ID
                if (!price.id) {
                    price.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-season', price.season);
                newRow.setAttribute('data-id', price.id);
                
                newRow.innerHTML = `
                    <td>${price.category}</td>
                    <td>${price.age}</td>
                    <td>${price.amount} €</td>
                    <td>${price.discount || '—'}</td>
                    <td>
                        <button class="btn-icon edit-pricing-btn" title="Modifier" data-id="${price.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-pricing-btn" title="Supprimer" data-id="${price.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                
                pricingTable.appendChild(newRow);
                
                // Add event listeners to the buttons in the new row
                newRow.querySelector('.edit-pricing-btn').addEventListener('click', handlePricingEdit);
                newRow.querySelector('.delete-pricing-btn').addEventListener('click', handlePricingDelete);
            });
        }
    }
}); 