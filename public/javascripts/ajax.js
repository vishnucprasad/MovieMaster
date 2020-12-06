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

const deleteOwner = (e, ownerId) => {
    e.preventDefault();
    $.ajax({
        url: '/admin/delete-owner',
        method: 'post',
        data: {
            ownerId
        },
        success: (response) => {
            if (response.status) {
                $(`#${ownerId}`).remove();
                $(`#deleteModal${ownerId}`).modal('hide');
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $(`#deleteModal${ownerId}`).modal('hide');
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        },
        error: (err) => {
            $(`#deleteModal${ownerId}`).modal('hide');
            $('#errorAlertBody').html("Can't connect to the server.");
            $('#errorAlert').removeAttr('hidden');
            setTimeout(() => {
                $('#errorAlert').slideUp();
            }, 5000);
        }
    });
}