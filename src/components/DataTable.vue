<script setup>
import { ref, computed, onMounted } from 'vue';
import DeleteDialog from './DeleteDialog.vue';
import InfoDialog from './InfoDialog.vue';

// import { PAS } from '@/utils/pas-util';
// if (!PAS) {
//     console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
// } else {
//     // console.log('PAS instanca povezana.');
// }

// PAS - razvojna instanca na dev-inpos serveru
import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
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

const maximized = ref(false);

const toggleMaximize = () => {
    maximized.value = !maximized.value;
};

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

const getCreateIcon = computed(() => {
    switch (props.currentlyDisplaying) {
        case 'Visitors':
        case 'Contacts':
            return 'pi pi-user-plus';
        case 'Companies':
            return 'pi pi-plus-circle';
        default:
            return 'pi pi-sparkles';
    }
});

const getEditIcon = computed(() => {
    switch (props.currentlyDisplaying) {
        case 'Visitors':
        case 'Contacts':
            return 'pi pi-user-edit';
        case 'Companies':
            return 'pi pi-pen-to-square';

        default:
            return 'pi pi-sparkles';
    }
});

const getDeleteIcon = computed(() => {
    switch (props.currentlyDisplaying) {
        case 'Visitors':
        case 'Contacts':
            return 'pi pi-user-minus';
        case 'Companies':
            return 'pi pi-times-circle';

        default:
            return 'pi pi-trash';
    }
});

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
        const getItem = await PAS.get(`/${props.currentlyDisplaying}?filter=ID%20=%20${itemToDelete.value.ID}`);
        console.log('Item to delete:', getItem.data);
        await PAS.delete(`/${props.currentlyDisplaying}`, getItem.data); // brisanje zapisa preko API-ja

        emit('row-deleted', itemToDelete.value.ID); // emit event za obavijest o brisanju

        console.log(`Item with ID ${itemToDelete.value.ID} deleted successfully.`);
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
        await PAS.put(`/${props.currentlyDisplaying}`, updatedItem);
        showInfoDialog.value = false;
        emit('updateItem', updatedItem); // emit event za obavijest o izmjeni
        itemToEdit.value = {}; // resetiraj itemToEdit
    } catch (error) {
        console.error('Error updating item:', error);
    }
};

const handleNewItem = async (newlyCreatedItem) => {
    try {
        // Find the last used user ID and increment it for the new user
        // const lastItemId = props.data.length > 0 ? Math.max(...props.data.map(item => item.id)) : 0;
        // newlyCreatedItem.id = lastItemId + 1;
        await PAS.post(`/${props.currentlyDisplaying}`, newlyCreatedItem);
        showInfoDialog.value = false;
        emit('newItemCreated', newlyCreatedItem); // emit event za obavijest o izmjeni
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
                <i :class="getCreateIcon" @click="addRow"></i>
            </div>
            <input type="text" id="search-bar" placeholder="Pretraži..." v-model="searchQuery" />
        </div>
        <div class="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th class="th-cell" v-for="header in headers" :key="header.ID">{{ header }}</th>
                        <th id="opcije">Opcije</th>
                    </tr>
                </thead>

                <tbody class="table-body">
                    <tr class="table-row" v-for="item in filteredData" :key="item.ID">
                        <td class="td-cell" v-for="field in fields" :key="field">{{ item[field] }}</td>
                        <td class="td-button-cell">
                            <i :class="getEditIcon" @click="editRow(item)"></i>
                            <i :class="getDeleteIcon" @click="confirmDelete(item)"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <InfoDialog v-if="showInfoDialog" :newOrEdit="newOrEdit" :itemToEdit="itemToEdit"
            @newItemCreated="handleNewItem" @updateItem="handleUpdateItem" :currentlyDisplaying="currentlyDisplaying"
            @hideInfoDialog="showInfoDialog = false" />

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

#search-bar {
    height: 2em;
}

.pi-user-plus,
.pi-plus-circle {
    cursor: pointer;
    margin-right: 3.33em;
    color: rgba(88, 255, 88, 0.788);
}

.pi-user-edit,
.pi-pen-to-square {
    color: #0492D2;
}

.pi-user-minus,
.pi-times-circle {
    color: rgba(255, 30, 30, 0.842);
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

.table-scroll {
    max-height: 70vh;
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
}

thead th {
    position: sticky;
    top: 0;
    background-color: #0492D2;
    z-index: 2;
    color: white;
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.15);
    border-top: none;
}
</style>