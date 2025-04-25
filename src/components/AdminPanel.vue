<script setup>
import { ref, computed, onMounted } from 'vue';
import { PAS } from '@/utils/pas-util'; // Import PAS for API calls
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Tabs and active tab
const activeTab = ref('Users'); // Tracks the currently active tab

// Data for users, companies, and contacts
const users = ref([]);
const companies = ref([]);
const contacts = ref([]);

// Columns for each tab
const userColumns = ref([
    { field: 'fullName', header: 'Puno ime' },
    { field: 'companyName', header: 'Tvrtka' },
    { field: 'visitPurpose', header: 'Svrha posjete' },
    { field: 'contactPerson', header: 'Kontakt osoba' },
]);

const companyColumns = ref([
    { field: 'name', header: 'Tvrtka' },
    // { field: 'industry', header: 'Industry' },
    // { field: 'location', header: 'Location' },
]);

const contactColumns = ref([
    { field: 'fullName', header: 'Puno ime' },
    { field: 'email', header: 'Email' },
    { field: 'phone', header: 'Mob.' },
]);

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

// Function to switch tabs
const switchTab = (tab) => {
    activeTab.value = tab;
    searchQuery.value = ''; // Clear search query when switching tabs
    companySearchQuery.value = '';
    contactSearchQuery.value = '';
};

// Fetch data from the backend
const fetchData = async () => {
    try {
        const [usersResponse, companiesResponse, contactsResponse] = await Promise.all([
            PAS.get('/users'),
            PAS.get('/companies'),
            PAS.get('/contacts'),
        ]);

        users.value = usersResponse.data;
        companies.value = companiesResponse.data;
        contacts.value = contactsResponse.data;

        console.log('Data fetched successfully:', { users: users.value, companies: companies.value, contacts: contacts.value });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Fetch data when the component is mounted
onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="admin-panel">
        <!-- Header with Tabs -->
        <header class="admin-header">
            <button @click="switchTab('Users')" :class="{ active: activeTab === 'Users' }">Gosti</button>
            <button @click="switchTab('Companies')" :class="{ active: activeTab === 'Companies' }">Tvrtke</button>
            <button @click="switchTab('Contacts')" :class="{ active: activeTab === 'Contacts' }">Kontakt osobe</button>
        </header>

        <!-- Tab Content -->
        <div class="tab-content">
            <!-- Users Tab -->
            <div v-if="activeTab === 'Users'">
                <input type="text" v-model="searchQuery" placeholder="Pretraži goste..." />
                <DataTable :value="filteredUsers" tableStyle="min-width: 50rem" responsiveLayout="scroll" autoLayout
                    showGridlines>
                    <Column v-for="col in userColumns" :key="col.field" :field="col.field" :header="col.header"
                        style="width: 25%;"></Column>
                </DataTable>
            </div>

            <!-- Companies Tab -->
            <div v-if="activeTab === 'Companies'">
                <input type="text" v-model="companySearchQuery" placeholder="Pretraži tvrtke..." />
                <DataTable :value="filteredCompanies" tableStyle="min-width: 50rem" responsiveLayout="scroll"
                    autoLayout>
                    <Column v-for="col in companyColumns" :key="col.field" :field="col.field" :header="col.header"
                        style="width: 33.33%;"></Column>
                </DataTable>
            </div>

            <!-- Contacts Tab -->
            <div v-if="activeTab === 'Contacts'">
                <input type="text" v-model="contactSearchQuery" placeholder="Pretraži kontakt osobe..." />
                <DataTable :value="filteredContacts" tableStyle="min-width: 50rem" responsiveLayout="scroll" autoLayout>
                    <Column v-for="col in contactColumns" :key="col.field" :field="col.field" :header="col.header"
                        style="width: 45%;"></Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-panel {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.admin-header {
    display: flex;
    background-color: #2c3e50;
    border: 1em solid #2c3e50;
    border-radius: 15px;
    /* padding: 10px; */
    /* border-bottom: 1px solid #ccc; */
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
    flex: 1;
    padding: 1em;
    overflow-y: auto;
}

input[type="text"] * {
    width: 100%;
    padding: 2em;
    margin-bottom: 2em;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: white;
}

input {
    margin-bottom: 2em;
    padding: 1em;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: #f8f9fa;
    color: black !important;
}

::v-deep(.p-datatable-thead > tr > th) {
    font-size: 1.5em;
    font-weight: bolder;
    /* text-align: center !important;
    vertical-align: middle !important; */
    /* border-bottom: 0.25em solid #ccc; */
    padding: 0.5em;
}

/* Center text in DataTable cells */
::v-deep(.p-datatable-tbody > tr > td) {
    /* text-align: center;
    vertical-align: middle; */
    padding: 0.5em;
    font-size: 1.2em;
}
</style>