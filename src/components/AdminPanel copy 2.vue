<script setup>
import { ref, computed, onMounted } from 'vue';
import { PAS } from '@/utils/pas-util';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toolbar from 'primevue/toolbar';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import SplitButton from 'primevue/splitbutton';

const activeTab = ref('Users'); // Tracks the currently active tab
const editingRows = ref([]); // Tracks the rows being edited

const items = ref([
    {
        label: 'Update',
        icon: 'pi pi-refresh'
    },
    {
        label: 'Delete',
        icon: 'pi pi-times'
    }
])

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
        // Debugging: Log the editingRows object
        console.log('Row updated:', newData);
    } catch (error) {
        console.error('Error updating row:', error);
    }
};

// Fetch data when the component is mounted
onMounted(() => {
    fetchData();
});

const userDialog = ref(false); // Controls the visibility of the user dialog
const newUser = ref({}); // Holds the new user data
const showNewUserDialog = async () => {
    try {
        userDialog.value = true; // Show the dialog
    } catch (error) {
        console.error('Error adding user:', error);
    }
};
const addUser = async () => {
    try {
        // Find the last used user ID and increment it for the new user
        const lastUserId = users.value.length > 0 ? Math.max(...users.value.map(user => user.id)) : 0;
        newUser.value.id = lastUserId + 1;

        // Assign the new user's Online value to false
        newUser.value.online = false;

        // Generate a unique 4-digit pinCode for the new user
        let uniquePinCode;
        do {
            uniquePinCode = Math.floor(1000 + Math.random() * 9000);
        } while (users.value.some(user => user.pinCode === uniquePinCode));
        newUser.value.pinCode = uniquePinCode;

        // Make a POST request to create a new user
        const response = await PAS.post('/users', newUser.value);

        // Add the newly created user to the users list
        users.value.push(response.data);

        // Reset the newUser object and close the dialog
        newUser.value = {};
        userDialog.value = false;

        console.log('User added successfully:', response.data);
    } catch (error) {
        console.error('Error adding user:', error);
    }
};

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
                <div class="toolbar">
                    <div class="toolbar-start">
                        <Button class="new" icon="pi pi-plus" @click="showNewUserDialog" />
                    </div>
                    <div class="toolbar-center"><input type="text" class="search" v-model="searchQuery"
                            placeholder="Unesite ime"></div>
                    <div class="toolbar-end"></div>
                </div>
                <div class="datatable">
                    <DataTable :value="filteredUsers" dataKey="id" v-model="searchQuery" tableStyle="min-width: 20rem"
                        responsiveLayout="scroll">
                        <Column v-for="col in userColumns" :key="col.field" :field="col.field" :header="col.header"
                            style="width: 25%;" sortable>
                        </Column>
                        <Column>
                            <template #body>
                                <div class="datatable-buttons">
                                    <Button icon="pi pi-pencil" />
                                    <Button icon="pi pi-trash" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <Dialog v-model:visible="userDialog" :visible="false" header="Edit Profile" :dismissable-mask="false"
                    :modal="true" :closable="true"
                    :style="{ width: '25vw', height: auto, color: 'black', background: 'white' }">
                    <div class="dialog-wrapper">
                        <div class="field">
                            <label for="fullName">Puno ime</label>
                            <InputText id="fullName" v-model="newUser.fullName" required />
                        </div>
                        <div class="field">
                            <label for="companyName">Tvrtka</label>
                            <InputText id="companyName" v-model="newUser.companyName" required />
                        </div>
                        <div class="field">
                            <label for="visitPurpose">Svrha posjete</label>
                            <InputText id="visitPurpose" v-model="newUser.visitPurpose" required />
                        </div>
                        <div class="field">
                            <label for="contactPerson">Kontakt osoba</label>
                            <InputText id="contactPerson" v-model="newUser.contactPerson" required />
                        </div>
                        <div class="dialog-footer">
                            <Button label="Spremi" icon="pi pi-check" type="submit" @click="addUser" />
                            <Button label="Odustani" icon="pi pi-times" class="p-button-text"
                                @click="userDialog = false" />
                        </div>
                    </div>
                </Dialog>

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
::v-deep(.p-dialog .p-component) {
    background-color: #2c3e50;
    color: white;
    font-weight: bolder;
    font-size: 1.5em;
}

.dialog-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1em;
    background-color: white;
    border: 3px solid red;
    border-radius: 1em;
}

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

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
}

::v-deep(.p-iconfield) {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 1em;
    text-align: center;
}

.datatable-buttons {
    display: flex;
    flex-direction: row;
    gap: 0.25em;
}
</style>