<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

// import { oepas_dev2 } from '@/utils/pas-util';
// PAS - razvojna instanca na dev-inpos serveru
import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

const props = defineProps({
    currentlyDisplaying: {
        type: String,
        required: true
    },
    itemToEdit: {
        type: Object,
        default: null
    },
    newOrEdit: {
        type: String,
    }
});

onMounted(() => {
    getItemFields(props.currentlyDisplaying);
    if (props.newOrEdit === 'new') {
        getGeneratedPIN();
    }
});


// polja za prikazati
const itemFields = ref(null);
function getItemFields(currentItem) {
    switch (currentItem) {
        case 'Visitors':
            return [
                { header: 'ID', field: 'ID' },
                { header: 'Ime i prezime', field: 'FullName' },
                { header: 'Tvrtka', field: 'CompanyName' },
                { header: 'Aktivan', field: 'Active' },
                { header: 'Svrha posjeta', field: 'VisitPurpose' },
                { header: 'Kontakt', field: 'ContactPerson' },
                { header: 'GDPR', field: 'GDPRAgreement' },
                { header: 'PIN', field: 'PINCode' },
                { header: 'Online', field: 'Online' }
            ];
        case 'Companies':
            return [
                { header: 'ID', field: 'ID' },
                { header: 'Tvrtka', field: 'Name' }
            ];
        case 'Contacts':
            return [
                { header: 'ID', field: 'ID' },
                { header: 'Ime i prezime', field: 'FullName' },
                { header: 'E-mail', field: 'Email' },
                { header: 'Mob', field: 'Phone' },
                { header: 'Odjel', field: 'Department' }
            ];
        case 'VisitPurposes':
            return [
                { header: 'ID', field: 'id' },
                { header: 'Ime i prezime', field: 'fullName' },
                { header: 'E-mail', field: 'email' },
                { header: 'Mob', field: 'phone' },
                { header: 'Odjel', field: 'department' }
            ];
        case 'LanguagesEntries':
            return [
                { header: 'Slog', field: 'EntryName' },
                { header: 'Vrijednost', field: 'LangValue' },
                { header: 'Opis', field: 'EntryDescription' }
            ];
        case 'Languages':
            return [
                { header: 'ID', field: 'ID' },
                { header: 'Naziv', field: 'Name' },
                { header: 'Kod', field: 'LanguageCode' },
                { header: 'Zastava', field: 'Flag' }
            ];
        default:
            console.warn('Unknown currentlyDisplaying value:', currentItem);
            return null;
    }
}

itemFields.value = getItemFields(props.currentlyDisplaying);

const emit = defineEmits(['hideInfoDialog', 'updateItem', 'newItemCreated']);

// emitamo skrivanje dijaloga prema DataTable komponenti
const hideInfoDialog = async () => {
    try {
        emit('hideInfoDialog');
    } catch (error) {
        console.error('Error emitting hideInfoDialog:', error);
    };
};

const localItem = ref(props.newOrEdit === 'new' ? {} : { ...props.itemToEdit });
const getGeneratedPIN = async () => {
    try {
        const response = await PAS.get('/PIN');
        if (response?.data?.dsPIN?.ttPIN?.length > 0) {
            localItem.value.PINCode = response.data.dsPIN.ttPIN[0].PINCode;
            return response.data.dsPIN.ttPIN[0].PINCode;
        }
        throw new Error('No PIN received from server');
    } catch (error) {
        console.error('Error generating PIN:', error);
        throw error;
    }
};
// spremanje izmjena
const saveItem = () => {
    let wrappedItem;
    switch (props.currentlyDisplaying) {
        case 'Visitors':
            wrappedItem = { dsVisitors: { ttVisitors: [localItem.value] } };
            break;
        case 'Companies':
            wrappedItem = { dsCompanies: { ttCompanies: [localItem.value] } };
            break;
        case 'Contacts':
            wrappedItem = { dsContacts: { ttContacts: [localItem.value] } };
            break;
        case 'VisitPurposes':
            break;
        case 'LanguagesEntries':
            wrappedItem = { dsLanguagesEntries: { ttLanguagesEntries: [localItem.value] } };
            break;
        case 'Languages':
            break;
        default:
            console.warn('Unknown currentlyDisplaying value:', props.currentlyDisplaying);
            wrappedItem = { ...localItem.value };
    }
    if (props.newOrEdit === 'new') {
        console.log('Creating new item:', wrappedItem);
        emit('newItemCreated', wrappedItem);
    } else {
        console.log('Updating item:', wrappedItem);
        emit('updateItem', wrappedItem);
    }
};

// Helper to resize EntryDescription textarea if present
async function resizeEntryDescription() {
    await nextTick();
    const textarea = document.getElementById('EntryDescription');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
}

async function resizeLangValue() {
    await nextTick();
    const textarea = document.getElementById('LangValue');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
}

