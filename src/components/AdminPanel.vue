<script setup>
import { ref, computed, onMounted } from 'vue';

// PAS - razvojna instanca na dev-inpos serveru
import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

import DataTable from './DataTable.vue';
import LanguageTable from './LanguageTable.vue';

const props = defineProps({
    translations: Object,
});

const activeTab = ref('Visitors');
const users = ref([]);
const companies = ref([]);
const contacts = ref([]);

const userColumns = ref([
    { field: 'FullName', header: 'Puno ime' },
    { field: 'CompanyName', header: 'Tvrtka' },
    { field: 'VisitPurpose', header: 'Svrha posjete' },
    { field: 'ContactPerson', header: 'Kontakt osoba' },
]);

const companyColumns = ref([
    { field: 'Name', header: 'Tvrtka' },
]);

const contactColumns = ref([
    { field: 'FullName', header: 'Puno ime' },
    { field: 'Email', header: 'Email' },
    { field: 'Phone', header: 'Mob.' },
]);

const currentData = computed(() => {
    if (activeTab.value === 'Visitors') return users.value;
    if (activeTab.value === 'Companies') return companies.value;
    if (activeTab.value === 'Contacts') return contacts.value;
    return [];
});

const currentColumns = computed(() => {
    if (activeTab.value === 'Visitors') return userColumns.value;
    if (activeTab.value === 'Companies') return companyColumns.value;
    if (activeTab.value === 'Contacts') return contactColumns.value;
    return [];
});

// Search functionality
const searchQuery = ref('');
const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value;
    return users.value.filter((user) =>
        user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const companySearchQuery = ref('');
const filteredCompanies = computed(() => {
    if (!companySearchQuery.value) return companies.value;
    return companies.value.filter((company) =>
        company.name.toLowerCase().includes(companySearchQuery.value.toLowerCase())
    );
});

const contactSearchQuery = ref('');
const filteredContacts = computed(() => {
    if (!contactSearchQuery.value) return contacts.value;
    return contacts.value.filter((contact) =>
        contact.fullName.toLowerCase().includes(contactSearchQuery.value.toLowerCase())
    );
});

const switchTab = (tab) => {
    activeTab.value = tab;
    searchQuery.value = '';
    companySearchQuery.value = '';
    contactSearchQuery.value = '';
};

const fetchData = async () => {
    try {
        const [usersResponse, companiesResponse, contactsResponse] = await Promise.all([
            PAS.get('/Visitors'),
            PAS.get('/Companies'),
            PAS.get('/Contacts'),
        ]);

        users.value = usersResponse.data.dsVisitors.ttVisitors;
        companies.value = companiesResponse.data.dsCompanies.ttCompanies;
        contacts.value = contactsResponse.data.dsContacts.ttContacts;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

onMounted(() => {
    fetchData();
    switchTab('Visitors');
});

const handleRowDeleted = () => {
    fetchData();
};

const handleNewRowCreated = () => {
    fetchData();
};
</script>

<template>
    <div class="admin-panel">

        <header class="admin-header">
            <button @click="switchTab('Visitors')" :class="{ active: activeTab === 'Visitors' }">Gosti</button>
            <button @click="switchTab('Companies')" :class="{ active: activeTab === 'Companies' }">Tvrtke</button>
            <button @click="switchTab('Contacts')" :class="{ active: activeTab === 'Contacts' }">Kontakt osobe</button>
            <button @click="switchTab('Translations')"
                :class="{ active: activeTab === 'Translations' }">Prijevodi</button>
        </header>

        <div class="tab-content">
            <LanguageTable v-if="activeTab === 'Translations'" />
            <DataTable v-else :data="currentData" :displayDetails="currentColumns" :currently-displaying="activeTab"
                @newItemCreated="handleNewRowCreated" @row-deleted="handleRowDeleted" @updateItem="handleRowDeleted" />
        </div>
    </div>

</template>

<style scoped>
.admin-panel {
    display: flex;
    flex-direction: column;
    height: 80vh;
}

.admin-header {
    display: flex;
    background-color: #2c3e50;
    border: 1em solid #2c3e50;
    border-radius: 15px;
}

.admin-header button {
    flex: 1;
    padding: 10px;
    background-color: white;
    color: #2c3e50;
    border: none;
    cursor: pointer;
    text-align: center;
    font-size: 1em;
    font-weight: bolder;
}

.admin-header button.active {
    background-color: #0492D2;
    color: white;
}

.admin-header button:hover {
    background-color: #45b5e9;
}

.tab-content {
    padding: 1em;
    /* Remove max-height and overflow here */
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    max-height: 70vh;
}
</style>