let currentIndentor = "";
let currentAdmin = "";
let currentDispatchTab = "today";
let selectedRow = null;
let hasUnsavedChanges = false;
let isLoadingTable = false;

function clearDispatchPageClasses() {

    document.body.classList.remove("delivered-page");
    document.body.classList.remove("unpaid-page");

}
function markUnsavedChange() {
    if (!isLoadingTable) {
        hasUnsavedChanges = true;
    }
}

function formatDateOnly() {
    const d = new Date();

    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
}

function formatShortPoDate(dateText) {
    let parts = dateText.split("-"); // 18-June-2026

    if (parts.length !== 3) return dateText;

    let day = parts[0];
    let month = parts[1].substring(0, 3);
    let year = parts[2].substring(2);

    return `${day}-${month}-${year}`;
}

function tabs(activeTab) {

    let stockTabs = "";

    if (currentIndentor !== "" || currentAdmin !== "") {
        stockTabs = `
           <button class="${activeTab === 'pending' ? 'active' : ''}" onclick="safeNavigate(openAddIndent)">Add Indent Table</button>

           <button class="${activeTab === 'unapproved' ? 'active' : ''}" onclick="safeNavigate(openUnapprovedList)">Unapproved List</button>

           <button class="${activeTab === 'requirement' ? 'active' : ''}" onclick="safeNavigate(openRequirementStock)">Requirement List</button>
        `;

       if (currentAdmin !== "") {
    stockTabs += `
        <button class="${activeTab === 'approved' ? 'active' : ''}" onclick="safeNavigate(openApprovedStock)">Received List</button>
        <button class="${activeTab === 'rejected' ? 'active' : ''}" onclick="safeNavigate(openRejectedStock)">Rejected List</button>
    `;
}

        if (currentIndentor !== "") {
            stockTabs += `
               <button class="${activeTab === 'received' ? 'active' : ''}" onclick="safeNavigate(openApprovedStock)">Received List</button>

<button class="${activeTab === 'indentorRejected' ? 'active' : ''}" onclick="safeNavigate(openRejectedStock)">Rejected List</button>
            `;
        }
    }

    let loginDropdown = "";

    if (activeTab === "admin" || currentAdmin !== "") {
        loginDropdown = `
        <div class="dropdown">
           <button class="active">${currentAdmin !== "" ? currentAdmin + " Login" : "Admin Login"}</button>
            <div class="dropdown-content">
                <button onclick="openAdminDashboard('Shrey Jain')">Shrey Jain</button>
                <button onclick="openAdminDashboard('Vipin Jain')">Vipin Jain</button>
                <button onclick="openAdminDashboard('Vinit Jain')">Vinit Jain</button>
            </div>
        </div>
        `;
    } else {
        loginDropdown = `
        <div class="dropdown">
            <button class="active">${currentIndentor !== "" ? currentIndentor + " Login" : "Indentor Login"}</button>
            <div class="dropdown-content">
                <button onclick="openIndentorDashboard('Shalini')">Shalini</button>
                <button onclick="openIndentorDashboard('Kannu')">Kannu</button>
            </div>
        </div>
        `;
    }

    return `
    <div class="tab-bar">
        <button onclick="location.reload()">Login</button>
        ${loginDropdown}
        ${stockTabs}
    </div>
    `;
} 

function safeNavigate(nextFunction) {

    if (!hasUnsavedChanges) {
        nextFunction();
        return;
    }

    let saveChanges = confirm(
        "You have unsaved changes.\n\nClick OK to Save.\nClick Cancel to continue without saving."
    );
if (saveChanges) {

    if (document.getElementById("stockTable")) {
        submitStock();
    }

    else if (document.getElementById("unapprovedTable")) {
        submitUnapprovedList();
    }

    else if (document.getElementById("requirementTable")) {
        submitAdminRequirementStock();
    }

    else if (document.getElementById("dispatchTable")) {
        submitDispatch();
    }

    hasUnsavedChanges = false;
} 
else {

    let rows = document.querySelectorAll("#dispatchTable tr");

    rows.forEach(row => {

        if (row.dataset.moveToDelivered === "yes") {

            delete row.dataset.moveToDelivered;

            row.classList.remove("selected-row");

        }

    });

    hasUnsavedChanges = false;

}

nextFunction();
}

function showAdmin() {
    currentAdmin = "";
    currentIndentor = "";

    document.body.innerHTML = tabs("admin") + `
    <div class="container">
        <div class="login-box">
            <h1>ADMIN LOGIN</h1>

            <button class="main-btn" onclick="openAdminDashboard('Shrey Jain')">Shrey Jain</button>
            <button class="main-btn" onclick="openAdminDashboard('Vipin Jain')">Vipin Jain</button>
            <button class="main-btn" onclick="openAdminDashboard('Vinit Jain')">Vinit Jain</button>
            <button class="main-btn back-btn" onclick="location.reload()">Back</button>

        
        </div>
    </div>
    `;
}

function showIndentor() {
    document.body.innerHTML = tabs("indentor") + `
    <div class="container">
        <div class="login-box">
            <h1>INDENTOR LOGIN</h1>

            <button class="main-btn" onclick="openIndentorDashboard('Shalini')">Shalini</button>
            <button class="main-btn" onclick="openIndentorDashboard('Kannu')">Kannu</button>
            <button class="main-btn back-btn" onclick="location.reload()">Back</button>

         
        </div>
    </div>
    `;
}

function openAdminDashboard(name) {
    currentAdmin = name;
    currentIndentor = "";
    autoDeleteOldReceivedRejected();

    document.body.innerHTML = `
    <div class="tab-bar">
        <button onclick="location.reload()">Login</button>

        <div class="dropdown">
            <button class="active">${currentAdmin} Login</button>
            <div class="dropdown-content">
                <button onclick="openAdminDashboard('Shrey Jain')">Shrey Jain</button>
                <button onclick="openAdminDashboard('Vipin Jain')">Vipin Jain</button>
                <button onclick="openAdminDashboard('Vinit Jain')">Vinit Jain</button>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="login-box">

            <h1>Welcome ${currentAdmin}</h1>

            <button class="main-btn" onclick="openIndentPortal()">
                📋 Indent Portal
            </button>

            <button class="main-btn" onclick="openDispatchPortal()">
                🚚 Dispatch Portal
            </button>

        </div>
    </div>
    `;
}
function openIndentPortal() {
    openAddIndent();
}

function openDispatchPortal() {

    currentDispatchTab = "today";
    openTodayDispatch();

}

function dispatchTabs() {

    return `

    <div class="tab-bar">

      <button onclick="location.reload()">
    Login
</button>

<div class="dropdown">

    <button class="${currentDispatchTab === 'login' ? 'active' : ''}">
        ${currentAdmin} Login
    </button>

    <div class="dropdown-content">
        <button onclick="openAdminDashboard('Shrey Jain')">Shrey Jain</button>
        <button onclick="openAdminDashboard('Vipin Jain')">Vipin Jain</button>
        <button onclick="openAdminDashboard('Vinit Jain')">Vinit Jain</button>
    </div>

</div>

<button class="${currentDispatchTab === 'today' ? 'active' : ''}"
onclick="currentDispatchTab='today'; safeNavigate(openTodayDispatch);">
    Today's Dispatch
</button>

<button class="${currentDispatchTab === 'transit' ? 'active' : ''}"
onclick="currentDispatchTab='transit'; safeNavigate(openInTransit);">
    In Transit
</button>

<button class="${currentDispatchTab === 'delivered' ? 'active' : ''}"
onclick="currentDispatchTab='delivered'; safeNavigate(openDelivered);">
    Delivered
</button>

<button class="${currentDispatchTab === 'unpaid' ? 'active' : ''}"
onclick="currentDispatchTab='unpaid'; safeNavigate(openUnpaidDocket);">
    Unpaid Docket
</button>

<button class="${currentDispatchTab === 'paid' ? 'active' : ''}"
onclick="currentDispatchTab='paid'; safeNavigate(openPaidDocket);">
    Paid Docket
</button>

<button class="${currentDispatchTab === 'detail' ? 'active' : ''}"
onclick="currentDispatchTab='detail'; safeNavigate(openDispatchDetail);">
    Dispatch Detail
</button>
    </div>

    `;

}

function openDispatchPage(title, headers, loadFunction) {

    let tableHeader = "<tr>";

    headers.forEach(h => {
        tableHeader += `<th>${h}</th>`;
    });

    tableHeader += "</tr>";

    document.body.innerHTML = dispatchTabs() + `
    <div class="container">
        <div class="login-box" style="width:95vw">

            <h2>${title}</h2>

            ${
                title !== "Today's Dispatch"
                ? `
<div class="search-row">
    <div class="search-box">
        <span>🔍</span>
        <input
            id="dispatchSearch"
            type="text"
            placeholder="Search Anything..."
            oninput="searchProductInTable('dispatchSearch','dispatchTable','dispatchNoResult')">
    </div>

    <button
        class="clear-btn"
        onclick="clearProductSearch('dispatchSearch','dispatchTable','dispatchNoResult')">
        Clear
    </button>
</div>

<p id="dispatchNoResult" class="no-result">
    No matching product found.
</p>
`
                : ""
            }

            <table border="1" width="100%" id="dispatchTable">
                ${tableHeader}
            </table>
<datalist id="dispatchCustomerList"></datalist>
            <br>

           <button class="table-btn" onclick="addDispatchRow()">Add</button>

<button class="table-btn" onclick="deleteSelectedRow('dispatch')">Delete</button>

<button class="submit-btn" onclick="submitDispatch()">Submit</button>

${title === "In Transit" ? `
<button
class="table-btn"
style="background:#FFD580;color:#000;"
onclick="moveSelectedToDelivered()">
Delivered
</button>
` : ""}

        </div>
    </div>
    `;

    loadFunction();

}

function openTodayDispatch() {

  clearDispatchPageClasses();

    openDispatchPage(

        "Today's Dispatch",

        [
            "Sr No",
            "Party Name",
            "Unit",
            "Transporter",
            "Destination",
            "Carton",
            "Freight",
            "Mobile No",
            "GR No"
        ],

        loadTodayDispatch

    );

    let list = document.getElementById("dispatchCustomerList");

    if (!list) {

        list = document.createElement("datalist");

        list.id = "dispatchCustomerList";

        document.body.appendChild(list);

    }

    list.innerHTML = "";

    getDispatchDetailCustomers().forEach(item => {

        list.innerHTML += `
<option value="${item.customerName}">
`;

    });

}

function openInTransit() {

   clearDispatchPageClasses();
    openDispatchPage(

        "In Transit",

        [
            "Sr No",
           `Customer
<span class="sort-box">
    <button class="sort-icon">▼</button>
    <span class="sort-menu">
        <button onclick="sortTableByColumn('dispatchTable',1,'az')">A → Z</button>
        <button onclick="sortTableByColumn('dispatchTable',1,'za')">Z → A</button>
    </span>
</span>`,
            "Unit",
            "Transporter",
            "Destination",
            "Carton",
            "Freight",
            "Mobile No",
            "GR No",
            "Current Status",
            "💬"
        ],

        loadInTransit

    );

}

