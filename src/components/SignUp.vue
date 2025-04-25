<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import SimpleKeyboard from './SimpleKeyboard.vue' // import virtualne tipkovnice - vanjski library

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

// input parametri iz MainPage.vue
const props = defineProps({
  lang: { // trenutno odabrani jezik
    type: String,
    required: true,
  },
  allUsers: { // svi korisnici
    type: Array,
    required: true,
  },
  translations: { // prijevodi
    type: Object,
    required: true,
  },
  goToMainPage: { // funkcija za povratak na glavnu stranicu, pozvana nakon pri završetku registracije
    type: Function,
    required: true,
  },
  currentState: { // trenutni korak, 1 - signup, 2 - login
    type: Number,
    required: true,
  },
})

let onlineUsers = ref([]) // online korisnici
let offlineUsers = ref([]) // offline korisnici 
let companies = ref([]) // tvrtke
let visitPurposes = ref([]) // namjene posjeta
// let visitPurposeFavourites = ref([]) // omiljene namjene posjeta
let ccontacts = ref([]) // kontakt osobe

// filtriranje online korisnika
const filterOnlineUsers = async () => {
  try {
    // filtriraj online korisnike iz već dohvaćenih korisnika
    onlineUsers.value = props.allUsers.filter(user => user.online);
    console.log('Online korisnici uspješno filtrirani:', onlineUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja online korisnika:', error);
  }
};

// filtriranje offline korisnika
const filterOfflineUsers = async () => {
  try {
    // filtriraj offline korisnike iz već dohvaćenih korisnika
    offlineUsers.value = props.allUsers.filter(user => !user.online);
    console.log('Offline korisnici uspješno filtrirani:', offlineUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja offline korisnika:', error);
  }
};

// ponudi offline korisnike
const suggestOfflineUsers = (query) => {
  if (!query) {
    filteredUsers.value = [];
    return;
  }

  filteredUsers.value = props.allUsers.filter(
    (user) =>
      !user.online && // samo offline korisnici
      user.fullName.toLowerCase().includes(query.toLowerCase()) // uskladi s inputom
  );
};

// dohvaćanje tvrtki
const fetchCompanies = async () => {
  try {
    const response = await PAS.get('/companies');
    companies.value = response.data;
    console.log('Tvrtke uspješno dohvaćene:', companies.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja tvrtki:', error);
  }
};

// filtriranje tvrtki
const filterCompanies = (query) => {
  if (!query) { // ako je query prazan, očisti filtrirane tvrtke
    filteredCompanies.value = [];
    return;
  }
  // filtriraj tvrtke po imenu i spremi u filteredCompanies
  filteredCompanies.value = companies.value.filter((company) => // filteriraj tvrtke po imenu
    company.name.toLowerCase().includes(query.toLowerCase()) // pretvori u mala slova i provjeri sadrži li query
  );

};

// dohvaćanje razloga posjeta
const fetchVisitPurposes = async () => {
  try {
    const response = await PAS.get('/visitPurposes');
    visitPurposes.value = response.data;
    console.log('Razlozi posjete uspješno dohvaćeni:', visitPurposes.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja razloga posjete:', error);
  }
};

// filtriranje razloga posjeta
const filterVisitPurposes = (query) => {
  if (!query) {
    filteredVisitPurposes.value = [];
    return;
  }

  filteredVisitPurposes.value = visitPurposes.value.filter((purpose) =>
    purpose[props.lang].toLowerCase().includes(query.toLowerCase())
  );

};

// dohvaćanje kontakt osoba
const fetchContacts = async () => {
  try {
    const response = await PAS.get('/contacts');
    ccontacts.value = response.data;
    console.log('Kontakt osobe uspješno dohvaćene:', ccontacts.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja kontakt osoba:', error);
  }
};

// filtriranje kontakt osoba
const filterContactPersons = (query) => {
  if (!query) {
    filteredContactPersons.value = [];
    return;
  }

  filteredContactPersons.value = ccontacts.value.filter((contact) =>
    contact.fullName.toLowerCase().includes(query.toLowerCase())
  );
};

const input = ref('') // za input virtualne tipkovnice
const debounceTime = 690 // vrijeme debounce-a za filtriranje

// INPUT HANDLING
const onChange = (inputValue) => {

  input.value = inputValue // apdejta trenutnu vrijednost inputa

  if (step.value === 1) {
    fullName.value = inputValue // sinkronizira s poljem fullName ako je trenutni korak 1

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      suggestOfflineUsers(inputValue); // Call the filter function for offline users
    }, debounceTime);

  } else if (step.value === 2) {
    companyName.value = inputValue // sinkronizira s poljem companyName ako je trenutni korak 2

    clearTimeout(debounceTimeout); // debounce za filtriranje stavki
    debounceTimeout = setTimeout(() => { // možda nepotrebno jer nebude puno upita odjenput
      filterCompanies(inputValue); // ista funkcija za donje korake
    }, debounceTime);
  } else if (step.value === 3) {
    visitPurpose.value = inputValue // sinkronizira s poljem visitPurpose ako je trenutni korak 3

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      filterVisitPurposes(inputValue);
    }, debounceTime);
  } else if (step.value === 4) {
    contactPerson.value = inputValue // sinkronizira s poljem contactPerson ako je trenutni korak 4

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      filterContactPersons(inputValue);
    }, debounceTime);
  }
}

