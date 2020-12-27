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

const checkoutRazorpay = (e, screenId, showId, numberOfSeats, seats, totalAmount) => {
    e.preventDefault();
    swal.fire({
        title: 'Processing...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
            swal.showLoading();
        }
    });
    $.ajax({
        url: '/checkoutRazorpay',
        method: 'post',
        data: {
            screenId,
            showId,
            numberOfSeats,
            seats,
            totalAmount
        },
        success: (response) => {
            swal.close();
            console.log(response);
            if (response.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Please try again.'
                })
            } else {
                razorpayPayment(response);
            }
        }
    });
}

const razorpayPayment = (order) => {
    var options = {
        "key": "rzp_test_fsFqCPdvUxG9MI", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "MovieMaster",
        "description": "Secure Payments",
        "image": "/favicon.ico",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order);
        },
        "prefill": {
            "name": "Vishnu C Prasad",
            "email": "vishnucprasad@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "EasyCart PVT.Ltd"
        },
        "theme": {
            "color": "#007bff"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

const verifyPayment = (payment, order) => {
    swal.fire({
        title: 'Processing...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
            swal.showLoading();
        }
    });
    $.ajax({
        url: '/verify-razorpay-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            swal.close();
            if (response.status) {
                console.log(order.receipt);
                location.href = `/view-order?orderId=${order.receipt}`
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.errMessage
                })
            }
        }
    });
}

const checkoutPaypal = (e, screenId, showId, numberOfSeats, seats, totalAmount) => {
    e.preventDefault();
    swal.fire({
        title: 'Processing...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
            swal.showLoading();
        }
    });
    $.ajax({
        url: '/checkoutPaypal',
        method: 'post',
        data: {
            screenId,
            showId,
            numberOfSeats,
            seats,
            totalAmount
        },
        success: (response) => {
            swal.close();
            swal.fire({
                title: 'Redirecting...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                onOpen: () => {
                    swal.showLoading();
                }
            });
            console.log(response);
            if (response.approvalLink) {
                location.href = response.approvalLink;
            } else if (response.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.error.errMessage
                })
            }
        }
    });
}

$("#editPersonalInfo").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: '/edit-personal-info',
        method: 'post',
        data: $("#editPersonalInfo").serialize(),
        success: (response) => {
            if (response.status) {
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                $('#successAlert').hide();
                $('#successAlert').slideDown();
                $("#input-personal-info").attr("readonly", "true");
                $("#save-personal-info").attr("hidden", "true");
                $("#selectGender").attr("disabled", "true");
                $("#cancel-personal-info").attr("hidden", "true");
                $("#edit-personal-info").removeAttr("hidden");
                $("#profileName").html($("#input-personal-info").val());
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        },
        error: (err) => {
            $('#errorAlertBody').html("Can't connect to the server.");
            $('#errorAlert').removeAttr('hidden');
            setTimeout(() => {
                $('#errorAlert').slideUp();
            }, 5000);
        }
    });
});

$("#editEmail").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: '/edit-personal-info',
        method: 'post',
        data: $("#editEmail").serialize(),
        success: (response) => {
            if (response.status) {
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                $('#successAlert').hide();
                $('#successAlert').slideDown();
                $("#input-email").attr("readonly", "true");
                $("#save-email").attr("hidden", "true");
                $("#cancel-email").attr("hidden", "true");
                $("#edit-email").removeAttr("hidden");
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        },
        error: (err) => {
            $('#errorAlertBody').html("Can't connect to the server.");
            $('#errorAlert').removeAttr('hidden');
            setTimeout(() => {
                $('#errorAlert').slideUp();
            }, 5000);
        }
    });
});

$("#editMobile").submit((e) => {
    e.preventDefault();
    swal.fire({
        title: 'Processing...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
            swal.showLoading();
        }
    });
    $.ajax({
        url: '/update-mobile',
        method: 'post',
        data: $("#editMobile").serialize(),
        success: (response) => {
            console.log(response);
            if (response.mobileNumber) {
                Swal.fire({
                    title: 'Number Verification',
                    html:
                        '<form class="mt-5" id="numberVerification">' +
                        '<div class="form-group" hidden >' +
                        '<label for="mobileNumber" class="text-white">Mobile</label>' +
                        `<input type="tel" class="form-control border-top-0 border-right-0 border-left-0" value="${response.mobileNumber}" name="mobile" required id="mobileNumber">` +
                        '</div>' +
                        '<div class="form-group">' +
                        '<label for="verificationCode" class="text-white text-center">Enter OTP</label>' +
                        '<input type="text" class="form-control border-top-0 border-right-0 border-left-0" placeholder="Type your Verification code" name="OTP" required id="verificationCode">' +
                        '</div>' +
                        '<div class="text-center">' +
                        '<button type="submit" id="verifyButton" onclick="numberVerification(event)" class="btn btn-primary rounded-pill px-5 mt-3">Verify</button>' +
                        '</div>' +
                        '</form >',
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
            }
        }
    });
});

const numberVerification = (e) => {
    e.preventDefault();
    $('#verifyButton').html('Checking...');
    $.ajax({
        url: '/verify-mobile',
        method: 'post',
        data: $('#numberVerification').serialize(),
        success: (response) => {
            console.log(response);
            if (response.status) {
                Swal.close();
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                $('#successAlert').hide();
                $('#successAlert').slideDown();
                $("#input-mobile").attr("readonly", "true");
                $("#save-mobile").attr("hidden", "true");
                $("#cancel-mobile").attr("hidden", "true");
                $("#edit-mobile").removeAttr("hidden");
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $('#verifyButton').html('Verify');
                $('#verificationCode').val('');
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        }
    });
}

$('#sendTicket').submit((e) => {
    e.preventDefault();
    swal.fire({
        title: 'Sending...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
            swal.showLoading();
        }
    });
    $.ajax({
        url: '/sendTicket',
        method: 'post',
        data: $('#sendTicket').serialize(),
        success: (response) => {
            console.log(response);
            swal.close();
            if (response.status) {
                $('#successAlertBody').html(response.alertMessage);
                $('#successAlert').removeAttr('hidden');
                $('#successAlert').hide();
                $('#successAlert').slideDown();
                setTimeout(() => {
                    $('#successAlert').slideUp();
                }, 5000);
            } else {
                $('#errorAlertBody').html(response.errMessage);
                $('#errorAlert').removeAttr('hidden');
                $('#errorAlert').hide();
                $('#errorAlert').slideDown();
                setTimeout(() => {
                    $('#errorAlert').slideUp();
                }, 5000);
            }
        }
    });
});