watch(
    [() => props.newOrEdit, () => props.itemToEdit],
    ([newOrEdit, itemToEdit]) => {
        if (newOrEdit === 'new') {
            localItem.value = {};
        } else {
            localItem.value = { ...itemToEdit };
        }
        resizeEntryDescription();
        resizeLangValue();
    },
    { immediate: true }
);

// Also watch for EntryDescription changes (typing)
watch(
    () => localItem.value.EntryDescription,
    resizeEntryDescription
);

// Also watch for LangValue changes (typing)
watch(
    () => localItem.value.LangValue,
    resizeLangValue
);

</script>

<template>
    <div class="dialog-wrapper">
        <div class="info-dialog">
            <div class="dialog-content">
                <p v-if="props.newOrEdit === 'new'" style="font-weight: bold">Dodaj novi zapis</p>
                <!-- novi zapis -->
                <!-- izostavljen ID jer se automatski dodijeli -->
                <div v-if="(itemFields && props.newOrEdit === 'new')">
                    <div v-for="field in itemFields.filter(f => f.field !== 'ID')" :key="field.field"
                        class="form-group">
                        <label :for="field.field">{{ field.header }}: </label>
                        <div
                            v-if="field.field === 'Online' || field.field === 'GDPRAgreement' || field.field === 'Active' || field.field === 'Online'">
                            <input :id="field.field" v-model="localItem[field.field]" type="checkbox"
                                :checked="!!itemToEdit[field.field]" />
                        </div>
                        <div v-else-if="field.field === 'EntryDescription'">
                            <textarea :id="field.field" v-model="localItem[field.field]" @input="autoResize($event)"
                                rows="1"
                                style="resize: none; overflow: hidden; width: 20em; text-align: left;"></textarea>
                        </div>
                        <div v-else-if="field.field === 'PINCode'">
                            <input :id="field.field" v-model="localItem[field.field]" type="text" readonly />
                        </div>
                        <div v-else>
                            <input :id="field.field" v-model="localItem[field.field]" type="text" required
                                :readonly="field.field === 'EntryName'" />
                        </div>
                    </div>
                </div>

                <!-- izmjena zapisa -->
                <p v-if="props.newOrEdit === 'edit'" style="font-weight: bold">Izmjeni zapis</p>
                <div v-if="itemFields && props.newOrEdit === 'edit'">
                    <div v-for="field in itemFields.filter(f => f.field !== 'ID')" :key="field.field"
                        class="form-group">
                        <label :for="field.field">{{ field.header }}: </label>
                        <div
                            v-if="field.field === 'Online' || field.field === 'GDPRAgreement' || field.field === 'Active' || field.field === 'Online'">
                            <input :id="field.field" v-model="localItem[field.field]" type="checkbox"
                                :checked="!!itemToEdit[field.field]" />
                        </div>
                        <div v-else-if="field.field === 'EntryDescription' | field.field === 'LangValue'">
                            <textarea class="description" :id="field.field" v-model="localItem[field.field]"
                                @input="autoResize($event)" rows="1"
                                style="resize: none; overflow: hidden; width: 20em; height: 2em; text-align: left;"></textarea>
                        </div>
                        <div v-else-if="field.field === 'PINCode'">
                            <input :id="field.field" v-model="localItem[field.field]" type="text" readonly />
                        </div>
                        <div v-else>
                            <input :id="field.field" v-model="localItem[field.field]" type="text" required
                                :readonly="field.field === 'EntryName'" />
                        </div>
                    </div>
                </div>

                <div class="dialog-actions">
                    <button @click.prevent="saveItem" class="confirm-button">Spremi</button>
                    <button @click="hideInfoDialog" class="cancel-button">Izađi</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dialog-content>p {
    color: black;
}

.info-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-content {
    background-color: white;
    color: black;
    padding: 3em;
    border: 3px solid #0492D2;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

input {
    width: 20em;
    text-align: center;
    height: 2rem;
    border: 1px solid black;
    font-size: 1em;
}

input:focus,
textarea:focus {
    outline: none;
    border-radius: 0;
    border: 2px solid #000000;
}

.description {
    width: 20em;
    text-align: left;
    border: 1px solid black;
    overflow: hidden;
    color: black;
    font-family: Arial, sans-serif;
    font-size: 1em;
}

.dialog-actions {
    margin-top: 1em;
    display: flex;
    justify-content: space-around;
}

.confirm-button {
    background-color: #0492D2;
    color: black;
    border: 1px solid #000;
    cursor: pointer;
    text-align: center;
    width: 5em;
    height: 3em;
}

.cancel-button {
    background-color: rgba(255, 30, 30, 0.842);
    color: black;
    border: 1px solid #000;
    cursor: pointer;
    text-align: center;
    width: 5em;
    height: 3em;
}

.confirm-button:hover {
    background-color: #06a6f0;
}

.cancel-button:hover {
    background-color: rgba(202, 37, 37, 0.842);
}
</style>