// ODABIR
const selectVisitPurpose = (purpose) => {
  visitPurpose.value = purpose[props.lang] // automatski popuni odabranu namjenu posjeta
  input.value = purpose[props.lang] // sinkroniziraj s virtualnom tipkovnicom
  filteredVisitPurposes.value = [] // očisti filtrirane namjene posjeta
}

const selectCompany = (company) => {
  companyName.value = company.name; // automatski popuni za odabranu tvrtku
  input.value = company.name; // sinkroniziraj odabranu tvrtku s virtualnom tipkovnicom
  filteredCompanies.value = []; // očisti filtrirane tvrtke
  selectedCompany.value = company; // označi odabranu tvrtku
};

const selectedContactPerson = ref(null); // pohrani odabranu kontakt osobu kao objekt

const selectContactPerson = (person) => {
  contactPerson.value = person.fullName; // automatski popuni polje s punim imenom
  input.value = person.fullName; // sinkroniziraj s virtualnom tipkovnicom
  filteredContactPersons.value = []; // očisti prijedloge
  selectedContactPerson.value = person; // pohrani cijeli objekt kontakt osobe
};

// Function to select a user from the suggestions
const selectUser = (user) => {
  fullName.value = user.fullName; // Autofill the full name
  input.value = user.fullName; // Sync with the virtual keyboard
  filteredUsers.value = []; // Clear the suggestions
};

// DEFINICIJE
const step = ref(1) // trenutni korak
const fullName = ref('') // ime i prezime
const companyName = ref('') // naziv tvrtke
const visitPurpose = ref('') // namjena posjeta
const contactPerson = ref('') // kontakt osoba
const gdprAgreement = ref(false) // suglasnost s GDPR-om
const pinCode = ref('') // generirani pin kod
const filteredContactPersons = ref([]) // array za filtrirane kontakt osobe
const filteredCompanies = ref([]); // array za filtrirane tvrtke
const selectedCompany = ref(null); // trenutno odabrana tvrtka
const filteredVisitPurposes = ref([]) // array za filtrirane namjene posjeta
const filteredUsers = ref([]); // Array for filtered offline users
const fullNameInput = ref(null) // referenca na input za ime i prezime
const companyNameInput = ref(null) // referenca na input za naziv tvrtke
const visitPurposeInput = ref(null) // referenca na input za namjenu posjeta
const contactPersonInput = ref(null)// referenca na input za kontakt osobu
const gdprAgreementInput = ref(null) // referenca na input za suglasnost s GDPR-om
const skipStepTwo = ref(false) // preskoči korak 2 ako je u pitanju dodatan gost iz iste tvrtke
let debounceTimeout // debounce timeout za filtriranje

