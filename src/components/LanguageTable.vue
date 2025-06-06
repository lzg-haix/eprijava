<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import DeleteDialog from './DeleteDialog.vue';
import InfoDialog from './InfoDialog.vue';

// PAS - razvojna instanca na dev-inpos serveru
import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

const languages = ref([]);
const getLanguages = async () => {
    try {
        const response = await PAS.get('/Languages?filter=Active%20=%20yes');
        languages.value = response.data.dsLanguages.ttLanguages
            .sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error('Došlo je do greške kod dohvaćanja jezika:', error);
    }
};

const languageEntries = ref([]);

const getLanguagesEntries = async () => {
    if (!selectedLanguageId.value) return;
    try {
        const response = await PAS.get(`/LanguagesEntries?filter=LanguageID=${selectedLanguageId.value}`);
        languageEntries.value = response.data.dsLanguagesEntries.ttLanguagesEntries || [];
    } catch (error) {
        console.error('Greška kod dohvaćanja prijevoda:', error);
        languageEntries.value = [];
    }
};

const selectedLanguageId = ref(null);

onMounted(async () => {
    await getLanguages();
    if (languages.value.length) {
        selectedLanguageId.value = languages.value[0].ID;
        await getLanguagesEntries();
    }
});

watch(selectedLanguageId, async () => {
    await getLanguagesEntries();
});

const showInfoDialog = ref(false);
const showDeleteDialog = ref(false);
const itemToEdit = ref({});
const passedItem = ref(null);
const editRow = (entry) => {
    itemToEdit.value = { ...entry };
    newOrEdit.value = 'edit';
    showInfoDialog.value = true;
};
const handleUpdateItem = async (updatedItem) => {
    const payload = {
        dsLanguagesEntries: {
            ttLanguagesEntries: [
                {
                    ...updatedItem,
                }
            ]
        }
    };
    try {
        await PAS.put(`/LanguagesEntries`, updatedItem);
        await getLanguagesEntries();
    } catch (error) {
        console.error('Greška kod ažuriranja prijevoda:', error);
    }
    showInfoDialog.value = false;
    itemToEdit.value = {};
};

const searchQuery = ref('');

const filteredEntries = computed(() => {
    if (!languageEntries.value) return [];
    let entries = languageEntries.value.filter(entry => entry.EntryName !== 'visitPurposes');
    if (!searchQuery.value) return entries;
    const q = searchQuery.value.toLowerCase();
    return entries.filter(
        entry =>
            (entry.EntryName && entry.EntryName.toLowerCase().includes(q)) ||
            (entry.LangValue && entry.LangValue.toLowerCase().includes(q))
    );
});

const newOrEdit = ref(''); // 'new' ili 'edit'

const addRow = async () => {
    newOrEdit.value = 'new';
    showInfoDialog.value = true; // Open the dialog
};

</script>

<template>
    <div class="wrapper">

        <div class="toolbar">
            <input type="text" id="search-bar" placeholder="Pretraži..." v-model="searchQuery" />
            <div class="language-options">
                <div class="language-selector">
                    <button v-for="lang in languages" :key="lang.ID"
                        :class="{ selected: selectedLanguageId === lang.ID }" @click="selectedLanguageId = lang.ID">
                        <span :class="lang.Flag"></span> {{ lang.Name }}
                    </button>
                </div>
                <!-- <div class="add-user">
                    <i class="pi pi-plus" @click="addRow"></i>
                </div> -->
            </div>
        </div>

        <div class="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th class="fixed-col">Slog</th>
                        <th>Opis</th>
                        <th>Vrijednost</th>
                        <th id="opcije">Opcije</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in filteredEntries" :key="entry.ID">
                        <td class="fixed-col">{{ entry.EntryName }}</td>
                        <td style="width: 30em; word-break: break-all;">{{ entry.EntryDescription }}</td>
                        <td>{{ entry.LangValue }}</td>
                        <td class="td-button-cell">
                            <i class="pi pi-pencil" @click="editRow(entry)"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- dijalog za dodavanje/izmjenu zapisa -->
        <InfoDialog v-if="showInfoDialog" :newOrEdit="newOrEdit" :itemToEdit="itemToEdit"
            @newItemCreated="handleNewItem" @updateItem="handleUpdateItem" :currentlyDisplaying="'LanguagesEntries'"
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

.language-options {
    display: flex;
    align-items: center;
    gap: 1em;
}

.language-selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1em;
    margin-bottom: 1em;
}

.language-selector button {
    padding: 0.5em 1em;
    border: 1px solid #0492D2;
    background: #fff;
    cursor: pointer;
    border-radius: 5px;
    font-weight: bold;
    transition: background 0.2s, color 0.2s;
}

.language-selector button.selected {
    background: #0492D2;
    color: #fff;
}

.toolbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1em;
}

#search-bar {
    height: 2em;
}

.pi-plus {
    cursor: pointer;
    margin-right: 2.5em;
    color: limegreen;
    margin-bottom: 1.2em;
}

.pi-pencil {
    color: yellow;
}

.pi-trash {
    color: red;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background-color: #0492D2;
}

thead th {
    position: sticky;
    top: 0;
    background-color: #0492D2;
    z-index: 2;
    color: white;
    border-top: none;
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.15);
}

th,
td {
    text-align: left;
    padding: 8px;
    border: 1px solid #ddd;
}

#opcije {
    text-align: center;
    width: 3em;
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
    max-height: 66vh;
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

.table-scroll table {
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
}

.fixed-col {
    width: 12.5em;
    min-width: 12.5em;
    max-width: 12.5em;
    word-break: break-all;
}
</style>