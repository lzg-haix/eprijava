<script setup>
import { onMounted } from 'vue';
import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

const props = defineProps({
    itemToDelete: {
        type: String,
        required: true
    }
})

// emitamo evente prema DataTable komponenti
// row-deleted - kada se redak obriše
// hideDeleteDialog - kada se dijalog zatvori bez brisanja
const emit = defineEmits(['row-deleted', 'hideDeleteDialog']);

// šalje emit event prema DataTable komponenti koja proslijeđuje taj emit prema AdminPanelu u kojem se poziva funkcija za brisanje sloga
const deleteRow = async () => {
    try {

        emit('row-deleted');
    } catch (error) {
        console.error('Error emitting row-deleted:', error);
    }
};

// emitamo skrivanje dijaloga prema DataTable komponenti
const hideDeleteDialog = async () => {
    try {
        emit('hideDeleteDialog');
    } catch (error) {
        console.error('Error emitting hideDeleteDialog:', error);
    };
};

onMounted(() => {
    // Ovdje možete dodati logiku koja se izvršava prilikom montiranja komponente
    console.log('DeleteDialog komponenta je montirana.');
    console.log('Brisanje retka:', props.itemToDelete);
});
</script>

<template>
    <div class="confirmation-dialog-wrapper">
        <div class="delete-dialog">
            <div class="dialog-content">
                <p>Jeste li sigurni da želite obrisati slog: <strong>{{ props.itemToDelete }}</strong>?</p>
                <div class="dialog-actions">
                    <button @click="deleteRow" class="confirm-button">Da</button>
                    <button @click="hideDeleteDialog" class="cancel-button">Ne</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dialog-content>p {
    color: black;
}

.delete-dialog {
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
    padding: 3em;
    border-radius: 1.5em;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.dialog-actions {
    margin-top: 2em;
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