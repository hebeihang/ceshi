// 等待文档加载完成后初始化
$(document).ready(function() {
    console.log('Starting omikuji animation...');
    setTimeout(fncOmikuji, 500);
});

function fncOmikuji() {
    console.log('Initializing omikuji...');
    var elmHtml = $("#box_omikuji_draw .pic_omikuji").prop('outerHTML');
    console.log('Original element:', elmHtml);
    
    // 清除现有的御神签
    $('#box_omikuji_draw .box_omikuji_inner .pic_omikuji:not(:first)').remove();
    
    // 添加新的御神签
    for(var i=0; i<200; i++){
        $('#box_omikuji_draw .box_omikuji_inner').append(elmHtml);
    }
    
    var size = $('#box_omikuji_draw .pic_omikuji').length;
    console.log('Total omikuji elements:', size);
    
    var int_cnt = 0;
    var random01;
    var random02;
    var random03;
    
    $('#box_omikuji_draw .pic_omikuji').hide();
    
    $("#box_omikuji_draw .pic_omikuji").each(function(i) {
        int_cnt++;
        if(int_cnt <= size / 10 * 5){
            random01 = Math.floor(Math.random()*( 110 ) - 20);
            random02 = Math.floor(Math.random()*( 110 ) - 20);
            random03 = (Math.random()*720)-360;
        }else if(int_cnt <= size / 10 * 9){
            random01 = Math.floor(Math.random()*( 90 - 0 ) + 0);
            random02 = Math.floor(Math.random()*( 90 - 0 ) + 0);
            random03 = (Math.random()*720)-360;
        }else{
            random01 = Math.floor(Math.random()*( 60 - 20 ) + 20);
            random02 = Math.floor(Math.random()*( 60 - 20 ) + 20);
            random03 = (Math.random()*( 180 ) - 90);
        }
        
        str_pos_left = random01 + "%";
        str_pos_top = random02 + "%";
        str_rotate = "rotate(" + random03 + "deg)";    	
        
        $(this).css({
            'left': str_pos_left,
            'top': str_pos_top,
            'transform': str_rotate,
            'position': 'absolute'
        });
        
        $(this).addClass("pic_omikuji_" + int_cnt);
        $(this).delay(80 * i).fadeIn(240);
    });
    
    console.log('Omikuji animation initialized');
}