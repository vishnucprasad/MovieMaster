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

$(window).on("scroll", function () {
    const scroll = $(window).scrollTop();

    if (scroll >= 80) {
        $("#navbar-main").addClass("shadow-soft");
    } else {
        $("#navbar-main").removeClass("shadow-soft");
    }
});

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
    scrollFunction()
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("movetop").style.display = "block";
    } else {
        document.getElementById("movetop").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.addEventListener('message', function (e) {
    if (e.data !== 'popup-done') { return; }
    window.location.reload();
});

const authPopup = (e, url) => {
    e.preventDefault();
    var width = 720, height = 580;
    var w = window.outerWidth - width, h = window.outerHeight - height;
    var left = Math.round(window.screenX + (w / 2));
    var top = Math.round(window.screenY + (h / 2.5));

    loginWindow = window.open(url, 'LogIn',
        'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top +
        ',toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0');
}

function getShows(btn, ID) {
    $('#todayShows').hide()
    $('#tomorrowShows').hide()
    $('#dayAfterTomorrowShows').hide()

    $('#today').removeClass('btn-info text-white')
    $('#tomorrow').removeClass('btn-info text-white')
    $('#dayAfterTomorrow').removeClass('btn-info text-white')

    $(`#${btn}`).addClass('btn-info text-white');
    $(`#${ID}`).fadeIn();
}

function showDetails(showId, screenId) {
    let price = 0;

    var allSeatsVals = [];

    $('#seatsBlock :checked').each(function () {
        allSeatsVals.push($(this).val());
    });

    if (allSeatsVals.length < 1) {
        Swal.fire(
            'No Seat Selected.',
            'Please select atleast one seat.',
            'info'
        )
    } else if (allSeatsVals.length > 10) {
        Swal.fire(
            'Maximum 10 seats.',
            'You are only able to select a maximum of 10 seats per order.',
            'info'
        )
    } else {
        allSeatsVals.forEach(seat => {
            price += parseInt($(`#${seat}`).data('price'));
        });

        $('#NumberDisplay').val(allSeatsVals.length);
        $('#PriceDisplay').val(price);
        $('#seatsDisplay').val(allSeatsVals);

        $('#submissionForm').slideDown();

        Swal.mixin({
            customClass: {
                confirmButton: 'btn bg-white btn-shadow'
            },
            buttonsStyling: false
        }).fire({
            title: 'Book Now',
            html:
                '<form class="mt-4" id="bookingForm">' +
                '<div class="row">' +
                '<div class="col-md-12" hidden>' +
                '<div class="form-group">' +
                '<label for="showId" class="text-white">Show Id</label>' +
                `<input type="text" class="form-control" id="showId" name="showId" value="${showId}" required readonly>` +
                '</div>' +
                '</div>' +
                '<div class="col-md-12" hidden>' +
                '<div class="form-group">' +
                '<label for="screenId" class="text-white">Screen</label>' +
                `<input type="text" class="form-control" id="screenId" name="screenId" value="${screenId}" required readonly>` +
                '</div>' +
                '</div>' +
                '<div class="col-md-6">' +
                '<div class="form-group">' +
                '<label for="NumberDisplay" class="text-white">Number of Seats</label>' +
                `<input type="text" class="form-control" name="numberOfSeats" value="${allSeatsVals.length}" id="NumberDisplay" required readonly>` +
                '</div>' +
                '</div>' +
                '<div class="col-md-6">' +
                '<div class="form-group">' +
                '<label for="PriceDisplay" class="text-white">Total Price</label>' +
                `<input type="text" class="form-control" name="totalAmount" value="${price}" id="PriceDisplay" required readonly>` +
                '</div>' +
                '</div>' +
                '<div class="col-md-12">' +
                '<div class="form-group">' +
                '<label for="seatsDisplay" class="text-white">Seats</label>' +
                `<input type="text" class="form-control" name="seats" id="seatsDisplay" value="${allSeatsVals}" required readonly>` +
                '</div>' +
                '</div>' +
                '</div>' +
                '</form>',
            confirmButtonText: 'Continue&nbsp;<i class="fa fa-arrow-right"></i>',
            focusConfirm: false,
            preConfirm: () => {
                location.href = `/checkout?${$('#bookingForm').serialize()}`;
                swal.fire({
                    title: 'Processing...',
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    onOpen: () => {
                        swal.showLoading();
                    }
                });
            }
        })
    }
}

$("#edit-personal-info").click(function () {
    $("#input-personal-info").removeAttr("readonly");
    $("#save-personal-info").removeAttr("hidden");
    $("#selectGender").removeAttr("disabled");
    $("#edit-personal-info").attr("hidden", "true");
    $("#cancel-personal-info").removeAttr("hidden");
});
$("#cancel-personal-info").click(function () {
    $("#input-personal-info").attr("readonly", "true");
    $("#save-personal-info").attr("hidden", "true");
    $("#selectGender").attr("disabled", "true");
    $("#cancel-personal-info").attr("hidden", "true");
    $("#edit-personal-info").removeAttr("hidden");
});
$("#edit-email").click(function () {
    $("#input-email").removeAttr("readonly");
    $("#save-email").removeAttr("hidden");
    $("#edit-email").attr("hidden", "true");
    $("#cancel-email").removeAttr("hidden");
});
$("#cancel-email").click(function () {
    $("#input-email").attr("readonly", "true");
    $("#save-email").attr("hidden", "true");
    $("#cancel-email").attr("hidden", "true");
    $("#edit-email").removeAttr("hidden");
});
$("#edit-mobile").click(function () {
    $("#input-mobile").removeAttr("readonly");
    $("#save-mobile").removeAttr("hidden");
    $("#edit-mobile").attr("hidden", "true");
    $("#cancel-mobile").removeAttr("hidden");
});
$("#cancel-mobile").click(function () {
    $("#input-mobile").attr("readonly", "true");
    $("#save-mobile").attr("hidden", "true");
    $("#cancel-mobile").attr("hidden", "true");
    $("#edit-mobile").removeAttr("hidden");
});

const opnUpdateWindow = (e, profilePic) => {
    e.preventDefault();
    const attr = profilePic ? '' : 'hidden';
    const defaultImage = profilePic ? '' : '<img src="/images/user/profile.png" alt="" id="viewImage" class="img-fluid" width="100%">';
    Swal.fire({
        title: '',
        html:
            `${defaultImage}` +
            `<img src="${profilePic}" alt="" id="viewImage" class="img-fluid" width="100%">` +
            `<form action="/update-profile-picture" method="POST" enctype="multipart/form-data">` +
            `<div class="form-group text-center">` +
            `<label class="btn btn-outline-light rounded-pill mt-3 px-5" for="my-file-selector">` +
            `<input id="my-file-selector" required type="file" name="profilePicture" style="display:none" onchange="loadImage(event);"> Choose Image` +
            `</div >` +
            `<div class="row justify-content-center">` +
            `<a type="button" ${attr} type="button" class="btn btn-danger text-white rounded-pill ml-3 px-5" onclick="removeProfilePic(event)">Remove` +
            `</a>` +
            `<button type="submit" class="btn btn-success rounded-pill ml-auto mr-3 px-5">Upload` +
            `</button>` +
            `</div>` +
            `</form >`,
        focusConfirm: false,
        showConfirmButton: false
    });
}

const removeProfilePic = (e) => {
    e.preventDefault();
    Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger rounded-pill px-5 m-3',
            cancelButton: 'btn btn-success rounded-pill px-5 m-3'
        },
        buttonsStyling: false
    }).fire({
        text: "Are you sure you want to remove this profile picture.?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Remove'
    }).then((result) => {
        if (result.isConfirmed) {
            location.href = '/remove-profile-picture'
        }
    });
}

