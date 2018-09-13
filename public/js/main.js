$(function() {
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    $('.deleteConfirmed').on('click', function() {
        if(!confirm('Confirm delition')){
            return false;
        }
    });
});