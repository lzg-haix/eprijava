<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

// import { oepas_dev2 } from '@/utils/pas-util';

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

// // vatrodojava - ispis i pregled
// const fOnlineUsers = ref([]);
// const fGetOnlineUsers = async () => {
//     try {
//         const response = await oepas_dev2.get('/Visitors?filter=online%20=%20true');
//         fOnlineUsers.value = response.data.dsVisitors.ttVisitors;
//         // console.log('Online users:', fOnlineUsers.value);
//     } catch (error) {
//         console.error('Error fetching online users:', error);
//     }
// };

const localItem = ref({ ...props.itemToEdit });

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
        emit('newItemCreated', wrappedItem);
    } else {
        console.log('Updating item:', localItem.value);
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
    () => {
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
                                style="resize: none; overflow: hidden; width: 20em; border-radius: 0.5em; text-align: left;"></textarea>
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
                                style="resize: none; overflow: hidden; width: 20em; border-radius: 0.5em; text-align: left;"></textarea>
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
    border-radius: 1.5em;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

input {
    width: 20em;
    text-align: center;
    border-radius: 0.5em;
    border: 1px solid black;
}

.description {
    width: 20em;
    text-align: left;
    border: 1px solid black;
    border-radius: 0.5em;
    overflow: hidden;
    color: black;
    font-family: Arial, sans-serif;
}

.dialog-actions {
    margin-top: 1em;
    display: flex;
    justify-content: space-around;
}

.confirm-button {
    background-color: #09ff00;
    color: black;
    border: 1px solid #000;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    width: 5em;
    height: 3em;
}

.cancel-button {
    background-color: #fbff00;
    color: black;
    border: 1px solid #000;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    width: 5em;
    height: 3em;
}

.confirm-button:hover {
    background-color: #67e663;
}

.cancel-button:hover {
    background-color: #dee05e;
}
</style>