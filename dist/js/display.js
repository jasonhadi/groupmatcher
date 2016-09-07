var socket = io.connect('http://10.10.1.157:3008/');
socket.on('new', function(data) {
	addUser(data);
});

function addUser(data) {
		var socketData = JSON.parse(data);
		groupID = '#' + socketData.group.toLowerCase();
		if (socketData.challenge === 1) {
			$(groupID).addClass('orange');
		}
		if (socketData.challenge === 2) {
			$(groupID).addClass('blue');
		}
		$(groupID).append('<span style="display:none;" id="'+socketData._id+'">'+socketData.name+'</span>');
		$('#'+socketData._id).velocity('transition.bounceIn');
}

$(document).ready(function() {
	//Load existing matches in case page crashes
	$.getJSON('http://10.10.1.157:3008/groups', function(data) {
		$.each(data, function(i) {
			var groupID = '#' + data[i].font.toLowerCase();	
			if (data[i].challenge === 1) { $(groupID).addClass('orange'); }
			else if (data[i].challenge === 2) { $(groupID).addClass('blue'); }

			if(data[i].scount > 0) {
				$.each(data[i].members, function(j) {
					$(groupID).append('<span>'+data[i].members[j]+'</span>');
				});
			}
		});
	});
});
