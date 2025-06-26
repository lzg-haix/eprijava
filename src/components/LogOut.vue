<script setup>
import { ref, onMounted } from 'vue';
import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}
import SimpleKeyboard from './SimpleKeyboard.vue';

const loggedInUsers = ref([]);
const pinCode = ref('');
const fullName = ref('');
const inputMode = ref('pin');
const suggestedUsers = ref([]);
const selectedUser = ref(null);
const showGoodbyeMessage = ref(false);
const goodbyeName = ref('');

const fetchLoggedInUsers = async () => {
  try {
    const response = await PAS.get('/Visitors?filter=Online%20=%20Yes');
    loggedInUsers.value = response.data.dsVisitors.ttVisitors;
    // console.log('Logged-in users:', loggedInUsers.value);
  } catch (error) {
    console.error('Error fetching logged-in users:', error);
  }
};

const updateVisitorLog = async (user) => {
  try {
    const companyResponse = await PAS.get(`/Companies`);
    const company = companyResponse.data.dsCompanies.ttCompanies.find(
      c => c.Name === user.CompanyName
    );
    let selectedCompanyID = company?.ID;
    const contactResponse = await PAS.get(`/Contacts`);
    const contactPerson = contactResponse.data.dsContacts.ttContacts.find(
      c => c.FullName === user.ContactPerson
    );
    let selectedContactID = contactPerson?.ID;
    // Fetch the last log record for this visitor, company, and contact
    const logResponse = await PAS.get(
      `/Visitor_Company_Contact?filter=VisitorID%20=%20${user.ID}%20AND%20CompanyID%20=%20${selectedCompanyID}%20AND%20ContactID%20=%20${selectedContactID}&orderby=DepartureDateTime%20desc&limit=1`
    );
    const lastLog = logResponse.data.dsVisitor_Company_Contact?.ttVisitor_Company_Contact?.[0];
    const visitLogPayload = {
      dsVisitor_Company_Contact: {
        ttVisitor_Company_Contact: [
          {
            ID: lastLog?.ID,
            VisitorID: user.ID,
            CompanyID: selectedCompanyID,
            ContactID: selectedContactID,
            DepartureDateTime: new Date().toISOString(),
            VisitPurpose: user.VisitPurpose || '',
            Updated: new Date().toISOString()
          }
        ]
      }
    };



    // console.log('Updating visitor log with payload:', visitLogPayload);
    await PAS.put('/Visitor_Company_Contact', visitLogPayload);
  } catch (error) {
    console.error('Error updating visitor log:', error);
    throw error;
  }
};

const logoutUserById = async (user) => {
  try {
    const payload = {
      dsVisitors: {
        ttVisitors: [
          {
            Active: true,
            CompanyName: user.CompanyName,
            ContactPerson: user.ContactPerson,
            FullName: user.FullName,
            GDPRAgreement: user.GDPRAgreement,
            ID: user.ID,
            InsertUser: user.InsertUser,
            Inserted: user.Inserted,
            Online: false,
            PINCode: user.PINCode,
            UpdateUser: 'user/logout',
            Updated: new Date().toISOString(),
            VisitPurpose: user.VisitPurpose
          }
        ]
      }
    };
    await PAS.put(`/Visitors`, payload);
    await updateVisitorLog(user);
    fetchLoggedInUsers();
    goodbyeName.value = user.FullName;
    showGoodbyeMessage.value = true;
    setTimeout(() => {
      showGoodbyeMessage.value = false;
      pinCode.value = '';
      fullName.value = '';
      suggestedUsers.value = [];
      selectedUser.value = null;
      inputMode.value = 'pin';
    }, 2000);
  } catch (error) {
    console.error('Error logging out user:', error);
  }
};

let user;
const logoutUserByPin = async () => {
  try {
    // console.log('Logging out user by PIN:', pinCode.value);
    const response = await PAS.get(`/Visitors?filter=PINCode%20=%20${pinCode.value}`);
    // console.log('Response from server:', response);
    user = response.data.dsVisitors.ttVisitors[0];
    // user.Online = true;
    if (user && user.Online) {
      const confirmLogout = confirm(`Are you sure you want to log out ${user.FullName}?`);
      if (confirmLogout) {
        await logoutUserById(user);
        pinCode.value = '';
      }
    } else {
      alert('No matching online user found for the entered PIN.');
    }
  } catch (error) {
    console.error('Error logging out user by PIN:', error);
  }
};

