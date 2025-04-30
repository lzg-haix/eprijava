<script setup>
import { ref, computed, onMounted } from 'vue';
import { PAS } from '@/utils/pas-util';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

const activeTab = ref('Users'); // Tracks the currently active tab
const editingRows = ref([]); // Tracks the rows being edited

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
    searchQuery.value = '';
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

// Handle row edit save
const onRowEditSave = async (event) => {
    const { newData } = event;

    try {
        // Determine the active tab and update the corresponding data source
        if (activeTab.value === 'Users') {
            await PAS.patch(`/users/${newData.id}`, newData);
            const index = users.value.findIndex((user) => user.id === newData.id);
            if (index !== -1) users.value[index] = newData;
        } else if (activeTab.value === 'Companies') {
            await PAS.patch(`/companies/${newData.id}`, newData);
            const index = companies.value.findIndex((company) => company.id === newData.id);
            if (index !== -1) companies.value[index] = newData;
        } else if (activeTab.value === 'Contacts') {
            await PAS.patch(`/contacts/${newData.id}`, newData);
            const index = contacts.value.findIndex((contact) => contact.id === newData.id);
            if (index !== -1) contacts.value[index] = newData;
        }

        console.log('Row updated:', newData);
    } catch (error) {
        console.error('Error updating row:', error);
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
                <DataTable v-model:editingRows="editingRows" :value="filteredUsers" editMode="row" dataKey="id"
                    @row-edit-save="onRowEditSave" tableStyle="min-width: 50rem" responsiveLayout="scroll" autoLayout
                    showGridlines>
                    <Column v-for="col in userColumns" :key="col.field" :field="col.field" :header="col.header"
                        style="width: 25%;">
                        <template #editor="{ data, field }">
                            <InputText v-model="data[field]" fluid />
                        </template>
                    </Column>
                    <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
                    </Column>
                </DataTable>
            </div>

            <!-- Companies Tab -->
            <div v-if="activeTab === 'Companies'">
                <input type="text" v-model="companySearchQuery" placeholder="Pretraži tvrtke..." />
                <DataTable v-model:editingRows="editingRows" :value="filteredCompanies" editMode="row" dataKey="id"
                    @row-edit-save="onRowEditSave" tableStyle="min-width: 50rem" responsiveLayout="scroll" autoLayout>
                    <Column v-for="col in companyColumns" :key="col.field" :field="col.field" :header="col.header"
                        style="width: 33.33%;">
                        <template #editor="{ data, field }">
                            <InputText v-model="data[field]" fluid />
                        </template>
                    </Column>
                    <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
                    </Column>
                </DataTable>
            </div>

            <!-- Contacts Tab -->
            <div v-if="activeTab === 'Contacts'">
                <input type="text" v-model="contactSearchQuery" placeholder="Pretraži kontakt osobe..." />
                <DataTable v-model:editingRows="editingRows" :value="filteredContacts" editMode="row" dataKey="id"
                    @row-edit-save="onRowEditSave" tableStyle="min-width: 50rem" responsiveLayout="scroll" autoLayout>
                    <Column v-for="col in contactColumns" :key="col.field" :field="col.field" :header="col.header"
                        style="width: 45%;">
                        <template #editor="{ data, field }">
                            <InputText v-model="data[field]" fluid />
                        </template>
                    </Column>
                    <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
                    </Column>
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

/* ::v-deep(.p-datatable-thead > tr > th) {
    font-size: 1.5em;
    font-weight: bolder;

    padding: 0.5em;
}

::v-deep(.p-datatable-tbody > tr > td) {

    padding: 0.5em;
    font-size: 1.2em;
} */
</style>