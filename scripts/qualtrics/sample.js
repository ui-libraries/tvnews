Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/
	var q = this.questionId;
	var isComplete = window.localStorage.getItem(q);
	if (isComplete == "true") {
		//this.clickNextButton();
	}
	console.log(q);
});

Qualtrics.SurveyEngine.addOnReady(function()
{
	//this sets the correct variab;es for S3 storage, don't change
	var res = "${e://Field/ResponseID}";
	var q = this.questionId;
	window.localStorage.setItem('response', res); 
	window.localStorage.setItem('survey', q);
});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/
	var q = this.questionId;
	var maxTime = window.localStorage.getItem('maxVideoTime');
	if (maxTime == "true") {
		Qualtrics.SurveyEngine.setEmbeddedData("maxVideoTime", "true");
		console.log("max time reached");
	}
	window.localStorage.setItem(q, "true");
	Qualtrics.SurveyEngine.setEmbeddedData(q, "true");
});


///


Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/

});

Qualtrics.SurveyEngine.addOnReady(function()
{
	var res = "${e://Field/ResponseID}";
	var q = this.questionId;
	window.localStorage.setItem('response', res); 
	window.localStorage.setItem('survey', q);
	document.getElementById('photoupload').onchange = function(e) {
            console.log('adding da foto')
            var files = document.getElementById("photoupload").files;
            if (!files.length) {
            return alert("Please choose a file to upload first.");
            }
            var file = files[0];
            var fileName = file.name;
            console.log(file.type)
        
            var photoKey = fileName;
        
            var bucket = new AWS.S3({params: {Bucket: 'mbutler'}});
            var params = {Key: fileName, ContentType: file.type, Body: file};
            bucket.upload(params, function (err, data) {
                console.log(err ? 'ERROR!' : 'UPLOADED.');
            });
        };


});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/

});