function openDelivered() {

    clearDispatchPageClasses();
document.body.classList.add("delivered-page");

    openDispatchPage(

        "Delivered",

        [
            "Sr No",
           `Customer
<span class="sort-box">
    <button class="sort-icon">▼</button>
    <span class="sort-menu">
        <button onclick="sortTableByColumn('dispatchTable',1,'az')">A → Z</button>
        <button onclick="sortTableByColumn('dispatchTable',1,'za')">Z → A</button>
    </span>
</span>`,
            "Unit",
            "Transporter",
            "Booking",
            "Destination",
            "Carton",
            "Freight",
            "Mobile No",
            "GR No",
            "Delivered On",
            "💬"
        ],

        loadDelivered

    );

}

function openUnpaidDocket() {

    clearDispatchPageClasses();
document.body.classList.add("unpaid-page");

    openDispatchPage(

        "Unpaid Docket",

        [
            "Sr No",
          `Customer
<span class="sort-box">
    <button class="sort-icon">▼</button>
    <span class="sort-menu">
        <button onclick="sortTableByColumn('dispatchTable',1,'az')">A → Z</button>
        <button onclick="sortTableByColumn('dispatchTable',1,'za')">Z → A</button>
    </span>
</span>`,
            "Unit",
            "Transporter",
            "Booking",
            "Destination",
            "Carton",
            "Freight",
            "Mobile No",
            "GR No",
            "Paid Amount",
            "Paid Through",
            "Dated"
        ],

        loadUnpaidDocket

    );

}

function openPaidDocket() {

   clearDispatchPageClasses();
    openDispatchPage(

        "Paid Docket",

        [
            "Sr No",
           `Customer
<span class="sort-box">
    <button class="sort-icon">▼</button>
    <span class="sort-menu">
        <button onclick="sortTableByColumn('dispatchTable',1,'az')">A → Z</button>
        <button onclick="sortTableByColumn('dispatchTable',1,'za')">Z → A</button>
    </span>
</span>`,
            "Unit",
            "Transporter",
            "Destination",
            "Carton",
            "Freight",
            "Mobile No",
            "GR No",
            "Payment Date"
        ],

        loadPaidDocket

    );

}

function openDispatchDetail() {
   clearDispatchPageClasses();

    openDispatchPage(

        "Dispatch Detail",

        [
            "Sr No",
            "Customer Name",
            "Unit",
            "Transporter Name",
            "Booking",
            "Freight",
            "Mob No",
            "Remark"
        ],

        loadDispatchDetail

    );

}



function openIndentorDashboard(name) {
    currentIndentor = name;
    autoDeleteOldReceivedRejected();

    document.body.innerHTML = tabs("indentor") + `
    <div class="container">
        <div class="login-box">
            <h1>Welcome ${currentIndentor}</h1>

<button class="main-btn" onclick="openAddIndent()">
    Add Indent
</button>
           <button class="main-btn" onclick="openRequirementStock()">Requirement List</button>
            <button class="main-btn" onclick="openApprovedStock()">Received List</button>


<button class="main-btn" onclick="openRejectedStock()">Rejected List</button>
        
        </div>
    </div>
    `;
}

function openAddIndent() {
    document.body.innerHTML = tabs("pending") + `
    <div class="container">
      <div class="login-box" style="width:95vw">

           <h2>Add Indent Table</h2>

            <table border="1" width="100%" id="stockTable">
                <tr>
                    <th>Sr No</th>
                    <th>Product Name</th>
                    <th>Make</th>
                    <th>Cat No</th>
                    <th>Qty</th>
                    <th>UOM</th>
                   <th>Customer Name</th>
<th>PO No</th>
                    <th>Place</th>
                    <th>Shop</th>
                </tr>
            </table>

            <br>

<button class="table-btn" onclick="addRow()">Add</button>
<button class="table-btn" onclick="deleteSelectedRow('stock')">Delete</button>
<button class="submit-btn" onclick="submitStock()">Submit</button>


        </div>
    </div>
    `;

    loadPendingStock();
}

function addRow(afterRow = null) {
   markUnsavedChange();
    let table = document.getElementById("stockTable");
    let row = table.insertRow();

    for (let i = 0; i < 10; i++) {
        row.insertCell(i);
    }

    row.cells[0].innerHTML = "";

    for (let i = 1; i <= 9; i++) {
       row.cells[i].innerHTML = `
    <input type="text" onkeydown="moveLikeExcel(event, this, 'stockTable', 'addRow')">
`;
    }

    row.onclick = function () {
    selectRow(row);
};

    if (afterRow) {
        afterRow.parentNode.insertBefore(row, afterRow.nextSibling);
    }

    updateSrNo();
    row.cells[1].querySelector("input").focus();
}
function addDispatchRow(afterRow = null) {

    let table = document.getElementById("dispatchTable");

    let totalColumns = table.rows[0].cells.length;

    markUnsavedChange();

    let row = table.insertRow();

    for (let i = 0; i < totalColumns; i++) {
        row.insertCell(i);
    }

  row.cells[0].innerHTML = `
<label style="display:flex;align-items:center;justify-content:center;">
    <input type="checkbox"
           class="dispatch-checkbox"
           onchange="this.closest('tr').classList.toggle('selected-row',this.checked)">
</label>
`;

   let pageTitle = document.querySelector(".login-box h2").innerText;

for (let i = 1; i < totalColumns; i++) {

   if (pageTitle === "In Transit" && i === totalColumns - 1) {

    row.cells[i].innerHTML = `
<button
class="whatsapp-btn"
onclick="sendInTransitWhatsApp(this)">
Send WhatsApp
</button>
`;

}

  else if (pageTitle === "Delivered" && i === totalColumns - 1) {

    row.cells[i].innerHTML = `
<button
class="whatsapp-btn"
onclick="sendDeliveredWhatsApp(this)">
Send WhatsApp
</button>
`;

}
   

    else {

 if (
    pageTitle === "Today's Dispatch" &&
    i === 1
) {

    row.cells[i].innerHTML = `
<input
type="text"
list="dispatchCustomerList"
value=""
onfocus="selectRow(this.closest('tr'))"
oninput="markUnsavedChange()"
onchange="fillDispatchCustomer(this.closest('tr'),this.value)"
onkeydown="moveLikeExcel(event,this,'dispatchTable','addDispatchRow')">
`;

}


else {

    row.cells[i].innerHTML = `
<input type="text"
onfocus="selectRow(this.closest('tr'))"
oninput="markUnsavedChange()"
onkeydown="moveLikeExcel(event,this,'dispatchTable','addDispatchRow')">
`;

}

    }

}


if (pageTitle !== "In Transit") {
    row.onclick = function () {
        selectRow(row);
    };
}

    if (afterRow) {
        afterRow.parentNode.insertBefore(row, afterRow.nextSibling);
    }

    updateDispatchSrNo();

   let firstInput = row.querySelector('input[type="text"]');

if (firstInput) {
    firstInput.focus();
}

}

function updateDispatchSrNo() {

    let table = document.getElementById("dispatchTable");

    let pageTitle = document.querySelector(".login-box h2").innerText;
    

    for (let i = 1; i < table.rows.length; i++) {

        if (pageTitle === "In Transit") {

         let checked =
    table.rows[i].querySelector(".dispatch-checkbox")?.checked || false;

table.rows[i].cells[0].innerHTML = `
<label style="display:flex;align-items:center;justify-content:center;gap:4px;">
    <input type="checkbox"
           class="dispatch-checkbox"
           ${checked ? "checked" : ""}
           onchange="
this.closest('tr').classList.toggle('selected-row', this.checked);
this.closest('tr').style.backgroundColor=this.checked?'#dbeafe':'';
">
    <span>${i}</span>
</label>
`;

if (checked) {
    table.rows[i].classList.add("selected-row");
    table.rows[i].style.backgroundColor = "#dbeafe";
} else {
    table.rows[i].classList.remove("selected-row");
    table.rows[i].style.backgroundColor = "";
}

        } else {

            table.rows[i].cells[0].innerHTML = `${i}`;

        }

    }

}

function deleteRow(btn) {
    let row = btn.parentElement.parentElement;
    row.remove();
}


function deleteSelectedRow(updateFunctionName) {

    let pageTitle = "";

    if (updateFunctionName === "dispatch") {
        pageTitle = document.querySelector(".login-box h2").innerText;
    }

    // Only In Transit uses checkbox selection
    if (updateFunctionName === "dispatch" && pageTitle === "In Transit") {

        let checkedRows = document.querySelectorAll(
            "#dispatchTable .dispatch-checkbox:checked"
        );

        if (checkedRows.length === 0) {
            alert("Please select a row first.");
            return;
        }

        checkedRows.forEach(check => {
            check.closest("tr").remove();
        });

        hasUnsavedChanges = true;
        updateDispatchSrNo();
        return;
    }

    // Old behaviour for every other table
    if (!selectedRow) {
        alert("Please select a row first.");
        return;
    }

    if (updateFunctionName === "unapproved" && currentIndentor !== "") {

        let createdBy =
            selectedRow.dataset.createdBy ||
            selectedRow.cells[1].innerText;

        if (createdBy !== currentIndentor) {
            alert("You can delete only your own unapproved row.");
            return;
        }
    }

    selectedRow.remove();

    hasUnsavedChanges = true;

    selectedRow = null;

    if (updateFunctionName === "stock") {
        updateSrNo();
    }

    if (updateFunctionName === "dispatch") {
        updateDispatchSrNo();
    }

    if (updateFunctionName === "requirement") {
        updateRequirementSrNo();
    }

    if (updateFunctionName === "unapproved") {
        updateUnapprovedSrNo();
    }
}


function updateSrNo() {
    let table = document.getElementById("stockTable");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        rows[i].cells[0].innerHTML = i;
    }
}

function selectRow(row) {
    let rows = document.querySelectorAll("tr");

    rows.forEach(r => {
        r.style.outline = "";
    });

    row.style.outline = "2px solid #0d6efd";
    selectedRow = row;
}


function moveLikeExcel(event, input, tableId, addFunctionName) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    formatDispatchDate(input);
let currentCell = input.closest("td");
let currentRow = input.closest("tr");

/* Requirement Table: Received column goes downward only when clicked/active */
if (tableId === "requirementTable" && currentCell && currentCell.cellIndex === 12) {
    let nextRow = currentRow.nextElementSibling;

    if (!nextRow) {
        addRequirementRow();
        nextRow = currentRow.nextElementSibling;
    }

    if (nextRow) {
        let nextReceivedInput = nextRow.cells[12]?.querySelector('input[type="text"]');

        if (nextReceivedInput) {
            nextReceivedInput.focus();
            nextReceivedInput.select();
        }
    }

    return;
}

