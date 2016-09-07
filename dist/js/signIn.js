$(document).ready(function() {

	var userData,
	currentUser;

	$.ajax({
		async:false,	
		dataType: "json",
		//url: "/designChallenge/js/data.json",
		url: "http://10.10.1.157:3008/students",
		success: function(data) {
			userData = data;
		}
	});

	console.log(userData);
	for (i=0;i<userData.length;i++) {
		$('#nameList').append('<option value="'+userData[i]._id+'">'+userData[i].first + ' ' + userData[i].last + '</option>')
	}

	$('#nameList').val("");
	$('.challengeChoice').removeClass('active');

	$.Velocity.hook($('.slide'), "translateX", "100%");
	$.Velocity.hook($('#slide1'), "translateX", "0%");

	username = "";
	selectedChallenge = "";
	userGroup = "";

	$('.shiftRight').on('touchstart',function(e) {
		$(this).closest('.slide').velocity({
			'translateX':'+=100%'
		},600);
		$(this).closest('.slide').prev().velocity({
			'translateX':'+=100%'
		},600);
	});

	$('#nameList').on('change',function() {
		if ($(this).val() !== "") {
			for (i=0;i<userData.length;i++) {
				if (userData[i]._id === $(this).val()) {
					currentUser = userData[i];
					username = currentUser.first;
					break;
				}
			}
			$('.username').text(username);
			$('#slide1,#slide2').velocity({
				'translateX':'-=100%'
			},{
				delay:400,
				duration:600
			});
		}
	});

	$('.challengeChoice').on('touchstart',function() {
		$('.challengeChoice.active').removeClass('active');
		$('#challengeChoiceText').removeClass('orange blue');
		$(this).addClass('active');
		selectedChallenge = $(this).attr('data-value');
		if (selectedChallenge === "challenge1") {
			$('#challengeChoiceText').addClass('orange').text('first challenge');
		}
		else {
			$('#challengeChoiceText').addClass('blue').text('second challenge');
		}
		$(this).closest('.slide').velocity({
			'translateX':'-=100%'
		},{
			delay:400,
			duration:600
		});
		$(this).closest('.slide').next().velocity({
			'translateX':'-=100%'
		},{
			delay:400,
			duration:600
		});
	});

	$('#confirmDetails').on('touchstart',function() {
		console.log(selectedChallenge);
		$(this).html('<i class="fa fa-spinner fa-spin"></i>');
		$.ajax({
			async:false,	
			method: "POST",
			dataType: "json",
			data: {student: currentUser, challenge: selectedChallenge},
			//url: "/designChallenge/js/groupAssignment.json",
			url: "http://10.10.1.157:3008/choose",
			success: function(data) {
				userGroup = data.group;
				$('#slide4 h2').text(userGroup);
				$('#slide3,#slide4').velocity({
					'translateX':'-=100%'
				},{
					delay:400,
					duration:600
				});
				$('option[value="'+currentUser._id+'"]').remove();
			}
		});
	});

	$('#resetPage').on('touchstart',function() {
		currentUser = "";
		username = "";
		selectedChallenge = "";
		userGroup = "";
		$('#nameList').val("");
		$('.challengeChoice').removeClass('active');
		$('#challengeChoiceText').removeClass('orange blue').text('');
		$('#confirmDetails').html('<i class="fa fa-check"></i>');
		$.Velocity.hook($('.slide'), "translateX", "100%");
		$.Velocity.hook($('#slide1'), "translateX", "0%");
	});

});
