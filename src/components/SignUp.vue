<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import SimpleKeyboard from './SimpleKeyboard.vue'

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('*** PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

const props = defineProps({
  lang: {
    type: String,
    required: true,
  },
  allUsers: {
    type: Array,
  },
  translations: {
    type: Object,
    required: true,
  },
  goToMainPage: {
    type: Function,
    required: true,
  },
  currentState: {
    type: Number,
    required: true,
  },
  loggedInUser: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['pushNewUser']);

let onlineUsers = ref([])
let offlineUsers = ref([])
let companies = ref([])
let visitPurposes = ref([])
let ccontacts = ref([])

const filterOnlineUsers = async () => {
  try {
    onlineUsers.value = props.allUsers.filter(user => user.Online);
    console.log('Online korisnici uspješno filtrirani:', onlineUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja online korisnika:', error);
  }
};

const filterOfflineUsers = async () => {
  try {
    offlineUsers.value = props.allUsers.filter(user => !user.Online);
    console.log('Offline korisnici uspješno filtrirani:', offlineUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja offline korisnika:', error);
  }
};

const suggestOfflineUsers = (query) => {
  if (!query) {
    filteredUsers.value = [];
    return;
  }

  filteredUsers.value = offlineUsers.value.filter(
    (user) =>
      !user.Online &&
      user.FullName.toLowerCase().includes(query.toLowerCase())
  );
};

const fetchCompanies = async () => {
  try {
    const response = await PAS.get('/Companies');
    companies.value = response.data.dsCompanies.ttCompanies;
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja tvrtki:', error);
  }
};

const filterCompanies = (query) => {
  if (!query) {
    filteredCompanies.value = [];
    return;
  }
  filteredCompanies.value = companies.value.filter((company) =>
    company.Name.toLowerCase().includes(query.toLowerCase())
  );
};

const fetchVisitPurposes = async () => {
  try {
    const response = await PAS.get('/VisitPurpose');
    visitPurposes.value = response.data.dsVisitPurpose.ttVisitPurpose;
    console.log('Razlozi posjete uspješno dohvaćeni:', visitPurposes.value);
    console.log('translations:', props.translations[props.lang]);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja razloga posjete:', error);
  }
};

const favoriteVisitPurposes = computed(() =>
  visitPurposes.value.filter(purpose => purpose.Favourite === "yes")
);

let languages = ref([]);

const getLanguages = async () => {
  try {
    const response = await PAS.get('/Languages?filter=Active%20=%20yes');
    languages.value = response.data.dsLanguages.ttLanguages
      .filter((language) => language.Active)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja jezika:', error);
  }
};

const visitPurposeTranslations = ref({});
const fetchVisitPurposeTranslations = async () => {
  try {

    const response = await PAS.get('/LanguagesEntries');
    const entries = response.data.dsLanguagesEntries.ttLanguagesEntries;

    const neededIds = new Set(visitPurposes.value.map(vp => String(vp.LanguageEntry)));
    console.log('Potrebni ID-jevi:', neededIds);
    const currentLanguage = languages.value.find(l => l.LanguageCode === props.lang);
    const currentLanguageId = currentLanguage ? currentLanguage.ID : null;

    const filtered = entries.filter(entry =>
      neededIds.has(String(entry.ID)) && entry.LanguageID === currentLanguageId
    );
    console.log('Filtrirani ID-jevi:', filtered);
    const map = {};
    filtered.forEach(entry => {
      map[String(entry.ID)] = entry.LangValue;
    });
    visitPurposeTranslations.value = map;
    console.log('Prijevodi svrhe posjeta uspješno dohvaćeni:', visitPurposeTranslations.value);
  } catch (error) {
    console.error('Error fetching visit purpose translations:', error);
  }
};

const filterVisitPurposes = (query) => {
  if (!query) {
    filteredVisitPurposes.value = favoriteVisitPurposes.value.filter(
      purpose => visitPurposeTranslations.value[String(purpose.LanguageEntry)]
    );
    return;
  }
  filteredVisitPurposes.value = visitPurposes.value.filter((purpose) => {
    const translated = visitPurposeTranslations.value[String(purpose.LanguageEntry)];
    return translated && translated.toLowerCase().includes(query.toLowerCase());
  });
};

const fetchContacts = async () => {
  try {
    const response = await PAS.get('/Contacts');
    ccontacts.value = response.data.dsContacts.ttContacts;
    console.log('Kontakt osobe uspješno dohvaćene:', ccontacts.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja kontakt osoba:', error);
  }
};

const filterContactPersons = (query) => {
  if (!query) {
    filteredContactPersons.value = [];
    return;
  }

  filteredContactPersons.value = ccontacts.value.filter((contact) =>
    contact.FullName.toLowerCase().includes(query.toLowerCase())
  );
};

const input = ref('')
const debounceTime = 690

const onChange = (inputValue) => {

  input.value = inputValue

  if (step.value === 1) {
    fullName.value = inputValue

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      suggestOfflineUsers(inputValue);
    }, debounceTime);

  } else if (step.value === 2) {
    companyName.value = inputValue

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      filterCompanies(inputValue);
    }, debounceTime);
  } else if (step.value === 3) {
    visitPurpose.value = inputValue;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (!input.value) {
        filteredVisitPurposes.value = favoriteVisitPurposes.value.filter(
          purpose => visitPurposeTranslations.value[String(purpose.LanguageEntry)]
        );
      } else {
        filterVisitPurposes(inputValue);
      }
    }, debounceTime);
  } else if (step.value === 4) {
    contactPerson.value = inputValue

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      filterContactPersons(inputValue);
    }, debounceTime);
  }
}
const selectedVisitPurpose = ref('');
// ODABIR
const selectVisitPurpose = (purpose) => {
  console.log('Odabrana svrha posjeta:', purpose);
  console.log(visitPurposeTranslations.value[String(purpose.LanguageEntry)]);
  visitPurpose.value = visitPurposeTranslations.value[String(purpose.LanguageEntry)] || '';
  input.value = visitPurpose.value
  console.log(purpose)
  selectedVisitPurpose.value = purpose.LanguageEntry;
  filteredVisitPurposes.value = [];
};