/* Requirement Table: normal entry should stop at Shop and go to next row Product Name */
if (tableId === "requirementTable" && currentCell && currentCell.cellIndex === 10) {
    let nextRow = currentRow.nextElementSibling;

    if (!nextRow) {
        addRequirementRow();
        nextRow = currentRow.nextElementSibling;
    }

    if (nextRow) {
        let nextProductInput = nextRow.cells[2]?.querySelector('input[type="text"]');

        if (nextProductInput) {
            nextProductInput.focus();
            nextProductInput.select();
        }
    }

    return;
}
    let row = input.closest("tr");

    let inputs = Array.from(
        row.querySelectorAll('input[type="text"]:not([readonly])')
    );

    let currentIndex = inputs.indexOf(input);

    if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        inputs[currentIndex + 1].select();
        return;
    }

    let nextRow = row.nextElementSibling;

    if (!nextRow) {
       if (addFunctionName === "addRow") {
    addRow();
} else if (addFunctionName === "addDispatchRow") {
    addDispatchRow();
} else if (addFunctionName === "addRequirementRow") {
    addRequirementRow();
} else if (addFunctionName === "addUnapprovedRow") {
    addUnapprovedRow();
}

        nextRow = row.nextElementSibling;
    }

    if (nextRow) {
        let nextInputs = nextRow.querySelectorAll('input[type="text"]:not([readonly])');

        if (nextInputs.length > 0) {
            nextInputs[0].focus();
            nextInputs[0].select();
        }
    }
}


function submitStock() {
    let table = document.getElementById("stockTable");
    let rows = table.getElementsByTagName("tr");

    let data = getRequirementData();

    for (let i = 1; i < rows.length; i++) {
        let inputs = rows[i].getElementsByTagName("input");

        let item = {
            indentor: currentIndentor !== "" ? currentIndentor : currentAdmin,
            productName: inputs[0].value.trim(),
            make: inputs[1].value.trim(),
            catNo: inputs[2].value.trim(),
            qty: inputs[3].value.trim(),
            uom: inputs[4].value.trim(),
           customerName: inputs[5].value.trim(),
poNo: inputs[6].value.trim(),
place: inputs[7].value.trim(),
shop: inputs[8].value.trim(),
            status: "Pending",
            remark: "",
           editReceived: "",
createdBy: currentIndentor !== "" ? currentIndentor : currentAdmin,
createdDate: formatDateOnly(),
approvedBy: "",
approvedDate: ""
        };

        if (item.productName !== "") {
            data.push(item);
        }
    }

    saveRequirementData(data);
    localStorage.removeItem("pendingStock");

    hasUnsavedChanges = false;
    alert("Item moved to Unapproved List!");
    openAddIndent();
}

function submitDispatch() {

    let table = document.getElementById("dispatchTable");
    let rows = table.getElementsByTagName("tr");

    let pageTitle = document.querySelector(".login-box h2").innerText;

    let allData = getRequirementData();

    if (pageTitle === "Today's Dispatch") {

    allData = allData.filter(item =>
        !(item.module === "dispatch" &&
          item.dispatchStatus === "Today's Dispatch")
    );

}
else {

    allData = allData.filter(item =>
        !(item.module === "dispatch" &&
          item.dispatchStatus === pageTitle)
    );

}

    for (let i = 1; i < rows.length; i++) {

       let inputs = rows[i].querySelectorAll('input[type="text"]');

        let item = {
            module: "dispatch",
            dispatchStatus: pageTitle,
            createdBy: currentAdmin,
            createdDate: formatDateOnly()
        };

       if (pageTitle === "Today's Dispatch") {

    item.partyName = inputs[0].value.trim();
    item.unit = inputs[1].value.trim();
    item.transporter = inputs[2].value.trim();
    item.destination = inputs[3].value.trim();
    item.carton = inputs[4].value.trim();
    item.freight = inputs[5].value.trim();
    item.mobileNo = inputs[6].value.trim();
    item.grNo = inputs[7].value.trim();

    if (
    item.partyName ||
    item.unit ||
    item.transporter ||
    item.destination ||
    item.carton ||
    item.freight ||
    item.mobileNo ||
    item.grNo
) {

    let transitItem = {

        ...item,

        customer: item.partyName,

        dispatchStatus: "In Transit"

    };

    delete transitItem.partyName;

    allData.push(transitItem);

    if (
        item.freight.trim().toLowerCase() === "paid"
    ) {

        let unpaidItem = {

            ...transitItem,

            dispatchStatus: "Unpaid Docket",

            paidAmount: "",

            paidThrough: "",

            dated: ""

        };

        allData.push(unpaidItem);

    }

}

}

       else if (pageTitle === "In Transit") {

    item.customer = inputs[0].value.trim();
    item.unit = inputs[1].value.trim();
    item.transporter = inputs[2].value.trim();
    item.destination = inputs[3].value.trim();
    item.carton = inputs[4].value.trim();
    item.freight = inputs[5].value.trim();
    item.mobileNo = inputs[6].value.trim();
    item.grNo = inputs[7].value.trim();
    item.currentStatus = inputs[8].value.trim();

    let moveToDelivered =
        rows[i].dataset.moveToDelivered === "yes";

    if (moveToDelivered) {

        let deliveredItem = {

            ...item,

            dispatchStatus: "Delivered",

            booking: "",

            deliveredOn: ""

        };

        delete deliveredItem.currentStatus;

        allData.push(deliveredItem);

    }
    else {

        if (
            item.customer ||
            item.unit ||
            item.transporter ||
            item.destination ||
            item.carton ||
            item.freight ||
            item.mobileNo ||
            item.grNo ||
            item.currentStatus
        ) {

            allData.push(item);

        }

    }

}

        else if (pageTitle === "Delivered") {

    item.customer = inputs[0].value.trim();
    item.unit = inputs[1].value.trim();
    item.transporter = inputs[2].value.trim();
    item.booking = inputs[3].value.trim();
    item.destination = inputs[4].value.trim();
    item.carton = inputs[5].value.trim();
    item.freight = inputs[6].value.trim();
    item.mobileNo = inputs[7].value.trim();
    item.grNo = inputs[8].value.trim();
    item.deliveredOn = inputs[9].value.trim();

   if (
    item.customer ||
    item.unit ||
    item.transporter ||
    item.booking ||
    item.destination ||
    item.carton ||
    item.freight ||
    item.mobileNo ||
    item.grNo ||
    item.deliveredOn
) {
    allData.push(item);
}

}

else if (pageTitle === "Unpaid Docket") {

    item.customer = inputs[0].value.trim();
    item.unit = inputs[1].value.trim();
    item.transporter = inputs[2].value.trim();
    item.booking = inputs[3].value.trim();
    item.destination = inputs[4].value.trim();
    item.carton = inputs[5].value.trim();
    item.freight = inputs[6].value.trim();
    item.mobileNo = inputs[7].value.trim();
    item.grNo = inputs[8].value.trim();
    item.paidAmount = inputs[9].value.trim();
    item.paidThrough = inputs[10].value.trim();
    item.dated = inputs[11].value.trim();

   if (
    item.customer ||
    item.unit ||
    item.transporter ||
    item.booking ||
    item.destination ||
    item.carton ||
    item.freight ||
    item.mobileNo ||
    item.grNo ||
    item.paidAmount ||
    item.paidThrough ||
    item.dated
) {

    if (
        item.paidAmount &&
        item.paidThrough &&
        item.dated
    ) {

        let paidItem = {

            ...item,

            dispatchStatus: "Paid Docket",

            paymentDate: item.dated

        };

        delete paidItem.paidAmount;
        delete paidItem.paidThrough;
        delete paidItem.dated;

        allData.push(paidItem);

    }
    else {

        allData.push(item);

    }

}

}
else if (pageTitle === "Paid Docket") {

    item.customer = inputs[0].value.trim();
    item.unit = inputs[1].value.trim();
    item.transporter = inputs[2].value.trim();
    item.destination = inputs[3].value.trim();
    item.carton = inputs[4].value.trim();
    item.freight = inputs[5].value.trim();
    item.mobileNo = inputs[6].value.trim();
    item.grNo = inputs[7].value.trim();
    item.paymentDate = inputs[8].value.trim();

    if (
        item.customer ||
        item.unit ||
        item.transporter ||
        item.destination ||
        item.carton ||
        item.freight ||
        item.mobileNo ||
        item.grNo ||
        item.paymentDate
    ) {
        allData.push(item);
    }

}

else if (pageTitle === "Dispatch Detail") {

    item.customerName = inputs[0].value.trim();
    item.unit = inputs[1].value.trim();
    item.transporterName = inputs[2].value.trim();
    item.booking = inputs[3].value.trim();
    item.freight = inputs[4].value.trim();
    item.mobileNo = inputs[5].value.trim();
    item.remark = inputs[6].value.trim();

    if (
        item.customerName ||
        item.unit ||
        item.transporterName ||
        item.booking ||
        item.freight ||
        item.mobileNo ||
        item.remark
    ) {
        allData.push(item);
    }

}

    }


    saveRequirementData(allData);

    hasUnsavedChanges = false;

    alert("Dispatch Saved Successfully!");

 if (pageTitle === "Today's Dispatch") {

    openTodayDispatch();

}
else if (pageTitle === "In Transit") {
    openInTransit();
}
else if (pageTitle === "Delivered") {
    openDelivered();
}
else if (pageTitle === "Unpaid Docket") {
    openUnpaidDocket();
}
else if (pageTitle === "Paid Docket") {
    openPaidDocket();
}
else if (pageTitle === "Dispatch Detail") {
    openDispatchDetail();
}

}


function loadTodayDispatch() {

    isLoadingTable = true;

    let data = getRequirementData();

    let dispatchData = data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "Today's Dispatch"
    );

    if (dispatchData.length === 0) {
        addDispatchRow();
    } else {
        for (let item of dispatchData) {
            addDispatchRowWithValue(item);
        }
    }

    isLoadingTable = false;
    let list = document.getElementById("dispatchCustomerList");

if (list) {

    list.innerHTML = "";

    getDispatchDetailCustomers().forEach(item => {

        list.innerHTML += `<option value="${item.customerName}">`;

    });

}
    hasUnsavedChanges = false;
}


