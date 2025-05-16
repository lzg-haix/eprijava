<script setup>
import { ref, onMounted } from 'vue';

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
    // console.log('Item fields:', itemFields.value);
});

// polja za prikazati
const itemFields = ref(null);
function getItemFields(currentItem) {
    switch (currentItem) {
        case 'users':
            return [
                { header: 'ID', field: 'id' },
                { header: 'Ime i prezime', field: 'fullName' },
                { header: 'Tvrtka', field: 'companyName' },
                { header: 'Svrha posjeta', field: 'visitPurpose' },
                { header: 'Kontakt', field: 'contactPerson' },
                { header: 'GDPR', field: 'gdprAgreement' },
                { header: 'PIN', field: 'pinCode' },
                { header: 'Online', field: 'online' }
            ];
        case 'companies':
            return [
                { header: 'ID', field: 'id' },
                { header: 'Tvrtka', field: 'name' }
            ];
        case 'contacts':
            return [
                { header: 'ID', field: 'id' },
                { header: 'Ime i prezime', field: 'fullName' },
                { header: 'E-mail', field: 'email' },
                { header: 'Mob', field: 'phone' },
                { header: 'Odjel', field: 'department' }
            ];
        case 'visitPurposes':
            return [
                { header: 'ID', field: 'id' },
                { header: 'Ime i prezime', field: 'fullName' },
                { header: 'E-mail', field: 'email' },
                { header: 'Mob', field: 'phone' },
                { header: 'Odjel', field: 'department' }
            ];
        // case 'languages':
        //     return [
        //         { header: 'ID', field: 'id' },
        //         { header: 'Naziv jezika', field: 'languageName' },
        //     ];
        // case 'languageSets':
        //     return [
        //         { header: 'ID', field: 'id' },
        //         { header: 'Naziv seta jezika', field: 'setName' },
        //     ];
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
    if (props.newOrEdit === 'new') {
        emit('newItemCreated', { ...localItem.value });
    } else {
        emit('updateItem', { ...localItem.value });
    }
};

</script>

<template>
    <div class="dialog-wrapper">
        <div class="info-dialog">
            <div class="dialog-content">
                <p v-if="props.newOrEdit === 'new'" style="font-weight: bold">Dodaj novi zapis</p>
                <!-- novi zapis -->
                <!-- izostavljen ID jer se automatski dodijeli -->
                <div v-if="(itemFields && props.newOrEdit === 'new')">
                    <div v-for="field in itemFields.filter(f => f.field !== 'id')" :key="field.field"
                        class="form-group">
                        <label :for="field.field">{{ field.header }}: </label>
                        <div v-if="field.field === 'online' || field.field === 'gdprAgreement'">
                            <input :id="field.field" v-model="localItem[field.field]" type="checkbox"
                                :checked="!!itemToEdit[field.field]" />
                        </div>
                        <div v-else>
                            <input :id="field.field" v-model="localItem[field.field]" type="text" required />
                        </div>
                    </div>
                </div>

                <!-- izmjena zapisa -->
                <p v-if="props.newOrEdit === 'edit'" style="font-weight: bold">Izmjeni zapis</p>
                <div v-if="itemFields && props.newOrEdit === 'edit'">
                    <div v-for="field in itemFields.filter(f => f.field !== 'id')" :key="field.field"
                        class="form-group">
                        <label :for="field.field">{{ field.header }}: </label>
                        <div v-if="field.field === 'online' || field.field === 'gdprAgreement'">
                            <input :id="field.field" v-model="localItem[field.field]" type="checkbox"
                                :checked="!!itemToEdit[field.field]" />
                        </div>
                        <div v-else>
                            <input :id="field.field" v-model="localItem[field.field]" type="text" required />
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
}

.dialog-actions {
    margin-top: 1em;
    display: flex;
    justify-content: space-around;
}

.confirm-button {
    background-color: #d9534f;
    color: white;
    border: none;
    padding: 1em 2em;
    border-radius: 4px;
    cursor: pointer;
}

.cancel-button {
    background-color: #5bc0de;
    color: white;
    border: none;
    padding: 1em 2em;
    border-radius: 4px;
    cursor: pointer;
}

.confirm-button:hover {
    background-color: #c9302c;
}

.cancel-button:hover {
    background-color: #31b0d5;
}
</style>