const logout = (e, url) => {
    e.preventDefault();

    vex.dialog.confirm({
        message: 'Are you sure you want to logout ?',
        callback: function (value) {
            if (value) {
                $.ajax({
                    url,
                    method: 'get',
                    success: (response) => {
                        if (response.status) {
                            if (window.location.pathname === '/account-blocked') {
                                location.href = '/';
                            } else {
                                location.reload();
                            }
                        }
                    }
                });
            }
        }
    });
}

const removeAdminProfilePic = (e, adminId) => {
    vex.dialog.confirm({
        message: 'Are you sure you want to remove this profile picture?',
        callback: (value) => {
            if (value) location.href = `/admin/remove-profile-picture/${adminId}`
        }
    });
}

const removeTheatreProfilePic = (e, theatreId) => {
    vex.dialog.confirm({
        message: 'Are you sure you want to remove this profile picture?',
        callback: (value) => {
            if (value) location.href = `/theatre/remove-owner-picture/${theatreId}`
        }
    });
}

$('#updateAdminForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/admin/update-admin-details',
        method: 'post',
        data: $('#updateAdminForm').serialize(),
        success: (response) => {
            if (response.status) {
                if (response.admin.description && !document.getElementById('adminDescription').innerHTML) {
                    const descriptionHeader = document.createElement("strong");
                    descriptionHeader.setAttribute('class', 'text-muted d-block mb-2');
                    descriptionHeader.innerHTML = 'Description';
                    document.getElementById('adminDescription').appendChild(descriptionHeader);

                    const description = document.createElement('span');
                    description.innerHTML = response.admin.description;
                    document.getElementById('adminDescription').appendChild(description);
                } else if (document.getElementById('descriptionControl').value === '') {
                    document.getElementById('adminDescription').innerHTML = '';
                }

                document.getElementById('adminHeaderName').innerText = response.admin.name;
                document.getElementById('adminProfileName').innerText = response.admin.name;

                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
        }
    });
});

$('#updateTheatreForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/theatre/update-theatre-details',
        method: 'post',
        data: $('#updateTheatreForm').serialize(),
        success: (response) => {
            if (response.status) {
                if (response.theatre.description && !document.getElementById('theatreDescription').innerHTML) {
                    const descriptionHeader = document.createElement("strong");
                    descriptionHeader.setAttribute('class', 'text-muted d-block mb-2');
                    descriptionHeader.innerHTML = 'Description';
                    document.getElementById('theatreDescription').appendChild(descriptionHeader);

                    const description = document.createElement('span');
                    description.innerHTML = response.theatre.description;
                    document.getElementById('theatreDescription').appendChild(description);
                } else if (document.getElementById('descriptionControl').value === '') {
                    document.getElementById('theatreDescription').innerHTML = '';
                }

                document.getElementById('theatreHeaderName').innerText = response.theatre.ownerName;
                document.getElementById('theatreProfileName').innerText = response.theatre.ownerName;

                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
        }
    });
});

$('#changeAdminPasswordForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/admin/change-password',
        method: 'post',
        data: $('#changeAdminPasswordForm').serialize(),
        success: (response) => {
            if (response.status) {
                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
        }
    });
});

$('#changeTheatrePasswordForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/theatre/change-password',
        method: 'post',
        data: $('#changeTheatrePasswordForm').serialize(),
        success: (response) => {
            if (response.status) {
                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
        }
    });
});

$('#locationPickerForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/theatre/update-location',
        method: 'post',
        data: $('#locationPickerForm').serialize(),
        success: (response) => {
            if (response.status) {
                showTheatreLocation();
                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
        }
    });
});

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
                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                $(`#deleteModal${id}`).modal('hide');
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            $(`#deleteModal${id}`).modal('hide');
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
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
                iziToast.show({
                    title: response.alertMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                $(`#deleteModal${showId}`).modal('hide');
                iziToast.show({
                    title: response.errMessage,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
        },
        error: (err) => {
            $(`#deleteModal${showId}`).modal('hide');
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
        }
    });
}