function loadInTransit() {

    isLoadingTable = true;

    let data = getRequirementData();

    let transitData = data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "In Transit"
    );

    if (transitData.length === 0) {
        addDispatchRow();
    } else {
        transitData.forEach(item => addDispatchRowWithValue(item));
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function loadDelivered() {

    isLoadingTable = true;

    let data = getRequirementData();

    let deliveredData = data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "Delivered"
    );

    if (deliveredData.length === 0) {
        addDispatchRow();
    } else {
        deliveredData.forEach(item => addDispatchRowWithValue(item));
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function loadUnpaidDocket() {

    isLoadingTable = true;

    let data = getRequirementData();

    let unpaidData = data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "Unpaid Docket"
    );

    if (unpaidData.length === 0) {
        addDispatchRow();
    } else {
        unpaidData.forEach(item => addDispatchRowWithValue(item));
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function loadPaidDocket() {

    isLoadingTable = true;

    let data = getRequirementData();

    let paidData = data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "Paid Docket"
    );

    if (paidData.length === 0) {
        addDispatchRow();
    } else {
        paidData.forEach(item => addDispatchRowWithValue(item));
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function loadDispatchDetail() {

    isLoadingTable = true;

    let data = getRequirementData();

    let detailData = data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "Dispatch Detail"
    );

    if (detailData.length === 0) {
        addDispatchRow();
    } else {
        detailData.forEach(item => addDispatchRowWithValue(item));
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function loadPendingStock() {
    isLoadingTable = true;

    let savedData = localStorage.getItem("pendingStock");

    if (savedData) {
        let data = JSON.parse(savedData);

        for (let i = 0; i < data.length; i++) {
            addRowWithValue(data[i]);
        }
    } else {
        addRow();
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function addRowWithValue(item) {
    let table = document.getElementById("stockTable");
    let row = table.insertRow();

   for (let i = 0; i < 10; i++) {
    row.insertCell(i);
}

    row.cells[0].innerHTML = "";

    let values = [
    item.productName || "",
    item.make || "",
    item.catNo || "",
    item.qty || "",
    item.uom || "",
    item.customerName || "",
    item.poNo || "",
    item.place || "",
    item.shop || ""
];

   for (let i = 1; i <= 9; i++) {
        row.cells[i].innerHTML = `
            <input type="text" value="${values[i - 1]}"
           onkeydown="moveLikeExcel(event, this, 'stockTable', 'addRow')">
        `;
    }

   row.onclick = function () {
    selectRow(row);
};

    updateSrNo();
}

function addDispatchRowWithValue(item) {

    let table = document.getElementById("dispatchTable");

    let totalColumns = table.rows[0].cells.length;

    let row = table.insertRow();

    for (let i = 0; i < totalColumns; i++) {
        row.insertCell(i);
    }

    row.cells[0].innerHTML = "";

    let values = [];

    if (item.dispatchStatus === "Today's Dispatch") {

    values = [
        item.partyName || "",
        item.unit || "",
        item.transporter || "",
        item.destination || "",
        item.carton || "",
        item.freight || "",
        item.mobileNo || "",
        item.grNo || ""
    ];

}
    else if (item.dispatchStatus === "In Transit") {

        values = [
            item.customer || "",
            item.unit || "",
            item.transporter || "",
            item.destination || "",
            item.carton || "",
            item.freight || "",
            item.mobileNo || "",
            item.grNo || "",
            item.currentStatus || ""
        ];

    }
    else if (item.dispatchStatus === "Delivered") {

    values = [
        item.customer || "",
        item.unit || "",
        item.transporter || "",
        item.booking || "",
        item.destination || "",
        item.carton || "",
        item.freight || "",
        item.mobileNo || "",
        item.grNo || "",
        item.deliveredOn || "",
        ""
    ];

}
else if (item.dispatchStatus === "Unpaid Docket") {

    values = [
        item.customer || "",
        item.unit || "",
        item.transporter || "",
        item.booking || "",
        item.destination || "",
        item.carton || "",
        item.freight || "",
        item.mobileNo || "",
        item.grNo || "",
        item.paidAmount || "",
        item.paidThrough || "",
        item.dated || ""
    ];

}
else if (item.dispatchStatus === "Paid Docket") {

    values = [
        item.customer || "",
        item.unit || "",
        item.transporter || "",
        item.destination || "",
        item.carton || "",
        item.freight || "",
        item.mobileNo || "",
        item.grNo || "",
        item.paymentDate || ""
    ];

}
else if (item.dispatchStatus === "Dispatch Detail") {

    values = [
        item.customerName || "",
        item.unit || "",
        item.transporterName || "",
        item.booking || "",
        item.freight || "",
        item.mobileNo || "",
        item.remark || ""
    ];

}

    for (let i = 1; i < totalColumns; i++) {

   if (item.dispatchStatus === "In Transit" &&
    i === totalColumns - 1) {

    row.cells[i].innerHTML = `
<button
class="whatsapp-btn"
onclick="sendInTransitWhatsApp(this)">
Send WhatsApp
</button>
`;

}

 else if (item.dispatchStatus === "Delivered" &&
         i === totalColumns - 1) {

    row.cells[i].innerHTML = `
<button
class="whatsapp-btn"
onclick="sendDeliveredWhatsApp(this)">
Send WhatsApp
</button>
`;

}
  

    else {

       row.cells[i].innerHTML = `
${
item.dispatchStatus === "Today's Dispatch" && i === 1
?
`
<input type="text"
list="dispatchCustomerList"
value="${values[i-1] || ""}"
onfocus="selectRow(this.closest('tr'))"
oninput="markUnsavedChange()"
onchange="fillDispatchCustomer(this.closest('tr'),this.value)"
onkeydown="moveLikeExcel(event,this,'dispatchTable','addDispatchRow')">
`
:
`
<input type="text"
value="${values[i-1] || ""}"
onfocus="selectRow(this.closest('tr'))"
oninput="markUnsavedChange()"
onblur="formatDispatchDate(this)"
onkeydown="moveLikeExcel(event,this,'dispatchTable','addDispatchRow')">
`
}
`;

    }

}
   if (item.dispatchStatus !== "In Transit") {
    row.onclick = function () {
        selectRow(row);
    };
}

    updateDispatchSrNo();
}



 function getRequirementData() {
    let data = [];

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/data", false);
    xhr.onload = function () {
        if (xhr.status === 200) {
            data = JSON.parse(xhr.responseText || "[]");
        }
    };
    xhr.send();

    return data;
}

function saveRequirementData(data) {

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/data", false);

    xhr.setRequestHeader("Content-Type","application/json");

    xhr.send(JSON.stringify(data));

}

/* PASTE HERE */


// ===================== WhatsApp Settings =====================

const COMPANY_NAME = "SV Scientific Co.";


// ===================== WhatsApp Message =====================

function getWhatsAppMessage(rowData) {

    // In Transit message
    if (rowData.currentStatus !== undefined) {

        return `Dear Sir/Madam,

Your shipment is in transit.

Customer : ${rowData.customer}
Transporter : ${rowData.transporter}
Destination : ${rowData.destination}
GR No : ${rowData.grNo}
Current Status : ${rowData.currentStatus}

Thank you.

${COMPANY_NAME}`;

    }

    // Delivered message
    return `Dear Sir/Madam,

Your shipment has been delivered successfully.

Customer : ${rowData.customer}
Transporter : ${rowData.transporter}
Destination : ${rowData.destination}
GR No : ${rowData.grNo}
Delivered On : ${rowData.deliveredOn}

Thank you.

${COMPANY_NAME}`;

}
// ===================== Open WhatsApp =====================

function openWhatsAppWeb(phoneNumber, message) {

    phoneNumber = phoneNumber.replace(/\D/g, "");

    if (phoneNumber === "") {
        alert("Mobile Number is empty.");
        return;
    }

    if (phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber;
    }

   let whatsappUrl =
    "https://web.whatsapp.com/send?phone=" +
    phoneNumber +
    "&text=" +
    encodeURIComponent(message);

    window.open(whatsappUrl, "_blank");

}

// ===================== Send WhatsApp From Delivered Row =====================

function sendDeliveredWhatsApp(button) {

    let row = button.closest("tr");

    let inputs = row.querySelectorAll('input[type="text"]');

    let rowData = {

        customer: inputs[0].value.trim(),
        transporter: inputs[2].value.trim(),
        destination: inputs[4].value.trim(),
        grNo: inputs[8].value.trim(),
        deliveredOn: inputs[9].value.trim()

    };

    let phoneNumber = inputs[7].value.trim();

    let message = getWhatsAppMessage(rowData);

   openWhatsAppWeb(phoneNumber, message);

}
function sendInTransitWhatsApp(button) {

    let row = button.closest("tr");

    let inputs = row.querySelectorAll('input[type="text"]');

    let rowData = {

        customer: inputs[0].value.trim(),
        transporter: inputs[2].value.trim(),
        destination: inputs[3].value.trim(),
        grNo: inputs[7].value.trim(),
        currentStatus: inputs[8].value.trim()

    };

    let phoneNumber = inputs[6].value.trim();

    let message = getWhatsAppMessage(rowData);

    openWhatsAppWeb(phoneNumber, message);

}

function sortTableByColumn(tableId, columnIndex, order) {

    let table = document.getElementById(tableId);

    let rows = Array.from(table.rows).slice(1);

    rows.sort(function (a, b) {

        let aInput = a.cells[columnIndex].querySelector("input");
        let bInput = b.cells[columnIndex].querySelector("input");

        let aValue = aInput ? aInput.value.trim().toLowerCase() : "";
        let bValue = bInput ? bInput.value.trim().toLowerCase() : "";

        return order === "az"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);

    });

    rows.forEach(row => table.appendChild(row));

    if (tableId === "requirementTable") {

        updateRequirementSrNo();

    }
    else if (tableId === "dispatchTable") {

        let pageTitle = document.querySelector(".login-box h2").innerText;

        if (pageTitle === "In Transit") {

            updateDispatchSrNo();

        } else {

            for (let i = 1; i < table.rows.length; i++) {
                table.rows[i].cells[0].innerText = i;
            }

        }

    }
    else {

        for (let i = 1; i < table.rows.length; i++) {
            table.rows[i].cells[0].innerText = i;
        }

    }

}

function moveSelectedToDelivered() {

    let checkedRows = document.querySelectorAll(
        "#dispatchTable .dispatch-checkbox:checked"
    );

    if (checkedRows.length === 0) {

        alert("Please select at least one row.");

        return;

    }

    checkedRows.forEach(check => {

        let row = check.closest("tr");

        row.dataset.moveToDelivered = "yes";

        row.classList.add("selected-row");
        hasUnsavedChanges = true;

    });

}



function getDispatchDetailCustomers() {

    let data = getRequirementData();

    return data.filter(item =>
        item.module === "dispatch" &&
        item.dispatchStatus === "Dispatch Detail"
    );

}

function fillDispatchCustomer(row, customerName) {

    let detail = getDispatchDetailCustomers().find(item =>
        item.customerName.trim().toLowerCase() === customerName.trim().toLowerCase()
    );

    if (!detail) {
        return;
    }

    let inputs = row.querySelectorAll('input[type="text"]');

    inputs[0].value = detail.customerName || "";
    inputs[1].value = detail.unit || "";
    inputs[2].value = detail.transporterName || "";
    inputs[3].value = detail.booking || "";

    // Carton (inputs[4]) left for manual entry

    inputs[5].value = detail.freight || "";
    inputs[6].value = detail.mobileNo || "";

    // GR No (inputs[7]) left for manual entry

    markUnsavedChange();
}




const AUTO_DELETE_DAYS = 30;

function parseSavedDate(dateText) {
    if (!dateText) return null;

    // Format: 15-May-2026 or 15-May-26
    if (dateText.includes("-")) {
        let parts = dateText.split("-");
        if (parts.length !== 3) return null;

        let day = Number(parts[0]);
        let monthName = parts[1];
        let year = Number(parts[2]);

        if (year < 100) year += 2000;

        let monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

        if (isNaN(day) || isNaN(monthIndex) || isNaN(year)) return null;

        return new Date(year, monthIndex, day);
    }

    // Format: 5/15/2026, 5:14:52 PM
    let normalDate = new Date(dateText);

    if (!isNaN(normalDate.getTime())) {
        return normalDate;
    }

    return null;
}

function autoDeleteOldReceivedRejected() {
    let allData = getRequirementData();
    let today = new Date();

    let cleanedData = allData.filter(item => {
        if (item.status !== "Received" && item.status !== "Rejected") {
            return true;
        }

        let recordDate = null;

        if (item.status === "Received") {
            recordDate = parseSavedDate(item.receivedDate);
        }

        if (item.status === "Rejected") {
            recordDate = parseSavedDate(item.approvedDate);
        }

        if (!recordDate) {
            return true;
        }

        let diffTime = today - recordDate;
        let diffDays = diffTime / (1000 * 60 * 60 * 24);

        return diffDays < AUTO_DELETE_DAYS;
    });

    if (cleanedData.length !== allData.length) {
        saveRequirementData(cleanedData);
    }
}

function openRequirementStock() {
    openAdminRequirementStock();
}

function openIndentorRequirementStock() {
    document.body.innerHTML = tabs("requirement") + `
    <div class="container">
      <div class="login-box" style="width:98vw">
            <h2>Requirement List</h2>

            <table border="1" width="100%" id="requirementTable">
                <tr>
                    <th>Sr No</th>
                    <th>Indentor</th>
                    <th>Product Name</th>
                    <th>Make</th>
                    <th>Cat No</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Customer Name</th>
                    <th>PO No</th>
                    <th>Place</th>
                    <th>Shop</th>
                    <th>Received</th>
                    <th>Pending</th>
                    <th>Extra Received</th>
                </tr>
            </table>

            <br>
            <button class="table-btn" onclick="addRequirementRow()">Add</button>
            <button class="table-btn" onclick="deleteSelectedRow('requirement')">Delete</button>
            <button class="submit-btn" onclick="submitAdminRequirementStock()">Submit</button>

        </div>
    </div>
    `;

    loadAdminRequirementRows();
}

function openAdminRequirementStock() {
    document.body.innerHTML = tabs("requirement") + `
    <div class="container">
      <div class="login-box" style="width:98vw">
           <h2>Requirement List</h2>

           <div class="search-row">
    <div class="search-box">
        <span>🔍</span>
        <input id="requirementSearch" type="text"
       placeholder="Search Anything..."
oninput="searchProductInTable('requirementSearch','requirementTable','requirementNoResult')">
    </div>

    <button class="clear-btn"
    onclick="clearProductSearch('requirementSearch','requirementTable','requirementNoResult')">
        Clear
    </button>
</div>

<p id="requirementNoResult" class="no-result">
    No matching product found.
</p>
            <table border="1" width="100%" id="requirementTable">
                <tr>
                    <th>Sr No</th>
                    <th>Indentor</th>
                   <th>
    Product Name
    <span class="sort-box">
        <button class="sort-icon">▼</button>
        <span class="sort-menu">
            <button onclick="sortTableByColumn(this.closest('table').id, 2, 'az')">A → Z</button>
            <button onclick="sortTableByColumn(this.closest('table').id, 2, 'za')">Z → A</button>
        </span>
    </span>
</th>
                   <th>Make <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 3, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 3, 'za')">Z → A</button></span></span></th>
                    <th>Cat No <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 4, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 4, 'za')">Z → A</button></span></span></th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Customer Name <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 7, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 7, 'za')">Z → A</button></span></span></th>
                    <th>PO No</th>
                    <th>Place <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 9, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 9, 'za')">Z → A</button></span></span></th>
                    <th>Shop <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 10, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 10, 'za')">Z → A</button></span></span></th>
                    <th>
    Party Name
    <span class="sort-box">
        <button class="sort-icon">▼</button>
        <span class="sort-menu">
            <button onclick="sortTableByColumn(this.closest('table').id, 11, 'az')">A → Z</button>
            <button onclick="sortTableByColumn(this.closest('table').id, 11, 'za')">Z → A</button>
        </span>
    </span>
</th>
                    <th>Received</th>
              <th style="background-color:#ffd699;">Pending</th>
                    <th>Extra Received</th>
                </tr>
            </table>

            <br>
            ${currentAdmin !== "" ? `
<button class="table-btn" onclick="addRequirementRow()">Add</button>
<button class="table-btn" onclick="deleteSelectedRequirementRows()">Delete</button>
<button <button id="exportPoBtn" class="table-btn" onclick="openPoPopup()">Export PO</button>
` : ""}
<button class="export-btn" onclick="exportRequirementToExcel()">Export Excel</button>
<button class="submit-btn" onclick="submitAdminRequirementStock()">Submit</button>

        </div>
    </div>

    <div id="poPopupOverlay" class="po-popup-overlay">
    <div class="po-popup-box">
        <h3>PO Details</h3>

        <label>Company Name</label>
        <select id="poCompanyName">
            <option value="S.V. Scientific Co.">S.V. Scientific Co.</option>
            <option value="SAMYAK ENTERPRISES">SAMYAK ENTERPRISES</option>
        </select>

        <p id="poItemText" class="po-item-text"></p>

        <label>Party Name</label>
       <input type="text" id="poPartyName" list="partySuggestions" placeholder="Enter Party Name">
<datalist id="partySuggestions"></datalist>

        <label>Date</label>
        <input type="text" id="poDate" readonly>

        <div class="po-popup-buttons">
            <button onclick="closePoPopup()">Cancel</button>
            <button onclick="submitPoParty()">Submit</button>
        </div>
    </div>
</div>
<datalist id="makeSuggestions"></datalist>
<datalist id="customerSuggestions"></datalist>
    `;

   loadAdminRequirementRows();
updateRequirementSuggestions();
}

function addRequirementRow(item = null, afterRow = null) {
    markUnsavedChange();
    let table = document.getElementById("requirementTable");
    let row = table.insertRow();

    row.onclick = function () {
        selectRow(row);
    };

    let totalCells = 15;

    for (let i = 0; i < totalCells; i++) {
        row.insertCell(i);
    }

    row.cells[0].innerHTML = "";
    row.cells[1].innerHTML = item?.indentor || currentAdmin;

    row.dataset.createdBy = item?.createdBy || item?.indentor || currentAdmin;
    row.dataset.createdDate = item?.createdDate || formatDateOnly();
    row.dataset.approvedBy = item?.approvedBy || currentAdmin;
    row.dataset.approvedDate = item?.approvedDate || "";
    row.dataset.totalReceived = item?.totalReceived || 0;
    row.dataset.poDate = item?.poDate || "";
    row.dataset.poCompanyName = item?.poCompanyName || "";

    let values = [
        item?.productName || "",
        item?.make || "",
        item?.catNo || "",
        item?.qty || "",
        item?.uom || "",
        item?.customerName || "",
        item?.poNo || "",
        item?.place || "",
        item?.shop || "",
        item?.partyName || "",
      item?.received || "",
       item?.pending ?? "",
        Number(item?.totalReceived || 0) > 0 ? (item?.extraReceived ?? 0) : ""
    ];

    for (let i = 2; i <= 14; i++) {
        if (i === 2) {
            row.cells[i].innerHTML = `
                <span class="tooltip-product">
                   <input type="text" value="${values[i - 2]}" ${currentIndentor !== "" ? "readonly" : ""}
onkeydown="moveLikeExcel(event, this, 'requirementTable', 'addRequirementRow')">

                   <span class="tooltip-box">
    Created By: ${item?.createdBy || item?.indentor || currentAdmin}<br>
    Created Date: ${item?.createdDate || ""}<br>
    Approved By: ${item?.approvedBy || currentAdmin || ""}<br>
    Approved Date: ${item?.approvedDate || ""}
</span>
                </span>
            `;
        }
         else if (i === 11) {

    const fullValue = values[i - 2] || "";

    let party = fullValue;
    let date = "";

    if (fullValue.includes(",")) {
        const parts = fullValue.split(",");
        party = parts[0].trim();
        date = parts.slice(1).join(",").trim();
    }

    row.cells[i].innerHTML = `
        <input
            type="text"
            value="${fullValue}"
            readonly
            style="
                position:absolute;
                opacity:0;
                pointer-events:none;
                width:1px;
                height:1px;
            "
        >

        <div class="party-display">
            <div>${party}</div>
            ${date ? `<div>${date}</div>` : ""}
        </div>
    `;
}
        else if (i === 12) {
            row.cells[i].innerHTML = `
                <input type="text" value="${values[i - 2]}"
                oninput="calculateRequirementReceived(this)"
                onkeydown="moveLikeExcel(event, this, 'requirementTable', 'addRequirementRow')">
            `;
        } else if (i === 13 || i === 14) {
            row.cells[i].innerHTML = `
                <input type="text" value="${values[i - 2]}" readonly>
            `;
        } 
        else {
            let readonly = currentIndentor !== "" ? "readonly" : "";

           let listAttr = "";

if (currentAdmin !== "" && i === 3) {
    listAttr = `list="makeSuggestions"`;
}

if (currentAdmin !== "" && i === 7) {
    listAttr = `list="customerSuggestions"`;
}

row.cells[i].innerHTML = `
    <input type="text" value="${values[i - 2]}" ${readonly} ${listAttr}
    onkeydown="moveLikeExcel(event, this, 'requirementTable', 'addRequirementRow')">
`;
        }
    }

    if (afterRow) {
        afterRow.parentNode.insertBefore(row, afterRow.nextSibling);
    }

    updateRequirementSrNo();

    let firstInput = row.querySelector('input[type="text"]');
    if (firstInput) firstInput.focus();
}

function updateRequirementSrNo() {
    let table = document.getElementById("requirementTable");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        rows[i].cells[0].innerHTML = `
            <div class="sr-inline-box">
               <input type="checkbox"
       class="row-check"
       onchange="toggleRequirementRowHighlight(this)">
                <span>${i}</span>
            </div>
        `;
    }
}

function toggleRequirementRowHighlight(checkbox) {

    let row = checkbox.closest("tr");

    if (checkbox.checked) {
        row.classList.add("selected-requirement-row");
    } else {
        row.classList.remove("selected-requirement-row");
    }
}

function loadIndentorRequirementRows() {
    let allData = getRequirementData();
    let myData = allData.filter(item => item.indentor === currentIndentor);

    if (myData.length === 0) {
        addRequirementRow();
    } else {
        myData.forEach(item => addRequirementRow(item));
    }
}

function loadAdminRequirementRows() {
    isLoadingTable = true;

    let allData = getRequirementData();
    let requirementData = allData.filter(item => item.status === "Approved");

    if (requirementData.length === 0) {
        addRequirementRow();
    } else {
        requirementData.forEach(item => addRequirementRow(item));
    }

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function updateRequirementSuggestions() {
    let table = document.getElementById("requirementTable");
    if (!table) return;

    let makeSet = new Set();
    let customerSet = new Set();

    for (let i = 1; i < table.rows.length; i++) {
        let inputs = table.rows[i].querySelectorAll('input[type="text"]');

        let make = inputs[1]?.value.trim();
        let customer = inputs[5]?.value.trim();

        if (make) makeSet.add(make);
        if (customer) customerSet.add(customer);
    }

    let makeList = document.getElementById("makeSuggestions");
    let customerList = document.getElementById("customerSuggestions");

    if (makeList) {
        makeList.innerHTML = "";
        makeSet.forEach(value => {
            makeList.innerHTML += `<option value="${value}">`;
        });
    }

    if (customerList) {
        customerList.innerHTML = "";
        customerSet.forEach(value => {
            customerList.innerHTML += `<option value="${value}">`;
        });
    }
}

function submitRequirementStock() {
    let table = document.getElementById("requirementTable");
    let rows = table.getElementsByTagName("tr");

    let allData = getRequirementData();

    allData = allData.filter(item => item.indentor !== currentIndentor);

    for (let i = 1; i < rows.length; i++) {
        let inputs = rows[i].getElementsByTagName("input");

        allData.push({
            indentor: currentIndentor,
            productName: inputs[0].value.trim(),
            make: inputs[1].value.trim(),
            catNo: inputs[2].value.trim(),
            qty: inputs[3].value.trim(),
            uom: inputs[4].value.trim(),
            customerPoNo: inputs[5].value.trim(),
            place: inputs[6].value.trim(),
            shop: inputs[7].value.trim(),
            status: rows[i].cells[9].innerText || "Pending",
            editReceived: inputs[8].value.trim(),
            remark: ""
        });
    }

    saveRequirementData(allData);
    alert("Requirement Stock Saved Successfully!");
}

function submitAdminRequirementStock() {
    saveCurrentRequirementTableData();

    hasUnsavedChanges = false;
    alert("Requirement Stock Saved Successfully!");
    openAdminRequirementStock();
}

function saveCurrentRequirementTableData() {
    let table = document.getElementById("requirementTable");
    let rows = table.getElementsByTagName("tr");

    let allData = getRequirementData();

    let nonRequirementData = allData.filter(item =>
        item.status !== "Approved"
    );

    let updatedData = [];

    for (let i = 1; i < rows.length; i++) {
        let inputs = rows[i].querySelectorAll('input[type="text"]');

        let qty = Number(inputs[3].value.trim()) || 0;
        let receivedValue = inputs[10].value.trim();

        let oldTotalReceived = Number(rows[i].dataset.totalReceived || 0);

        let newReceived = receivedValue === ""
    ? 0
    : Number(receivedValue);

let totalReceived = oldTotalReceived + newReceived;

        let pending = qty - totalReceived;
        let extraReceived = totalReceived - qty;

        let isCompleted = totalReceived >= qty && qty > 0;

        let item = {
            indentor: rows[i].cells[1].innerText,
            productName: inputs[0].value.trim(),
            make: inputs[1].value.trim(),
            catNo: inputs[2].value.trim(),
            qty: inputs[3].value.trim(),
            uom: inputs[4].value.trim(),
            customerName: inputs[5].value.trim(),
            poNo: inputs[6].value.trim(),
            place: inputs[7].value.trim(),
            shop: inputs[8].value.trim(),

           partyName: inputs[9].value.trim(),
poDate: rows[i].dataset.poDate || "",
poCompanyName: rows[i].dataset.poCompanyName || "",

            totalReceived: totalReceived,

           received: isCompleted ? totalReceived : "",

            pending: receivedValue !== "" || oldTotalReceived > 0
    ? (isCompleted ? 0 : pending)
    : "",

            extraReceived: totalReceived > 0
                ? (extraReceived > 0 ? extraReceived : 0)
                : "",

            status: isCompleted ? "Received" : "Approved",

            remark: "",
            editReceived: "",

            createdBy: rows[i].dataset.createdBy || rows[i].cells[1].innerText,
            createdDate: rows[i].dataset.createdDate || "",
            approvedBy: rows[i].dataset.approvedBy || currentAdmin,
            approvedDate: rows[i].dataset.approvedDate || "",
            receivedDate: isCompleted ? formatDateOnly() : ""
        };

        if (item.productName !== "") {
            updatedData.push(item);
        }
    }

    let finalData = nonRequirementData.concat(updatedData);
    saveRequirementData(finalData);
}

function openPoPopup() {
    let checkedRows = document.querySelectorAll("#requirementTable .row-check:checked");

    if (checkedRows.length === 0) {
        alert("Please select at least one row.");
        return;
    }

    document.getElementById("poPartyName").value = "";
    document.getElementById("poDate").value = formatDateOnly();

    let partyList = document.getElementById("partySuggestions");
    partyList.innerHTML = "";

    partyData.forEach(party => {
        partyList.innerHTML += `<option value="${party.name}">`;
    });

    document.getElementById("poItemText").innerText =
        `Send PO of ${checkedRows.length} item${checkedRows.length > 1 ? "s" : ""} to`;

    document.getElementById("poPopupOverlay").style.display = "flex";
    document.getElementById("poPartyName").focus();
}

function closePoPopup() {
    document.getElementById("poPopupOverlay").style.display = "none";
}

function submitPoParty() {
    let companyName = document.getElementById("poCompanyName").value.trim();
    let partyName = document.getElementById("poPartyName").value.trim();
    let poDate = document.getElementById("poDate").value.trim();

    if (partyName === "") {
        alert("Please enter party name.");
        return;
    }

    let checkedRows = document.querySelectorAll("#requirementTable .row-check:checked");

    if (checkedRows.length === 0) {
        alert("Please select at least one row.");
        return;
    }

    let selectedRows = [];

    checkedRows.forEach(check => {
        let row = check.closest("tr");

      const fullValue = `${partyName}, ${formatShortPoDate(poDate)}`;

const input = row.cells[11].querySelector("input");
input.value = fullValue;

const display = row.cells[11].querySelector(".party-display");

if (display) {

    let party = fullValue;
    let date = "";

    if (fullValue.includes(",")) {
        const parts = fullValue.split(",");
        party = parts[0].trim();
        date = parts.slice(1).join(",").trim();
    }

    display.innerHTML = `
        <div>${party}</div>
        ${date ? `<div>${date}</div>` : ""}
    `;
}
        row.dataset.poDate = poDate;
        row.dataset.poCompanyName = companyName;

        selectedRows.push(row);
    });

    saveCurrentRequirementTableData();

    exportPoExcel(companyName, partyName, poDate, selectedRows);

   checkedRows.forEach(check => {

    check.checked = false;

    let row = check.closest("tr");

    row.classList.remove("selected-requirement-row");
});

    closePoPopup();
    alert("Party Name updated and PO Excel downloaded successfully!");
}

async function exportPoExcel(companyName, partyName, poDate, selectedRows) {
    const isSamyak = companyName === "SAMYAK ENTERPRISES";

    const templatePath = isSamyak
        ? "templates/SE PO Format.xlsx"
        : "templates/SV PO Format.xlsx";

    const fileNamePrefix = isSamyak ? "SE_PO" : "SV_PO";

    const response = await fetch(templatePath);
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];

    const refText = isSamyak
        ? "Ref. No SE/26-27/1"
        : "Ref. No SVS/26-27/1";

    worksheet.getCell("A8").value =
        `${refText}                                                                                                                                                                                                                Dated ${formatShortPoDate(poDate)}`;

    let selectedParty = partyData.find(party => party.name === partyName);

worksheet.getCell("B11").value = partyName;

if (selectedParty) {
    worksheet.getCell("B12").value = selectedParty.address[0] || "";
    worksheet.getCell("B13").value = selectedParty.address[1] || "";
    worksheet.getCell("B14").value = selectedParty.address[2] || "";
} else {
    worksheet.getCell("B12").value = "";
    worksheet.getCell("B13").value = "";
    worksheet.getCell("B14").value = "";
}

    const startRow = 47;
    const templateRows = 5;
    const totalItems = selectedRows.length;
    const extraRows = totalItems > templateRows ? totalItems - templateRows : 0;

    function clone(obj) {
        return obj ? JSON.parse(JSON.stringify(obj)) : obj;
    }

    function copyRowFormat(fromRow, toRow) {
        worksheet.getRow(toRow).height = worksheet.getRow(fromRow).height;

        for (let c = 1; c <= 10; c++) {
            let sourceCell = worksheet.getCell(fromRow, c);
            let targetCell = worksheet.getCell(toRow, c);

            targetCell.style = clone(sourceCell.style);
            targetCell.border = clone(sourceCell.border);
            targetCell.alignment = clone(sourceCell.alignment);
            targetCell.font = clone(sourceCell.font);
            targetCell.numFmt = sourceCell.numFmt;
            targetCell.fill = clone(sourceCell.fill);
            targetCell.value = "";
        }
    }

    function shiftImagesDown(fromRow, rowsToShift) {
        if (!worksheet._media || rowsToShift <= 0) return;

        worksheet._media.forEach(media => {
            if (!media.range) return;

            let range = media.range;

            if (range.tl && typeof range.tl.nativeRow === "number" && range.tl.nativeRow + 1 >= fromRow) {
                range.tl.nativeRow += rowsToShift;
            }

            if (range.br && typeof range.br.nativeRow === "number" && range.br.nativeRow + 1 >= fromRow) {
                range.br.nativeRow += rowsToShift;
            }
        });
    }

    if (extraRows > 0) {
        const insertAtRow = startRow + templateRows;

        for (let i = 0; i < extraRows; i++) {
            worksheet.insertRow(insertAtRow, []);
        }

        shiftImagesDown(insertAtRow, extraRows);
    }

    const rowsToPrepare = Math.max(totalItems, templateRows);

    for (let r = startRow; r < startRow + rowsToPrepare; r++) {
        copyRowFormat(startRow, r);
    }

    selectedRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input[type="text"]');
        const excelRow = startRow + index;

        worksheet.getCell(`A${excelRow}`).value = index + 1;
        worksheet.getCell(`B${excelRow}`).value = inputs[0]?.value.trim() || "";
        worksheet.getCell(`C${excelRow}`).value = inputs[2]?.value.trim() || "";
       let originalQty = inputs[3]?.value.trim() || "";
let pendingQty = inputs[11]?.value.trim() || "";

worksheet.getCell(`D${excelRow}`).value =
    (pendingQty !== "" && Number(pendingQty) > 0)
        ? pendingQty
        : originalQty;
        worksheet.getCell(`E${excelRow}`).value = inputs[4]?.value.trim() || "";

        worksheet.getCell(`F${excelRow}`).value = "";
        worksheet.getCell(`G${excelRow}`).value = "";
        worksheet.getCell(`H${excelRow}`).value = "";
        worksheet.getCell(`I${excelRow}`).value = "";
        worksheet.getCell(`J${excelRow}`).value = "";
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const safePartyName = partyName.replace(/[\\/:*?"<>|]/g, "");
    const downloadName = `${fileNamePrefix}_${safePartyName}_${formatShortPoDate(poDate)}.xlsx`;

    saveAs(new Blob([buffer]), downloadName);
}


function deleteSelectedRequirementRows() {
    let checkedRows = document.querySelectorAll("#requirementTable .row-check:checked");

    if (checkedRows.length === 0) {
        alert("Please select at least one row.");
        return;
    }

    checkedRows.forEach(check => {
        check.closest("tr").remove();
    });
   hasUnsavedChanges = true;
    updateRequirementSrNo();
    saveCurrentRequirementTableData();
}




function openApprovedStock() {
    openStatusTable("Received");
}

function openRejectedStock() {
    openStatusTable("Rejected");
}

function openStatusTable(statusType) {
   let activeTab;

if (statusType === "Received") {
    activeTab = currentIndentor !== "" ? "received" : "approved";
} else {
    activeTab = currentIndentor !== "" ? "indentorRejected" : "rejected";
}
    let tableTitle = statusType === "Received" ? "Received List" : "Rejected List";

    document.body.innerHTML = tabs(activeTab) + `
    <div class="container">
        <div class="login-box" style="width:98vw">
            <h2>${tableTitle}</h2>
         
            <div class="search-row">
    <div class="search-box">
        <span>🔍</span>
        <input id="statusSearch" type="text"
        placeholder="Search Anything..."
oninput="searchProductInTable('statusSearch','statusTable','statusNoResult')">
    </div>

    <button class="clear-btn"
    onclick="clearProductSearch('statusSearch','statusTable','statusNoResult')">
        Clear
    </button>
</div>

<p id="statusNoResult" class="no-result">
    No matching product found.
</p>
            <table border="1" width="100%" id="statusTable">
                <tr>
                    <th>Sr No</th>
                    <th>Added By</th>
                   <th>
    Product Name
    <span class="sort-box">
        <button class="sort-icon">▼</button>
        <span class="sort-menu">
            <button onclick="sortTableByColumn(this.closest('table').id, 2, 'az')">A → Z</button>
            <button onclick="sortTableByColumn(this.closest('table').id, 2, 'za')">Z → A</button>
        </span>
    </span>
</th>
                    <th>Make <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 3, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 3, 'za')">Z → A</button></span></span></th>
                    <th>Cat No <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 4, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 4, 'za')">Z → A</button></span></span></th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Customer Name <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 7, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 7, 'za')">Z → A</button></span></span></th>
                    <th>PO No</th>
                    <th>Place <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 9, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 9, 'za')">Z → A</button></span></span></th>
                    <th>Shop <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 10, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 10, 'za')">Z → A</button></span></span></th>
                    <th>Received</th>
                    <th>Extra Received</th>
                    <th>Remark</th>
                </tr>
                      </table>

            ${currentAdmin !== "" ? `
                <br>
                <button class="delete-btn" onclick="deleteSelectedStatusRows('${statusType}')">
    Delete 
</button>
            ` : ""}

        </div>
    </div>
    `;

    loadStatusRows(statusType);
}

function loadStatusRows(statusType) {
    let table = document.getElementById("statusTable");
    let allData = getRequirementData();

    let sr = 1;

    allData.forEach((item, originalIndex) => {
        if (item.status !== statusType) return;

        let row = table.insertRow();
        row.dataset.originalIndex = originalIndex;

        let productCell = "";

        if (statusType === "Received") {
            productCell = `
                <td>
                    <span class="tooltip-product">
                        ${item.productName || ""}
                        <span class="tooltip-box">
                            Created By: ${item.createdBy || item.indentor || ""}<br>
                            Created Date: ${item.createdDate || ""}<br>
                            Approved By: ${item.approvedBy || ""}<br>
                            Approved Date: ${item.approvedDate || ""}<br>
                            Received Date: ${item.receivedDate || ""}
                        </span>
                    </span>
                </td>
            `;
        } else {
            productCell = `<td>${item.productName || ""}</td>`;
        }

        let srCell = currentAdmin !== "" ? `
            <td>
                <div class="sr-inline-box">
                    <input type="checkbox"
                    class="row-check status-row-check"
                    onchange="toggleStatusRowHighlight(this)">
                    <span>${sr}</span>
                </div>
            </td>
        ` : `<td>${sr}</td>`;

        row.innerHTML = `
            ${srCell}
            <td>${item.createdBy || item.indentor || ""}</td>
            ${productCell}
            <td>${item.make || ""}</td>
            <td>${item.catNo || ""}</td>
            <td>${item.qty || ""}</td>
            <td>${item.uom || ""}</td>
            <td>${item.customerName || ""}</td>
            <td>${item.poNo || ""}</td>
            <td>${item.place || ""}</td>
            <td>${item.shop || ""}</td>
            <td>${item.received || ""}</td>
            <td>${item.extraReceived || ""}</td>
            <td>${item.remark || ""}</td>
        `;

        sr++;
    });
}

function toggleStatusRowHighlight(checkbox) {
    let row = checkbox.closest("tr");

    if (checkbox.checked) {
        row.classList.add("selected-requirement-row");
    } else {
        row.classList.remove("selected-requirement-row");
    }
}

function deleteSelectedStatusRows(statusType) {
    let checkedRows = document.querySelectorAll("#statusTable .status-row-check:checked");

    if (checkedRows.length === 0) {
        alert("Please select at least one row.");
        return;
    }

    let confirmDelete = confirm("Are you sure you want to delete selected records permanently?");

    if (!confirmDelete) {
        return;
    }

    let deleteIndexes = [];

    checkedRows.forEach(check => {
        let row = check.closest("tr");
        deleteIndexes.push(Number(row.dataset.originalIndex));
    });

    let allData = getRequirementData();

    let finalData = allData.filter((item, index) => {
        return !deleteIndexes.includes(index);
    });

    saveRequirementData(finalData);

    alert("Selected records deleted permanently.");

    openStatusTable(statusType);
}

function openIndentorReceivedStock() {
    document.body.innerHTML = tabs("received") + `
    <div class="container">
        <div class="login-box" style="width:98vw">
            <h2>Received Stock Table</h2>

            <table border="1" width="100%" id="receivedTable">
                <tr>
                    <th>Sr No</th>
                    <th>Added By</th>
                    <th>Product Name</th>
                    <th>Make</th>
                    <th>Cat No</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Customer Name</th>
                    <th>PO No</th>
                    <th>Place</th>
                    <th>Shop</th>
                    <th>Received</th>
                    <th>Extra Received</th>
                </tr>
            </table>
        </div>
    </div>
    `;

    loadIndentorReceivedRows();
}
function loadIndentorReceivedRows() {
    let table = document.getElementById("receivedTable");

    let data = getRequirementData().filter(
        item => item.status === "Received"
    );

    data.forEach((item, index) => {
        let row = table.insertRow();

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.createdBy || item.indentor || ""}</td>
            <td>${item.productName || ""}</td>
            <td>${item.make || ""}</td>
            <td>${item.catNo || ""}</td>
            <td>${item.qty || ""}</td>
            <td>${item.uom || ""}</td>
            <td>${item.customerName || ""}</td>
            <td>${item.poNo || ""}</td>
            <td>${item.place || ""}</td>
            <td>${item.shop || ""}</td>
            <td>${item.received || ""}</td>
            <td>${item.extraReceived || 0}</td>
        `;
    });
}


function saveReceivedStock() {
    let table = document.getElementById("receivedTable");
    let rows = table.getElementsByTagName("tr");
    let allData = getRequirementData();

    for (let i = 1; i < rows.length; i++) {
        let dataIndex = rows[i].dataset.index;
        let inputs = rows[i].getElementsByTagName("input");

        allData[dataIndex].received = inputs[0].value.trim();
        allData[dataIndex].extraReceived = inputs[1].value.trim();
        allData[dataIndex].receivedDate = new Date().toLocaleString();
    }

    saveRequirementData(allData);
    alert("Received Stock Saved Successfully!");
    openIndentorReceivedStock();
}

function openIndentorRejectedStock() {
    document.body.innerHTML = tabs("indentorRejected") + `
    <div class="container">
        <div class="login-box" style="width:98vw">
            <h2>${currentIndentor} Rejected Stock Table</h2>

            <table border="1" width="100%" id="indentorRejectedTable">
                <tr>
                    <th>Sr No</th>
<th>Added By</th>
<th>Product Name</th>
                    <th>Make</th>
                    <th>Cat No</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Costumer PO No</th>
                    <th>Place</th>
                    <th>Shop</th>
                    <th>Rejected</th>
                    <th>Remark</th>
                </tr>
            </table>

            <br>

        </div>
    </div>
    `;

    loadIndentorRejectedRows();
}

function loadIndentorRejectedRows() {
    let table = document.getElementById("indentorRejectedTable");
    let allData = getRequirementData();

    let rejectedData = allData.filter(item => item.status === "Rejected");

    rejectedData.forEach((item, index) => {
        let row = table.insertRow();

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.indentor || ""}</td>
            <td>${item.productName || ""}</td>
            <td>${item.make || ""}</td>
            <td>${item.catNo || ""}</td>
            <td>${item.qty || ""}</td>
            <td>${item.uom || ""}</td>
            <td>${item.customerPoNo || ""}</td>
            <td>${item.place || ""}</td>
            <td>${item.shop || ""}</td>
            <td>Rejected</td>
            <td>${item.remark || ""}</td>
        `;
    });
} 

function openUnapprovedList() {
    document.body.innerHTML = tabs("unapproved") + `
    <div class="container">
        <div class="login-box" style="width:98vw">
            <h2>Unapproved List</h2>
            <div class="search-row">
    <div class="search-box">
        <span>🔍</span>
        <input id="unapprovedSearch" type="text"
       placeholder="Search Anything..."
oninput="searchProductInTable('unapprovedSearch','unapprovedTable','unapprovedNoResult')">
    </div>

    <button class="clear-btn"
    onclick="clearProductSearch('unapprovedSearch','unapprovedTable','unapprovedNoResult')">
        Clear
    </button>
</div>

<p id="unapprovedNoResult" class="no-result">
    No matching product found.
</p>

            <table border="1" width="100%" id="unapprovedTable">
                <tr>
                    <th>Sr No</th>
                    <th>Indentor</th>
                    <th>
    Product Name
    <span class="sort-box">
        <button class="sort-icon">▼</button>
        <span class="sort-menu">
            <button onclick="sortTableByColumn(this.closest('table').id, 2, 'az')">A → Z</button>
            <button onclick="sortTableByColumn(this.closest('table').id, 2, 'za')">Z → A</button>
        </span>
    </span>
</th>
                    <th>Make <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 3, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 3, 'za')">Z → A</button></span></span></th>
                    <th>Cat No <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 4, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 4, 'za')">Z → A</button></span></span></th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Customer Name <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 7, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 7, 'za')">Z → A</button></span></span></th>
                    <th>PO No</th>
                    <th>Place <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 9, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 9, 'za')">Z → A</button></span></span></th>
                   <th>Shop <span class="sort-box"><button class="sort-icon">▼</button><span class="sort-menu"><button onclick="sortTableByColumn(this.closest('table').id, 10, 'az')">A → Z</button><button onclick="sortTableByColumn(this.closest('table').id, 10, 'za')">Z → A</button></span></span></th>
                    <th>Approve / Reject</th>
                    <th>Remark</th>
                </tr>
            </table>

            <br>
            <button class="table-btn" onclick="addUnapprovedRow()">Add</button>
            <button class="table-btn" onclick="deleteSelectedRow('unapproved')">Delete</button>
            <button class="submit-btn" onclick="submitUnapprovedList()">Submit</button>
        </div>
    </div>
    `;

    loadUnapprovedList();
}
function addUnapprovedRow(item = null, originalIndex = "") {
   markUnsavedChange();
    let table = document.getElementById("unapprovedTable");
    let row = table.insertRow();

    row.dataset.originalIndex = originalIndex;
    row.dataset.createdBy = item?.createdBy || item?.indentor || "";
    row.dataset.createdDate = item?.createdDate || "";

    for (let i = 0; i < 13; i++) {
        row.insertCell(i);
    }

    row.onclick = function () {
        selectRow(row);
    };

    let rowId = Date.now() + Math.random();

    let addedBy = item?.indentor || (currentIndentor !== "" ? currentIndentor : currentAdmin);
    let createdBy = item?.createdBy || addedBy;

    row.cells[0].innerHTML = "";
    row.cells[1].innerHTML = addedBy;

    let canEditRow = currentAdmin !== "" || createdBy === currentIndentor;

    let values = [
        item?.productName || "",
        item?.make || "",
        item?.catNo || "",
        item?.qty || "",
        item?.uom || "",
        item?.customerName || "",
        item?.poNo || "",
        item?.place || "",
        item?.shop || ""
    ];

    for (let i = 2; i <= 10; i++) {
        let readonly = canEditRow ? "" : "readonly";

        row.cells[i].innerHTML = `
            <input type="text" value="${values[i - 2]}" ${readonly}
            onkeydown="moveLikeExcel(event, this, 'unapprovedTable', 'addUnapprovedRow')">
        `;
    }

    if (currentAdmin !== "") {
        row.cells[11].innerHTML = `
            <div class="status-radio-box">
               <input type="radio" class="approve-radio" name="unapproved_${rowId}" value="Approved"
onclick="toggleApproval(this,'approve')">

<input type="radio" class="reject-radio" name="unapproved_${rowId}" value="Rejected"
onclick="toggleApproval(this,'reject')">
            </div>
        `;

        row.cells[12].innerHTML = `
            <input type="text" value="${item?.remark || ""}" placeholder="Remark"
            onkeydown="moveLikeExcel(event, this, 'unapprovedTable', 'addUnapprovedRow')">
        `;
    } else {
        row.cells[11].innerHTML = item?.status || "Pending";
        row.cells[12].innerHTML = item?.remark || "";
    }

    updateUnapprovedSrNo();
}

function loadUnapprovedList() {
    isLoadingTable = true;

    let allData = getRequirementData();

    allData.forEach((item, index) => {
        if (item.status === "Pending") {
            addUnapprovedRow(item, index);
        }
    });

    isLoadingTable = false;
    hasUnsavedChanges = false;
}

function calculateExtraReceived(receivedInput) {
    let row = receivedInput.closest("tr");

    let qty = Number(row.cells[5].innerText) || 0;
    let receivedValue = receivedInput.value.trim();

    let extraInput = row.cells[11].querySelector("input");

    if (receivedValue === "") {
        extraInput.value = "";
        return;
    }

    let received = Number(receivedValue);
    let extra = received - qty;

    extraInput.value = extra > 0 ? extra : 0;
}
function submitUnapprovedList() {
    let table = document.getElementById("unapprovedTable");
    let rows = table.getElementsByTagName("tr");
    let allData = getRequirementData();

    let pendingData = allData.filter(item => item.status === "Pending");
    let oldNonPendingData = allData.filter(item => item.status !== "Pending");

    let updatedPendingData = [];

    for (let i = 1; i < rows.length; i++) {
        let inputs = rows[i].querySelectorAll('input[type="text"]');
        let checkedStatus = rows[i].querySelector('input[type="radio"]:checked');

        let oldIndex = Number(rows[i].dataset.originalIndex);
        let oldItem = allData[oldIndex] || {};

        let item = {
            ...oldItem,

            indentor: rows[i].cells[1].innerText,
            productName: inputs[0]?.value.trim() || "",
            make: inputs[1]?.value.trim() || "",
            catNo: inputs[2]?.value.trim() || "",
            qty: inputs[3]?.value.trim() || "",
            uom: inputs[4]?.value.trim() || "",
            customerName: inputs[5]?.value.trim() || "",
            poNo: inputs[6]?.value.trim() || "",
            place: inputs[7]?.value.trim() || "",
            shop: inputs[8]?.value.trim() || "",

            received: oldItem.received || "",
            status: checkedStatus ? checkedStatus.value : "Pending",
            remark: currentAdmin !== "" ? (inputs[9]?.value.trim() || "") : (oldItem.remark || ""),
            editReceived: oldItem.editReceived || "",

            createdBy: oldItem.createdBy || rows[i].dataset.createdBy || rows[i].cells[1].innerText,
            createdDate: oldItem.createdDate || rows[i].dataset.createdDate || formatDateOnly(),

            approvedBy: checkedStatus ? currentAdmin : (oldItem.approvedBy || ""),
            approvedDate: checkedStatus ? formatDateOnly() : (oldItem.approvedDate || "")
        };

        if (item.productName !== "") {
            updatedPendingData.push(item);
        }
    }

    let finalData = oldNonPendingData.concat(updatedPendingData);

    saveRequirementData(finalData);
    hasUnsavedChanges = false;
    alert("Unapproved List Saved Successfully!");
    openUnapprovedList();
}

function updateUnapprovedSrNo() {
    let table = document.getElementById("unapprovedTable");
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        rows[i].cells[0].innerHTML = i;
    }
}

function calculateRequirementReceived(receivedInput) {
    let row = receivedInput.closest("tr");

    let qty = Number(row.cells[5].querySelector("input").value.trim()) || 0;

    let oldTotalReceived = Number(row.dataset.totalReceived || 0);
    let newReceived = Number(receivedInput.value.trim()) || 0;

    let totalReceived = oldTotalReceived + newReceived;

    let pendingInput = row.cells[13].querySelector("input");
    let extraInput = row.cells[14].querySelector("input");

    if (receivedInput.value.trim() === "") {
        pendingInput.value = oldTotalReceived > 0 ? Math.max(qty - oldTotalReceived, 0) : "";
        extraInput.value = oldTotalReceived > qty ? oldTotalReceived - qty : "";
        return;
    }

    let pending = qty - totalReceived;
    let extra = totalReceived - qty;

    pendingInput.value = pending > 0 ? pending : 0;
    
    extraInput.value = extra > 0 ? extra : 0;
}

function searchProductInTable(inputId, tableId, noResultId) {
    let searchValue = document.getElementById(inputId).value.toLowerCase().trim();
    let table = document.getElementById(tableId);
    let rows = table.getElementsByTagName("tr");
    let found = false;

    for (let i = 1; i < rows.length; i++) {
        let rowText = "";

        for (let j = 0; j < rows[i].cells.length; j++) {
            let cell = rows[i].cells[j];
            let input = cell.querySelector("input");

            rowText += " " + (input ? input.value : cell.innerText);
        }

        rowText = rowText.toLowerCase();

        if (searchValue === "" || rowText.includes(searchValue)) {
            rows[i].style.display = "";
            if (searchValue !== "") found = true;
        } else {
            rows[i].style.display = "none";
        }
    }

    document.getElementById(noResultId).style.display =
        searchValue !== "" && !found ? "block" : "none";
}

function clearProductSearch(inputId, tableId, noResultId) {
    document.getElementById(inputId).value = "";

    let table = document.getElementById(tableId);
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = "";
    }

    document.getElementById(noResultId).style.display = "none";
}

function getCellValueForSort(row, cellIndex) {
    let cell = row.cells[cellIndex];
    if (!cell) return "";

    let input = cell.querySelector("input");
    return input ? input.value.trim() : cell.innerText.trim();
}

function sortTableByColumn(tableId, cellIndex, direction) {
    let table = document.getElementById(tableId);
    let rows = Array.from(table.rows).slice(1);

    rows.sort((a, b) => {
        let valueA = getCellValueForSort(a, cellIndex);
        let valueB = getCellValueForSort(b, cellIndex);

        if (direction === "az") {
            return valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: "base" });
        } else {
            return valueB.localeCompare(valueA, undefined, { numeric: true, sensitivity: "base" });
        }
    });

    rows.forEach(row => table.appendChild(row));

    if (tableId === "requirementTable") {
    updateRequirementSrNo();
} else {
    for (let i = 1; i < table.rows.length; i++) {
        table.rows[i].cells[0].innerText = i;
    }
}
}

function exportRequirementToExcel() {
    let table = document.getElementById("requirementTable");

    if (!table) {
        alert("Requirement table not found!");
        return;
    }

    let exportData = [];

   exportData.push([
    "Sr No",
    "Product Name",
    "Make",
    "Cat No",
    "Qty",
    "UOM",
    "Customer Name",
    "PO No",
    "Place",
    "Shop",
    "Party Name",
    "Received",
    "Pending",
    "Extra Received"
]);

  let exportIndexes = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];

        if (row.style.display === "none") continue;

        let rowData = [];

        exportIndexes.forEach(index => {
    let cell = row.cells[index];

    if (!cell) {
        rowData.push("");
        return;
    }

    // Sr No column
    if (index === 0) {
        let srNo = cell.querySelector("span");
        rowData.push(srNo ? srNo.innerText.trim() : "");
        return;
    }

    let input = cell.querySelector("input[type='text']");

    rowData.push(
        input ? input.value.trim() : cell.innerText.trim()
    );
});

        exportData.push(rowData);
    }

    let worksheet = XLSX.utils.aoa_to_sheet(exportData);
    let workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Requirement List");

    XLSX.writeFile(workbook, "Requirement_List.xlsx");
}