const checkoutTimeout = (movieId) => {
    const FULL_DASH_ARRAY = 283;
    const WARNING_THRESHOLD = 2.5 * 60;
    const ALERT_THRESHOLD = 60;

    const COLOR_CODES = {
        info: {
            color: "green"
        },
        warning: {
            color: "orange",
            threshold: WARNING_THRESHOLD
        },
        alert: {
            color: "red",
            threshold: ALERT_THRESHOLD
        }
    };

    const TIME_LIMIT = 5 * 60;
    let timePassed = 0;
    let timeLeft = TIME_LIMIT;
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;

    document.getElementById("countDown").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
  <span id="time-left-label" class="time-left-label ${remainingPathColor}">Left</span>
</div>
`;

    startTimer();

    function onTimesUp() {
        clearInterval(timerInterval);
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timePassed = timePassed += 1;
            timeLeft = TIME_LIMIT - timePassed;
            document.getElementById("base-timer-label").innerHTML = formatTime(
                timeLeft
            );
            setCircleDasharray();
            setRemainingPathColor(timeLeft);

            if (timeLeft === 0) {
                onTimesUp();
            }
        }, 1000);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }

    function setRemainingPathColor(timeLeft) {
        const { alert, warning, info } = COLOR_CODES;
        if (timeLeft <= alert.threshold) {
            document
                .getElementById("base-timer-path-remaining")
                .classList.remove(warning.color);
            document
                .getElementById("base-timer-path-remaining")
                .classList.add(alert.color);
            document
                .getElementById("time-left-label")
                .classList.remove(warning.color);
            document
                .getElementById("time-left-label")
                .classList.add(alert.color);
        } else if (timeLeft <= warning.threshold) {
            document
                .getElementById("base-timer-path-remaining")
                .classList.remove(info.color);
            document
                .getElementById("base-timer-path-remaining")
                .classList.add(warning.color);
            document
                .getElementById("time-left-label")
                .classList.remove(info.color);
            document
                .getElementById("time-left-label")
                .classList.add(warning.color);
        }
    }

    function calculateTimeFraction() {
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    function setCircleDasharray() {
        const circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(0)} 283`;
        document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
    }

    setTimeout(() => {
        location.replace(`/view-movie?movieId=${movieId}&timeout=true`);
    }, 5 * 60 * 1000);
}