const finalizeLogIn = () => {
  console.log('Visit Purpose:', visitPurpose.value);
  console.log('Contact Person:', contactPerson.value);
  setTimeout(() => {
    props.goToMainPage();
  }, 5000);
};

// APP FLOW
const nextStep = async () => {
  if (props.currentState === 2) {
    // If called from login, only handle visit purpose and contact person
    if (step.value === 3) {
      step.value = 4; // Move to the contact person step
    } else if (step.value === 4) {
      finalizeLogIn(); // Finalize the login process
    }
  } else {
    // Standard signup flow
    if (step.value < 6) {
      step.value++;
      if (step.value === 2 && skipStepTwo.value === true) {
        step.value++;
      }
      if (step.value === 6) {
        generatePinCode();
      }
      await nextTick();
      focusInput();
      input.value = '';
    } else {
      handleSignUp();
      if (additionalVisitorBool.value === true) {
        skipStepTwo.value = true;
        step.value = 1;
        additionalVisitorBool.value = false;
      } else {
        step.value = 7;
        companyName.value = '';
        setTimeout(() => {
          props.goToMainPage();
        }, 5000);
      }
    }
  }
};

// funkcija za korak unatrag
const stepBack = async () => {
  if (step.value > 1) { // ako nije prvi korak
    step.value-- // smanji korak
    await nextTick() // pričekaj da se DOM ažurira
    focusInput() // fokusiraj input
    input.value = '' // počisti input virtualne tipkovnice nakon svakog koraka
  }
}

// postavljanje dodatnog gosta
let additionalVisitorBool = ref(false);
const setAdditionalVisitor = (bool) => { // postavi dodatnog gosta
  additionalVisitorBool.value = bool; // postavi vrijednost
  console.log('Additional visitor:', additionalVisitorBool.value) // ispiši u konzolu
  nextStep(); // idi na sljedeći korak
}

// registracija novog korisnika ili ažuriranje postojećeg
const handleSignUp = async () => {
  try {
    // dohvati ID++
    const nextId = props.allUsers.length > 0 ? Math.max(...props.allUsers.map(user => user.id)) + 1 : 1;

    // novi objekt korisnika
    const newUser = {
      id: nextId,
      fullName: fullName.value,
      companyName: companyName.value,
      visitPurpose: visitPurpose.value,
      contactPerson: contactPerson.value,
      gdprAgreement: gdprAgreement.value,
      pinCode: pinCode.value,
      online: true,
    };

    // console.log('New user object:', newUser);

    // POST request
    const response = await PAS.post('/users', newUser);
    if (response && response.data) {
      console.log('Novi korisnik:', response.data);
    } else {
      console.error('Neočekivani response format:', response);
    }

    // resetiraj forme
    step.value = 1;
    fullName.value = '';
    visitPurpose.value = '';
    contactPerson.value = '';
    gdprAgreement.value = false;
    pinCode.value = '';
  } catch (error) {
    console.error('Greška kod kreiranja novog korisnika:', error.response?.data || error.message);
  }
};

// fokusiraj input
const focusInput = () => {
  if (step.value === 1 && fullNameInput.value) { // ako je korak 1 i postoji input za ime i prezime
    fullNameInput.value.focus() // fokusiraj input
  } else if (step.value === 2 && companyNameInput.value) {
    companyNameInput.value.focus()
  } else if (step.value === 3 && visitPurposeInput.value) {
    visitPurposeInput.value.focus()
  } else if (step.value === 4 && contactPersonInput.value) {
    contactPersonInput.value.focus()
  } else if (step.value === 5 && gdprAgreementInput.value) {
    gdprAgreementInput.value.focus()
  }
}

