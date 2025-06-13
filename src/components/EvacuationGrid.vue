<script setup>
import { PAS } from '@/utils/pas-util';
if (!PAS) {
    console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
    // console.log('PAS instanca povezana.');
}

let onlineUsers = async () => {
    try {
        const response = await PAS.get('/Visitors?filter=Online%20=%20yes');
        return response.data.dsVisitors.ttVisitors;
    } catch (error) {
        console.error('Došlo je do greške kod dohvaćanja online korisnika:', error);
        return [];
    }
};

const headers = ['RedBr', 'Puno ime', 'Tvrtka', 'Vrijeme prijave', 'Kontakt osoba'];
import { ref, onMounted } from 'vue';

const fields = ['RedBr', 'FullName', 'CompanyName', 'Updated', 'ContactPerson'];
const data = ref([]);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('hr-HR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const fetchData = async () => {
    const users = await onlineUsers();
    console.log('Online korisnici:', users);
    data.value = users.map((user, idx) => ({
        RedBr: idx + 1,
        FullName: user.FullName,
        CompanyName: user.CompanyName,
        Updated: formatDate(user.Updated),
        ContactPerson: user.ContactPerson,
    }));
};

onMounted(() => {
    fetchData();
    setTimeout(() => {
        window.print();
    }, 500); // Wait a bit to ensure data is rendered
});

const getCurrentDateTime = () => {
    return new Date().toLocaleString('hr-HR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

</script>
<template>
    <div class="wrapper">
        <div>
            <div class="print-header">
                <p>Broj prisutnih gostiju: {{ data.length }} | Vrijeme ispisa: {{ getCurrentDateTime() }}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th class="th-cell" v-for="header in headers" :key="header">{{ header }}</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row" v-for="item in data" :key="item.RedBr">
                        <td class="td-cell" v-for="field in fields" :key="field">{{ item[field] }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    min-height: 100vh;
    width: 100vw;
    background: #eaf6fb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
}

/* Replace existing table styles */
table {
    width: 90vw;
    max-width: 1100px;
    background: #fff;
    /* border-radius: 12px; */
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border-collapse: collapse;
    overflow: hidden;
    table-layout: fixed;
}

th,
td {
    padding: 0.8em 1em;
    text-align: left;
    font-size: 1em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Column widths */
th:nth-child(1),
td:nth-child(1) {
    width: 12%;
}

/* RedBr */
th:nth-child(2),
td:nth-child(2) {
    width: 25%;
}

/* Puno ime */
th:nth-child(3),
td:nth-child(3) {
    width: 25%;
}

/* Tvrtka */
th:nth-child(4),
td:nth-child(4) {
    width: 15%;
}

/* Vrijeme prijave */
th:nth-child(5),
td:nth-child(5) {
    width: 23%;
}

/* Kontakt osoba */

th {
    background: #0492d2;
    color: #fff;
    font-weight: 700;
    letter-spacing: 0.05em;
}

tbody tr:nth-child(even) {
    background: #f3fafd;
}

tbody tr:hover {
    background: #d1e9f6;
}

.td-cell {
    border-bottom: 1px solid #e0e0e0;
}

.table-row:last-child .td-cell {
    border-bottom: none;
}

.print-header {
    display: none;
    /* Hidden by default */
}

@media print {

    /* Hide everything first */
    * {
        display: none !important;
    }

    /* Then only show what we want to print */
    .wrapper,
    .wrapper>div,
    .print-header,
    .print-header p,
    table,
    thead,
    tbody,
    tr,
    th,
    td {
        display: revert !important;
        visibility: visible !important;
    }

    @page {
        size: A4 portrait;
        margin: 0.5cm;
    }

    /* Reset wrapper positioning */
    .wrapper {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: auto !important;
        background: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Show print content */
    .print-header,
    .print-header *,
    table,
    table * {
        visibility: visible !important;
    }

    /* Position the header at top */
    .print-header {
        display: block !important;
        padding-top: 0 !important;
        margin: 0 0 0.5cm 0 !important;
        text-align: center !important;
        font-size: 11pt !important;
    }

    /* Position table directly under header */
    table {
        margin: 0 auto !important;
        width: 98% !important;
        border-collapse: collapse !important;
        border: 2px solid #000 !important;
        page-break-inside: auto !important;
    }

    thead {
        display: table-header-group !important;
    }

    tbody {
        display: table-row-group !important;
    }

    tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
    }

    th,
    td {
        padding: 0.15cm !important;
        font-size: 9pt !important;
        border: 1px solid #000 !important;
        line-height: 1.1 !important;
    }

    /* Ensure outer borders are visible */
    tr:first-child th {
        border-top: 2px solid #000 !important;
    }

    tr:last-child td {
        border-bottom: 2px solid #000 !important;
    }

    td:first-child,
    th:first-child {
        border-left: 2px solid #000 !important;
    }

    td:last-child,
    th:last-child {
        border-right: 2px solid #000 !important;
    }

    /* Preserve header colors */
    th {
        background-color: #0492d2 !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
</style>