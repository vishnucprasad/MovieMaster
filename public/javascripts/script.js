$(document).ready(function () {
    $('#data-table').DataTable();
});

const loadImage = (e) => {
    document.getElementById('viewImage').src = URL.createObjectURL(e.target.files[0]);
}

const editAdminDetails = (e) => {
    e.preventDefault();
    document.getElementById('name').removeAttribute('readonly');
    document.getElementById('email').removeAttribute('readonly');
    document.getElementById('save').removeAttribute('hidden');
    document.getElementById('cancel').removeAttribute('hidden');
    document.getElementById('edit').setAttribute('hidden', 'true');
}

const cancelEditAdminDetails = (e) => {
    e.preventDefault();
    document.getElementById('name').setAttribute('readonly', 'true');
    document.getElementById('email').setAttribute('readonly', 'true');
    document.getElementById('save').setAttribute('hidden', 'true');
    document.getElementById('cancel').setAttribute('hidden', 'true');
    document.getElementById('edit').removeAttribute('hidden');
}

const editTheatreDetails = (e) => {
    e.preventDefault();
    document.getElementById('ownerName').removeAttribute('readonly');
    document.getElementById('theatreName').removeAttribute('readonly');
    document.getElementById('email').removeAttribute('readonly');
    document.getElementById('phoneNumber').removeAttribute('readonly');
    document.getElementById('save').removeAttribute('hidden');
    document.getElementById('cancel').removeAttribute('hidden');
    document.getElementById('edit').setAttribute('hidden', 'true');
}

const cancelEditTheatreDetails = (e) => {
    e.preventDefault();
    document.getElementById('ownerName').setAttribute('readonly', 'true');
    document.getElementById('theatreName').setAttribute('readonly', 'true');
    document.getElementById('email').setAttribute('readonly', 'true');
    document.getElementById('phoneNumber').setAttribute('readonly', 'true');
    document.getElementById('save').setAttribute('hidden', 'true');
    document.getElementById('cancel').setAttribute('hidden', 'true');
    document.getElementById('edit').removeAttribute('hidden');
}