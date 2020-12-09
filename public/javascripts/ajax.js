const logout = (e, url) => {
    e.preventDefault();

    Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger rounded-pill px-5 m-3',
            cancelButton: 'btn btn-success rounded-pill px-5 m-3'
        },
        buttonsStyling: false
    }).fire({
        text: "Are you sure you want to logout ?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url,
                method: 'get',
                success: (response) => {
                    if (response.status) {
                        location.reload();
                    }
                }
            });
        }
    });
}

const deleteItem = (e, id, url) => {
    e.preventDefault();
    $.ajax({
        url,
        method: 'post',
        data: {
            id
        },
        success: (response) => {
            if (response.status) {
                $(`#${id}`).remove();
                $(`#deleteModal${id}`).modal('hide');
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $(`#deleteModal${id}`).modal('hide');
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        },
        error: (err) => {
            $(`#deleteModal${id}`).modal('hide');
            $('#errorAlertBody').html("Can't connect to the server.");
            $('#errorAlert').removeAttr('hidden');
            setTimeout(() => {
                $('#errorAlert').slideUp();
            }, 5000);
        }
    });
}

const deleteShow = (e, screenId, showId) => {
    e.preventDefault();
    $.ajax({
        url: '/theatre/delete-show',
        method: 'post',
        data: {
            screenId,
            showId
        },
        success: (response) => {
            if (response.status) {
                $(`#${showId}`).remove();
                $(`#deleteModal${showId}`).modal('hide');
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $(`#deleteModal${showId}`).modal('hide');
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        },
        error: (err) => {
            $(`#deleteModal${showId}`).modal('hide');
            $('#errorAlertBody').html("Can't connect to the server.");
            $('#errorAlert').removeAttr('hidden');
            setTimeout(() => {
                $('#errorAlert').slideUp();
            }, 5000);
        }
    });
}