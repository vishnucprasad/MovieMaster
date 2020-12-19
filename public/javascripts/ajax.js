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

const searchProducts = (event, searchQuery) => {
    $.ajax({
        url: '/search',
        data: {
            searchQuery
        },
        method: 'post',
        success: (response) => {
            console.log(response);
            if (searchQuery.length != 0) {
                let results = `<a href="/search-movie?searchQuery=${searchQuery}" class="results-item text-dark"><div class="row pill_shadow p-3 mx-2 rounded results-pill text-truncate">${searchQuery}</div></a>`
                if (response[0]) {
                    response.forEach(movie => {
                        results += `<a href="/view-movie?movieId=${movie._id}" class="results-item text-dark"><div class="row pill_shadow p-3 mx-2 rounded results-pill"><div class="col-2"><img src="/images/movies/posters/${movie._id}.jpg" class="img-fluid"></div><div class="col-10 text-truncate">${movie.movieTitle}</div></div></a>`
                    });
                }
                document.getElementById('results-container').removeAttribute('hidden');
                document.getElementById('results-container').innerHTML = results;
            } else {
                document.getElementById('results-container').setAttribute('hidden', true);
            }
        }
    });
}

$('#search-box').submit((e) => {
    e.preventDefault();
    const searchQuery = document.getElementById('searchQuery').value;
    if (searchQuery.length != 0) {
        location.href = `/search-movie?searchQuery=${searchQuery}`;
    }
});