if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js')
        .then(reg => console.log('service worker registered'))
        .catch(err => console.log('service worker not registered', err));
}

const loadImage = (e) => {
    document.getElementById('viewImage').src = URL.createObjectURL(e.target.files[0]);
}

const onProfilePicChange = (e) => {
    document.getElementById('profilePic').src = URL.createObjectURL(e.target.files[0]);

    $('#profilePicUploadBtn').attr('hidden', true);
    $('#profilePicConfirmBtn').removeAttr('hidden');
}

$('#updateProfilePicForm').submit((e) => {
    $('#profilePicSubmitBtn').attr('hidden', true);
    $('#profilePicLoadingBtn').removeAttr('hidden');
});

const setActiveTab = (id) => {
    document.getElementById('dashboard-tab').classList.remove("active");
    document.getElementById('theatre-management-tab').classList.remove("active");
    document.getElementById('users-management-tab').classList.remove("active");
    document.getElementById('users-activity-tab').classList.remove("active");
    document.getElementById('admin-profile-tab').classList.remove("active");

    document.getElementById(`${id}`).classList.add("active");
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

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.addEventListener('message', function (e) {
    if (e.data !== 'popup-done') { return; }
    window.history.go(-1);
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

let sidebarOpened = false;

const confirmSelection = () => {
    let price = 0;

    var allSeatsVals = [];

    $('#seatsBlock :checked').each(function () {
        allSeatsVals.push($(this).val());
    });

    if (allSeatsVals.length < 1) {
        vex.dialog.open({
            input: [
                '<h3 class="text-center"><span class="fa fa-info text-twitter"></span></h3>',
                '<p class="text-center font-weight-bold">No Seat Selected. Please select atleast one seat.</p>'
            ].join(''),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, { text: 'Ok' })
            ]
        })
    } else if (allSeatsVals.length > 10) {
        vex.dialog.open({
            input: [
                '<h3 class="text-center"><span class="fa fa-info text-twitter"></span></h3>',
                '<p class="text-center font-weight-bold">You are only able to select a maximum of 10 seats per booking.</p>'
            ].join(''),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, { text: 'Ok' })
            ]
        })
    } else {
        allSeatsVals.forEach(seat => {
            price += parseInt($(`#${seat}`).data('price'));
        });

        $('#totalSeats').html(allSeatsVals.length);
        $('#totalPrice').html(price);
        $('#payableAmount').html(price);
        $('#seatsDisplay').html(allSeatsVals.toString());

        $('#sidebarWrapper').fadeIn();
        $('#checkoutSidebar').animate({ width: "20rem" }, 'slow', 'swing', () => {
            $('#sidebarBody').fadeIn(1000);
            $('#sidebarClose').slideDown(600);
            checkoutTimeout();
            sidebarOpened = true;
        });
    }
}

const closeSidebar = () => {
    $('#sidebarBody').fadeOut(1000);
    $('#sidebarClose').slideUp(600);
    setTimeout(() => {
        $('#sidebarWrapper').fadeOut()
        $('#checkoutSidebar').animate({ width: "0" }, 'slow', 'swing', () => sidebarOpened = false);
    }, 1000);
}

const checkoutTimeout = () => {
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
        $('#sidebarBody').fadeOut(1000);
        $('#sidebarClose').slideUp(600);
        setTimeout(() => {
            $('#sidebarWrapper').fadeOut()
            $('#checkoutSidebar').animate({ width: "0" }, 'slow', 'swing', () => {
                vex.dialog.confirm({
                    message: 'Payment timed out. Please try again',
                    buttons: [
                        $.extend({}, vex.dialog.buttons.YES, { text: 'Ok' }),
                    ]
                });
            });
        }, 1000);
    }

    function stopTimer() {
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
            } else if (!sidebarOpened) {
                stopTimer();
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
}

const removeProfilePic = (e) => {
    e.preventDefault();
    vex.dialog.confirm({
        message: 'Are you sure you want to remove this profile picture.?',
        callback: function (value) {
            if (value) {
                location.href = '/remove-profile-picture'
            }
        }
    });
}

const copyRefferalLink = (e) => {
    e.preventDefault();

    const copyText = document.getElementById('refferalLink');

    copyText.select();
    copyText.setSelectionRange(0, 99999);

    document.execCommand("copy");

    iziToast.show({
        title: 'Successfully copied to the clipboard',
        titleColor: '#fff',
        icon: 'fa fa-check',
        iconColor: '#fff',
        class: 'bg-slack',
    });
}