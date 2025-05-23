<script setup>
import { ref, computed, onMounted } from 'vue';
import DeleteDialog from './DeleteDialog.vue';
import InfoDialog from './InfoDialog.vue';

import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

// oepas_dev2 - razvojna instanca na dev-inpos serveru
import { oepas_dev2 } from '@/utils/pas-util';
if (!oepas_dev2) {
    console.error('oepas_dev2 instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    displayDetails: {
        type: Array,
        required: true
    },
    currentlyDisplaying: {
        type: String,
        required: true
    }
})

const whatToDisplay = ref();
const setDisplay = async () => {
    switch (props.currentlyDisplaying) {
        case 'Visitors':
            whatToDisplay.value = 1;
            break;
        case 'Companies':
            whatToDisplay.value = 2;
            break;
        case 'Contacts':
            whatToDisplay.value = 3;
            break;
        case 'Languages':
            whatToDisplay.value = 4;
            break;
        case 'LanguageSets':
            whatToDisplay.value = 5;
            break;
        default:
            console.warn('Unknown currentlyDisplaying value:', props.currentlyDisplaying);
            whatToDisplay.value = null;
    }
};

const headers = computed(() => props.displayDetails.map((detail) => detail.header));
const fields = computed(() => props.displayDetails.map((detail) => detail.field));


const newRow = async () => {
    console.log('Dodavanje novog retka');
    const requiredProperties = ref(Object.keys(props.data[0]))
    // ovdje dodajte logiku za dodavanje novog retka
};

// zakapči i otkapči listener za globalni klik da zatvori kontekst meni kad se klikne izvan njega
onMounted(() => {
    setDisplay();
});

// pregled
const previewRow = () => {
    console.log('Previewing row:', contextMenu.value.selectedRow);
    const requiredProperties = ref(Object.keys(props.data[0]))
};

// brisanje
const emit = defineEmits(['row-deleted', 'updateItem']); // Define an event to notify the parent

const showDeleteDialog = ref(false);
const itemToDelete = ref(null);
const passedItem = ref('');

const objectToDelete = ref({});

const confirmDelete = (item) => {
    itemToDelete.value = item;
    showDeleteDialog.value = true;
    switch (props.currentlyDisplaying) {
        case 'Visitors':
            passedItem.value = itemToDelete.value.FullName;
            objectToDelete.value = {
                dsVisitors: {
                    ttVisitors: [
                        {
                            ID: itemToDelete.value.ID,
                            FullName: itemToDelete.value.FullName,
                            CompanyName: itemToDelete.value.CompanyName,
                            VisitPurpose: itemToDelete.value.VisitPurpose,
                            ContactPerson: itemToDelete.value.ContactPerson,
                            GDPRAgreement: itemToDelete.value.GDPRAgreement,
                            PinCode: itemToDelete.value.PinCode,
                            Online: itemToDelete.value.Online
                        }
                    ]
                }
            }
            break;
        case 'Companies':
            passedItem.value = itemToDelete.value.Name;
            objectToDelete.value = {
                dsCompanies: {
                    ttCompanies: [
                        {
                            ID: itemToDelete.value.ID,
                            Name: itemToDelete.value.Name,
                            Address: itemToDelete.value.Address,
                            City: itemToDelete.value.City,
                            Country: itemToDelete.value.Country,
                            VATNumber: itemToDelete.value.VATNumber
                        }
                    ]
                }
            }
            break;
        case 'Contacts':
            passedItem.value = itemToDelete.value.FullName;
            objectToDelete.value = {
                dsContacts: {
                    ttContacts: [
                        {
                            ID: itemToDelete.value.ID,
                            FullName: itemToDelete.value.FullName,
                            Email: itemToDelete.value.Email,
                            Phone: itemToDelete.value.Phone,
                            Active: itemToDelete.value.Active,
                            Inserted: itemToDelete.value.Inserted,
                            Updated: itemToDelete.value.Updated,
                            InsertUser: itemToDelete.value.InsertUser,
                            UpdateUser: itemToDelete.value.UpdateUser,
                            Department: itemToDelete.value.Department
                        }
                    ]
                }
            }
            break;
        // case 'languages':
        //     passedItem.value = itemToDelete.value.fullName;
        //     break;
        // case 'languageSets':
        //     passedItem.value = itemToDelete.value.fullName;
        //     break;
    };
}

