$(document).foundation();

$(document).ready(function () {
    $('.alert .message-dismiss').click(function (e) {
        $('#request-quote-modal').toggle();
        $('.callout').hide();
    });

    $('.success .message-dismiss').click(function (e) {
        $('#request-quote-modal').toggle();
        $('.callout').hide();
        $('#request-quote-modal input').val('');
        $('.fixed-close-button').click();
    });

    $('#request-quote-modal').on('submit', function (e) {
        e.preventDefault();
        var utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
        for (var i=0; i < utm.length; i++){
            var v = Cookies.get(utm[i]);
            $('#' + utm[i]).val(v);
        }
        $.ajax({
            url: $("#request-quote-modal").attr("action"),
            method: 'post',
            dataType: 'html',
            data: $('#request-quote-modal').serialize(),
            success: function (data) {
                $('#form-success .messages').html(data);
                $('#form-success').css('display', 'block');
                $('#request-quote-modal').hide();
            },
            error: function (data) {
                $('#form-errors .messages').html(data.responseText);
                $('#form-errors').css('display', 'block');
                $('#request-quote-modal').hide();
            }
        });

        return false;
    });
});