const selectCompany = (company) => {
  companyName.value = company.Name;
  input.value = company.Name;
  filteredCompanies.value = [];

  selectedCompany.value = company.ID; // označi odabranu tvrtku
  console.log('Odabrana tvrtka:', selectedCompany.value); // ispiši u konzolu
};

const selectedContactPerson = ref(null); // pohrani odabranu kontakt osobu kao objekt

const selectContactPerson = (person) => {
  contactPerson.value = person.FullName; // automatski popuni polje s punim imenom
  input.value = person.FullName; // sinkroniziraj s virtualnom tipkovnicom
  filteredContactPersons.value = []; // očisti prijedloge
  selectedContactPerson.value = person; // pohrani cijeli objekt kontakt osobe
  console.log('Odabrana kontakt osoba:', selectedContactPerson.value); // ispiši u konzolu
};

// Function to select a user from the suggestions
const selectUser = (user) => {
  fullName.value = user.FullName; // Autofill the full name
  input.value = user.FullName; // Sync with the virtual keyboard
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
const selectedCompany = ref(''); // trenutno odabrana tvrtka
const filteredVisitPurposes = ref([]) // array za filtrirane namjene posjeta
const filteredUsers = ref([]); // Array for filtered offline users
const fullNameInput = ref(null) // referenca na input za ime i prezime
const companyNameInput = ref(null) // referenca na input za naziv tvrtke
const visitPurposeInput = ref(null) // referenca na input za namjenu posjeta
const contactPersonInput = ref(null)// referenca na input za kontakt osobu
const gdprAgreementInput = ref(null) // referenca na input za suglasnost s GDPR-om
const skipStepTwo = ref(false) // preskoči korak 2 ako je u pitanju dodatan gost iz iste tvrtke
let debounceTimeout // debounce timeout za filtriranje
const newVisitorData = ref(null); // Add this near your other refs

const finalizeLogIn = async () => {
  try {
    if (!props.loggedInUser) {
      console.error('No logged-in user found.');
      return;
    }

    const payload = {
      dsVisitors: {
        ttVisitors: [
          {
            ID: props.loggedInUser.ID,
            Online: true,
            VisitPurpose: visitPurpose.value || '',
            ContactPerson: contactPerson.value || '',
            PINCode: props.loggedInUser.PINCode || '',
            FullName: props.loggedInUser.FullName || '',
            CompanyName: props.loggedInUser.CompanyName || '',
            GDPRAgreement: props.loggedInUser.GDPRAgreement,
            Active: props.loggedInUser.Active || true,
            Inserted: props.loggedInUser.Inserted,
            Updated: new Date().toISOString(),
            UpdateUser: 'user/login',
            InsertUser: props.loggedInUser.InsertUser || '',
          }
        ]
      },
    };

    const updatedUser = ref(props.loggedInUser);
    console.log('Updating user:', payload);
    updatedUser.value = {
      VisitPurpose: visitPurpose.value,
      ContactPerson: contactPerson.value,
      Online: true,
    };

    const response = await PAS.put(`/Visitors`, payload);

    if (response && response.data) {
      console.log('User updated successfully:', response.data);
    } else {
      console.error('Unexpected response format:', response);
    }

    props.goToMainPage();
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
  }
};

const nextStep = async () => {
  if (props.currentState === 2) {
    if (step.value === 3) {
      step.value = 4;
    } else if (step.value === 4) {
      finalizeLogIn();
    }
  } else {
    // For company step
    if (step.value === 2) {
      const companyExists = companies.value.some(
        c => c.Name.toLowerCase() === companyName.value.toLowerCase()
      );

      if (!companyExists && companyName.value) {
        const newCompany = await createNewCompany(companyName.value);
        if (newCompany) {
          selectedCompany.value = newCompany.ID;
        }
      }
    }

    // For contact person step
    if (step.value === 4) {
      const contactExists = ccontacts.value.some(
        c => c.FullName.toLowerCase() === contactPerson.value.toLowerCase()
      );

      if (!contactExists && contactPerson.value) {
        const newContact = await createNewContact(contactPerson.value);
        if (newContact) {
          selectedContactPerson.value = newContact;
        }
      }
    }

    if (step.value === 5) {
      await handleSignUp();
      if (newVisitorData.value) {
        step.value = 6;
        await nextTick();
        focusInput();
        input.value = '';
      }
      return;
    }
    if (step.value < 5) {
      step.value++;
      if (step.value === 2 && skipStepTwo.value === true) {
        step.value++;
      }
      await nextTick();
      focusInput();
      input.value = '';
    } else {
      if (additionalVisitorBool.value === true) {
        skipStepTwo.value = true;
        step.value = 1;
        fullName.value = '';
        visitPurpose.value = '';
        contactPerson.value = '';
        gdprAgreement.value = false;
        additionalVisitorBool.value = false;
      } else {
        step.value = 7;
        companyName.value = '';
        selectedCompany.value = '';
        setTimeout(() => {
          props.goToMainPage();
        }, 5000);
      }
    }
  }
};

const stepBack = async () => {
  if (step.value > 1) {
    step.value--
    await nextTick()
    focusInput()
    input.value = ''
  }
}

let additionalVisitorBool = ref(false);
const setAdditionalVisitor = (bool) => {
  additionalVisitorBool.value = bool;
  console.log('Additional visitor:', additionalVisitorBool.value)
  nextStep();
}

const handleSignUp = async () => {
  try {
    const newUser = {
      dsVisitors: {
        ttVisitors: [
          {
            FullName: fullName.value,
            CompanyName: companyName.value,
            VisitPurpose: visitPurpose.value,
            ContactPerson: contactPerson.value,
            GDPRAgreement: gdprAgreement.value,
            InsertUser: "user",
            Online: true
          }
        ]
      }
    };

    const response = await PAS.post('/Visitors', newUser);
    if (response && response.data) {
      const newVisitor = response.data.dsVisitors.ttVisitors[0];
      newVisitorData.value = newVisitor;
      pinCode.value = newVisitor.PINCode;
      emit('pushNewUser', response.data.dsVisitors.ttVisitors);
    } else {
      newVisitorData.value = null;
      console.error('Neočekivani response format:', response);
    }
  } catch (error) {
    newVisitorData.value = null;
    console.error('Greška kod kreiranja novog korisnika:', error.response?.data || error.message);
  }
};

const focusInput = () => {
  if (step.value === 1 && fullNameInput.value) {
    fullNameInput.value.focus()
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

const gdprText = computed(() => {
  const points = props.translations[props.lang]?.gdprPoints || '';
  return points.split('.').map(s => s.trim()).filter(Boolean);
});

onMounted(async () => {
  await filterOnlineUsers();
  await filterOfflineUsers();
  await fetchCompanies();
  await fetchVisitPurposes();
  await getLanguages();
  await fetchVisitPurposeTranslations();
  await fetchContacts();
  filteredVisitPurposes.value = favoriteVisitPurposes.value.filter(
    purpose => visitPurposeTranslations.value[String(purpose.LanguageEntry)]
  );
  if (props.currentState === 2) {
    visitPurpose.value = props.loggedInUser?.visitPurpose || '';
    contactPerson.value = props.loggedInUser?.contactPerson || '';
    step.value = 3;
  } else {
    step.value = 1;
  }
});

// Add these after your other functions
const createNewCompany = async (companyName) => {
  try {
    const newCompany = {
      dsCompanies: {
        ttCompanies: [
          {
            Name: companyName,
            Active: true,
            InsertUser: 'user/signup',
            UpdateUser: 'user/signup',
            Inserted: new Date().toISOString(),
            Updated: new Date().toISOString()
          }
        ]
      }
    };

    const response = await PAS.post('/Companies', newCompany);
    if (response && response.data) {
      const createdCompany = response.data.dsCompanies.ttCompanies[0];
      companies.value.push(createdCompany);
      return createdCompany;
    }
    return null;
  } catch (error) {
    console.error('Error creating new company:', error);
    return null;
  }
};

const createNewContact = async (fullName) => {
  try {
    const newContact = {
      dsContacts: {
        ttContacts: [
          {
            FullName: fullName,
            Active: true,
            InsertUser: 'user/signup',
            UpdateUser: 'user/signup',
            Inserted: new Date().toISOString(),
            Updated: new Date().toISOString()
          }
        ]
      }
    };

    const response = await PAS.post('/Contacts', newContact);
    if (response && response.data) {
      const createdContact = response.data.dsContacts.ttContacts[0];
      ccontacts.value.push(createdContact);
      return createdContact;
    }
    return null;
  } catch (error) {
    console.error('Error creating new contact:', error);
    return null;
  }
};
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
        <SimpleKeyboard id="keyboard" @onChange="onChange" :input="input" :lang="lang" />
        <div class="user-suggestions" v-if="filteredUsers.length">
          <div class="user-card" v-for="user in filteredUsers" :key="user.ID" @click="selectUser(user)">
            {{ user.FullName }}
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
          <div class="company-card" v-for="company in filteredCompanies" :key="company.ID"
            @click="selectCompany(company)">
            {{ company.Name }}
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
        <SimpleKeyboard @onChange="onChange" :input="input" :lang="lang"
          :class="{ 'keyboard-large': props.currentState === 1, 'keyboard-small': props.currentState === 2 }" />
        <div class="visit-purpose-suggestions" v-if="filteredVisitPurposes.length">
          <div class="visit-purpose-card" v-for="purpose in filteredVisitPurposes" :key="purpose.ID"
            @click="selectVisitPurpose(purpose)">
            {{ visitPurposeTranslations[String(purpose.LanguageEntry)] || '[Nema prijevoda]' }}
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
        <SimpleKeyboard @onChange="onChange" :input="input" :lang="lang"
          :class="{ 'keyboard-large': props.currentState === 1, 'keyboard-small': props.currentState === 2 }" />
        <div class="contact-person-suggestions" v-if="filteredContactPersons.length">
          <div class="contact-person-card" v-for="person in filteredContactPersons" :key="person.ID"
            @click="selectContactPerson(person)">
            {{ person.FullName }}
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
          <strong>Email:</strong> {{ selectedContactPerson.Email }}
        </p>
        <p v-if="selectedContactPerson">
          <strong>Mob:</strong> {{ selectedContactPerson.Phone }}
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