const handleNameInput = () => {
  suggestedUsers.value = loggedInUsers.value.filter((user) =>
    user.FullName.toLowerCase().includes(fullName.value.toLowerCase())
  );
};

const selectUser = (user) => {
  selectedUser.value = user;
  // console.log(`Selected user: ${user}`);
  const confirmLogout = confirm(`Are you sure you want to log out ${user.FullName}?`);
  if (confirmLogout) {
    // console.log(user)
    logoutUserById(user);
    fullName.value = '';
    suggestedUsers.value = [];
  }
};


const onChange = (inputValue) => {
  if (inputMode.value === 'pin') {
    pinCode.value = inputValue;
  } else {
    fullName.value = inputValue;
    handleNameInput();
  }
};

onMounted(() => {
  fetchLoggedInUsers();
});
</script>

<template>
  <div class="logout-container">
    <div class="input-mode-selector">
      <button :class="{ active: inputMode === 'pin' }" @click="inputMode = 'pin'">Use PIN</button>
      <button :class="{ active: inputMode === 'name' }" @click="inputMode = 'name'">Use Full Name</button>
    </div>

    <!-- PIN Input -->
    <div v-if="inputMode === 'pin'" class="pin-input">
      <p>Enter your PIN:</p>
      <input type="text" v-model="pinCode" readonly maxlength="4" placeholder="Enter PIN" />
      <div class="pin-keyboard-container">
        <SimpleKeyboard :keyboardClass="'pin-keyboard'" :input="pinCode" :lang="'num'" @onChange="onChange" />
      </div>
      <button class="logout-button" @click="logoutUserByPin">Log Out</button>
    </div>

    <!-- Full Name Input -->
    <div v-else class="name-input">
      <p>Enter your full name:</p>
      <input type="text" v-model="fullName" placeholder="Enter Full Name" />
      <div class="suggestions-scroll">
        <div class="user-suggestions" v-if="suggestedUsers.length">
          <div class="user-card" v-for="user in suggestedUsers" :key="user.ID" @click="selectUser(user)">
            {{ user.FullName }}
          </div>
        </div>
        <div class="full-keyboard-container">
          <SimpleKeyboard :keyboardClass="'full-keyboard'" :input="fullName" :lang="'hr'" @onChange="onChange" />
        </div>
      </div>
    </div>

    <div v-if="showGoodbyeMessage" class="goodbye-overlay">
      <div class="goodbye-popup">
        <h1>Goodbye, {{ goodbyeName }}!</h1>
      </div>
    </div>
  </div>
</template>

<style>
.pin-keyboard {
  width: 300px !important;
  margin: 0 auto !important;
}

.pin-keyboard .hg-button {
  height: 60px !important;
  font-size: 24px !important;
  color: black !important;
}

.pin-keyboard .hg-row {
  justify-content: center !important;
}

.full-keyboard {
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

.full-keyboard .hg-button {
  height: 45px !important;
  font-size: 18px !important;
  color: black !important;
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
</style>

<style scoped>
.logout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
}

.input-mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  justify-content: center;
}

.input-mode-selector button {
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #2c3e50;
  color: white;
  font-size: 18px;
  transition: background-color 0.3s ease;
}

.input-mode-selector button.active {
  background-color: #007bff;
}

.pin-input,
.name-input {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pin-input input,
.name-input input {
  width: 280px;
  height: 50px;
  font-size: 24px;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin-bottom: 20px;
}

.pin-keyboard-container,
.full-keyboard-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

/* .suggestions-scroll {
  width: 100%;
  max-width: 20rem;
  max-height: 325px;
  overflow-y: auto;
  margin-bottom: 10px;
  background: #fafbfc;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
} */

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-card {
  /* padding: 15px; */
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f8f9fa;
  color: black;
  transition: background-color 0.2s ease;
  text-align: center;
}

.suggestion-card:hover {
  background-color: #e0e0e0;
}

.suggestion-card p {
  margin: 5px 0;
}

.logout-button {
  padding: 15px 30px;
  font-size: 18px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c82333;
}

p {
  font-size: 18px;
  margin: 10px 0;
}

.goodbye-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.goodbye-popup {
  background: #1a252f;
  padding: 3rem 5rem;
  border-radius: 15px;
  animation: fadeIn 0.5s ease-out;
}

.goodbye-popup h1 {
  color: white;
  font-size: 4rem;
  text-align: center;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