const getTimeSlots = (currentSlot, currentDate) => {
    const selector = document.getElementById('showTime');
    let availableSlots = [{ time: "09:00" }, { time: "12:00" }, { time: "15:00" }, { time: "18:00" }, { time: "21:00" }];

    currentSlot = $('#showDate').val() !== currentDate ? null : currentSlot;

    selector.innerHTML = currentSlot ? `<option value="${currentSlot}">${currentSlot} (current)</option>` : null;

    $.ajax({
        url: "/theatre/get-time-slots",
        method: 'post',
        data: {
            date: $('#showDate').val(),
            screenId: $('#screenId').val()
        },
        success: (slots) => {

            if (slots[0]) {
                slots.forEach(slot => {
                    availableSlots = availableSlots.filter((availableSlot) => availableSlot.time !== slot.time);
                });
            }

            if (availableSlots[0]) {
                availableSlots.forEach(slot => {
                    const option = document.createElement("option");
                    option.value = slot.time;
                    option.innerHTML = slot.time;
                    selector.appendChild(option)
                });
            } else {
                const option = document.createElement("option");
                option.innerHTML = currentSlot ? `All other time slots are filled on ${$('#showDate').val()}, Please select another date to get new slot.`
                    : `All time slots are filled on ${$('#showDate').val()}, Please select another date.`;
                option.value = "";
                selector.appendChild(option)

                !currentSlot && iziToast.show({
                    title: `All time slots are filled on ${$('#showDate').val()}, Please select another date.`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            }
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

$('#loginForm').submit((e) => {
    e.preventDefault();
    $('#submitBtn').attr('hidden', true);
    $('#loadingBtn').removeAttr('hidden');

    $.ajax({
        url: '/login',
        method: 'post',
        data: $('#loginForm').serialize(),
        success: (response) => {
            if (response.status) {
                $("#loginSubmit").hide();
                $("#verificationForm").slideDown(500);
                $("#verificationMobileInput").val(response.user.mobileNumber);
                iziToast.show({
                    title: `Sended verification code to ${response.user.mobileNumber}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: `${response.errMessage}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
                $('#loadingBtn').attr('hidden', true);
                $('#submitBtn').removeAttr('hidden');
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
            $('#loadingBtn').attr('hidden', true);
            $('#submitBtn').removeAttr('hidden');
        }
    });
});

$('#signupForm').submit((e) => {
    e.preventDefault();
    $('#submitBtn').attr('hidden', true);
    $('#loadingBtn').removeAttr('hidden');

    $.ajax({
        url: '/signup',
        method: 'post',
        data: $('#signupForm').serialize(),
        success: (response) => {
            if (response.status) {
                $("#signupSubmit").hide();
                $("#verificationForm").slideDown(500);
                $("#verificationMobileInput").val(response.user.mobileNumber);
                iziToast.show({
                    title: `Sended verification code to ${response.user.mobileNumber}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: `${response.errMessage}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
                $('#loadingBtn').attr('hidden', true);
                $('#submitBtn').removeAttr('hidden');
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
            $('#loadingBtn').attr('hidden', true);
            $('#submitBtn').removeAttr('hidden');
        }
    });
});

$('#verificationForm').submit((e) => {
    e.preventDefault();
    $('#verificationSubmitBtn').attr('hidden', true);
    $('#verificationLoadingBtn').removeAttr('hidden');

    $.ajax({
        url: '/verify-account',
        method: 'post',
        data: $('#verificationForm').serialize(),
        success: (response) => {
            if (response.status) {
                iziToast.show({
                    title: 'Approved',
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                    timeout: 1000,
                    onClosed: function () {
                        if (window.location.pathname !== '/my-profile') {
                            window.history.go(-1);
                        } else {
                            $('#editMobileLoadingBtn').attr('hidden', true);
                            $('#editMobileSubmitBtn').removeAttr('hidden');
                            $("#editMobileSubmit").slideDown(500);
                            $("#verificationForm").hide();
                            $("#verificationMobileInput").val('');
                        }
                    }
                });
                $('#verificationLoadingBtn').attr('hidden', true);
                $('#verificationSubmitBtn').removeAttr('hidden');
            } else {
                iziToast.show({
                    title: `${response.errMessage}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
                $('#verificationLoadingBtn').attr('hidden', true);
                $('#verificationSubmitBtn').removeAttr('hidden');
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
            $('#verificationLoadingBtn').attr('hidden', true);
            $('#verificationSubmitBtn').removeAttr('hidden');
        }
    });
});

const checkoutRazorpay = (e, screenId, showId) => {
    e.preventDefault();

    $('#sidebarBody').fadeOut(1000);
    $('#sidebarClose').slideUp(600);
    setTimeout(() => {
        $('#sidebarWrapper').fadeOut()
        $('#checkoutSidebar').animate({ width: "0" }, 'slow', 'swing', () => sidebarOpened = false);
    }, 1000);

    let totalAmount = parseInt(document.getElementById('payableAmount').innerHTML);
    let seats = document.getElementById('seatsDisplay').innerHTML;
    let numberOfSeats = parseInt(document.getElementById('totalSeats').innerHTML);

    vex.dialog.open({
        input: [
            `<div class="text-center">
                <h6>Processing</h6>
                <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                </span>
            </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
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
            vex.closeTop();
            if (response.error) {
                vex.dialog.confirm({
                    message: 'Something went wrong! Please try again.',
                    callback: function (value) {
                        sidebarOpened = false;
                    }
                });
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
    vex.dialog.open({
        input: [
            `<div class="text-center">
            <h6>Processing</h6>
                <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                </span>
                </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
    });
    $.ajax({
        url: '/verify-razorpay-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            vex.closeTop();
            if (response.status) {
                location.href = `/view-order?orderId=${order.receipt}`
            } else {
                vex.dialog.confirm({
                    message: response.errMessage,
                    callback: function (value) {
                        sidebarOpened = false;
                    }
                });
            }
        }
    });
}

const checkoutPaypal = (e, screenId, showId) => {
    e.preventDefault();

    $('#sidebarBody').fadeOut(1000);
    $('#sidebarClose').slideUp(600);
    setTimeout(() => {
        $('#sidebarWrapper').fadeOut()
        $('#checkoutSidebar').animate({ width: "0" }, 'slow', 'swing', () => sidebarOpened = false);
    }, 1000);

    let totalAmount = parseInt(document.getElementById('payableAmount').innerHTML);
    let seats = document.getElementById('seatsDisplay').innerHTML;
    let numberOfSeats = parseInt(document.getElementById('totalSeats').innerHTML);

    vex.dialog.open({
        input: [
            `<div class="text-center">
            <h6>Processing</h6>
                <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        </span>
                        </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
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
            vex.closeTop();
            vex.dialog.open({
                input: [
                    `<div class="text-center">
                    <h6>Redirecting</h6>
                    <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            </span>
                            </div>`
                ].join(''),
                buttons: [],
                escapeButtonCloses: false,
                overlayClosesOnClick: false
            });
            if (response.approvalLink) {
                location.href = response.approvalLink;
            } else if (response.error) {
                vex.dialog.confirm({
                    message: response.error.errMessage,
                    callback: function (value) {
                        sidebarOpened = false;
                    }
                });
            }
        }
    });
}

checkoutWithWallet = (e, screenId, showId) => {
    e.preventDefault();

    $('#sidebarBody').fadeOut(1000);
    $('#sidebarClose').slideUp(600);
    setTimeout(() => {
        $('#sidebarWrapper').fadeOut()
        $('#checkoutSidebar').animate({ width: "0" }, 'slow', 'swing', () => sidebarOpened = false);
    }, 1000);

    let totalAmount = parseInt(document.getElementById('payableAmount').innerHTML);
    let seats = document.getElementById('seatsDisplay').innerHTML;
    let numberOfSeats = parseInt(document.getElementById('totalSeats').innerHTML);

    vex.dialog.open({
        input: [
            `<div class="text-center">
            <h6>Processing</h6>
                <span id="loadingBtn">
                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        </span>
            </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
    });

    $.ajax({
        url: '/checkoutWithWallet',
        method: 'post',
        data: {
            screenId,
            showId,
            numberOfSeats,
            seats,
            totalAmount
        },
        success: (response) => {
            vex.closeTop();

            if (response.status) {
                location.href = response.redirectUrl;
            } else {
                vex.dialog.confirm({
                    message: response.errMessage,
                    callback: function (value) {
                        sidebarOpened = false;
                    }
                });
            }
        }
    });
}

$("#editPersonalInfo").submit((e) => {
    e.preventDefault();
    $('#editPersonalInfoSubmitBtn').attr('hidden', true);
    $('#editPersonalInfoLoadingBtn').removeAttr('hidden');

    $.ajax({
        url: '/edit-personal-info',
        method: 'post',
        data: $("#editPersonalInfo").serialize(),
        success: (response) => {
            if (response.status) {
                iziToast.show({
                    title: `Saved successfully.`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
                $('#editPersonalInfoLoadingBtn').attr('hidden', true);
                $('#editPersonalInfoSubmitBtn').removeAttr('hidden');
            } else {
                iziToast.show({
                    title: `${response.errMessage}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
                $('#editPersonalInfoLoadingBtn').attr('hidden', true);
                $('#editPersonalInfoSubmitBtn').removeAttr('hidden');
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
            $('#editPersonalInfoLoadingBtn').attr('hidden', true);
            $('#editPersonalInfoSubmitBtn').removeAttr('hidden');
        }
    });
});

$("#editMobile").submit((e) => {
    e.preventDefault();
    $('#editMobileSubmitBtn').attr('hidden', true);
    $('#editMobileLoadingBtn').removeAttr('hidden');

    $.ajax({
        url: '/update-mobile',
        method: 'post',
        data: $("#editMobile").serialize(),
        success: (response) => {
            if (response.status) {
                $("#editMobileSubmit").hide();
                $("#verificationForm").slideDown(500);
                $("#verificationMobileInput").val(response.mobileNumber);
                iziToast.show({
                    title: `Sended verification code to ${response.mobileNumber}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-slack',
                });
            } else {
                iziToast.show({
                    title: `${response.errMessage}`,
                    titleColor: '#fff',
                    icon: 'fa fa-check',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
                $('#editMobileLoadingBtn').attr('hidden', true);
                $('#editMobileSubmitBtn').removeAttr('hidden');
            }
        },
        error: (err) => {
            iziToast.show({
                title: "Can't connect to the server.",
                titleColor: '#fff',
                icon: 'fa fa-check',
                iconColor: '#fff',
                class: 'bg-danger',
            });
            $('#editMobileLoadingBtn').attr('hidden', true);
            $('#editMobileSubmitBtn').removeAttr('hidden');
        }
    });
});

const sendTicket = (e, orderId) => {
    e.preventDefault();
    vex.dialog.prompt({
        message: 'Enter email to get ticket to your inbox',
        placeholder: 'Email',
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'Send' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
        ],
        callback: function (email) {
            if (email === false) {
                iziToast.show({
                    title: `Cancelled`,
                    titleColor: '#fff',
                    icon: 'fa fa-close',
                    iconColor: '#fff',
                    class: 'bg-danger',
                });
            } else if (!email) {
                vex.dialog.open({
                    input: [
                        '<h3 class="text-center"><span class="fa fa-info text-twitter"></span></h3>',
                        '<p class="text-center font-weight-bold">You must provide an email to send ticket</p>'
                    ].join(''),
                    buttons: [
                        $.extend({}, vex.dialog.buttons.YES, { text: 'Ok' })
                    ],
                    callback: function () {
                        iziToast.show({
                            title: `Cancelled`,
                            titleColor: '#fff',
                            icon: 'fa fa-close',
                            iconColor: '#fff',
                            class: 'bg-danger',
                        });
                    }
                });
            } else {
                vex.dialog.open({
                    input: [
                        `<div class="text-center">
                        <h6>Sending ticket to <span class="text-danger">${email}</span></h6>
                            <span id="loadingBtn">
                                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                                aria-hidden="true"></span>
                                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                                aria-hidden="true"></span>
                                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                                aria-hidden="true"></span>
                                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                                    aria-hidden="true"></span>
                                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                                    aria-hidden="true"></span>
                            </span>
                        </div>`
                    ].join(''),
                    buttons: []
                });
                $.ajax({
                    url: '/sendTicket',
                    method: 'post',
                    data: {
                        email,
                        orderId
                    },
                    success: (response) => {
                        if (response.status) {
                            vex.closeTop();
                            iziToast.show({
                                title: response.alertMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-slack',
                            });
                        } else {
                            vex.closeTop();
                            iziToast.show({
                                title: response.errMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-danger',
                            });
                        }
                    }
                });
            }
        }
    });
}

const addToWalletRazorpay = (e) => {
    e.preventDefault();

    vex.dialog.open({
        input: [
            `<div class="text-center">
                <h6>Processing</h6>
                <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                </span>
            </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
    });
    $.ajax({
        url: '/addtowallet-razorpay',
        method: 'post',
        data: $('#addToWalletForm').serialize(),
        success: (response) => {
            vex.closeTop();
            if (response.error) {
                vex.dialog.alert('Something went wrong! Please try again.');
            } else {
                razorpayAddToWalletPayment(response);
            }
        }
    });
}

const razorpayAddToWalletPayment = (order) => {
    var options = {
        "key": "rzp_test_fsFqCPdvUxG9MI", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "MovieMaster",
        "description": "Secure Payments",
        "image": "/favicon.ico",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyAddToWalletPayment(response, order);
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

const verifyAddToWalletPayment = (payment, order) => {
    vex.dialog.open({
        input: [
            `<div class="text-center">
            <h6>Processing</h6>
                <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                </span>
                </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
    });
    $.ajax({
        url: '/verify-addtowallet-razorpay-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            vex.closeTop();
            if (response.status) {
                vex.dialog.confirm({
                    message: `Successfully added Rs.${response.amount} to your Wallet`,
                    buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'Ok' })],
                    callback: function (value) {
                        location.reload();
                    }
                });
            } else {
                vex.dialog.alert(response.errMessage);
            }
        }
    });
}

const addToWalletPaypal = (e) => {
    e.preventDefault();

    vex.dialog.open({
        input: [
            `<div class="text-center">
            <h6>Processing</h6>
                <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                        aria-hidden="true"></span>
                        </span>
                        </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
    });

    $.ajax({
        url: '/addtowallet-paypal',
        method: 'post',
        data: $('#addToWalletForm').serialize(),
        success: (response) => {
            vex.closeTop();
            vex.dialog.open({
                input: [
                    `<div class="text-center">
                    <h6>Redirecting</h6>
                    <span id="loadingBtn">
                    <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                            aria-hidden="true"></span>
                            </span>
                            </div>`
                ].join(''),
                buttons: [],
                escapeButtonCloses: false,
                overlayClosesOnClick: false
            });
            if (response.approvalLink) {
                location.href = response.approvalLink;
            } else if (response.error) {
                vex.dialog.confirm({
                    message: response.error.errMessage,
                    callback: function (value) {
                        sidebarOpened = false;
                    }
                });
            }
        }
    });
}

const deleteUser = (e, userId, userName) => {
    e.preventDefault();

    vex.dialog.confirm({
        message: `Are you sure you want to delete ${userName}?.`,
        callback: function (value) {
            if (value) {
                $.ajax({
                    url: '/admin/delete-user',
                    method: 'post',
                    data: {
                        userId
                    },
                    success: (response) => {
                        if (response.status) {
                            iziToast.show({
                                title: response.alertMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-slack',
                            });
                            $(`#${userId}`).remove();
                        } else if (response.errMessage) {
                            iziToast.show({
                                title: response.errMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-danger',
                            });
                        }
                    },
                    error: (error) => {
                        iziToast.show({
                            title: "Can't connect to the server.",
                            titleColor: '#fff',
                            icon: 'fa fa-check',
                            iconColor: '#fff',
                            class: 'bg-danger',
                        });
                    }
                });
            }
        }
    });
}

const blockUser = (e, userId, userName) => {
    e.preventDefault();

    vex.dialog.confirm({
        message: `Are you sure you want to block ${userName}?.`,
        callback: function (value) {
            if (value) {
                $.ajax({
                    url: '/admin/block-user',
                    method: 'post',
                    data: {
                        userId
                    },
                    success: (response) => {
                        if (response.status) {
                            iziToast.show({
                                title: response.alertMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-slack',
                                timeout: 1000,
                                onClosed: function () {
                                    location.reload();
                                }
                            });
                        } else if (response.errMessage) {
                            iziToast.show({
                                title: response.errMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-danger',
                            });
                        }
                    },
                    error: (error) => {
                        iziToast.show({
                            title: "Can't connect to the server.",
                            titleColor: '#fff',
                            icon: 'fa fa-check',
                            iconColor: '#fff',
                            class: 'bg-danger',
                        });
                    }
                });
            }
        }
    });
}

const unblockUser = (e, userId, userName) => {
    e.preventDefault();

    vex.dialog.confirm({
        message: `Are you sure you want to Unblock ${userName}?.`,
        callback: function (value) {
            if (value) {
                $.ajax({
                    url: '/admin/unblock-user',
                    method: 'post',
                    data: {
                        userId
                    },
                    success: (response) => {
                        if (response.status) {
                            iziToast.show({
                                title: response.alertMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-slack',
                                timeout: 1000,
                                onClosed: function () {
                                    location.reload();
                                }
                            });
                        } else if (response.errMessage) {
                            iziToast.show({
                                title: response.errMessage,
                                titleColor: '#fff',
                                icon: 'fa fa-check',
                                iconColor: '#fff',
                                class: 'bg-danger',
                            });
                        }
                    },
                    error: (error) => {
                        iziToast.show({
                            title: "Can't connect to the server.",
                            titleColor: '#fff',
                            icon: 'fa fa-check',
                            iconColor: '#fff',
                            class: 'bg-danger',
                        });
                    }
                });
            }
        }
    });
}