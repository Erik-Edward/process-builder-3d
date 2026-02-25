/**
 * componentLibrary.js - Hanterar komponentbiblioteket i vänster panel.
 * Flikbaserad navigation med sökfunktion.
 */

const ComponentLibrary = (() => {
    let selectedType = null;
    const onSelectCallbacks = [];

    // Define category order and icons
    const CATEGORY_META = {
        'Pumpar':            { icon: '⚙', order: 0 },
        'Ventiler':          { icon: '✖', order: 1 },
        'Kolonner':          { icon: '⬡', order: 2 },
        'Tankar':            { icon: '▣', order: 3 },
        'Reaktorer':         { icon: '☢', order: 4 },
        'Separering':        { icon: '⊜', order: 5 },
        'Värmeöverföring':   { icon: '↔', order: 6 },
        'Ugnar':             { icon: '🔥', order: 7 },
        'Kylning':           { icon: '❄', order: 8 },
        'Säkerhet':          { icon: '⚠', order: 9 },
        'Instrument':        { icon: '◈', order: 10 },
        'Utilities':         { icon: '💧', order: 11 },
        'Anslutningar':      { icon: '⇌', order: 12 },
        'Övrigt':            { icon: '…', order: 13 },
        'Läromoduler':       { icon: '📚', order: 14 }
    };

    let activeTab = null;
    let categories = {};
    let searchTerm = '';

    function init() {
        const panel = document.getElementById('library-panel');
        if (!panel) return;

        // Group definitions by category
        categories = {};
        for (const [key, def] of Object.entries(COMPONENT_DEFINITIONS)) {
            const cat = def.category || 'Övrigt';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push({ key, ...def });
        }

        // Sort categories by defined order
        const sortedCats = Object.keys(categories).sort((a, b) => {
            const oa = (CATEGORY_META[a] || {}).order ?? 99;
            const ob = (CATEGORY_META[b] || {}).order ?? 99;
            return oa - ob;
        });

        // Clear panel and build new UI
        panel.innerHTML = '';

        // Search bar
        const searchWrap = document.createElement('div');
        searchWrap.className = 'lib-search-wrap';
        searchWrap.innerHTML = `<input type="text" id="lib-search" class="lib-search" placeholder="Sök komponenter..." />`;
        panel.appendChild(searchWrap);

        // Tab bar
        const tabBar = document.createElement('div');
        tabBar.className = 'lib-tab-bar';
        tabBar.id = 'lib-tab-bar';

        for (const cat of sortedCats) {
            const meta = CATEGORY_META[cat] || { icon: '?' };
            const tab = document.createElement('button');
            tab.className = 'lib-tab';
            tab.dataset.category = cat;
            tab.title = cat;
            tab.innerHTML = `<span class="lib-tab-icon">${meta.icon}</span><span class="lib-tab-label">${cat}</span>`;
            tab.addEventListener('click', () => setActiveTab(cat));
            tabBar.appendChild(tab);
        }
        panel.appendChild(tabBar);

        // Component list container
        const listEl = document.createElement('div');
        listEl.id = 'component-list';
        listEl.className = 'lib-component-list';
        panel.appendChild(listEl);

        // Count badge
        const countEl = document.createElement('div');
        countEl.className = 'lib-count';
        countEl.id = 'lib-count';
        panel.appendChild(countEl);

        // Wire up search
        const searchInput = document.getElementById('lib-search');
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.trim().toLowerCase();
            renderComponents();
        });

        // Activate first tab
        setActiveTab(sortedCats[0]);
    }

    function setActiveTab(cat) {
        activeTab = cat;
        // Update tab visuals
        const tabs = document.querySelectorAll('.lib-tab');
        tabs.forEach(t => {
            t.classList.toggle('active', t.dataset.category === cat);
        });
        renderComponents();
    }

    function renderComponents() {
        const listEl = document.getElementById('component-list');
        const countEl = document.getElementById('lib-count');
        if (!listEl) return;
        listEl.innerHTML = '';

        let items;
        if (searchTerm) {
            // Search across ALL categories
            items = [];
            for (const cat of Object.keys(categories)) {
                for (const item of categories[cat]) {
                    const text = `${item.name} ${item.description} ${item.category}`.toLowerCase();
                    if (text.includes(searchTerm)) {
                        items.push(item);
                    }
                }
            }
        } else {
            items = categories[activeTab] || [];
        }

        for (const item of items) {
            const card = document.createElement('div');
            card.className = 'component-card';
            if (selectedType === item.key) card.classList.add('selected');
            card.dataset.type = item.key;
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-icon">${item.icon}</span>
                    <span class="card-name">${item.name}</span>
                </div>
                <div class="card-desc">${item.description}</div>
            `;
            card.addEventListener('click', () => selectComponent(item.key, card));
            listEl.appendChild(card);
        }

        // Update count
        if (countEl) {
            const total = Object.values(categories).reduce((s, c) => s + c.length, 0);
            if (searchTerm) {
                countEl.textContent = `${items.length} av ${total} komponenter`;
            } else {
                countEl.textContent = `${items.length} komponenter`;
            }
        }
    }

    function selectComponent(type, cardEl) {
        if (selectedType === type) {
            selectedType = null;
            cardEl.classList.remove('selected');
        } else {
            const prev = document.querySelector('.component-card.selected');
            if (prev) prev.classList.remove('selected');
            selectedType = type;
            cardEl.classList.add('selected');
        }
        onSelectCallbacks.forEach(cb => cb(selectedType));
    }

    function getSelected() {
        return selectedType;
    }

    function clearSelection() {
        selectedType = null;
        const prev = document.querySelector('.component-card.selected');
        if (prev) prev.classList.remove('selected');
        onSelectCallbacks.forEach(cb => cb(null));
    }

    function onSelect(callback) {
        onSelectCallbacks.push(callback);
    }

    return { init, getSelected, clearSelection, onSelect };
})();