// generiranje pin koda
const generatePinCode = () => {
  pinCode.value = Math.floor(1000 + Math.random() * 9000).toString() // generiraj random broj od 1000 do 9999
}

const gdprText = computed(() => {
  return props.translations[props.lang]?.gdprPoints || [];
});

onMounted(async () => {
  await filterOnlineUsers(); // filtriraj online korisnike
  await filterOfflineUsers(); // filtriraj offline korisnike
  await fetchCompanies(); // dohvati tvrtke
  await fetchVisitPurposes(); // dohvati namjene posjeta
  await fetchContacts(); // dohvati kontakt osobe
  console.log('Svi korisnici:', props.allUsers);
  console.log('Prijevodi: ', props.translations)
  if (props.currentState === 2) {
    // Pre-fill visit purpose and contact person for logged-in user
    visitPurpose.value = props.loggedInUser?.visitPurpose || '';
    contactPerson.value = props.loggedInUser?.contactPerson || '';
    step.value = 3; // Start at the visit purpose step
  } else {
    step.value = 1; // Start at the full name step for standard signup
  }
});

</script>

<template>
  <div class="signup-container">
    <form @submit.prevent="nextStep">
      <!-- Step 1: Full Name -->
      <div v-if="step === 1" class="form-group">
        <label class="input-label" for="fullName">{{ translations[lang].fullName }}</label>
        <div class="input-button-row">
          <input type="text" id="fullName" v-model="fullName" ref="fullNameInput" readonly required />
          <button class="confirm-button" type="submit">{{ step < 6 ? translations[lang].next : translations[lang].finish
          }}</button>
        </div>
        <SimpleKeyboard @onChange="onChange" :input="input" :lang="lang" />
        <div class="user-suggestions" v-if="filteredUsers.length">
          <div class="user-card" v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
            {{ user.fullName }}
          </div>
        </div>
      </div>

      <!-- Step 2: Company Name -->
      <div v-if="step === 2" class="form-group">
        <label class="input-label" for="companyName">{{ translations[lang].companyName }}</label>
        <div class="input-button-row">
          <button class="back-button" @click="stepBack">{{ translations[lang].back }}</button>
          <input type="text" id="companyName" v-model="companyName" ref="companyNameInput" readonly required />
          <button class="confirm-button" type="submit">{{ step < 6 ? translations[lang].next : translations[lang].finish
          }}</button>
        </div>
        <SimpleKeyboard @onChange="onChange" :input="input" :lang="lang" />
        <div class="company-suggestions" v-if="filteredCompanies.length">
          <div class="company-card" v-for="company in filteredCompanies" :key="company.id"
            @click="selectCompany(company)">
            {{ company.name }}
          </div>
        </div>
      </div>

      <!-- Step 3: Purpose of Visit -->
      <div v-if="step === 3" class="form-group">
        <label class="input-label" for="visitPurpose">{{ translations[lang].visitPurpose }}</label>
        <div class="input-button-row">
          <button class="back-button" @click="stepBack">{{ translations[lang].back }}</button>
          <input type="text" id="visitPurpose" v-model="visitPurpose" ref="visitPurposeInput" readonly required />
          <button class="confirm-button" type="submit">{{ step < 6 ? translations[lang].next : translations[lang].finish
          }}</button>
        </div>
        <SimpleKeyboard @onChange="onChange" :input="input" :lang="lang" />
        <div class="visit-purpose-suggestions" v-if="filteredVisitPurposes.length">
          <div class="visit-purpose-card" v-for="purpose in filteredVisitPurposes" :key="purpose.id"
            @click="selectVisitPurpose(purpose)">
            {{ purpose[props.lang] }}
          </div>
        </div>
      </div>

      <!-- Step 4: Contact Person -->
      <div v-if="step === 4" class="form-group">
        <label class="input-label" for="contactPerson">{{ translations[lang].contactPerson }}</label>
        <div class="input-button-row">
          <button class="back-button" @click="stepBack">{{ translations[lang].back }}</button>
          <input type="text" id="contactPerson" v-model="contactPerson" ref="contactPersonInput" readonly required />
          <button class="confirm-button" type="submit">
            {{ step < 6 ? translations[lang].next : translations[lang].finish }} </button>
        </div>
        <SimpleKeyboard @onChange="onChange" :input="input" :lang="lang" />
        <div class="contact-person-suggestions" v-if="filteredContactPersons.length">
          <div class="contact-person-card" v-for="person in filteredContactPersons" :key="person.id"
            @click="selectContactPerson(person)">
            {{ person.fullName }}
          </div>
        </div>
      </div>

      <!-- Step 5: GDPR Agreement -->
      <div v-if="step === 5" class="form-group">
        <label for="gdprAgreement">{{ translations[lang].gdprAgreement }}</label>
        <ul id="gdprAgreement">
          <li v-for="(rule, index) in gdprText" :key="index">{{ rule }}</li>
        </ul>
        <div class="gdpr-agreement">
          <input type="checkbox" id="gdprAgreementCheckbox" v-model="gdprAgreement" ref="gdprAgreementInput" readonly
            required />
          <label id="gdprAgreementCheckboxNote">{{ translations[lang].agreeToGdpr }}</label>
        </div>
        <button class="confirm-button" type="submit">{{ step < 6 ? translations[lang].next : translations[lang].finish
            }}</button>
      </div>

      <!-- Step 6: Summary -->
      <div v-if="step === 6" class="form-group summary">
        <h2>{{ translations[lang].summary }}</h2>
        <p><strong>{{ translations[lang].fullName }}:</strong> {{ fullName }}</p>
        <p><strong>{{ translations[lang].companyName }}:</strong> {{ companyName }}</p>
        <p><strong>{{ translations[lang].visitPurpose }}:</strong> {{ visitPurpose }}</p>
        <p><strong>{{ translations[lang].contactPerson }}:</strong> {{ contactPerson }}</p>
        <p v-if="selectedContactPerson">
          <strong>Email:</strong> {{ selectedContactPerson.email }}
        </p>
        <p v-if="selectedContactPerson">
          <strong>Mob:</strong> {{ selectedContactPerson.phone }}
        </p>
        <p id="pince"><strong>{{ translations[lang].summaryPinCode }}</strong> {{ pinCode }}</p>
        <p>{{ translations[lang].badgePrinting }}</p>
      </div>
    </form>
    <div v-if="step === 6" class="additional-visitor-group">
      <h2>{{ translations[lang].additionalVisitor }}</h2>
      <p>{{ translations[lang].additionalVisitorPrompt }}</p>
      <div class="avg-buttons">
        <button @click="setAdditionalVisitor(true)">{{ translations[lang].yes }}</button>
        <button @click="nextStep">{{ translations[lang].no }}</button>
      </div>
    </div>

    <!-- Step 7: Thank you -->
    <div v-if="step === 7" class="thank-you">
      <h2>{{ translations[lang].thankYou }}</h2>
      <p>{{ translations[lang].thankYouMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.dropdown * {
  color: black;
}

.signup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em;
  background-color: #2c3e50;
  border-radius: 10px;
  width: 100%;
  margin: -2rem auto;
}

.signup-container h1 {
  font-size: 2.4rem;
  margin-bottom: 1.5rem;
  color: white;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  width: 60rem;
}

.form-group .input-label {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.1rem;
  color: white;
}

.form-group label {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: white;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 1rem;
  font-size: 2.5em;
  font-weight: bold;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 90%;
  color: black;
}

#pince {
  font-weight: 900;
}