document.addEventListener("input", function (e) {

    if (
        e.target.closest("#stockTable") ||
        e.target.closest("#unapprovedTable") ||
        e.target.closest("#requirementTable")
    ) {
       markUnsavedChange();
    }

    if (
        e.target.closest("#requirementTable") &&
        currentAdmin !== ""
    ) {
        updateRequirementSuggestions();
    }
});

function toggleApproval(radio, type) {

    let row = radio.closest("tr");

    if (radio.dataset.wasChecked === "true") {

        radio.checked = false;
        radio.dataset.wasChecked = "false";

        row.style.backgroundColor = "";
        return;
    }

    let approve = row.querySelector(".approve-radio");
    let reject = row.querySelector(".reject-radio");

    approve.dataset.wasChecked = "false";
    reject.dataset.wasChecked = "false";

    radio.checked = true;
    radio.dataset.wasChecked = "true";

    if (type === "approve") {
        row.style.backgroundColor = "#d4edda";
    } else {
        row.style.backgroundColor = "#f8d7da";
    }
}

function formatDispatchDate(input) {

   let pageTitle = document.querySelector(".login-box h2").innerText;

// Apply in Unpaid Docket and Delivered
if (
    pageTitle !== "Unpaid Docket" &&
    pageTitle !== "Delivered"
) return;

    // Apply only to Dated column (12th input)
   let row = input.closest("tr");
let inputs = row.querySelectorAll("input");

if (
    pageTitle === "Unpaid Docket" &&
    input !== inputs[11]
) return;

if (
    pageTitle === "Delivered" &&
    input !== inputs[9]
) return;

    let value = input.value.trim();

    if (value === "") return;

    let today = new Date();

    let currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    let currentYear = today.getFullYear();

    let parts = value.split(".");

    // User typed only day (e.g. 6 or 12)
    if (parts.length === 1) {

        let day = parts[0];

        input.value = `${day}.${currentMonth}.${currentYear}`;

    }

    // User typed day.month (e.g. 6.8)
    else if (parts.length === 2) {

        let day = parts[0];
        let month = parts[1];

        if (month.length === 1) {
            month = "0" + month;
        }

        input.value = `${day}.${month}.${currentYear}`;

    }

    // User typed full date (e.g. 6.8.2027)
    else if (parts.length === 3) {

        input.value = value;

    }

}