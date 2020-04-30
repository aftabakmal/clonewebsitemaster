$(document).ready(function () {
    var age = 0;
    var phoneValidation = false;
    var addressValidation = false;

    var day = $('#birth-day').val();
    var month = $('#birth-month').val();
    var year = $('#birth-year').val();
    if (day != '' && month != '' && year != '') {
        age = moment().diff(moment([year, month, day]), 'years');
        $('#age').val(age);
    }

    function fetchRates() {
        $.ajax({
            method: 'GET',
            url: '/api/calculate-quote',
            data: {
                age: age,
                nicotine: $('input[name="nicotine"]:checked').val(),
                amount: $('input[name="coverage_amount"]').val(),
                term: $('input[name="policy_length"]').val()
            },
            dataType: 'json',
            success: function (jsonResponse) {
                $('#amount-container').show();
                $('.fixed-bottom').show();
                $('.monthly-premium').text(jsonResponse.data.monthlyPremium);
            }
        });
    }

    function verifyPhoneNumber(areaCode, prefix, suffix) {
        $('#phone-verify').html('<span class="alert warning">Verifying...</span>');
        $.ajax({
            method: 'GET',
            url: '/api/verify-number',
            data: {
                area_code: areaCode,
                prefix: prefix,
                suffix: suffix
            },
            dataType: 'json',
            success: function (jsonResponse) {
                if (jsonResponse.data.valid) {
                    phoneValidation = true;
                    $('#phone-verify').html('');
                    $('.phone input').css('border', 'none');
                } else {
                    phoneValidation = false;
                    $('#phone-verify').html('<span class="alert danger">Please enter a valid phone number.</span>');
                    $('.phone input').css('border', '1px solid red');
                }

                if (phoneValidation && addressValidation) {
                    $('#submit-button').removeAttr('disabled');
                } else {
                    $('#submit-button').attr('disabled', 'disabled');
                }

                console.log("addressValidation: " + addressValidation);
                console.log("phoneValidation: " + phoneValidation);
            }
        });
    }

    function verifyAddress(streetOne, streetTwo, city, state, zipCode) {
        $('.mail-verify').html('<span class="alert warning">Verifying...</span>');
        $.ajax({
            method: 'GET',
            url: '/api/verify-address',
            data: {
                street_line_one: streetOne,
                street_line_two: streetTwo,
                city: city,
                state: state,
                zip_code: zipCode
            },
            dataType: 'json',
            success: function (jsonResponse) {
                if (jsonResponse.data.valid) {
                    addressValidation = true;
                    $('.did-you-mean-buttons').hide();
                    $('.mail-verify').html('');
                    $('.address input').css('border', 'none');
                    $('#county').val(jsonResponse.data.county);

                    apiCity = jsonResponse.data.city;
                    apiState = jsonResponse.data.state;
                    apiZip = jsonResponse.data.zip;
                    apiStreet1 = jsonResponse.data.street1;
                    apiStreet2 = jsonResponse.data.street2;

                    if (
                        apiCity.toLowerCase() != city.toLowerCase()||
                        apiState.toLowerCase() != state.toLowerCase()||
                        apiZip != zipCode ||
                        apiStreet1.toLowerCase() != streetOne.toLowerCase()
                    ) {
                        fullAddress = apiStreet1 + '<br>' + (apiStreet2 != '' ? apiStreet2 + '<br>' : '') + apiCity + ', ' + apiState + '<br>' + apiZip;
                        $('.did-you-mean').html('<span><strong>Did you mean:</strong> <br><br>' + fullAddress + '</span>');
                        $('.did-you-mean-buttons').css('display', 'flex');

                        $('#correct-yes').attr('data-city', apiCity);
                        $('#correct-yes').attr('data-state', apiState);
                        $('#correct-yes').attr('data-zip', apiZip);
                        $('#correct-yes').attr('data-street-one', apiStreet1);
                        $('#correct-yes').attr('data-street-two', apiStreet2);
                    }
                } else {
                    addressValidation = false;
                    $('.mail-verify').html('<span class="alert danger">Please enter a valid mailing address.</span>');
                    $('.address input').css('border', '1px solid red');
                }

                if (phoneValidation && addressValidation) {
                    $('#submit-button').removeAttr('disabled');
                } else {
                    $('#submit-button').attr('disabled', 'disabled');
                }

                console.log("addressValidation: " + addressValidation);
                console.log("phoneValidation: " + phoneValidation);
            }
        });
    }

     $('#correct-yes').click(function (e) {
        e.preventDefault();

        $('#id_city').val($('#correct-yes').data('city'));
        $('#id_state').val($('#correct-yes').data('state'));
        $('#id_zip_code').val($('#correct-yes').data('zip'));
        $('#id_street_line_one').val($('#correct-yes').data('street-one'));
        $('#id_street_line_two').val($('#correct-yes').data('street-two'));

        $('.did-you-mean').html('');
        $('.did-you-mean-buttons').hide();

        addressValidation = true
        if (phoneValidation && addressValidation) {
            $('#submit-button').removeAttr('disabled');
        }

        return false;
     });

     $('#correct-no').click(function (e) {
        e.preventDefault();

        $('.did-you-mean').html('');
        $('.did-you-mean-buttons').hide();

        addressValidation = true
        if (phoneValidation && addressValidation) {
            $('#submit-button').removeAttr('disabled');
        }

        return false;
     });

    $('label.btn-primary').click(function (e) {
        var type = $(this).data('type');
        $('.' + type + ' label').removeClass('active');
        $(this).addClass('active');
    });

    $('label.btn-circle').click(function (e) {
        var type = $(this).data('type');
        $('.' + type + ' label').removeClass('active');
        $(this).addClass('active');
    });

    $('.age select').change(function () {
        var day = $('#birth-day').val();
        var month = $('#birth-month').val();
        var year = $('#birth-year').val();
        if (day != '' && month != '' && year != '') {
            age = moment().diff(moment([year, month, day]), 'years');
            if (age != 'Nan') {
                fetchRates();
                $('#age').val(age);
            }
        }
    });

    $('.phone input').change(function () {
        var areaCode = $('#id_area_code').val();
        var suffix = $('#id_suffix').val();
        var prefix = $('#id_prefix').val();
        if (areaCode != '' && suffix != '' && prefix != '') {
            verifyPhoneNumber(areaCode, prefix, suffix);
        }
    });

    $('.address input').change(function () {
        var streetOne = $('#id_street_line_one').val();
        var streetTwo = $('#id_street_line_two').val();
        var city = $('#id_city').val();
        var state = $('#id_state').val();
        var zipCode = $('#id_zip_code').val();

        if (streetOne != '' && city != '' && state != '' && zipCode != '') {
            verifyAddress(streetOne, streetTwo, city, state, zipCode);
        }
    });

     $('.watch-fields input').change(function () {
        fetchRates();
     });

     if ($('#id_street_line_one').val() != ''
         && $('#id_city').val() != ''
         && $('#id_state').val() != ''
         && $('#id_zip_code').val() != ''
         && $('#id_area_code').val() != ''
         && $('#id_suffix').val() != ''
         && $('#id_prefix').val() != ''
         ) {
            var areaCode = $('#id_area_code').val();
            var suffix = $('#id_suffix').val();
            var prefix = $('#id_prefix').val();
            var streetOne = $('#id_street_line_one').val();
            var streetTwo = $('#id_street_line_two').val();
            var city = $('#id_city').val();
            var state = $('#id_state').val();
            var zipCode = $('#id_zip_code').val();
            verifyPhoneNumber(areaCode, prefix, suffix);
            verifyAddress(streetOne, streetTwo, city, state, zipCode);
     }
});