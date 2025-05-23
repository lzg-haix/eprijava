<script setup>
import { ref, onMounted, watch } from 'vue';
import DeleteDialog from './DeleteDialog.vue';
import InfoDialog from './InfoDialog.vue';

// oepas_dev2 - razvojna instanca na dev-inpos serveru
import { oepas_dev2 } from '@/utils/pas-util';
if (!oepas_dev2) {
    console.error('oepas_dev2 instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

const languages = ref([]);
const getLanguages = async () => {
    try {
        const response = await oepas_dev2.get('/Languages?filter=Active%20=%20yes');
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
        const response = await oepas_dev2.get(`/LanguagesEntries?filter=LanguageID=${selectedLanguageId.value}`);
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
    showInfoDialog.value = true;
};
const handleUpdateItem = async (updatedItem) => {
    const payload = {
        dsLanguagesEntries: {
            ttLanguagesEntries: [
                {
                    ...updatedItem,
                    // LanguageID: selectedLanguageId.value
                }
            ]
        }
    };
    try {
        await oepas_dev2.put(`/LanguagesEntries`, payload);
        await getLanguagesEntries();
    } catch (error) {
        console.error('Greška kod ažuriranja prijevoda:', error);
    }
    showInfoDialog.value = false;
};

const confirmDelete = (entry) => {
    passedItem.value = entry;
    showDeleteDialog.value = true;
};
const deleteRow = async () => {
    const payload = {
        dsLanguagesEntries: {
            ttLanguagesEntries: [
                {
                    ID: passedItem.value.ID
                }
            ]
        }
    };
    try {
        await oepas_dev2.delete(`/LanguagesEntries/${passedItem.value.ID}`, { data: payload });
        await getLanguagesEntries();
    } catch (error) {
        console.error('Greška kod brisanja prijevoda:', error);
    }
    showDeleteDialog.value = false;
};

</script>

<template>
    <div class="wrapper">

        <div class="language-selector">
            <button v-for="lang in languages" :key="lang.ID" :class="{ selected: selectedLanguageId === lang.ID }"
                @click="selectedLanguageId = lang.ID">
                <span :class="lang.Flag"></span> {{ lang.Name }}
            </button>
        </div>

        <div class="toolbar">
            <div class="add-user">
                <i class="pi pi-plus" @click="addRow"></i>
            </div>
            <input type="text" id="search-bar" placeholder="Pretraži..." v-model="searchQuery" />
        </div>

        <!-- Translations Table -->
        <div class="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th class="fixed-col">Slog</th>
                        <th>Vrijednost</th>
                        <th id="opcije">Opcije</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="entry in languageEntries" :key="entry.ID">
                        <td class="fixed-col">{{ entry.EntryName }}</td>
                        <td>{{ entry.LangValue }}</td>
                        <td class="td-button-cell">
                            <i class="pi pi-pencil" @click="editRow(entry)"></i>
                            <!-- <i class="pi pi-trash" @click="confirmDelete(entry)"></i> -->
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- dijalog za dodavanje/izmjenu zapisa -->
        <InfoDialog v-if="showInfoDialog" :newOrEdit="'edit'" :itemToEdit="itemToEdit" @newItemCreated="handleNewItem"
            @updateItem="handleUpdateItem" :currentlyDisplaying="'LanguagesEntries'"
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

.language-selector {
    display: flex;
    gap: 0.5em;
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

.language-selector span {
    margin-right: 0.5em;
}

.toolbar {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    margin-bottom: 1em;
}

.pi-plus {
    cursor: pointer;
    margin-right: 3.33em;
    color: limegreen;
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
    /* Ensures a solid top border */
    /* Optional for visual separation: */
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
    max-height: 65vh;
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