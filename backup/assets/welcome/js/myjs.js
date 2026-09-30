
/* My Custom Js */

const currentScript = document.currentScript;
const BASE_URL = currentScript.getAttribute("data-baseurl");

$(document).ready(function() {

	$('.myCart').click(function(event) {

		var prals = $('#prAlias').val();
		var qt = $('#qty').val();

		$.ajax({
              	url: BASE_URL + "myaccount/addtocart",
              	type: "POST",
              	data: {
                	prals  : prals,
                   	   qt  : qt,
              	},

              	success: function (data) {

              		// console.log(data);
              		
              		$('#AltMsg').html(data.message);
	                $('.msgAlrt').show();

	                if (data.status == "success") 
	                {
	                  	$('.msgAlrt').addClass('alert-success');
	                }
	                else
	                {
	                	$('.msgAlrt').addClass('alert-warning');
	                }

	                setTimeout(function () { 
	                    location.reload(true);
	                }, 1000);
            	},

              	error: function (data) 
              	{
                	// console.log(data);
                	$('#AltMsg').html(data.message);
	                $('.msgAlrt').show();
	                $('.msgAlrt').addClass('alert-warning');
              	}
        	});
	});


});