const deleteRow = async () => {
    try {
        const itemID = itemToDelete.value.ID;
        console.log('Deleting item with ID:', objectToDelete.value);
        await oepas_dev2.delete(`/${props.currentlyDisplaying}`, objectToDelete.value); // brisanje zapisa preko API-ja

        emit('row-deleted', itemID); // emit event za obavijest o brisanju

        console.log(`Item with ID ${itemID} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting user:', error);
    } finally {
        showDeleteDialog.value = false; // zatvori dijalog nakon brisanja
        itemToDelete.value = null; // resetiraj itemToDelete
    }
};

// dodavanje / izmjene
const handleUpdateItem = async (updatedItem) => {
    try {
        await PAS.put(`/${props.currentlyDisplaying}/${updatedItem.id}`, updatedItem);
        showInfoDialog.value = false;
        emit('updateItem', updatedItem); // emit event za obavijest o izmjeni
        itemToEdit.value = {}; // resetiraj itemToEdit
        console.log(`Item with ID ${updatedItem.id} updated successfully.`);
    } catch (error) {
        console.error('Error updating item:', error);
    }
};

const handleNewItem = async (newlyCreatedItem) => {
    try {
        // Find the last used user ID and increment it for the new user
        const lastItemId = props.data.length > 0 ? Math.max(...props.data.map(item => item.id)) : 0;
        newlyCreatedItem.id = lastItemId + 1;
        if (props.currentlyDisplaying === 'users') {
            let uniquePinCode;
            do {
                uniquePinCode = Math.floor(1000 + Math.random() * 9000);
            } while (props.data.some(data => data.pinCode === uniquePinCode));
            newlyCreatedItem.pinCode = uniquePinCode;
        }
        await PAS.post(`/${props.currentlyDisplaying}`, newlyCreatedItem);
        showInfoDialog.value = false;
        emit('newItemCreated', newlyCreatedItem); // emit event za obavijest o izmjeni
        console.log(`Item with ID ${newlyCreatedItem.id} created successfully.`);
    } catch (error) {
        console.error('Error updating item:', error);
    }
};

const showInfoDialog = ref(false);
const newOrEdit = ref(''); // 'new' ili 'edit'
const itemToEdit = ref({});
const editRow = async (item) => {
    newOrEdit.value = 'edit';
    itemToEdit.value = { ...item }; // Pass the full item object
    showInfoDialog.value = true; // Open the dialog
    console.log('Editing row:', itemToEdit.value);
};

const addRow = async () => {
    newOrEdit.value = 'new';
    showInfoDialog.value = true; // Open the dialog
    console.log('Editing row:', itemToEdit.value);
};

// pretraživanje
const searchQuery = ref('');
const filteredData = computed(() => {
    if (!searchQuery.value) {
        return props.data; // ako je upit prazan, vrati sve podatke
    }
    return props.data.filter((item) => {
        return fields.value.some((field) =>
            String(item[field]).toLowerCase().includes(searchQuery.value.toLowerCase()) // pretražuje sve polja, case insensitive
        );
    });
});

</script>

<template>
    <div class="wrapper">
        <div class="toolbar">
            <div class="add-user">
                <i class="pi pi-user-plus" @click="addRow"></i>
            </div>
            <input type="text" id="search-bar" placeholder="Pretraži..." v-model="searchQuery" />
        </div>
        <table>
            <thead>
                <tr class="table-header">
                    <th class="th-cell" v-for="header in headers" :key="header.ID">{{ header }}</th>
                    <th id="opcije">Opcije</th>
                </tr>
            </thead>

            <tbody>
                <tr class="table-row" v-for="item in filteredData" :key="item.ID">
                    <td class="td-cell" v-for="field in fields" :key="field">{{ item[field] }}</td>
                    <td class="td-button-cell">
                        <i class="pi pi-user-edit" @click="editRow(item)"></i>
                        <i class="pi pi-user-minus" @click="confirmDelete(item)"></i>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- dijalog za dodavanje/izmjenu zapisa -->
        <InfoDialog v-if="showInfoDialog" :newOrEdit="newOrEdit" :itemToEdit="itemToEdit"
            @newItemCreated="handleNewItem" @updateItem="handleUpdateItem" :currentlyDisplaying="currentlyDisplaying"
            @hideInfoDialog="showInfoDialog = false" />

        <!-- dijalog za brisanje zapisa -->
        <DeleteDialog v-if="showDeleteDialog" :itemToDelete=passedItem @row-deleted="deleteRow"
            @hideDeleteDialog="showDeleteDialog = false" />
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.toolbar {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    margin-bottom: 1em;
}

.pi-user-plus {
    cursor: pointer;
    margin-right: 3.33em;
    color: limegreen;
}

.pi-user-edit {
    color: yellow;
}

.pi-user-minus {
    color: red;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background-color: #0492D2;
}

th,
td {
    text-align: left;
    padding: 8px;
    border: 1px solid #ddd;
}

#opcije {
    text-align: center;
    width: 7.5em;
}

th {
    font-weight: bold;
}

/* tbody tr:nth-child(even) {
    background-color: #f9f9f9;
} */

tbody tr:hover {
    background-color: #517ba3;
}

.td-button-cell {
    text-align: center;
    gap: 1em;
}

.td-button-cell i {
    cursor: pointer;
    margin: 0 1em;
}
</style>