.form-group h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  margin-top: -0.75em;
  color: white;
}

textarea {
  height: 450px;
  width: 100%;
}

.summary {
  margin-top: 0;
  padding-top: 0;
  background-color: #1a252f;
  border-radius: 10px;
  color: white;
  width: 30em;
  height: 16em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 150px;
  overflow-y: auto;
}

li {
  padding: 0.5rem;
  cursor: pointer;
  color: #2c3e50;
}

li:hover {
  background-color: #ddd;
}

button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  color: #2c3e50;
  background-color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;
}

.gdpr-agreement {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 5rem;
  width: 50em;
}

.simple-keyboard {
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 35%;
  background-color: #2c3e50;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

::v-deep(.hg-button) {
  background-color: #ffffff;
  color: #2c3e50;
  font-size: 2rem;
  border: none;
  border-radius: 5px;
  padding: 1.75rem 1.5rem;
  margin: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

::v-deep(.hg-button:hover) {
  background-color: #2c3e50;
  color: #ffffff;
}

::v-deep(.hg-button-active) {
  background-color: #ffffff !important;
  color: #2c3e50 !important;
  transition: none;
}

.company-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0;
  background-color: #2c3e50;
  padding: 1rem;
  border-radius: 5px;
  max-height: 20em;
  max-width: 100%;
  overflow-y: auto;
}

.company-card {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.company-card:hover {
  background-color: #2c3e50;
  color: #ffffff;
}

.input-button-row {
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 1rem;
  width: 100%;
}

.input-button-row input {
  flex: 1;
  padding: 0.5rem;
  font-size: 2rem;
  font-weight: bold;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  color: black;
}

.confirm-button .back-button {
  flex-shrink: 0;
  padding: 0.9rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  background-color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 7em;
  min-width: 7em;
  max-width: 7em;
}

.confirm-button:hover {
  background-color: #ddd;
}

.visit-purpose-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0;
  background-color: #2c3e50;
  padding: 1rem;
  border-radius: 5px;
  max-height: 20em;
  max-width: 100%;
  overflow-y: auto;
}

.visit-purpose-card {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.visit-purpose-card:hover {
  background-color: #2c3e50;
  color: #ffffff;
}

.contact-person-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0;
  background-color: #2c3e50;
  padding: 1rem;
  border-radius: 5px;
  max-height: 20em;
  max-width: 100%;
  overflow-y: auto;
}

.contact-person-card {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.contact-person-card:hover {
  background-color: #2c3e50;
  color: #ffffff;
}

.user-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0;
  background-color: #2c3e50;
  padding: 1rem;
  border-radius: 5px;
  max-height: 20em;
  max-width: 100%;
  overflow-y: auto;
}

.user-card {
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.user-card:hover {
  background-color: #2c3e50;
  color: #ffffff;
}

#gdprAgreement {
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 1rem;
}

#gdprAgreement li {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #2c3e50;
}

#gdprAgreement {
  margin-top: 0;
  min-width: 69em;
  max-width: 100%;
  min-height: 30em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#gdprAgreement li {
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.5em;
}

#gdprAgreementCheckbox {
  display: flex;
  align-items: center;
  height: 5rem;
}

#gdprAgreementCheckboxNote {
  font-size: 2rem;
  color: white;
  width: 200%;
  position: relative;
}

.additional-visitor-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  color: white;
}

.additional-visitor-group h2 {
  font-size: 2.5rem;
  margin-bottom: 0;
}

.additional-visitor-group p {
  font-size: 2rem;
  text-align: center;
}

.avg-buttons {
  display: flex;
  flex-direction: row;
  gap: 5em;
  margin-top: 1.5em;
}

.avg-buttons button {
  font-size: 3em;
  width: 5em;
  height: 2.5em;
}

.thank-you {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  color: white;
}

.thank-you h2 {
  font-size: 4rem;
  margin-bottom: 0;
}

.thank-you p {
  font-size: 3rem;
  text-align: center;
}
</style>