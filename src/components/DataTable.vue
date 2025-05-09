<script setup>
import { ref, computed, onMounted } from 'vue';

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

const whatToDisplay = ref();
const setDisplay = async () => {
    switch (props.currentlyDisplaying) {
        case 'users':
            whatToDisplay.value = 1;
            break;
        case 'companies':
            whatToDisplay.value = 2;
            break;
        case 'contacts':
            whatToDisplay.value = 3;
            break;
        case 'languages':
            whatToDisplay.value = 4;
            break;
        case 'languageSets':
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
const emit = defineEmits(['row-deleted']); // Define an event to notify the parent
const deleteRow = async (item) => {
    try {
        const userId = item.id; // Assuming `id` is the unique identifier
        await PAS.delete(`/users/${userId}`); // Replace `/users` with your actual API endpoint

        // Emit an event to notify the parent component
        emit('row-deleted', userId);

        console.log(`User with ID ${userId} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting user:', error);
    }
};
</script>

<template>
    <div class="wrapper">
        <div class="toolbar">
            <i class="pi pi-user-plus" @click="newRow"></i>
            <input type="text" id="search-bar" placeholder="Pretraži...">
        </div>
        <table>
            <thead>
                <tr class="table-header">
                    <th class="th-cell" v-for="header in headers" :key="header.id">{{ header }}</th>
                    <th>Opcije</th>
                </tr>
            </thead>

            <tbody>
                <tr class="table-row" v-for="item in data" :key="item.id">
                    <td class="td-cell" v-for="field in fields" :key="field">{{ item[field] }}</td>
                    <td class="td-button-cell">
                        <i class="pi pi-user-edit" @click="editRow"></i>
                        <i class="pi pi-user-minus" @click="deleteRow(item)"></i>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

table {
    width: 100%;
    border-collapse: collapse;
    /* Ensures no gaps between table cells */
}

thead {
    /* background-color: #f4f4f4; */
    /* Optional: Add a background color for the header */
}

th,
td {
    text-align: left;
    /* Align text to the left */
    padding: 8px;
    /* Add padding for better readability */
    border: 1px solid #ddd;
    /* Add borders for clarity */
}

th {
    font-weight: bold;
    /* Make headers bold */
}

tbody tr:nth-child(even) {
    /* background-color: #f9f9f9; */
    /* Optional: Add alternating row colors */
}

tbody tr:hover {
    background-color: #f1f1f1;
    /* Optional: Highlight row on hover */
}

.td-button-cell {
    text-align: center;
    /* Center-align buttons in the options column */
}

.td-button-cell i {
    cursor: pointer;
    /* Show a pointer cursor for icons */
    margin: 0 5px;
    /* Add spacing between icons */
}
</style>