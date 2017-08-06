var config = {
apiKey: "AIzaSyDhlMaTn6nkySWgOVHqb1Fl2KXR9MkQrso",
authDomain: "train-scheduler-bf218.firebaseapp.com",
databaseURL: "https://train-scheduler-bf218.firebaseio.com",
projectId: "train-scheduler-bf218",
storageBucket: "",
messagingSenderId: "837604088818"
};

firebase.initializeApp(config);

var trains = {
	Trenton: {name: "Trenton Express", destination: "Trenton, NJ", frequency: 25, first_time: "12:15"},
	Oregon: {name: "Oregon Trail", destination: "Salem, OR", frequency: 3600, first_time: "05:35"},
	Midnight: {name: "Midnight Carriage", destination: "Philadelpia, PA", frequency: 15, first_time: "08:00"},
	Sing: {name: "Sing Sing Caravan", destination: "Atlanta, GA", frequency: 45, first_time: "07:45"},
	Boston: {name: "Boston Bus", destination: "Boston, MA", frequency: 65, first_time: "06:00"},
	California: {name: "California Caravan", destination: "San Francisco, CA", frequency: 6000, first_time: "06:35"},
	Analben: {name: "Analben's Train", destination: "Ft. Lauderdale, FL", frequency: 25, first_time: "08:25"}
};

function loadTrains(){
	for(var key in trains){ 
   	firebase.database().ref().push({
      name: trains[key].name,
      destination: trains[key].destination,
      first: trains[key].first_time,
      frequency: trains[key].frequency,
		});
  }
};

$(document).on(function(){
	firebase.database().ref().remove();
	loadTrains();
});

firebase.database().ref().on("child_added", function(snapshot){
		var now = moment();
		var trainTime = moment();

		var hoursAndMinutes = snapshot.val().first.split(":");
		trainTime = trainTime.hours(parseInt(hoursAndMinutes[0])).minutes(parseInt(hoursAndMinutes[1])).seconds(0);

		while(trainTime.format("YYYY MM DD, HH:mm") < now.format("YYYY MM DD, HH:mm")){
			trainTime.add(snapshot.val().frequency, 'minutes')
		}
		
		var minutes = trainTime.diff(now, "minutes");
		var daysAway = Math.floor(minutes / (24 * 60));
		var hoursAway = Math.floor((minutes % (24 * 60)) / 60);
		var minutesAway = Math.round((minutes % (24 * 60)) % 60);

		var nextArrival = "";
		var timeAway = "";

		if(daysAway > 0){
			nextArrival = trainTime.format("dddd, h:mm A");
			timeAway = daysAway + " days, " + hoursAway + " hours and " + minutesAway + " minutes";
		}

		else if(hoursAway > 0){
			nextArrival = trainTime.format("h:mm A");
			timeAway = hoursAway + " hours and " + minutesAway + " minutes";
		}

		else if(minutesAway == 1){
			nextArrival = trainTime.format("h:mm A");
			timeAway = minutesAway + " minute";
		}

		else if(minutesAway == 0){
			nextArrival = trainTime.format("h:mm A");
			timeAway = "Arriving now";
		}

		else {
			nextArrival = trainTime.format("h:mm A");
			timeAway = minutesAway + " minutes";
		}

		var row = '<tr><td>' + snapshot.val().name + '</td><td>' + snapshot.val().destination + 
  						'</td><td>' + snapshot.val().frequency + '</td><td>' + nextArrival + 
  						'</td><td>' + timeAway + '</td></tr><hr>';
	  $('#train-tbody').append(row);
});


$("#addTrain").on("click", function() {
  firebase.database().ref().push({
    name: $("#nameInput").val(),
    destination: $("#destInput").val(),
    first: $("#firstInput").val(),
    frequency: $("#freqInput").val()
  })
});